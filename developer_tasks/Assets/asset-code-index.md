# Asset code index

**Scope:** All asset-related code found in `new-vue-app-main/`  
**Reference:** `notes.md`, [folder-structure-audit-assets.md](./folder-structure-audit-assets.md)  
**Generated:** 2026-06-10

Legend: ✅ correct layer per `notes.md` · ⚠️ loose / wrong layer · 🧪 test (stale `utils/assets` imports)

---

## 1. `systems/assets/` — core asset system (14 files)

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

Uses `usePreloadStore.addAsset`, `hasAsset` internally.

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

### `assetsHandlerNew.js` ✅ (rename → `assetHandler.js`)

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

**Not in barrel:** `assetMapSource`, `sectionAssetMapSource`, `assertAllowedPreloadUrl`, `assetHandlerFactory`, `assetsHandlerNew`.

---

## 2. Loose asset code — wrong system folder

### `systems/routing/routeAssetPrefetch.js` ⚠️ → should be `systems/assets/`

| Export | Calls |
|--------|-------|
| `prefetchSectionAssetsForRoute` | `preloadSectionAssets` |
| `createSectionAssetPrefetchIntentHandler` | `prefetchSectionAssetsForRoute` |
| `resetRouteAssetPrefetchCache` | — |

### `systems/routing/resolveRouteAssetPreloads.js` ⚠️ → should be `systems/assets/`

| Export | |
|--------|--|
| `resolveRouteAssetPreloads` | |

### `systems/routing/useRoutePrefetch.js` ⚠️ → should be `composables/`

| Export | Calls |
|--------|-------|
| `createRoutePrefetchIntentHandler` | `prefetchRouteComponent`, `prefetchSectionAssetsForRoute` |
| `useRoutePrefetch` | returns `{ prefetchRoute, prefetchSectionAssets, createRoutePrefetchIntentHandler, createSectionAssetPrefetchIntentHandler }` |

### `systems/interactions/scriptAvailabilityChecker.js` ⚠️ — embeds asset loading

| Export | Asset role |
|--------|------------|
| `isScriptInDOM` | uses `AssetHandler` |
| `isScriptReady` | uses `AssetHandler` |
| `loadScript` | uses `AssetHandler` |
| `waitForScriptAvailability` | uses `AssetHandler` |
| `waitForCognitoScript` | uses `AssetHandler` |
| `getScriptLoadingState` | uses `AssetHandler` |
| `addAssetToHandler` | mutates `AssetHandler` singleton |
| `updateAssetUrlFromAssetMap` | `getAssetUrl` + `AssetHandler` |
| default export | object of above |

Internal (not exported): `getAssetHandler` — singleton `AssetHandler` + `DEFAULT_ASSET_CONFIG`.

### `utils/preload.js` ⚠️ — legacy duplicate

| Export | |
|--------|--|
| `preloadIcons` | raw `Image()` preload |

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
| `loadRouteConfigurationFromFile` | `resolveRouteAssetPreloads`, `validateRouteAssetPreloadFlags`, `sharedAssetPreloads.json` |
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
| `createRoutePrefetchIntentHandler` | re-export from routing |
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

### Missing per `notes.md`

| File | Status |
|------|--------|
| `composables/useAssetPrefetch.js` | ❌ not created |
| `composables/useRoutePrefetch.js` | ❌ lives in `systems/routing/` |

---

## 5. Stores

### `stores/usePreloadStore.js` ✅

| Export / member | Type |
|-----------------|------|
| `normalizeStringSet` | function |
| `usePreloadStore` | Pinia store |

**Getters:** `preloadedAssetCount`, `hasSection`, `hasAsset`, `isSectionInProgress`

**Actions:** `addSection`, `removeSection`, `addAsset`, `removeAsset`, `clearAssets`, `markSectionInProgress`, `unmarkSectionInProgress`, `setManifestLoadFailed`, `clearState`

---

## 6. Config & static assets

### Config JSON ✅

| File | Role |
|------|------|
| `config/assetMap.json` | Global flag → URL map |
| `config/assetMap.auth.json` | Section-scoped auth map |
| `config/assetMap.README.md` | Docs |
| `router/sharedAssetPreloads.json` ⚠️ | Shared preload catalog (wrong folder) |

### `src/assets/` — static files

| File | Role |
|------|------|
| `assets/main.css` | Global CSS |
| `assets/route-transitions.css` | Route transition CSS |
| `assets/styles/rtl-foundation.css` | RTL CSS |
| `assets/data/menuItems.js` ⚠️ | Menu data + `resolveMenuItemsWithAssets` |
| `assets/data/settingConfig.js` ⚠️ | Settings nav data (hardcoded ImgBB URLs) |

**`menuItems.js` exports:**

| Export | Calls |
|--------|-------|
| `menuItems` | const array (asset flags in `image` field) |
| `resolveMenuItemsWithAssets` | `getAssetUrls`, i18n |

---

## 7. Consumers — templates

| File | Imports / calls |
|------|-----------------|
| `templates/auth/AuthHeader.vue` | `getAssetUrl` — `loadAssets()` |
| `templates/auth/AuthLayout.vue` | `getAssetUrlForCss` — `onMounted` |
| `templates/auth/views/AuthLogIn.vue` | `getAssetUrl`, `createAssetHandler`, `createRoutePrefetchIntentHandler`; local `assetsConfig`, `ensureAssetDependencies`, `dispose` |
| `templates/auth/views/AuthSignUp.vue` | same pattern |
| `templates/auth/views/AuthResetPassword.vue` | same pattern |
| `templates/auth/views/AuthLostPassword.vue` | `createAssetHandler`, `ensureAssetDependencies`, `dispose` |
| `templates/auth/views/AuthConfirmEmail.vue` | same |
| `templates/auth/views/AuthSignUpOnboarding.vue` | same |
| `templates/dashboard/shared/DashboardSharedHeader.vue` | `getAssetUrl`, `groupComponentSlotsByPreloadTier`, `resolveSharedComponentAssets`; local `loadHeaderAssets()` |
| `templates/dashboard/shared/DashboardSharedSidebar.vue` | `menuItems`, `resolveMenuItemsWithAssets`, `getAssetUrl`, `resolveSharedComponentAssets`, `createRoutePrefetchIntentHandler`; local `resolveMenuItems()`, `loadSidebarChromeAssets()` |
| `templates/dashboard/creator/CreatorDashboardOverviewPage.vue` | `AssetHandler`, `loadAssetsForSection`; local `loadDashboardMetrics()` |
| `templates/dashboard/demo/SocialLinkingDemoPage.vue` | `getAssetUrl` |
| `templates/dev/demo-audit/AuthComponentDemo.vue` | `getAssetUrl` |

---

## 8. Consumers — components

| File | Imports / calls |
|------|-----------------|
| `components/forms/select/CountryStateSelect.vue` | `preloadJSON('/src/config/countries.json')` |
| `components/ui/cart/Cart.vue` | `preloadIcons` from `utils/preload` |
| `components/media/uploader/parts/UploadThumbnailPreview.vue` | `preloadIcons` from `utils/preload` |
| `components/media/uploader/parts/VideoThumbnailSelector.vue` | local `preloadImages()` (raw `Image()`) |
| `components/media/uploader/MediaUploaderStepPreviewSettings.vue` | prop `preloadImages` (URLs passed down) |
| `components/layout/AppFooter.vue` | `createRoutePrefetchIntentHandler` |
| `components/ui/nav/dashboard/NavDropdown.vue` | `menuItems`, `resolveMenuItemsWithAssets` |
| `components/ui/nav/dashboard/DashProfileSettings.vue` | `settingConfig` from `assets/data` |

---

## 9. Routing barrel re-exports

### `systems/routing/index.js`

Re-exports from `routeAssetPrefetch.js`: `prefetchSectionAssetsForRoute`, `createSectionAssetPrefetchIntentHandler`, `resetRouteAssetPrefetchCache`.

Re-exports from `useRoutePrefetch.js`: `useRoutePrefetch`, `createRoutePrefetchIntentHandler`.

---

## 10. Tests — asset-related (47 files, stale paths)

All listed tests import `src/utils/assets/*` or `src/utils/route/routeAssetPrefetch.js` instead of `src/systems/assets/*`.

### Unit tests by module under test

| Test file | Methods / modules exercised |
|-----------|----------------------------|
| `assetLibrary.test.js` | `assetLibrary` |
| `assetMapper.test.js` | `getAssetUrl`, library |
| `unit/areAssetsLoadedForSection.test.js` | `areAssetsLoadedForSection` |
| `unit/assetLibraryCloneOnRead.test.js` | `getAssetsByCategory`, caches |
| `unit/assetMapBuildValidation.test.js` | `validateRouteAssetPreloadFlags`, `validateSharedComponentAssetMappings` |
| `unit/assetMapConfig.test.js` | `loadAssetMapConfig`, `assetMapSource` |
| `unit/assetMapReadme.test.js` | config docs |
| `unit/assetMapSource.test.js` | `parseAssetMapJsonText`, `getBundledAssetMap` |
| `unit/assetMapSourceImport.test.js` | `getBundledAssetMap` |
| `unit/assetMapUrl.test.js` | `getAssetMapFetchCandidates` |
| `unit/assetPerformanceTrackerGuards.test.js` | `preloadImage`, `preloadScript`, `preloadSectionAssets`, scanner |
| `unit/assetPreloadCache.test.js` | `clearPreloadCache`, `preloadJSON` |
| `unit/assetScanner.test.js` | scanner + `getPreloadedAssetsCount` |
| `unit/assetsIndexExports.test.js` | `index.js` barrel |
| `unit/assertAllowedPreloadUrl.test.js` | `assertAllowedPreloadUrl` |
| `unit/detectEnvironmentOverride.test.js` | `setEnvironment`, `getEnvironment` |
| `unit/getAssetPreloadEntriesForSection.test.js` | section preload rollup |
| `unit/getAssetsByCategoryCache.test.js` | `getAssetsByCategory` |
| `unit/getAssetUrlAllowlist.test.js` | `getAssetUrl` allowlist |
| `unit/getAssetUrlResolutionLogging.test.js` | `getAssetUrl` logging |
| `unit/getAssetUrlsBatch.test.js` | `getAssetUrls` |
| `unit/initAssetLibrary.test.js` | `initAssetLibrary` |
| `unit/loadAssetsForSectionDedup.test.js` | `loadAssetsForSection` |
| `unit/normalizeAssetMapUrl.test.js` | `normalizeAssetMapUrl` |
| `unit/preloadAssetsForSections.test.js` | `preloadAssetsForSections` |
| `unit/preloadConcurrency.test.js` | `runInConcurrencyChunks`, `ASSET_PRELOAD_MAX_CONCURRENCY` |
| `unit/preloadFetchPriority.test.js` | `preloadImage`, `preloadScript`, `resolveFetchPriority` |
| `unit/preloadNormalPriority.test.js` | `preloadAssets`, `preloadImage` |
| `unit/preloadPrefetch.test.js` | `preloadImage`, `preloadScript` |
| `unit/preloadRetry.test.js` | `withPreloadRetry`, `preloadImage` |
| `unit/preloadScript.test.js` | `preloadScript` |
| `unit/preloadSectionAssets.test.js` | `preloadSectionAssets` |
| `unit/preloadUrlGuard.test.js` | `preloadImage`, `preloadFont` |
| `unit/resetAssetLibrary.test.js` | `resetAssetLibrary` |
| `unit/resolveAssetMapForEnvironment.test.js` | env resolution |
| `unit/resolveRouteAssetPreloads.test.js` | `resolveRouteAssetPreloads` |
| `unit/routeAssetPrefetch.test.js` | `prefetchSectionAssetsForRoute` |
| `unit/sectionAssetMapMerge.test.js` | `loadSectionAssetMap` |
| `unit/sectionAssetsMemoryFirst.test.js` | section metadata |
| `unit/setEnvironmentUrlCache.test.js` | env + URL cache |
| `unit/sharedComponentAssetMappings.test.js` | `resolveSharedComponentAssets`, validators |
| `unit/shopAssetPreloadConfig.test.js` | `getAssetPreloadEntriesForSection` |
| `unit/syncAssetMapToPublic.test.js` | build sync |
| `unit/unloadUnusedSections.test.js` | `unloadUnusedSections` |
| `unit/useRoutePrefetch.test.js` | `useRoutePrefetch`, `createRoutePrefetchIntentHandler` |
| `unit/validateAssetMapHostname.test.js` | `validateAssetMap` |
| `unit/validateAssetMapHttpProduction.test.js` | `validateAssetMap` |
| `unit/validateRouteAssetPreloadFlags.test.js` | validators |
| `handler/AssetHandler.validation.test.js` | `AssetHandler` class |
| `handler/AssetHandler.critical.test.js` | `AssetHandler` class |
| `handler/AssetHandler testing code.js` | `AssetHandler` |
| `AssetHandler.browser-test.html` | `AssetHandler` |
| `handler/AssetHandler.browser-test (1).html` | `AssetHandler` |

### Cross-module tests (asset-adjacent)

| Test file | Asset touchpoint |
|-----------|------------------|
| `unit/routeNavigationData.test.js` | mocks `assetPreloader` |
| `unit/sectionPreloader.test.js` | mocks `preloadSectionAssets` |
| `unit/appBuildHash.test.js` | `syncPreloadStoreBuildHash` |

---

## 11. Summary counts

| Layer | Files | Status |
|-------|-------|--------|
| `systems/assets/` | 14 | ✅ core (2 naming/placement issues) |
| Loose in routing | 3 | ⚠️ |
| Loose in interactions | 1 | ⚠️ |
| Loose in utils | 1 | ⚠️ |
| Composables | 1 (+2 missing) | partial |
| Stores | 1 | ✅ |
| Config JSON | 4 | 1 wrong folder |
| `src/assets/` data | 2 | ⚠️ wrong folder / hardcoded URLs |
| Template consumers | 13 | ✅ consumers (some duplicated logic) |
| Component consumers | 8 | 3 use legacy/local preload |
| Tests | 47 | 🧪 stale import paths |
| **Total touchpoints** | **~95** | |

---

*Related: [folder-structure-audit-assets.md](./folder-structure-audit-assets.md) — Issues 1–24*
