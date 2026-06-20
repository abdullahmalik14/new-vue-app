# Asset code naming audit — Batch 2

**Scope:** Loose asset modules outside `systems/assets/`  
**Reference:** `Expanded Vue App Naming Convention.txt` (primary), `vue-app-architecture-naming-guidelines.md`  
**Related:** [asset-naming-audit-batch-1.md](./asset-naming-audit-batch-1.md) · [asset-code-index.md](./asset-code-index.md)

**Batches:** 1 ✅ · **2 loose modules** · 3 consumers + config · 4 tests

Only items with a naming suggestion include a `suggested:` line.

---

## Filenames

type: filename  
name: routeAssetPrefetch.js  
Status: approved

type: filename  
name: resolveRouteAssetPreloads.js  
Status: approved

type: filename  
name: useRoutePrefetch.js  
Status: suggested  
suggested: move to composables/useRoutePrefetch.js (location; name approved)

type: filename  
name: useAssetUrl.js  
Status: approved

type: filename  
name: usePreloadStore.js  
Status: approved

type: filename  
name: scriptAvailabilityChecker.js  
Status: approved

type: filename  
name: preload.js  
Status: suggested  
suggested: remove; use systems/assets/assetPreloader.js (location + duplicate concern)

type: filename  
name: useAssetPrefetch.js  
Status: suggested  
suggested: create composables/useAssetPrefetch.js per naming docs (missing)

type: filename  
name: sharedAssetPreloads.json  
Status: approved

---

## Methods — `routeAssetPrefetch.js`

type: method  
name: prefetchSectionAssetsForRoute  
Status: approved

type: method  
name: createSectionAssetPrefetchIntentHandler  
Status: approved

type: method  
name: resetRouteAssetPrefetchCache  
Status: approved

type: method  
name: resolveUserRoleForPrefetch (internal)  
Status: approved

---

## Methods — `resolveRouteAssetPreloads.js`

type: method  
name: resolveRouteAssetPreloads  
Status: approved

type: method  
name: resolveAssetPreloadRefKey (internal)  
Status: approved

---

## Methods — `useRoutePrefetch.js`

type: method  
name: useRoutePrefetch  
Status: approved

type: method  
name: createRoutePrefetchIntentHandler  
Status: suggested  
suggested: rename to createCombinedRoutePrefetchIntentHandler (conflicts with component-only handler in routeComponentPrefetch.js)

type: composable-return  
name: prefetchRoute  
Status: approved

type: composable-return  
name: prefetchSectionAssets  
Status: approved

type: composable-return  
name: prefetchComponentOnIntent  
Status: approved

type: composable-return  
name: prefetchAssetsOnIntent  
Status: approved

type: composable-return  
name: prefetchOnIntent  
Status: approved

type: composable-return  
name: createRoutePrefetchIntentHandler  
Status: suggested  
suggested: createCombinedRoutePrefetchIntentHandler

---

## Methods — `routeComponentPrefetch.js` (asset-adjacent routing)

type: method  
name: prefetchRouteComponent  
Status: approved

type: method  
name: createRoutePrefetchIntentHandler  
Status: suggested  
suggested: createRouteComponentPrefetchIntentHandler (component-only; avoid name clash with combined handler)

type: method  
name: normalizeTargetPath  
Status: approved

type: method  
name: resolveRouteForPrefetch  
Status: approved

type: method  
name: resetRoutePrefetchCache  
Status: approved

---

## Methods — `useAssetUrl.js`

type: method  
name: useAssetUrl  
Status: approved

type: method  
name: resolveUrl (internal)  
Status: approved

type: composable-return  
name: url  
Status: approved

type: composable-return  
name: loading  
Status: approved

type: composable-return  
name: error  
Status: approved

---

## Methods — `usePreloadStore.js`

type: store  
name: usePreloadStore  
Status: approved

type: getter  
name: preloadedAssetCount  
Status: approved

type: getter  
name: hasSection  
Status: approved

type: getter  
name: hasAsset  
Status: approved

type: getter  
name: isSectionInProgress  
Status: approved

type: action  
name: addSection  
Status: suggested  
suggested: addPreloadedSection

type: action  
name: removeSection  
Status: suggested  
suggested: removePreloadedSection

type: action  
name: addAsset  
Status: suggested  
suggested: addPreloadedAsset

type: action  
name: removeAsset  
Status: suggested  
suggested: removePreloadedAsset

type: action  
name: clearAssets  
Status: suggested  
suggested: clearPreloadedAssets

type: action  
name: clearState  
Status: suggested  
suggested: clearPreloadState

type: action  
name: markSectionInProgress  
Status: approved

type: action  
name: unmarkSectionInProgress  
Status: approved

type: action  
name: setManifestLoadFailed  
Status: approved

type: method  
name: normalizeStringSet  
Status: approved

---

## Methods — `scriptAvailabilityChecker.js`

type: method  
name: isScriptInDOM  
Status: approved

type: method  
name: isScriptReady  
Status: approved

type: method  
name: loadScript  
Status: approved

type: method  
name: waitForScriptAvailability  
Status: approved

type: method  
name: waitForCognitoScript  
Status: approved

type: method  
name: getScriptLoadingState  
Status: approved

type: method  
name: addAssetToHandler  
Status: approved

type: method  
name: updateAssetUrlFromAssetMap  
Status: approved

type: method  
name: getAssetHandler (internal)  
Status: suggested  
suggested: move to systems/assets/ as getSharedAssetHandler (location; name pattern OK)

type: constant  
name: DEFAULT_ASSET_CONFIG  
Status: approved

---

## Methods — `utils/preload.js`

type: method  
name: preloadIcons  
Status: suggested  
suggested: preloadImages (align with assetPreloader.preloadImage)

---

## Methods — `appBuildHash.js` (preload invalidation)

type: method  
name: syncPreloadStoreBuildHash  
Status: approved

type: method  
name: getAppBuildHash  
Status: approved

---

## Variables — Batch 2 suggestions only

type: variable  
name: ref (resolveRouteAssetPreloads.js — route.assetPreloadRef binding)  
Status: suggested  
suggested: assetPreloadRef

type: variable  
name: rest (resolveRouteAssetPreloads.js — destructured route)  
Status: suggested  
suggested: routeWithoutPreloadRef

type: variable  
name: err (useAssetUrl.js — catch binding)  
Status: suggested  
suggested: error

type: variable  
name: resolved (routeAssetPrefetch.js — resolveRouteForPrefetch result)  
Status: suggested  
suggested: resolvedRoute

type: variable  
name: img (preload.js — Image instance)  
Status: suggested  
suggested: imageElement

---

## Batch 2 summary

| Category | Approved | Suggested |
|----------|----------|-----------|
| Filenames | 6 | 4 |
| Methods / getters / actions / returns | 38 | 12 |
| Variables | — | 5 |

**Critical naming conflict:** `createRoutePrefetchIntentHandler` exists in both `routeComponentPrefetch.js` (component only) and `useRoutePrefetch.js` (component + assets). Rename to disambiguate.

**Next:** Batch 3 — template/component consumers + config (`menuItems.js`, auth views, dashboard chrome, `assetMap.json`, etc.)

---

*End of Batch 2.*
