# Asset Library — Audit Report

**Scope:** `assetLibrary.js`, `cacheHandler.js`, `usePreloadStore.js`, `assetMap.json` (both copies), and all call sites that resolve or look up asset flags. **Out of scope:** `<link rel="preload">` DOM injection (`assetPreloader.js`), section JS/CSS bundle loading, and the existing `ASSET_PRELOAD_AUDIT.md` issues (those are tracked separately).

**Files audited:**
- `src/utils/assets/assetLibrary.js` (1 062 lines)
- `src/utils/assets/index.js`
- `src/utils/common/cacheHandler.js` (216 lines)
- `src/stores/usePreloadStore.js` (68 lines)
- `src/config/assetMap.json` + `public/config/assetMap.json`
- `src/utils/assets/assetHandlerFactory.js`
- `src/router/index.js` (asset resolution call sites)
- `src/templates/dashboard/DashboardSidebar.vue`, `HeaderResponsive.vue`
- `src/assets/data/menuItems.js`

**System summary:**  
`assetMap.json` maps string flags (e.g. `"dashboard.logo"`) to environment-specific URLs. `assetLibrary.getAssetUrl(flag)` loads the map once, detects the environment, applies environment inheritance (dev/staging → production fallback), caches the resolved URL, and returns it. Section-level asset metadata (bundle paths + `assetPreload` configs) is a secondary concern managed by `loadAssetsForSection`. `usePreloadStore` persists the list of already-preloaded URLs to `localStorage`. `cacheHandler` provides an in-memory TTL key/value store shared across the application.

**User requirements addressed by this audit:**
1. Asset library must load to cache on startup (eager init, not lazy)
2. Lookups must be fast and cached at every layer
3. Lookup hits and misses must be logged clearly
4. A **global** asset library and a **per-section** asset library must both exist; section-level entries take precedence over global entries when merging

---

## 1. Logical Errors

### L-01 — `clearAssetCaches()` does not reset `cachedAssetMap`
**File:** `assetLibrary.js` line 476  
**Detail:** `clearAssetCaches()` calls `loadedAssets.clear()`, sets `cachedManifest = null`, and calls `clearAllCache()` (which wipes `cacheHandler`). However, the in-memory variable `cachedAssetMap` (line 54) is **never set to null**. After a cache clear, the next call to `loadAssetMapConfig()` returns the stale in-memory map immediately (line 643–646) instead of re-fetching. Cache clears are therefore silently ineffective for flag resolution.

**Fix:**
```js
export function clearAssetCaches() {
  loadedAssets.clear();
  cachedManifest = null;
  cachedAssetMap = null;   // ← add this
  assetMapLoadPromise = null; // ← and this
  clearAllCache();
}
```

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `clearAssetCaches()` cleared `loadedAssets`, `cachedManifest`, and the shared `cacheHandler`, but left module-level `cachedAssetMap` and `assetMapLoadPromise` set. The next `loadAssetMapConfig()` hit the memory fast path and returned a stale map; cache clears had no effect on flag resolution until a full reload.

**Why it happened:** Asset-map caching was split between `cacheHandler` and module memory; only `setEnvironment()` was later wired to `clearAssetMapConfigCache()` from the asset-preload refactor, not the global clear API.

**What changed:**
- `clearAssetCaches()` now calls existing `clearAssetMapConfigCache()` (same as `setEnvironment()`), which sets `cachedAssetMap = null`, `assetMapLoadPromise = null`, `assetMapConfigSource = null`, and removes `ASSET_MAP_CACHE_KEY` before `clearAllCache()`.
- No conflict with section/asset preload work — reuses the helper added for S-06 / `setEnvironment`, does not change preload orchestration.

**How it was tested:** `npm run test:unit -- tests/unit/assetMapConfig.test.js --run` (new L-01 case).

**How to test in the browser:**
1. Run `npm run dev`, open the app, **Console** (one paste):
   ```js
   (async () => {
     const { loadAssetMapConfig, clearAssetCaches } = await import('/src/utils/assets/assetLibrary.js');
     const map1 = await loadAssetMapConfig();
     map1.development['audit.l01.stale'] = 'https://example.com/stale';
     clearAssetCaches();
     const map2 = await loadAssetMapConfig();
     console.log({
       staleGone: map2.development['audit.l01.stale'] === undefined,
       newObject: map1 !== map2,
       pass: map2.development['audit.l01.stale'] === undefined && map1 !== map2,
     });
   })();
   ```
2. **Expected:** `pass: true` — after `clearAssetCaches()`, the map is reloaded (mutation gone; `map1 !== map2` if a fresh object was loaded).

---

### L-02 — `waitForAssetLoad` uses a busy-polling loop instead of a shared Promise
**File:** `assetLibrary.js` lines 256–301  
**Detail:** When a concurrent caller finds a load in progress, `waitForAssetLoad` polls `loadedAssets` with `setTimeout(100ms)` for up to 5 seconds. This generates up to 50 micro-tasks per waiter, introduces 0–100 ms latency jitter, and misses the result if the load finishes between polls. The standard pattern is to store the in-flight `Promise` in a map and return it to all waiters directly — exactly what `assetMapLoadPromise` already does for the map fetch. `assetsLoadingInProgress` should store the Promise, not just a Set membership.

**Fix (sketch):**
```js
const assetsLoadingPromises = new Map(); // sectionName → Promise

// In loadAssetsForSection — instead of Set:
if (assetsLoadingPromises.has(sectionName)) {
  return assetsLoadingPromises.get(sectionName);
}
const promise = (async () => { /* ... */ })();
assetsLoadingPromises.set(sectionName, promise);
try { return await promise; } finally { assetsLoadingPromises.delete(sectionName); }
```

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Concurrent `loadAssetsForSection(section)` callers used `waitForAssetLoad`, which polled `loadedAssets` every 100ms for up to 5s. That added latency jitter, wasted timers, and could return `timeout` / `error` even when the primary load succeeded.

**Why it happened:** Early dedup used a `Set` membership flag instead of sharing the in-flight `Promise` (unlike `assetMapLoadPromise` and `sectionPreloader`’s shared-promise pattern).

**What changed:**
- Replaced `assetsLoadingInProgress` (`Set`) with `assetsLoadingPromises` (`Map<sectionName, Promise>`).
- Concurrent callers `return assetsLoadingPromises.get(sectionName)` directly; removed `waitForAssetLoad`.
- `loadAssetsForSection` is a plain function (not `async`) so it returns the same `Promise` reference as `preloadSection` — an `async` wrapper would break `p1 === p2`.
- `clearAssetCaches()` now calls `assetsLoadingPromises.clear()` (partially addresses A-L04 in-flight tracking).
- Aligns with section preload refactor (`sectionPreloader.js` “sharing promise”) — no override of preload orchestration.

**How it was tested:** `npm run test:unit -- tests/unit/loadAssetsForSectionDedup.test.js --run`

**How to test in the browser:**
1. Run `npm run dev`, open the app, **Console** (one paste):
   ```js
   (async () => {
     const { loadAssetsForSection, getAssetStatistics } = await import('/src/utils/assets/assetLibrary.js');
     const t0 = performance.now();
     const p1 = loadAssetsForSection('auth');
     const p2 = loadAssetsForSection('auth');
     const [a, b] = await Promise.all([p1, p2]);
     console.log({
       samePromise: p1 === p2,
       sameResult: a === b,
       sectionName: a?.sectionName,
       loadMs: Math.round(performance.now() - t0),
       inProgressAfter: getAssetStatistics().loadingInProgress,
       pass: p1 === p2 && a === b && a?.sectionName === 'auth' && getAssetStatistics().loadingInProgress.length === 0,
     });
   })();
   ```
2. **Expected:** `pass: true`, `sameResult: true`, `inProgressAfter: []`, and no repeated `[waitForAssetLoad]` log lines (function removed).

---

### L-03 — `assetMapLoadPromise` is set to `null` in `finally` before all waiters have consumed it
**File:** `assetLibrary.js` lines 663–715  
**Detail:** The load flow is: check `cachedAssetMap` → check `cacheHandler` → check `assetMapLoadPromise` → if none, create the IIFE and assign to `assetMapLoadPromise`. The `finally` block sets `assetMapLoadPromise = null` when the fetch resolves. A caller that picks up the promise (line 659) and awaits it is fine; but a new caller that arrives between the resolve settling and the `finally` running may see `assetMapLoadPromise = null` and start a duplicate fetch race. This is a classic "promise nulled too early" race. The fix is to keep `assetMapLoadPromise` alive until after `cachedAssetMap` is written (move null-assignment after `cachedAssetMap = assetMap`).

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `loadAssetMapConfig` cleared `assetMapLoadPromise` in an inner `finally` on the load IIFE. That could null the in-flight pointer before `cachedAssetMap` was visible to a new caller, allowing a duplicate map load/fetch race.

**Why it happened:** The dedup pointer was cleared in the async IIFE’s `finally` instead of after cache population, and `loadAssetMapConfig` was `async` (extra promise wrapper).

**What changed:**
- Removed inner `finally { assetMapLoadPromise = null }`; `cachedAssetMap` is set in `try`/`catch` before the load promise settles.
- Track loads with `sharedPromise = loadPromise.finally(() => { assetMapLoadPromise = null })` so the dedup pointer stays until the shared load fully completes.
- `loadAssetMapConfig` is a plain function returning `Promise.resolve(cached)` or the shared promise (same pattern as L-02 / `preloadSection`).
- No conflict with asset-preload / S-06 work — complements existing `clearAssetMapConfigCache()` (A-L09 already clears `assetMapLoadPromise` on env switch).

**How it was tested:** `npm run test:unit -- tests/unit/assetMapConfig.test.js --run` (new L-03 case).

**How to test in the browser:**
1. Run `npm run dev` with `VITE_ASSET_MAP_RUNTIME_OVERRIDE=true`, open the app, **Console** (one paste):
   ```js
   (async () => {
     const { clearAssetMapConfigCache, loadAssetMapConfig } = await import('/src/utils/assets/assetLibrary.js');
     clearAssetMapConfigCache();
     const t0 = performance.now();
     const p1 = loadAssetMapConfig();
     const p2 = loadAssetMapConfig();
     const [m1, m2] = await Promise.all([p1, p2]);
     console.log({
       samePromise: p1 === p2,
       sameMap: m1 === m2,
       cognito: m1?.production?.['script.cognito'],
       loadMs: Math.round(performance.now() - t0),
       pass: p1 === p2 && m1 === m2 && !!m1?.production?.['script.cognito'],
     });
   })();
   ```
2. **Expected:** `pass: true`, `samePromise: true`; Network tab shows at most one `assetMap.json` fetch for the pair; logs show `[waiting]` on the second call, not a second `[fetch]`.

---

### L-04 — `areAssetsLoadedForSection` only checks the in-memory `loadedAssets` Map, not `cacheHandler`
**File:** `assetLibrary.js` line 415–419  
**Detail:** `loadedAssets` is a module-level in-memory `Map` that is lost on page reload. After a reload, even if `cacheHandler` holds a valid TTL entry for the section, `areAssetsLoadedForSection` returns `false`, causing components to incorrectly believe the section needs reloading and triggering redundant work. `getAssetsForSection` correctly checks both memory and cache (lines 394–403); `areAssetsLoadedForSection` should call `getAssetsForSection(sectionName) !== null` for consistency.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `areAssetsLoadedForSection` only called `loadedAssets.has(sectionName)`. After a full page reload, TTL entries in `cacheHandler` could still hold section metadata, but this API reported “not loaded” and callers triggered redundant `loadAssetsForSection` work.

**Why it happened:** Memory map and TTL cache were updated on load, but the boolean check ignored the cache layer that survives reloads (until expiry).

**What changed:**
- `areAssetsLoadedForSection` now uses `getAssetsForSection(sectionName) !== null`, matching `getAssetLoadingState` and rehydrating `loadedAssets` from cache on hit (partially helps **A-B02** for callers of this API).
- No conflict with section/asset preload refactors — read-only consistency fix.

**How it was tested:** `npm run test:unit -- tests/unit/areAssetsLoadedForSection.test.js --run`

**How to test in the browser:**
1. Run `npm run dev`, open the app, load a section once (e.g. navigate to login/auth), then **Console** (one paste):
   ```js
   (async () => {
     const {
       loadAssetsForSection,
       areAssetsLoadedForSection,
       getAssetStatistics,
       clearAssetCaches,
     } = await import('/src/utils/assets/assetLibrary.js');
     await loadAssetsForSection('auth');
     const statsBefore = getAssetStatistics().loadedSections;
     clearAssetCaches();
     const { setValueWithExpiration } = await import('/src/utils/common/cacheHandler.js');
     setValueWithExpiration('asset_metadata_auth', {
       sectionName: 'auth',
       bundlePaths: { js: '/x.js', css: '/x.css' },
       assetPreloadConfigs: [],
       state: 'loaded',
     }, 3600000);
     console.log({
       memoryEmptyAfterClear: getAssetStatistics().loadedSections.length === 0,
       loadedViaCheck: areAssetsLoadedForSection('auth'),
       rehydratedInMemory: getAssetStatistics().loadedSections.includes('auth'),
       pass:
         getAssetStatistics().loadedSections.length === 0 &&
         areAssetsLoadedForSection('auth') &&
         getAssetStatistics().loadedSections.includes('auth'),
     });
   })();
   ```
2. **Expected:** `pass: true` — check returns `true` from TTL cache even when memory was cleared; `loadedSections` includes `auth` after the check.

**How this test connects to the issue:** L-04 was about `areAssetsLoadedForSection` ignoring `cacheHandler`. The script clears memory with `clearAssetCaches`, seeds only the TTL key for `auth`, then calls the fixed boolean API.

**How the result proves the fix:** If the API still read only `loadedAssets`, `loadedViaCheck` would be `false` after memory was cleared. `pass: true` with `loadedViaCheck: true` and `rehydratedInMemory: true` shows the check reads TTL cache via `getAssetsForSection` and repopulates memory — the L-04 behavior.

---

### L-05 — `unloadUnusedSections` comments that individual cache key deletion is not possible, but `removeFromCache` exists
**File:** `assetLibrary.js` lines 538–542  
**Detail:** The comment on line 540 reads: *"Note: cacheHandler doesn't expose individual key deletion, but TTL will handle it"*. This is incorrect — `cacheHandler.js` exports `removeFromCache(key)` (line 152). Section cache entries are therefore never actively evicted; only TTL expiry removes them, keeping stale entries in memory for up to 1 hour after the section is unloaded.

**Fix:**
```js
keysToDelete.forEach(sectionName => {
  loadedAssets.delete(sectionName);
  removeFromCache(ASSET_CACHE_KEY_PREFIX + sectionName); // was missing
  unloadedCount++;
});
```

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `unloadUnusedSections` deleted section metadata from the in-memory `loadedAssets` map but left TTL entries in `cacheHandler` (`asset_metadata_{section}`). After unload, `areAssetsLoadedForSection` / `getAssetsForSection` could still find the section in cache (especially after L-04), so “unloaded” sections were not actually evicted until the 1-hour TTL expired.

**Why it happened:** A stale comment claimed `cacheHandler` had no per-key delete API; `cacheKey` was computed but never passed to `removeFromCache`.

**What changed:**
- Each evicted section now calls `removeFromCache(ASSET_CACHE_KEY_PREFIX + sectionName)` alongside `loadedAssets.delete`.
- Removed the incorrect comment.
- **M-07** (per-flag `asset_url_*` eviction on section unload) remains a separate follow-up.

**How it was tested:** `npm run test:unit -- tests/unit/unloadUnusedSections.test.js --run`

**How to test in the browser:**
1. Run `npm run dev`, open the app, **Console** (one paste):
   ```js
   (async () => {
     const { setValueWithExpiration, getValueFromCache } = await import('/src/utils/common/cacheHandler.js');
     const {
       clearAssetCaches,
       getAssetsForSection,
       unloadUnusedSections,
       areAssetsLoadedForSection,
     } = await import('/src/utils/assets/assetLibrary.js');
     clearAssetCaches();
     setValueWithExpiration('asset_metadata_auth', { sectionName: 'auth', state: 'loaded', bundlePaths: {}, assetPreloadConfigs: [] }, 3600000);
     setValueWithExpiration('asset_metadata_shop', { sectionName: 'shop', state: 'loaded', bundlePaths: {}, assetPreloadConfigs: [] }, 3600000);
     getAssetsForSection('auth');
     getAssetsForSection('shop');
     unloadUnusedSections(['auth']);
     console.log({
       authStillLoaded: areAssetsLoadedForSection('auth'),
       shopLoadedAfterUnload: areAssetsLoadedForSection('shop'),
       shopCacheKeyGone: getValueFromCache('asset_metadata_shop') === null,
       authCacheKeyRemains: getValueFromCache('asset_metadata_auth') !== null,
       pass:
         areAssetsLoadedForSection('auth') &&
         !areAssetsLoadedForSection('shop') &&
         getValueFromCache('asset_metadata_shop') === null &&
         getValueFromCache('asset_metadata_auth') !== null,
     });
   })();
   ```
2. **Expected:** `pass: true`, `shopCacheKeyGone: true`, `shopLoadedAfterUnload: false`, `authStillLoaded: true`.

**How this test connects to the issue:** The bug was a split brain between memory and TTL cache on unload. This script loads `auth` and `shop` into both layers, runs `unloadUnusedSections(['auth'])` (the API under test), then checks whether `shop` is gone from **both** the boolean loader API and the raw `cacheHandler` key `asset_metadata_shop`.

**How the result proves the fix:** Before the fix, `shopLoadedAfterUnload` could still be `true` and `shopCacheKeyGone` `false` because TTL cache kept `asset_metadata_shop` for up to an hour. After the fix, a successful run must show `shop` not loaded and its cache key `null`, while `auth` remains in cache — proving eviction calls `removeFromCache`, not only `loadedAssets.delete`.

---

### L-06 — `setEnvironment` does not invalidate per-flag URL cache entries in `cacheHandler`
**File:** `assetLibrary.js` lines 612–623  
**Detail:** `setEnvironment(env)` sets `cachedAssetMap = null` to force a map reload. However, resolved URLs are cached individually under keys like `asset_url_development_icon.cart` in `cacheHandler` with a 30-minute TTL. After switching environments these stale entries are served without re-resolving against the new environment. All `ASSET_URL_CACHE_PREFIX + '*'` keys must be evicted on environment change — use a prefix-scan or a version/generation counter pattern.

#### Resolution ✅

**Status:** Already resolved (asset preload refactor — see `ASSET_PRELOAD_AUDIT.md` L-07). No additional code change in this pass.

**What was broken:** `setEnvironment()` cleared in-memory `cachedAssetMap` only. Resolved URLs under `asset_url_{env}_{flag}` in `cacheHandler` could be served for 30 minutes after an env switch, so `getAssetUrl` could return URLs resolved for the previous environment.

**Why it happened:** URL resolution caching was added without invalidation on manual environment changes.

**What is in place now (do not re-implement):**
- `removeCacheKeysByPrefix()` in `cacheHandler.js` (from preload work).
- `setEnvironment()` calls `clearAssetMapConfigCache()` and `removeCacheKeysByPrefix(ASSET_URL_CACHE_PREFIX)` in `assetLibrary.js`.

**How it was tested:** `npm run test:unit -- tests/unit/setEnvironmentUrlCache.test.js --run` (regression guard for this audit).

**How to test in the browser:**
1. Run `npm run dev`, **Console** (one paste). Use `icon.cart` — dev and production URLs differ in `assetMap.json` (`cart-dev.svg` vs CDN). Do **not** use `script.cognito` for this test: it is the same path in both envs, so `prodUrl !== cachedBeforeSwitch` fails even when cache clearing works.
   ```js
   (async () => {
     const { getAssetUrl, setEnvironment } = await import('/src/utils/assets/assetLibrary.js');
     const { getValueFromCache } = await import('/src/utils/common/cacheHandler.js');
     const flag = 'icon.cart';
     const devKey = `asset_url_development_${flag}`;

     const devUrl = await getAssetUrl(flag, 'development');
     const cachedBeforeSwitch = getValueFromCache(devKey);

     setEnvironment('production');
     const cachedAfterSwitch = getValueFromCache(devKey);
     const prodUrl = await getAssetUrl(flag, 'production');

     console.log({
       devUrl,
       prodUrl,
       hadDevCacheBeforeSwitch: cachedBeforeSwitch !== null,
       devCacheClearedAfterSwitch: cachedAfterSwitch === null,
       urlsDifferByEnv: devUrl !== prodUrl,
       pass:
         cachedBeforeSwitch !== null &&
         cachedAfterSwitch === null &&
         devUrl !== null &&
         prodUrl !== null &&
         devUrl !== prodUrl,
     });
   })();
   ```
2. **Expected:** `pass: true`, `devCacheClearedAfterSwitch: true`, `urlsDifferByEnv: true`, `devUrl` contains `cart-dev`, `prodUrl` contains `cdn.example.com`. Logs after `setEnvironment` should show `removeCacheKeysByPrefix` with `prefix: 'asset_url_'` and `removedCount > 0`.

**How this test connects to the issue:** L-06 is about stale **per-flag URL** entries (`asset_url_*`), not the asset map. The script resolves `icon.cart` in `development` (populating `asset_url_development_icon.cart`), switches env with `setEnvironment`, then checks whether that dev key was removed and production resolves from the map (not a leftover dev cache hit).

**How the result proves the fix:** If URL caches were not cleared, `devCacheClearedAfterSwitch` would be `false` and production could return the dev-cached URL (`cart-dev.svg`). Your run already showed the fix working when `devCacheClearedAfterSwitch: true` and logs showed `removeCacheKeysByPrefix` — the old `pass: false` was only because `script.cognito` shares one URL in both environments. With `icon.cart`, `pass: true` also confirms production resolved a different URL after the cache wipe.

---

### L-07 — `getAvailableAssetFlags` merges production into env flags but `getAssetsByCategory` does not respect staging overrides
**File:** `assetLibrary.js` lines 917–934  
**Detail:** `getAvailableAssetFlags` adds production flags first and then overlays env-specific flags (correct inheritance). `getAssetsByCategory` does the reverse: it reads `assetMap[env]` first, then fills gaps from production (also correct), but it never applies the `env` override if a flag exists in **both** staging and production — staging/dev entries would overwrite production ones only if the outer condition (`!matchingAssets[flag]`) is not triggered. Actually the logic here is inverted: it sets the env value first, then checks `!matchingAssets[flag]` for production, which is correct. However it is inconsistent with `getAvailableAssetFlags` which adds production first. The two functions should share the same resolution helper to avoid future divergence.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** Flag inheritance was implemented twice (Set union vs env-then-fill-gaps). Behavior was mostly equivalent today, but the duplicate logic risked future drift if one path changed.

**Why it happened:** APIs were added at different times without a shared “production base + env override” merge.

**What changed:**
- Added private `resolveAssetMapForEnvironment(assetMap, env)` — copies `production`, then overlays `assetMap[env]` when `env !== 'production'`.
- `getAvailableAssetFlags` and `getAssetsByCategory` both use this helper.
- No conflict with preload refactors — read-only map resolution only.

**How it was tested:** `npm run test:unit -- tests/unit/resolveAssetMapForEnvironment.test.js --run`

**How to test in the browser:**
1. Run `npm run dev`, **Console** (one paste):
   ```js
   (async () => {
     const { getAssetsByCategory, getAvailableAssetFlags } = await import('/src/utils/assets/assetLibrary.js');
     const stagingIcons = await getAssetsByCategory('icon', 'staging');
     const stagingFlags = await getAvailableAssetFlags('staging');
     const iconFlagKeys = stagingFlags.filter((f) => f.startsWith('icon.')).sort();
     console.log({
       cartIsStaging: stagingIcons['icon.cart'] === '/assets/icons/cart-staging.svg',
       userFromProduction: stagingIcons['icon.user'] === 'https://cdn.example.com/assets/icons/user.svg',
       categoryKeysMatchFlags: Object.keys(stagingIcons).sort().join() === iconFlagKeys.join(),
       pass:
         stagingIcons['icon.cart'] === '/assets/icons/cart-staging.svg' &&
         stagingIcons['icon.user'] === 'https://cdn.example.com/assets/icons/user.svg' &&
         Object.keys(stagingIcons).sort().join() === iconFlagKeys.join(),
     });
   })();
   ```
2. **Expected:** `pass: true`, `cartIsStaging: true`, `userFromProduction: true` — staging `icon.cart` overrides production; `icon.user` only exists in production and is inherited.

**How this test connects to the issue:** L-07 is about **consistent env inheritance** across APIs. Staging defines only `icon.cart` and `logo.main`, but production has many `icon.*` flags. The test checks that `getAssetsByCategory('icon', 'staging')` returns staging cart **and** inherited production icons, and that those keys match `getAvailableAssetFlags('staging')` for the `icon.` prefix.

**How the result proves the fix:** If merge logic diverged, you could get wrong URLs (e.g. production `icon.cart` CDN URL instead of `cart-staging.svg`) or mismatched flag sets between the two functions. `pass: true` with `cartIsStaging` and `categoryKeysMatchFlags` proves both APIs use the same production-base + staging-override merge via `resolveAssetMapForEnvironment`.

---

### L-08 — `validateAssetMap` accepts a broken `icon.globe` URL without raising an error
**File:** `assetMap.json` lines 9 (dev) and 51 (prod); `assetLibrary.js` line 1016  
**Detail:** The URL `https://i.ibb.co.com/mF9x2JG0/...` contains the typo `co.com` instead of `co`. The validator only checks that the string starts with `/`, `http://`, or `https://` — it does not check that the hostname is structurally valid or that it resolves. This URL will always return a 404 and, worse, could be registered by a third party to serve hostile content.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** `icon.globe` used `https://i.ibb.co.com/...` (invalid host). `validateAssetMap()` only checked URL prefix shape, so the typo shipped without an error.

**Why it happened:** No hostname validation on remote asset URLs; config typo (`co.com` vs `co`).

**What changed:**
- **Config:** `icon.globe` already corrected to `https://i.ibb.co/...` in `src/config/assetMap.json` and `public/config/assetMap.json` (also covered by `ASSET_PRELOAD_AUDIT.md` S-07 — not re-done here).
- **Validator:** Added `validateRemoteAssetUrl()` — flags `.co.com` double-TLD hosts and invalid ImgBB hosts (`ibb.co` but not exactly `i.ibb.co`). `validateAssetMap()` now pushes **errors** for those URLs on `http://` and `https://` entries.

**How it was tested:** `npm run test:unit -- tests/unit/validateAssetMapHostname.test.js tests/unit/iconGlobeUrl.test.js --run`

**How to test in the browser:**
1. Run `npm run dev`, **Console** (one paste):
   ```js
   (async () => {
     const { validateAssetMap, getAssetUrl } = await import('/src/utils/assets/assetLibrary.js');
     const validation = await validateAssetMap();
     const globe = await getAssetUrl('icon.globe');
     const hostname = globe ? new URL(globe).hostname : null;
     console.log({
       mapValid: validation.valid,
       globeUrl: globe,
       globeHostname: hostname,
       noGlobeErrors: !validation.errors.some((e) => e.includes('icon.globe')),
       pass: validation.valid && hostname === 'i.ibb.co' && !validation.errors.some((e) => e.includes('icon.globe')),
     });
   })();
   ```
2. **Expected:** `pass: true`, `globeHostname: 'i.ibb.co'`, `mapValid: true` — current map is clean and validator reports no `icon.globe` errors.

**How this test connects to the issue:** L-08 is two parts: (1) bad `icon.globe` data, (2) validator blind to hostname typos. The script runs `validateAssetMap()` on your real map and resolves `icon.globe` to confirm the live config uses a valid host.

**How the result proves the fix:** Before config fix, `globeHostname` would be `i.ibb.co.com` (404 risk). Before validator fix, `mapValid` could stay `true` even with `co.com` in JSON. `pass: true` with `hostname === 'i.ibb.co'` and no `icon.globe` errors proves both the corrected map and the new hostname rules. Unit tests additionally prove a mocked `i.ibb.co.com` URL makes `validateAssetMap().valid === false`.

---

### L-09 — `index.js` exports `AssetInjector` from a file that does not exist
**File:** `src/utils/assets/index.js` line 57  
**Detail:** `export { default as AssetInjector } from './assetInjector'` — `assetInjector.js` is absent from disk. Any import of `AssetInjector` from the assets barrel will throw a module-not-found error at runtime (or bundle-time with Vite). Export must be removed.

#### Resolution ✅

**Status:** Resolved (fixed in this audit pass).

**What was broken:** The assets barrel re-exported `./assetInjector`, but that file does not exist. Any `import { AssetInjector } from '@/utils/assets'` (or similar) failed at bundle or runtime.

**Why it happened:** Stale export left after a removed or never-added module.

**What changed:** Removed the `AssetInjector` export from `src/utils/assets/index.js`. DOM asset loading remains via `assetPreloader.js` exports (`preloadImage`, etc.) — no conflict with preload refactor.

**How it was tested:** `npm run test:unit -- tests/unit/assetsIndexExports.test.js --run`

**How to test in the browser:**
1. Run `npm run dev`, **Console** (one paste):
   ```js
   (async () => {
     const assets = await import('/src/utils/assets/index.js');
     console.log({
       barrelLoads: typeof assets.getAssetUrl === 'function',
       assetInjectorRemoved: !('AssetInjector' in assets),
       pass: typeof assets.getAssetUrl === 'function' && !('AssetInjector' in assets),
     });
   })();
   ```
2. **Expected:** `pass: true` — no “Failed to resolve import ./assetInjector” error; barrel exposes `getAssetUrl` but not `AssetInjector`.

**How this test connects to the issue:** L-09 is a broken barrel export. Importing the whole assets module is what would have triggered Vite’s missing-file error for anyone using `AssetInjector`.

**How the result proves the fix:** Before the fix, the same import could fail module resolution. `pass: true` with `assetInjectorRemoved: true` proves the barrel loads cleanly without referencing a missing file.

---

### L-10 — `loadAssetMapConfig` always fetches from `/config/assetMap.json` regardless of environment
**File:** `assetLibrary.js` line 667  
**Detail:** In development, Vite serves files from `src/` via its dev-server and does not expose `public/config/assetMap.json` at that path by default (unless `public/` is configured). This silent empty-map fallback (lines 701–708) means all flag lookups return `null` during local development unless the developer happens to have the right file in `public/`. The fetch URL should be configurable via `import.meta.env.VITE_ASSET_MAP_URL` with a sensible per-mode default.

#### Resolution ✅

**Status:** Already resolved (asset preload refactor — S-06 / `ASSET_PRELOAD_AUDIT.md` M-10). Small hardening in this pass: deduped fetch candidates via `Set`.

**What was broken:** Only `/config/assetMap.json` was tried; dev could miss `src/config/assetMap.json`, and there was no `VITE_ASSET_MAP_URL` override.

**Why it happened:** Single hardcoded fetch path before the section-preload / asset-map source refactor.

**What is in place now (do not re-implement):**
- `getAssetMapFetchCandidates()` — `VITE_ASSET_MAP_URL` (optional), `/config/assetMap.json`, `/src/config/assetMap.json` in dev.
- `shouldAllowRuntimeAssetMapFetch()` — network only when `VITE_ASSET_MAP_RUNTIME_OVERRIDE=true` in dev; production uses bundled map by default.
- Failed fetch falls back to **bundled** map (not empty) when override is enabled.
- **This pass:** candidate list built in clear order and deduped with `Set`.

**How it was tested:** `npm run test:unit -- tests/unit/assetMapUrl.test.js tests/unit/assetMapConfig.test.js --run`

**How to test in the browser:**
1. Run `npm run dev` (`.env.development` has `VITE_ASSET_MAP_RUNTIME_OVERRIDE=true`), **Console** (one paste):
   ```js
   (async () => {
     const {
       getAssetMapFetchCandidates,
       getAssetMapConfigSource,
       loadAssetMapConfig,
       clearAssetMapConfigCache,
       getAssetUrl,
     } = await import('/src/utils/assets/assetLibrary.js');
     clearAssetMapConfigCache();
     const candidates = getAssetMapFetchCandidates();
     await loadAssetMapConfig();
     const cognito = await getAssetUrl('script.cognito');
     console.log({
       candidates,
       hasSrcFallback: candidates.includes('/src/config/assetMap.json'),
       source: getAssetMapConfigSource(),
       cognitoResolved: cognito !== null,
       pass:
         candidates.includes('/src/config/assetMap.json') &&
         cognito !== null &&
         ['runtime-verified', 'bundled-fallback', 'bundled-dev'].includes(getAssetMapConfigSource()),
     });
   })();
   ```
2. **Expected:** `pass: true`, `hasSrcFallback: true`, `cognitoResolved: true`. With override on, `source` is usually `runtime-verified` or `bundled-fallback` (if hash rejects `/config/`). Optional: set `VITE_ASSET_MAP_URL=/src/config/assetMap.json` in `.env.local` and confirm it appears first in `candidates` after restart.

**How this test connects to the issue:** L-10 is about dev being able to load the map from the right path(s), not only `public/config`. The script prints fetch candidates, loads the map, and resolves a real flag.

**How the result proves the fix:** Without `/src/config/assetMap.json` in candidates (and bundled fallback), dev could get `null` URLs when `public/` copy is missing. `hasSrcFallback: true` and `cognitoResolved: true` prove multi-path + bundled fallback behavior from the preload refactor; optional `VITE_ASSET_MAP_URL` is verified in unit tests.

---

## 2. Performance Issues

### P-01 — Asset map is loaded lazily on first flag lookup; no eager warm-up on app startup
**File:** `assetLibrary.js` line 639  
**Detail (addresses user requirement #1):** `loadAssetMapConfig()` is called the first time a component or preloader calls `getAssetUrl(flag)`. If multiple components mount simultaneously — as on the dashboard — many parallel calls all race to `loadAssetMapConfig()`, the dedup guard on `assetMapLoadPromise` (line 657) serialises them, but the first rendered frame still has no URLs. The app should call an explicit `initAssetLibrary()` in `main.js` before the router is mounted so that the map, environment detection, and all known flags are pre-warmed into the TTL cache before any component renders.

**Fix (sketch):**
```js
// assetLibrary.js — new export
export async function initAssetLibrary() {
  await loadAssetMapConfig();          // warm the map
  await preloadAssetUrls(getKnownGlobalFlags()); // warm URL cache
  log('assetLibrary.js', 'initAssetLibrary', 'ready', 'Asset library initialised', {
    environment: detectEnvironment(),
    flagCount: /* count */
  });
}
```
```js
// main.js
await initAssetLibrary();
app.mount('#app');
```

#### Resolution ✅

**Status:** Resolved (this audit pass). Also closes **M-02** (same eager startup requirement).

**What was broken:** The asset map and per-flag URL cache were populated only on the first `getAssetUrl` call. Dashboard (and similar) mounts could race on `loadAssetMapConfig()` and render before any URLs were cached.

**Why it happened:** Lazy loading by design; no startup hook in `main.js`.

**What changed:**
- `initAssetLibrary()` — `detectEnvironment()`, `loadAssetMapConfig()`, `preloadAssetUrls(getKnownGlobalFlags())` with deduped promise; reset via `clearAssetCaches()`.
- `getKnownGlobalFlags()` — merged flags for the active environment from the loaded map.
- `main.js` — `await initAssetLibrary()` at the start of `mountApplication()` (before `router.isReady()` and `app.mount()`).
- Barrel exports: `initAssetLibrary`, `getKnownGlobalFlags`, `isAssetLibraryInitialized`.

**Conflict check:** Does **not** override **Preloading.md**, **SECTION_PRELOAD_AUDIT.md**, or **ASSET_PRELOAD_AUDIT.md** — section/DOM preloads stay fire-and-forget; this only warms the flag→URL map cache used by `getAssetUrl` / `resolveAssetPreloadUrl`. Per-route section map warm-up (M-02 step 4) and `validateAssetMap()` at startup (**A-M02** / **M-04**) remain separate.

**How it was tested:** `npm run test:unit -- tests/unit/initAssetLibrary.test.js --run`

**How to test in the browser:**
1. Run `npm run dev`, hard refresh, **Console** (one paste):
   ```js
   (async () => {
     const {
       initAssetLibrary,
       getAssetUrl,
       getAssetMapConfigSource,
       isAssetLibraryInitialized,
     } = await import('/src/utils/assets/assetLibrary.js');
     const before = isAssetLibraryInitialized();
     const init = await initAssetLibrary();
     const url = await getAssetUrl('icon.cart');
     console.log({
       before,
       init,
       mapSource: getAssetMapConfigSource(),
       iconCart: url,
     mapSource: getAssetMapConfigSource(),
     pass:
       init.flagCount > 0 &&
       init.warmedCount > 0 &&
       url !== null &&
       Boolean(init.mapSource || getAssetMapConfigSource()),
   });
   })();
   ```
2. **Expected:** `pass: true`, `init.warmedCount > 0` (may be less than `flagCount` when some URLs are blocked by preload policy), `iconCart` is a non-null URL, `mapSource` is non-null (`bundled-dev`, `runtime-verified`, `bundled-fallback`, or `bundled-production` after a fresh load; `runtime-verified` is typical in dev with `VITE_ASSET_MAP_RUNTIME_OVERRIDE`). On a cold load, Network should not show a burst of map fetches when the dashboard mounts (map already warm). Check console for `Asset library initialised` from `initAssetLibrary` **before** first paint if logger is on.

**Note:** If you previously saw `pass: false` with `mapSource: null` while `icon.cart` resolved, the map was loaded from TTL cache without restoring `assetMapConfigSource` — fixed by persisting source alongside the map cache.

**How this test connects to the issue:** P-01 requires eager init before components render. The script runs the same startup path as `main.js` and confirms the map and URL cache are warm.

**How the result proves the fix:** `warmedCount > 0` and immediate `getAssetUrl('icon.cart')` without a prior component lookup show startup warm-up; `main.js` awaits this before `app.mount()`. See also **M-02** resolution (same implementation).

---

### P-02 — `usePreloadStore.hasAsset` / `addAsset` use `Array.includes` — O(n) per check
**File:** `usePreloadStore.js` lines 25–30  
**Detail:** `preloadedAssets` is a plain array. `Array.includes` is O(n). With 40+ dashboard icons all being checked on every navigation, this compounds. Use a `Set` for O(1) membership and convert to/from array only for serialisation.

```js
// in-memory Set for O(1) operations
let _assetSet = new Set();

actions: {
  addAsset(url) { _assetSet.add(url); this.preloadedAssets = [..._assetSet]; },
  hasAsset(url) { return _assetSet.has(url); },
}
```

#### Resolution ✅

**Status:** Already resolved (asset preload audit **P-01** in `ASSET_PRELOAD_AUDIT.md`). No code change in this pass.

**What was broken:** `preloadedAssets` was a plain array with O(n) `includes` on every `hasAsset` check.

**What is in place:** `preloadedAssets` is a Pinia `Set`; `hasAsset` / `addAsset` use `Set.has` / `Set.add`; persist serializer converts Set ↔ array for `localStorage` only.

**Conflict check:** Aligns with **ASSET_PRELOAD_AUDIT.md** SSOT for preloaded URLs — no preload-architecture change.

**How it was tested:** `npm run test:unit -- tests/unit/usePreloadStore.test.js --run`

**How to test in the browser:**
1. Run `npm run dev`, **Console** (one paste):
   ```js
   (async () => {
     const { usePreloadStore } = await import('/src/stores/usePreloadStore.js');
     const store = usePreloadStore();
     const url = 'https://example.com/p02-test.svg';
     store.addAsset(url);
     console.log({
       isSet: store.preloadedAssets instanceof Set,
       hasUrl: store.hasAsset(url),
       count: store.preloadedAssetCount,
       pass:
         store.preloadedAssets instanceof Set &&
         store.hasAsset(url) &&
         store.preloadedAssetCount >= 1,
     });
   })();
   ```
2. **Expected:** `pass: true`, `isSet: true`.

**How this test connects to the issue:** P-02 is O(1) URL membership for preload dedup.

**How the result proves the fix:** `instanceof Set` and `hasAsset` true after one `addAsset` prove Set-backed storage (not array scan).

---

### P-03 — `getValueFromCache` and `setValueWithExpiration` generate two `log()` calls each on every hit
**File:** `cacheHandler.js` lines 52–57, 106–108  
**Detail:** Every cache read fires two log entries (`'start'` + `'return'`). Every cache write fires two. For a 40-flag dashboard preload, that is 160+ log entries just from cache operations. Reduce to one log per operation and gate behind a debug flag for production.

#### Resolution ✅

**Status:** Resolved (this audit pass).

**What was broken:** Each cache get/set logged twice (`start` + outcome/`return`), multiplying noise during asset-map and URL warm-up (40+ flags → 160+ lines).

**Why it happened:** Verbose trace-style logging on every cache path.

**What changed:** `cacheHandler.js` — `logCache()` helper: **one log per operation** (hit/miss/expired/success/warn); logs only when `import.meta.env.DEV` **or** `VITE_ENABLE_LOGGER === 'true'` (silent in production builds without explicit logger). Applied to all cacheHandler exports.

**Conflict check:** Does **not** change cache semantics or TTL; translation/asset preload timing unchanged. Complements **TRANSLATION_AUDIT** cache-prefix clears.

**How it was tested:** `npm run test:unit -- tests/unit/cacheHandlerLogging.test.js --run`

**How to test in the browser:**
1. Run `npm run dev` with `VITE_ENABLE_LOGGER=true`, **Console** (one paste):

   **Do not patch `logHandler.log`** — `cacheHandler` already imported `log` at app startup, so reassignment on the module object does not change what runs (you would see `setCount: 0` while logs still print). Count `[cacheHandler.js]` lines via `console.log` instead:

   ```js
   (async () => {
     const cacheLines = [];
     const origLog = console.log;
     console.log = (...args) => {
       const first = args[0];
       if (typeof first === 'string' && first.includes('[cacheHandler.js]')) {
         cacheLines.push(first);
       }
       return origLog.apply(console, args);
     };
     try {
       const { clearAllCache, setValueWithExpiration, getValueFromCache } = await import(
         '/src/utils/common/cacheHandler.js',
       );
       clearAllCache();
       cacheLines.length = 0;
       setValueWithExpiration('p03_browser', { ok: 1 }, 60000);
       const setLines = cacheLines.filter((line) => line.includes('[setValueWithExpiration]'));
       cacheLines.length = 0;
       const value = getValueFromCache('p03_browser');
       const getLines = cacheLines.filter((line) => line.includes('[getValueFromCache]'));
       console.log({
         value,
         setLineCount: setLines.length,
         getLineCount: getLines.length,
         pass: setLines.length === 1 && getLines.length === 1 && value?.ok === 1,
       });
     } finally {
       console.log = origLog;
     }
   })();
   ```
2. **Expected:** `pass: true`, `setLineCount: 1`, `getLineCount: 1` (not 2+ per operation). You may still see one extra `clearAllCache` line **before** the counter resets — that is expected.

**How this test connects to the issue:** P-03 is log volume per cache operation during warm-up.

**How the result proves the fix:** Intercepting console output shows exactly one `[setValueWithExpiration]` and one `[getValueFromCache]` line for the measured operations (previously two each: `start` + `return`).

---

### P-04 — `getAssetUrl` resolves flags sequentially via `loadAssetMapConfig` but `getAssetUrls` calls it N times in parallel
**File:** `assetLibrary.js` lines 804–808  
**Detail:** `getAssetUrls(flags)` launches one `getAssetUrl` call per flag in parallel via `Promise.all`. Each `getAssetUrl` calls `loadAssetMapConfig()` which correctly returns the shared promise/cache. However, the per-flag URL cache check (lines 738–742) happens before the map is available. After the map loads, each parallel caller performs a redundant `cacheHandler.getValueFromCache` and `cacheHandler.setValueWithExpiration` separately. A single-pass `getAssetUrls` implementation that calls `loadAssetMapConfig()` once and then resolves all flags from the loaded map in a synchronous loop would be significantly faster.

#### Resolution ✅

**Status:** Resolved (this audit pass). Also fixes **A-L02** (`flags.length` before `Array.isArray` guard).

**What was broken:** `getAssetUrls` used `Promise.all(flags.map(() => getAssetUrl()))`, causing N parallel map loads (deduped by promise but still redundant work) and N× cache round-trips after the map was warm.

**Why it happened:** Reused single-flag API for batch without a dedicated batch resolver.

**What changed:**
- `resolveFlagUrlFromLoadedMap()` / `resolveAndCacheFlagUrl()` — shared resolution + URL cache for one flag.
- `getAssetUrls()` — validates input first, `await loadAssetMapConfig()` **once**, synchronous loop over flags.
- `getAssetUrl()` — uses the same resolver (detailed logging kept for single-flag path).

**Conflict check:** No change to map source, env inheritance, or URL policy (`assertAllowedPreloadUrl`). `preloadAssetUrls` still calls `getAssetUrls` and benefits from single map load.

**How it was tested:** `npm run test:unit -- tests/unit/getAssetUrlsBatch.test.js --run`

**How to test in the browser:**
1. Run `npm run dev`, **Console** (one paste):

   Count `[loadAssetMapConfig]` log lines during the batch (do not reassign `loadAssetMapConfig` on the import object — internal calls use the module binding, same as P-03 / `logHandler`):

   ```js
   (async () => {
     const loadLines = [];
     const origLog = console.log;
     console.log = (...args) => {
       const first = args[0];
       if (typeof first === 'string' && first.includes('[loadAssetMapConfig]')) {
         loadLines.push(first);
       }
       return origLog.apply(console, args);
     };
     try {
       const { clearAssetCaches, getAssetUrls } = await import('/src/utils/assets/assetLibrary.js');
       clearAssetCaches();
       loadLines.length = 0;
       const urlMap = await getAssetUrls(['icon.cart', 'script.cognito', 'dashboard.logo']);
       const mapLoadStarts = loadLines.filter(
         (l) => l.includes('[loadAssetMapConfig]') && l.includes('[start]'),
       );
       const mapLoadSuccess = loadLines.filter(
         (l) =>
           l.includes('[loadAssetMapConfig]') &&
           (l.includes('[success]') || l.includes('[memory-hit]') || l.includes('[cache-hit]')),
       );
       const resolved = Object.values(urlMap).filter(Boolean).length;
       console.log({
         urlMap,
         mapLoadLogLines: loadLines.length,
         mapLoadStarts: mapLoadStarts.length,
         mapLoadSuccess: mapLoadSuccess.length,
         resolved,
         pass: mapLoadStarts.length === 1 && mapLoadSuccess.length === 1 && resolved >= 2,
       });
     } finally {
       console.log = origLog;
     }
   })();
   ```
2. **Expected:** `pass: true`, `mapLoadStarts: 1`, `mapLoadSuccess: 1`, `resolved: 3` (after `clearAssetCaches`). One cold load logs **three** `[loadAssetMapConfig]` lines (`start` → `fetch` → `success`) — that is still a **single** load; do not use `loadLogCount <= 2` (that falsely fails when logging is verbose).

   On a **warm** repeat (no `clearAssetCaches`), expect `mapLoadStarts: 0` or `1` with `[memory-hit]` / `[cache-hit]` only — still `pass` if `resolved >= 2`.

**How this test connects to the issue:** P-04 requires one map load per batch, not per flag.

**How the result proves the fix:** Exactly one `[loadAssetMapConfig] [start]` (and one terminal hit) for three flags, plus `mapLoad: 'single-pass'` in `[getAssetUrls] [success]`, proves batch resolution — not three parallel single-flag loaders.

---

### P-05 — `preloadAssetsForSections` launches section loads in parallel but ignores partial cache hits
**File:** `assetLibrary.js` lines 326–346  
**Detail:** this may have been patched already check before you do anything.... `sectionNames.map(name => loadAssetsForSection(name))` fires all loads simultaneously. For sections already in `loadedAssets` (memory hit), the shortcut at line 162 (`getValueFromCache`) returns immediately. But for sections partially cached (some routes loaded, manifest stale), the whole section reloads. A smarter implementation should check `areAssetsLoadedForSection` first, skip already-loaded sections, and only load the missing ones.

#### Resolution ✅

**Status:** Resolved (this audit pass). Also fixes **A-B02** (cache-hit rehydrates `loadedAssets`) and **A-B05** (array guard).

**What was broken:** Every section in the batch always called `loadAssetsForSection`, even when TTL/memory already had metadata. `loadAssetsForSection` cache hits did not repopulate `loadedAssets`, so skip logic was unreliable.

**What changed:**
- `preloadAssetsForSections()` — `Array.isArray` guard; for each section, if `areAssetsLoadedForSection` → reuse `getAssetsForSection`; only missing sections go to parallel `loadAssetsForSection`.
- `loadAssetsForSection()` — on `cacheHandler` hit, `loadedAssets.set(sectionName, cachedAssets)` (aligns with L-04 / A-B02).

**Conflict check:** Complements **L-04** / **L-05** (cache-aware loaded checks and unload). Does not change section preload orchestration in `sectionPreloader.js` — only batch metadata loading in `assetLibrary`.

**How it was tested:** `npm run test:unit -- tests/unit/preloadAssetsForSections.test.js --run`

**How to test in the browser:**
1. Run `npm run dev`, **Console** (one paste):
   ```js
   (async () => {
     const { clearAssetCaches, preloadAssetsForSections, loadAssetsForSection, getAssetsForSection } =
       await import('/src/utils/assets/assetLibrary.js');
     const loadLines = [];
     const origLog = console.log;
     console.log = (...args) => {
       const first = args[0];
       if (typeof first === 'string' && first.includes('[loadAssetsForSection]') && first.includes('[start]')) {
         loadLines.push(first);
       }
       return origLog.apply(console, args);
     };
     try {
       clearAssetCaches();
       await loadAssetsForSection('auth');
       loadLines.length = 0;
       const map = await preloadAssetsForSections(['auth', 'shop']);
       console.log({
         authFromCache: getAssetsForSection('auth')?.sectionName,
         shopLoaded: map.shop?.sectionName,
         loadStarts: loadLines.length,
         pass: loadLines.length === 1 && map.auth?.sectionName === 'auth' && map.shop?.sectionName === 'shop',
       });
     } finally {
       console.log = origLog;
     }
   })();
   ```
2. **Expected:** `pass: true`, `loadStarts: 1` (only `shop` loads; `auth` skipped).

**How this test connects to the issue:** P-05 is about not reloading sections that are already cached.

**How the result proves the fix:** One `[loadAssetsForSection] [start]` for two sections means `auth` was served from cache/memory without a second load.

---

### P-06 — `cacheHandler` has no lazy expiry sweep; stale entries accumulate indefinitely
**File:** `cacheHandler.js` lines 97–103  
**Detail:** Expired entries are only evicted on access (`getValueFromCache`). Entries for unused flags/sections silently consume memory until accessed. Add a periodic sweep (e.g. every 10 minutes via `setInterval`) or a LRU eviction policy. Alternatively cap `cacheStorage` size.

#### Resolution ✅

**Status:** Resolved (this audit pass).

**What was broken:** Expired TTL entries stayed in the `Map` until the same key was read again, so unused keys held memory indefinitely.

**What changed:**
- `sweepExpiredCacheEntries()` — scans and deletes all expired entries; exported from `cacheHandler.js` / `utils/common/index.js`.
- Browser: 10-minute `setInterval` sweep (guarded by `globalThis.__cacheHandlerSweepIntervalId` so HMR does not stack timers).
- Shared `isCacheEntryExpired()` used by get/has/stats/sweep.

**Conflict check:** Does not change TTL semantics on read (still evicts on access). Translation/asset caches share the same store — sweep only removes **expired** keys, not valid entries.

**How it was tested:** `npm run test:unit -- tests/unit/cacheHandlerSweep.test.js --run`

**How to test in the browser:**
1. Run `npm run dev`, **Console** (one paste):
   ```js
   (async () => {
     const { clearAllCache, setValueWithExpiration, getValueFromCache, sweepExpiredCacheEntries, getCacheStatistics } =
       await import('/src/utils/common/cacheHandler.js');
     clearAllCache();
     setValueWithExpiration('p06_test', { x: 1 }, 1);
     await new Promise((r) => setTimeout(r, 10));
     const before = getCacheStatistics().totalEntries;
     const removed = sweepExpiredCacheEntries();
     const after = getCacheStatistics().totalEntries;
     console.log({
       before,
       removed,
       after,
       stillThere: getValueFromCache('p06_test'),
       pass: before === 1 && removed === 1 && after === 0 && getValueFromCache('p06_test') === null,
     });
   })();
   ```
2. **Expected:** `pass: true`, `removed: 1`, `after: 0`.

**How this test connects to the issue:** P-06 is proactive eviction of dead TTL rows.

**How the result proves the fix:** `sweepExpiredCacheEntries()` drops the expired key without needing a read on that key first.

---

### A-B02 — `loadAssetsForSection` cache-hit path does not rehydrate `loadedAssets` memory map
**File:** `assetLibrary.js` lines 160–176  
**Detail:** On cache hit, function returns cached object immediately but never writes `loadedAssets.set(sectionName, cachedAssets)`. This keeps memory/cached state inconsistent and worsens behavior of APIs that rely on `loadedAssets` (for example `areAssetsLoadedForSection`).

#### Resolution ✅

**Status:** Resolved with **P-05** (`loadedAssets.set` on cache hit in `loadAssetsForSection`).

---

### P-07 — `getAssetsByCategory` re-loads the full asset map and iterates all keys every call
**File:** `assetLibrary.js` lines 903–946  
**Detail:** Every call to `getAssetsByCategory('dashboard')` awaits `loadAssetMapConfig()` (cache hit, fast) then iterates every key in `assetMap[env]`. No category result is cached. With 35 dashboard flags, this is trivially fast today but will degrade as `assetMap` grows. Cache category results under `asset_category_<env>_<category>`.

#### Resolution ✅

**Status:** Resolved (this audit pass).

**What was broken:** Each `getAssetsByCategory` call re-scanned the full merged map even when the same `(environment, category)` was requested repeatedly (e.g. dashboard menu building).

**What changed:**
- `getAssetCategoryCacheKey()` — `asset_category_<env>_<category>` in `cacheHandler` (same TTL as asset map).
- `categoryAssetsMemoryCache` — in-process Map mirroring category TTL entries (same pattern as `loadedAssets`).
- `isAssetCategoryCached()` — browser-safe cache probe via `assetLibrary` (avoids duplicate `cacheHandler` instances in dev console).
- `buildAssetsByCategoryFromMap()` — shared scan logic used on cache miss.
- `getAssetsByCategory()` — memory or handler cache hit returns immediately; miss loads map once, caches result.
- `clearAssetMapConfigCache()` / `setEnvironment()` — clear category prefix so map/env changes do not serve stale category snapshots.

**Conflict check:** Category cache stores raw map URLs (same as before P-07). Flag→URL resolution for components still uses `getAssetUrl` / URL cache. Complements **L-07** (`resolveAssetMapForEnvironment`).

**How it was tested:** `npm run test:unit -- tests/unit/getAssetsByCategoryCache.test.js tests/unit/resolveAssetMapForEnvironment.test.js --run`

**How to test in the browser:**
1. Run `npm run dev`, **Console** (one paste). Use **`isAssetCategoryCached`** from `assetLibrary` only — a separate `import('/src/utils/common/cacheHandler.js')` can be a different module instance in dev, so `getValueFromCache` may show `cache-miss` even when P-07 is working.
   ```js
   (async () => {
     const { clearAssetCaches, getAssetsByCategory, isAssetCategoryCached } = await import('/src/utils/assets/assetLibrary.js');
     clearAssetCaches();
     const a = await getAssetsByCategory('dashboard', 'development');
     const b = await getAssetsByCategory('dashboard', 'development');
     console.log({
       count: Object.keys(a).length,
       cached: isAssetCategoryCached('dashboard', 'development'),
       sameReference: a === b,
       pass: Object.keys(a).length > 0 && isAssetCategoryCached('dashboard', 'development') && a === b && JSON.stringify(a) === JSON.stringify(b),
     });
   })();
   ```
2. **Expected:** `pass: true`, `cached: true`, `count > 0`, `sameReference: true`. Second call logs `[getAssetsByCategory] [cache-hit]` (memory or handler) when logger is on.

**How this test connects to the issue:** P-07 avoids re-iterating the full map for repeated category queries.

**How the result proves the fix:** After the first call, `isAssetCategoryCached` is true; the second call returns the same object reference without reloading the map (cache-hit log).

---

### S-03 — `loadAssetMapConfig` trusts the fetched JSON with only a shallow `typeof` check
**File:** `assetLibrary.js` lines 676–683  
**Detail:** The only validation after `fetch('/config/assetMap.json')` is `typeof assetMap !== 'object'`. A cache-poisoned, MITM-swapped, or misconfigured CDN response that returns a valid JSON object with attacker-controlled URLs passes this check and becomes the authoritative source for all flag → URL resolution across the entire app. See S-04 for the injection path. The fix is to import `assetMap.json` at build time (zero-cost, cannot be swapped at runtime) and use runtime fetch only for optional development overrides.

#### Resolution ✅

**Status:** Resolved (implemented in asset-preload security pass; documented here for **ASSET_LIBRARY_AUDIT**).

**What was broken:** Production and default dev treated a runtime `fetch('/config/assetMap.json')` as authoritative after only `typeof assetMap === 'object'`. A swapped JSON object could redirect every flag → URL in the app.

**Why it happened:** The map lived under `public/config/` and was fetched on first `getAssetUrl` / `loadAssetMapConfig` with no build-time binding or integrity check.

**What changed:**
- **`assetMapSource.js`** — `import` of `src/config/assetMap.json` at build time; `getBundledAssetMap()` returns a `structuredClone` so callers cannot mutate the bundle artifact.
- **`vite.config.js`** — injects `__ASSET_MAP_SHA256__` from `src/config/assetMap.json` file bytes at build time.
- **`loadAssetMapConfig()`** — production and default dev use bundled map only (`bundled-production` / `bundled-dev`). Network fetch runs only when `VITE_ASSET_MAP_RUNTIME_OVERRIDE=true` in dev; `fetchAssetMapFromNetwork()` rejects JSON whose SHA-256 does not match the build hash (`verifyFetchedAssetMapText`) and falls back to bundled (`bundled-fallback`).
- **`getAssetMapConfigSource()`** — exposes how the map was loaded (for debugging and browser tests).
- Defense in depth for poisoned *values* inside a map object is **`getAssetUrl()` → `assertAllowedPreloadUrl()`** (see **S-04**, not required to close S-03).

**Conflict check:** Does **not** override section/asset preload refactors (`initAssetLibrary`, `preloadAssetsForSections`, `usePreloadStore`). Preload still resolves flags via `getAssetUrl`; only the **source** of the map is locked down. Same implementation as **S-06** in `docs/tasks/ASSET_PRELOAD_AUDIT.md` (trusted config + hash verify). **L-10** dev fetch candidates remain for optional override only, not production.

**How it was tested:** `npm run test:unit -- tests/unit/assetMapSource.test.js tests/unit/assetMapConfig.test.js --run` (includes S-03 tampered-fetch → `bundled-fallback` case).

**How to test in the browser:**
1. Run `npm run dev`, open any page, **Console** (one paste):
   ```js
   (async () => {
     const {
       clearAssetMapConfigCache,
       loadAssetMapConfig,
       getAssetMapConfigSource,
       getAssetUrl,
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
       bundledHashDefined: Boolean(getBundledAssetMapSha256()),
       pass:
         (getAssetMapConfigSource() === 'bundled-dev' ||
           getAssetMapConfigSource() === 'bundled-production') &&
         cognito === '/vendor/amazon-cognito-identity-6.3.15.min.js' &&
         !shouldAllowRuntimeAssetMapFetch() &&
         Boolean(getBundledAssetMapSha256()),
     });
   })();
   ```
2. **Expected (default dev, no override):** `pass: true`, `source: "bundled-dev"`, `runtimeOverrideEnabled: false`, `bundledHashDefined: true`, `cognito: "/vendor/amazon-cognito-identity-6.3.15.min.js"` — no Network request to `/config/assetMap.json` on cold load.
3. **Optional tamper test:** set `VITE_ASSET_MAP_RUNTIME_OVERRIDE=true` in `.env.local`, edit `public/config/assetMap.json` (change any URL), restart dev server, run the same snippet — **Expected:** `source: "bundled-fallback"` (or still bundled if fetch fails), `cognito` still `/vendor/...` (evil URL rejected by hash mismatch).

**How this test connects to the issue:** S-03 is about not trusting an unverified runtime JSON file as the canonical map.

**How the result proves the fix:** Default dev uses `bundled-dev` with no override fetch; with override enabled, a edited `public/config/assetMap.json` does not change `script.cognito` because hash verification rejects the tampered file.

---

### S-04 — `getAssetUrl` returns attacker-controlled URLs that flow directly into DOM injection without sanitization
**File:** `assetLibrary.js` → `assetPreloader.js` → `document.head.appendChild(link)`  
**Detail:** The resolution chain is: `assetMap.json` (fetched at runtime) → `getAssetUrl(flag)` → `assetHandlerFactory.createAssetHandler` → `assetsHandlerNew.AssetHandler` → DOM injection. At no point is the returned URL validated for scheme, host, or type. A `javascript:` scheme, `data:` URI, or arbitrary external host in the map flows through unmodified. All URLs returned from `getAssetUrl` must be validated against an allowlist of permitted schemes (`https:`, `/`) and permitted hosts before they can be used by any consumer.

#### Resolution ✅

**Status:** Resolved (core allowlist in asset-preload pass; this pass adds cache re-check + category path alignment).

**What was broken:** Resolved flag URLs from `assetMap.json` were returned and injected into the DOM (`<link>`, `<img>`, CSS `url()`) with no scheme/host policy. `getAssetsByCategory` copied raw map strings and skipped the same checks (**A-P05**).

**Why it happened:** Trust boundary was the map file only; no shared validator at resolution or preload injection.

**What changed:**
- **`assertAllowedPreloadUrl.js`** — blocks `javascript:`, `data:`, `blob:`, `//`; allows `/…` paths; `https:` only for same-origin, localhost, `VITE_ASSET_ALLOWED_HOSTS`, and legacy `i.ibb.co` (until **S-01**); production external scripts require integrity flag.
- **`resolveFlagUrlFromLoadedMap()`** — `normalizeAssetMapUrl()` + `assertAllowedPreloadUrl()` before any URL is cached or returned from `getAssetUrl` / `getAssetUrls`.
- **`resolveAndCacheFlagUrl()`** — re-validates TTL cache hits; evicts and re-resolves when a stale/bad URL is in cache.
- **`buildAssetsByCategoryFromMap()`** — uses `resolveFlagUrlFromLoadedMap()` so category batches omit blocked flags (partial **A-P05** fix).
- **`assetPreloader.js`** — `resolveAllowedPreloadSrc()` on all preloaders (see **S-04** in `ASSET_PRELOAD_AUDIT.md`).
- **`assetHandlerFactory.js`** — still calls `getAssetUrl()` (inherits policy).

**Conflict check:** Does not override preload orchestration or **S-03** bundled map. Complements **S-03** (trusted source) with URL policy at resolution/injection. **A-S02** (CSS/attr escaping at Vue call sites) remains a separate follow-up.

**How it was tested:** `npm run test:unit -- tests/unit/assertAllowedPreloadUrl.test.js tests/unit/getAssetUrlAllowlist.test.js tests/unit/assetMapConfig.test.js tests/unit/getAssetsByCategoryCache.test.js tests/unit/preloadUrlGuard.test.js --run`

**How to test in the browser:**
1. Run `npm run dev`, open any page, **Console** (one paste):
   ```js
   (async () => {
     const { clearAssetCaches, loadAssetMapConfig, getAssetUrl, getAssetsByCategory } =
       await import('/src/utils/assets/assetLibrary.js');
     const { preloadImage } = await import('/src/utils/assets/assetPreloader.js');
     clearAssetCaches();
     const map = await loadAssetMapConfig();
     map.development['audit.s04.evil'] = 'javascript:alert(1)';
     map.development['audit.s04.safe'] = '/vendor/amazon-cognito-identity-6.3.15.min.js';
     const linksBefore = document.querySelectorAll('link').length;
     const url = await getAssetUrl('audit.s04.evil', 'development');
     const safe = await getAssetUrl('audit.s04.safe', 'development');
     const category = await getAssetsByCategory('audit.s04', 'development');
     await preloadImage('data:image/png;base64,xx');
     const linksAfter = document.querySelectorAll('link').length;
     console.log({
       evilUrl: url,
       safeUrl: safe,
       categoryEvil: category['audit.s04.evil'],
       categorySafe: category['audit.s04.safe'],
       linksAddedByBlockedPreload: linksAfter - linksBefore,
       pass:
         url === null &&
         safe === '/vendor/amazon-cognito-identity-6.3.15.min.js' &&
         category['audit.s04.evil'] === undefined &&
         category['audit.s04.safe'] === '/vendor/amazon-cognito-identity-6.3.15.min.js' &&
         linksAfter - linksBefore === 0,
     });
   })();
   ```
2. **Expected:** `pass: true`, `evilUrl: null`, `categoryEvil: undefined`, `linksAddedByBlockedPreload: 0`.
3. **Login smoke:** `await getAssetUrl('auth.background', 'development')` should still return the ibb.co URL (legacy allowlist until **S-01**), not `null`.

**How this test connects to the issue:** S-04 requires blocked schemes/hosts at resolution and preload injection, not only at map load.

**How the result proves the fix:** Tampered in-memory flags return `null` / are omitted from category maps; `preloadImage('data:…')` adds no `<link>`.

---

### S-05 — `assetMap.json` is duplicated in both `src/config/` and `public/config/` with no sync mechanism
**Files:** `src/config/assetMap.json`, `public/config/assetMap.json`  
**Detail:** Both files exist with identical content. The app fetches from `public/config/assetMap.json` at runtime; `src/config/assetMap.json` appears to be an authoritative copy but changes to one are not automatically reflected in the other. This creates a drift risk where developers edit the wrong file. There should be a single source of truth — either a build step that copies `src/` → `public/`, or removal of the `src/` copy in favour of importing the `public/` file via Vite's `?url` or `?raw` import.

#### Resolution ✅

**Status:** Resolved (this audit pass).

**What was broken:** Two copies of `assetMap.json` could drift; developers might edit `public/` while the bundled import and SHA-256 hash use `src/config/assetMap.json`.

**Why it happened:** Historical layout — `public/` for static fetch, `src/` for IDE reference — with no automated sync after **S-03** moved the canonical map to a build-time import from `src/`.

**What changed:**
- **Source of truth:** `src/config/assetMap.json` only (also used by `assetMapSource.js`, `vite.config.js` hash).
- **`build/vite/syncAssetMapPlugin.js`** — `syncAssetMapToPublic()` + Vite plugin `vite-plugin-sync-asset-map` runs on every `buildStart` (dev + production build).
- **`npm run sync:asset-map`** — manual CLI copy when needed without starting Vite.
- **`public/config/README.md`** — marks `public/config/assetMap.json` as generated; do not edit by hand.
- **`src/config/assetMap.README.md`** — updated editing instructions.

**Conflict check:** Does not remove `public/` copy (still required for **L-10** / `VITE_ASSET_MAP_RUNTIME_OVERRIDE` hash-verified dev fetch). Does not change preload or bundled-map behavior (**S-03**). **B-08** (src never imported) is obsolete — `src` is now the bundled import path.

**How it was tested:** `npm run test:unit -- tests/unit/syncAssetMapToPublic.test.js --run`; `npm run sync:asset-map` then byte-compare hashes.

**How to test in the browser:**
1. Edit **only** `src/config/assetMap.json` (add a dev-only flag), run `npm run sync:asset-map` or restart `npm run dev`.
2. **Console** (one paste, with `VITE_ASSET_MAP_RUNTIME_OVERRIDE=true` if testing fetch path):
   ```js
   (async () => {
     const src = await fetch('/config/assetMap.json', { cache: 'no-store' }).then((r) => r.text());
     const { loadAssetMapConfig, getAssetUrl } = await import('/src/utils/assets/assetLibrary.js');
     const map = await loadAssetMapConfig();
     const testFlag = 'audit.s05.sync';
     const inBundled = map?.development?.[testFlag] ?? map?.production?.[testFlag];
     const fromFetch = src.includes(testFlag);
     console.log({
       testFlag,
       inBundled: inBundled ?? null,
       fromFetch,
       pass: Boolean(inBundled) && fromFetch,
     });
   })();
   ```
3. **Expected:** After sync + restart, `pass: true` if you added `audit.s05.sync` to `src` and re-synced — fetch body and bundled map both contain the flag.

**How this test connects to the issue:** S-05 requires one authoritative file and an automatic mirror for `/config/assetMap.json`.

**How the result proves the fix:** A change in `src` appears in both the bundled map and the served `public/` copy after sync/dev start.

---

### S-06 — `validateAssetMap` accepts `http://` URLs in production without error
**File:** `assetLibrary.js` lines 1015–1018  
**Detail:** The validator flags `http://` URLs only as a warning. In production environments, serving assets over plain HTTP exposes them to MITM, mixed-content warnings, and browser blocking (in strict HTTPS contexts). HTTP URLs in `production` should be hard errors, not warnings.

#### Resolution ✅

**Status:** Resolved (asset-preload pass + verified this audit pass).

**What was broken:** Non-localhost `http://` URLs in the `production` block were only warned, so CI/startup validation could pass with insecure asset URLs.

**Why it happened:** Early validator treated all HTTP as soft warnings; runtime `normalizeAssetMapUrl()` upgraded http→https but validation did not fail the config.

**What changed:**
- **`validateAssetMap()`** — non-localhost `http://` in **`production`** → **`errors`** (`Production flag "…" uses HTTP; use HTTPS (…)`). Same host rules as **`normalizeAssetMapUrl()`** / **`isLocalhostHostname()`**.
- **Dev/staging** — non-localhost HTTP remains **`warnings`** (runtime still upgrades to HTTPS via **ASSET_PRELOAD_AUDIT** S-05).
- **Localhost HTTP** in production — allowed (no error/warning; local dev tooling only).

**Conflict check:** Aligns with **`getAssetUrl()`** / **`assertAllowedPreloadUrl()`** (**S-04**); does not change preload orchestration. Canonical map has no raw `http://` in production today.

**How it was tested:** `npm run test:unit -- tests/unit/validateAssetMapHttpProduction.test.js tests/unit/validateAssetMapHostname.test.js --run`

**How to test in the browser:**
1. Run `npm run dev`, **Console** (one paste):
   ```js
   (async () => {
     const { clearAssetMapConfigCache, loadAssetMapConfig, validateAssetMap } =
       await import('/src/utils/assets/assetLibrary.js');
     clearAssetMapConfigCache();
     const map = await loadAssetMapConfig();
     const saved = map.production['audit.s06.http'];
     map.production['audit.s06.http'] = 'http://cdn.example.com/insecure.png';
     const bad = await validateAssetMap();
     delete map.production['audit.s06.http'];
     if (saved !== undefined) map.production['audit.s06.http'] = saved;
     const good = await validateAssetMap();
     const httpErrors = bad.errors.filter((e) => e.includes('audit.s06.http'));
     console.log({
       badValid: bad.valid,
       httpErrorCount: httpErrors.length,
       sampleError: httpErrors[0],
       goodValid: good.valid,
       pass: bad.valid === false && httpErrors.length > 0 && good.valid === true,
     });
   })();
   ```
2. **Expected:** `pass: true`, `badValid: false`, `sampleError` mentions `Production` and `HTTP`.
3. **Real map:** `await validateAssetMap()` on the unmodified bundled map should return `valid: true` and `httpErrorCount: 0` for production HTTP (no `http://` entries in `src/config/assetMap.json`).

**How this test connects to the issue:** S-06 requires production HTTP (non-localhost) to fail validation, not only warn.

**How the result proves the fix:** Injecting `http://cdn.example.com/…` into `production` makes `valid: false`; removing it restores `valid: true`.

---

## 4. Best Practice Violations

### B-01 — No global vs. per-section asset map concept; no merge/override pattern
**Files:** `assetLibrary.js`, `assetMap.json`  
**Detail (addresses user requirement #4):** The current design has a single flat `assetMap.json` keyed only by environment. There is no concept of a **global** asset library (shared across all sections) and a **per-section** library (overrides/additions for a specific section). Components that need section-specific icon variants must either hardcode them or duplicate entries.

**Required design:**
```
assetMap.json          ← global library (all environments)
assetMap.auth.json     ← per-section overrides (auth section)
assetMap.dashboard.json ← per-section overrides (dashboard section)
```

Resolution order for `getAssetUrl(flag, { section: 'dashboard' })`:
1. Section library for current env (`assetMap.dashboard.json[env][flag]`)
2. Section library production fallback (`assetMap.dashboard.json.production[flag]`)
3. Global library for current env (`assetMap.json[env][flag]`)
4. Global library production fallback (`assetMap.json.production[flag]`)
5. `null` — flag not found

**Section takes precedence over global at every level.** The merged result is cached per `(section, env, flag)` triple.

#### Resolution ✅

**Status:** Resolved (this audit pass). Also closes **M-01** (merge API) and **M-03** (section map files + loader); **M-02** step 4 (warm initial-route section map) remains optional follow-up.

**What was broken:** One flat global map only; no `assetMap.<section>.json` overrides; `getAssetUrl(flag)` could not prefer section-specific URLs; duplicate `src/` / `public/` section files would drift.

**Why it happened:** Original design used a single `assetMap.json`; section preload only rolled up flags, not per-section URL libraries.

**What changed:**
- **`src/config/assetMap.auth.json`** — example section override (`auth.background` dev path); add more as `assetMap.<section>.json`.
- **`sectionAssetMapSource.js`** — build-time glob for `assetMap.*.json`; `loadSectionAssetMap`, bundled + optional dev fetch (404 → no section map).
- **`assetLibrary.js`** — `normalizeGetAssetUrlArgs()`; `getAssetUrl` / `getAssetUrls` / `hasAssetFlag` / `preloadAssetUrls` accept `{ section, environment }`; `resolveFlagUrlWithSectionOverride()` (section env → section production → global env → global production); URL cache keys scoped `g_` / `s_<section>_` per `(section, env, flag)`.
- **`assetPreloader.js`** — `preloadSectionAssets` / `preloadSectionCriticalImages` tag assets with `section`; `resolveAssetPreloadUrl(asset, sectionName)` passes section into `getAssetUrl`.
- **`syncAssetMapPlugin.js`** — copies all `src/config/assetMap*.json` → `public/config/`.
- **Exports** — `loadSectionAssetMap`, `getKnownBundledSectionNames`, `normalizeGetAssetUrlArgs` from `index.js`.

**Conflict check:** Does not change section preload orchestration or bundle loading — only flag→URL resolution when `section` is passed. Global callers unchanged (`getAssetUrl('icon.cart')` still uses global map). Complements **S-03/S-04/S-05**. **`getAssetsByCategory`** still uses global merged map only (**A-P05** follow-up).

**How it was tested:** `npm run test:unit -- tests/unit/sectionAssetMapMerge.test.js tests/unit/syncAssetMapToPublic.test.js --run`

**How to test in the browser:**
1. Run `npm run dev` (syncs `assetMap.auth.json` to `public/config/`), open any page, **Console** (one paste):
   ```js
   (async () => {
     const lib = await import('/src/utils/assets/assetLibrary.js');
     const { clearAssetCaches, getAssetUrl, getKnownBundledSectionNames, normalizeGetAssetUrlArgs } = lib;
     const b01Loaded =
       typeof normalizeGetAssetUrlArgs === 'function' &&
       typeof getKnownBundledSectionNames === 'function';
     if (!b01Loaded) {
       console.error('Stale module — stop dev server, run npm run dev, hard-refresh the tab, then re-run.');
       return;
     }
     clearAssetCaches();
     const globalUrl = await getAssetUrl('auth.background', 'development');
     const authUrl = await getAssetUrl('auth.background', {
       section: 'auth',
       environment: 'development',
     });
     const bundledSections = getKnownBundledSectionNames();
     console.log({
       b01Loaded,
       bundledSections,
       globalUrl,
       authUrl,
       pass:
         b01Loaded &&
         bundledSections.includes('auth') &&
         globalUrl === 'https://i.ibb.co/jPw7ChWb/auth-bg.webp' &&
         authUrl === '/assets/images/auth-section-override-dev.webp' &&
         authUrl !== globalUrl,
     });
   })();
   ```
2. **Expected:** `pass: true`, `b01Loaded: true`, `bundledSections` includes `"auth"`. Logs should show `section: "auth"` on the second `[getAssetUrl] [start]` and cache keys `asset_url_g_…` / `asset_url_s_auth_…` (not `asset_url_[object Object]_…`). If you see `[object Object]` in cache keys, restart `npm run dev` and hard-refresh.
3. **Login smoke:** On `/log-in`, components using plain `getAssetUrl('auth.background')` still get the global URL unless you update them to pass `{ section: 'auth' }`.

**How this test connects to the issue:** B-01 requires section libraries to override global entries when `section` is provided.

**How the result proves the fix:** Same flag resolves to different URLs with vs without `{ section: 'auth' }`, proving merge order and separate cache scopes.

---

### B-02 — `window.performanceTracker.step()` called unconditionally in `assetPreloader.js`
**File:** `assetPreloader.js` lines 30–36 (and throughout)  
**Detail:** Unlike `assetLibrary.js` which guards with `if (window.performanceTracker)`, `assetPreloader.js` calls `window.performanceTracker.step(...)` directly. In unit tests, SSR, or when the tracker is not yet initialised, this throws `TypeError: Cannot read properties of undefined (reading 'step')`. Add the same null guard throughout.

#### Resolution ✅

**Status:** Resolved (asset-preload audit pass; verified this audit pass). No direct `window.performanceTracker` calls remain in `assetPreloader.js`.

**What was broken:** Preload helpers called `window.performanceTracker.step()` without checking that the tracker existed, causing `TypeError` in unit tests, SSR, or before `main.js` initialised the tracker.

**Why it happened:** `assetLibrary.js` used `if (window.performanceTracker)` guards; `assetPreloader.js` was written with raw global access.

**What changed:**
- **`assetPreloader.js`** — all ~40 performance steps use **`trackStep()`** from `performanceTrackerAccess.js` (null-safe `getPerformanceTracker()` + try/catch).
- **`performanceTrackerAccess.js`** — shared accessor used by preload, scanner, and route loaders.
- **Tests** — `tests/unit/assetPerformanceTrackerGuards.test.js` (preloadImage, preloadScript, preloadSectionAssets without tracker).

**Conflict check:** Does not change preload orchestration or DOM injection. **`assetLibrary.js`** still uses inline `if (window.performanceTracker)` (separate follow-up if you want full dedup to `trackStep` everywhere).

**How it was tested:** `npm run test:unit -- tests/unit/assetPerformanceTrackerGuards.test.js tests/unit/preloadUrlGuard.test.js tests/unit/preloadSectionAssets.test.js --run`

**How to test in the browser:**
1. Run `npm run dev`, open any page, **Console** (one paste):
   ```js
   (async () => {
     const tracker = window.performanceTracker;
     delete window.performanceTracker;
     let threw = false;
     try {
       const { preloadImage, preloadScript } = await import('/src/utils/assets/assetPreloader.js');
       await preloadImage('data:image/png;base64,xx');
       await preloadScript('javascript:void(0)');
     } catch (e) {
       threw = true;
     } finally {
       if (tracker) window.performanceTracker = tracker;
     }
     console.log({
       ranWithoutTracker: !threw,
       trackerRestored: Boolean(window.performanceTracker),
       pass: !threw,
     });
   })();
   ```
2. **Expected:** `pass: true`, `ranWithoutTracker: true` — no `Cannot read properties of undefined (reading 'step')`.
3. **Optional:** With tracker present, preloads still run; blocked URLs add no `<link>` (see **S-04**).

**How this test connects to the issue:** B-02 is about preload code not throwing when `window.performanceTracker` is absent.

**How the result proves the fix:** Removing the tracker and calling `preloadImage` / `preloadScript` completes without error.

---

### B-03 — Two separate caching systems store overlapping data with no coordination
**Files:** `cacheHandler.js`, `usePreloadStore.js` (localStorage), module-level Maps in `assetLibrary.js` and `assetPreloader.js`  
**Detail:** The system has four independent caching layers:

| Layer | What | Scope | Cleared by |
|-------|------|-------|-----------|
| `cachedAssetMap` | Full asset map object | Module memory | `clearAssetCaches()` via `clearAssetMapConfigCache()` (L-01 ✅) |
| `cacheHandler` TTL entries | Map config + per-flag URLs | Module memory | `clearAllCache()` |
| `loadedAssets` Map | Section metadata objects | Module memory | `clearAssetCaches()` |
| `usePreloadStore.preloadedAssets` | Preloaded URLs | localStorage | `clearPreloadCache()` |

None of these systems know about each other's state. `clearAssetCaches()` does not clear `usePreloadStore`; `clearPreloadCache()` does not clear `cacheHandler`. A unified `resetAssetLibrary()` function should coordinate all layers.

#### Resolution ✅

**Status:** Resolved (this audit pass). Also closes **M-06** (`resetAssetSystem` alias).

**What was broken:** Four cache layers were cleared by separate APIs; calling only one left stale flag URLs, map config, or preload-store entries.

**Why it happened:** `assetLibrary` and `assetPreloader` evolved independently; Pinia preload state was intentionally separate from TTL `cacheHandler`.

**What changed:**
- **`resetAssetLibrary.js`** — single entry point:
  1. `clearAssetCaches()` — `cachedAssetMap`, section maps, `loadedAssets`, manifest, `cacheHandler`, init promise
  2. `clearPreloadCache()` — `usePreloadStore` preloaded URLs, `preloadInProgress`, `jsonDataCache`
  3. `clearAssetPreloadSectionCache()` — memoized route `assetPreload` rollups (default on)
- Returns `{ before, after, sectionRollupCacheCleared }` and logs a summary.
- **`resetAssetSystem`** — alias for `resetAssetLibrary`.
- Exported from `src/utils/assets/index.js`.
- **`clearAssetCaches()`** JSDoc points to `resetAssetLibrary` for full resets.

**Preserves (by design):** `usePreloadStore.preloadedSections` and `buildHash` — section **bundle** preload SSOT, not flag URL cache.

**Conflict check:** Does not change preload orchestration or when preloads run; debugging/CI helper only.

**How it was tested:** `npm run test:unit -- tests/unit/resetAssetLibrary.test.js --run`

**How to test in the browser:**
1. Run `npm run dev`, open any page, **Console** (one paste):
   ```js
   (async () => {
     const { usePreloadStore } = await import('/src/stores/usePreloadStore.js');
     const { getValueFromCache, setValueWithExpiration } = await import(
       '/src/utils/common/cacheHandler.js'
     );
     const { resetAssetLibrary } = await import('/src/utils/assets/resetAssetLibrary.js');
     const store = usePreloadStore();
     setValueWithExpiration('b03_browser_probe', { x: 1 }, 60_000);
     store.addAsset('https://example.com/b03-probe.png');
     const before = {
       cache: getValueFromCache('b03_browser_probe'),
       urls: store.preloadedAssetCount,
     };
     const summary = resetAssetLibrary();
     console.log({
       before,
       summary,
       afterCache: getValueFromCache('b03_browser_probe'),
       afterUrls: store.preloadedAssetCount,
       pass:
         before.cache !== null &&
         before.urls >= 1 &&
         summary.after.cacheHandlerEntries === 0 &&
         summary.after.preloadedUrls === 0 &&
         getValueFromCache('b03_browser_probe') === null &&
         store.preloadedAssetCount === 0,
     });
   })();
   ```
2. **Expected:** `pass: true`, `summary.after` all zeros for library/preload URL layers.

**How this test connects to the issue:** B-03 needs one call to wipe coordinated layers instead of guessing which clear API to use.

**How the result proves the fix:** Probe entries exist before reset and are gone after, with a logged before/after summary.

---

### B-04 — Log messages for cache hits and lookups are buried in noise; no structured match/miss logging
**Files:** `assetLibrary.js`, `cacheHandler.js`  
**Detail (addresses user requirement #3):** The current log output for a single `getAssetUrl('dashboard.logo')` call generates 6+ log lines (`cacheHandler start`, `cacheHandler return`, `assetLibrary start`, `assetLibrary cache-hit`, etc.). There is no single, clear log message that states "flag `X` resolved to URL `Y` (source: cache/map/section)". Operators scanning logs cannot easily tell whether a specific flag was resolved and from which source.

**Required log pattern:**
```js
// On every resolution (cache hit OR map lookup):
log('assetLibrary.js', 'getAssetUrl', 'resolved', `Flag resolved`, {
  flag,
  url,                          // the actual resolved URL
  source: 'section-cache'|'section-map'|'global-cache'|'global-map',
  environment: env,
  section: sectionContext || null,
  cacheHit: true|false
});
// On miss:
log('assetLibrary.js', 'getAssetUrl', 'not-found', `Flag not found`, {
  flag, environment: env, section: sectionContext || null
});
```

#### Resolution ✅

**Status:** Resolved (this audit pass).

**What was broken:** Each `getAssetUrl` call logged `[start]`, `cacheHandler` chatter, `[cache-hit]` or `[success]` separately — no single line with flag, URL, source, and cache hit.

**Why it happened:** Logging grew per internal step (`resolveAndCacheFlagUrl`, `cacheHandler`) without a terminal summary line.

**What changed:**
- **`logGetAssetUrlResolved()`** — one `[getAssetUrl] [resolved]` line: `flag`, `url`, `source` (`section-cache` | `section-map` | `global-cache` | `global-map`), `environment`, `section`, `cacheHit`.
- **`logGetAssetUrlMiss()`** — `[not-found]` or `[blocked]` with flag/env/section (no URL).
- Removed per-call `[getAssetUrl] [start]`; batch `getAssetUrls` still skips per-flag resolution logs (`logResolution: false`).
- **`cacheHandler`** already quiet in production unless `VITE_ENABLE_LOGGER` (P-03).

**Conflict check:** Does not change resolution or preload behavior. **B-01** section sources appear in `resolved.source`.

**How it was tested:** `npm run test:unit -- tests/unit/getAssetUrlResolutionLogging.test.js --run`

**How to test in the browser:**
1. Enable logging: `VITE_ENABLE_LOGGER=true` in `.env.local` (or use dev mode), restart `npm run dev`.
2. **Console** (one paste):
   ```js
   (async () => {
     const origLog = console.log;
     const lines = [];
     console.log = (...args) => {
       const line = args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
       if (line.includes('[getAssetUrl]')) lines.push(line);
       origLog.apply(console, args);
     };
     const { getAssetUrl } = await import('/src/utils/assets/assetLibrary.js');
     const { resetAssetLibrary } = await import('/src/utils/assets/resetAssetLibrary.js');
     resetAssetLibrary();
     lines.length = 0;
     await getAssetUrl('script.cognito', 'development');
     await getAssetUrl('script.cognito', 'development');
     await getAssetUrl('flag.missing.xyz', 'development');
     console.log = origLog;
     const resolved = lines.filter((l) => l.includes('[resolved]'));
     const notFound = lines.filter((l) => l.includes('[not-found]'));
     const starts = lines.filter((l) => l.includes('[start]') && l.includes('[getAssetUrl]'));
     console.log({
       resolvedCount: resolved.length,
       notFoundCount: notFound.length,
       startCount: starts.length,
       firstResolved: resolved[0],
       secondResolved: resolved[1],
       pass:
         resolved.length === 2 &&
         notFound.length === 1 &&
         starts.length === 0 &&
         resolved[0]?.includes('global-map') &&
         resolved[0]?.includes('"cacheHit":false') &&
         resolved[1]?.includes('global-cache') &&
         resolved[1]?.includes('"cacheHit":true'),
     });
   })();
   ```
3. **Expected:** `pass: true`, `startCount: 0`, two `resolved` (map then cache), one `not-found`.

**How this test connects to the issue:** B-04 is operator-visible proof: one terminal line per outcome, with source and cacheHit.

**How the result proves the fix:** Exactly two `resolved` logs for two lookups of the same flag (map + cache), no `[getAssetUrl] [start]`, and a single `not-found` for a missing flag.

---

### B-05 — `assetMap.json` mixes local relative paths and external absolute URLs with no documentation of the model
**File:** `assetMap.json`  
**Detail:** `development` uses paths like `/assets/icons/cart-dev.svg` (Vite dev-server) while `production` uses absolute `https://...` CDN URLs. `staging` has only 2 entries, both overrides. The inheritance model (dev/staging fall back to production) is undocumented in the file. Operators editing the map have no guidance on which environment a flag must exist in to be valid, or that production is the required baseline.

#### Resolution ✅

**Status:** Resolved (this audit pass). JSON cannot hold comments; documentation lives beside the source file.

**What was broken:** Operators had no in-repo guide for env blocks, production-as-baseline, or when to use `/assets/...` vs `https://cdn...`.

**What changed:**
- **`src/config/assetMap.README.md`** — expanded with env table, inheritance rules, relative vs absolute table, operator checklist, links to `validateAssetMap()` and sync workflow (S-05 / B-01).
- **`public/config/README.md`** — points editors to `assetMap.README.md`.

**Conflict check:** Does not change map contents or resolution logic.

**How it was tested:** `npm run test:unit -- tests/unit/assetMapReadme.test.js --run`

**How to test in the browser:**
1. Open `src/config/assetMap.README.md` in the IDE.
2. **Console** (one paste):
   ```js
   (async () => {
     const { validateAssetMap } = await import('/src/utils/assets/assetLibrary.js');
     const validation = await validateAssetMap();
     console.log({
       valid: validation.valid,
       errors: validation.errors.length,
       warnings: validation.warnings.length,
       environments: validation.summary.environments,
       pass: validation.valid && validation.errors.length === 0,
     });
   })();
   ```
3. **Expected:** `pass: true` on the current map (production populated; no HTTP errors in production).

**How this test connects to the issue:** B-05 is documentation + validation that production remains the required baseline.

**How the result proves the fix:** README is the operator source of truth; `validateAssetMap()` confirms the live map still meets the documented rules.

---

### B-06 — `loadedAssets` in-memory Map and `cacheHandler` both store the same section metadata
**File:** `assetLibrary.js` lines 38, 219, 396–402  
**Detail:** After `loadAssetsForSection` completes, the result is written to both `cacheHandler` (`setValueWithExpiration`) and the in-memory `loadedAssets` Map. On the next call, memory is checked first (line 388), then cache (line 395–402). The double-write creates two copies of every section object and forces `getAssetsForSection` to have a two-path read. The in-memory Map should be the canonical fast path; `cacheHandler` should be the persistent fallback. On memory miss → cache hit, re-hydrate memory (already done at line 401) but do not double-write on the initial load.

#### Resolution ✅

**Status:** Resolved (this audit pass).

**What was broken:** Every `loadAssetsForSection` success wrote the same object to `loadedAssets` and `cacheHandler` immediately (duplicate hot-path writes).

**What changed:**
- **`loadAssetsForSection`** — on fresh load, writes **`loadedAssets` only** (memory canonical for the session).
- **`persistSectionAssetsToHandlerCache()`** — lazy TTL write when memory has data and cache has no entry yet.
- **`getAssetsForSection`** — on memory hit, calls lazy persist so reload/rehydrate paths still get TTL cache without double-write on load.
- **Cache-hit load path** — still reads TTL → rehydrates memory (unchanged).
- **`getSectionAssetCacheKey()`** — shared key helper.

**Conflict check:** Does not change preload orchestration. **`unloadUnusedSections`** still clears both memory and TTL for evicted sections.

**How it was tested:** `npm run test:unit -- tests/unit/sectionAssetsMemoryFirst.test.js tests/unit/areAssetsLoadedForSection.test.js tests/unit/loadAssetsForSectionDedup.test.js --run`

**How to test in the browser:**
1. Run `npm run dev`, **Console** (one paste):
   ```js
   (async () => {
     const {
       resetAssetLibrary,
       loadAssetsForSection,
       getAssetsForSection,
       isSectionAssetMetadataInMemory,
       isSectionAssetMetadataCached,
     } = await import('/src/utils/assets/index.js');
     resetAssetLibrary();
     await loadAssetsForSection('auth');
     const inMemoryAfterLoad = isSectionAssetMetadataInMemory('auth');
     const cachedAfterLoad = isSectionAssetMetadataCached('auth');
     const assets = getAssetsForSection('auth');
     const cachedAfterRead = isSectionAssetMetadataCached('auth');
     console.log({
       inMemoryAfterLoad,
       cachedAfterLoad,
       sectionName: assets?.sectionName,
       cachedAfterRead,
       pass:
         inMemoryAfterLoad === true &&
         cachedAfterLoad === false &&
         assets?.sectionName === 'auth' &&
         cachedAfterRead === true,
     });
   })();
   ```
2. **Expected:** `pass: true` — memory warm after load, TTL empty until `getAssetsForSection` lazy-persists. Do **not** import `cacheHandler.js` separately in the console (dev can load a second module instance and show false cache misses).

**How this test connects to the issue:** B-06 separates hot memory from lazy TTL persistence.

**How the result proves the fix:** `cachedAfterLoad === false` proves no double-write on load; `cachedAfterRead === true` proves persistence still works via read path.

---

### B-07 — `detectEnvironment` result is cached in `currentEnvironment` but can drift from Vite's runtime `import.meta.env`
**File:** `assetLibrary.js` lines 573–603  
**Detail:** Environment is detected once and stored in the module-level `currentEnvironment` variable. `import.meta.env` values are compile-time constants and cannot change, so this is safe for production builds. However, in development with HMR, if a developer manually calls `setEnvironment('production')` to test, `detectEnvironment()` still returns the cached value. The function should check `currentEnvironment` only when it was **manually** set (i.e., via `setEnvironment`), and always re-evaluate `import.meta.env` otherwise.

#### Resolution ✅

**Status:** Resolved (this audit pass).

**What was broken:** First auto-detect wrote into `currentEnvironment`, so every later `detectEnvironment()` returned that cached value even when no manual override was intended — conflating Vite auto-detect with `setEnvironment()` overrides.

**What changed:**
- **`environmentOverride`** — set only by `setEnvironment()`; cleared by `clearAssetCaches()` / `resetAssetLibrary()`.
- **`resolveEnvironmentFromImportMeta()`** — reads `import.meta.env` / hostname on each call; not stored in module state.
- **`detectEnvironment()`** — returns override when set, otherwise fresh auto-detect.

**Conflict check:** Does not change preload orchestration or map loading; `setEnvironment()` still clears map + URL + category caches (L-06).

**How it was tested:** `npm run test:unit -- tests/unit/detectEnvironmentOverride.test.js tests/unit/setEnvironmentUrlCache.test.js --run`

**How to test in the browser:**
1. Run `npm run dev`, **Console** (one paste):
   ```js
   (async () => {
     const { getEnvironment, setEnvironment, clearAssetCaches } = await import(
       '/src/utils/assets/assetLibrary.js'
     );
     clearAssetCaches();
     const viteDefault = getEnvironment();
     setEnvironment('production');
     const afterManual = getEnvironment();
     clearAssetCaches();
     const afterClear = getEnvironment();
     console.log({
       viteDefault,
       afterManual,
       afterClear,
       pass: afterManual === 'production' && afterClear === viteDefault,
     });
   })();
   ```
2. **Expected:** `pass: true` — manual override sticks until `clearAssetCaches`; then auto-detect matches dev (`viteDefault` / `afterClear` both `'development'` in local dev).

**How this test connects to the issue:** B-07 separates manual test overrides from Vite auto-detect.

**How the result proves the fix:** `afterManual === 'production'` proves `setEnvironment` works; `afterClear === viteDefault` proves auto-detect is not stuck on a stale cached env.

---

### B-08 — `src/config/assetMap.json` is imported nowhere; only the `public/` copy is served
**File:** `src/config/assetMap.json`  
**Detail:** The file in `src/config/` is never imported by any JS module (confirmed by grep). The runtime fetch at `assetLibrary.js:667` targets `/config/assetMap.json` which is served from `public/`. The `src/` copy is therefore dead code — it exists only to give IDEs a reference, creating the maintenance hazard described in S-05.

#### Resolution ✅

**Status:** Obsolete finding — closed with documentation (this audit pass). Runtime no longer treats `public/` as the sole source of truth.

**What was broken (historical):** `src/config/assetMap.json` was not imported; only `/config/assetMap.json` from `public/` was used at runtime, so editors could edit `src/` while production served stale `public/` copies.

**What changed (prior + this pass):**
- **S-03 / S-05 / B-01** — `assetMapSource.js` **imports** `src/config/assetMap.json` (bundled + SHA-256); production defaults to bundled map.
- **`build/vite/syncAssetMapPlugin.js`** — mirrors `src/config/assetMap*.json` → `public/config/` on dev/build (`npm run sync:asset-map`).
- **Dev fetch** — optional `/config/assetMap.json` only when `VITE_ASSET_MAP_RUNTIME_OVERRIDE=true`; not the primary path.
- **Other imports** — `routeConfigLoader.js`, `jsonConfigValidator.js` import the same `src/config/assetMap.json` for validation.

**Conflict check:** Complements preload/security work; does not change section preload orchestration.

**How it was tested:** `npm run test:unit -- tests/unit/assetMapSourceImport.test.js tests/unit/assetMapConfig.test.js tests/unit/syncAssetMapToPublic.test.js --run`

**How to test in the browser:**
1. **Console** (one paste):
   ```js
   (async () => {
     const { loadAssetMapConfig, getAssetMapConfigSource } = await import(
       '/src/utils/assets/assetLibrary.js'
     );
     const map = await loadAssetMapConfig();
     console.log({
       source: getAssetMapConfigSource(),
       hasCognito: Boolean(map?.production?.['script.cognito']),
       pass:
         typeof map?.production?.['script.cognito'] === 'string' &&
         getAssetMapConfigSource() !== null,
     });
   })();
   ```
2. **Expected:** `pass: true`, `hasCognito: true` — map loaded from bundled `src/config` (source logged as `bundled-*` in production build, or dev override path when enabled).

**How this test connects to the issue:** B-08 was “src never imported”; bundled load proves `src/config` is the build input.

**How the result proves the fix:** Non-null `script.cognito` URL from `loadAssetMapConfig()` without relying on hand-edited `public/` alone.

---

## 5. Missing Features

### M-01 — No global + per-section asset library with section-overrides-global merge
**Files:** `assetLibrary.js`, `assetMap.json`  
**Detail (primary user requirement):** There is no mechanism to define section-specific asset URLs that override global defaults. All flags live in one flat map. Required behaviour:

- A **global** `assetMap.json` defines the baseline for all sections
- Each section can optionally provide `assetMap.<sectionName>.json` with overrides
- `getAssetUrl(flag, { section })` merges section map over global, section takes precedence
- If no section context is given, only the global map is consulted
- Both maps support the same environment-inheritance model (dev/staging → production fallback)

**Implementation plan:**
1. Add `loadSectionAssetMap(sectionName)` — fetches `/config/assetMap.${sectionName}.json`, tolerates 404 (section has no overrides)
2. Cache loaded section maps in a `Map<sectionName, assetMap>` with the same TTL as the global map
3. Modify `getAssetUrl(flag, { section, environment } = {})`:
   - If `section` is provided, attempt resolution from section map first (env → production fallback)
   - Then fall back to global map (env → production fallback)
   - Log resolution source (see B-04)
4. Update `getAssetUrls`, `getAssetsByCategory`, `preloadAssetUrls`, and `validateAssetMap` to accept optional `section` parameter
5. Update `preloadSectionAssets` to pass `section` context when resolving flags

#### Resolution ✅

**Status:** Resolved with **B-01** (steps 1–3 and 5). Step 4 partial: `getAssetUrls` / `preloadAssetUrls` accept `section`; `getAssetsByCategory` / `validateAssetMap` still global-only (**A-P05**).

---

### M-02 — No `initAssetLibrary()` startup function for eager cache warm-up
**File:** `assetLibrary.js`  
**Detail (user requirement #1):** The asset map is loaded lazily. First-render components calling `getAssetUrl` block on a network fetch. An explicit init function called in `main.js` before `app.mount()` should:
1. Detect environment
2. Fetch and cache the global `assetMap.json`
3. Pre-warm URL cache for all known global flags (no network request — just resolves from the already-loaded map)
4. Optionally pre-warm section map for the initial route's section
5. Log the ready state with flag count and environment

#### Resolution ✅

**Status:** Resolved with **P-01** (steps 1–3 and 5). Step 4 (per-section map for initial route) is **not** implemented — per-section maps are **M-03**.

---

### M-03 — No per-section asset map files exist or are loaded
**Files:** `assetLibrary.js`, `public/config/`  
**Detail:** Per M-01, section-level override maps are entirely absent from both the code and the `public/config/` directory. Neither `loadSectionAssetMap` nor any section-specific JSON file exists. This is the core missing feature.

#### Resolution ✅

**Status:** Resolved with **B-01** — `src/config/assetMap.auth.json`, `loadSectionAssetMap()`, build-time glob + `public/config` sync.

---

### M-04 — No startup cross-validation: flags in `routeConfig.assetPreload` vs. entries in `assetMap.json`
**Files:** `assetLibrary.js`, `routeConfig.json`, `assetMap.json`  
**Detail:** When a route declares `{ "flag": "dashboard.hamburger", "type": "image" }` but the flag is absent from `assetMap.json`, `getAssetUrl` silently returns `null` and the preload is skipped with a warn-level log that is easy to miss. A startup validation call (or a Vite plugin) should cross-reference every flag used in `routeConfig.assetPreload` against `assetMap.json` and surface missing flags at start-up or CI time.

---

### M-05 — No version/build-hash invalidation for `usePreloadStore` localStorage data
**File:** `usePreloadStore.js` lines 62–66  
**Detail:** Preloaded asset URLs are persisted indefinitely. After a deploy that changes asset filenames (content hashing), the stored URLs point to stale or 404 paths but `hasAsset(url)` still returns `true`, causing the app to believe assets are preloaded when they are not. Add a `storeVersion` field tied to `import.meta.env.VITE_APP_VERSION` or a build hash; clear and re-preload when the version changes.

---

### M-06 — `clearAssetCaches()` and `clearPreloadCache()` are not coordinated — no unified reset API
**Files:** `assetLibrary.js`, `assetPreloader.js`, `cacheHandler.js`, `usePreloadStore.js`  
**Detail:** Four separate clear functions exist with no single entry point. A developer debugging a caching issue must know to call all four. A single exported `resetAssetSystem()` function should:
1. `clearAssetCaches()` — clears map, manifest, `loadedAssets`, `cacheHandler`
2. `clearPreloadCache()` — clears `preloadedAssets`, `preloadInProgress`, `jsonDataCache`
3. Log a summary of what was cleared

#### Resolution ✅

**Status:** Resolved with **B-03** — use `resetAssetLibrary()` / `resetAssetSystem()`.

---

### M-07 — `unloadUnusedSections` does not evict per-flag URL cache entries for unloaded sections
**File:** `assetLibrary.js` lines 508–561  
**Detail:** When a section is unloaded, its section-metadata cache entry is left in `cacheHandler` (see L-05). Additionally, any `asset_url_<env>_<flag>` entries that belong to that section's flags are never evicted. Over a long session with many section transitions, the URL cache grows without bound. Section flags should be tracked on load so they can be individually evicted on unload.

---

### M-08 — No observable / reactive API for asset resolution state in Vue components
**File:** `assetLibrary.js`  
**Detail:** `getAssetUrl(flag)` is a plain async function. Vue components calling it in `onMounted` must manage their own loading/loaded/error state with `ref`. There is no `useAssetUrl(flag)` composable that returns a reactive `{ url, loading, error }` tuple. This leads to duplicated boilerplate across all auth and dashboard components (confirmed across `AuthLogIn.vue`, `DashboardSidebar.vue`, `AuthWrapper.vue`, etc.).

**Required composable:**
```js
// src/composables/useAssetUrl.js
export function useAssetUrl(flag, sectionName = null) {
  const url = ref(null);
  const loading = ref(true);
  const error = ref(null);
  onMounted(async () => {
    try { url.value = await getAssetUrl(flag, { section: sectionName }); }
    catch (e) { error.value = e; }
    finally { loading.value = false; }
  });
  return { url, loading, error };
}
```

---

### M-09 — No `cacheHandler` size cap or LRU eviction; unbounded memory growth
**File:** `cacheHandler.js`  
**Detail:** `cacheStorage` is an unconstrained `Map`. In a long-running SPA session, every unique flag + environment combination adds an entry. With section maps (once added), the number of distinct `asset_url_*` keys multiplies by the number of sections. Add a configurable max-size (e.g. 500 entries) with LRU eviction so the cache stays bounded.

---

### M-10 — No `Content-Type` validation for the fetched `assetMap.json`
**File:** `assetLibrary.js` lines 663–715  
**Detail:** After the fetch, only `response.ok` is checked. A server misconfiguration serving HTML (e.g. an error page) at `/config/assetMap.json` would cause `response.json()` to throw; the catch block returns an empty map silently. The `Content-Type` should be validated (`application/json`) before attempting to parse.

---

### M-11 — No TTL configuration per asset type; all flags use the same 30-minute URL cache TTL
**File:** `assetLibrary.js` line 51  
**Detail:** Critical brand assets (logos, auth backgrounds) rarely change and could be cached for hours. Third-party CDN URLs that rotate may need shorter TTLs. A per-type or per-flag TTL override in `assetMap.json` (e.g. `{ "url": "...", "ttl": 86400000 }`) would allow fine-grained cache control without hardcoding constants.

---

## 6. `assetMap.json` Configuration Issues

### C-01 — `staging` environment only partially overrides production; no documentation of intent
**File:** `assetMap.json` lines 43–46  
**Detail:** `staging` defines only `icon.cart` and `logo.main`. All other staging flags fall back to production. This appears intentional (staging mostly uses production URLs) but is undocumented. Developers adding new flags may not realise they need to add them to staging or that staging silently inherits production values.

---

### C-02 — `development` environment mixes local relative paths and external `i.ibb.co` URLs
**File:** `assetMap.json` lines 1–35  
**Detail:** Some development icons use `/assets/icons/...` (requires Vite dev server) while most use `https://i.ibb.co/...` (external). This means local development partially depends on internet connectivity. All development icons should be local relative paths so the app functions fully offline.

---


---

### C-04 — No `icon.home`, `icon.settings`, `icon.logout` equivalents in `development`
**File:** `assetMap.json`  
**Detail:** `production` defines `icon.home`, `icon.settings`, `icon.logout`, `logo.footer`, `image.banner`, `font.primary`, `font.secondary` — none of which exist in `development`. Developers testing production-only routes in development will get `null` from `getAssetUrl` for these flags (production fallback does not apply when environment is `development`). These flags must either be added to `development` or the inheritance model must be clarified.

---

### C-05 — `auth.background` and most `dashboard.*` flags are duplicated identically in `development` and `production`
**File:** `assetMap.json`  
**Detail:** Many flags have the same `i.ibb.co` URL in both environments. Duplicating them across environments doubles the maintenance surface. Flags that genuinely need no environment-specific override should be defined only in `production` (the inheritance base) and left absent from `development`/`staging`.

---

## 7. Additional Issues Found (Second Pass)

### A-L01 — `loadAssetMapConfig` permanently caches failure as an empty map and stops retrying
**File:** `assetLibrary.js` lines 697–708, 643–646  
**Detail:** On any transient fetch/parsing error, the catch block creates `emptyMap`, assigns it to `cachedAssetMap`, and returns it. Subsequent lookups hit the in-memory fast path and never retry network fetch in the same session. A brief outage therefore causes all flag lookups to fail until full app reload or manual cache reset.

**Fix:** Do not assign `cachedAssetMap` on fetch failure. Keep a short-lived failure backoff flag instead, then retry.

---

### A-L02 — `getAssetUrls` can throw before validation (`flags.length` accessed before `Array.isArray`)
**File:** `assetLibrary.js` lines 792–799  
**Detail:** Logging reads `flags.length` before type validation. If `flags` is `null`, `undefined`, or a non-array object, it throws `TypeError` before the guard runs. This bypasses the intended graceful return `{}`.

---

### A-L03 — `preloadAssetUrls` has the same pre-validation crash (`flags.length` access)
**File:** `assetLibrary.js` lines 957–964  
**Detail:** Same pattern as A-L02. `flagCount: flags.length` is evaluated before array validation, so invalid input can throw before the function returns `0`.

---

### A-L04 — `clearAssetCaches()` does not clear in-flight section load tracker
**File:** `assetLibrary.js` lines 455–482  
**Detail:** The function clears `loadedAssets`, `cachedManifest`, and `cacheHandler`, but not `assetsLoadingInProgress`. If a clear happens during/after interrupted loads, stale loading keys remain and future calls can enter `waitForAssetLoad` and time out unnecessarily.

---

### A-P01 — Cache misses are not cached, causing repeated full-resolution work for missing flags
**File:** `assetLibrary.js` lines 770–777  
**Detail:** `getAssetUrl` caches successful URLs but does not cache negative lookups (`null`). Frequently-missing flags trigger full map load + lookup + logging every call. Add short-TTL negative caching (e.g., `asset_url_miss_<env>_<flag>` for 1-5 min).

---

### A-P02 — `getAssetUrls` does not deduplicate duplicate flags in input
**File:** `assetLibrary.js` lines 803–807  
**Detail:** Duplicate flags in the input array produce duplicate async resolution calls and duplicate cache reads/writes. Deduplicate with `const uniqueFlags = [...new Set(flags)]` before mapping.

---

### A-B01 — `cacheHandler` references `window` directly, which breaks in non-browser contexts
**File:** `cacheHandler.js` lines 24 and 69  
**Detail:** `if (window.performanceTracker)` is used without `typeof window !== 'undefined'` guard. In SSR/tests/Node tooling, this throws `ReferenceError: window is not defined`.

**Fix:**
```js
if (typeof window !== 'undefined' && window.performanceTracker) {
  window.performanceTracker.step(...);
}
```

---

### A-B02 — `loadAssetsForSection` cache-hit path does not rehydrate `loadedAssets` memory map
**File:** `assetLibrary.js` lines 160–176  
**Detail:** On cache hit, function returns cached object immediately but never writes `loadedAssets.set(sectionName, cachedAssets)`. This keeps memory/cached state inconsistent and worsens behavior of APIs that rely on `loadedAssets` (for example `areAssetsLoadedForSection`).

---


### A-M01 — No explicit API to preload and cache section+global merged flag index
**Files:** `assetLibrary.js`, `assetMap.json`  
**Detail:** Existing APIs resolve one or many flags ad hoc. There is no `primeAssetIndex({ section, environment })` that materializes a merged map once and serves O(1) lookups from that snapshot. This is especially important once section-over-global precedence is implemented.

---

## 8. Additional Issues Found (Third Pass)

### A-L05 — `clearAssetCaches()` wipes the entire shared `cacheHandler`, not just asset keys
**File:** `assetLibrary.js` line 476  
**Detail:** `clearAssetCaches()` calls `clearAllCache()`, which clears **every** entry in the global `cacheStorage` Map. That store is also used by `translationLoader.js`, `jsonConfigLoader.js`, and `sectionPreloader.js`. Clearing “asset caches” therefore evicts translation bundles, route/JSON config cache, and section-preload markers unrelated to assets. Asset-specific reset should delete only keys with prefixes such as `asset_metadata_`, `asset_map_config`, and `asset_url_`.

---

### A-L06 — `getValueFromCache` returns mutable object references; callers can corrupt cached asset map
**Files:** `cacheHandler.js` lines 106–108; `assetLibrary.js` lines 649–653, 161–175  
**Detail:** Cached values are returned by reference with no clone/freeze. Any consumer that mutates the returned asset map or section metadata object (for example `assetMap.production['icon.cart'] = '...'`) permanently corrupts the in-memory and TTL cache for all later lookups. `loadAssetMapConfig` and `getAssetsForSection` should return deep-frozen copies or clone-on-read for config objects.

---

### A-L07 — `loadAssetMapConfig` treats JSON arrays as valid asset maps
**File:** `assetLibrary.js` lines 675–678  
**Detail:** Validation is only `typeof assetMap !== 'object'`. In JavaScript, arrays satisfy that check. A malformed `assetMap.json` that parses to `[]` would pass validation; later `assetMap[env]?.[flag]` lookups silently fail. Reject arrays and non-plain objects (`Array.isArray(assetMap)` or `Object.getPrototypeOf(assetMap) !== Object.prototype`).

---

### A-L08 — `getAssetPreloadConfigForSection` includes assets from disabled routes
**File:** `assetLibrary.js` lines 96–118  
**Detail:** Route filtering matches `section` only and never checks `route.enabled !== false`. Disabled routes remain in `getRouteConfiguration()` and still contribute `assetPreload` entries into section metadata via `loadAssetsForSection`. That contradicts router behavior (disabled routes are not registered) and can preload assets for routes that should be inactive.

---

### A-L09 — `setEnvironment` does not reset `assetMapLoadPromise` or in-flight map fetch state
**File:** `assetLibrary.js` lines 612–623  
**Detail:** `setEnvironment` nulls `cachedAssetMap` but leaves `assetMapLoadPromise` untouched. If called while a fetch is in flight, waiters may resolve to a map for the previous environment and repopulate cache under the new session. Reset should also set `assetMapLoadPromise = null` (and ideally bump a cache generation id used in URL cache keys).

---

### A-L10 — Whitespace-only flags pass validation in `getAssetUrl`
**File:** `assetLibrary.js` lines 728–731  
**Detail:** Guard is `if (!flag || typeof flag !== 'string')`. A flag of `'   '` is truthy and proceeds to cache lookup / map scan, producing confusing miss logs and useless cache keys (`asset_url_development_   `). Trim and reject empty-after-trim flags.

---

### A-P03 — `fetch('/config/assetMap.json')` has no cache-busting; browser HTTP cache can serve stale maps
**File:** `assetLibrary.js` line 667  
**Detail:** The fetch uses default browser caching. Deploying a new `assetMap.json` without cache headers or fingerprinted filename can leave users on an old map until TTL expiry. Use `cache: 'no-store'`, versioned URLs (`assetMap.<hash>.json`), or `Cache-Control` on the static file plus a build-time embedded version check.

---

### A-P04 — `hasAssetFlag` always runs full `getAssetUrl` resolution (no map-only fast path)
**File:** `assetLibrary.js` lines 879–888  
**Detail:** Existence checks invoke `getAssetUrl`, which hits URL cache, loads the map, applies inheritance, writes cache, and logs multiple steps. For batch validation or UI toggles, a `hasAssetFlagInMap(flag, env)` that inspects the loaded map only (no URL cache write) would be cheaper and easier to reason about.

---

### A-P05 — `getAssetsByCategory` bypasses `getAssetUrl` (no URL validation, no per-flag resolve logging)
**File:** `assetLibrary.js` lines 903–941  
**Detail:** Category queries copy raw strings from `assetMap[env]` and production fallback directly into the result object. They do not run the same resolution pipeline as `getAssetUrl` (trim, allowlist, structured resolve/miss logs, URL cache). Consumers like menu/dashboard code may get URLs that would never pass centralized validation once S-04 is fixed. Category results should be built via the shared resolver.

---

### A-S02 — Resolved URLs are injected into HTML/CSS unescaped at call sites
**Files:** `AuthWrapper.vue` line 4; `assetLibrary.js` `getAssetUrl` return path  
**Detail:** `getAssetUrl` returns raw strings that templates bind into `:style="{ backgroundImage: \`url(${bgUrl})\` }"` and `<img :src="...">` without encoding. A poisoned map entry containing `"` or `)` can break out of the CSS `url()` context or produce attribute injection. The library should return only validated URLs and document required encoding, or provide safe helpers (`getAssetUrlForCss`, `getAssetUrlForAttr`).

---

### A-B03 — `menuItems.resolveMenuItemsWithAssets` uses unresolved flag strings as image `src` on miss
**File:** `menuItems.js` line 217  
**Detail:** `resolved.image = loadedAssets[item.image] || item.image` falls back to the flag name (e.g. `"dashboard.menu.analytics"`) when lookup returns `null`. The browser then requests a nonsense URL, causing 404s and hiding configuration errors. Fallback should be `null`, a placeholder image, or a logged error — never the flag identifier.

---

### A-B04 — `createAssetHandler` resolves flags without `environment` or `section` context
**File:** `assetHandlerFactory.js` line 25  
**Detail:** `getAssetUrl(config.flag)` is called with no second argument and no section option. Auth/dashboard components that rely on `setEnvironment()` for testing, or future per-section overrides (M-01), will not get correct URLs in handler-created assets. Factory should accept `{ environment, section }` and forward them to `getAssetUrl`.

---

### A-B05 — `preloadAssetsForSections` assumes `sectionNames` is an array
**File:** `assetLibrary.js` lines 311–314  
**Detail:** `sectionNames.length` is read in the first log call before any validation. Passing `undefined` or a non-array throws before the batch API can return an empty result. Add the same `Array.isArray` guard used in `getAssetUrls` / `preloadAssetUrls`.

---

### A-B06 — `unloadUnusedSections` declares `cacheKey` but never calls `removeFromCache`
**File:** `assetLibrary.js` lines 538–540  
**Detail:** L-05 notes the wrong comment; additionally `removeFromCache` is not imported in `assetLibrary.js` at all, so the recommended fix cannot be applied without adding the import. Dead `cacheKey` variable signals incomplete eviction implementation.

---

### A-M02 — `validateAssetMap()` is never invoked at application startup
**Files:** `assetLibrary.js`; `main.js`  
**Detail:** The validator exists and is exported from `index.js`, but `main.js` never calls it before `app.mount()`. Broken URLs and missing production keys therefore surface only at runtime per component. Wire `validateAssetMap()` into startup (dev: throw or console.error; CI: fail build) per M-04.

---

### A-M03 — No synchronous read path for already-resolved flags
**File:** `assetLibrary.js`  
**Detail:** Every lookup is `async` even when the URL is already in `cacheHandler` or the in-memory map. High-frequency UI (sidebars, menus) could use `getAssetUrlSync(flag)` that reads TTL cache / warm index synchronously and falls back to async only on miss — reducing mount flicker after warm-up.

---

### A-C06 — `resolveMenuItemsWithAssets` only resolves flags prefixed with `dashboard.menu.`
**File:** `menuItems.js` lines 201–204  
**Detail:** Asset collection skips any `item.image` that does not start with `dashboard.menu.`. If menu config later uses other valid flags (`dashboard.logo`, `icon.*`), they are never passed to `getAssetUrls` and remain raw strings in the UI. Flag collection should include any value that matches `hasAssetFlag` / exists in the map, or an explicit `isAssetFlag()` helper.

---

*End of audit. Asset preload DOM-injection issues are in `ASSET_PRELOAD_AUDIT.md`. Section JS/CSS bundle loading issues are in `SECTION_PRELOAD_AUDIT.md`. Router guard issues are in `src/router/AUDIT.md`.*
