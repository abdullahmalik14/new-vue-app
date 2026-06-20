// vueApp-main-new/src/systems/assets/index.js

/**
 * @file index.js
 * @description Exports all asset utilities
 * @purpose Central export point for asset module
 */

// Export asset preloader functions
export {
  preloadImage,
  preloadFont,
  preloadMedia,
  preloadScript,
  injectExecutableScript,
  shouldInjectExecutableScript,
  preloadAsset,
  preloadAssets,
  preloadSectionAssets,
  preloadSectionCriticalImages,
  resolveAssetPreloadUrl,
  areSectionAssetUrlsFullyPreloaded,
  clearPreloadCache,
  getPreloadedAssetsCount
} from './assetPreloader';

export {
  getAssetPreloadEntriesForSection,
  clearAssetPreloadSectionCache,
  dedupeAssetPreloadEntries,
  isRouteEnabledForAssetPreload,
  doesRouteBelongToSection,
} from './routeSectionAssetPreloadEntries.js';

export {
  assertAllowedAssetUrl,
  assertAllowedPreloadUrl,
  collectAssetMapFlags,
  validateRouteAssetPreloadFlags,
  validateAssetPreloadEntry,
  validateAssetPreloadEntryShape,
  validateRouteAssetPreloadRefs,
  validateSharedCatalogAssetPreloadFlags,
  ALLOWED_ASSET_PRELOAD_TYPES,
  ALLOWED_ASSET_PRELOAD_PRIORITIES,
} from './assetPolicy.js';

export {
  getSharedCatalogEntriesByFlag,
  getSharedComponentAssetMapping,
  groupComponentSlotsByPreloadTier,
  resolveSharedComponentAssets,
  PRELOAD_TIER_ORDER,
} from './resolveSharedComponentAssets.js';

export {
  prefetchSectionAssetsForRoute,
  createSectionAssetPrefetchIntentHandler,
  resetRouteAssetPrefetchCache,
} from './routeAssetPrefetch.js';

export { resolveRouteAssetPreloads } from './resolveRouteAssetPreloads.js';

export { validateSharedComponentAssetMappings } from './validateSharedComponentAssetMappings.js';

// Export asset scanner functions
export {
  extractAssetsFromComponent,
  scanComponentForAssetReferences,
  scanSectionComponents,
  shouldIgnoreComponent,
  normalizeAssetDefinition
} from './assetScanner';

// Export asset library functions
// Includes both section-based loading and flag-to-URL mapping
export {
  // Section-based asset loading
  loadAssetsForSection,
  preloadAssetsForSections,
  getAssetsForSection,
  areAssetsLoadedForSection,
  isSectionAssetMetadataInMemory,
  isSectionAssetMetadataCached,
  getAssetLoadingState,
  clearAssetCaches,
  getAssetStatistics,
  unloadUnusedSections,
  // Flag-to-URL asset mapping
  getAssetUrl,
  getAssetUrlSync,
  getAssetUrlForCss,
  getAssetUrlForAttr,
  getAssetUrls,
  getAvailableAssetFlags,
  hasAssetFlag,
  hasAssetFlagInMap,
  getAssetsByCategory,
  isAssetCategoryCached,
  preloadAssetUrls,
  initAssetLibrary,
  primeAssetIndex,
  getKnownGlobalFlags,
  isAssetLibraryInitialized,
  validateAssetMap,
  normalizeAssetMapUrl,
  loadAssetMapConfig,
  loadSectionAssetMap,
  getKnownBundledSectionNames,
  normalizeGetAssetUrlArgs,
  getAssetMapConfigSource,
  clearAssetMapConfigCache,
  getAssetMapFetchCandidates,
  setEnvironment,
  getEnvironment
} from './assetLibrary';

export { resetAssetLibrary, resetAssetSystem } from './resetAssetLibrary.js';

