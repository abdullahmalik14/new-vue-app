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

---

### L-02 — DOM link deduplication only exists in `preloadImage`, not `preloadFont/preloadMedia/preloadScript`
**File:** `assetPreloader.js` lines 55–68 vs. 155–200, 240–285, 324–367  
**Detail:** `preloadImage` checks for an existing `<link rel="preload">` in the DOM before creating a new one. The font, media, and script variants skip this check entirely. Navigating back to a section therefore appends duplicate `<link>` elements to `<head>` for every non-image asset.

---

### L-03 — Race window between DOM check and `preloadInProgress.set` in `preloadImage`
**File:** `assetPreloader.js` lines 50–116  
**Detail:** The flow is: check store → check `preloadInProgress` → check DOM → create promise → `preloadInProgress.set(src, promise)`. Two concurrent callers can both pass the DOM check before either has written to `preloadInProgress`, resulting in two `<link>` elements being appended and two separate fetch requests for the same asset.

---

### L-04 — `new Promise(async ...)` anti-pattern in `preloadJSON`
**File:** `assetPreloader.js` line 411  
**Detail:** `new Promise(async (resolve, reject) => { ... })` is an anti-pattern. If the async executor throws synchronously before reaching a `reject()` call, the outer promise silently hangs forever. The function should be rewritten as a plain `async` function.

---

### L-05 — `preloadAssets` outer `catch` block is unreachable dead code
**File:** `assetPreloader.js` line 587  
**Detail:** `Promise.allSettled()` never rejects. The outer `try/catch` wrapping the `allSettled` call (lines 566–599) has a `catch` that can never be triggered. Any real error inside individual asset loads is swallowed by `allSettled` itself.

---

### L-06 — Priority sort is ignored because all assets start in parallel
**File:** `assetPreloader.js` lines 567–577  
**Detail:** Assets are sorted by priority (`high → medium → low`) at line 567, then immediately passed to `Promise.allSettled(sortedAssets.map(asset => preloadAsset(asset)))`. Every asset is kicked off simultaneously, so the sort order has no practical effect. High-priority assets receive no scheduling advantage.

---

### L-07 — `setEnvironment` clears `cachedAssetMap` but not URL-level caches
**File:** `assetLibrary.js` line 622  
**Detail:** `setEnvironment()` sets `cachedAssetMap = null` to force a reload on the next flag lookup. However, resolved URL strings cached under `ASSET_URL_CACHE_PREFIX + env + '_' + flag` in `cacheHandler` are not invalidated. After an environment switch, stale URLs from the previous environment continue to be served for 30 minutes.

---

### L-08 — `assetScanner.js` calls `component.setup()` without Vue context
**File:** `assetScanner.js` lines 44–50  
**Detail:** `extractAssetsFromComponent` calls `component.setup()` without providing `props` or `context`. Vue 3 setup functions may call `inject`, `provide`, `ref`, `onMounted`, etc., all of which require an active component instance. Calling setup outside Vue's scheduler will throw or silently corrupt reactive state.

---

### L-09 — `critical` priority level is not handled in the priority sort map
**File:** `assetPreloader.js` lines 568–572  
**Detail:** `preloadSectionCriticalImages` (line 644) filters for `priority === 'critical'`, implying it is a valid value. However, `preloadAssets`'s `priorityMap` only contains `{ high: 3, medium: 2, low: 1 }`. An asset with `priority: "critical"` falls through to the default of `1` — the same as low — and is scheduled last.

---

### L-10 — `assetLibrary.loadAssetMapConfig` fetches from hardcoded `/config/assetMap.json`
**File:** `assetLibrary.js` line 667  
**Detail:** The production fetch URL is hardcoded. In development, `src/config/assetMap.json` is served by Vite at a different path. The function has no dev/prod path branching for the fetch, so this fetch will fail in development (returning an empty map and silently bypassing flag resolution).

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

---

## 2. Performance Issues

### P-01 — `usePreloadStore` uses `Array.includes` for O(n) membership checks
**File:** `usePreloadStore.js` lines 35–49 (`preloadedAssets`; `preloadedSections` is section-bundle state — out of scope)  
**Detail:** `preloadedAssets` is a plain array; `hasAsset` uses `Array.includes` (O(n)). With 50+ icon URLs on dashboard sections, every preload check scans the list. Use a `Set` for O(1) URL lookups.

---

### P-02 — Dynamic `import()` called inside `preloadSectionAssets` and `preloadSectionCriticalImages` on every invocation
**File:** `assetPreloader.js` lines 620 and 707  
**Detail:** `await import('../route/routeConfigLoader')` is called on every invocation of both functions. Although ES module caching means the module is only evaluated once, the dynamic import machinery still executes on each call. The import should be moved to the module's top-level static imports.

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

---

### P-05 — Performance tracker `.step()` called for every trivial getter
**Files:** `assetPreloader.js`, `assetScanner.js`  
**Detail:** `getPreloadedAssetsCount`, `shouldIgnoreComponent`, and similar one-liner functions each generate a tracker step. This produces hundreds of trace entries for a single asset preload pass, drowning out meaningful measurements.

---

### P-06 — Section `assetPreload` rollup re-scans all routes on every call
**Files:** `assetScanner.js`, `assetPreloader.js` (`preloadSectionAssets`, `preloadSectionCriticalImages`), `assetLibrary.js` (`getAssetPreloadConfigForSection`)  
**Detail:** Each call loads full `routeConfig` and filters routes by section to merge `assetPreload[]`. No per-section memoisation. A shared helper (e.g. `getAssetPreloadListForSection(sectionName)`) with cache would avoid repeated O(routes) work when preloading many assets for one section.

---

### P-07 — `preloadScript` uses `rel="modulepreload"` for all scripts, including third-party UMD bundles
**File:** `assetPreloader.js` line 326; `assetMap.json` line 11/59  
**Detail:** `modulepreload` is only valid for ES modules. The Cognito SDK (`amazon-cognito-identity-js`) is a UMD bundle. Browsers that see `rel="modulepreload"` for a non-ESM script either ignore the hint or parse the file incorrectly. These should use `rel="preload" as="script"`.

---

## 3. Security Issues

### S-01 — Production icons hosted on third-party image host (`i.ibb.co`)
**File:** `assetMap.json` — majority of `production` and `development` entries  
**Detail:** Many dashboard icons use `i.ibb.co` (third-party image host). No SLA, replaceable content, and not on your allowlist. Icons should be self-hosted under your CDN/app origin.

---

### S-02 — Third-party script loaded without Subresource Integrity (SRI) hash
**File:** `assetMap.json` key `script.cognito` (production + development)  
**Detail:** `https://cdn.jsdelivr.net/npm/amazon-cognito-identity-js@6.3.15/dist/amazon-cognito-identity.min.js` is loaded without an `integrity` attribute. If the CDN is compromised or the package is re-published under the same version, malicious JavaScript would execute with full page privileges. An SRI hash must be added to any external script `<link>` hint or `<script>` tag. host locally.

---

### S-03 — `preloadScript` injects `<link>` without SRI or origin allowlist validation
**File:** `assetPreloader.js` lines 324–364  
**Detail:** The `src` is taken directly from the route config and injected as `link.href`. There is no validation that the URL belongs to an allowlisted origin, and no `integrity` attribute is ever set. A misconfigured or injected route config entry could cause an attacker-controlled script URL to be preloaded.

---

### S-04 — `assetPreloader` functions inject arbitrary `src` values into the DOM without sanitization
**Files:** `assetPreloader.js` — all preload functions  
**Detail:** URL values flow from route config → `getAssetUrl` → `link.href` → `document.head.appendChild(link)` with no sanitization. A `javascript:` scheme or crafted `data:` URI in the config would be injected into the DOM. At minimum, URLs should be validated against an allowlist of schemes (`https:`, `/`).

---

### S-05 — `validateAssetMap` accepts `http://` URLs without warning
**File:** `assetLibrary.js` lines 1015–1018  
**Detail:** coverts to https if ot localhost.

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

---

### S-07 — `icon.globe` uses a malformed `i.ibb.co.com` URL
**File:** `assetMap.json` line 9 (development) and line 51 (production)  
**Detail:** `"icon.globe": "https://i.ibb.co.com/mF9x2JG0/..."` — the domain `i.ibb.co.com` does not exist and is not the correct `i.ibb.co` hostname. This URL will always 404. In production it could be registered by a third party to serve arbitrary content. The `.com` suffix should be removed.

---

## 4. Best Practice Violations

### B-01 — `window.performanceTracker.step()` called without null guard
**Files:** `assetPreloader.js`, `assetScanner.js`  
**Detail:** Unlike `assetLibrary.js`, these files call `window.performanceTracker.step(...)` unconditionally. In SSR, unit tests, or when the tracker is not initialised, this throws `TypeError: Cannot read properties of undefined`.

---

### B-02 — Identical section-to-routes filter logic duplicated (asset rollup)
**Files:** `assetPreloader.js`, `assetLibrary.js` (`getAssetPreloadConfigForSection`), `assetScanner.js`  
**Detail:** The same `routes.filter(...)` by `section` is copy-pasted to merge `assetPreload[]`. Extract one helper: `getAssetPreloadEntriesForSection(sectionName)`.

---

### B-03 — `preloadSectionCriticalImages` is never called
**File:** `assetPreloader.js` line 608  
**Detail:** Function exists to preload high/critical **images** before paint, but nothing invokes it (router imports it unused). Critical dashboard icons from `assetPreload` are only loaded via post-navigation `preloadSectionAssets`.

---

### B-04 — `assetPreloader.js` uses module-level Maps as implicit singletons
**Files:** `assetPreloader.js` lines 17, 371  
**Detail:** `preloadInProgress` and `jsonDataCache` are module-level singletons. In tests or HMR, stale state can leak. Export reset helpers or tie lifecycle to `clearPreloadCache()`.

---

### B-05 — `assetMap.json` mixes local relative paths (development) with external absolute URLs (production) without documentation
**File:** `assetMap.json`  
**Detail:** Development uses relative paths like `/assets/icons/cart-dev.svg` which depend on Vite dev-server file serving. Production uses absolute CDN URLs. Staging only partially overrides production. This divergence is undocumented, making it unclear which assets are actually served in each environment or whether the inheritance model is intentional.

---

## 5. Missing Features

### M-01 — No deduplication of `assetPreload` entries when merging across routes in the same section
**Files:** `assetPreloader.js`, `assetLibrary.js`, `assetScanner.js`  
**Detail:** All three merge points simply push all `assetPreload` arrays together with `...spread`. If five routes in the same section each declare `dashboard.logo`, it appears five times in the merged list. Only the downstream per-asset `hasAsset` check (which is O(n)) prevents duplicate HTTP requests, but the work of iterating and resolving flags is still repeated.

---

### M-02 — No `fetchpriority` attribute on generated `<link rel="preload">` elements
**File:** `assetPreloader.js`  
**Detail:** The [Fetch Priority API](https://web.dev/fetch-priority/) (`fetchpriority="high|low|auto"`) allows the browser to schedule preloaded images/fonts/scripts correctly. None of the generated `<link>` elements set this attribute, even though `priority` is already in route config.

---

### M-03 — Low-priority assets use `rel="preload"` instead of `rel="prefetch"`
**File:** `assetPreloader.js` — all preload functions  
**Detail:** `rel="preload"` tells the browser the resource is needed for the current navigation and should be fetched at high priority. For assets with `priority: "low"` (background images, media that appears below the fold), `rel="prefetch"` is the correct hint — it fetches during idle time without competing with critical resources.

---

### M-04 — No validation at startup that flags in `routeConfig.json` exist in `assetMap.json`
**Files:** `routeConfig.json`, `assetMap.json`, `assetLibrary.js`  
**Detail:** When a route declares `{ "flag": "dashboard.hamburger", "type": "image" }` but the flag is missing from `assetMap.json`, `getAssetUrl` returns `null`, the preload is silently skipped, and no warning surfaces at build time or application startup. A startup validation step that cross-references all flags in routeConfig against assetMap would catch typos early.

---

### M-05 — No cache-busting mechanism for `usePreloadStore` localStorage after a deploy
**File:** `usePreloadStore.js` lines 62–66  
**Detail:** Preloaded asset URLs are persisted to localStorage indefinitely. After a production deploy where asset filenames change (content hashing), the stored URLs still match old paths. The store has no version key or TTL, so users will never re-preload changed assets without manually clearing storage. A store version tied to the app's build hash should be added, with automatic invalidation on version mismatch.

---

### M-06 — No retry logic for failed asset preloads
**File:** `assetPreloader.js`  
**Detail:** When a `link.onerror` fires, the error is logged, the item is removed from `preloadInProgress`, and execution continues. There is no retry with back-off for transient CDN failures.

---

### M-07 — No concurrency batching for large asset lists
**File:** `assetPreloader.js` (`preloadAssets`)  
**Detail:** All assets for a section start in parallel via `Promise.allSettled` with no max concurrency. Large icon sets (e.g. dashboard) can flood the browser with simultaneous `<link rel="preload">` requests. Batch by priority (high first, then chunks of N) to respect connection limits.

---

### M-08 — No intent-based asset preload (hover / viewport)
**Detail:** Assets preload only after navigation (`preloadSectionAssets` from router `afterEach`). No hover on nav links or viewport-based prefetch for known `assetPreload` targets.

---

### M-09 — `assetScanner.scanComponentForAssetReferences` misses dynamic Vue `:src` bindings
**File:** `assetScanner.js` lines 122–132  
**Detail:** The regex `/<img[^>]+src=["']([^"']+)["'][^>]*>/gi` only matches static `src="..."` attributes. Vue template bindings like `:src="imageUrl"` or `v-bind:src="..."` are not matched. The scanner is therefore blind to dynamically-bound assets.

---

### M-10 — `loadAssetMapConfig` path is not configurable via environment variable
**File:** `assetLibrary.js` line 667  
**Detail:** The asset map URL is hardcoded to `/config/assetMap.json`. There is no `import.meta.env.VITE_ASSET_MAP_URL` override. This makes it impossible to serve environment-specific asset maps from different paths (e.g., `/config/assetMap.staging.json`) without modifying source code.

---

## 6. Config & `routeConfig` (asset preload only)

Issues tied to `assetPreload[]` definitions and how they are merged — not section JS/CSS bundle preloading.

### C-01 — Disabled routes still contribute `assetPreload` to section merges
**Files:** `assetPreloader.js`, `assetLibrary.js`, `assetScanner.js`, `routeConfig.json`  
**Detail:** Routes with `enabled: false` are skipped for Vue Router registration but still appear in `getRouteConfiguration()`. Asset collectors never filter `enabled`, so disabled routes can still add icons/scripts to a section’s merged preload list.

---

### C-02 — `inheritConfigFromParent` does not merge parent `assetPreload`
**Files:** `routeResolver.js`, `assetPreloader.js`  
**Detail:** `inheritConfigurationFromParentRoute()` is never applied before aggregation. Child routes do not inherit parent `assetPreload` entries; assets must be duplicated on every child route.

---

### C-03 — `priority: "normal"` in config is not understood by preloader
**File:** `routeConfig.json` (`/dashboard`, `/shop`)  
**Detail:** `preloadAssets()` only maps `high`, `medium`, `low` (and `critical` in a separate helper). `"normal"` behaves as low priority.

---

### C-04 — `/shop` duplicates dashboard icon flags in the wrong section bucket
**File:** `routeConfig.json`  
**Detail:** `/shop` repeats `dashboard.*` flags under `section: "shop"`, not `dashboard-global`. Same icons are preloaded separately per section; config drift risk.

---

### C-05 — `/log-in` puts Cognito script in `assetPreload`
**File:** `routeConfig.json`  
**Detail:** Raw jsDelivr URL with `type: "script"` is preloaded via auth section rollup without SRI (see S-02, S-03).

---

### C-06 — Dashboard components preload assets outside config
**Files:** `DashboardSidebar.vue`, `HeaderResponsive.vue`  
**Detail:** Hardcoded `preloadAsset({ flag, ... })` lists duplicate `/dashboard` `assetPreload` and bypass centralized rollup.

---

### C-07 — Router triggers `preloadSectionAssets` on every navigation without URL short-circuit
**File:** `router/index.js` line 706  
**Detail:** No check that all resolved URLs for the section are already in `usePreloadStore.preloadedAssets` before re-walking routes and re-resolving flags.

---

### C-08 — `assetPreload` entries with extra fields are ignored
**File:** `routeConfig.json` `/dashboard/overview`  
**Detail:** `location`, `defer`, `async`, `flags` are not implemented in `preloadAsset()`.

---

### C-09 — No build-time validation of `assetPreload` entries
**Files:** `jsonConfigValidator.js`, `routeConfig.json`, `assetMap.json`  
**Detail:** Validator does not check `assetPreload` shape, flag existence, or allowed `priority` values (see M-04).

---

*End of audit — asset preload only. Section/bundle preloading (`sectionPreloader`, `preLoadSections`, `section-manifest.json`) and general router/guard topics are documented in `src/router/AUDIT.md` and `src/router/ADDITIONAL_ISSUES.md`.*
