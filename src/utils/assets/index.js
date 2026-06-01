// vueApp-main-new/src/utils/assets/index.js

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
  routeBelongsToSection,
} from './getAssetPreloadEntriesForSection.js';

export {
  collectAssetMapFlags,
  validateRouteAssetPreloadFlags,
  validateAssetPreloadEntryShape,
  validateRouteAssetPreloadRefs,
  validateSharedCatalogAssetPreloadFlags,
  ALLOWED_ASSET_PRELOAD_TYPES,
  ALLOWED_ASSET_PRELOAD_PRIORITIES,
} from './validateRouteAssetPreloadFlags.js';

export {
  getSharedCatalogEntriesByFlag,
  getSharedComponentAssetMapping,
  groupComponentSlotsByPreloadTier,
  resolveSharedComponentAssets,
  PRELOAD_TIER_ORDER,
} from './resolveSharedComponentAssets.js';

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
  getAssetLoadingState,
  clearAssetCaches,
  getAssetStatistics,
  unloadUnusedSections,
  // Flag-to-URL asset mapping
  getAssetUrl,
  getAssetUrls,
  getAvailableAssetFlags,
  hasAssetFlag,
  getAssetsByCategory,
  preloadAssetUrls,
  validateAssetMap,
  normalizeAssetMapUrl,
  loadAssetMapConfig,
  getAssetMapConfigSource,
  clearAssetMapConfigCache,
  getAssetMapFetchCandidates,
  setEnvironment,
  getEnvironment
} from './assetLibrary';

