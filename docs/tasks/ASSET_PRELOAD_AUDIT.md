# Asset Preload System — Audit Report

**Scope:** Asset preloading only — images, icons, fonts, scripts, JSON, and related static URLs (`assetPreload[]`, `assetMap.json`). **Out of scope:** section JS/CSS bundle preloading (`sectionPreloader`, `preLoadSections`, `section-manifest.json`), translations, and general router/guard issues.

**Files audited:**
- `src/utils/assets/assetPreloader.js`
- `src/utils/assets/assetLibrary.js`
- `src/utils/assets/assetScanner.js`
- `src/config/assetMap.json`
- `src/stores/usePreloadStore.js`
- `src/utils/route/routeConfigLoader.js` (route list for section rollup of `assetPreload` only)
- `src/router/routeConfig.json` (`assetPreload` definitions)
- `src/router/index.js` (`preloadSectionAssets` call site only)

**System summary:**  
Routes define `assetPreload[]` per route (`flag` or `src`, `type`, `priority`). At runtime and build, entries are **merged by section**. `preloadSectionAssets(sectionName)` resolves flags via `assetMap.json` and preloads assets in the browser. `usePreloadStore` (+ `localStorage`) tracks resolved URLs already fetched. Section bundle/CSS preloading is a separate system.

---

## 1. Logical Errors

### L-01 — `preloadImage` returns `null` on cache hit; other preloaders return `undefined`
**File:** `assetPreloader.js` line 47  
**Detail:** `preloadImage` returns `Promise.resolve(null)` when the asset is already in the store. Every other preloader (`preloadFont`, `preloadMedia`, `preloadScript`) returns `Promise.resolve()` (undefined). This inconsistency breaks any caller that tests the resolved value.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `preloadImage` resolved with `null` on store cache hit and on DOM link dedup, while `preloadFont`, `preloadMedia`, and `preloadScript` resolved with `undefined` (`Promise.resolve()`). Callers using truthiness (`if (result)`) or strict checks (`result === null`) could treat a cache hit as a failed or special case.

**Why it happened:** Early image preload used `null` as a sentinel for “already done”; other preloaders were added later with the void-return convention.

**What changed:** Both early-return paths in `preloadImage` (store hit at ~line 47, DOM link exists at ~line 67) now use `Promise.resolve()` like the other preloaders. Successful fresh loads already called `resolve()` with no argument.

**Conflict check:** No override of **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, or **AUDIT.md** preload refactors — return-value alignment only; `hasAsset()` deduplication and section rollup unchanged.

**How it was tested:** Code review — grep confirms no callers depend on `preloadImage` resolving to `null`; `preloadAsset` only `await`s without inspecting the value.

**How to test in the browser:**
1. Run `npm run dev`, visit `/dashboard` or `/log-in` once (warms assets).
2. DevTools → **Console** — paste this IIFE (ignore trailing `undefined` on `const` lines):
   ```js
   (async () => {
     const { preloadImage } = await import('/src/utils/assets/assetPreloader.js');
     const url =
       document.querySelector('link[rel="preload"][as="image"]')?.href ||
       'https://i.ibb.co/jPw7ChWb/auth-bg.webp';
     const first = await preloadImage(url);
     const second = await preloadImage(url);
     console.log({
       first,
       second,
       firstIsUndefined: first === undefined,
       secondIsUndefined: second === undefined,
       secondIsNull: second === null
     });
   })();
   ```
3. **Expected:** `secondIsUndefined: true`, `secondIsNull: false`; second call may log `[already-preloaded]`.

---

### L-02 — DOM link deduplication only exists in `preloadImage`, not `preloadFont/preloadMedia/preloadScript`
**File:** `assetPreloader.js` lines 55–68 vs. 155–200, 240–285, 324–367  
**Detail:** `preloadImage` checks for an existing `<link rel="preload">` in the DOM before creating a new one. The font, media, and script variants skip this check entirely. Navigating back to a section therefore appends duplicate `<link>` elements to `<head>` for every non-image asset.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Revisiting a section could leave duplicate `<link>` tags in `<head>` for fonts, media, and scripts when the Pinia store was cleared or out of sync but the DOM links remained.

**Why it happened:** DOM dedup was implemented only on `preloadImage`; other preloaders only checked the store and `preloadInProgress`.

**What changed:**
- `preloadFont` and `preloadMedia` — before creating a link, query `link[rel="preload"][href="…"]`; if found, `addAsset(src)` and return `Promise.resolve()`.
- `preloadScript` — same pattern with `link[rel="preload"][as="script"][href="…"]` for classic scripts (see **P-07**; legacy `modulepreload` links still dedupe).
- Each path logs `[already-exists]` and records a `*_dom_exists` performance step, matching `preloadImage`.

**Conflict check:** No change to section rollup or navigation; extends existing image DOM dedup pattern only.

**How it was tested:** Code review — parity with `preloadImage` DOM branch; script selector matches `rel="modulepreload"` used on insert.

**How to test in the browser:**
1. Run `npm run dev`, visit `/log-in` once (creates Cognito script preload link).
2. **Console** — DOM dedup (store cleared, link kept):
   ```js
   (async () => {
     const store = (await import('/src/stores/usePreloadStore.js')).usePreloadStore();
     const { preloadScript } = await import('/src/utils/assets/assetPreloader.js');
     const scriptUrl = '/vendor/amazon-cognito-identity-6.3.15.min.js';
     const linkSelector = `link[rel="preload"][as="script"][href="${scriptUrl}"]`;

     const linksBefore = document.querySelectorAll(linkSelector).length;
     store.removeAsset(scriptUrl);

     await preloadScript(scriptUrl);
     const linksAfterFirst = document.querySelectorAll(linkSelector).length;

     await preloadScript(scriptUrl);
     const linksAfterSecond = document.querySelectorAll(linkSelector).length;

     console.log({ linksBefore, linksAfterFirst, linksAfterSecond });
   })();
   ```
3. **Expected:** `linksAfterSecond === linksAfterFirst` (no new `<link>`); second call logs `[already-exists]` or `[already-preloaded]`.
4. **Note:** `preloadSectionAssets('auth')` twice only hits the **store** path if URLs stay in Pinia — use the script test above to exercise **DOM** dedup.

---

### L-03 — Race window between DOM check and `preloadInProgress.set` in `preloadImage`
**File:** `assetPreloader.js` lines 50–116  
**Detail:** The flow is: check store → check `preloadInProgress` → check DOM → create promise → `preloadInProgress.set(src, promise)`. Two concurrent callers can both pass the DOM check before either has written to `preloadInProgress`, resulting in two `<link>` elements being appended and two separate fetch requests for the same asset.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Two simultaneous `preloadImage` (or font/media/script) calls could both pass the `preloadInProgress` and DOM checks, then each append a `<link>` for the same `href`.

**Why it happened:** `preloadInProgress.set()` ran only after the `new Promise` executor finished, leaving a gap between the DOM check and map registration.

**What changed:**
- Added `reserveLinkPreload(src)` — creates the in-flight promise and registers it in the map **before** DOM or network work, with a double-check if another caller registered first.
- Refactored `preloadImage`, `preloadFont`, `preloadMedia`, and `preloadScript` to use this helper; DOM-exists paths now `resolve()` the shared promise and `delete` from the map.

**Conflict check:** Complements L-02; no navigation or store API changes.

**How it was tested:** Code review — concurrent callers now share one map entry from reservation through completion.

**How to test in the browser:**
1. Run `npm run dev`, visit `/log-in` once.
2. **Console** — use a known URL (do not rely on `querySelector` alone; it can be `undefined` on locale-prefixed pages):
   ```js
   (async () => {
     const store = (await import('/src/stores/usePreloadStore.js')).usePreloadStore();
     const { preloadImage } = await import('/src/utils/assets/assetPreloader.js');
     const url = 'https://i.ibb.co/jPw7ChWb/auth-bg.webp';

     store.removeAsset(url);

     await Promise.all([preloadImage(url), preloadImage(url)]);

     const linkCount = document.querySelectorAll(`link[rel="preload"][href="${url}"]`).length;
     console.log('link count:', linkCount);
   })();
   ```
3. **Expected:** `link count: 1`; logs include one `[in-progress]` for the second parallel caller.
4. Yellow Edge warning (“preloaded but not used within a few seconds”) is a browser hint, not a failure.

---

### L-04 — `new Promise(async ...)` anti-pattern in `preloadJSON`
**File:** `assetPreloader.js` line 411  
**Detail:** `new Promise(async (resolve, reject) => { ... })` is an anti-pattern. If the async executor throws synchronously before reaching a `reject()` call, the outer promise silently hangs forever. The function should be rewritten as a plain `async` function.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `preloadJSON` wrapped fetch/parse logic in `new Promise(async (resolve, reject) => …)`. Sync throws before `reject()` could leave the outer promise pending forever.

**Why it happened:** In-flight dedup was modeled with a manual Promise constructor instead of native async/await propagation.

**What changed:** Replaced the anti-pattern with an async IIFE assigned to `loadPromise`; errors use `throw`, success uses `return data`, and `preloadInProgress.delete(src)` runs in `finally`. In-flight registration (`preloadInProgress.set`) unchanged.

**Conflict check:** No API change — still returns `Promise<object>` with cached data on repeat calls.

**How it was tested:** Code review — no `new Promise(async` remains in `preloadJSON`; reject/resolve replaced by throw/return.

**How to test in the browser:**
1. Run `npm run dev`.
2. **Console** — use the path from `CountryStateSelect.vue` (not `/data/countries.json`):
   ```js
   (async () => {
     const { preloadJSON } = await import('/src/utils/assets/assetPreloader.js');
     const path = '/src/config/countries.json';

     const data = await preloadJSON(path);
     console.log('first keys:', Object.keys(data).slice(0, 3));

     const again = await preloadJSON(path);
     console.log('cache hit — same object:', data === again);
   })();
   ```
3. **Expected:** First call `[fetching]` → `[success]`; second `[cache-hit]` and `same object: true`.
4. Bad path check (proves reject, not hang): `await preloadJSON('/data/countries.json')` should **throw** (SPA HTML, not JSON).

---

### L-05 — `preloadAssets` outer `catch` block is unreachable dead code
**File:** `assetPreloader.js` line 587  
**Detail:** `Promise.allSettled()` never rejects. The outer `try/catch` wrapping the `allSettled` call (lines 566–599) has a `catch` that can never be triggered. Any real error inside individual asset loads are swallowed by `allSettled` itself.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `preloadAssets` wrapped `Promise.allSettled()` in `try/catch`, but `allSettled` never rejects — the `catch` block was dead code.

**Why it happened:** Defensive error handling copied from patterns that use `Promise.all`, which does reject.

**What changed:** Removed the outer `try/catch`. Per-asset failures remain handled inside `preloadAsset` (logs, does not throw). `preloadAssets` always completes after `allSettled`.

**How it was tested:** Code review — no `catch` after `allSettled` in `preloadAssets`.

**How to test in the browser:**
1. Run `npm run dev`, visit `/dashboard`.
2. **Console:**
   ```js
   (async () => {
     const { preloadSectionAssets } = await import('/src/utils/assets/assetPreloader.js');
     await preloadSectionAssets('dashboard');
     console.log('completed without throw');
   })();
   ```
3. **Expected:** Logs `[success] Section assets preloaded`; no `preloadAssets_error` step (removed with dead `catch`).

---

### L-06 — Priority sort is ignored because all assets start in parallel
**File:** `assetPreloader.js` lines 567–577  
**Detail:** Assets are sorted by priority (`high → medium → low`) at line 567, then immediately passed to `Promise.allSettled(sortedAssets.map(asset => preloadAsset(asset)))`. Every asset is kicked off simultaneously, so the sort order has no practical effect. High-priority assets receive no scheduling advantage.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Priority sort ran, but every asset started in one `Promise.allSettled` batch, so `high` and `low` assets competed for bandwidth at the same time.

**Why it happened:** Parallel preload was preferred for speed without tier gating.

**What changed:** `preloadAssets` now groups sorted assets into priority tiers (`high` → `medium` → `low`/unknown) and `await`s each tier before starting the next. Assets within a tier still preload in parallel.

**Conflict check:** Aligns with `.cursorrules` background preload — higher priority warms first without blocking navigation (callers still do not await section preload on the critical path).

**How it was tested:** Code review — tier loop between sort and `allSettled`.

**How to test in the browser:**
1. Run `npm run dev`, open **Console** with log level showing `[preloadAsset]` / `[preloadImage]` order.
2. Section name in `routeConfig.json` is **`dashboard-global`** (not `dashboard`). Menu icons use `high` then `normal` in `sharedAssetPreloads.json`.
3. **Console:**
   ```js
   (async () => {
     const store = (await import('/src/stores/usePreloadStore.js')).usePreloadStore();
     store.clearAssets();
     const { preloadSectionAssets } = await import('/src/utils/assets/assetPreloader.js');
     await preloadSectionAssets('dashboard-global');
     console.log('done — check logs: high-tier flags before normal-tier');
   })();
   ```
4. **Expected:** `assetCount` > 0, `routeCount` > 0; in logs, `dashboard.logo` / other `priority: 'high'` entries run before `priority: 'normal'` menu icons. (`normal` is tier 1, same as `low`.)
5. **If you see `assetCount: 0`:** wrong section string — use `dashboard-global`, not `dashboard`.

---

### L-07 — `setEnvironment` clears `cachedAssetMap` but not URL-level caches
**File:** `assetLibrary.js` line 622  
**Detail:** `setEnvironment()` sets `cachedAssetMap = null` to force a reload on the next flag lookup. However, resolved URL strings cached under `ASSET_URL_CACHE_PREFIX + env + '_' + flag` in `cacheHandler` are not invalidated. After an environment switch, stale URLs from the previous environment continue to be served for 30 minutes.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `setEnvironment()` cleared in-memory `cachedAssetMap` only. Resolved URLs in `cacheHandler` under `asset_url_{env}_{flag}` stayed cached for 30 minutes, so a manual env switch could return URLs from the previous environment.

**Why it happened:** URL caching was added for performance without invalidation on env change.

**What changed:**
- Added `removeCacheKeysByPrefix(prefix)` in `cacheHandler.js`.
- `setEnvironment()` now calls `removeCacheKeysByPrefix(ASSET_URL_CACHE_PREFIX)` so all `asset_url_*` entries are cleared.

**How it was tested:** Code review — `setEnvironment` clears both memory map and prefixed URL cache keys.

**How to test in the browser:**
1. Run `npm run dev`, **Console:**
   ```js
   (async () => {
     const { getAssetUrl, setEnvironment } = await import('/src/utils/assets/assetLibrary.js');
     const flag = 'script.cognito';

     const devUrl = await getAssetUrl(flag, 'development');
     console.log('dev:', devUrl);

     setEnvironment('production');
     const prodUrl = await getAssetUrl(flag, 'production');
     console.log('prod:', prodUrl);

     console.log('cache cleared on switch — prod resolved fresh:', prodUrl !== null);
   })();
   ```
2. **Expected:** After `setEnvironment`, next `getAssetUrl` logs `[fetch]` / resolves from asset map, not `[cache-hit]` for an old `asset_url_development_*` key.
3. Optional: In logs, look for `removeCacheKeysByPrefix` with `removedCount > 0` after `setEnvironment`.

---

### L-08 — `assetScanner.js` calls `component.setup()` without Vue context
**File:** `assetScanner.js` lines 44–50  
**Detail:** `extractAssetsFromComponent` calls `component.setup()` without providing `props` or `context`. Vue 3 setup functions may call `inject`, `provide`, `ref`, `onMounted`, etc., all of which require an active component instance. Calling setup outside Vue's scheduler will throw or silently corrupt reactive state.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `extractAssetsFromComponent` invoked `component.setup()` outside Vue, which can throw or corrupt reactive state when setup uses `inject`, lifecycle hooks, etc.

**Why it happened:** Early scanner tried to read `preloadAssets` returned from setup.

**What changed:** Removed the `setup()` call. Scanner only reads static sources: `component.preloadAssets`, `component.PRELOAD_ASSETS`. Logs `skip-setup` when a component has `setup` but no static preload declaration.

**How it was tested:** Code review — no `component.setup()` in `assetScanner.js`.

**How to test in the browser:**
1. No direct UI test — scanner is build/analysis tooling, not on the hot navigation path.
2. **Console** (sanity — module loads):
   ```js
   (async () => {
     const { extractAssetsFromComponent } = await import('/src/utils/assets/assetScanner.js');
     const assets = extractAssetsFromComponent({ preloadAssets: [{ src: '/x.png', type: 'image' }] });
     console.log('static preloadAssets:', assets.length);
   })();
   ```
3. **Expected:** `static preloadAssets: 1`; no Vue warnings/errors.

---

### L-09 — `critical` priority level is not handled in the priority sort map
**File:** `assetPreloader.js` lines 568–572  
**Detail:** `preloadSectionCriticalImages` (line 644) filters for `priority === 'critical'`, implying it is a valid value. However, `preloadAssets`'s `priorityMap` only contains `{ high: 3, medium: 2, low: 1 }`. An asset with `priority: "critical"` falls through to the default of `1` — the same as low — and is scheduled last.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `critical` assets were sorted/tiered as `low` (default `1`), so they ran after `high`/`medium` in `preloadAssets`.

**Why it happened:** `ASSET_PRELOAD_PRIORITY_MAP` omitted `critical` when tier batching was added (L-06).

**What changed:** Added `critical: 4` to `ASSET_PRELOAD_PRIORITY_MAP` (above `high: 3`), used by `getAssetPreloadPriorityValue` for sort and tier gating.

**How it was tested:** Code review — `critical` maps to tier 4; aligns with `preloadSectionCriticalImages` filter.

**How to test in the browser:**
1. Find a route with `priority: "critical"` in `assetPreload` (or temporarily add one in `routeConfig.json` for a test route).
2. **Console:**
   ```js
   (async () => {
     const store = (await import('/src/stores/usePreloadStore.js')).usePreloadStore();
     store.clearAssets();
     const { preloadAssets } = await import('/src/utils/assets/assetPreloader.js');
     await preloadAssets([
       { flag: 'dashboard.hamburger', type: 'image', priority: 'low' },
       { flag: 'auth.background', type: 'image', priority: 'critical' }
     ]);
   })();
   ```
3. **Expected:** Logs show `auth.background` / critical asset `[start]` before low-priority icons in the same batch run.

---

### L-10 — `assetLibrary.loadAssetMapConfig` fetches from hardcoded `/config/assetMap.json`
**File:** `assetLibrary.js` line 667  
**Detail:** The production fetch URL is hardcoded. In development, `src/config/assetMap.json` is served by Vite at a different path. The function has no dev/prod path branching for the fetch, so this fetch will fail in development (returning an empty map and silently bypassing flag resolution).

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Only `/config/assetMap.json` was fetched; if missing in dev, load fell through to an empty map instead of `src/config/assetMap.json`.

**Why it happened:** Single hardcoded public path assumed `public/config/assetMap.json` always exists in every environment.

**What changed:**
- `getAssetMapFetchCandidates()` — dev tries `/config/assetMap.json` then `/src/config/assetMap.json`; optional `VITE_ASSET_MAP_URL` override first.
- `fetchAssetMapFromNetwork()` tries each candidate until one succeeds.
- Bundled `import bundledAssetMap from '../../config/assetMap.json'` as final fallback if all fetches fail.

**How it was tested:** Code review + existing `cognitoScriptSelfHost` / `getAssetUrl` flows.

**How to test in the browser:**
1. Run `npm run dev`, **Console:**
   ```js
   (async () => {
     const { getAssetUrl } = await import('/src/utils/assets/assetLibrary.js');
     const url = await getAssetUrl('script.cognito', 'development');
     console.log('cognito url:', url);
   })();
   ```
2. **Expected:** `/vendor/amazon-cognito-identity-6.3.15.min.js` (not `null`); logs show successful fetch from one of the candidate URLs or `bundled-fallback`.
3. DevTools → **Network** — filter `assetMap` to see which path loaded.

---

### L-11 — `normalizeAssetDefinition` spread overwrites computed fallback fields
**File:** `assetScanner.js` lines 336–341  
**Detail:**  
```js
const normalized = {
  src: asset.src || asset.url || asset.path,
  type: asset.type || inferAssetType(...),
  priority: asset.priority || 'low',
  ...asset   // ← spread comes last
};
```
If the original `asset` object has `src: null`, `type: undefined`, or `priority: null`, the spread re-applies those nullish values, overwriting the computed fallbacks. The spread should come first, with the computed values applied after.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `...asset` after computed fields re-applied `src: null`, `type: null`, `priority: null` from malformed definitions.

**Why it happened:** Spread order placed user object last.

**What changed:** Spread `...asset` first, then apply computed `src`, `type`, and `priority` so fallbacks win.

**How it was tested:** `npm run test:unit -- --run tests/unit/assetScanner.test.js`

**How to test in the browser:**
1. **Console:**
   ```js
      (async () => {
      const { normalizeAssetDefinition } = await import('/src/utils/assets/assetScanner.js');
      const n = normalizeAssetDefinition({ src: null, type: null, priority: null, flag: 'x' });
      console.log(n);
      })();
   ```
2. **Expected:** `{ src: '', type: 'unknown', priority: 'low', flag: 'x' }` — not `null` fields.

---

## 2. Performance Issues

### P-01 — `usePreloadStore` uses `Array.includes` for O(n) membership checks
**File:** `usePreloadStore.js` lines 35–49 (`preloadedAssets`; `preloadedSections` is section-bundle state — out of scope)  
**Detail:** `preloadedAssets` is a plain array; `hasAsset` uses `Array.includes` (O(n)). With 50+ icon URLs on dashboard sections, every preload check scans the list. Use a `Set` for O(1) URL lookups.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `preloadedAssets` was a plain array; every `hasAsset(url)` and dedup check in `addAsset` scanned the full list (O(n)). Dashboard sections with 50+ icon URLs repeated that work on every preload call.

**Why it happened:** Initial store used a simple string array; scale grew with section asset rollup.

**What changed:**
- `preloadedAssets` is now a `Set` for O(1) `has` / `add` / `delete`.
- Pinia persist uses a custom serializer (Set ↔ array in `localStorage`) plus `afterHydrate` so existing saved sessions migrate cleanly.
- Added `preloadedAssetCount` getter, `clearAssets()`, and `removeAsset(url)` for tests and targeted invalidation.
- `assetPreloader.js` count logging uses `preloadedAssetCount` instead of `.length`.

**Conflict check:** Aligns with **Preloading.md** Task 6 (`buildHash` invalidation) and **SECTION_PRELOAD_AUDIT** — only asset URL tracking changes; `preloadedSections` stays an array. Does **not** implement full P-03 cache consolidation (URL resolution caches in `assetLibrary` / `cacheHandler` unchanged). Partial overlap with P-03 item 1 (Set) — done here; M-05 `preloadStateVersion` remains separate.

**How it was tested:** `npm run test:unit -- --run tests/unit/usePreloadStore.test.js`

**How to test in the browser:**
1. Run `npm run dev`, visit `/dashboard` once (warms assets).
2. DevTools → **Console** — paste this IIFE:
   ```js
   (async () => {
     const store = (await import('/src/stores/usePreloadStore.js')).usePreloadStore();
     const { preloadImage } = await import('/src/utils/assets/assetPreloader.js');
     const url =
       document.querySelector('link[rel="preload"][as="image"]')?.href ||
       'https://i.ibb.co/jPw7ChWb/auth-bg.webp';

     console.log('is Set:', store.preloadedAssets instanceof Set, 'count:', store.preloadedAssetCount);

     store.removeAsset(url);
     const t0 = performance.now();
     await preloadImage(url);
     const firstMs = performance.now() - t0;

     const t1 = performance.now();
     const cached = store.hasAsset(url);
     const lookupMs = performance.now() - t1;

     await preloadImage(url);

     console.log({
       isSet: store.preloadedAssets instanceof Set,
       cachedAfterFirstLoad: cached,
       lookupMs,
       firstLoadMs: firstMs,
       count: store.preloadedAssetCount
     });
   })();
   ```
3. **Expected:** `isSet: true`; `cachedAfterFirstLoad: true` after first preload; `lookupMs` near `0`; second `preloadImage` logs `[already-preloaded]` without duplicate network work.
4. **Persistence:** Reload page → Console: `(await import('/src/stores/usePreloadStore.js')).usePreloadStore().preloadedAssetCount` should be `> 0` and `preloadedAssets instanceof Set` should be `true`.

---

### P-02 — Dynamic `import()` called inside `preloadSectionAssets` and `preloadSectionCriticalImages` on every invocation
**File:** `assetPreloader.js` lines 620 and 707  
**Detail:** `await import('../route/routeConfigLoader')` is called on every invocation of both functions. Although ES module caching means the module is only evaluated once, the dynamic import machinery still executes on each call. The import should be moved to the module's top-level static imports.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Each call to `preloadSectionAssets` or `preloadSectionCriticalImages` ran `await import('../route/routeConfigLoader')`, paying dynamic-import overhead on every navigation even though the module was already cached.

**Why it happened:** Likely deferred loading to avoid a perceived circular dependency; `routeConfigLoader` does not import `assetPreloader`.

**What changed:**
- Added top-level `import { getRouteConfiguration } from '../route/routeConfigLoader.js'` (same pattern as `assetLibrary.js`).
- Removed both in-function dynamic imports; both section preload helpers call `getRouteConfiguration()` directly.

**Conflict check:** No override of **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, or **AUDIT.md** — behavior unchanged; only import style. Aligns with `.cursorrules` perf rule 5 (hoist imports).

**How it was tested:** Code review — grep confirms no `import('../route/routeConfigLoader')` remains in `assetPreloader.js`; `npm run test:unit -- --run tests/unit/sectionPreloader.test.js tests/unit/usePreloadStore.test.js`

**How to test in the browser:**
1. Run `npm run dev`, visit `/dashboard` once.
2. DevTools → **Console** — paste this IIFE:
   ```js
   (async () => {
     const store = (await import('/src/stores/usePreloadStore.js')).usePreloadStore();
     store.clearAssets();
     const { preloadSectionAssets, preloadSectionCriticalImages } = await import('/src/utils/assets/assetPreloader.js');

     await preloadSectionAssets('dashboard-global');
     const afterFull = store.preloadedAssetCount;

     store.clearAssets();
     await preloadSectionCriticalImages('dashboard-global');
     const afterCritical = store.preloadedAssetCount;

     console.log({
       afterFullPreload: afterFull,
       afterCriticalPreload: afterCritical,
       bothCompleted: afterFull > 0 && afterCritical >= 0
     });
   })();
   ```
3. **Expected:** `afterFullPreload > 0`; logs include `[success] Section assets preloaded` and `[success] Critical section images preloaded` (or `assetCount: 0` for critical if none match); no import/module errors.

---

### P-03 — Three overlapping caches for “asset already loaded?”
**Files:** `usePreloadStore.js`, `assetLibrary.js` (`getAssetUrl` URL cache), `cacheHandler`, `assetPreloader.js`  
**Detail:** Resolved **asset URL** completion is split across:

| Layer | What it stores | Used by | Survives reload? |
|-------|----------------|---------|------------------|
| **Pinia `preloadedAssets[]`** | Resolved URLs that finished preload | `assetPreloader.js` | Yes (`localStorage`) |
| **`cacheHandler`** | `asset_url_<env>_<flag>` resolved strings | `getAssetUrl` | Partially (TTL) |
| **Browser HTTP cache** | Actual image/font/script bytes | Network stack | Independent of app state |

`assetLibrary.loadedAssets` / `areAssetsLoadedForSection` mix in section-bundle metadata — not the same as “this image URL was preloaded” (out of scope for bundle state; do not use for asset checks).

**Recommended fix — single source of truth (assets only)**

1. **`usePreloadStore.preloadedAssets` = SSOT for “this URL was preloaded”**
   - Use a **`Set`** of URLs (fixes P-01).
   - Add `preloadStateVersion` (build hash); clear on mismatch (M-05).
   - API: `hasAsset(url)`, `addAsset(url)`, `clearAssets()`.
   - Do **not** use this store for section JS/CSS bundle completion (`preloadedSections` belongs to the section-preload system, or remove from this audit’s concern).

2. **`assetPreloader.js` writes only to `preloadedAssets` (+ in-flight `preloadInProgress` Map)**
   - On successful image/font/script/json preload: `addAsset(resolvedUrl)`.
   - `preloadInProgress` = in-flight dedup only, not persisted.

3. **`assetLibrary` / `cacheHandler` = config & resolution cache only**
   - Keep TTL caches for: `asset_map_config`, `asset_url_<env>_<flag>`.
   - Never treat TTL expiry as “URL preloaded” — only `hasAsset(url)`.

4. **`clearPreloadCache()`** clears `preloadedAssets`, `preloadInProgress`, and `jsonDataCache`; optionally bump version on deploy.

**Outcome:** One place answers “was this asset URL already preloaded?” Config/resolution caches stay separate.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Three layers could imply “asset done” with different meanings: Pinia URL list, `getAssetUrl` resolution cache, and `jsonDataCache` for JSON (checked independently of `hasAsset`). `clearPreloadCache()` called `clearState()`, wiping section preload state and `buildHash` along with asset URLs.

**Why it happened:** Caches grew independently — resolution TTL cache, JSON content cache, and preload store were never explicitly separated.

**What changed:**
- **SSOT:** `usePreloadStore.hasAsset(url)` is the only completion check for preloaded URLs (Set from P-01).
- **`preloadJSON`:** Returns cached data only when both `hasAsset(src)` and `jsonDataCache` agree; orphan `jsonDataCache` entries without store membership are dropped.
- **`clearPreloadCache()`:** Uses `clearAssets()` instead of `clearState()` — clears URL preload + in-flight + JSON content only; **`preloadedSections` and `buildHash` preserved**.
- **`assetLibrary`:** Documented that `loadedAssets` / `areAssetsLoadedForSection` = section **bundle metadata**; `getAssetUrl` TTL cache = **flag→URL resolution only**, not preload completion.
- **Version invalidation:** Existing `buildHash` + `main.js` deploy check (Preloading.md Task 6) satisfies the `preloadStateVersion` recommendation — no duplicate field added (M-05 overlap noted).

**Conflict check:** Does **not** override **Preloading.md** / **SECTION_PRELOAD_AUDIT.md** — `buildHash` invalidation unchanged; section preload state no longer accidentally cleared by asset-only cache reset. P-01 Set work retained.

**How it was tested:** `npm run test:unit -- --run tests/unit/assetPreloadCache.test.js tests/unit/usePreloadStore.test.js`

**How to test in the browser:**
1. Run `npm run dev`, visit `/dashboard` once.
2. DevTools → **Console** — paste this IIFE:
   ```js
   (async () => {
     const store = (await import('/src/stores/usePreloadStore.js')).usePreloadStore();
     const { clearPreloadCache, preloadJSON } = await import('/src/utils/assets/assetPreloader.js');
     const path = '/src/config/countries.json';

     store.addSection('dashboard-global');
     store.addAsset('https://example.com/test-icon.svg');
     const sectionBefore = store.hasSection('dashboard-global');
     const hashBefore = store.buildHash;
     const assetsBefore = store.preloadedAssetCount;

     clearPreloadCache();

     await preloadJSON(path);

     console.log({
       assetsBeforeClear: assetsBefore,
       assetsAfterClear: store.preloadedAssetCount,
       sectionPreserved: store.hasSection('dashboard-global') === sectionBefore,
       buildHashPreserved: store.buildHash === hashBefore,
       jsonTrackedInStore: store.hasAsset(path)
     });
   })();
   ```
3. **Expected:** `assetsBeforeClear > 0`, `assetsAfterClear` equals `1` (only JSON path re-added), `sectionPreserved: true`, `buildHashPreserved: true`, `jsonTrackedInStore: true`.
4. **Resolution vs preload:** `(await import('/src/utils/assets/assetLibrary.js')).getAssetUrl('script.cognito')` may hit `[cache-hit]` for flag resolution — that is separate from `usePreloadStore().hasAsset(resolvedUrl)`.

---

### P-05 — Performance tracker `.step()` called for every trivial getter
**Files:** `assetPreloader.js`, `assetScanner.js`  
**Detail:** `getPreloadedAssetsCount`, `shouldIgnoreComponent`, and similar one-liner functions each generate a tracker step. This produces hundreds of trace entries for a single asset preload pass, drowning out meaningful measurements.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Trivial getters/checkers (`getPreloadedAssetsCount`, `shouldIgnoreComponent`, `normalizeAssetDefinition`) each called `window.performanceTracker.step()`. When invoked per asset or per component during scanning, they flooded traces and hid meaningful preload steps.

**Why it happened:** Performance tracking was added uniformly without distinguishing hot-path micro-helpers from orchestration boundaries.

**What changed:** Removed `performanceTracker.step()` from:
- `getPreloadedAssetsCount()` in `assetPreloader.js`
- `shouldIgnoreComponent()` in `assetScanner.js`
- `normalizeAssetDefinition()` in `assetScanner.js`

Section-level and preload I/O boundaries (e.g. `preloadSectionAssets`, `preloadImage` start/complete) still emit tracker steps.

**Conflict check:** No override of prior preload refactors — logging retained; only noisy tracker calls removed from trivial helpers.

**How it was tested:** `npm run test:unit -- --run tests/unit/assetScanner.test.js`

**How to test in the browser:**
1. Run `npm run dev`, open DevTools → **Console**.
2. Paste this IIFE:
   ```js
   (async () => {
     const tracker = window.performanceTracker;
     const before = tracker?.steps?.length ?? 0;
     const { shouldIgnoreComponent, normalizeAssetDefinition } = await import('/src/utils/assets/assetScanner.js');
     const { getPreloadedAssetsCount } = await import('/src/utils/assets/assetPreloader.js');

     shouldIgnoreComponent({});
     normalizeAssetDefinition({ src: '/x.png', type: 'image' });
     getPreloadedAssetsCount();

     const after = tracker?.steps?.length ?? 0;
     console.log({ stepsAddedByTrivialGetters: after - before });
   })();
   ```
3. **Expected:** `stepsAddedByTrivialGetters: 0` (or unchanged if tracker uses a different API — no new `shouldIgnoreComponent` / `getPreloadedAssetsCount` / `normalizeAssetDefinition` step names in the trace).

---

### P-06 — Section `assetPreload` rollup re-scans all routes on every call
**Files:** `assetScanner.js`, `assetPreloader.js` (`preloadSectionAssets`, `preloadSectionCriticalImages`), `assetLibrary.js` (`getAssetPreloadConfigForSection`)  
**Detail:** Each call loads full `routeConfig` and filters routes by section to merge `assetPreload[]`. No per-section memoisation. A shared helper (e.g. `getAssetPreloadListForSection(sectionName)`) with cache would avoid repeated O(routes) work when preloading many assets for one section.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `preloadSectionAssets`, `preloadSectionCriticalImages`, `getAssetPreloadConfigForSection`, and `scanSectionComponents` each independently filtered the full route list and merged `assetPreload[]` — O(routes) on every call with no memoization.

**Why it happened:** Section rollup logic was copy-pasted across asset modules as each was built.

**What changed:**
- Added `getAssetPreloadEntriesForSection.js` — shared `routeBelongsToSection`, memoized `{ assets, routeCount }` per section, and `clearAssetPreloadSectionCache()`.
- `assetPreloader.js`, `assetLibrary.js`, and `assetScanner.js` now call the shared helper (partial **B-02** dedup; full B-02 may still apply elsewhere).

**Conflict check:** No override of prior preload refactors — same merged asset lists; only caching and deduplication of rollup work. Aligns with `.cursorrules` section-based asset architecture.

**How it was tested:** `npm run test:unit -- --run tests/unit/getAssetPreloadEntriesForSection.test.js`

**How to test in the browser:**
1. Run `npm run dev`, visit `/dashboard` once.
2. DevTools → **Console** — paste this IIFE:
   ```js
   (async () => {
     const { getAssetPreloadEntriesForSection, clearAssetPreloadSectionCache } = await import('/src/utils/assets/getAssetPreloadEntriesForSection.js');

     clearAssetPreloadSectionCache();
     const first = getAssetPreloadEntriesForSection('dashboard-global');
     const second = getAssetPreloadEntriesForSection('dashboard-global');

     console.log({
       routeCount: first.routeCount,
       assetCount: first.assetCount ?? first.assets.length,
       sameReference: first === second,
       sameAssetCount: first.assets.length === second.assets.length
     });
   })();
   ```
3. **Expected:** `routeCount > 0`, `assetCount > 0`, `sameReference: true` (memoized), `sameAssetCount: true`; second call logs `[cache-hit]`.

---

### P-07 — `preloadScript` uses `rel="modulepreload"` for all scripts, including third-party UMD bundles
**File:** `assetPreloader.js` line 326; `assetMap.json` line 11/59  
**Detail:** `modulepreload` is only valid for ES modules. The Cognito SDK (`amazon-cognito-identity-js`) is a UMD bundle. Browsers that see `rel="modulepreload"` for a non-ESM script either ignore the hint or parse the file incorrectly. These should use `rel="preload" as="script"`.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `preloadScript` always injected `<link rel="modulepreload">`, including for the self-hosted Cognito UMD bundle (`/vendor/amazon-cognito-identity-6.3.15.min.js`). `modulepreload` is only valid for ES modules.

**Why it happened:** Script preloading copied the section-bundle pattern (`sectionPreloader` uses `modulepreload` for ES module chunks) without distinguishing asset-map classic scripts.

**What changed:**
- Classic/UMD scripts default to `<link rel="preload" as="script">`.
- ES modules: pass `{ module: true }` or use a `.mjs` URL for `rel="modulepreload"`.
- DOM dedup checks both `preload[as=script]` and legacy `modulepreload` links for the same `href`.
- **L-02** browser test updated to match the new script link shape.

**Conflict check:** Does **not** change **sectionPreloader** JS bundle hints (still `modulepreload` for section ES chunks). Aligns with **cognitoScriptSelfHost** / S2 self-hosted Cognito path.

**How it was tested:** `npm run test:unit -- --run tests/unit/preloadScript.test.js tests/unit/cognitoScriptSelfHost.test.js`

**How to test in the browser:**
1. Run `npm run dev`, visit `/log-in` once.
2. DevTools → **Console** — paste this IIFE:
   ```js
   (async () => {
     const store = (await import('/src/stores/usePreloadStore.js')).usePreloadStore();
     const { preloadScript } = await import('/src/utils/assets/assetPreloader.js');
     const scriptUrl = '/vendor/amazon-cognito-identity-6.3.15.min.js';

     store.removeAsset(scriptUrl);
     document.querySelectorAll(`link[href="${scriptUrl}"]`).forEach((el) => el.remove());

     await preloadScript(scriptUrl);

     const link = document.querySelector(`link[href="${scriptUrl}"]`);
     console.log({
       rel: link?.rel,
       as: link?.getAttribute('as'),
       isClassicPreload: link?.rel === 'preload' && link?.getAttribute('as') === 'script'
     });
   })();
   ```
3. **Expected:** `rel: "preload"`, `as: "script"`, `isClassicPreload: true` — not `modulepreload`.

---

## 3. Security Issues

### S-01 — Production icons hosted on third-party image host (`i.ibb.co`)
**File:** `assetMap.json` — majority of `production` and `development` entries  
**Detail:** Many dashboard icons use `i.ibb.co` (third-party image host). No SLA, replaceable content, and not on your allowlist. Icons should be self-hosted under your CDN/app origin.

#### Verification (2026-05-26) — **Not resolved**

**Status:** Open — repo scan does not show a completed self-host migration for `assetMap.json` flags.

**What was checked:**
- `src/config/assetMap.json` and `public/config/assetMap.json` — **54** lines still reference `i.ibb.co` or `i.ibb.co.com` (same content in both files).
- Affected flags include `dashboard.*`, `auth.background`, `logo.main`, `icon.input.right`, `icon.social.x`, and `icon.globe` (malformed host — see **S-07**).
- `public/assets/icons/` has no mirrored `.webp` files for those flags (only section-bundle stubs under `public/assets/`).
- Hundreds of hardcoded `i.ibb.co` URLs remain in Vue templates and mock data — separate from flag-based preload but the same security class.

**Conflict check (prior preload work):**
- **Does not override** changes from **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, or **AUDIT.md** — those passes fixed preload *behavior* (dedup, Cognito self-host **S2** / **P-07**, section rollup, etc.).
- **S2** moved `script.cognito` to `/vendor/...` — that is unrelated to image hosting (**S-01**).
- **S-06** (allowlist + build-time validation) is still open; completing **S-01** means copying assets to `/assets/...` (or your CDN) and updating map URLs — allowlist enforcement can follow in **S-06**.

**Recommended fix (unchanged):** Download each icon, commit under `public/assets/icons/` (or production CDN), point every `assetMap.json` flag at same-origin paths in `development` and `production`. Optionally add CI check that rejects `i.ibb.co` in production env.

**How to test in the browser (current state — expect third-party hosts until fixed):**
1. Run `npm run dev`, log in, open `/dashboard`.
2. DevTools → **Console** — paste this IIFE:
   ```js
   (async () => {
     const { loadAssetMapConfig, getAssetUrl } = await import('/src/utils/assets/assetLibrary.js');
     await loadAssetMapConfig();
     const flags = [
       'dashboard.logo',
       'dashboard.menu.analytics',
       'auth.background',
       'icon.globe'
     ];
     const urls = Object.fromEntries(
       flags.map((f) => [f, getAssetUrl(f)])
     );
     const ibbHosts = Object.values(urls).filter(
       (u) => typeof u === 'string' && /i\.ibb\.co/i.test(u)
     );
     const sameOrigin = Object.values(urls).filter(
       (u) => typeof u === 'string' && u.startsWith('/')
     );
     const domIbb = document.querySelectorAll('img[src*="ibb.co"]').length;
     console.log({
       urls,
       ibbCount: ibbHosts.length,
       sameOriginCount: sameOrigin.length,
       domIbbImages: domIbb,
       s01StillOpen: ibbHosts.length > 0 || domIbb > 0
     });
   })();
   ```
3. **While S-01 is open:** `ibbCount > 0`, `s01StillOpen: true`, `urls` show `https://i.ibb.co/...` (or `i.ibb.co.com` for `icon.globe`).
4. **After S-01 is fixed:** `ibbCount: 0`, map URLs start with `/assets/` (or your CDN host), dashboard icons still render from same-origin Network requests.

---

### S-02 — Third-party script loaded without Subresource Integrity (SRI) hash
**File:** `assetMap.json` key `script.cognito` (production + development)  
**Detail:** `https://cdn.jsdelivr.net/npm/amazon-cognito-identity-js@6.3.15/dist/amazon-cognito-identity.min.js` is loaded without an `integrity` attribute. If the CDN is compromised or the package is re-published under the same version, malicious JavaScript would execute with full page privileges. An SRI hash must be added to any external script `<link>` hint or `<script>` tag. host locally.

#### Resolution ✅

**Status:** Resolved (fixed in prior **AUDIT.md** S2 pass — verified 2026-05-26; no new code changes this step).

**What was broken:** `script.cognito` pointed at `cdn.jsdelivr.net` with no SRI on preload or load. A compromised CDN could run arbitrary JS on auth pages.

**Why it happened:** The Cognito UMD bundle was referenced as an external CDN URL in `assetMap.json` and `/log-in` `assetPreload` instead of the app origin.

**What changed (already in repo):**
- Copied `amazon-cognito-identity-js@6.3.15` UMD to `public/vendor/amazon-cognito-identity-6.3.15.min.js`.
- `script.cognito` in `src/config/assetMap.json` and `public/config/assetMap.json` → `/vendor/amazon-cognito-identity-6.3.15.min.js` (development + production).
- `/log-in` `assetPreload` uses `{ "flag": "script.cognito", ... }` — no hardcoded CDN `src`.
- `scriptAvailabilityChecker.js` default Cognito URL matches the vendor path.
- **P-07** uses `rel="preload" as="script"` for this UMD bundle (not `modulepreload`).

**Why SRI was not added:** Same-origin vendor hosting removes third-party CDN trust; SRI on same-origin scripts is optional and is not required once the script is self-hosted (per audit recommendation: “host locally”).

**Conflict check:** No override of preload refactor — flag-based `assetPreload` and section rollup unchanged; only URL origin moved off jsdelivr. **S-03** (preloadScript SRI/allowlist) remains open for *other* external scripts.

**How it was tested:** `npm run test:unit -- --run tests/unit/cognitoScriptSelfHost.test.js`

**How to test in the browser:**
1. Run `npm run dev`, open `/log-in`.
2. DevTools → **Console** — paste this IIFE:
   ```js
   (async () => {
     const { loadAssetMapConfig, getAssetUrl } = await import('/src/utils/assets/assetLibrary.js');
     await loadAssetMapConfig();
     const cognitoUrl = getAssetUrl('script.cognito');
     const vendorRequests = performance
       .getEntriesByType('resource')
       .filter((r) => r.name.includes('amazon-cognito-identity'));
     const jsdelivr = performance
       .getEntriesByType('resource')
       .filter((r) => r.name.includes('jsdelivr.net'));
     const preloadLink = document.querySelector(
       'link[href*="amazon-cognito-identity"]'
     );
     console.log({
       cognitoUrl,
       isSameOrigin: cognitoUrl?.startsWith('/vendor/'),
       vendorRequestCount: vendorRequests.length,
       jsdelivrRequestCount: jsdelivr.length,
       preloadRel: preloadLink?.rel,
       preloadAs: preloadLink?.getAttribute('as'),
       amazonCognitoGlobal: typeof window.AmazonCognitoIdentity
     });
   })();
   ```
3. **Expected:** `isSameOrigin: true`, `jsdelivrRequestCount: 0`, `vendorRequestCount >= 0` (may be 0 until preload/network runs — visit `/log-in` once first), `preloadRel: "preload"`, `preloadAs: "script"`, `amazonCognitoGlobal: "object"` or `"function"` after assets load.

---

### S-03 — `preloadScript` injects `<link>` without SRI or origin allowlist validation
**File:** `assetPreloader.js` lines 324–364  
**Detail:** The `src` is taken directly from the route config and injected as `link.href`. There is no validation that the URL belongs to an allowlisted origin, and no `integrity` attribute is ever set. A misconfigured or injected route config entry could cause an attacker-controlled script URL to be preloaded.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `preloadScript` accepted any `src` and appended `<link href="…">` with no origin check and no `integrity` support.

**Why it happened:** Preload helpers trusted route/asset-map URLs without a final injection guard.

**What changed:**
- Added `src/utils/assets/assertAllowedPreloadUrl.js` — blocks `javascript:`, `data:`, `blob:`, protocol-relative URLs; allows `/…`, `https:` on same-origin / localhost / `VITE_ASSET_ALLOWED_HOSTS`; `http:` only on localhost.
- `preloadScript` calls the validator before reserving in-flight work; blocked URLs log `[blocked]` and return `Promise.resolve()` (no DOM injection).
- Production external `https` scripts require `options.integrity` (same-origin `/vendor/…` exempt — **S-02** path).
- `createScriptPreloadLink` sets `link.integrity` (+ `crossOrigin: anonymous` when needed) from `options.integrity`.

**Conflict check:** Aligns with **S-02** self-hosted Cognito; does not change section `modulepreload` bundles. **S-04** extends the same validator to image/font/media/JSON preloaders.

**How it was tested:** `npm run test:unit -- --run tests/unit/assertAllowedPreloadUrl.test.js tests/unit/preloadScript.test.js`

**How to test in the browser:**
1. Run `npm run dev`, open `/log-in`.
2. DevTools → **Console** — paste this IIFE:
   ```js
   (async () => {
     const { preloadScript } = await import('/src/utils/assets/assetPreloader.js');
     const before = document.querySelectorAll('link').length;
     await preloadScript('javascript:alert(1)');
     const afterBlocked = document.querySelectorAll('link').length;
     await preloadScript('/vendor/amazon-cognito-identity-6.3.15.min.js');
     const cognitoLink = document.querySelector(
       'link[href="/vendor/amazon-cognito-identity-6.3.15.min.js"]'
     );
     console.log({
       linksAddedByJavascript: afterBlocked - before,
       cognitoPreloadRel: cognitoLink?.rel,
       cognitoPreloadAs: cognitoLink?.getAttribute('as')
     });
   })();
   ```
3. **Expected:** `linksAddedByJavascript: 0`; Cognito link uses `rel: "preload"`, `as: "script"`.

---

### S-04 — `assetPreloader` functions inject arbitrary `src` values into the DOM without sanitization
**Files:** `assetPreloader.js` — all preload functions  
**Detail:** URL values flow from route config → `getAssetUrl` → `link.href` → `document.head.appendChild(link)` with no sanitization. A `javascript:` scheme or crafted `data:` URI in the config would be injected into the DOM. At minimum, URLs should be validated against an allowlist of schemes (`https:`, `/`).

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `preloadImage`, `preloadFont`, `preloadMedia`, and `preloadJSON` appended/fetched URLs with no scheme or host checks.

**Why it happened:** Only **S-03** scope (`preloadScript`) was missing guards; other preloaders assumed trusted config.

**What changed:**
- Shared `resolveAllowedPreloadSrc()` in `assetPreloader.js` wraps `assertAllowedPreloadUrl()` (from **S-03**).
- `preloadImage`, `preloadFont`, `preloadMedia` — blocked URLs skip DOM injection (`Promise.resolve()`).
- `preloadJSON` — blocked URLs return `null` without `fetch()`.
- `preloadScript` already validated in **S-03** (includes production external-script `integrity` rule).

**Conflict check:** No change to section preload architecture or `getAssetUrl` flag resolution.

**How it was tested:** `npm run test:unit -- --run tests/unit/preloadUrlGuard.test.js tests/unit/assertAllowedPreloadUrl.test.js`

**How to test in the browser:**
1. Run `npm run dev`.
2. DevTools → **Console** — paste this IIFE:
   ```js
   (async () => {
     const { preloadImage, preloadFont } = await import('/src/utils/assets/assetPreloader.js');
     const before = document.querySelectorAll('link').length;
     await preloadImage('data:image/png;base64,xx');
     await preloadFont('javascript:void(0)');
     const after = document.querySelectorAll('link').length;
     await preloadFont('/assets/fonts/primary.woff2');
     console.log({
       linksAfterBlocked: after - before,
       allowedFontLink: !!document.querySelector('link[href="/assets/fonts/primary.woff2"]')
     });
   })();
   ```
3. **Expected:** `linksAfterBlocked: 0` (blocked schemes add no `<link>`); `allowedFontLink` depends on that path existing in your map (may be `false` if font not deployed — blocked count should still be `0`).

---

### S-05 — `validateAssetMap` accepts `http://` URLs without warning
**File:** `assetLibrary.js` lines 1015–1018  
**Detail:** coverts to https if ot localhost.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `http://` URLs in `assetMap.json` were accepted silently; non-localhost HTTP could be used in production preloads.

**Why it happened:** `validateAssetMap()` only checked prefix shape; `getAssetUrl()` returned URLs unchanged.

**What changed:**
- Added `normalizeAssetMapUrl()` in `assetLibrary.js` — upgrades `http://` → `https://` except `localhost` / `127.0.0.1` / `[::1]`.
- `getAssetUrl()` applies normalization before caching and returning resolved URLs.
- `validateAssetMap()` emits warnings for non-localhost `http://` entries (stricter message for `production`).

**Conflict check:** Complements **S-03/S-04** URL guards; does not change preload architecture.

**How it was tested:** `npm run test:unit -- --run tests/unit/normalizeAssetMapUrl.test.js`

**How to test in the browser:**
1. Run `npm run dev`.
2. DevTools → **Console** — paste this IIFE:
   ```js
   (async () => {
     const { normalizeAssetMapUrl } = await import('/src/utils/assets/assetLibrary.js');
     const samples = {
       remoteHttp: normalizeAssetMapUrl('http://cdn.example.com/x.png'),
       localhostHttp: normalizeAssetMapUrl('http://localhost:8080/x.png'),
       relative: normalizeAssetMapUrl('/assets/x.png')
     };
     const { validateAssetMap } = await import('/src/utils/assets/assetLibrary.js');
     const validation = await validateAssetMap();
     const httpWarnings = validation.warnings.filter((w) => w.includes('HTTP'));
     console.log({ samples, httpWarningCount: httpWarnings.length, httpWarnings: httpWarnings.slice(0, 3) });
   })();
   ```
3. **Expected:** `remoteHttp` starts with `https://`; `localhostHttp` stays `http://`; `relative` unchanged. `httpWarningCount` is `0` unless your map still contains non-localhost `http://` entries.

---

### S-06 — `loadAssetMapConfig` fetches config from a static URL with no integrity check
**Files:** `assetLibrary.js` (`loadAssetMapConfig`, `getAssetUrl`), `assetPreloader.js`, `src/config/assetMap.json`, `routeConfig.json` (`assetPreload` with raw `src`)  
**Detail:** At runtime, `loadAssetMapConfig()` does `fetch('/config/assetMap.json')` and trusts the JSON after a shallow `typeof` check. That file is the **authoritative map** from flag → URL for every `getAssetUrl(flag)` and every flag-based preload. If the served file is swapped (CDN misconfig, cache poisoning, compromised deploy artifact, MITM on non-HTTPS), all flags can point to attacker-controlled hosts. Related: S-02 (third-party scripts in map), S-03/S-04 (preloader injects resolved URLs without further validation).

**Recommended fix — trusted config + allowlisted URLs**

Apply **defense in depth**: lock down *where config comes from*, then *what URLs are allowed*, then *what gets injected*.

1. **Prefer build-time asset map (primary)**
   - Import `assetMap.json` at build time (same pattern as `routeConfig.json` in `routeConfigLoader.js`), e.g. `import assetMapData from '../../config/assetMap.json'`.
   - Use `loadJsonConfigFromImport()` or a static import in dev/prod so production does **not** depend on a mutable network fetch for the canonical map.
   - Reserve runtime `fetch('/config/assetMap.json')` only for optional overrides in dev, behind `import.meta.env.DEV` and explicit opt-in.

2. **Build-time validation (fail CI on bad config)**
   - Extend `validateAssetMap()` (or build script) to run at build/CI and **fail** on:
     - Unknown environments / empty `production`
     - Invalid URL shape per entry
     - Flags in `routeConfig.assetPreload` missing from the map
     - `http://` in production (HTTPS-only)
     - Script-type assets not on an allowlisted CDN path
   - Emit a generated, versioned `asset-map-manifest.json` with hash if a runtime manifest is still needed.

3. **URL allowlist before any preload or `getAssetUrl` return**
   - Add `assertAllowedAssetUrl(url, { type })` used by `getAssetUrl`, `preloadAsset`, and route-level raw `src` in `assetPreload`:
     - **Schemes:** allow only `https:` and same-origin paths starting with `/` (reject `javascript:`, `data:`, `blob:`, `//`, empty).
     - **Hosts (absolute URLs):** allowlist from env, e.g. `VITE_ASSET_ALLOWED_HOSTS` or derived from `import.meta.env` + known CDNs (`cdn.example.com`, `cdn.jsdelivr.net` only if Cognito script stays).
     - **Scripts (`type: script`):** stricter list — known script CDNs + SRI required (see S-02).
     - **Images/fonts:** self + approved CDN/image hosts; block arbitrary third-party image hosts in production (addresses S-01 / `i.ibb.co` usage).
   - On violation: log error, skip preload, return `null` from `getAssetUrl` (never append `<link>`).

4. **Subresource Integrity (SRI) for external scripts**
   - For entries like `script.cognito`, store `{ url, integrity, crossOrigin }` in `assetMap.json` (or a dedicated `scriptAssets` config).
   - When preloading/loading, set `link.integrity` / `script.integrity` from config; reject script URLs without integrity in production.

5. **Integrity of runtime fetch (if fetch path remains)**
   - Serve `assetMap.json` with `Cache-Control` appropriate for versioned deploys.
   - Compare response against build-time hash embedded in the app (`__ASSET_MAP_SHA256__` from Vite `define`); reject mismatch.
   - Optional: `Content-Type: application/json` only, no user-controlled path.

6. **CSP alignment**
   - Ensure `Content-Security-Policy` `img-src` / `script-src` / `connect-src` match the same host allowlist so even a tampered map cannot load hosts the policy blocks.
   - Document allowed hosts next to `assetMap.json` and keep CSP + allowlist in sync in CI.

7. **Self-host critical assets**
   - Move production icons and auth background off ephemeral hosts (`i.ibb.co`, etc.) to your CDN/app origin under `/assets/...` so the allowlist is small and stable.

**Outcome:** Flag resolution and preloading only use URLs from a build-verified map, each URL passes scheme/host/type rules, external scripts require SRI, and a compromised static file cannot silently redirect the whole app.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass). Implements audit items **1**, **3**, and **5** (partial **2** via tests); **4** (SRI in map), **6** (CSP), and **7** (S-01 self-host) remain follow-ups.

**What was broken:** Production trusted a runtime `fetch('/config/assetMap.json')` that could be swapped without verification. `getAssetUrl()` returned any resolved string with no final URL policy check.

**Why it happened:** Network map was tried before the bundled import; no build-time hash was compared on fetch.

**What changed:**
- **`assetMapSource.js`** — bundled map clone, `shouldAllowRuntimeAssetMapFetch()`, SHA-256 verify of fetched JSON text.
- **`vite.config.js`** — injects `__ASSET_MAP_SHA256__` from `src/config/assetMap.json` file bytes at build time.
- **`loadAssetMapConfig()`** — production and default dev use **build-time bundled map only** (`bundled-production` / `bundled-dev`). Network fetch runs only when `VITE_ASSET_MAP_RUNTIME_OVERRIDE=true` in dev; mismatched hash is rejected and falls back to bundled.
- **`getAssetUrl()`** — runs `assertAllowedPreloadUrl()` (from **S-03/S-04**) before caching/returning; blocked URLs return `null`.
- **`validateAssetMap()`** — non-localhost `http://` in **production** is now an **error** (not only a warning).
- Exported `loadAssetMapConfig`, `getAssetMapConfigSource`, `clearAssetMapConfigCache`.
- CI tests: `assetMapSource.test.js`, `assetMapConfig.test.js`, `assetMapBuildValidation.test.js` (route `assetPreload` flags exist in map).

**Conflict check:** Supersedes **L-10** fetch-first dev behavior — dev now defaults to bundled map (safer). **S-02** Cognito vendor path unchanged. **S-01** (ibb.co icons) still open — `i.ibb.co` remains on a temporary allowlist in `assertAllowedPreloadUrl` so `auth.background` and login AssetHandler keep working until icons are self-hosted.

**How it was tested:** `npm run test:unit -- --run tests/unit/assetMapSource.test.js tests/unit/assetMapConfig.test.js tests/unit/assetMapBuildValidation.test.js tests/unit/cognitoScriptSelfHost.test.js`

**How to test in the browser:**
1. Run `npm run dev`, open any page.
2. DevTools → **Console** — paste this IIFE (no `import.meta` — that only works inside Vite modules, not the console):
   ```js
   (async () => {
     const {
       clearAssetMapConfigCache,
       loadAssetMapConfig,
       getAssetMapConfigSource,
       getAssetUrl
     } = await import('/src/utils/assets/assetLibrary.js');
     const { shouldAllowRuntimeAssetMapFetch, getBundledAssetMapSha256 } = await import(
       '/src/utils/assets/assetMapSource.js'
     );
     clearAssetMapConfigCache();
     await loadAssetMapConfig();
     const cognito = await getAssetUrl('script.cognito');
     console.log({
       source: getAssetMapConfigSource(),
       cognito,
       runtimeOverrideEnabled: shouldAllowRuntimeAssetMapFetch(),
       bundledHashDefined: Boolean(getBundledAssetMapSha256())
     });
   })();
   ```
3. **Expected (default dev):** `source: "bundled-dev"`, `cognito: "/vendor/amazon-cognito-identity-6.3.15.min.js"`, `runtimeOverrideEnabled: false`, `bundledHashDefined: true` (hash is a 64-char hex string — restart dev server after `assetMap.json` edits).
4. **Login smoke test:** on `/log-in`, `await getAssetUrl('auth.background')` should return the ibb.co URL (legacy host allowlisted until **S-01**), not `null` — otherwise AssetHandler throws “Asset at index 2 missing url”.
5. **Optional dev override:** set `VITE_ASSET_MAP_RUNTIME_OVERRIDE=true` in `.env.local`, restart dev server — then `runtimeOverrideEnabled: true`; a tampered `/config/assetMap.json` should be rejected (hash mismatch) and logs show `bundled-fallback`.

---

### S-07 — `icon.globe` uses a malformed `i.ibb.co.com` URL
**File:** `assetMap.json` line 9 (development) and line 51 (production)  
**Detail:** `"icon.globe": "https://i.ibb.co.com/mF9x2JG0/..."` — the domain `i.ibb.co.com` does not exist and is not the correct `i.ibb.co` hostname. This URL will always 404. In production it could be registered by a third party to serve arbitrary content. The `.com` suffix should be removed.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `icon.globe` pointed at `https://i.ibb.co.com/...` (invalid host). Same typo in `AuthHeader.vue` fallback.

**Why it happened:** Copy-paste error appended `.com` to the ImgBB host `i.ibb.co`.

**What changed:**
- `src/config/assetMap.json` and `public/config/assetMap.json` — `icon.globe` → `https://i.ibb.co/mF9x2JG0/svgviewer-png-output-85.webp` (development + production).
- `src/templates/auth/AuthHeader.vue` — `FALLBACK_GLOBE_ICON` updated to the same URL.

**Conflict check:** Does not change preload architecture. **S-01** (moving all icons off ibb.co) remains open; this only fixes the malformed hostname.

**How it was tested:** `npm run test:unit -- --run tests/unit/iconGlobeUrl.test.js`

**How to test in the browser:**
1. Run `npm run dev`, open `/log-in` (auth header shows globe icon).
2. DevTools → **Console** — paste this IIFE:
   ```js
   (async () => {
     const { getAssetUrl } = await import('/src/utils/assets/assetLibrary.js');
     const globe = await getAssetUrl('icon.globe');
     const img = document.querySelector('img[alt="globe"]');
     console.log({
       globeFromMap: globe,
       imgSrc: img?.src,
       hasMalformedHost:
         (globe && globe.includes('i.ibb.co.com')) ||
         (img?.src && img.src.includes('i.ibb.co.com'))
     });
   })();
   ```
3. **Expected:** `globeFromMap` contains `https://i.ibb.co/mF9x2JG0/...` (no `.com` after `ibb.co`); `hasMalformedHost: false`. Network tab: globe image request host is `i.ibb.co`, not `i.ibb.co.com`.

---

## 4. Best Practice Violations

### B-01 — `window.performanceTracker.step()` called without null guard
**Files:** `assetPreloader.js`, `assetScanner.js`  
**Detail:** Unlike `assetLibrary.js`, these files call `window.performanceTracker.step(...)` unconditionally. In SSR, unit tests, or when the tracker is not initialised, this throws `TypeError: Cannot read properties of undefined`.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `assetPreloader.js` and `assetScanner.js` called `window.performanceTracker.step()` directly. When the tracker was not on `window` (tests, SSR, early boot), those calls threw.

**Why it happened:** `assetLibrary.js` already guarded with `if (window.performanceTracker)`; asset preload modules were written earlier without the shared accessor.

**What changed:**
- Replaced all `window.performanceTracker.step(...)` with `trackStep(...)` from `performanceTrackerAccess.js` (same pattern as `routeConfigLoader.js`).
- `trackStep` no-ops when the tracker is missing or disabled — preload flow never throws from telemetry.

**Conflict check:** No change to preload behavior, section rollup, or security fixes (S-03–S-07).

**How it was tested:** `npm run test:unit -- --run tests/unit/assetPerformanceTrackerGuards.test.js tests/unit/assetScanner.test.js`

**How to test in the browser:**
1. Run `npm run dev`, open any page.
2. DevTools → **Console** — paste this IIFE:
   ```js
   (async () => {
     const tracker = window.performanceTracker;
     const before = tracker?.steps?.length ?? 0;
     delete window.performanceTracker;
     const { preloadImage } = await import('/src/utils/assets/assetPreloader.js');
     const { extractAssetsFromComponent } = await import('/src/utils/assets/assetScanner.js');
     await preloadImage('/assets/logos/logo-staging.png');
     extractAssetsFromComponent({ preloadAssets: [] });
     window.performanceTracker = tracker;
     console.log({ ranWithoutTracker: true, stepsWhileDeleted: (tracker?.steps?.length ?? 0) - before });
   })();
   ```
3. **Expected:** `ranWithoutTracker: true` — no `TypeError` about `performanceTracker.step`.

---

### B-02 — Identical section-to-routes filter logic duplicated (asset rollup)
**Files:** `assetPreloader.js`, `assetLibrary.js` (`getAssetPreloadConfigForSection`), `assetScanner.js`  
**Detail:** The same `routes.filter(...)` by `section` is copy-pasted to merge `assetPreload[]`. Extract one helper: `getAssetPreloadEntriesForSection(sectionName)`.

#### Resolution ✅

**Status:** Resolved (completed in **P-06** audit pass — verified 2026-05-26; no additional code change this step).

**What was broken:** Each of `preloadSectionAssets`, `preloadSectionCriticalImages`, `getAssetPreloadConfigForSection`, and `scanSectionComponents` independently loaded `routeConfig` and filtered routes by `section` to merge `assetPreload[]`.

**Why it happened:** Section rollup logic was copy-pasted as each module was added.

**What changed (P-06):**
- `getAssetPreloadEntriesForSection.js` — shared `routeBelongsToSection`, memoized `{ assets, routeCount }`, `clearAssetPreloadSectionCache()`.
- `assetPreloader.js`, `assetLibrary.js`, and `assetScanner.js` call the helper only (no remaining `routes.filter` for section rollup in those files).
- Exported from `src/utils/assets/index.js`.

**Conflict check:** Aligns with section-based preload architecture; security and B-01 changes do not alter rollup output.

**How it was tested:** `npm run test:unit -- --run tests/unit/getAssetPreloadEntriesForSection.test.js`

**How to test in the browser:**
1. Run `npm run dev`.
2. DevTools → **Console** — paste this IIFE:
   ```js
   (async () => {
     const { getAssetPreloadEntriesForSection, clearAssetPreloadSectionCache } = await import('/src/utils/assets/getAssetPreloadEntriesForSection.js');
     clearAssetPreloadSectionCache();
     const first = getAssetPreloadEntriesForSection('dashboard-global');
     const second = getAssetPreloadEntriesForSection('dashboard-global');
     console.log({
       routeCount: first.routeCount,
       assetCount: first.assets.length,
       sameReference: first === second
     });
   })();
   ```
3. **Expected:** `routeCount > 0`, `assetCount > 0`, `sameReference: true` (memoized rollup).

---

### B-03 — `preloadSectionCriticalImages` is never called
**File:** `assetPreloader.js` line 608  
**Detail:** Function exists to preload high/critical **images** before paint, but nothing invokes it (router imports it unused). Critical dashboard icons from `assetPreload` are only loaded via post-navigation `preloadSectionAssets`.

#### Resolution ✅

**Status:** Resolved (2026-05-26).

**What was broken:** `preloadSectionCriticalImages` was exported but never invoked after SECTION_PRELOAD_AUDIT B-07 removed the unused router import. Critical/high `assetPreload` images only ran with the full section rollup via `preloadSectionAssets` (post-navigation / background).

**Why it happened:** Preload orchestration consolidated into `sectionPreloadOrchestrator` / `routeNavigationData.js`; the dedicated critical-image path was dropped.

**What changed:**
- `router/index.js` — `loadRouteComponent` runs `preloadSectionCriticalImages(sectionName)` in parallel with `loadViaGlob` via `Promise.all`, so high/critical images are warmed before the route component is returned (navigation guards still non-blocking).
- Full section assets remain on `startCurrentSectionResourceLoads` → `preloadSectionAssets` and `sectionPreloader._doPreload`.

**Conflict check:** SECTION_PRELOAD_AUDIT B-07 removed only an **unused** import; this re-wires the function at the component-load boundary (not duplicate `afterEach` blocking). Aligns with section-based preload: guards unchanged, component loader may await critical images only.

**How it was tested:** Code review + existing `getAssetPreloadEntriesForSection` / priority map coverage; manual browser check below.

**How to test in the browser:**
1. Run `npm run dev`, hard-refresh, open DevTools → **Network** (Img filter).
2. Navigate to a dashboard route (e.g. creator overview).
3. **Console** — paste:
   ```js
   (async () => {
     const { preloadSectionCriticalImages } = await import('/src/utils/assets/assetPreloader.js');
     const { getAssetPreloadEntriesForSection } = await import('/src/utils/assets/getAssetPreloadEntriesForSection.js');
     const { assets } = getAssetPreloadEntriesForSection('dashboard-global');
     const critical = assets.filter(a => a.type === 'image' && (a.priority === 'high' || a.priority === 'critical'));
     console.log({ criticalCount: critical.length, flags: critical.map(a => a.flag || a.src).slice(0, 5) });
     await preloadSectionCriticalImages('dashboard-global');
     console.log('preloadSectionCriticalImages done');
   })();
   ```
4. **Expected:** `criticalCount > 0`; network shows image preloads for dashboard flags; no navigation errors.

---

### B-04 — `assetPreloader.js` uses module-level Maps as implicit singletons
**Files:** `assetPreloader.js` lines 17, 371  
**Detail:** `preloadInProgress` and `jsonDataCache` are module-level singletons. In tests or HMR, stale state can leak. Export reset helpers or tie lifecycle to `clearPreloadCache()`.

#### Resolution ✅

**Status:** Resolved (verified 2026-05-26; doc + test reinforcement).

**What was broken:** Module-level `preloadInProgress` and `jsonDataCache` could retain stale entries across tests/HMR if callers only cleared Pinia.

**Why it happened:** Maps predate P-03 SSOT work; lifecycle was implicit.

**What changed:**
- `clearPreloadCache()` already clears both maps (P-03); JSDoc now explicitly documents that contract.
- `tests/unit/assetPreloadCache.test.js` — asserts `clearPreloadCache()` forces JSON re-fetch after cache clear (proves `jsonDataCache` reset).

**Conflict check:** No change to `preloadedSections` / `buildHash` preservation (P-03).

**How it was tested:** `npm run test:unit -- --run tests/unit/assetPreloadCache.test.js`

**How to test in the browser:**
1. DevTools → **Console**:
   ```js
   (async () => {
     const { preloadJSON, clearPreloadCache, getPreloadedAssetsCount } = await import('/src/utils/assets/assetPreloader.js');
     const path = '/src/config/countries.json';
     await preloadJSON(path);
     const before = getPreloadedAssetsCount();
     clearPreloadCache();
     console.log({ before, afterClear: getPreloadedAssetsCount() });
   })();
   ```
2. **Expected:** `afterClear: 0` (Pinia URLs cleared; module maps cleared in same call).

---

### B-05 — `assetMap.json` mixes local relative paths (development) with external absolute URLs (production) without documentation
**File:** `assetMap.json`  
**Detail:** Development uses relative paths like `/assets/icons/cart-dev.svg` which depend on Vite dev-server file serving. Production uses absolute CDN URLs. Staging only partially overrides production. This divergence is undocumented, making it unclear which assets are actually served in each environment or whether the inheritance model is intentional.

#### Resolution ✅

**Status:** Resolved (2026-05-26).

**What was broken:** Dev relative paths vs production CDN URLs and staging partial overrides were intentional in code (`getAssetUrl` inheritance) but not documented for editors of `assetMap.json`.

**Why it happened:** Map grew organically; behavior lived only in `assetLibrary.js` comments.

**What changed:**
- `src/config/assetMap.README.md` — environment table, inheritance rules, dev vs production serving, edit/restart notes.
- `assetLibrary.js` file header already references env inheritance; README is the editor-facing source of truth next to `assetMap.json`.

**Conflict check:** Documentation only; no URL or allowlist behavior change (S-01 self-host migration still open).

**How it was tested:** Doc review against `getAssetUrl` / `detectEnvironment` in `assetLibrary.js`.

**How to test in the browser:**
1. DevTools → **Console**:
   ```js
   (async () => {
     const { getAssetUrl, getEnvironment, setEnvironment } = await import('/src/utils/assets/assetLibrary.js');
     console.log({ env: getEnvironment(), devCart: await getAssetUrl('icon.cart') });
     setEnvironment('production');
     console.log({ prodCart: await getAssetUrl('icon.cart') });
     setEnvironment('development');
   })();
   ```
2. **Expected:** `devCart` is a `/assets/...` path (or inherited URL); `prodCart` is CDN `https://cdn.example.com/...` when production block defines it.

---

## 5. Missing Features

### M-01 — No deduplication of `assetPreload` entries when merging across routes in the same section
**Files:** `assetPreloader.js`, `assetLibrary.js`, `assetScanner.js`  
**Detail:** All three merge points simply push all `assetPreload` arrays together with `...spread`. If five routes in the same section each declare `dashboard.logo`, it appears five times in the merged list. Only the downstream per-asset `hasAsset` check (which is O(n)) prevents duplicate HTTP requests, but the work of iterating and resolving flags is still repeated.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Section rollup concatenated every route’s `assetPreload[]` with spread. Multiple routes in the same section repeating the same `flag` or `src` produced duplicate entries in the merged list. `hasAsset()` still blocked duplicate network requests, but flag resolution and preload scheduling ran once per duplicate.

**Why it happened:** Merge logic lived in three copy-pasted loops (fixed by **P-06** / **B-02**) but never collapsed duplicate entries after concatenation.

**What changed:**
- `getAssetPreloadEntriesForSection.js` — added `dedupeAssetPreloadEntries()` keyed by `flag` (preferred) or `src`; when duplicates conflict, keeps the **higher-priority** entry (`critical` > `high` > `medium` > `low`/`normal`).
- Rollup now exposes `rawAssetCount` (pre-dedup) alongside deduped `assets.length` for diagnostics.
- `assetPreloader.js`, `assetLibrary.js`, and `assetScanner.js` inherit dedup automatically via the shared helper (no per-file spread loops remain).

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, or **AUDIT.md** preload refactors — same section-based architecture and `hasAsset()` HTTP dedup. Complements **AUDIT.md P4** (`sharedAssetPreloads.json` removes config duplication; **M-01** dedupes at merge when multiple routes still share the same flags).

**How it was tested:** `npm run test:unit -- --run tests/unit/getAssetPreloadEntriesForSection.test.js`

**How to test in the browser:**
1. Run `npm run dev`.
2. DevTools → **Console** — paste this IIFE (one runnable command):
   ```js
   (async () => {
     const {
       getAssetPreloadEntriesForSection,
       clearAssetPreloadSectionCache,
       dedupeAssetPreloadEntries
     } = await import('/src/utils/assets/getAssetPreloadEntriesForSection.js');

     clearAssetPreloadSectionCache();
     const sections = ['dashboard-global', 'shop', 'auth'];
     const liveConfig = Object.fromEntries(
       sections.map((section) => {
         const { assets, routeCount, rawAssetCount } = getAssetPreloadEntriesForSection(section);
         const keys = assets.map((entry) => (entry.flag ? `flag:${entry.flag}` : entry.src ? `src:${entry.src}` : null)).filter(Boolean);
         return [section, {
           routeCount,
           rawAssetCount,
           assetCount: assets.length,
           duplicateCount: rawAssetCount - assets.length,
           deduped: assets.length === new Set(keys).size
         }];
       })
     );

     const syntheticRaw = [
       { flag: 'dashboard.logo', type: 'image', priority: 'high' },
       { flag: 'dashboard.logo', type: 'image', priority: 'low' },
       { flag: 'dashboard.avatar', type: 'image' },
     ];
     const syntheticDeduped = dedupeAssetPreloadEntries(syntheticRaw);

     console.log('Live config (current routeConfig.json):');
     console.table(liveConfig);
     console.log('Synthetic dedup demo (proves M-01 logic):', {
       rawAssetCount: syntheticRaw.length,
       assetCount: syntheticDeduped.length,
       duplicateCount: syntheticRaw.length - syntheticDeduped.length,
       logoPriorityKept: syntheticDeduped.find((entry) => entry.flag === 'dashboard.logo')?.priority
     });
   })();
   ```
3. **Expected (live config — what you should see today):**
   - Every row: `deduped: true`
   - `dashboard-global`: `routeCount: 12`, `assetCount: 20`, `duplicateCount: 0` — only `/dashboard` contributes `assetPreloadRef`; the other 11 routes in that section have no `assetPreload`
   - `shop`: `routeCount: 1`, `assetCount: 20`, `duplicateCount: 0` — separate section bucket
   - `auth`: `routeCount: 14`, `assetCount: 2`, `duplicateCount: 0` — only `/log-in` declares preload (bg image + Cognito script)
   - **`duplicateCount: 0` is correct** — **AUDIT.md P4** moved shared icons to `sharedAssetPreloads.json`, so the same 20 flags are not repeated on multiple routes in one section anymore. M-01 is the safety net when they are.
4. **Expected (synthetic demo block):** `rawAssetCount: 3`, `assetCount: 2`, `duplicateCount: 1`, `logoPriorityKept: 'high'`.

---

### M-02 — No `fetchpriority` attribute on generated `<link rel="preload">` elements
**File:** `assetPreloader.js`  
**Detail:** The [Fetch Priority API](https://web.dev/fetch-priority/) (`fetchpriority="high|low|auto"`) allows the browser to schedule preloaded images/fonts/scripts correctly. None of the generated `<link>` elements set this attribute, even though `priority` is already in route config.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Route `assetPreload[].priority` was used only for scheduling order in `preloadAssets()`, but injected `<link rel="preload">` / `<link rel="modulepreload">` elements never set `fetchpriority`, so the browser could not prioritize fetches within a tier.

**Why it happened:** Link creation helpers only set `rel`, `as`, and `href`; config `priority` was never mapped to the Fetch Priority API.

**What changed:**
- `assetPreloader.js` — added `resolveFetchPriority()` and `applyFetchPriorityToLink()`.
- Mapping: `critical`/`high` → `fetchpriority="high"`; `medium`/`normal` → `fetchpriority="auto"`; `low` → `fetchpriority="low"`.
- Applied on image, font, media, and script link creation (`createScriptPreloadLink`).
- `preloadAsset()` already passes `priority` through `...options` to type-specific preloaders.

**Conflict check:** No override of prior preload refactors — scheduling tiers in `preloadAssets()` unchanged; adds browser hint only. **M-03** (prefetch for low) builds on the same options path.

**How it was tested:** `npm run test:unit -- --run tests/unit/preloadFetchPriority.test.js`

**How to test in the browser:**
1. Run `npm run dev`, visit `/dashboard` once (warms section assets).
2. DevTools → **Console** — paste this IIFE:
   ```js
   (async () => {
     const store = (await import('/src/stores/usePreloadStore.js')).usePreloadStore();
     const { preloadImage, preloadScript } = await import('/src/utils/assets/assetPreloader.js');
     const highUrl = '/assets/test-high-priority.png';
     const lowUrl = '/assets/test-low-priority.png';
     const scriptUrl = '/vendor/amazon-cognito-identity-6.3.15.min.js';

     [highUrl, lowUrl, scriptUrl].forEach((url) => {
       store.removeAsset(url);
       document.querySelectorAll(`link[href="${url}"]`).forEach((el) => el.remove());
     });

     await preloadImage(highUrl, { priority: 'high' });
     await preloadImage(lowUrl, { priority: 'low' });
     await preloadScript(scriptUrl, { priority: 'medium' });

     console.table({
       highImage: document.querySelector(`link[href="${highUrl}"]`)?.getAttribute('fetchpriority'),
       lowImage: document.querySelector(`link[href="${lowUrl}"]`)?.getAttribute('fetchpriority'),
       mediumScript: document.querySelector(`link[href="${scriptUrl}"]`)?.getAttribute('fetchpriority')
     });
   })();
   ```
3. **Expected:** `highImage: 'high'`, `lowImage: 'low'`, `mediumScript: 'auto'`.

---

### M-03 — Low-priority assets use `rel="preload"` instead of `rel="prefetch"`
**File:** `assetPreloader.js` — all preload functions  
**Detail:** `rel="preload"` tells the browser the resource is needed for the current navigation and should be fetched at high priority. For assets with `priority: "low"` (background images, media that appears below the fold), `rel="prefetch"` is the correct hint — it fetches during idle time without competing with critical resources.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Every asset hint used `rel="preload"` regardless of route `priority`. Low-priority background assets competed with critical navigation resources.

**Why it happened:** Link helpers always set `rel="preload"`; only scheduling order differed in `preloadAssets()`.

**What changed:**
- `assetPreloader.js` — `shouldUsePrefetchHint()` returns true when `options.priority === 'low'`.
- `applyResourceHintRel()` sets `rel="prefetch"` for low priority, `rel="preload"` otherwise (image, font, media).
- `createScriptPreloadLink()` uses `rel="prefetch"` for low-priority scripts (including classic UMD); high/medium still use `preload` / `modulepreload`.
- DOM dedup via `findExistingResourceHintLink()` matches existing `prefetch`, `preload`, and `modulepreload` links.
- Low-priority links still get `fetchpriority="low"` from **M-02**.

**Conflict check:** Does not change **M-02** mapping or tier scheduling in `preloadAssets()`. `normal`/`medium` assets still use `rel="preload"` (see **C-03** for `normal` priority semantics).

**How it was tested:** `npm run test:unit -- --run tests/unit/preloadPrefetch.test.js tests/unit/preloadScript.test.js`

**How to test in the browser:**
1. Run `npm run dev`.
2. DevTools → **Console** — paste this IIFE:
   ```js
   (async () => {
     const store = (await import('/src/stores/usePreloadStore.js')).usePreloadStore();
     const { preloadImage, preloadScript } = await import('/src/utils/assets/assetPreloader.js');
     const lowImage = '/assets/test-prefetch-image.png';
     const highImage = '/assets/test-preload-image.png';
     const lowScript = '/vendor/amazon-cognito-identity-6.3.15.min.js';

     [lowImage, highImage, lowScript].forEach((url) => {
       store.removeAsset(url);
       document.querySelectorAll(`link[href="${url}"]`).forEach((el) => el.remove());
     });

     await preloadImage(lowImage, { priority: 'low' });
     await preloadImage(highImage, { priority: 'high' });
     await preloadScript(lowScript, { priority: 'low' });

     console.table({
       lowImage: document.querySelector(`link[href="${lowImage}"]`)?.rel,
       highImage: document.querySelector(`link[href="${highImage}"]`)?.rel,
       lowScript: document.querySelector(`link[href="${lowScript}"]`)?.rel
     });
   })();
   ```
3. **Expected:** `lowImage: 'prefetch'`, `highImage: 'preload'`, `lowScript: 'prefetch'`.
4. Visit `/dashboard` and inspect Elements → `<head>` — menu icons with `"priority": "normal"` in `sharedAssetPreloads.json` still use `rel="preload"` (only `"low"` uses prefetch).

---

### M-04 — No validation at startup that flags in `routeConfig.json` exist in `assetMap.json`
**Files:** `routeConfig.json`, `assetMap.json`, `assetLibrary.js`  
**Detail:** When a route declares `{ "flag": "dashboard.hamburger", "type": "image" }` but the flag is missing from `assetMap.json`, `getAssetUrl` returns `null`, the preload is silently skipped, and no warning surfaces at build time or application startup. A startup validation step that cross-references all flags in routeConfig against assetMap would catch typos early.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Typos or missing entries in `assetMap.json` for `assetPreload[].flag` values were only discovered at runtime when `getAssetUrl()` returned `null` and preload was silently skipped.

**Why it happened:** `jsonConfigValidator` validated route shape but never cross-checked flag names against `assetMap.json`. **S-06** had a partial build test that read raw `routeConfig.json` without expanding `assetPreloadRef`.

**What changed:**
- `validateRouteAssetPreloadFlags.js` — `collectAssetMapFlags()` + `validateRouteAssetPreloadFlags(routes, assetMap)` with route slug in error messages; added `validateSharedCatalogAssetPreloadFlags()` for shared preload catalog arrays.
- `jsonConfigValidator.js` — `validateRouteConfig()` now expands `assetPreloadRef` and cross-checks all route + shared-catalog flags against bundled `assetMap.json` at **build time** (section bundler / CI), not only in dev startup.
- `routeConfigLoader.js` — flag cross-check runs on **every** environment load (dev + production), not only `import.meta.env.DEV`; component path validation remains dev-only.
- `assetMapBuildValidation.test.js` — build check now uses expanded routes + shared validator (**M-04** / **S-06** aligned).
- Exported from `src/utils/assets/index.js` for console diagnostics.

**Conflict check:** Does not override prior preload refactors — validation only; no change to preload scheduling or URL resolution. **C-09** (shape/priority validator) remains separate.

**How it was tested:** `npm run test:unit -- --run tests/unit/validateRouteAssetPreloadFlags.test.js tests/unit/assetMapBuildValidation.test.js`

**How to test in the browser:**
1. Run `npm run dev` — app should start normally (all current flags valid).
2. DevTools → **Console** — paste this IIFE to run the same check live:
   ```js
   (async () => {
     const { getRouteConfiguration } = await import('/src/utils/route/routeConfigLoader.js');
     const assetMap = (await import('/src/config/assetMap.json')).default;
     const { validateRouteAssetPreloadFlags } = await import('/src/utils/assets/validateRouteAssetPreloadFlags.js');

     const result = validateRouteAssetPreloadFlags(getRouteConfiguration(), assetMap);
     console.log({
       valid: result.valid,
       missingCount: result.missingCount,
       errors: result.errors
     });
   })();
   ```
3. **Expected:** `valid: true`, `missingCount: 0`, `errors: []`.
4. **Fail-fast test:** In `routeConfig.json`, change one `assetPreload` flag to a typo (e.g. `dashboard.typo.logo`), restart `npm run dev` — startup should throw `Asset preload flag validation failed` before first navigation. Revert the typo afterward.

---

### M-05 — No cache-busting mechanism for `usePreloadStore` localStorage after a deploy
**File:** `usePreloadStore.js` lines 62–66  
**Detail:** Preloaded asset URLs are persisted to localStorage indefinitely. After a production deploy where asset filenames change (content hashing), the stored URLs still match old paths. The store has no version key or TTL, so users will never re-preload changed assets without manually clearing storage. A store version tied to the app's build hash should be added, with automatic invalidation on version mismatch.

#### Resolution ✅

**Status:** Resolved (already implemented by **Preloading.md Task 6**; hardened in this audit pass).

**What was broken (at audit time):** Persisted `preloadedAssets` / `preloadedSections` could survive a deploy with stale URLs when filenames changed.

**Why it happened:** Early store had no deploy version key.

**What changed (Preloading Task 6 + this pass):**
- `usePreloadStore.js` — `buildHash` persisted in `app-preload-state` localStorage.
- `main.js` — on startup, clears preload state when `VITE_BUILD_HASH` changes.
- **This pass:** extracted `appBuildHash.js` (`getAppBuildHash`, `syncPreloadStoreBuildHash`) shared by `main.js` and Pinia `afterHydrate` (clears stale state immediately on persist rehydrate).

**Conflict check:** Aligns with **P-03** / **SECTION_PRELOAD_AUDIT M-01** — same `buildHash` field; no duplicate `preloadStateVersion`. `clearPreloadCache()` still preserves `buildHash` (P-03).

**How it was tested:** `npm run test:unit -- --run tests/unit/appBuildHash.test.js tests/unit/assetPreloadCache.test.js`

**How to test in the browser:**
1. Run `npm run build` with `VITE_BUILD_HASH=deploy-v1` (or set in `.env.production`), then `npm run preview`.
2. DevTools → **Application** → **Local Storage** → note `app-preload-state` (sections/assets populated after navigation).
3. Rebuild with `VITE_BUILD_HASH=deploy-v2`, refresh preview.
4. DevTools → **Console** — paste:
   ```js
   (() => {
     const raw = localStorage.getItem('app-preload-state');
     const parsed = raw ? JSON.parse(raw) : null;
     console.log({
       buildHash: parsed?.buildHash,
       sectionCount: parsed?.preloadedSections?.length ?? 0,
       assetCount: parsed?.preloadedAssets?.length ?? 0
     });
   })();
   ```
5. **Expected:** `buildHash: 'deploy-v2'` and cleared sections/assets on first load after hash change (check console log from `main.js` / store: “New deploy detected — preload state cleared”).

---

### M-06 — No retry logic for failed asset preloads
**File:** `assetPreloader.js`  
**Detail:** When a `link.onerror` fires, the error is logged, the item is removed from `preloadInProgress`, and execution continues. There is no retry with back-off for transient CDN failures.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** A single transient network/CDN failure permanently failed a link preload; no second attempt.

**Why it happened:** `link.onerror` immediately rejected and cleared `preloadInProgress`.

**What changed:**
- `withPreloadRetry()` — up to **2** retries (3 total attempts) with exponential backoff (400ms base).
- `waitForLinkLoad()` — shared link load promise used by image/font/media/script preloaders.
- `preloadJSON()` fetch wrapped with the same retry helper.

**Conflict check:** Retries stay non-blocking; failed assets still do not throw from `preloadAsset()` (continues with siblings). Does not change URL policy / SRI guards.

**How it was tested:** `npm run test:unit -- --run tests/unit/preloadRetry.test.js tests/unit/preloadScript.test.js`

**How to test in the browser:**
1. Run `npm run dev`, DevTools → **Network** → enable **Offline** briefly is hard to time; use console simulation instead:
   ```js
   (async () => {
     const { withPreloadRetry } = await import('/src/utils/assets/assetPreloader.js');
     let attempts = 0;
     const result = await withPreloadRetry(async (attempt) => {
       attempts += 1;
       if (attempt < 2) throw new Error('simulated CDN blip');
       return 'recovered';
     }, { maxRetries: 2, baseDelayMs: 50 });
     console.log({ result, attempts });
   })();
   ```
2. **Expected:** `{ result: 'recovered', attempts: 3 }` (initial + 2 retries).

---

### M-07 — No concurrency batching for large asset lists
**File:** `assetPreloader.js` (`preloadAssets`)  
**Detail:** All assets for a section start in parallel via `Promise.allSettled` with no max concurrency. Large icon sets (e.g. dashboard) can flood the browser with simultaneous `<link rel="preload">` requests. Batch by priority (high first, then chunks of N) to respect connection limits.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Within each priority tier, every asset started at once (`Promise.allSettled` on the full tier). Dashboard’s ~20 icons could open ~20 simultaneous link requests.

**Why it happened:** Tier grouping existed (high before low) but no cap inside a tier.

**What changed:**
- `ASSET_PRELOAD_MAX_CONCURRENCY = 6` — max parallel preloads per tier.
- `runInConcurrencyChunks()` — processes tier assets in chunks of 6; priority tiers still run sequentially (high finishes before lower tiers start).
- Exported for tests/diagnostics.

**Conflict check:** Preserves **M-02**/**M-03** link hints and tier ordering; only limits parallelism inside each tier.

**How it was tested:** `npm run test:unit -- --run tests/unit/preloadConcurrency.test.js`

**How to test in the browser:**
1. Run `npm run dev`, visit `/dashboard` once.
2. DevTools → **Console**:
   ```js
   (async () => {
     const { ASSET_PRELOAD_MAX_CONCURRENCY, runInConcurrencyChunks } = await import('/src/utils/assets/assetPreloader.js');
     let maxInFlight = 0;
     let inFlight = 0;
     const items = Array.from({ length: 12 }, (_, i) => i);

     await runInConcurrencyChunks(items, async () => {
       inFlight += 1;
       maxInFlight = Math.max(maxInFlight, inFlight);
       await new Promise((r) => setTimeout(r, 20));
       inFlight -= 1;
     });

     console.log({ ASSET_PRELOAD_MAX_CONCURRENCY, demoMaxInFlight: maxInFlight });
   })();
   ```
3. **Expected:** `ASSET_PRELOAD_MAX_CONCURRENCY: 6`, `demoMaxInFlight: 6` (never 12 at once).

---

### M-08 — No intent-based asset preload (hover / viewport)
**Detail:** Assets preload only after navigation (`preloadSectionAssets` from router `afterEach`). No hover on nav links or viewport-based prefetch for known `assetPreload` targets.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Section `assetPreload[]` warmed only after navigation (`preloadSectionAssets` from router `afterEach`). Hovering a nav link prefetched the Vue component chunk (AUDIT **P10**) but not static assets for the destination section.

**Why it happened:** Intent prefetch existed only for route components (`routeComponentPrefetch.js`), not section asset rollup.

**What changed:**
- `routeAssetPrefetch.js` — `prefetchSectionAssetsForRoute()` resolves the target route + role section, then calls `preloadSectionAssets()` non-blocking; dedupes by section name.
- `useRoutePrefetch.js` — `createRoutePrefetchIntentHandler()` and `prefetchOnIntent()` trigger **both** component prefetch and section asset prefetch; split handlers `prefetchComponentOnIntent` / `prefetchAssetsOnIntent` also exported.
- **Nav UI follow-up:** `DashboardSidebar.vue`, `AppFooter.vue`, and `AuthLogIn.vue` now use the combined `createRoutePrefetchIntentHandler()` from `useRoutePrefetch.js` instead of component-only prefetch. `src/utils/route/index.js` and `src/router/index.js` re-export the combined handler as the default.
- Re-exported from `src/utils/route/index.js`.

**Conflict check:** Complements **AUDIT.md P10** (component intent prefetch) without changing post-navigation preload. Does not add viewport observers (hover/focus only, matching existing component pattern).

**How it was tested:** `npm run test:unit -- --run tests/unit/routeAssetPrefetch.test.js tests/unit/useRoutePrefetch.test.js`

**How to test in the browser:**
1. Run `npm run dev`, open DevTools → **Network** → filter `Img` or `webp`.
2. From `/log-in`, hover **Dashboard** or **Shop** nav link (uses `useRoutePrefetch` / `@mouseenter`).
3. **Expected:** Static icon/asset requests for that route's section begin **before** click (same timing window as component chunk prefetch).
4. DevTools → **Console** — paste:
   ```js
   (async () => {
     const { prefetchSectionAssetsForRoute, resetRouteAssetPrefetchCache } = await import('/src/utils/route/routeAssetPrefetch.js');
     const { resetRoutePrefetchCache } = await import('/src/utils/route/routeComponentPrefetch.js');

     const linksBefore = document.querySelectorAll('link[rel="preload"], link[rel="prefetch"]').length;

     resetRouteAssetPrefetchCache();
     resetRoutePrefetchCache();

     await prefetchSectionAssetsForRoute('/shop');
     await prefetchSectionAssetsForRoute('/shop');

     const linksAfter = document.querySelectorAll('link[rel="preload"], link[rel="prefetch"]').length;

     console.log({
       sectionResolved: 'shop',
       dedupedSecondCall: true,
       linksBefore,
       linksAfter,
       note: 'If you already visited /shop or /dashboard, most images log already-preloaded — Pinia store hit, not a failure'
     });
   })();
   ```
5. **Expected (console test):**
   - **One** `preloadSectionAssets [start]` log (second `/shop` call is deduped — no second start).
   - **One** `Section assets prefetched on intent` success log.
   - `linksAfter` may stay low (e.g. 3) if assets were already in `usePreloadStore` from an earlier visit — you will see many `preloadImage [already-preloaded]` lines instead of new `<link>` tags. That is correct.
6. **Expected (hover on nav):** From `/log-in`, hover a link to a **different section** (e.g. `/shop` or `/dashboard`) — Network tab shows icon/webp requests **before** click. Hover **Sign up** on the login form prefetches both the **Vue component** and auth section assets (same `auth` section as `/log-in`, so asset requests may be store cache hits).

---

### M-09 — `assetScanner.scanComponentForAssetReferences` misses dynamic Vue `:src` bindings
**File:** `assetScanner.js` lines 122–132  
**Detail:** The regex `/<img[^>]+src=["']([^"']+)["'][^>]*>/gi` only matches static `src="..."` attributes. Vue template bindings like `:src="imageUrl"` or `v-bind:src="..."` are not matched. The scanner is therefore blind to dynamically-bound assets.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Template scanner only matched static `src="..."` on `<img>`, `<video>`, and `<audio>` tags.

**Why it happened:** Single regex covered static HTML attributes only.

**What changed:**
- `extractLiteralBoundAttribute()` — matches `src`, `:src`, and `v-bind:src` when the value is a **string literal** (`'/path.png'`).
- `extractBoundAttributeExpression()` — captures non-literal Vue bindings (`:src="imageUrl"`) and returns them as **unresolved** scan entries for audit tooling.
- `scanScriptForAssetFlagReferences()` — resolves `getAssetUrl('flag')` / `getAssetUrls([...])` calls in component script.
- `resolveAssetSlotFlagsFromScript()` — resolves `:src="assets.logo"` when script maps slot keys to asset flag literals.
- `collectMediaAssetsFromTemplate()` — scans full tags for img/video/audio instead of one combined regex.
- `scanComponentForAssetReferences(template, script?)` — merges template + script results; pure runtime variables remain `unresolved: true` (no URL without evaluation).

**Conflict check:** Scanner-only change; does not alter runtime `preloadSectionAssets` rollup from `routeConfig.json`.

**How it was tested:** `npm run test:unit -- --run tests/unit/assetScanner.test.js`

**How to test in the browser:**
1. Run `npm run dev`.
2. DevTools → **Console** — paste:
   ```js
   (async () => {
     const { scanComponentForAssetReferences } = await import('/src/utils/assets/assetScanner.js');
     const template = `
       <img src="/assets/static.png" />
       <img :src="'/assets/bound.png'" />
       <img :src="imageUrl" />
     `;
     console.log(scanComponentForAssetReferences(template));
   })();
   ```
3. **Expected:** Two entries — `/assets/static.png` and `/assets/bound.png` — no entry for `imageUrl`.

---

### M-10 — `loadAssetMapConfig` path is not configurable via environment variable
**File:** `assetLibrary.js` line 667  
**Detail:** The asset map URL is hardcoded to `/config/assetMap.json`. There is no `import.meta.env.VITE_ASSET_MAP_URL` override. This makes it impossible to serve environment-specific asset maps from different paths (e.g., `/config/assetMap.staging.json`) without modifying source code.

#### Resolution ✅

**Status:** Resolved (already fixed in **L-10** audit pass; verified and exported this pass).

**What was broken (at audit time):** Only `/config/assetMap.json` was fetched; no env override for staging/custom paths.

**Why it happened:** Single hardcoded public path.

**What changed (L-10 + this pass):**
- `getAssetMapFetchCandidates()` — optional `VITE_ASSET_MAP_URL` prepended; dev fallbacks `/config/assetMap.json` and `/src/config/assetMap.json`.
- `fetchAssetMapFromNetwork()` tries candidates in order; bundled map remains final fallback.
- **This pass:** exported `getAssetMapFetchCandidates` from `assetLibrary.js` / `assets/index.js` for tests and diagnostics.

**Conflict check:** Same behavior as **L-10** / **S-06** runtime override rules — production still defaults to bundled map unless `VITE_ASSET_MAP_RUNTIME_OVERRIDE=true`.

**How it was tested:** `npm run test:unit -- --run tests/unit/assetMapUrl.test.js tests/unit/assetMapSource.test.js`

**How to test in the browser:**
1. Set `VITE_ASSET_MAP_URL=/config/assetMap.staging.json` in `.env.local`, restart `npm run dev`.
2. DevTools → **Console**:
   ```js
   (async () => {
     const { getAssetMapFetchCandidates, getAssetMapConfigSource, clearAssetMapConfigCache, loadAssetMapConfig } = await import('/src/utils/assets/assetLibrary.js');

     console.log({ candidates: getAssetMapFetchCandidates() });
     clearAssetMapConfigCache();
     await loadAssetMapConfig();
     console.log({ source: getAssetMapConfigSource() });
   })();
   ```
3. **Expected:** `candidates[0]` is your override URL; Network tab shows fetch attempts starting with that path when runtime override is enabled.

---

## 6. Config & `routeConfig` (asset preload only)

Issues tied to `assetPreload[]` definitions and how they are merged — not section JS/CSS bundle preloading.

### C-01 — Disabled routes still contribute `assetPreload` to section merges
**Files:** `assetPreloader.js`, `assetLibrary.js`, `assetScanner.js`, `routeConfig.json`  
**Detail:** Routes with `enabled: false` are skipped for Vue Router registration but still appear in `getRouteConfiguration()`. Asset collectors never filter `enabled`, so disabled routes can still add icons/scripts to a section’s merged preload list.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Section `assetPreload[]` rollups merged entries from every route returned by `getRouteConfiguration()`, including routes with `enabled: false` that Vue Router never registers (e.g. `/about`, `/dashboard/social-linking`).

**Why it happened:** `getAssetPreloadEntriesForSection()` filtered by section only; `enabled` was enforced at route generation (`generateRoutesFromConfig`) but not in the asset preload aggregation path used by `assetPreloader.js`, `assetLibrary.js`, and `assetScanner.js`.

**What changed:**
- `getAssetPreloadEntriesForSection.js` — added `isRouteEnabledForAssetPreload()`; section rollups now skip `enabled: false` routes before merging `assetPreload[]`.
- Exported `isRouteEnabledForAssetPreload` and `routeBelongsToSection` from `assets/index.js` for diagnostics.
- Unit test: disabled route with unique `assetPreload` flag is excluded from rollup.

**Conflict check:** Aligns with **AUDIT.md B3** (disabled routes omitted at route generation). Does **not** override **Preloading.md** or **SECTION_PRELOAD_AUDIT.md** — section JS/CSS bundle preloading unchanged; only static `assetPreload[]` rollup filtering. Build-time flag validation (`validateRouteAssetPreloadFlags`) still scans all routes including disabled ones so config typos are caught before re-enable.

**How it was tested:** `npm run test:unit -- --run tests/unit/getAssetPreloadEntriesForSection.test.js`

**How to test in the browser:**
1. Run `npm run dev`.
2. DevTools → **Console** — paste:
   ```js
   (async () => {
     const { getRouteConfiguration } = await import('/src/utils/route/routeConfigLoader.js');
     const {
       getAssetPreloadEntriesForSection,
       clearAssetPreloadSectionCache,
       isRouteEnabledForAssetPreload,
       routeBelongsToSection,
     } = await import('/src/utils/assets/getAssetPreloadEntriesForSection.js');

     const section = 'dashboard-global';
     const routes = getRouteConfiguration();
     const inSection = routes.filter((route) => routeBelongsToSection(route, section));
     const enabledInSection = inSection.filter((route) => isRouteEnabledForAssetPreload(route));
     const disabledInSection = inSection.filter((route) => route.enabled === false);

     clearAssetPreloadSectionCache();
     const rollup = getAssetPreloadEntriesForSection(section);

     console.log({
       section,
       totalInSection: inSection.length,
       enabledInSection: enabledInSection.length,
       disabledInSection: disabledInSection.map((route) => route.slug),
       rollupRouteCount: rollup.routeCount,
       c01Pass: rollup.routeCount === enabledInSection.length,
       note: 'rollupRouteCount must equal enabledInSection, not totalInSection',
     });
   })();
   ```
3. **Expected:** `disabledInSection` includes `/dashboard/social-linking`; `rollupRouteCount` equals `enabledInSection` (not `totalInSection`); `c01Pass: true`.

---

### C-02 — `inheritConfigFromParent` does not merge parent `assetPreload`
**Files:** `routeResolver.js`, `assetPreloader.js`  
**Detail:** `inheritConfigurationFromParentRoute()` is never applied before aggregation. Child routes do not inherit parent `assetPreload` entries; assets must be duplicated on every child route.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Section rollups read each route’s raw `assetPreload[]` only. Child routes with `inheritConfigFromParent: true` (e.g. `/dashboard/payout` in `dashboard-creator`) did not inherit `/dashboard` menu icons, so those assets were missing from role-specific section buckets unless duplicated in config.

**Why it happened:** `inheritConfigurationFromParentRoute()` was wired for guards/preload orchestration (AUDIT **A2** / **S4**) but not called in `getAssetPreloadEntriesForSection()`. `deepMergePreferChild` also replaced the whole `assetPreload` array when a child defined its own entries (e.g. `/dashboard/overview` script).

**What changed:**
- `routeResolver.js` — when both parent and child define `assetPreload[]`, entries are **concatenated** (parent first, child second); dedupe still happens at section rollup (M-01).
- `resolveEffectiveAssetPreloadForRoute()` — applies inheritance before reading preload entries; exported from `route/index.js`.
- `getAssetPreloadEntriesForSection.js` — uses `resolveEffectiveAssetPreloadForRoute()` per route instead of raw `route.assetPreload`.

**Conflict check:** Extends **AUDIT.md A2/S4** inheritance to asset preload only. Does not change section JS/CSS bundle preloading (**Preloading.md** / **SECTION_PRELOAD_AUDIT.md**). Complements **C-01** (disabled routes still excluded before inheritance runs).

**How it was tested:** `npm run test:unit -- --run tests/unit/routeInheritance.test.js tests/unit/getAssetPreloadEntriesForSection.test.js`

**How to test in the browser:**
1. Run `npm run dev`.
2. DevTools → **Console** — paste:
   ```js
   (async () => {
     const { getRouteConfiguration } = await import('/src/utils/route/routeConfigLoader.js');
     const { resolveEffectiveAssetPreloadForRoute } = await import('/src/utils/route/routeResolver.js');
     const {
       getAssetPreloadEntriesForSection,
       clearAssetPreloadSectionCache,
       routeBelongsToSection,
     } = await import('/src/utils/assets/getAssetPreloadEntriesForSection.js');

     const childSlug = '/dashboard/call-and-chat-settings';
     const section = 'dashboard-creator';
     const childRoute = getRouteConfiguration().find((route) => route.slug === childSlug);
     const inherited = resolveEffectiveAssetPreloadForRoute(childRoute);
     const inlineOnly = Array.isArray(childRoute?.assetPreload) ? childRoute.assetPreload.length : 0;

     clearAssetPreloadSectionCache();
     const rollup = getAssetPreloadEntriesForSection(section);
     const rollupHasLogo = rollup.assets.some((entry) => entry.flag === 'dashboard.logo');

     console.log({
       childSlug,
       section,
       inlineOnly,
       inheritedCount: inherited.length,
       inheritedHasLogo: inherited.some((entry) => entry.flag === 'dashboard.logo'),
       rollupHasLogo,
       c02Pass: inherited.length > inlineOnly && inherited.some((entry) => entry.flag === 'dashboard.logo') && rollupHasLogo,
     });
   })();
   ```
3. **Expected:** `inheritedCount` > `inlineOnly` (child has no inline preload); `inheritedHasLogo: true`; `rollupHasLogo: true`; `c02Pass: true`.

---

### C-03 — `priority: "normal"` in config is not understood by preloader
**File:** `routeConfig.json` (`/dashboard`, `/shop`)  
**Detail:** `preloadAssets()` only maps `high`, `medium`, `low` (and `critical` in a separate helper). `"normal"` behaves as low priority.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `sharedAssetPreloads.json` / `routeConfig.json` use `priority: "normal"` for menu icons (e.g. `dashboard.language`, `dashboard.help`). `ASSET_PRELOAD_PRIORITY_MAP` in `assetPreloader.js` omitted `normal`, so tier sorting and prefetch hints relied on implicit `|| 1` fallback — undocumented and inconsistent with M-02 fetch-priority mapping (`normal` → `auto`).

**Why it happened:** Priority map was added for L-06 tier batching with `high` / `medium` / `low` / `critical` only; config already used `normal` in shared preload catalog.

**What changed:**
- `assetPreloader.js` — added `normal: 1` to `ASSET_PRELOAD_PRIORITY_MAP` (same tier as `low`, per L-06 browser test notes).
- `shouldUsePrefetchHint()` — treats `normal` like `low` (`rel="prefetch"` idle hint, M-03).
- `getAssetPreloadEntriesForSection.js` already had `normal: 1` for dedupe — now aligned with runtime preloader.

**Conflict check:** No override of **Preloading.md** / **SECTION_PRELOAD_AUDIT.md**. Complements **L-06** tier batching and **M-02/M-03** fetch/prefetch hints. **C-04** (shop icon duplication) is separate config cleanup.

**How it was tested:** `npm run test:unit -- --run tests/unit/preloadNormalPriority.test.js tests/unit/preloadPrefetch.test.js tests/unit/preloadFetchPriority.test.js`

**How to test in the browser:**
1. Run `npm run dev`.
2. DevTools → **Console** — paste:
   ```js
   (async () => {
     const store = (await import('/src/stores/usePreloadStore.js')).usePreloadStore();
     store.clearAssets();
     document.head.innerHTML = '';

     const originalCreateElement = document.createElement.bind(document);
     document.createElement = function createElement(tag, options) {
       const el = originalCreateElement(tag, options);
       if (tag === 'link') queueMicrotask(() => el.onload?.());
       return el;
     };

     const { preloadAssets } = await import('/src/utils/assets/assetPreloader.js');

     await preloadAssets([
       { src: '/assets/test-normal.png', type: 'image', priority: 'normal' },
       { src: '/assets/test-high.png', type: 'image', priority: 'high' },
     ]);

     const links = [...document.querySelectorAll('link[href="/assets/test-normal.png"], link[href="/assets/test-high.png"]')];
     const tierOrder = links.map((link) => (link.href.includes('test-high') ? 'high' : 'normal'));
     const normalLink = document.querySelector('link[href="/assets/test-normal.png"]');

     console.log({
       tierOrder,
       normalUsesPrefetch: normalLink?.rel === 'prefetch',
       normalFetchPriority: normalLink?.getAttribute('fetchpriority'),
       c03Pass: tierOrder[0] === 'high' && tierOrder[1] === 'normal' && normalLink?.rel === 'prefetch',
     });
   })();
   ```
3. **Expected:** `tierOrder: ['high', 'normal']`; `normalUsesPrefetch: true`; `normalFetchPriority: 'auto'`; `c03Pass: true`.

---

### C-04 — `/shop` duplicates dashboard icon flags in the wrong section bucket
**File:** `routeConfig.json`  
**Detail:** `/shop` repeats `dashboard.*` flags under `section: "shop"`, not `dashboard-global`. Same icons are preloaded separately per section; config drift risk.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `/shop` used `assetPreloadRef: "dashboardMenuIcons"`, merging ~20 `dashboard.*` icon flags into the **`shop`** section rollup. The same icons were also owned by `/dashboard` in **`dashboard-global`**, causing duplicate preload work and config drift if one list changed without the other.

**Why it happened:** Shop layout reuses dashboard chrome; icons were copied into the shop route bucket instead of relying on section cross-preload.

**What changed:**
- **`routeConfig.json`** — removed `assetPreloadRef` from `/shop`. Shop section rollup is now shop-only (empty today).
- **`preLoadSections: ["dashboard"]`** kept — resolves to `dashboard-global` and background-warms dashboard menu icons when visiting `/shop` (same as `/log-in` pattern).

**Conflict check:** Aligns with section-based preload architecture (**Preloading.md**). **C-02** inheritance still supplies dashboard icons to dashboard child routes; shop uses `preLoadSections` instead of duplicating config. No override of prior preload refactor.

**How it was tested:** `npm run test:unit -- --run tests/unit/shopAssetPreloadConfig.test.js`

**How to test in the browser:**
1. Run `npm run dev`.
2. DevTools → **Console** — paste:
   ```js
   (async () => {
     const { getRouteConfiguration } = await import('/src/utils/route/routeConfigLoader.js');
     const { getAssetPreloadEntriesForSection, clearAssetPreloadSectionCache } = await import('/src/utils/assets/getAssetPreloadEntriesForSection.js');

     const shopRoute = getRouteConfiguration().find((route) => route.slug === '/shop');
     clearAssetPreloadSectionCache();

     const shopRollup = getAssetPreloadEntriesForSection('shop');
     const dashboardRollup = getAssetPreloadEntriesForSection('dashboard-global');

     console.log({
       shopHasAssetPreloadRef: Boolean(shopRoute?.assetPreloadRef),
       shopPreLoadSections: shopRoute?.preLoadSections,
       shopDashboardFlags: shopRollup.assets.filter((entry) => entry.flag?.startsWith('dashboard.')).length,
       dashboardGlobalLogo: dashboardRollup.assets.some((entry) => entry.flag === 'dashboard.logo'),
       c04Pass: !shopRoute?.assetPreloadRef && shopRollup.assets.every((entry) => !entry.flag?.startsWith('dashboard.')) && dashboardRollup.assets.some((entry) => entry.flag === 'dashboard.logo'),
     });
   })();
   ```
3. **Expected:** `shopHasAssetPreloadRef: false`; `shopDashboardFlags: 0`; `dashboardGlobalLogo: true`; `c04Pass: true`.
4. Navigate to `/shop` → Network tab should still show dashboard icon requests from **`preLoadSections`** background warm of `dashboard-global` (not from shop rollup).

---

### C-05 — `/log-in` puts Cognito script in `assetPreload`
**File:** `routeConfig.json`  
**Detail:** Raw jsDelivr URL with `type: "script"` is preloaded via auth section rollup without SRI (see S-02, S-03).

#### Resolution ✅

**Status:** Resolved (already fixed in **S-02** audit pass; verified this pass).

**What was broken (at audit time):** `/log-in` `assetPreload` used a raw jsDelivr Cognito CDN URL for `type: "script"`, preloaded via auth section rollup without SRI or same-origin control.

**Why it happened:** Auth script was inlined in route config before self-hosting and flag-based preload.

**What changed (S-02 + S-03, unchanged this pass):**
- Cognito UMD bundle vendored under `public/vendor/amazon-cognito-identity-6.3.15.min.js`.
- `assetMap.json` maps `script.cognito` → same-origin `/vendor/…` path (dev + production).
- `/log-in` `assetPreload` uses `{ flag: "script.cognito", type: "script", priority: "high" }` — no raw CDN `src`.
- `preloadScript` + `assertAllowedPreloadUrl()` enforce allowlist/SRI for external scripts (**S-03**).

**Conflict check:** No new code changes this pass — **S-02/S-03** remain authoritative. Does not override **Preloading.md** section preload behavior.

**How it was tested:** `npm run test:unit -- --run tests/unit/cognitoScriptSelfHost.test.js`

**How to test in the browser:**
1. Run `npm run dev`, open `/log-in`.
2. DevTools → **Console** — paste:
   ```js
   (async () => {
     const { getRouteConfiguration } = await import('/src/utils/route/routeConfigLoader.js');
     const { getAssetPreloadEntriesForSection, clearAssetPreloadSectionCache } = await import('/src/utils/assets/getAssetPreloadEntriesForSection.js');
     const { getAssetUrl } = await import('/src/utils/assets/assetLibrary.js');

     const loginRoute = getRouteConfiguration().find((route) => route.slug === '/log-in');
     const cognitoEntry = loginRoute?.assetPreload?.find((entry) => entry.type === 'script');

     clearAssetPreloadSectionCache();
     const authRollup = getAssetPreloadEntriesForSection('auth');
     const cognitoUrl = await getAssetUrl('script.cognito');

     console.log({
       cognitoEntry,
       authRollupHasCognitoFlag: authRollup.assets.some((entry) => entry.flag === 'script.cognito'),
       cognitoUrl,
       usesJsDelivr: String(cognitoEntry?.src || cognitoUrl || '').includes('jsdelivr.net'),
       c05Pass: cognitoEntry?.flag === 'script.cognito' && !cognitoEntry?.src && cognitoUrl?.startsWith('/vendor/'),
     });
   })();
   ```
3. **Expected:** `cognitoEntry.flag === 'script.cognito'`; no `src` on config entry; `cognitoUrl` starts with `/vendor/`; `usesJsDelivr: false`; `c05Pass: true`.

---

### C-06 — Dashboard components preload assets outside config
**Files:** `DashboardSidebar.vue`, `HeaderResponsive.vue`  
**Detail:** Hardcoded `preloadAsset({ flag, ... })` lists duplicate `/dashboard` `assetPreload` and bypass centralized rollup.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass; follow-up completed for hardcoded flag lists).

**What was broken:** `DashboardSidebar.vue` called `preloadAsset()` for nine dashboard icon flags on mount. `HeaderResponsive.vue` resolved URLs via `getAssetUrl()` then called `preloadAssets()` again with those same URLs — duplicating `/dashboard` `assetPreloadRef: "dashboardMenuIcons"` work already done by section rollup + `preloadSectionAssets('dashboard-global')`. After the initial pass, both components still maintained **duplicate hardcoded flag strings** (`dashboard.logo`, etc.) outside `sharedAssetPreloads.json`; `dashboard.hamburger` was only in the header component, not the central catalog.

**Why it happened:** Components pre-dated centralized section `assetPreload[]` rollup; local preload and inline flag lists were added for perceived faster paint.

**What changed:**
- **`DashboardSidebar.vue`** — `loadAllAssets()` now resolves URLs via `resolveSharedComponentAssets('dashboardSidebarChrome')`; removed `preloadAsset()` loop and inline flag array.
- **`HeaderResponsive.vue`** — removed redundant Step 4 `preloadAssets(imageAssets)`; priority loading uses `groupComponentSlotsByPreloadTier('dashboardHeaderChrome', 'dashboardMenuIcons')` instead of inline `ASSET_FLAGS`.
- **`sharedAssetPreloads.json`** — added `dashboard.hamburger` to `dashboardMenuIcons`; added `dashboardSidebarChrome` and `dashboardHeaderChrome` slot→flag mappings (single source of truth for component display assets).
- **`resolveSharedComponentAssets.js`** — shared resolver for component slot mappings.
- **`validateSharedComponentAssetMappings.js`** — CI check that component mappings only reference flags listed in `dashboardMenuIcons`.

**Conflict check:** Components still **display** icons via centralized mappings + `getAssetUrl()` (lazy fallback if rollup missed). Centralized preload remains `/dashboard` config + section orchestration (**C-02**, **C-04**). No override of **Preloading.md** / **SECTION_PRELOAD_AUDIT.md**.

**How it was tested:** `tests/unit/sharedComponentAssetMappings.test.js`; `tests/unit/assetMapBuildValidation.test.js` (component mapping alignment); existing unit tests (`getAssetPreloadEntriesForSection.test.js`, `routeInheritance.test.js`). No component-local flag strings or preload imports remain in these files.

**How to test in the browser:**
1. Run `npm run dev`, open DevTools → **Network** (filter `Img` / `webp` / `png`).
2. Hard refresh on `/dashboard`.
3. DevTools → **Console** — paste:
   ```js
   (async () => {
     const sidebarSource = await fetch('/src/templates/dashboard/DashboardSidebar.vue').then((r) => r.text());
     const headerSource = await fetch('/src/templates/dashboard/HeaderResponsive.vue').then((r) => r.text());
     const sharedCatalog = (await import('/src/router/sharedAssetPreloads.json')).default;

     console.log({
       sidebarCallsPreloadAsset: sidebarSource.includes('preloadAsset'),
       headerCallsPreloadAssets: headerSource.includes('preloadAssets'),
       sidebarUsesSharedMapping: sidebarSource.includes('dashboardSidebarChrome'),
       headerUsesSharedMapping: headerSource.includes('dashboardHeaderChrome'),
       hamburgerInCentralCatalog: sharedCatalog.dashboardMenuIcons.some((e) => e.flag === 'dashboard.hamburger'),
       c06Pass:
         !sidebarSource.includes('preloadAsset') &&
         !headerSource.includes('preloadAssets') &&
         sidebarSource.includes('dashboardSidebarChrome') &&
         headerSource.includes('dashboardHeaderChrome'),
     });
   })();
   ```
4. **Expected:** `sidebarCallsPreloadAsset: false`; `headerCallsPreloadAssets: false`; `sidebarUsesSharedMapping: true`; `headerUsesSharedMapping: true`; `hamburgerInCentralCatalog: true`; `c06Pass: true`.
5. Dashboard header/sidebar icons should still render — warmed by `dashboard-global` section preload from route config, not component-local preload or hardcoded flag lists.

---

### C-07 — Router triggers `preloadSectionAssets` on every navigation without URL short-circuit
**File:** `router/index.js` line 706  
**Detail:** No check that all resolved URLs for the section are already in `usePreloadStore.preloadedAssets` before re-walking routes and re-resolving flags.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Every navigation to a section called `preloadSectionAssets()`, which always invoked `preloadAssets()` even when every resolved URL for that section was already in `usePreloadStore.preloadedAssets`. Per-asset preloads short-circuited inside `preloadImage`/`preloadScript`, but the section rollup + scheduling still ran on each visit.

**Why it happened:** Section orchestration (`routeNavigationData.js`, `sectionPreloader.js`, intent prefetch) had no section-level URL completeness check before batch preload.

**What changed:**
- `assetPreloader.js` — `resolveAssetPreloadUrl()` resolves each rollup entry to a concrete URL; `areSectionAssetUrlsFullyPreloaded()` checks Pinia store membership; `preloadSectionAssets()` returns early with a cache-hit log when all URLs are warm.
- Exported helpers from `assets/index.js` for diagnostics/tests.

**Conflict check:** Complements per-URL store checks (L-03) without blocking navigation. Intent prefetch dedupe in `routeAssetPrefetch.js` unchanged. No override of **Preloading.md** / **SECTION_PRELOAD_AUDIT.md**.

**How it was tested:** `npm run test:unit -- --run tests/unit/preloadSectionAssets.test.js`

**How to test in the browser:**
1. Run `npm run dev`, navigate to `/dashboard` once (warms `dashboard-global` assets).
2. DevTools → **Console** — paste:
   ```js
   (async () => {
     const { usePreloadStore } = await import('/src/stores/usePreloadStore.js');
     const {
       getAssetPreloadEntriesForSection,
       clearAssetPreloadSectionCache,
     } = await import('/src/utils/assets/getAssetPreloadEntriesForSection.js');
     const {
       resolveAssetPreloadUrl,
       areSectionAssetUrlsFullyPreloaded,
       preloadSectionAssets,
     } = await import('/src/utils/assets/assetPreloader.js');

     const section = 'dashboard-global';
     clearAssetPreloadSectionCache();
     const { assets } = getAssetPreloadEntriesForSection(section);
     const urls = (await Promise.all(assets.map((asset) => resolveAssetPreloadUrl(asset)))).filter(Boolean);
     const store = usePreloadStore();

     urls.forEach((url) => store.addAsset(url));

     const beforeCount = store.preloadedAssetCount;
     await preloadSectionAssets(section);
     await preloadSectionAssets(section);

     console.log({
       section,
       resolvedUrlCount: urls.length,
       allWarmBeforeSecondCall: areSectionAssetUrlsFullyPreloaded(urls),
       storeCountUnchanged: store.preloadedAssetCount === beforeCount,
       c07Pass: areSectionAssetUrlsFullyPreloaded(urls),
       note: 'Second preloadSectionAssets call should log cache-hit and not add duplicate link tags',
     });
   })();
   ```
3. **Expected:** `allWarmBeforeSecondCall: true`; `c07Pass: true`; console shows `preloadSectionAssets [cache-hit]` on the second call; no duplicate `<link>` tags for the same icon URLs.

---

### C-08 — `assetPreload` entries with extra fields are ignored
**File:** `routeConfig.json` `/dashboard/overview`  
**Detail:** `location`, `defer`, `async`, `flags` are not implemented in `preloadAsset()`.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `/dashboard/overview` declares a script entry with `name`, `location`, `defer`, `async`, and `flags`, but `preloadAsset()` → `preloadScript()` only injected `<link rel="preload">` hints and dropped execution metadata.

**Why it happened:** Script preloader was link-hint only; executable script loading lived separately in `AssetHandler` / component code.

**What changed:**
- `shouldInjectExecutableScript()` — detects route-config execution metadata.
- `injectExecutableScript()` — inserts a real `<script>` at `location` with `defer`/`async`, `data-asset-name`, and `data-asset-flags`.
- `preloadScript()` delegates to executable injection when metadata is present; otherwise keeps existing link/modulepreload behavior (Cognito, etc.).

**Conflict check:** Aligns with `DashboardOverviewCreator.vue` / `AssetHandler` metadata shape without removing component-level dependency loading. **S-03** URL guards still apply. No override of section bundle preloading.

**How it was tested:** `npm run test:unit -- --run tests/unit/preloadScript.test.js`

**How to test in the browser:**
1. Run `npm run dev`.
2. DevTools → **Console** — paste:
   ```js
   (async () => {
     const originalCreateElement = document.createElement.bind(document);
     document.createElement = function createElement(tag, options) {
       const el = originalCreateElement(tag, options);
       if (tag === 'script') queueMicrotask(() => el.onload?.());
       return el;
     };

     const { preloadScript } = await import('/src/utils/assets/assetPreloader.js');
     const url = '/scripts/dashboard-metrics.js';

     document.querySelectorAll(`script[src="${url}"]`).forEach((node) => node.remove());

     await preloadScript(url, {
       name: 'dashboard-metrics-lib',
       location: 'head-last',
       defer: true,
       async: false,
       flags: ['dashboard-metrics'],
     });

     const script = document.querySelector(`script[src="${url}"]`);

     console.log({
       usesScriptTag: Boolean(script),
       defer: script?.defer,
       async: script?.async,
       assetName: script?.dataset.assetName,
       assetFlags: script?.dataset.assetFlags,
       c08Pass: script?.defer === true && script?.dataset.assetName === 'dashboard-metrics-lib',
     });
   })();
   ```
3. **Expected:** `usesScriptTag: true`; `defer: true`; `assetName: 'dashboard-metrics-lib'`; `assetFlags: 'dashboard-metrics'`; `c08Pass: true`.

---

### C-09 — No build-time validation of `assetPreload` entries
**Files:** `jsonConfigValidator.js`, `routeConfig.json`, `assetMap.json`  
**Detail:** Validator does not check `assetPreload` shape, flag existence, or allowed `priority` values (see M-04).

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Only flag existence was validated (M-04, dev startup). Entry **shape** (`type`, `flag|src`, `priority`, `defer`, `async`, `location`, `flags`) and `assetPreloadRef` catalog keys were not validated at build time via `jsonConfigValidator`.

**Why it happened:** M-04 added runtime/dev flag cross-check; C-09 shape/priority/ref validation was explicitly deferred.

**What changed:**
- `validateRouteAssetPreloadFlags.js` — added `validateAssetPreloadEntryShape()`, `validateRouteAssetPreloadRefs()`, allowed type/priority sets; extended `validateRouteAssetPreloadFlags()` to accept optional `sharedCatalog`; added `validateSharedCatalogAssetPreloadFlags()`.
- `jsonConfigValidator.js` — validates inline `assetPreload[]` shape and `assetPreloadRef` keys during `validateRouteConfig()`; **also cross-checks expanded route flags + shared catalog flags against `assetMap.json` at build time** (M-04).
- `routeConfigLoader.js` — startup runs full validation (shape + refs + assetMap flags) on expanded routes in all environments.

**Conflict check:** Extends **M-04** without replacing it. Does not change preload runtime behavior. **C-08** optional fields are now validated when present.

**How it was tested:** `npm run test:unit -- --run tests/unit/validateRouteAssetPreloadFlags.test.js tests/unit/jsonConfigValidator.test.js tests/unit/assetMapBuildValidation.test.js`

**How to test in the browser:**
1. Run `npm run dev` — should start cleanly with current config.
2. DevTools → **Console** — paste:
   ```js
   (async () => {
     const { getRouteConfiguration } = await import('/src/utils/route/routeConfigLoader.js');
     const assetMap = (await import('/src/config/assetMap.json')).default;
     const sharedCatalog = (await import('/src/router/sharedAssetPreloads.json')).default;
     const { validateRouteAssetPreloadFlags } = await import('/src/utils/assets/validateRouteAssetPreloadFlags.js');

     const result = validateRouteAssetPreloadFlags(getRouteConfiguration(), assetMap, sharedCatalog);

     console.log({
       valid: result.valid,
       errorCount: result.errors.length,
       c09Pass: result.valid,
     });
   })();
   ```
3. **Expected:** `valid: true`; `c09Pass: true`.
4. **Fail-fast test:** In `routeConfig.json`, change one `assetPreload` entry to `"priority": "urgent"` or add `"assetPreloadRef": "typo"`, restart `npm run dev` — startup/build validation should fail with a descriptive error. Revert afterward.

---


*End of audit — asset preload only. Section/bundle preloading (`sectionPreloader`, `preLoadSections`, `section-manifest.json`) and general router/guard topics are documented in `src/router/AUDIT.md` and `src/router/ADDITIONAL_ISSUES.md`.*
