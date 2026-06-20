# Asset code naming audit — Batch 1

**Scope:** `src/systems/assets/` (14 files)  
**Reference:** `Expanded Vue App Naming Convention.txt` (primary), `vue-app-architecture-naming-guidelines.md`  
**Related index:** [asset-code-index.md](./asset-code-index.md)  
**Audit type:** Filename, method, and variable naming only

**Batches:** 1 `systems/assets/` · 2 loose modules · 3 consumers + config · 4 tests

Only items with a naming suggestion include a `suggested:` line.

---

## Filenames

type: filename  
name: assetLibrary.js  
Status: approved

type: filename  
name: assetPreloader.js  
Status: approved

type: filename  
name: assetScanner.js  
Status: approved

type: filename  
name: assetMapSource.js  
Status: approved

type: filename  
name: sectionAssetMapSource.js  
Status: approved

type: filename  
name: getAssetPreloadEntriesForSection.js  
Status: approved

type: filename  
name: resolveSharedComponentAssets.js  
Status: approved

type: filename  
name: validateSharedComponentAssetMappings.js  
Status: approved

type: filename  
name: validateRouteAssetPreloadFlags.js  
Status: approved

type: filename  
name: assetHandlerFactory.js  
Status: approved

type: filename  
name: resetAssetLibrary.js  
Status: approved

type: filename  
name: index.js  
Status: approved

type: filename  
name: assetsHandlerNew.js  
Status: suggested  
suggested: assetHandler.js

type: filename  
name: assertAllowedPreloadUrl.js  
Status: suggested  
suggested: assetPolicy.js (merge; export assertAllowedAssetUrl)

type: filename  
name: assetPolicy.js  
Status: suggested  
suggested: create file per naming docs (missing)

---

## Methods — `assetLibrary.js`

type: method  
name: loadAssetsForSection  
Status: approved

type: method  
name: preloadAssetsForSections  
Status: approved

type: method  
name: getAssetsForSection  
Status: approved

type: method  
name: areAssetsLoadedForSection  
Status: approved

type: method  
name: isSectionAssetMetadataInMemory  
Status: approved

type: method  
name: isSectionAssetMetadataCached  
Status: approved

type: method  
name: getAssetLoadingState  
Status: approved

type: method  
name: clearAssetCaches  
Status: approved

type: method  
name: getAssetStatistics  
Status: approved

type: method  
name: unloadUnusedSections  
Status: approved

type: method  
name: normalizeAssetMapUrl  
Status: approved

type: method  
name: setEnvironment  
Status: approved

type: method  
name: getEnvironment  
Status: approved

type: method  
name: getAssetMapFetchCandidates  
Status: approved

type: method  
name: clearAssetMapConfigCache  
Status: approved

type: method  
name: normalizeGetAssetUrlArgs  
Status: approved

type: method  
name: loadSectionAssetMap  
Status: approved

type: method  
name: getKnownBundledSectionNames  
Status: approved

type: method  
name: isAssetCategoryCached  
Status: approved

type: method  
name: getAssetMapConfigSource  
Status: approved

type: method  
name: loadAssetMapConfig  
Status: approved

type: method  
name: getAssetUrl  
Status: approved

type: method  
name: getAssetUrlSync  
Status: approved

type: method  
name: getAssetUrlForCss  
Status: approved

type: method  
name: getAssetUrlForAttr  
Status: approved

type: method  
name: getAssetUrls  
Status: approved

type: method  
name: getAvailableAssetFlags  
Status: approved

type: method  
name: hasAssetFlagInMap  
Status: approved

type: method  
name: hasAssetFlag  
Status: approved

type: method  
name: getAssetsByCategory  
Status: approved

type: method  
name: getKnownGlobalFlags  
Status: approved

type: method  
name: primeAssetIndex  
Status: approved

type: method  
name: isAssetLibraryInitialized  
Status: approved

type: method  
name: initAssetLibrary  
Status: approved

type: method  
name: preloadAssetUrls  
Status: approved

type: method  
name: validateAssetMap  
Status: approved

---

## Methods — `assetPreloader.js`

type: method  
name: withPreloadRetry  
Status: approved

type: method  
name: runInConcurrencyChunks  
Status: approved

type: method  
name: resolveFetchPriority  
Status: approved

type: method  
name: shouldInjectExecutableScript  
Status: approved

type: method  
name: injectExecutableScript  
Status: approved

type: method  
name: preloadImage  
Status: approved

type: method  
name: preloadFont  
Status: approved

type: method  
name: preloadMedia  
Status: approved

type: method  
name: preloadScript  
Status: approved

type: method  
name: preloadJSON  
Status: approved

type: method  
name: preloadAsset  
Status: approved

type: method  
name: preloadAssets  
Status: approved

type: method  
name: preloadSectionCriticalImages  
Status: approved

type: method  
name: resolveAssetPreloadUrl  
Status: approved

type: method  
name: enrichAssetsWithPreloadUrls  
Status: approved

type: method  
name: resolveAssetPreloadUrls  
Status: approved

type: method  
name: areSectionAssetUrlsFullyPreloaded  
Status: approved

type: method  
name: preloadSectionAssets  
Status: approved

type: method  
name: clearPreloadCache  
Status: approved

type: method  
name: getPreloadedAssetsCount  
Status: approved

type: constant  
name: ASSET_PRELOAD_MAX_CONCURRENCY  
Status: approved

---

## Methods — `assetScanner.js`

type: method  
name: extractAssetsFromComponent  
Status: approved

type: method  
name: extractLiteralBoundAttribute  
Status: approved

type: method  
name: extractBoundAttributeExpression  
Status: approved

type: method  
name: resolveAssetSlotFlagsFromScript  
Status: approved

type: method  
name: scanScriptForAssetFlagReferences  
Status: approved

type: method  
name: scanComponentForAssetReferences  
Status: approved

type: method  
name: scanSectionComponents  
Status: approved

type: method  
name: shouldIgnoreComponent  
Status: approved

type: method  
name: normalizeAssetDefinition  
Status: approved

---

## Methods — `assetMapSource.js`

type: method  
name: shouldAllowRuntimeAssetMapFetch  
Status: approved

type: method  
name: getBundledAssetMap  
Status: approved

type: method  
name: getBundledAssetMapSha256  
Status: approved

type: method  
name: sha256HexFromText  
Status: approved

type: method  
name: verifyFetchedAssetMapText  
Status: approved

type: method  
name: parseAssetMapJsonText  
Status: approved

---

## Methods — `sectionAssetMapSource.js`

type: method  
name: parseSectionNameFromAssetMapPath  
Status: approved

type: method  
name: isValidSectionAssetMapName  
Status: approved

type: method  
name: getBundledSectionAssetMap  
Status: approved

type: method  
name: getSectionAssetMapFetchCandidates  
Status: approved

type: method  
name: fetchSectionAssetMapFromNetwork  
Status: approved

---

## Methods — `getAssetPreloadEntriesForSection.js`

type: method  
name: dedupeAssetPreloadEntries  
Status: approved

type: method  
name: routeBelongsToSection  
Status: approved

type: method  
name: isRouteEnabledForAssetPreload  
Status: approved

type: method  
name: clearAssetPreloadSectionCache  
Status: approved

type: method  
name: getAssetPreloadEntriesForSection  
Status: approved

---

## Methods — `validateRouteAssetPreloadFlags.js`

type: method  
name: collectAssetMapFlags  
Status: approved

type: method  
name: validateRouteAssetPreloadRefs  
Status: approved

type: method  
name: validateRouteAssetPreloadFlags  
Status: approved

type: method  
name: validateSharedCatalogAssetPreloadFlags  
Status: approved

type: method  
name: validateAssetPreloadEntryShape  
Status: suggested  
suggested: validateAssetPreloadEntry

type: constant  
name: ALLOWED_ASSET_PRELOAD_TYPES  
Status: approved

type: constant  
name: ALLOWED_ASSET_PRELOAD_PRIORITIES  
Status: approved

---

## Methods — `validateSharedComponentAssetMappings.js`

type: method  
name: validateSharedComponentAssetMappings  
Status: approved

---

## Methods — `resolveSharedComponentAssets.js`

type: method  
name: getSharedCatalogEntriesByFlag  
Status: approved

type: method  
name: getSharedComponentAssetMapping  
Status: approved

type: method  
name: groupComponentSlotsByPreloadTier  
Status: approved

type: method  
name: resolveSharedComponentAssets  
Status: approved

type: constant  
name: PRELOAD_TIER_ORDER  
Status: approved

---

## Methods — `resetAssetLibrary.js`

type: method  
name: resetAssetLibrary  
Status: approved

type: method  
name: resetAssetSystem  
Status: suggested  
suggested: remove deprecated alias

---

## Methods — `assetHandlerFactory.js`

type: method  
name: createAssetHandler  
Status: approved

---

## Methods — `assetsHandlerNew.js` (class AssetHandler)

type: class  
name: AssetHandler  
Status: approved

type: method  
name: ensureAssetDependencies  
Status: approved

type: method  
name: ensureAssetsForDefinition  
Status: approved

type: method  
name: areAssetDependenciesReady  
Status: approved

type: method  
name: areAssetsReadyForDefinition  
Status: approved

type: method  
name: isAssetAlreadyInDOM  
Status: approved

type: method  
name: preloadAssetsByFlag  
Status: approved

type: method  
name: loadAssetsBeforeMount  
Status: approved

type: method  
name: loadAssetsForEvent  
Status: approved

type: method  
name: loadAsset  
Status: approved

type: method  
name: loadAssetsInParallelWithThrottle  
Status: approved

type: method  
name: getAssetByName  
Status: approved

type: method  
name: getAssetsByFlags  
Status: approved

type: method  
name: getStatistics  
Status: approved

type: method  
name: dispose  
Status: approved

type: method  
name: whenReady  
Status: approved

type: method  
name: isReady  
Status: approved

type: method  
name: markReady  
Status: approved

type: method  
name: warmCacheForAssets  
Status: approved

type: method  
name: registerPreloadHint  
Status: approved

type: method  
name: observeLazyAssets  
Status: approved

type: method  
name: removeAssetFromDOM  
Status: approved

type: method  
name: createElementForAsset  
Status: approved

type: method  
name: insertAssetElement  
Status: approved

type: method  
name: validateConfig  
Status: approved

type: method  
name: loadConfigFromJSON  
Status: approved

---

## Methods — `assertAllowedPreloadUrl.js`

type: method  
name: assertAllowedPreloadUrl  
Status: suggested  
suggested: assertAllowedAssetUrl (move to assetPolicy.js)

---

## Variables — Batch 1 suggestions only

type: variable  
name: err (assetsHandlerNew.js — forEach callback)  
Status: suggested  
suggested: error

type: variable  
name: err (assetsHandlerNew.js — catch callback)  
Status: suggested  
suggested: error

type: variable  
name: res (assetsHandlerNew.js — then callback)  
Status: suggested  
suggested: loadResult

type: variable  
name: ref (validateRouteAssetPreloadFlags.js — route.assetPreloadRef binding)  
Status: suggested  
suggested: assetPreloadRef

type: variable  
name: key (getAssetPreloadEntriesForSection.js — dedupe loop)  
Status: suggested  
suggested: dedupeKey

type: variable  
name: key (sectionAssetMapSource.js — section map lookup)  
Status: suggested  
suggested: sectionKey

type: variable  
name: env (assetLibrary.js — multiple scopes)  
Status: suggested  
suggested: environment

type: variable  
name: el (assetsHandlerNew.js — DOM element locals)  
Status: suggested  
suggested: element (or elementName-specific: scriptElement, linkElement)

type: parameter  
name: options.assetType default branch label `default` (assertAllowedPreloadUrl.js)  
Status: suggested  
suggested: use explicit assetType values only; avoid generic `default` as type name

---

## Batch 1 summary

| Category | Approved | Suggested |
|----------|----------|-----------|
| Filenames | 12 | 3 |
| Methods / constants / class | 117 | 4 |
| Variables / parameters | — | 9 |

**Next:** [Batch 2](./asset-naming-audit-batch-2.md) — loose asset modules ✅

---

*End of Batch 1.*
