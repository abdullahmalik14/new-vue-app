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

---

### L-03 — `assetMapLoadPromise` is set to `null` in `finally` before all waiters have consumed it
**File:** `assetLibrary.js` lines 663–715  
**Detail:** The load flow is: check `cachedAssetMap` → check `cacheHandler` → check `assetMapLoadPromise` → if none, create the IIFE and assign to `assetMapLoadPromise`. The `finally` block sets `assetMapLoadPromise = null` when the fetch resolves. A caller that picks up the promise (line 659) and awaits it is fine; but a new caller that arrives between the resolve settling and the `finally` running may see `assetMapLoadPromise = null` and start a duplicate fetch race. This is a classic "promise nulled too early" race. The fix is to keep `assetMapLoadPromise` alive until after `cachedAssetMap` is written (move null-assignment after `cachedAssetMap = assetMap`).

---

### L-04 — `areAssetsLoadedForSection` only checks the in-memory `loadedAssets` Map, not `cacheHandler`
**File:** `assetLibrary.js` line 415–419  
**Detail:** `loadedAssets` is a module-level in-memory `Map` that is lost on page reload. After a reload, even if `cacheHandler` holds a valid TTL entry for the section, `areAssetsLoadedForSection` returns `false`, causing components to incorrectly believe the section needs reloading and triggering redundant work. `getAssetsForSection` correctly checks both memory and cache (lines 394–403); `areAssetsLoadedForSection` should call `getAssetsForSection(sectionName) !== null` for consistency.

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

---

### L-06 — `setEnvironment` does not invalidate per-flag URL cache entries in `cacheHandler`
**File:** `assetLibrary.js` lines 612–623  
**Detail:** `setEnvironment(env)` sets `cachedAssetMap = null` to force a map reload. However, resolved URLs are cached individually under keys like `asset_url_development_icon.cart` in `cacheHandler` with a 30-minute TTL. After switching environments these stale entries are served without re-resolving against the new environment. All `ASSET_URL_CACHE_PREFIX + '*'` keys must be evicted on environment change — use a prefix-scan or a version/generation counter pattern.

---

### L-07 — `getAvailableAssetFlags` merges production into env flags but `getAssetsByCategory` does not respect staging overrides
**File:** `assetLibrary.js` lines 917–934  
**Detail:** `getAvailableAssetFlags` adds production flags first and then overlays env-specific flags (correct inheritance). `getAssetsByCategory` does the reverse: it reads `assetMap[env]` first, then fills gaps from production (also correct), but it never applies the `env` override if a flag exists in **both** staging and production — staging/dev entries would overwrite production ones only if the outer condition (`!matchingAssets[flag]`) is not triggered. Actually the logic here is inverted: it sets the env value first, then checks `!matchingAssets[flag]` for production, which is correct. However it is inconsistent with `getAvailableAssetFlags` which adds production first. The two functions should share the same resolution helper to avoid future divergence.

---

### L-08 — `validateAssetMap` accepts a broken `icon.globe` URL without raising an error
**File:** `assetMap.json` lines 9 (dev) and 51 (prod); `assetLibrary.js` line 1016  
**Detail:** The URL `https://i.ibb.co.com/mF9x2JG0/...` contains the typo `co.com` instead of `co`. The validator only checks that the string starts with `/`, `http://`, or `https://` — it does not check that the hostname is structurally valid or that it resolves. This URL will always return a 404 and, worse, could be registered by a third party to serve hostile content.

---

### L-09 — `index.js` exports `AssetInjector` from a file that does not exist
**File:** `src/utils/assets/index.js` line 57  
**Detail:** `export { default as AssetInjector } from './assetInjector'` — `assetInjector.js` is absent from disk. Any import of `AssetInjector` from the assets barrel will throw a module-not-found error at runtime (or bundle-time with Vite). Export must be removed.

---

### L-10 — `loadAssetMapConfig` always fetches from `/config/assetMap.json` regardless of environment
**File:** `assetLibrary.js` line 667  
**Detail:** In development, Vite serves files from `src/` via its dev-server and does not expose `public/config/assetMap.json` at that path by default (unless `public/` is configured). This silent empty-map fallback (lines 701–708) means all flag lookups return `null` during local development unless the developer happens to have the right file in `public/`. The fetch URL should be configurable via `import.meta.env.VITE_ASSET_MAP_URL` with a sensible per-mode default.

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

---

### P-03 — `getValueFromCache` and `setValueWithExpiration` generate two `log()` calls each on every hit
**File:** `cacheHandler.js` lines 52–57, 106–108  
**Detail:** Every cache read fires two log entries (`'start'` + `'return'`). Every cache write fires two. For a 40-flag dashboard preload, that is 160+ log entries just from cache operations. Reduce to one log per operation and gate behind a debug flag for production.

---

### P-04 — `getAssetUrl` resolves flags sequentially via `loadAssetMapConfig` but `getAssetUrls` calls it N times in parallel
**File:** `assetLibrary.js` lines 804–808  
**Detail:** `getAssetUrls(flags)` launches one `getAssetUrl` call per flag in parallel via `Promise.all`. Each `getAssetUrl` calls `loadAssetMapConfig()` which correctly returns the shared promise/cache. However, the per-flag URL cache check (lines 738–742) happens before the map is available. After the map loads, each parallel caller performs a redundant `cacheHandler.getValueFromCache` and `cacheHandler.setValueWithExpiration` separately. A single-pass `getAssetUrls` implementation that calls `loadAssetMapConfig()` once and then resolves all flags from the loaded map in a synchronous loop would be significantly faster.

---

### P-05 — `preloadAssetsForSections` launches section loads in parallel but ignores partial cache hits
**File:** `assetLibrary.js` lines 326–346  
**Detail:** this may have been patched already check before you do anything.... `sectionNames.map(name => loadAssetsForSection(name))` fires all loads simultaneously. For sections already in `loadedAssets` (memory hit), the shortcut at line 162 (`getValueFromCache`) returns immediately. But for sections partially cached (some routes loaded, manifest stale), the whole section reloads. A smarter implementation should check `areAssetsLoadedForSection` first, skip already-loaded sections, and only load the missing ones.

---

### P-06 — `cacheHandler` has no lazy expiry sweep; stale entries accumulate indefinitely
**File:** `cacheHandler.js` lines 97–103  
**Detail:** Expired entries are only evicted on access (`getValueFromCache`). Entries for unused flags/sections silently consume memory until accessed. Add a periodic sweep (e.g. every 10 minutes via `setInterval`) or a LRU eviction policy. Alternatively cap `cacheStorage` size.

---

### P-07 — `getAssetsByCategory` re-loads the full asset map and iterates all keys every call
**File:** `assetLibrary.js` lines 903–946  
**Detail:** Every call to `getAssetsByCategory('dashboard')` awaits `loadAssetMapConfig()` (cache hit, fast) then iterates every key in `assetMap[env]`. No category result is cached. With 35 dashboard flags, this is trivially fast today but will degrade as `assetMap` grows. Cache category results under `asset_category_<env>_<category>`.



### S-03 — `loadAssetMapConfig` trusts the fetched JSON with only a shallow `typeof` check
**File:** `assetLibrary.js` lines 676–683  
**Detail:** The only validation after `fetch('/config/assetMap.json')` is `typeof assetMap !== 'object'`. A cache-poisoned, MITM-swapped, or misconfigured CDN response that returns a valid JSON object with attacker-controlled URLs passes this check and becomes the authoritative source for all flag → URL resolution across the entire app. See S-04 for the injection path. The fix is to import `assetMap.json` at build time (zero-cost, cannot be swapped at runtime) and use runtime fetch only for optional development overrides.

---

### S-04 — `getAssetUrl` returns attacker-controlled URLs that flow directly into DOM injection without sanitization
**File:** `assetLibrary.js` → `assetPreloader.js` → `document.head.appendChild(link)`  
**Detail:** The resolution chain is: `assetMap.json` (fetched at runtime) → `getAssetUrl(flag)` → `assetHandlerFactory.createAssetHandler` → `assetsHandlerNew.AssetHandler` → DOM injection. At no point is the returned URL validated for scheme, host, or type. A `javascript:` scheme, `data:` URI, or arbitrary external host in the map flows through unmodified. All URLs returned from `getAssetUrl` must be validated against an allowlist of permitted schemes (`https:`, `/`) and permitted hosts before they can be used by any consumer.

---

### S-05 — `assetMap.json` is duplicated in both `src/config/` and `public/config/` with no sync mechanism
**Files:** `src/config/assetMap.json`, `public/config/assetMap.json`  
**Detail:** Both files exist with identical content. The app fetches from `public/config/assetMap.json` at runtime; `src/config/assetMap.json` appears to be an authoritative copy but changes to one are not automatically reflected in the other. This creates a drift risk where developers edit the wrong file. There should be a single source of truth — either a build step that copies `src/` → `public/`, or removal of the `src/` copy in favour of importing the `public/` file via Vite's `?url` or `?raw` import.

---

### S-06 — `validateAssetMap` accepts `http://` URLs in production without error
**File:** `assetLibrary.js` lines 1015–1018  
**Detail:** The validator flags `http://` URLs only as a warning. In production environments, serving assets over plain HTTP exposes them to MITM, mixed-content warnings, and browser blocking (in strict HTTPS contexts). HTTP URLs in `production` should be hard errors, not warnings.

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

---

### B-02 — `window.performanceTracker.step()` called unconditionally in `assetPreloader.js`
**File:** `assetPreloader.js` lines 30–36 (and throughout)  
**Detail:** Unlike `assetLibrary.js` which guards with `if (window.performanceTracker)`, `assetPreloader.js` calls `window.performanceTracker.step(...)` directly. In unit tests, SSR, or when the tracker is not yet initialised, this throws `TypeError: Cannot read properties of undefined (reading 'step')`. Add the same null guard throughout.

---

### B-03 — Two separate caching systems store overlapping data with no coordination
**Files:** `cacheHandler.js`, `usePreloadStore.js` (localStorage), module-level Maps in `assetLibrary.js` and `assetPreloader.js`  
**Detail:** The system has four independent caching layers:

| Layer | What | Scope | Cleared by |
|-------|------|-------|-----------|
| `cachedAssetMap` | Full asset map object | Module memory | `clearAssetCaches()` (broken — see L-01) |
| `cacheHandler` TTL entries | Map config + per-flag URLs | Module memory | `clearAllCache()` |
| `loadedAssets` Map | Section metadata objects | Module memory | `clearAssetCaches()` |
| `usePreloadStore.preloadedAssets` | Preloaded URLs | localStorage | `clearPreloadCache()` |

None of these systems know about each other's state. `clearAssetCaches()` does not clear `usePreloadStore`; `clearPreloadCache()` does not clear `cacheHandler`. A unified `resetAssetLibrary()` function should coordinate all layers.

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

---

### B-05 — `assetMap.json` mixes local relative paths and external absolute URLs with no documentation of the model
**File:** `assetMap.json`  
**Detail:** `development` uses paths like `/assets/icons/cart-dev.svg` (Vite dev-server) while `production` uses absolute `https://...` CDN URLs. `staging` has only 2 entries, both overrides. The inheritance model (dev/staging fall back to production) is undocumented in the file. Operators editing the map have no guidance on which environment a flag must exist in to be valid, or that production is the required baseline.

---

### B-06 — `loadedAssets` in-memory Map and `cacheHandler` both store the same section metadata
**File:** `assetLibrary.js` lines 38, 219, 396–402  
**Detail:** After `loadAssetsForSection` completes, the result is written to both `cacheHandler` (`setValueWithExpiration`) and the in-memory `loadedAssets` Map. On the next call, memory is checked first (line 388), then cache (line 395–402). The double-write creates two copies of every section object and forces `getAssetsForSection` to have a two-path read. The in-memory Map should be the canonical fast path; `cacheHandler` should be the persistent fallback. On memory miss → cache hit, re-hydrate memory (already done at line 401) but do not double-write on the initial load.

---

### B-07 — `detectEnvironment` result is cached in `currentEnvironment` but can drift from Vite's runtime `import.meta.env`
**File:** `assetLibrary.js` lines 573–603  
**Detail:** Environment is detected once and stored in the module-level `currentEnvironment` variable. `import.meta.env` values are compile-time constants and cannot change, so this is safe for production builds. However, in development with HMR, if a developer manually calls `setEnvironment('production')` to test, `detectEnvironment()` still returns the cached value. The function should check `currentEnvironment` only when it was **manually** set (i.e., via `setEnvironment`), and always re-evaluate `import.meta.env` otherwise.

---

### B-08 — `src/config/assetMap.json` is imported nowhere; only the `public/` copy is served
**File:** `src/config/assetMap.json`  
**Detail:** The file in `src/config/` is never imported by any JS module (confirmed by grep). The runtime fetch at `assetLibrary.js:667` targets `/config/assetMap.json` which is served from `public/`. The `src/` copy is therefore dead code — it exists only to give IDEs a reference, creating the maintenance hazard described in S-05.

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

---

### M-02 — No `initAssetLibrary()` startup function for eager cache warm-up
**File:** `assetLibrary.js`  
**Detail (user requirement #1):** The asset map is loaded lazily. First-render components calling `getAssetUrl` block on a network fetch. An explicit init function called in `main.js` before `app.mount()` should:
1. Detect environment
2. Fetch and cache the global `assetMap.json`
3. Pre-warm URL cache for all known global flags (no network request — just resolves from the already-loaded map)
4. Optionally pre-warm section map for the initial route's section
5. Log the ready state with flag count and environment

---

### M-03 — No per-section asset map files exist or are loaded
**Files:** `assetLibrary.js`, `public/config/`  
**Detail:** Per M-01, section-level override maps are entirely absent from both the code and the `public/config/` directory. Neither `loadSectionAssetMap` nor any section-specific JSON file exists. This is the core missing feature.

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
