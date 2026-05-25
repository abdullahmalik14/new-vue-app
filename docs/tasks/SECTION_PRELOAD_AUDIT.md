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

#### Resolution ✅

**Status:** Resolved (no further code change required).

**What was broken:** `addSection()` ran before JS and CSS bundles finished, so
`hasSection()` could return `true` while bundles were still loading.

**Why it happened:** Preload completion was tracked too early in the original
implementation.

**What changed:** Fixed by **Preloading.md Task 5a** in `sectionPreloader.js`.
`addSection()` now runs only after both JS and CSS complete:

```js
await Promise.all([
  bundlePaths.js  ? preloadJavaScriptBundle(bundlePaths.js, sectionName) : Promise.resolve(),
  bundlePaths.css ? preloadSectionCss(sectionName)                       : Promise.resolve(),
]);

preloadStore.addSection(sectionName);

preloadSectionAssets(sectionName).catch(/* ... */);
```

**Note — assets are NOT awaited before `addSection` (by design):** We did not apply
the audit’s suggested fix of waiting for `preloadSectionAssets` before `addSection`.
Reasons:

1. **`Preloading.md` Task 5a** defines section completion as JS + CSS only; assets
   remain background cache-warming and must not block the section preload lifecycle.
2. **Router fast path** — `router/index.js` uses `hasSection()` to skip lazy-loading
   when JS chunks are already cached. Delaying `addSection` until assets finish would
   keep `hasSection()` false even when bundles are warm, forcing unnecessary slow-path
   navigations.
3. **Separate state** — `preloadedSections` / `hasSection()` tracks section bundles
   (JS/CSS). Static assets use `preloadedAssets` / `hasAsset()` in `assetPreloader.js`.
   Mixing asset completion into section bundle state would blur two independent preload
   systems (see also `ASSET_PRELOAD_AUDIT.md`).

**How it was tested:** `tests/unit/sectionPreloader.test.js` — test
`marks section preloaded only after JS and CSS both complete (5a)`.

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

#### Resolution ✅

**Status:** Resolved (no further code change required).

**What was broken:** `sectionPreloader.js` had its own `preloadCssBundle()` path using
orphaned `rel="preload"` hints, bypassing `sectionCssLoader` CSS lifecycle ownership.

**Why it happened:** Duplicate CSS preload logic existed in `sectionPreloader` alongside
`sectionCssLoader`.

**What changed:** Fixed by **Preloading.md Task 5c**. `preloadCssBundle()` was removed
from `sectionPreloader.js` (no longer exists in the codebase). CSS preload is now
delegated to `preloadSectionCss()` from `sectionCssLoader.js` inside `_doPreload`:

```js
await Promise.all([
  bundlePaths.js  ? preloadJavaScriptBundle(bundlePaths.js, sectionName) : Promise.resolve(),
  bundlePaths.css ? preloadSectionCss(sectionName)                       : Promise.resolve(),
]);
```

**How it was tested:** `tests/unit/sectionPreloader.test.js` — test
`delegates CSS preload to sectionCssLoader, not an internal helper (5c)`.

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

#### Resolution ✅

**Status:** Resolved (no further code change required).

**What was broken:** Concurrent `preloadSection()` callers received `false` immediately
when a load was already in progress, with no way to await the same operation.

**Why it happened:** In-progress deduplication used a boolean guard (`return false`)
instead of sharing the in-flight promise.

**What changed:** Fixed by **Preloading.md Task 5b**. `sectionPreloader.js` now uses an
`inProgressPromises` map (section name → shared `Promise`). Concurrent callers receive
the same promise and await the same `_doPreload` work; the map entry is cleared in
`.finally()`.

**How it was tested:** `tests/unit/sectionPreloader.test.js` — test
`shares the same promise for concurrent callers (5b)` (same promise reference, single
manifest lookup, `inProgressCount` tracking).

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

#### Resolution ✅

**Status:** Resolved (no further code change required).

**What was broken:** `loadSectionCss()` in `router/index.js` `afterEach` received
`to.meta.section` directly, which can be a role-keyed object. Manifest lookup then
failed and section CSS never loaded for role-based routes.

**Why it happened:** Translations and assets already resolved via
`resolveRoleSectionVariant`, but the CSS load path skipped that step.

**What changed:** Fixed by **Preloading.md Task 4a**. Before calling `loadSectionCss`,
the router resolves role-object sections to a concrete string:

```js
const resolvedCurrentSection = typeof currentSection === 'object'
  ? resolveRoleSectionVariant(currentSection, userRole)
  : currentSection;

if (resolvedCurrentSection) {
  loadSectionCss(resolvedCurrentSection).catch(/* ... */);
}
```

(See `src/router/index.js` `afterEach`, current-section CSS block.)

**How it was tested:** Verified in code against Task 4 implementation in
`Preloading.md`. No dedicated router `afterEach` unit test in the repo; behavior aligns
with the same `resolveRoleSectionVariant` pattern used for translations and assets in
the same hook.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `clearPreloadState()` cleared Pinia and the in-progress map but
left section `<link>` elements in `document.head`. After reset, preloads re-ran and
injected duplicate JS/CSS hints for the same bundle URLs.

**Why it happened:** DOM injection was not tied to preload state cleanup; JS
modulepreload links had no marker attribute for targeted removal.

**What changed:**

1. `clearPreloadState()` now calls `clearAllSectionCss()` and removes
   `link[data-section-js-preload]` elements from the DOM.
2. `preloadJavaScriptBundle()` tags injected JS hints with
   `data-section-js-preload="{sectionName}"` so cleanup is scoped to section bundles
   (does not remove unrelated `modulepreload` links from asset preloading).
3. `clearAllSectionCss()` also removes CSS preload hints
   (`link[data-section-preload]`) in addition to active stylesheets
   (`link[data-section-css="true"]`).

**How it was tested:** `tests/unit/sectionPreloader.test.js` — updated
`clearPreloadState resets store, in-progress map, and section preload DOM hints`; added
`clearPreloadState removes section JS modulepreload links after preload completes`.

Note: main.js still calls preloadStore.clearState() directly on deploy hash change (Task 6). That’s fine on a full page load since the DOM is fresh. If you ever call store clear mid-session without clearPreloadState(), the same desync could happen — worth keeping in mind for later.

---

### L-06 🟡 — `getPreloadSectionsForRoute` accepts `userRole` but never uses it
**File:** `sectionResolver.js` lines 21–71

The `userRole` parameter is documented and accepted but the implementation pushes only
`route.preLoadSections` verbatim (which are plain string identifiers). Role-based
`preLoadSections` (e.g., `{ creator: ["auth", "creator-tools"] }`) cannot be
declared per the current implementation — the parameter is simply ignored.

**Fix:** Either remove the `userRole` parameter (and update callers) or implement role-keyed `preLoadSections` resolution in line with
`resolveRoleSectionVariant`.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `getPreloadSectionsForRoute()` accepted `userRole` but always pushed
`route.preLoadSections` verbatim, so role-keyed configs like
`{ creator: [...], fan: [...] }` could not be resolved.

**Why it happened:** Only flat `string[]` `preLoadSections` were implemented; the role
parameter was documented but unused.

**What changed:** Added `resolveRolePreLoadSections()` in `sectionResolver.js` and wired
`getPreloadSectionsForRoute()` to use `userRole` when `preLoadSections` is a role-keyed
object. Resolution order matches `resolveRoleSectionVariant`: current role →
`default` → `guest`. Flat `string[]` configs remain supported unchanged.

**Note:** `router/index.js` and `main.js` still read `preLoadSections` as arrays directly
for runtime preload orchestration. Role-keyed configs are supported in
`getPreloadSectionsForRoute()` for callers of that API; adopting role-keyed objects in
`routeConfig.json` end-to-end is tracked separately as **M-04**.

**How it was tested:** `tests/unit/sectionResolver.test.js` — role-keyed resolution,
fallback order, flat-array compatibility, deduplication, and unresolved-role empty result.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** When neither `userRole` nor the `default` fallback key matched,
`resolveRoleSectionVariant()` returned `Object.values(sectionConfig)[0]`, silently
loading an arbitrary role’s section bundle.

**Why it happened:** A defensive last-resort fallback was added without an explicit product
decision for which variant to use.

**What changed:** Removed the `Object.values()[0]` branch. Unresolvable role-based configs
now log a warning with `availableRoles` and return `null`; callers (router CSS load,
translations, preload, etc.) already guard on falsy section strings.

**How it was tested:** `tests/unit/sectionResolver.test.js` — role match, `default`
fallback, and null result when role/default are both missing.

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

#### Resolution ✅

**Status:** Resolved (no further code change required).

**What was broken:** JS and CSS bundle preloads ran serially (`await` JS, then `await` CSS),
doubling wait time for the same section.

**Why it happened:** Sequential `await` calls in the original `_doPreload` implementation.

**What changed:** Fixed by **Preloading.md Task 5** in `sectionPreloader.js`. JS and CSS
now run in parallel via `Promise.all`. CSS is delegated to `preloadSectionCss()` (Task 5c)
instead of the removed internal `preloadCssBundle()` helper.

**How it was tested:** `tests/unit/sectionPreloader.test.js` — test
`marks section preloaded only after JS and CSS both complete (5a)` (parallel completion
before `addSection`).

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

#### Resolution ✅

**Status:** Resolved (no further code change required).

**What was broken:** `resolveActiveLocale` was dynamically imported inside the background
`preLoadSections` loop on every navigation, repeating module resolution work per section.

**Why it happened:** The import was placed inside the loop in the original `afterEach`
implementation.

**What changed:** Fixed by **Preloading.md Task 4d**. `router/index.js` now hoists the
import and `resolveActiveLocale()` call above the loop; the loop reuses `activeLocale`.

**How it was tested:** Verified in code against Task 4 implementation in `Preloading.md`
(`router/index.js` `afterEach`, background preload block). No dedicated router unit test.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `/section-css-manifest.json` was fetched on every cold page load with
no HTTP cache hint and no cross-navigation persistence; only the in-memory module cache
survived within a single page session.

**Why it happened:** `loadCssManifest()` used a plain `fetch()` and never persisted the
parsed manifest beyond module-level memory.

**What changed:** In `sectionCssLoader.js`:

1. Fetch now uses `{ cache: 'force-cache' }` so the browser can serve a cached response
   when HTTP cache headers allow it.
2. Successful manifests are persisted to `sessionStorage` under
   `app-section-css-manifest`, keyed by `VITE_BUILD_HASH` (same invalidation model as
   `usePreloadStore.buildHash`).
3. On load, `sessionStorage` is checked before network; stale entries (hash mismatch)
   are ignored and refetched.

**How it was tested:** `tests/unit/sectionCssLoader.test.js` — session cache hit skips
fetch; build-hash mismatch refetches with `force-cache`; successful fetch persists to
sessionStorage.

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

#### Resolution ✅

**Status:** Resolved (no further code change required).

**What was broken:** `sectionPreloader.js` wrote preload completion to `cacheHandler` via
`setValueWithExpiration`, but nothing ever read those entries. Deduplication relied on
`usePreloadStore.hasSection()` instead.

**Why it happened:** Legacy cache code was left beside the Pinia store when preload state
was consolidated.

**What changed:** Fixed by **Preloading.md Task 5d**. The dead `setValueWithExpiration`
write, `PRELOAD_CACHE_KEY_PREFIX`, and `PRELOAD_CACHE_TTL` were removed from
`sectionPreloader.js`. `usePreloadStore` is the sole source of truth for section preload
state.

**How it was tested:** Verified by code search — no `setValueWithExpiration`,
`PRELOAD_CACHE_*`, or `cacheHandler` references remain in `sectionPreloader.js`. Covered
indirectly by `tests/unit/sectionPreloader.test.js` store-based lifecycle tests (Task 5).

---

### P-05 🟡 — Orphaned preload `<link>` elements accumulate in `<head>` across navigations
**File:** `sectionCssLoader.js` `preloadSectionCss()` lines 318–324

`preloadSectionCss` injects `<link rel="preload" as="style">` elements but never
removes them — there is no `unloadSectionCssPreload` counterpart to
`unloadSectionCss`. Over many navigations the `<head>` grows unbounded with stale
preload hints that the browser must process on each navigation.

**Fix:** Track injected preload links in a separate Map (`preloadHintLinks`), keyed by
section name, and remove them in `unloadSectionCss`.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `preloadSectionCss()` injected `<link rel="preload" as="style">`
hints into `<head>` but never removed them on section unload, so stale hints accumulated
across navigations.

**Why it happened:** Only active stylesheets were tracked in `activeSectionCss`; preload
hints had no lifecycle cleanup path.

**What changed:** In `sectionCssLoader.js`:

1. Added `preloadHintLinks` map (section name → preload hint element).
2. `preloadSectionCss()` registers new and existing preload links in the map.
3. `unloadSectionCss()` removes the tracked preload hint via
   `removeSectionCssPreloadHint()` (returns `true` when only the hint was removed).
4. `clearAllSectionCss()` clears `preloadHintLinks` alongside existing DOM cleanup.

**How it was tested:** `tests/unit/sectionCssLoader.test.js` — preload hint removed by
`unloadSectionCss`; `clearAllSectionCss` removes tracked hints.

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

#### Resolution ✅

**Status:** Resolved (manifest verification implemented; CSP remains a deployment follow-up).

**What was broken:** `/section-manifest.json` and `/section-css-manifest.json` were fetched
with plain `fetch()` and used immediately with no integrity check, allowing tampered
manifest paths to reach bundle injection.

**Why it happened:** Manifest loading predated build-time integrity embedding and runtime
hash verification.

**What changed:**

1. **`build/vite/manifestIntegrityNode.js`** — computes SHA-256 of the unified section manifest
   after production build and injects `<meta name="section-manifest-sri">` into `dist/index.html`.
2. **`src/utils/build/manifestIntegrity.js`** — shared runtime helpers:
   `verifyManifestBodyIntegrity()` and `fetchVerifiedManifest()`.
3. **`manifestLoader.js`** — production fetch verifies manifest body hash against the embedded
   meta tag before `JSON.parse`. (CSS paths are resolved from the same manifest after **B-01**.)

**Note:** Recommended CSP headers (`script-src 'self'`, `style-src 'self'`) are a
server/deployment configuration item and were not added in app code. Bundle-level SRI on
`<link>` elements remains **S-02 / M-03**.

Dev stub manifests skip integrity verification (development only).

**How it was tested:** `tests/unit/manifestIntegrity.test.js`; updated
`tests/unit/sectionCssLoader.test.js` fetch mocks for verified manifest bodies.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Section JS `modulepreload` and CSS `stylesheet` / `preload` links were
injected with `href` only. Tampered bundle content at an otherwise trusted path would
still execute or apply.

**Why it happened:** Manifests stored bundle paths only; runtime never set `integrity`
on injected `<link>` elements.

**What changed:**

1. **Build** — `manifestGenerator.js` and `sectionCssPlugin.js` now emit
   `integrity: { js, css }` SRI hashes (`sha384-…`) alongside bundle paths.
2. **`manifestLoader.js`** — `getSectionBundlePaths()` returns `integrity` from the
   section manifest.
3. **`sectionPreloader.js`** — `preloadJavaScriptBundle()` sets `link.integrity` from
   `bundlePaths.integrity.js` when present.
4. **`sectionCssLoader.js`** — `injectCssLink()` and `preloadSectionCss()` apply
   `integrity.css` from the CSS manifest via `applyBundleLinkIntegrity()`.

**Note:** Also addresses manifest schema gap **M-03** (SRI hash storage). Manifest-file
verification remains **S-01**; same-origin path validation is **S-03**.

**How it was tested:** `tests/unit/sectionPreloader.test.js` (JS link integrity);
`tests/unit/sectionCssLoader.test.js` (stylesheet + preload link integrity).

Production note: Bundle SRI only applies after a fresh production build that regenerates manifests with integrity fields. Together with S-01, you get manifest tamper detection plus per-bundle content verification

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Bundle paths read from section manifests were placed directly into
`<link href="">` without verifying same-origin or CDN allow-list membership. A
compromised manifest (see **S-01**) could point preloads at attacker-controlled URLs.

**Why it happened:** Runtime trusted manifest integrity (**S-01**) and bundle SRI
(**S-02**) but did not restrict which origins/paths could appear in `href`.

**What changed:**

1. **`bundlePathValidation.js`** — new shared `isTrustedBundlePath()` helper: accepts
   paths starting with `/`; accepts absolute `http(s)` URLs only when prefixed by an
   entry in `VITE_TRUSTED_BUNDLE_ORIGINS` (comma-separated); rejects protocol-relative
   (`//…`) and dangerous schemes (`javascript:`, `data:`, etc.).
2. **`manifestLoader.js`** — `getSectionBundlePaths()` returns `null` when JS or CSS
   paths fail validation.
3. **`sectionPreloader.js`** — `preloadJavaScriptBundle()` rejects before DOM
   injection as defense in depth.
4. **`sectionCssLoader.js`** — `getSectionCssBundle()` returns `null` for untrusted
   paths (after normalization); `injectCssLink()` rejects before append. Normalization
   preserves absolute `http(s)` URLs instead of prefixing them with `/` (which would
   bypass validation).

**Note:** Optional `VITE_TRUSTED_BUNDLE_ORIGINS` env var for CDN-hosted bundles; default
same-origin `/assets/…` paths need no config.

**How it was tested:** `tests/unit/bundlePathValidation.test.js`;
`tests/unit/sectionPreloader.test.js` (untrusted JS path);
`tests/unit/sectionCssLoader.test.js` (untrusted CSS path).

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `getTranslationUrl()` interpolated `sectionName` directly into
`/i18n/section-${sectionName}/…`. A malicious or misconfigured route meta value such as
`../../api/admin` could produce traversal-like fetch URLs and noisy error logs.

**Why it happened:** Section names from `routeConfig.json` were treated as trusted URL
segments with no allowlist check.

**What changed:** Added `sanitizeSectionName()` in `translationLoader.js` (alphanumeric +
hyphens only). `getTranslationUrl()` sanitizes before building the path. Invalid names
throw; callers (`validateTranslationFileExists`, `loadTranslationFile`) already catch
errors and return safe fallbacks (`false` / `{}`) without issuing fetches.

**How it was tested:** `tests/unit/translationLoader.test.js` — valid names load;
traversal-like and malformed names return `{}` with no `fetch` calls.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `manifestLoader.js` and `routeResolver.js` called
`window.performanceTracker.step()` without checking that the tracker exists. In tests,
SSR, or other environments where `performanceTracker` is not initialised, this threw and
broke manifest loading and route resolution.

**Why it happened:** These files were written before the guarded pattern used elsewhere
(`if (window.performanceTracker)`) was applied consistently.

**What changed:** All 11 calls in `manifestLoader.js` and 9 calls in `routeResolver.js`
now use optional chaining: `window.performanceTracker?.step({ … })`.

**How it was tested:** `tests/unit/performanceTrackerGuards.test.js` — both modules
complete core operations with `window.performanceTracker` undefined.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** JS bundle paths came from `/section-manifest.json` via
`manifestLoader.js`, while CSS bundle paths came from a separate `/section-css-manifest.json`
via an independent fetch/cache path in `sectionCssLoader.js`. A partial deploy could leave
JS and CSS pointing at bundles from different builds.

**Why it happened:** Section CSS was added with its own Tailwind/Vite manifest emission
before the unified `manifestGenerator.js` scan existed; runtime loaders were never merged.

**What changed:**

1. **`sectionCssLoader.js`** — removed the separate CSS manifest fetch/session cache;
   `getSectionCssBundle()` now calls `getSectionBundlePaths()` from `manifestLoader.js`.
2. **`manifestLoader.js`** — owns the single production manifest fetch (with SRI verification,
   `cache: 'force-cache'`, and `sessionStorage` persistence keyed by `VITE_BUILD_HASH`).
3. **`build/vite/sectionCssPlugin.js`** — no longer emits `section-css-manifest.json`; CSS
   paths are merged into `section-manifest.json` by `manifestGenerator.js`.
4. **`build/vite/manifestIntegrityNode.js`** — injects only the unified manifest SRI meta tag.
5. Removed redundant dev stub `public/section-css-manifest.dev.json` (CSS paths already live
   in `public/section-manifest.dev.json` from Preloading Task 10).
6. **`manifestIntegrity.js` + `manifestIntegrityNode.js` (follow-up)** — removed unused
   `sectionCss: 'section-css-manifest-sri'` from `MANIFEST_INTEGRITY_META` and the dead
   `section-css-manifest-sri` cleanup regex in `injectManifestIntegrityMetaTags()` after B-01
   unified loading (no separate CSS manifest file remains).

**Override note:** This supersedes Preloading Task 10's separate `section-css-manifest.dev.json`
stub and relocates the P-03 session cache from `sectionCssLoader.js` into the unified
`manifestLoader.js` (same behaviour, single source of truth).

**How it was tested:** `tests/unit/manifestLoader.test.js` (unified session cache + fetch);
`tests/unit/sectionCssLoader.test.js` (CSS resolution via `getSectionBundlePaths` mock).

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** After B-01 unified loading, a failed `/section-manifest.json` fetch still
returned `{}` immediately with only internal logging. Section JS/CSS preload and runtime CSS
injection silently no-op'd, with no user-visible signal during CDN or deploy incidents.

**Why it happened:** `loadSectionManifest()` had a single fetch attempt and no integration with
preload store state for failure reporting.

**What changed:**

1. **`manifestLoader.js`** — added `fetchProductionManifestWithRetry()`:
   - up to 2 retries (3 total attempts) with 500ms exponential back-off
   - retries network/`TypeError` failures and HTTP 5xx responses
   - does not retry HTTP 4xx or integrity verification failures
   - on final failure: `console.error(...)`, sets Pinia flag, clears in-memory cache (Task 8 retryable)
2. **`usePreloadStore.js`** — added `manifestLoadFailed` state and `setManifestLoadFailed()`;
   cleared on successful manifest load and `clearState()`. Not persisted to localStorage.

**Relationship to Preloading Task 8:** Task 8 prevents permanently caching `{}` after failure.
B-02 adds retries and user-visible failure state before that fallback — it extends Task 8, does
not replace it.

**How it was tested:** Code review against audit requirements. UI reload prompt can bind to
`usePreloadStore().manifestLoadFailed` in a follow-up.

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

#### Resolution ⏸️ Deferred — audit fix reverted; client decision pending

**Status:** Not implemented as written. The recommended `await Promise.allSettled(...)` change was
tried and **reverted** after review against `Preloading.md` and `.cursorrules`.

**What was broken:** In `afterEach`, current-section CSS/translations and background
`preLoadSections` preloads all start concurrently. Heavy background work can compete with
current-page CSS/translation fetches on cold loads.

**Why it happened:** Preloading Task 4 intentionally keeps all post-navigation section work
fire-and-forget so nothing in `afterEach` blocks on I/O completion.

**What we tried (reverted):** Await current-section CSS + translations before starting the
background preload loop. This gave current-page work priority but introduced a different
cost: slow CSS/translation loading on cold loads **directly delayed** warming the next
section's cache — a tradeoff not aligned with Preloading Task 4.

**What remains in code:** Preloading Task 4 fire-and-forget scheduling, plus two small
improvements kept from the B-03 pass:

1. Single `resolvedCurrentSection` resolution (no duplicate role-object handling).
2. Background loop skips the current section using `resolvedCurrentSection` (string), not raw
   `currentSection` (which could be a role object).

**Decision for client — pick one approach:**

| Option | Current page | Next-section cache warming | Aligns with |
| --- | --- | --- | --- |
| **A. Fire-and-forget (current)** | Competes with background on cold load | Starts immediately | `Preloading.md` Task 4, `.cursorrules` non-blocking post-nav work |
| **B. Await current CSS + translations (audit B-03)** | Background waits until current finishes | Delayed by current CSS/translation duration | Audit B-03 TTI priority |
| **C. Fire-and-forget current + defer background start** | Current gets first network chance | Starts after idle/short timeout, not tied to slow CSS | `.cursorrules` perf rule #6 *and* Task 4 non-blocking |

**Recommendation:** Option **C** if the client wants to address starvation without serializing
on slow CSS. Option **A** is the safe default until the client chooses.

**How it was tested:** Code review only. No production behavior change beyond the retained
`resolvedCurrentSection` skip fix.

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

#### Resolution ✅

**Status:** Resolved (extends Preloading Task 10).

**What was broken:** `manifestLoader.js` already loaded `section-manifest.dev.json` in dev
(Preloading Task 10), but `sectionCssLoader.js` still returned `null` in dev and
`unloadSectionCss` no-op'd — so CSS preload/inject/unload lifecycle was never exercised
locally. Stub manifest paths also 404'd without files under `public/assets/`.

**Why it happened:** CSS was intentionally skipped in dev under the assumption Vite HMR
handles styles; JS dev stub was added in Task 10 without completing the CSS side.

**What changed:**

1. **`sectionCssLoader.js`** — removed dev early returns in `getSectionCssBundle()` and
   `unloadSectionCss()`; dev now resolves CSS paths via unified `getSectionBundlePaths()`.
2. **`manifestLoader.js`** — dev stub fetch falls back to `{}` instead of `null` when missing.
3. **`public/assets/section-*-dev.{js,css}`** — minimal stub files matching
   `section-manifest.dev.json` paths so link injection and preload can succeed in dev.

**Relationship to Preloading Task 10:** Task 10 added the dev manifest stub and JS loader
path. B-04 **extends** Task 10 to cover CSS and unload lifecycle — does not replace it.

**How it was tested:** Code review against audit + Task 10. In dev: confirm
`/section-manifest.dev.json` loads, navigate between sections, verify preload/CSS link
elements appear in DevTools Elements panel.

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

#### Resolution ✅

**Status:** Resolved (no further code change required — fixed by **Preloading.md Task 6**).

**What was broken:** `preloadedSections` / `preloadedAssets` persisted in `localStorage` with no
build-version check, so after deploy `preloadSection()` treated stale section names as already
preloaded and skipped fetching new bundles.

**Why it happened:** Preload persistence predated deploy invalidation.

**What changed (Preloading Task 6):**

1. **`usePreloadStore.js`** — `buildHash` in state + persisted paths.
2. **`main.js` startup** — when `VITE_BUILD_HASH` differs from stored hash, call
   `clearState()` then set the new hash.

**Small follow-up fix:** Corrected deploy log in `main.js` to capture `previousHash` before
`clearState()` (log previously showed the new hash for both fields).

**Also addresses:** M-01 (same root cause — stale preload state across deploys).

**How it was tested:** Code review against Task 6 implementation. Preview: set
`VITE_BUILD_HASH=v1`, navigate, change to `v2`, rebuild — `app-preload-state` should reset.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `findComponentLoader()` fell back to matching any glob key ending in the
same filename (e.g. two `Index.vue` files in different folders). The first enumeration match
could load the wrong component with no error.

**Why it happened:** Defensive fallback added before path normalization covered all `@/` variants.

**What changed:** Removed the filename-only `endsWith(fileName)` loop in `router/index.js`.
Unresolved paths now return `null`; `loadViaGlob()` already throws
`Component not found in pre-loaded modules: …`.

**Relationship to `.cursorrules`:** Matches router rule *“Remove filename-only component
fallback matching.”* Preloading Task 2 did not add this fallback — no Preloading.md conflict.

**How it was tested:** Code review. A bad `componentPath` in route config should now throw
during dev instead of silently rendering a same-named file from another directory.

---

## 5. Missing Features

### M-01 🔴 — No mechanism to invalidate cached preload state on new deployment
**Files:** `usePreloadStore.js`, `sectionPreloader.js`

The `preloadedSections` list is persisted to `localStorage` indefinitely. There is no
build-hash comparison, version field, or TTL expiry for the section-level record.
Users who visited the app before a deploy will serve cached (now potentially stale or
broken) bundles from the browser cache while `hasSection()` returns `true`, bypassing
any re-fetch. See also B-05 for the recommended fix.

#### Resolution ✅

**Status:** Resolved — duplicate of **B-05 / Preloading Task 6**. See B-05 resolution above.

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

#### Resolution ✅

**Status:** Resolved (duplicate of **S-02**).

**What was broken:** Manifest entries had no SRI hash fields, so bundle `<link>` elements could
not set `integrity`.

**Why it happened:** Schema and generator predated bundle-level SRI.

**What changed:** Addressed by **S-02** — `manifestGenerator.js` emits
`integrity: { js, css }` (`sha384-…`); runtime loaders apply hashes on injected links.

**How it was tested:** See S-02 resolution (`sectionPreloader.test.js`, `sectionCssLoader.test.js`).

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

#### Resolution ✅

**Status:** Resolved (completes **L-06** end-to-end wiring).

**What was broken:** `getPreloadSectionsForRoute()` supported role-keyed `preLoadSections`
(L-06), but `router/index.js` and `main.js` still read `preLoadSections` as flat arrays only —
role-keyed route config objects were ignored at runtime.

**Why it happened:** L-06 added resolver support first; orchestration sites were updated
separately in Preloading Task 7 with flat-array logic only.

**What changed:**

1. **`router/index.js` `afterEach`** — uses `getPreloadSectionsForRoute(routeConfig, userRole)`
   then `resolveSectionIdentifier()` for each entry (same as before for flat arrays).
2. **`main.js` startup preload** — same resolver path; fixed auth preload block to resolve
   the current route before checking `sectionsToPreload.includes('auth')` (removed use of
   undefined `currentRoute` and duplicate auth preload block).
3. **`jsonConfigValidator.js`** — accepts `preLoadSections` as `string[]` or role-keyed object.

**Relationship to Preloading Task 7:** Task 7 added `resolveSectionIdentifier()` on flat arrays.
M-04 **extends** Task 7 to role-keyed configs — does not replace identifier resolution.

**How it was tested:** Existing `tests/unit/sectionResolver.test.js` (L-06). Role-keyed entries
in `routeConfig.json` can now be adopted route-by-route.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `preloadJavaScriptBundle()` waited indefinitely on `<link onload>`.
A slow CDN could leave `inProgressPromises` locked, so concurrent `preloadSection()` callers
shared a hung promise and the section was never marked preloaded or retried.

**Why it happened:** Link-based preloads had no timeout guard. (Legacy `preloadCssBundle()`
was removed in Task 5c; `preloadSectionCss()` appends a hint link without awaiting load, so
the hang risk was on the JS path.)

**What changed:** In `sectionPreloader.js`:

1. Added `raceLinkPreloadWithTimeout()` — default **10s**, overridable via
   `VITE_SECTION_PRELOAD_TIMEOUT_MS`.
2. Wrapped JS `modulepreload` promise; on timeout or error, removes the injected link.
3. `_doPreload()` already catches failures and `preloadSection()` clears `inProgressPromises`
   in `finally()` — timeout failures return `false` and release the in-progress slot.

**How it was tested:** `tests/unit/sectionPreloader.test.js` — simulated hung JS preload
times out, returns `false`, clears in-progress tracking, removes DOM link.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** In-flight section preloads lived only in a module-level `Map`
(`inProgressPromises`). UI components could not reactively observe preload progress.

**Why it happened:** Promise deduplication was implemented before Pinia became the single
source of truth for preload state.

**What changed:**

1. **`usePreloadStore.js`** — added reactive `sectionsInProgress[]` (not persisted) plus
   `markSectionInProgress()`, `unmarkSectionInProgress()`, and `isSectionInProgress()`.
2. **`sectionPreloader.js`** — marks a section in the store when a new preload starts;
   unmarks in the shared promise `finally()` (success, failure, or timeout). `clearState()`
   clears the array. `getPreloadStatistics()` now reads from the store.

**UI usage:**

```js
const preloadStore = usePreloadStore();
watch(() => preloadStore.sectionsInProgress, (sections) => { /* show skeleton */ });
// or: preloadStore.isSectionInProgress('dashboard-global')
```

**How it was tested:** `tests/unit/sectionPreloader.test.js` — in-progress array updates during
preload, clears on completion/timeout, and resets on `clearPreloadState()`.

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

#### Resolution ✅

**Status:** Resolved (fixed by **Preloading.md Task 7a**).

**What was broken:** Startup called `resolveRouteFromPath()` with raw router paths like
`/vi/dashboard`, which did not match route slugs stored without locale prefixes.

**What changed:** `main.js` strips the locale prefix before route lookup:

```js
const localePrefixMatch = rawPath.match(new RegExp(`^/(${SUPPORTED_LOCALES.join('|')})(/.*|$)`));
const currentPath = localePrefixMatch ? (localePrefixMatch[2] || '/') : rawPath;
const currentRoute = resolveRouteFromPath(currentPath);
```

**How it was tested:** Code review against Task 7 implementation.

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

#### Resolution ✅

**Status:** Resolved (fixed by **Preloading Task 7b** + **M-04**).

**What was broken:** Startup passed raw `preLoadSections` entries to `preloadSection()` while
`afterEach` resolved identifiers via `resolveSectionIdentifier()`.

**What changed:** `main.js` startup now uses the same pipeline as `router/index.js`:

1. `getPreloadSectionsForRoute(currentRoute, userRole)` (role-keyed configs — M-04)
2. `.map((id) => resolveSectionIdentifier(id, userRole))`
3. dedupe with `Set`

**How it was tested:** Code review against Task 7 + M-04; `tests/unit/sectionResolver.test.js`.

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

#### Resolution ✅

**Status:** Resolved (no further code change — fixed by **Preloading.md Task 3**).

**What was broken:** `beforeEach` awaited `loadTranslationsForSection()` before `next()`,
blocking navigation on translation HEAD/JSON fetches.

**What changed:** Task 3 removed translation loading from `beforeEach`. Translations load in
`afterEach` (and startup initial-section path in `main.js`) as fire-and-forget background work.

**How it was tested:** Code review — `router/index.js` `beforeEach` has no
`loadTranslationsForSection` await before `next()`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Bundle paths were interpolated directly into `querySelector()` attribute
selectors. Manifest paths containing `"` or `]` could throw `DOMException` and break preload.

**Why it happened:** Paths were assumed safe after trust validation but selector syntax was not
escaped.

**What changed:**

1. **`bundlePathValidation.js`** — added `escapeSelectorAttributeValue()` using `CSS.escape()`.
2. **`sectionPreloader.js`** — escaped `href` in duplicate JS link lookup.
3. **`sectionCssLoader.js`** — escaped `href` in preload hint lookup and `data-section` in
   stylesheet duplicate lookup.
4. **`sectionPreloader.js` (follow-up)** — the JS preload timeout/error cleanup path in
   `preloadJavaScriptBundle()` also escaped `data-section-js-preload` and `href` when removing
   a failed link. The initial S-06 pass missed this `.catch()` selector; it used raw
   `sectionName` / `bundlePath` interpolation and was inconsistent with item 2 above.

**How it was tested:** `tests/unit/bundlePathValidation.test.js` — normal paths unchanged; `"` escaped; malicious path does not throw in `querySelector`.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Startup (`main.js`) and navigation (`router.afterEach`) duplicated
role-aware preload resolution and background preload loops independently.

**Why it happened:** Each entry point evolved separately (startup vs post-navigation).

**What changed:**

1. **`sectionPreloadOrchestrator.js`** — shared helpers:
   - `getRoutePreloadPlan()` — role-aware identifier + resolved section names
   - `resolveCurrentRouteSectionName()` — current route section variant
   - `shouldPreloadDefaultAuthSection()` / `preloadDefaultAuthSection()` — startup auth warm-up
   - `startBackgroundSectionPreloads()` — fire-and-forget JS (+ optional translation) preloads
2. **`main.js`** — uses orchestrator for plan, auth default, and background preloads
3. **`router/index.js`** — `afterEach` uses same plan + background helper (skips current section, preloads translations)
4. **`router/index.js` (follow-up)** — removed unused imports `preloadSectionCss` and
   `preloadSectionCriticalImages` left over after B-07; background CSS preload now flows only
   through `startBackgroundSectionPreloads()` → `preloadSection()`.

**How it was tested:** Code review — both paths now call the same orchestrator module; existing
`sectionResolver` unit tests still cover identifier resolution.

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

#### Resolution ✅

**Status:** Resolved (prior to this audit pass).

**What was broken:** Scanner regex `([^-]+)` captured only the first hyphen segment,
so keys like `dashboard` were stored instead of `dashboard-global`.

**What changed:** `manifestGenerator.js` uses
`^section-(.+)-[A-Za-z0-9]{8,}\.(js|css)$` so full hyphenated section names are preserved.

**How it was tested:** Production build scan logs show correct keys (e.g.
`dashboard-global`, `dashboard-creator`).

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** Child routes with `inheritConfigFromParent: true` did not inherit
parent `preLoadSections` (or `preloadExclude`) during preload orchestration. A follow-up
review found the same effective config also needed to be used by `beforeEach` guard checks.

**What changed:**

1. **`sectionPreloadOrchestrator.js`** — `resolveEffectiveRouteConfig()` wraps
   `inheritConfigurationFromParentRoute()`; used by `getRoutePreloadPlan()` and
   `resolveCurrentRouteSectionName()`.
2. **`router/index.js`** — `beforeEach` and `afterEach` resolve effective config. Guards,
   current-section resolution, `preloadExclude`, and inherited preload lists all use the
   merged route config.

**How it was tested:** Targeted unit run for Section 7 preload tests; code review confirmed
child routes without explicit `preLoadSections` now inherit parent lists through the shared
orchestrator and guard checks use the same effective config.

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

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `resolveSectionIdentifier()` on role-keyed `route.section` objects
returned `null`, leaving `to.meta.section` as a raw object for downstream preload/CSS logic.

**What changed:** **`router/index.js`** `beforeEach` now uses
`resolveRoleSectionVariant()` for `route.section`.

**How it was tested:** Code review — role-based dashboard routes now store a concrete section
string on `to.meta.section`.

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

#### Resolution ✅

**Status:** Resolved (aligned with Preloading Task 4).

**What was broken:** Earlier `afterEach` returned early on `preloadExclude`, skipping
current-page CSS, translations, and assets.

**What changed:** `preloadExclude` now gates only the background `preLoadSections` loop;
current-section CSS, translations, and assets always run (see comment at
`router/index.js` `afterEach`).

**How it was tested:** Code review — `preloadExclude` check applies only to
`startBackgroundSectionPreloads()`.

---

### L-14 🟠 — Failed manifest fetch is cached as `{}` for the entire session
**File:** `manifestLoader.js` lines 89, 127

On fetch/parse failure, the loader sets `cachedManifest = {}` and returns it. Because
the cache is never invalidated on recovery, all later `getSectionBundlePaths` calls
keep failing until full page reload — even if the network/CDN issue recovers.

**Fix:** Cache failures separately with short TTL, or keep `cachedManifest = null` on
error and allow retry/backoff (see B-02).

#### Resolution ✅

**Status:** Resolved (no further code change required).

**What was broken:** On fetch/parse failure, `loadSectionManifest()` set
`cachedManifest = {}`. Because `{}` is truthy, the early cache-hit branch served it for
the rest of the session, so later calls never refetched even after the network/CDN
recovered.

**Why it happened:** Error handlers treated an empty object as a valid cached manifest
instead of clearing in-memory state.

**What changed:** Fixed by **Preloading.md Task 8** and extended by **B-02**:

1. **Task 8** — production failure paths call `resetManifestLoadState()` so
   `cachedManifest` and `manifestPromise` stay `null`; callers still receive `{}` as a
   graceful fallback but the loader remains retryable.
2. **B-02** — `fetchProductionManifestWithRetry()` adds up to 2 retries with exponential
   back-off before that fallback, and sets `manifestLoadFailed` in Pinia for UI surfacing.

**Note:** Dev stub fetch still caches `{}` when the stub file is missing — intentional
per Task 8 (local dev only; production paths must stay retryable).

**How it was tested:** `tests/unit/manifestLoader.test.js` — `manifestLoader failure
recovery (L-14 / Task 8)` (failed fetch not persisted; subsequent call refetches and
resolves bundle paths).


Optional follow-up (not L-14)
assetLibrary.js has its own cachedManifest that stores the {} return value from a failed load. That could block asset preload retries until reload — separate from manifestLoader.js and worth a future audit item if you want full consistency.
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

#### Resolution ✅

**Status:** Resolved (no further code change required).

**What was broken:** The router background `preLoadSections` loop called both
`preloadSectionCss(section)` and `preloadSection(section)` (which had its own
`preloadCssBundle()` path), causing duplicate CSS fetch/preload work per section.

**Why it happened:** CSS preload existed in two places — standalone in the router loop and
again inside `sectionPreloader`.

**What changed:** Fixed by **Preloading.md Task 4b** and **Task 5c** (see also **L-02**):

1. **Task 4b** — removed standalone `preloadSectionCss` from the router background loop;
   `startBackgroundSectionPreloads()` now calls `preloadSection()` only.
2. **Task 5c** — `sectionPreloader._doPreload` delegates CSS to
   `preloadSectionCss()` from `sectionCssLoader.js` (single owner); internal
   `preloadCssBundle()` was removed.

Current-section CSS still uses `loadSectionCss()` in `afterEach` (active stylesheet
injection) — separate from background preload hints and not duplicated per section.

**How it was tested:** `tests/unit/sectionPreloader.test.js` — `delegates CSS preload to
sectionCssLoader, not an internal helper (5c)`; `tests/unit/sectionPreloadOrchestrator.test.js`
— `startBackgroundSectionPreloads (P-07 / Task 4b)` (orchestrator calls `preloadSection`
only, never `preloadSectionCss` directly).

---

### P-08 🟠 — Current-section translations are loaded twice per navigation
**Files:** `router/index.js` `beforeEach` lines 502–504, `afterEach` lines 666–687

`beforeEach` awaits `loadTranslationsForSection(resolvedSection, activeLocale)` before
navigation completes, then `afterEach` calls `loadTranslationsForSection` again for the
same section. The loader deduplicates in-flight/ cached requests, but still performs
cache checks and scheduling work twice on every navigation.

**Fix:** Load current-section translations in one place only (prefer `beforeEach`),
and keep `afterEach` focused on background `preLoadSections` translation preloads.

#### Resolution ✅

**Status:** Resolved (no further code change required).

**What was broken:** `beforeEach` awaited `loadTranslationsForSection` before calling
`next()`, then `afterEach` loaded translations again for the same section — duplicate
scheduling on every navigation (even when the loader deduplicated in-flight requests).

**Why it happened:** Translations were treated as part of the guard path instead of
post-navigation background work.

**What changed:** Fixed by **Preloading.md Task 3** and confirmed in **Task 4c**:

1. **Task 3** — removed the awaited translation load from `beforeEach`; navigation no
   longer blocks on translation I/O.
2. **Task 4c** — current-section translations load once in `afterEach` only; background
   `preLoadSections` translations run via `startBackgroundSectionPreloads()` with
   `skipSection` excluding the current page.

**Note:** The audit suggested preferring `beforeEach`; the refactor intentionally chose
`afterEach` to keep translations off the critical navigation path (see `.cursorrules`
Critical Navigation Rules).

**How it was tested:** Code review — `router/index.js` `beforeEach` has no
`loadTranslationsForSection` call; `afterEach` loads current-section translations once
and passes `skipSection: resolvedCurrentSection` to background preloads.

---

### M-07 🟠 — Locale changes reload translations for preloaded sections but not section bundles
**File:** `localeManager.js` lines 587–623

On `setActiveLocale`, the app reloads translations for `preLoadSections` but does not
re-run `preloadSection()` / `preloadSectionCss()` for those sections. If locale-specific
bundle splits are introduced later (or if section assets are locale-dependent), users
can get fresh copy with stale bundles.

**Fix:** On locale change, call a shared orchestrator that refreshes both translations
and section bundle/CSS preload state for resolved `preLoadSections`.

#### Resolution ✅

**Status:** Resolved.

**What was broken:** `setActiveLocale()` reloaded translations for `preLoadSections`
via `preloadTranslationsForSections()` but never re-ran section bundle/CSS preload.
Already-preloaded sections stayed marked in Pinia, so `preloadSection()` short-circuited
on cache hit — stale bundles would persist if locale-specific splits are introduced.

**Why it happened:** Locale switching only integrated with `translationLoader`, not the
section preload orchestration path used by navigation/startup.

**What changed:**

1. **`usePreloadStore.js`** — added `removeSection()` for targeted cache invalidation.
2. **`sectionPreloader.js`** — added `resetSectionPreloadState()` to clear one section
   from Pinia, in-progress tracking, JS modulepreload hints, and CSS preload hints
   (does not remove active stylesheets for the current page).
3. **`sectionCssLoader.js`** — exported `clearSectionCssPreloadHint()` for targeted hint cleanup.
4. **`sectionPreloadOrchestrator.js`** — added `refreshSectionPreloadsOnLocaleChange()`
   that resets then calls `startBackgroundSectionPreloads()` with translations enabled.
5. **`localeManager.js`** — uses `getRoutePreloadPlan()` (role-aware, parent inherit) and
   `refreshSectionPreloadsOnLocaleChange()` instead of translation-only reload.

**How it was tested:** `tests/unit/sectionPreloadOrchestrator.test.js` — `refreshSectionPreloadsOnLocaleChange (M-07)`;
`tests/unit/sectionPreloader.test.js` — `resetSectionPreloadState clears one section so it can be preloaded again (M-07)`.

---

### M-08 🟠 — No build-time validation that `preLoadSections` entries resolve to real sections
**Files:** `jsonConfigValidator.js`, `routeConfig.json`

Validation only checks that `preLoadSections` is an array, not that each entry is a
valid section name or resolvable slug. Typos like `"dashbord"` or `"shop "` fail silently
at runtime (skipped preloads, logged only in dev tools).

**Fix:** Extend `validateRouteConfig` to resolve each entry against known section names
(from route `section` fields and role variants) and fail build on unknown identifiers.

#### Resolution ✅

**Status:** Resolved (no further code change required).

**What was broken:** `validateRouteConfig()` only checked that `preLoadSections` was an
array (or role-keyed object of arrays). Typos like `"dashbord"` or empty entries passed
validation and failed silently at runtime when `resolveSectionIdentifier()` could not map
them to a real section.

**Why it happened:** Schema validation stopped at field types; identifier resolution was
left to runtime preload orchestration only.

**What changed:** **`jsonConfigValidator.js`** now:

1. Collects known section names from all route `section` fields (including role variants).
2. Resolves each `preLoadSections` entry via `resolvePreloadSectionIdentifier()` — direct
   section name or route slug alias (same guest-role resolution used at build time).
3. Emits `UNKNOWN_PRELOAD_SECTION`, `INVALID_PRELOAD_SECTION`, and type errors for bad entries.
4. **`build/vite/sectionBundler.js`** already calls `validateRouteConfig()` and throws on
   failure, so invalid identifiers fail the production build.

**Note:** M-04 added role-keyed `preLoadSections` type acceptance; M-08 adds entry-level
resolution validation on top.

**How it was tested:** `tests/unit/jsonConfigValidator.test.js` — `jsonConfigValidator preLoadSections (M-08)` (direct names, slug aliases, unknown typos, role-keyed entries, production `routeConfig.json` has no unknown preload identifiers).

**Supporting fix:** `logHandler.js` guards `import.meta.env` so validation can run when Vite loads `sectionBundler` during config initialization.

**Follow-up validation fix:** The stricter validator exposed a duplicate `/dashboard/edit-profile`
slug in `routeConfig.json`, which caused `sectionBundler` section discovery to fall back to an
empty set during Vite startup. The standalone edit-profile route was moved to `/edit-profile`,
leaving the role-based dashboard route as the only `/dashboard/edit-profile` entry.

---

### B-08 🟡 — `section/index.js` exports a non-existent `preloadSectionBundle`
**File:** `src/utils/section/index.js` line 21

The barrel file exports `preloadSectionBundle`, but `sectionPreloader.js` exports
`preloadSection`. Any consumer importing from `utils/section` gets `undefined` for the
bundle preload API.

**Fix:** Export `preloadSection` (or alias `preloadSectionBundle = preloadSection`).

#### Resolution ✅

**Status:** Resolved (no further code change required).

**What was broken:** `src/utils/section/index.js` exported `preloadSectionBundle`, which does
not exist in `sectionPreloader.js`. Consumers importing from the barrel received
`undefined` for the bundle preload API.

**Why it happened:** The export name was never updated when `preloadSection` replaced the
old API.

**What changed:** Fixed by **Preloading.md Task 9**. The barrel now re-exports the actual
preloader surface:

```js
export {
  preloadSection,
  preloadMultipleSections,
  isSectionPreloaded,
  clearPreloadState,
  getPreloadStatistics
} from './sectionPreloader.js';
```

**Note:** `src/utils/section/README.md` still references the old `preloadSectionBundle`
name in examples — documentation drift only; runtime barrel is correct.

**How it was tested:** `tests/unit/sectionBarrel.test.js` — `section barrel exports (B-08 / Task 9)`.

---
