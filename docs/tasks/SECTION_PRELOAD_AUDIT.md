# Section Preloading — Code Audit

**Scope:** Section bundle preloading only — JS/CSS chunk loading, manifest resolution, CSS injection/removal,
translation loading, and the router orchestration that drives all of the above.
Static asset preloading (images, fonts, JSON data) is covered separately in
`src/utils/assets/ASSET_PRELOAD_AUDIT.md`.

**Files reviewed:**
- `src/router/routeConfig.json`
- `src/router/index.js`
- `src/utils/route/routeConfigLoader.js`
- `src/utils/route/routeResolver.js`
- `src/utils/section/sectionResolver.js`
- `src/utils/section/sectionPreloader.js`
- `src/utils/section/sectionCssLoader.js`
- `src/utils/build/manifestLoader.js`
- `src/utils/translation/translationLoader.js`
- `src/stores/usePreloadStore.js`
- `src/main.js`

---

## Legend
| Severity | Meaning |
|----------|---------|
| 🔴 High | Causes crashes, data loss, or security holes |
| 🟠 Medium | Causes wrong behaviour or measurable performance loss |
| 🟡 Low | Suboptimal or fragile but rarely observed |

---

## 1. Logical Errors

### L-01 🔴 — Section marked preloaded before its assets complete
**File:** `sectionPreloader.js` lines 100–107

`preloadStore.addSection(sectionName)` is called on line 100 **before**
`preloadSectionAssets(sectionName)` is fired on line 107. Any subsequent check via
`preloadStore.hasSection()` (including the guard on line 46) will return `true` and
skip re-entry, even though the assets for that section have not finished loading yet.

```js
// current — wrong order
preloadStore.addSection(sectionName);             // ← marked done …
preloadSectionAssets(sectionName).catch(...);     // ← … before assets even start
```

**Fix:** Move `preloadStore.addSection` to the `.then()` callback of
`preloadSectionAssets`, or only mark the section preloaded once both JS/CSS
bundles **and** assets are settled.

---

### L-02 🔴 — CSS preload hint never promoted to `rel="stylesheet"`
**File:** `sectionPreloader.js` `preloadCssBundle()`, lines 291–294

```js
const linkElement = document.createElement('link');
linkElement.rel = 'preload';
linkElement.href = bundlePath;
linkElement.as = 'style';
```

`rel="preload" as="style"` tells the browser to fetch the file at high priority but
**not** to apply it as a stylesheet. The file is fetched into the cache only.
`sectionCssLoader.loadSectionCss` later injects a second `<link rel="stylesheet">`
for the same file, which is fine, but the preload hint in `sectionPreloader` is
orphaned — it is never converted to a stylesheet and lingers in the `<head>` with no
matching `<link rel="stylesheet">`, causing the browser to emit an "unused preload"
warning and wasting network priority bandwidth.

The `sectionCssLoader.preloadSectionCss` function at line 318 does the same thing
correctly for the CSS loader path, but `sectionPreloader.preloadCssBundle` bypasses
that path entirely.

**Fix:** Remove the redundant CSS preload from `sectionPreloader.preloadCssBundle` and
delegate to `preloadSectionCss()` from `sectionCssLoader.js`, which owns CSS
lifecycle management.

---

### L-03 🟠 — `preloadSection` returns `false` while in-progress, silently dropping callers
**File:** `sectionPreloader.js` lines 63–68

```js
if (preloadingInProgress.has(sectionName)) {
  return false;  // ← caller gets false and moves on
}
```

Any concurrent caller (e.g., two rapid navigations both triggering the same
`preLoadSections` entry) receives `false` immediately, with no way to await the
in-progress load. The caller in `router/index.js` ignores the return value of
`preloadSection()`, so this is silent. The section ends up only partially initialised
for the second caller.

**Fix:** Return a shared `Promise` when a load is already in progress, so callers can
await the same operation:

```js
const preloadInProgressPromises = new Map();

export async function preloadSection(sectionName) {
  if (preloadStore.hasSection(sectionName)) return true;

  if (preloadInProgressPromises.has(sectionName)) {
    return preloadInProgressPromises.get(sectionName);
  }

  const promise = _doPreload(sectionName).finally(() => {
    preloadInProgressPromises.delete(sectionName);
  });

  preloadInProgressPromises.set(sectionName, promise);
  return promise;
}
```

---

### L-04 🟠 — `loadSectionCss` receives a role-object, not a string
**File:** `router/index.js` line 658

```js
const currentSection = to.meta?.section;   // can be { creator: "dash-creator", fan: "dash-fan" }
// ...
loadSectionCss(currentSection).catch(...); // ← object passed directly
```

`to.meta.section` mirrors `route.section` from `routeConfig.json`, which can be a
role-keyed object (e.g., `{ "creator": "dashboard-creator", "fan": "dashboard-fan" }`).
`loadSectionCss` passes this object directly to `getSectionCssPath(sectionName)`, which
does a manifest lookup for an object key — returning `null` every time. As a result,
section CSS is **never loaded** for role-based routes.

Translations and asset preloading for `currentSection` apply the same pattern (lines
670–703) but correctly call `resolveRoleSectionVariant` first. The CSS load at line 658
skips that step.

**Fix:** Resolve the section string before the CSS call:

```js
let currentSectionStr = currentSection;
if (typeof currentSection === 'object' && currentSection !== null) {
  const { resolveRoleSectionVariant } = await import('../utils/section/sectionResolver.js');
  currentSectionStr = resolveRoleSectionVariant(currentSection, userRole);
}
if (currentSectionStr) loadSectionCss(currentSectionStr).catch(...);
```

---

### L-05 🟠 — `clearPreloadState` desynchronises DOM and Pinia state
**File:** `sectionPreloader.js` lines 416–427 & `sectionCssLoader.js`

`clearPreloadState()` clears `usePreloadStore` and `preloadingInProgress`, but the
`<link>` elements injected into `document.head` by previous preloads (both JS
modulepreload hints and CSS preload/stylesheet links) remain in the DOM.

After clearing, `preloadStore.hasSection()` returns `false`, so preloading is
re-attempted. A new `<link>` is injected alongside the old one, resulting in duplicate
`<link>` elements for the same bundle URL.

**Fix:** Call `clearAllSectionCss()` (already exported from `sectionCssLoader.js`) from
within `clearPreloadState`, and remove any module-preload `<link>` elements for known
section bundle paths.

---

### L-06 🟡 — `getPreloadSectionsForRoute` accepts `userRole` but never uses it
**File:** `sectionResolver.js` lines 21–71

The `userRole` parameter is documented and accepted but the implementation pushes only
`route.preLoadSections` verbatim (which are plain string identifiers). Role-based
`preLoadSections` (e.g., `{ creator: ["auth", "creator-tools"] }`) cannot be
declared per the current implementation — the parameter is simply ignored.

**Fix:** Either remove the `userRole` parameter (and update callers) or implement role-keyed `preLoadSections` resolution in line with
`resolveRoleSectionVariant`.

---

### L-07 🟡 — `resolveRoleSectionVariant` uses `Object.values()[0]` as last-resort fallback
**File:** `sectionResolver.js` lines 337–348

```js
const firstSectionName = Object.values(sectionConfig)[0];
```

JavaScript objects preserve insertion order for string keys (except integer-like keys
which sort numerically first), but the "first" role in a config object is an
author-defined coincidence, not a product decision. A wrong fallback section loads the
wrong JS/CSS bundle and translations silently.

**Fix:** Remove the `Object.values()[0]` fallback. Log a warning and return `null` when
neither the requested role nor the `default` key exists. Let the caller decide how to
handle an unresolvable section.

---

## 2. Performance Issues

### P-01 🟠 — JS and CSS bundles preloaded serially, not in parallel
**File:** `sectionPreloader.js` lines 90–97

```js
if (bundlePaths.js)  await preloadJavaScriptBundle(bundlePaths.js, sectionName);
if (bundlePaths.css) await preloadCssBundle(bundlePaths.css, sectionName);
```

JS and CSS for the same section are independent resources. Awaiting the JS load before
starting the CSS fetch doubles the serial wait time unnecessarily.

**Fix:**

```js
await Promise.all([
  bundlePaths.js  ? preloadJavaScriptBundle(bundlePaths.js,  sectionName) : Promise.resolve(),
  bundlePaths.css ? preloadCssBundle(bundlePaths.css, sectionName)         : Promise.resolve()
]);
```

---

### P-02 🟠 — `resolveActiveLocale` dynamically imported inside a loop on every navigation
**File:** `router/index.js` lines 754–756

```js
for (const sectionToPreload of uniqueResolvedSections) {
  const { resolveActiveLocale } = await import('../utils/translation/localeManager.js');
  const activeLocale = resolveActiveLocale();
  // ...
}
```

`import()` inside a loop incurs module resolution and cache lookup overhead on every
iteration. The locale does not change mid-loop.

**Fix:** Hoist the import and locale resolution above the loop:

```js
const { resolveActiveLocale } = await import('../utils/translation/localeManager.js');
const activeLocale = resolveActiveLocale();
for (const sectionToPreload of uniqueResolvedSections) { ... }
```

---

### P-03 🟠 — Section CSS manifest loaded on every cold page load with no HTTP caching hint
**File:** `sectionCssLoader.js` lines 49–53

```js
cssManifestPromise = fetch('/section-css-manifest.json')
```

The manifest fetch carries no `Cache-Control` request headers and no `If-None-Match`
support. Every hard refresh or new tab fetches the full manifest JSON over the network.
The in-memory `cssManifest` variable resets on each page load; `localStorage` is never
used (unlike `usePreloadStore`).

**Fix:** Add a `cache: 'force-cache'` option (or rely on the server sending long-lived
`Cache-Control` headers for hashed manifest filenames) and/or persist the manifest to
`sessionStorage` keyed by a build hash.

---

### P-04 🟡 — `setValueWithExpiration` written but never read for section preload cache
**File:** `sectionPreloader.js` lines 102–104

```js
const cacheKey = PRELOAD_CACHE_KEY_PREFIX + sectionName;
setValueWithExpiration(cacheKey, { loaded: true, timestamp: Date.now() }, PRELOAD_CACHE_TTL);
```

The write to `cacheHandler` is never matched by a corresponding `getValueFromCache`
read anywhere in the codebase. The actual deduplication guard is `preloadStore.hasSection()`.
The `cacheHandler` write is dead code that wastes serialisation time and storage writes.

**Fix:** Remove the `setValueWithExpiration` call and the `PRELOAD_CACHE_KEY_PREFIX` /
`PRELOAD_CACHE_TTL` constants. `usePreloadStore` (persisted via `pinia-plugin-persistedstate`)
is already the correct single source of truth for section preload state.

---

### P-05 🟡 — Orphaned preload `<link>` elements accumulate in `<head>` across navigations
**File:** `sectionCssLoader.js` `preloadSectionCss()` lines 318–324

`preloadSectionCss` injects `<link rel="preload" as="style">` elements but never
removes them — there is no `unloadSectionCssPreload` counterpart to
`unloadSectionCss`. Over many navigations the `<head>` grows unbounded with stale
preload hints that the browser must process on each navigation.

**Fix:** Track injected preload links in a separate Map (`preloadHintLinks`), keyed by
section name, and remove them in `unloadSectionCss`.

---

## 3. Security Issues

### S-01 🔴 — Manifest files fetched without Subresource Integrity (SRI)
**Files:** `manifestLoader.js` line 53, `sectionCssLoader.js` line 49

Both `/section-manifest.json` and `/section-css-manifest.json` are fetched with plain
`fetch()`. If an attacker can intercept or tamper with these files (e.g., via a
compromised CDN, network MITM, or XSS into the service worker), they can substitute
arbitrary bundle paths. The app will then inject `<link rel="modulepreload">` and
`<link rel="stylesheet">` for attacker-controlled URLs, enabling code injection.

**Recommended fix:**
1. Embed an expected manifest hash in the HTML `<head>` at build time
   (e.g., as a `<meta name="manifest-sri">` tag or inline JSON).
2. After fetching, compute `crypto.subtle.digest('SHA-256', body)` and compare against
   the embedded hash before using the manifest.
3. Set `Content-Security-Policy: script-src 'self'` and `style-src 'self'` so
   only same-origin bundles are accepted.

---

### S-02 🔴 — Bundle `<link>` elements injected without `integrity` attribute
**Files:** `sectionPreloader.js` lines 202–205, `sectionCssLoader.js` lines 159–162

```js
// sectionPreloader.js — no integrity
linkElement.rel  = 'modulepreload';
linkElement.href = bundlePath;

// sectionCssLoader.js — no integrity
linkElement.rel  = 'stylesheet';
linkElement.href = cssPath;
```

Without an `integrity` attribute the browser will execute / apply any content
returned for these paths. Combined with a compromised manifest (S-01 above),
this allows arbitrary script execution or CSS injection.

**Recommended fix:** Store a `{ js: "/path.js", css: "/path.css", integrity: { js: "sha384-...", css: "sha384-..." } }` shape in the manifests and pass the hash to `linkElement.integrity`.

---

### S-03 🟠 — Bundle paths from manifests are used without same-origin validation
**Files:** `sectionPreloader.js` `preloadJavaScriptBundle`, `sectionCssLoader.js`
`injectCssLink`

Paths read from the manifest (potentially attacker-controlled per S-01) are placed
directly into `<link href="">` with no check that the URL is same-origin or matches an
allow-list.

**Recommended fix:** Before injecting, verify the path is either a relative path
starting with `/` or originates from a known CDN domain defined in build config:

```js
function isTrustedBundlePath(path) {
  if (path.startsWith('/')) return true;
  const trustedOrigins = import.meta.env.VITE_TRUSTED_BUNDLE_ORIGINS?.split(',') ?? [];
  return trustedOrigins.some(origin => path.startsWith(origin));
}
```

---

### S-04 🟠 — Translation file path constructed from unvalidated section name
**File:** `translationLoader.js` line 34

```js
function getTranslationUrl(sectionName, localeCode) {
  return `/i18n/section-${sectionName}/${localeCode}.json`;
}
```

`sectionName` originates from `routeConfig.json` (via route meta) and can be an
arbitrary string. A section name containing `../` or other traversal sequences would
produce an unexpected URL. Even if the server blocks directory traversal, a section
name like `../../api/admin` produces a malformed fetch request and an error that can
leak internal paths in error logs.

**Recommended fix:** Allowlist section names to alphanumeric characters and hyphens
before building the URL:

```js
function sanitizeSectionName(name) {
  if (!/^[a-z0-9-]+$/i.test(name)) throw new Error(`Invalid section name: ${name}`);
  return name;
}
```

---

### S-05 🟡 — `window.performanceTracker` accessed unconditionally in hot paths
**Files:** `manifestLoader.js` lines 22–28, `routeResolver.js` line 28

```js
window.performanceTracker.step({ ... }); // no guard — throws if undefined
```

Unlike other files which guard with `if (window.performanceTracker)`,
`manifestLoader.js` and `routeResolver.js` call `.step()` directly. In a server-side
rendering environment, a Web Worker context, or a unit-test environment where
`window` is undefined or `performanceTracker` is not initialised, this throws
immediately, breaking all route resolution and manifest loading.

**Fix:** Wrap every `window.performanceTracker.step()` call in a guard consistent with
the rest of the codebase:

```js
window.performanceTracker?.step({ ... });
```

---

## 4. Best Practice Violations

### B-01 🟠 — CSS and JS manifests use separate, independently maintained fetch paths
**Files:** `manifestLoader.js`, `sectionCssLoader.js`

Two separate manifest files (`section-manifest.json`, `section-css-manifest.json`) are
loaded via two different fetch/cache implementations that are not coordinated. A build
that updates one manifest but not the other leaves the app in a split-brain state where
JS and CSS for a section may be from different deploys, causing style mismatches or
runtime crashes.

**Recommended fix:** Merge both manifests into a single `section-manifest.json` with a
shape like:

```json
{
  "dashboard-global": { "js": "/assets/dash.hash.js", "css": "/assets/dash.hash.css" }
}
```

Use a single loader (`manifestLoader.js`) consumed by both `sectionPreloader.js` and
`sectionCssLoader.js`. This eliminates the synchronisation risk.

---

### B-02 🟠 — No retry or fallback when manifest fetch fails in production
**Files:** `manifestLoader.js` lines 77–90, `sectionCssLoader.js` lines 65–69

Both manifest loaders silently return `{}` on fetch failure. Downstream callers receive
`null` from `getSectionBundlePaths` and silently skip preloading. There is no retry,
no notification to the user, and no fallback mechanism. In a production incident
(CDN outage, misconfigured headers) the app loads without any section bundles or CSS,
breaking every section silently.

**Recommended fix:**
- Retry up to 2× with exponential back-off for network failures (not 4xx).
- Expose a Pinia flag `manifestLoadFailed` so the UI can surface a reload prompt.
- Log a console error (not just the internal `logError`) so it is visible in production
  monitoring tooling.

---

### B-03 🟠 — `afterEach` does not await current-section work before starting background preloads
**File:** `router/index.js` lines 656–713

Current-section CSS (`loadSectionCss`), translations (`loadTranslationsForSection`),
and assets (`preloadSectionAssets`) are all fire-and-forget `.catch()`-handled calls
that run concurrently with the background preloading loop that starts immediately
after. If the background preloading loop consumes significant CPU or network bandwidth
(e.g., all sections in `preLoadSections`), it can delay the completion of the
current-section work, increasing Time To Interactive.

**Recommended fix:** Await current-section critical work (CSS and translations) before
starting background preloads. Asset preloading is already correctly non-blocking.

```js
// current-section — await CSS and translations
await Promise.allSettled([
  loadSectionCss(resolvedSection),
  loadTranslationsForSection(resolvedSection, activeLocale)
]);

// background — fire and forget preloads for future sections
for (const section of uniqueResolvedSections) { preloadSection(section).catch(...); }
```

---

### B-04 🟡 — Dev mode silently no-ops all section CSS and JS bundle preloading
**Files:** `sectionCssLoader.js` lines 42–46, `manifestLoader.js` lines 101–110

Both loaders return early with empty results in `import.meta.env.DEV` mode. This means
the section preloading code path is never exercised during local development. Bugs in
the preload lifecycle (e.g., L-01, L-02, L-04) only manifest in production builds,
making them difficult to reproduce and fix.

**Recommended fix:** Add a development shim that constructs section manifests from
Vite's dev server module graph (or a static stub file `section-manifest.dev.json`)
so the full preload code path can be tested locally.

---

### B-05 🟡 — `usePreloadStore` persists section preload state across deploys
**File:** `usePreloadStore.js` lines 62–66

`preloadedSections` and `preloadedAssets` are persisted to `localStorage` with key
`app-preload-state`. After a new production deployment, bundle hashes change but the
store still records old section names as "already preloaded". The guard in
`preloadSection` returns `true` immediately, and new bundles are never fetched.

**Recommended fix:** Store a build hash (e.g., `import.meta.env.VITE_BUILD_HASH`) in
the persisted state. On startup, compare the stored hash to the current build hash. If
they differ, call `clearPreloadState()` to invalidate stale entries:

```js
// in main.js startup
if (preloadStore.buildHash !== import.meta.env.VITE_BUILD_HASH) {
  preloadStore.clearState();
  preloadStore.buildHash = import.meta.env.VITE_BUILD_HASH;
}
```

---

### B-06 🟡 — `findComponentLoader` falls back to filename-only match, risking wrong component
**File:** `router/index.js` lines 175–181

```js
const fileName = componentPath.split('/').pop();
for (const [key, loader] of Object.entries(componentModules)) {
  if (key.endsWith(fileName)) {
    return loader;
  }
}
```

If two components share the same filename (e.g., `Index.vue`) in different directories,
the filename-only fallback returns the first match in enumeration order, which may be
the wrong component. The wrong page component silently renders.

**Fix:** Remove the filename-only fallback. If the path resolution fails, throw
immediately so the error is surfaced during development, rather than rendering an
incorrect component silently.

---

## 5. Missing Features

### M-01 🔴 — No mechanism to invalidate cached preload state on new deployment
**Files:** `usePreloadStore.js`, `sectionPreloader.js`

The `preloadedSections` list is persisted to `localStorage` indefinitely. There is no
build-hash comparison, version field, or TTL expiry for the section-level record.
Users who visited the app before a deploy will serve cached (now potentially stale or
broken) bundles from the browser cache while `hasSection()` returns `true`, bypassing
any re-fetch. See also B-05 for the recommended fix.

---



---

### M-03 🟠 — No SRI hash storage in manifests
**Files:** `manifestLoader.js`, `sectionCssLoader.js`

The manifest schemas (`{ js: "/path.js", css: "/path.css" }`) have no field for
SRI hashes. Adding SRI requires a schema change. The manifest generation tooling
(if it exists) does not currently emit integrity hashes alongside bundle paths.

**Recommended fix:** Extend the manifest schema and the manifest generator to emit:

```json
{
  "dashboard-global": {
    "js":  "/assets/dash.abc123.js",
    "css": "/assets/dash.abc123.css",
    "integrity": {
      "js":  "sha384-<base64>",
      "css": "sha384-<base64>"
    }
  }
}
```

---

### M-04 🟠 — No role-aware `preLoadSections` support in routeConfig
**File:** `sectionResolver.js` `getPreloadSectionsForRoute`, `routeConfig.json`

The `preLoadSections` field in `routeConfig.json` only accepts a flat `string[]`.
Routes that serve different sections per role (using `section: { creator: "...", fan:
"..." }`) cannot declare role-specific ahead-of-time preloads. A creator logging in
always preloads the same sections as a fan, loading bundles that may never be used.

**Recommended fix:** Support a role-keyed `preLoadSections` object:

```json
{
  "preLoadSections": {
    "creator": ["dashboard-creator", "analytics"],
    "fan":     ["dashboard-fan", "shop"]
  }
}
```

And resolve it in `getPreloadSectionsForRoute` using the `userRole` parameter that is
already passed in.

---

### M-05 🟡 — No timeout / abort for bundle preload fetches
**File:** `sectionPreloader.js` `preloadJavaScriptBundle`, `preloadCssBundle`

Both functions return a `Promise` that resolves when the `<link>` element fires
`onload` or rejects on `onerror`. There is no `AbortController` or timeout. A bundle
hosted on a slow CDN edge node can hang indefinitely, keeping the `preloadingInProgress`
Set entry locked and blocking all subsequent callers from ever detecting the section as
preloaded.

**Recommended fix:** Add a timeout using `AbortSignal.timeout` or a manual `setTimeout`
that rejects after a configurable limit (e.g., 10 s), then removes the in-progress
entry:

```js
const timeout = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Preload timeout')), 10_000)
);
await Promise.race([preloadPromise, timeout]);
```

---

### M-06 🟡 — No preload progress API exposed to UI / loading indicators
**Files:** `sectionPreloader.js`, `usePreloadStore.js`

`preloadingInProgress` is a module-level `Set` with no reactive binding. The UI has no
way to display a progress indicator, a skeleton state, or a "loading" flag while
section bundles are fetching. `usePreloadStore` only records completed preloads, not
in-progress ones.

**Recommended fix:** Add a reactive `preloadingInProgress` array to `usePreloadStore`:

```js
state: () => ({
  preloadedSections: [],
  preloadedAssets: [],
  sectionsInProgress: []   // ← new
})
```

Update it in `preloadSection` on start and on completion/error, so components can
`watch` the store and display appropriate loading states.

---

## 6. Additional Issues (Second Pass)

### L-08 🟠 — Startup preload route lookup fails for locale-prefixed paths
**File:** `main.js` lines 410–412, `routeResolver.js` lines 40–42

On startup, the app resolves the current route with:

```js
const currentPath = router.currentRoute.value.path;
const currentRoute = resolveRouteFromPath(currentPath);
```

`currentPath` can include locale prefixes (e.g. `/vi/dashboard`), but route config slugs
are stored without locale prefixes (e.g. `/dashboard`). `resolveRouteFromPath` only
does direct slug matching, so it returns `null` for locale-prefixed startup paths.
When that happens, initial section preloads are skipped entirely until later navigation.

**Fix:** Normalize locale-prefixed paths before calling `resolveRouteFromPath`, or add a
locale-aware resolver helper for startup.

---

### L-09 🟠 — Startup `preLoadSections` identifiers are not resolved like router `afterEach`
**File:** `main.js` lines 414–521, `router/index.js` lines 628–633

At startup, `main.js` passes `currentRoute.preLoadSections` directly into
`preloadSection(section)`. In contrast, `router.afterEach` resolves each identifier with
`resolveSectionIdentifier(identifier, userRole)` first.

This creates behavior drift: if a route declares preload identifiers as slugs/aliases
(supported by `resolveSectionIdentifier`), startup preloading fails while post-navigation
preloading succeeds.

**Fix:** Reuse the same resolution pipeline in `main.js`:
1. Resolve identifiers with `resolveSectionIdentifier`.
2. Dedupe.
3. Preload resolved section names only.

---

### P-06 🟠 — `beforeEach` blocks navigation on translation I/O (HEAD + JSON fetch chain)
**Files:** `router/index.js` lines 502–504, `translationLoader.js` lines 199–200

`beforeEach` now awaits `loadTranslationsForSection` before `next()`. On cold loads,
`loadTranslationsForSection` performs existence checks (`HEAD`) for English and target
locale before fetching translation JSON. This can add multiple network round-trips to
every first navigation and noticeably increase route transition latency on slow links.

**Fix:** Keep eager translation preloading, but do it with a bounded timeout and
fallback strategy:
- if timeout is hit, continue navigation and let `afterEach` finish loading.

---

### S-06 🟠 — Unescaped manifest paths are interpolated into `querySelector` selectors
**Files:** `sectionPreloader.js` lines 178, 266; `sectionCssLoader.js` line 312

The code interpolates bundle paths directly into CSS selectors:

```js
document.querySelector(`link[href="${bundlePath}"]`);
```

If a manifest entry contains selector-breaking characters (`"` `]` etc.), this can
throw a `DOMException` (`Failed to execute 'querySelector'...`). A malformed or tampered
manifest can therefore turn into a client-side denial of service for preload logic.

**Fix:** Escape selector values with `CSS.escape()` (or avoid selector interpolation by
iterating `document.querySelectorAll('link[href]')` and comparing `link.href` values).

---

### B-07 🟡 — Startup preload orchestration duplicates router preload logic (drift risk)
**Files:** `main.js` startup preload block, `router/index.js` `afterEach`

There are two separate orchestration paths for section preloading:
1. Startup flow in `main.js`
2. Navigation flow in `router.afterEach`

They already diverge in identifier resolution and route matching behavior (L-08, L-09).
Maintaining two independent flows increases regression risk whenever preload behavior
changes.

**Fix:** Extract a shared helper (e.g. `orchestrateSectionPreloadForRoute(routeConfig, role, context)`)
used by both startup and `afterEach`.

---

## 7. Additional Issues (Third Pass)

### L-10 🔴 — `manifestGenerator` truncates hyphenated section names in production manifest keys
**File:** `build/vite/manifestGenerator.js` line 44

Bundle files are emitted as `section-${sectionName}-{hash}.js` (e.g.
`section-dashboard-global-abc123.js`), but the scanner uses:

```js
const match = file.match(/^section-([^-]+)-.+\.(js|css)$/);
```

`([^-]+)` captures only the first hyphen segment (`dashboard`), not the full
section name (`dashboard-global`). The generated `section-manifest.json` keys
then do not match runtime lookups from `getSectionBundlePaths("dashboard-global")`,
so production JS preloading silently fails for most real section names.

**Fix:** Parse section names with a greedy pattern that supports hyphens, e.g.
`^section-(.+)-[A-Za-z0-9]+\.(js|css)$`, or encode section names in filenames
with a safe delimiter.

---

### L-11 🟠 — `inheritConfigFromParent` is never applied in the router pipeline
**Files:** `routeResolver.js` `inheritConfigurationFromParentRoute`, `router/index.js`
`generateRoutesFromConfig` / `afterEach`

Many child routes in `routeConfig.json` set `"inheritConfigFromParent": true` but
omit their own `preLoadSections`. The router stores the raw child route object in
`meta.routeConfig` and never merges parent config before reading
`routeConfig.preLoadSections`.

Result: routes like `/dashboard/call-and-chat-settings` do not inherit parent
preload intent (e.g. from `/log-in` or other ancestors), even though config
implies they should.

**Fix:** Resolve effective route config once per navigation:

```js
const effectiveRouteConfig = inheritConfigurationFromParentRoute(routeConfig);
```

Use `effectiveRouteConfig` for `preLoadSections`, guards, and preload orchestration.

---

### L-12 🟠 — `beforeEach` uses `resolveSectionIdentifier` for role-based `route.section`
**File:** `router/index.js` lines 427–434

```js
const resolvedSection = resolveSectionIdentifier(routeConfig.section, guardContext.userRole);
```

`resolveSectionIdentifier` only accepts strings (slug/section identifier). For
role-based section objects it returns `null`, and the code falls back to storing the
raw object on `to.meta.section`. Downstream `afterEach` consumers then receive an
object instead of a concrete section string (see L-04).

**Fix:** Use `resolveRoleSectionVariant(routeConfig.section, guardContext.userRole)`
for `route.section`, and reserve `resolveSectionIdentifier` for `preLoadSections`
entries only.

---

### L-13 🟠 — `preloadExclude` short-circuits all `afterEach` section work (including current view)
**File:** `router/index.js` lines 606–613

When `preloadExclude === true`, `afterEach` returns before:
- current-section CSS load (`loadSectionCss`)
- current-section translation refresh
- current-section asset preload

So a route marked exclude not only skips background `preLoadSections`, it also skips
resources required for the active page. That is broader than “don’t preload other
sections” and can leave the current route unstyled or untranslated.

**Fix:** Split flags, e.g. `preloadExcludeBackground` vs `preloadExcludeCurrent`, or
always run current-section CSS/translation/asset loading and only skip
`preLoadSections` background preloading.

---

### L-14 🟠 — Failed manifest fetch is cached as `{}` for the entire session
**File:** `manifestLoader.js` lines 89, 127

On fetch/parse failure, the loader sets `cachedManifest = {}` and returns it. Because
the cache is never invalidated on recovery, all later `getSectionBundlePaths` calls
keep failing until full page reload — even if the network/CDN issue recovers.

**Fix:** Cache failures separately with short TTL, or keep `cachedManifest = null` on
error and allow retry/backoff (see B-02).

---

### P-07 🟠 — Each background section triggers duplicate CSS preloading paths
**File:** `router/index.js` lines 737–745

For every entry in `preLoadSections`, `afterEach` calls both:
1. `preloadSectionCss(section)` (CSS manifest path)
2. `preloadSection(section)` → `preloadCssBundle()` (JS manifest CSS path)

This creates duplicate CSS fetch/preload work per section (and overlaps with L-02).
It increases bandwidth contention during navigation, especially when multiple sections
are listed.

**Fix:** Choose one CSS owner (`sectionCssLoader` recommended) and limit
`sectionPreloader` to JS bundle preloading only.

---

### P-08 🟠 — Current-section translations are loaded twice per navigation
**Files:** `router/index.js` `beforeEach` lines 502–504, `afterEach` lines 666–687

`beforeEach` awaits `loadTranslationsForSection(resolvedSection, activeLocale)` before
navigation completes, then `afterEach` calls `loadTranslationsForSection` again for the
same section. The loader deduplicates in-flight/ cached requests, but still performs
cache checks and scheduling work twice on every navigation.

**Fix:** Load current-section translations in one place only (prefer `beforeEach`),
and keep `afterEach` focused on background `preLoadSections` translation preloads.


---

### M-07 🟠 — Locale changes reload translations for preloaded sections but not section bundles
**File:** `localeManager.js` lines 587–623

On `setActiveLocale`, the app reloads translations for `preLoadSections` but does not
re-run `preloadSection()` / `preloadSectionCss()` for those sections. If locale-specific
bundle splits are introduced later (or if section assets are locale-dependent), users
can get fresh copy with stale bundles.

**Fix:** On locale change, call a shared orchestrator that refreshes both translations
and section bundle/CSS preload state for resolved `preLoadSections`.

---

### M-08 🟠 — No build-time validation that `preLoadSections` entries resolve to real sections
**Files:** `jsonConfigValidator.js`, `routeConfig.json`

Validation only checks that `preLoadSections` is an array, not that each entry is a
valid section name or resolvable slug. Typos like `"dashbord"` or `"shop "` fail silently
at runtime (skipped preloads, logged only in dev tools).

**Fix:** Extend `validateRouteConfig` to resolve each entry against known section names
(from route `section` fields and role variants) and fail build on unknown identifiers.

---

### B-08 🟡 — `section/index.js` exports a non-existent `preloadSectionBundle`
**File:** `src/utils/section/index.js` line 21

The barrel file exports `preloadSectionBundle`, but `sectionPreloader.js` exports
`preloadSection`. Any consumer importing from `utils/section` gets `undefined` for the
bundle preload API.

**Fix:** Export `preloadSection` (or alias `preloadSectionBundle = preloadSection`).

---


