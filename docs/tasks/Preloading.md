# Section Preloading — Implementation Guide

Background cache-warming for section bundles. Preloading never blocks navigation. If a section was warmed in advance, the next visit loads from cache. If not, Vue lazy loading still works — it is just slower on first visit.

---

## Table of Contents

1. [Objective](#objective)
2. [Navigation Flow](#navigation-flow)
3. [Critical Rule](#critical-rule)
4. [Task Summary](#task-summary)
5. [Implementation Details](#implementation-details)
6. [Execution Order](#execution-order)
7. [Testing](#testing)

---

## Objective

When a user navigates to a route:

| Condition | Behavior |
| --- | --- |
| Route has a section and it is already preloaded | Fast path: component loads from browser cache |
| Route has a section but it is not preloaded | Slow path: lazy load now, preload section in background |
| Route has no section | Lazy load only, no section work |

After every navigation (non-blocking, in background):

- Load current section CSS and translations
- Warm sections listed in `preLoadSections` for that route

---

## Navigation Flow

```text
User navigates to a route
│
├── Route has SECTION + already preloaded
│   └── Instant load (chunk already cached)
│
├── Route has SECTION + NOT preloaded
│   ├── Lazy load component now
│   └── Preload section in background (next visit is instant)
│
└── Route has NO section
    └── Lazy load only
│
After navigation (background):
  → load current section CSS + translations
  → warm preLoadSections for that route
```

### Route resolution detail

```text
Route navigated to
│
├── HAS section AND section is already preloaded (usePreloadStore)
│   → component loads instantly from browser cache (fast path)
│   → CSS + translations already warm
│   → fire-and-forget: run preLoadSections for other sections
│
├── HAS section BUT not yet preloaded
│   → lazy-load component (import.meta.glob)
│   → after component loads: preload THIS section (JS + CSS)
│   → fire-and-forget: load current section CSS + translations
│   → fire-and-forget: run preLoadSections for other sections
│
└── NO section
    → lazy-load component only
    → no section work
```

---

## Critical Rule

Nothing in the critical navigation path (`beforeEach` → `next()`) may block on preload I/O. All section work is non-blocking and runs after the component is resolved.

---

## Task Summary

| Task | File(s) | Status |
| --- | --- | --- |
| 1. Fix manifest regex | `build/vite/manifestGenerator.js` | Done |
| 2. Rewrite `loadRouteComponent` | `src/router/index.js` | Done |
| 3. Remove translation await from `beforeEach` | `src/router/index.js` | Done |
| 4. Fix `afterEach` deduplication | `src/router/index.js` | Done |
| 5. Fix `sectionPreloader` lifecycle | `src/utils/section/sectionPreloader.js` | Done |
| 6. Add `buildHash` invalidation | `src/stores/usePreloadStore.js`, `src/main.js` | Done |
| 7. Fix startup preloading | `src/main.js` | Done |
| 8. Fix manifest fetch failure caching | `src/utils/build/manifestLoader.js` | Done |
| 9. Fix barrel export | `src/utils/section/index.js` | Done |
| 10. Add dev manifest stubs | `public/`, `src/utils/build/manifestLoader.js` | Done |

---

## Implementation Details

### Task 1 — Fix the build manifest regex

**File:** `build/vite/manifestGenerator.js` (line 44)

#### What was broken

Production manifest keys did not match runtime section names. Hyphenated sections like `dashboard-global` were stored as `dashboard`, so every runtime lookup missed and preloading silently failed in production.

#### Why it happened

The filename regex only captured the first segment before a hyphen:

```js
/^section-([^-]+)-.+\.(js|css)$/
```

For `section-dashboard-global-abc12345.js`, `[^-]+` stopped at the first `-` and produced `dashboard`.

#### What changed

The regex now captures the full section name and treats the trailing hash as a separate segment:

```js
/^section-(.+)-[A-Za-z0-9]{8,}\.(js|css)$/
```

#### How you fixed it

Updated `scanDistAssetsForSections()` to use the greedy section-name pattern. Also verify `build/vite/sectionCssPlugin.js` emits keys that match what runtime lookup expects (`section-${sectionName}.css`).

---

### Task 2 — Rewrite `loadRouteComponent`

**File:** `src/router/index.js` (`loadRouteComponent`, `loadViaGlob`)

#### What was broken

`loadRouteComponent` always used `import.meta.glob`. It never checked preload state, so the fast/slow path described in the spec was not implemented.

#### Why it happened

The preload store and section preloader existed, but route component loading was never wired to them.

#### What changed

- Resolve the role-specific section name before loading
- Fast path: if the store says the section is preloaded, load via `import.meta.glob` (chunk should already be cached)
- Slow path: lazy load first, then fire-and-forget `preloadSection(sectionName)` in the background
- Extract shared glob logic into `loadViaGlob(route, userRole)`

#### How you fixed it

Critical-image preload is fire-and-forget; navigation only ever awaits the component chunk.
The background section preload is triggered after the component loads, only on cache miss.

```js
async function loadRouteComponent(route) {
  const userRole = resolveUserRoleForComponentLoad();
  const sectionName = route.section
    ? resolveRoleSectionVariant(route.section, userRole)
    : null;

  if (sectionName) {
    const pinia = getActivePinia();
    const store = pinia ? usePreloadStore(pinia) : null;
    const sectionPreloaded = !!store?.hasSection(sectionName);

    // Background cache-warming — never blocks navigation
    preloadSectionCriticalImages(sectionName).catch(() => {});

    const componentModule = await loadViaGlob(route, userRole);

    if (!sectionPreloaded) {
      preloadSection(sectionName).catch(() => {});
    }

    return componentModule;
  }

  return loadViaGlob(route, userRole);
}
```

---

### Task 3 — Remove translation await from `beforeEach`

**File:** `src/router/index.js` (`beforeEach`)

#### What was broken

Navigation blocked on network I/O because `beforeEach` awaited `loadTranslationsForSection` before calling `next()`.

#### Why it happened

Translations were treated as part of the guard path instead of post-navigation background work.

#### What changed

The translation block was removed from `beforeEach`. `beforeEach` now handles locale, auth guards, and section meta resolution only.

#### How you fixed it

Deleted the awaited translation load from `beforeEach`. Current-section translations are loaded in `afterEach` instead.

---

### Task 4 — Fix `afterEach` resolution and deduplication

**File:** `src/router/index.js` (`afterEach`)

#### What was broken

- Role-based section objects were passed directly to `loadSectionCss`
- Background preload loop duplicated CSS work
- `resolveActiveLocale` was imported inside the loop
- `preloadExclude` skipped current-page CSS, translations, and assets

#### Why it happened

Section resolution was inconsistent between current-page work and background preloads, and `preloadExclude` returned too early.

#### What changed

| Sub-task | Fix |
| --- | --- |
| 4a | Resolve role-object sections before `loadSectionCss` |
| 4b | Remove standalone `preloadSectionCss` from background loop; keep `preloadSection` only |
| 4c | Confirm current-section translations load only in `afterEach` after Task 3 |
| 4d | Hoist `resolveActiveLocale` above the background loop |
| 4e | Apply `preloadExclude` only to the background `preLoadSections` loop |

#### How you fixed it

```js
const resolvedCurrentSection = typeof currentSection === 'object'
  ? resolveRoleSectionVariant(currentSection, userRole)
  : currentSection;

if (resolvedCurrentSection) {
  loadSectionCss(resolvedCurrentSection).catch(/* ... */);
}

// Background loop only
if (uniqueResolvedSections.length > 0 && !preloadExclude) {
  const { resolveActiveLocale } = await import('../utils/translation/localeManager.js');
  const activeLocale = resolveActiveLocale();

  for (const sectionToPreload of uniqueResolvedSections) {
    preloadSection(sectionToPreload).catch(/* ... */);
  }
}
```

---

### Task 5 — Fix `sectionPreloader.js` lifecycle

**File:** `src/utils/section/sectionPreloader.js`

#### What was broken

- Sections were marked preloaded before JS and CSS finished
- Concurrent callers got `false` instead of sharing the in-flight promise
- CSS preloading duplicated logic already in `sectionCssLoader`
- A dead secondary cache write existed beside the Pinia store

#### Why it happened

Preload completion was tracked too early, in-progress dedup returned a boolean, and legacy cache code was left in place.

#### What changed

| Sub-task | Fix |
| --- | --- |
| 5a | Call `addSection()` only after JS + CSS complete |
| 5b | Return a shared promise from `inProgressPromises` |
| 5c | Delegate CSS to `preloadSectionCss()` |
| 5d | Remove `setValueWithExpiration` and related constants |

#### How you fixed it

`preloadSectionCss` now returns a Promise that resolves on `link.onload` and rejects on `link.onerror`, so JS + CSS in `Promise.all` are both genuinely cached before the store is updated:

```js
await Promise.all([
  bundlePaths.js ? preloadJavaScriptBundle(bundlePaths.js, sectionName) : Promise.resolve(),
  bundlePaths.css ? preloadSectionCss(sectionName) : Promise.resolve(),
]);

preloadStore.addSection(sectionName);
```

```js
// sectionCssLoader.js — preloadSectionCss
const loadPromise = new Promise((resolve, reject) => {
  preloadLink.onload = () => resolve(true);
  preloadLink.onerror = () => {
    preloadLink.parentNode?.removeChild(preloadLink);
    preloadHintLinks.delete(sectionName);
    preloadHintPromises.delete(sectionName);
    reject(new Error(`Failed to preload CSS for section: ${sectionName}`));
  };
});

document.head.appendChild(preloadLink);
preloadHintLinks.set(sectionName, preloadLink);
preloadHintPromises.set(sectionName, loadPromise);

return loadPromise;
```

Concurrent callers now reuse the same promise:

```js
if (inProgressPromises.has(sectionName)) {
  return inProgressPromises.get(sectionName);
}

const promise = _doPreload(sectionName).finally(() => {
  inProgressPromises.delete(sectionName);
});

inProgressPromises.set(sectionName, promise);
return promise;
```

---

### Task 6 — Invalidate preload state on deploy

**Files:** `src/stores/usePreloadStore.js`, `src/main.js`, `.env*`

#### What was broken

Persisted preload state survived deploys. Old section names stayed marked as preloaded even when bundle hashes changed.

#### Why it happened

The store persisted `preloadedSections` and `preloadedAssets` with no build-version invalidation.

#### What changed

- Added `buildHash` to store state and persistence
- Clear preload state when `VITE_BUILD_HASH` changes
- Set the new hash after clearing

#### How you fixed it

**Store:**

```js
state: () => ({
  preloadedSections: [],
  preloadedAssets: [],
  buildHash: null,
}),
```

**Startup:**

```js
const preloadStore = usePreloadStore();
const currentBuildHash = import.meta.env.VITE_BUILD_HASH || null;

if (currentBuildHash && preloadStore.buildHash !== currentBuildHash) {
  preloadStore.clearState();
  preloadStore.buildHash = currentBuildHash;
}
```

**Follow-up:** set `VITE_BUILD_HASH=` in `.env.example` and `.env.production` (CI should inject commit SHA or build timestamp).

---

### Task 7 — Fix startup preloading in `main.js`

**File:** `src/main.js`

#### What was broken

- Locale-prefixed paths like `/vi/dashboard` failed route lookup
- Startup used raw `preLoadSections` instead of resolved identifiers
- Auth was preloaded unconditionally on every startup

#### Why it happened

Startup used the raw router path and raw route config values instead of the same resolution logic used in `afterEach`.

#### What changed

| Sub-task | Fix |
| --- | --- |
| 7a | Strip locale prefix before `resolveRouteFromPath()` |
| 7b | Resolve `preLoadSections` with `resolveSectionIdentifier()` |
| 7c | Preload auth only when relevant |

#### How you fixed it

```js
const rawPath = router.currentRoute.value.path;
const localePrefixMatch = rawPath.match(
  new RegExp(`^/(${SUPPORTED_LOCALES.join('|')})(/.*|$)`)
);
const currentPath = localePrefixMatch ? (localePrefixMatch[2] || '/') : rawPath;
const currentRoute = resolveRouteFromPath(currentPath);

const sectionsToPreload = Array.isArray(currentRoute.preLoadSections)
  ? [...new Set(
      currentRoute.preLoadSections
        .map((id) => resolveSectionIdentifier(id, userRoleForPreload))
        .filter((s) => typeof s === 'string' && s.length > 0)
    )]
  : [];

const shouldPreloadAuth =
  !authStore.isAuthenticated ||
  currentPath === '/log-in' ||
  sectionsToPreload.includes('auth');

if (shouldPreloadAuth) {
  preloadSection('auth').catch(/* ... */);
}
```

`shouldPreloadAuth` runs after `currentRoute` and `sectionsToPreload` are defined, and uses locale-stripped `currentPath`.

---

### Task 8 — Do not cache manifest fetch failure permanently

**File:** `src/utils/build/manifestLoader.js`

#### What was broken

A failed manifest fetch cached `{}` for the rest of the session, so all later preload attempts kept failing silently.

#### Why it happened

Error handlers treated an empty object as a valid cached manifest.

#### What changed

On failure, reset in-memory cache state so the next call can retry:

```js
cachedManifest = null;
manifestPromise = null;
return {};
```

#### How you fixed it

Updated production and outer error handlers to null out `cachedManifest` and `manifestPromise`.

**Note:** the dev fetch catch still falls back to `{}` when the stub file is missing. That is acceptable for local dev, but production failure paths must stay retryable.

---

### Task 9 — Fix barrel export

**File:** `src/utils/section/index.js`

#### What was broken

The barrel exported `preloadSectionBundle`, which does not exist. Consumers importing from the barrel got `undefined`.

#### Why it happened

The export name was never updated when `preloadSection` replaced the old API.

#### What changed

Export the actual preloader functions:

```js
export {
  preloadSection,
  preloadMultipleSections,
  isSectionPreloaded,
  clearPreloadState,
  getPreloadStatistics,
} from './sectionPreloader.js';
```

#### How you fixed it

Renamed the barrel export from `preloadSectionBundle` to `preloadSection` and exported the full public preloader surface.

---

### Task 10 — Add dev manifest stubs

**Files:** `public/section-manifest.dev.json`, `public/section-css-manifest.dev.json`, `src/utils/build/manifestLoader.js`

#### What was broken

The full preload path could not be exercised locally without a production build and real `dist/section-manifest.json`.

#### Why it happened

`manifestLoader` had no dev-mode manifest source.

#### What changed

- Added stub manifest files under `public/`
- In dev mode, fetch `/section-manifest.dev.json`

#### How you fixed it

```js
if (import.meta.env.DEV) {
  const r = await fetch('/section-manifest.dev.json');
  cachedManifest = r.ok ? await r.json() : null;
  return cachedManifest;
}
```

Stub entries cover known sections such as `auth`, `dashboard-global`, `shop`, and `profile`.

---

## Execution Order

```text
Task 1 → Task 5 → Task 2 → Task 3 + 4 → Task 6 → Task 7 → Task 8 + 9 → Task 10
(build)  (preloader) (component) (afterEach) (store) (startup) (cleanup) (dev stub)
```

Tasks 1 and 5 are prerequisites. Tasks 3, 4, 6, 7, 8, and 9 can be done in parallel once 1 and 5 are stable.

---

## Testing

### Dev mode (`npm run dev`)

1. Open DevTools → Network and confirm `/section-manifest.dev.json` loads successfully.
2. Open DevTools → Application → Local Storage → `app-preload-state`.
3. Navigate between routes and confirm `preloadedSections` grows (for example: `auth`, `dashboard-global`, `shop`).
4. Navigate to the same route twice and look for `cache-hit` vs `cache-miss` logs from `loadRouteComponent`.
5. Confirm navigation does not stall waiting on translation fetches in `beforeEach`.

### Build preview (`npm run build && npm run preview`)

1. Confirm `dist/section-manifest.json` exists after build.
2. Verify hyphenated keys such as `dashboard-global` appear correctly in the manifest.
3. In preview, confirm `GET /section-manifest.json` returns 200.
4. Navigate between routes and confirm repeat visits use the fast path.
5. Set `VITE_BUILD_HASH=v1`, rebuild, preview, then change to `v2` and confirm preload state clears on first load.

### What to inspect

| Signal | Expected result |
| --- | --- |
| `localStorage['app-preload-state']` | `preloadedSections` grows after navigation |
| Console logs | `cache-hit` on repeat visits to preloaded sections |
| Network tab | No duplicate CSS preload requests for the same section |
| `buildHash` | `null` in dev unless `VITE_BUILD_HASH` is set; updates on deploy in prod |
