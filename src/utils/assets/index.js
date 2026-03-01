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
  preloadAsset,
  preloadAssets,
  preloadSectionAssets,
  preloadSectionCriticalImages,
  clearPreloadCache,
  getPreloadedAssetsCount
} from './assetPreloader';

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
  setEnvironment,
  getEnvironment
} from './assetLibrary';

// Export asset injector (DOM-based asset loading)
export { default as AssetInjector } from './assetInjector';

