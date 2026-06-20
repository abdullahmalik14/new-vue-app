# Asset code index

**Scope:** All asset-related code found in `new-vue-app-main/`  
**Reference:** `notes.md`, [folder-structure-audit-assets.md](./folder-structure-audit-assets.md)  
**Generated:** 2026-06-10

**Generated:** 2026-06-10 · **Synced:** 2026-06-20 (Phases 0–7)  
**Changelog:** [assets-cleanup-changelog.md](./assets-cleanup-changelog.md)

Legend: ✅ correct layer · ⚠️ open audit item · 🧪 test note

---

## 1. `systems/assets/` — core asset system

### New / renamed modules (2026-06-20)

| File | Role |
|------|------|
| `assetPolicy.js` ✅ | URL policy + validation re-exports |
| `assetHandler.js` ✅ | `AssetHandler` class (was `assetsHandlerNew.js`) |
| `routeAssetPrefetch.js` ✅ | Section asset intent prefetch |
| `resolveRouteAssetPreloads.js` ✅ | Route `assetPreloadRef` expansion |
| `routeSectionAssetPreloadEntries.js` ✅ | Section preload rollup (replaces standalone `getAssetPreloadEntriesForSection.js` path in older docs) |
| `authAssetConfig.js` ✅ | Shared auth/onboarding handler config |

### `assertAllowedPreloadUrl.js` ✅

Deprecated shim — import from `assetPolicy.js` (`assertAllowedAssetUrl`).

### `assetLibrary.js` ✅

| Export | Type |
|--------|------|
| `loadAssetsForSection` | function |
| `preloadAssetsForSections` | function |
| `getAssetsForSection` | function |
| `areAssetsLoadedForSection` | function |
| `isSectionAssetMetadataInMemory` | function |
| `isSectionAssetMetadataCached` | function |
| `getAssetLoadingState` | function |
| `clearAssetCaches` | function |
| `getAssetStatistics` | function |
| `unloadUnusedSections` | function |
| `normalizeAssetMapUrl` | function |
| `setEnvironment` | function |
| `getEnvironment` | function |
| `getAssetMapFetchCandidates` | function |
| `clearAssetMapConfigCache` | function |
| `normalizeGetAssetUrlArgs` | function |
| `loadSectionAssetMap` | function |
| `getKnownBundledSectionNames` | function |
| `isAssetCategoryCached` | function |
| `getAssetMapConfigSource` | function |
| `loadAssetMapConfig` | function |
| `getAssetUrl` | function |
| `getAssetUrlSync` | function |
| `getAssetUrlForCss` | function |
| `getAssetUrlForAttr` | function |
| `getAssetUrls` | function |
| `getAvailableAssetFlags` | function |
| `hasAssetFlagInMap` | function |
| `hasAssetFlag` | function |
| `getAssetsByCategory` | function |
| `getKnownGlobalFlags` | function |
| `primeAssetIndex` | function |
| `isAssetLibraryInitialized` | function |
| `initAssetLibrary` | function |
| `preloadAssetUrls` | function |
| `validateAssetMap` | function |

### `assetPreloader.js` ✅

| Export | Type |
|--------|------|
| `ASSET_PRELOAD_MAX_CONCURRENCY` | const |
| `withPreloadRetry` | function |
| `runInConcurrencyChunks` | function |
| `resolveFetchPriority` | function |
| `shouldInjectExecutableScript` | function |
| `injectExecutableScript` | function |
| `preloadImage` | function |
| `preloadFont` | function |
| `preloadMedia` | function |
| `preloadScript` | function |
| `preloadJSON` | function |
| `preloadAsset` | function |
| `preloadAssets` | function |
| `preloadSectionCriticalImages` | function |
| `resolveAssetPreloadUrl` | function |
| `enrichAssetsWithPreloadUrls` | function |
| `resolveAssetPreloadUrls` | function |
| `areSectionAssetUrlsFullyPreloaded` | function |
| `preloadSectionAssets` | function |
| `clearPreloadCache` | function |
| `getPreloadedAssetsCount` | function |

Uses `usePreloadStore.addPreloadedAsset`, `hasAsset` internally.

### `assetScanner.js` ✅

| Export | Type |
|--------|------|
| `extractAssetsFromComponent` | function |
| `extractLiteralBoundAttribute` | function |
| `extractBoundAttributeExpression` | function |
| `resolveAssetSlotFlagsFromScript` | function |
| `scanScriptForAssetFlagReferences` | function |
| `scanComponentForAssetReferences` | function |
| `scanSectionComponents` | function |
| `shouldIgnoreComponent` | function |
| `normalizeAssetDefinition` | function |

### `assetMapSource.js` ✅

| Export | Type |
|--------|------|
| `shouldAllowRuntimeAssetMapFetch` | function |
| `getBundledAssetMap` | function |
| `getBundledAssetMapSha256` | function |
| `sha256HexFromText` | function |
| `verifyFetchedAssetMapText` | function |
| `parseAssetMapJsonText` | function |

### `sectionAssetMapSource.js` ✅

| Export | Type |
|--------|------|
| `parseSectionNameFromAssetMapPath` | function |
| `isValidSectionAssetMapName` | function |
| `getBundledSectionAssetMap` | function |
| `getKnownBundledSectionNames` | function |
| `getSectionAssetMapFetchCandidates` | function |
| `fetchSectionAssetMapFromNetwork` | function |

### `assertAllowedPreloadUrl.js` ✅ (should merge → `assetPolicy.js`)

| Export | Type |
|--------|------|
| `assertAllowedPreloadUrl` | function |

### `getAssetPreloadEntriesForSection.js` ✅

| Export | Type |
|--------|------|
| `dedupeAssetPreloadEntries` | function |
| `routeBelongsToSection` | function |
| `isRouteEnabledForAssetPreload` | function |
| `clearAssetPreloadSectionCache` | function |
| `getAssetPreloadEntriesForSection` | function |

### `validateRouteAssetPreloadFlags.js` ✅

| Export | Type |
|--------|------|
| `ALLOWED_ASSET_PRELOAD_TYPES` | const |
| `ALLOWED_ASSET_PRELOAD_PRIORITIES` | const |
| `collectAssetMapFlags` | function |
| `validateAssetPreloadEntryShape` | function |
| `validateRouteAssetPreloadRefs` | function |
| `validateRouteAssetPreloadFlags` | function |
| `validateSharedCatalogAssetPreloadFlags` | function |

### `validateSharedComponentAssetMappings.js` ✅

| Export | Type |
|--------|------|
| `validateSharedComponentAssetMappings` | function |

### `resolveSharedComponentAssets.js` ✅

| Export | Type |
|--------|------|
| `getSharedCatalogEntriesByFlag` | function |
| `getSharedComponentAssetMapping` | function |
| `groupComponentSlotsByPreloadTier` | function |
| `resolveSharedComponentAssets` | function |
| `PRELOAD_TIER_ORDER` | const |

### `resetAssetLibrary.js` ✅

| Export | Type |
|--------|------|
| `resetAssetLibrary` | function |
| `resetAssetSystem` | alias |

### `assetHandlerFactory.js` ✅

| Export | Type |
|--------|------|
| `createAssetHandler` | function |

### `assetsHandlerNew.js` — **removed** (renamed → `assetHandler.js`)

**Default export:** `AssetHandler` class

| Method | |
|--------|--|
| `constructor` | |
| `loadConfigFromJSON` | |
| `validateConfig` | |
| `setGlobalVersion` | |
| `markReady` / `isReady` / `whenReady` | |
| `isAssetAlreadyInDOM` | |
| `loadAssetsForEvent` | |
| `preloadAssetsByFlag` | |
| `loadAssetsBeforeMount` | |
| `hasPendingMountBlockers` / `getPendingMountBlockers` | |
| `loadAssetsImmediatelyForSelector` | |
| `observeLazyAssets` | |
| `dispatchAssetLoadEvent` | |
| `getAssetByName` | |
| `areAssetDependenciesReady` | |
| `ensureAssetDependencies` | |
| `ensureAssetsForDefinition` | |
| `areAssetsReadyForDefinition` | |
| `getAssetsByFlags` | |
| `loadAsset` / `loadAssetsInParallelWithThrottle` | |
| `removeAssetFromDOM` | |
| `createElementForAsset` / `insertAssetElement` | |
| `registerPreloadHint` / `warmCacheForAssets` | |
| `dispose` | |
| `getStatistics` | |

### `index.js` ✅ — barrel re-exports

Re-exports from: `assetPreloader`, `getAssetPreloadEntriesForSection`, `validateRouteAssetPreloadFlags`, `resolveSharedComponentAssets`, `validateSharedComponentAssetMappings`, `assetScanner`, `assetLibrary`, `resetAssetLibrary`.

Re-exports from: `assetPreloader`, `routeSectionAssetPreloadEntries`, `assetPolicy`, `resolveSharedComponentAssets`, `routeAssetPrefetch`, `resolveRouteAssetPreloads`, `validateSharedComponentAssetMappings`, `assetScanner`, `assetLibrary`, `resetAssetLibrary`.

**Direct import only (not in barrel):** `assetMapSource`, `sectionAssetMapSource`, `assetHandlerFactory`, `assetHandler`, `authAssetConfig`, `assertAllowedPreloadUrl` shim.

---

## 2. Loose asset code — remaining open items

### `systems/interactions/scriptAvailabilityChecker.js` ⚠️

Still embeds `AssetHandler` singleton and Cognito default config — optional extraction to `systems/assets/` (post-P3).

### `utils/preload.js` — **removed** (Phase 4)

Use `preloadImage` from `assetPreloader.js`.

### Moved to correct layer ✅

| Was | Now |
|-----|-----|
| `systems/routing/routeAssetPrefetch.js` | `systems/assets/routeAssetPrefetch.js` |
| `systems/routing/resolveRouteAssetPreloads.js` | `systems/assets/resolveRouteAssetPreloads.js` |
| `systems/routing/useRoutePrefetch.js` | `composables/useRoutePrefetch.js` |
| `router/sharedAssetPreloads.json` | `config/sharedAssetPreloads.json` |
| `assets/data/settingConfig.js` | `config/settingConfig.js` |

---

## 3. Orchestrators — call assets system (correct pattern)

### `systems/sections/sectionPreloader.js` ✅

| Export | Asset calls |
|--------|-------------|
| `preloadSection` | `preloadSectionAssets`, `usePreloadStore` |
| `resetSectionPreloadState` | — |
| `isSectionPreloaded` | `usePreloadStore` |
| `preloadSections` | `preloadSection` |

### `systems/routing/routeNavigationData.js` ✅

Calls `preloadSectionAssets` on navigation (line ~95).

### `systems/routing/routeConfigLoader.js` ✅

| Export | Asset calls |
|--------|-------------|
| `loadRouteConfigurationFromFile` | `resolveRouteAssetPreloads`, `validateRouteAssetPreloadFlags` via `assetPolicy`, `sharedAssetPreloads.json` |
| `getCachedRouteConfiguration` | — |
| `resetRouteConfigurationCache` | — |
| `getRouteConfiguration` | — |

### `systems/build/jsonConfigValidator.js` ✅

Uses: `validateRouteAssetPreloadRefs`, `validateRouteAssetPreloadFlags`, `validateSharedCatalogAssetPreloadFlags`, `validateSharedComponentAssetMappings`, `resolveRouteAssetPreloads`, `assetMap.json`, `sharedAssetPreloads.json`.

### `systems/build/appBuildHash.js` ✅

| Export | Asset role |
|--------|------------|
| `syncPreloadStoreBuildHash` | invalidates `usePreloadStore` on build change |

### `router/index.js` ✅

| Call | Asset API |
|------|-----------|
| `preloadSectionCriticalImages` | `assetPreloader` |
| `preloadSection` | sections (which calls assets) |
| `createCombinedRoutePrefetchIntentHandler` | re-export from composables (alias: `createRoutePrefetchIntentHandler`) |
| `usePreloadStore` | preload state |

### `app/main.js` ✅

| Call | Asset API |
|------|-----------|
| `initAssetLibrary` | bootstrap |
| `validateAssetMap` | bootstrap |

---

## 4. Composables

### `composables/useAssetUrl.js` ✅

| Export | Calls |
|--------|-------|
| `useAssetUrl(flag, sectionName)` | `getAssetUrl` — returns `{ url, loading, error }` |

### `composables/useRoutePrefetch.js` ✅

| Export | Notes |
|--------|-------|
| `createCombinedRoutePrefetchIntentHandler` | component + section assets |
| `createRoutePrefetchIntentHandler` | deprecated alias |
| `useRoutePrefetch` | composable API |

### `composables/useAssetPrefetch.js` ✅

| Export | Notes |
|--------|-------|
| `useAssetPrefetch` | section asset prefetch only |

---

## 5. Stores

### `stores/usePreloadStore.js` ✅

| Export / member | Type |
|-----------------|------|
| `normalizeStringSet` | function |
| `usePreloadStore` | Pinia store |

**Getters:** `preloadedAssetCount`, `hasSection`, `hasAsset`, `isSectionInProgress`

**Actions:** `addSection`, `removeSection`, `addPreloadedAsset`, `addAsset` (alias), `removeAsset`, `clearAssets`, `markSectionInProgress`, `unmarkSectionInProgress`, `setManifestLoadFailed`, `clearPreloadState`, `clearState` (alias)

---

## 6. Config & static assets

### Config JSON ✅

| File | Role |
|------|------|
| `config/assetMap.json` | Global flag → URL map |
| `config/assetMap.auth.json` | Section-scoped auth map |
| `config/assetMap.README.md` | Docs |
| `config/sharedAssetPreloads.json` ✅ | Shared preload catalog |
| `config/settingConfig.js` ✅ | Settings nav + `resolveSettingConfigWithAssets` |
| `config/dashboardSidebarMenuItems.js` ✅ | Sidebar menu flags + resolver |

### `src/assets/` — static files only

| File | Role |
|------|------|
| `assets/main.css` | Global CSS |
| `assets/route-transitions.css` | Route transition CSS |
| `assets/styles/rtl-foundation.css` | RTL CSS |

~~`assets/data/menuItems.js`~~ → `config/dashboardSidebarMenuItems.js`  
~~`assets/data/settingConfig.js`~~ → `config/settingConfig.js`

---

## 7. Consumers — templates

| File | Imports / calls |
|------|-----------------|
| `templates/auth/AuthHeader.vue` | `getAssetUrl` — `loadAssets()` |
| `templates/auth/AuthLayout.vue` | `getAssetUrlForCss` — `onMounted` |
| `dev/templates/auth/views/*.vue` | `createAssetHandler`, `getAuthAssetConfig`, `getAuthAssetNames` |
| `dev/templates/dashboard/creator/CreatorDashboardOverviewPage.vue` | `createAssetHandler`, `loadAssetsForSection` |
| `dev/templates/dashboard/shared/DashboardSharedSidebar.vue` | `createCombinedRoutePrefetchIntentHandler`, menu resolvers |
| `templates/dashboard/demo/SocialLinkingDemoPage.vue` | `getAssetUrl` |
| `templates/dev/demo-audit/AuthComponentDemo.vue` | `getAssetUrl` |

---

## 8. Consumers — components

| File | Imports / calls |
|------|-----------------|
| `components/forms/select/CountryStateSelect.vue` | `preloadJSON('/src/config/countries.json')` |
| `components/ui/cart/Cart.vue` | `preloadImage` from `assetPreloader` |
| `components/media/uploader/parts/UploadThumbnailPreview.vue` | `preloadImage` |
| `components/media/uploader/parts/VideoThumbnailSelector.vue` | local `preloadImages()` (raw `Image()`) |
| `components/media/uploader/MediaUploaderStepPreviewSettings.vue` | prop `preloadImages` (URLs passed down) |
| `components/layout/AppFooter.vue` | `createCombinedRoutePrefetchIntentHandler` |
| `components/ui/nav/dashboard/NavDropdown.vue` | `dashboardSidebarMenuItems`, resolver |
| `components/ui/nav/dashboard/DashProfileSettings.vue` | `resolveSettingConfigWithAssets` |

---

## 9. Routing barrel re-exports

### `systems/routing/index.js`

Re-exports from `../assets/routeAssetPrefetch.js` and `../../composables/useRoutePrefetch.js` (`createCombinedRoutePrefetchIntentHandler` + deprecated alias).

---

## 10. Tests — asset-related

**Import path:** `src/systems/assets/*` (Phase 0 — no `utils/assets` in tests).

Representative suites: `tests/handler/`, `tests/unit/assetMap*.test.js`, `tests/unit/useRoutePrefetch.test.js`, `tests/unit/usePreloadStore.test.js`, `tests/routeTest/routerExports.test.js`.

Full phase test commands: [assets-cleanup-changelog.md](./assets-cleanup-changelog.md).

---

## 11. Summary counts

| Layer | Status |
|-------|--------|
| `systems/assets/` | ✅ ~20 modules |
| Composables | ✅ `useAssetUrl`, `useRoutePrefetch`, `useAssetPrefetch` |
| Config | ✅ `assetMap`, `sharedAssetPreloads`, `settingConfig`, sidebar menu |
| Tests | ✅ import `systems/assets` |
| Open | ⚠️ `scriptAvailabilityChecker` handler extraction (optional) |

**Changelog:** [assets-cleanup-changelog.md](./assets-cleanup-changelog.md)

---

*Related: [folder-structure-audit-assets.md](./folder-structure-audit-assets.md) — Issues 1–24*
