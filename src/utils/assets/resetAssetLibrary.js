/**
 * Unified reset for all asset-library cache layers (B-03 / M-06).
 */

import { log } from '../common/logHandler.js';
import { getCacheStatistics } from '../common/cacheHandler.js';
import { usePreloadStore } from '../../stores/usePreloadStore.js';
import { clearAssetCaches, getAssetStatistics } from './assetLibrary.js';
import { clearPreloadCache, getPreloadedAssetsCount } from './assetPreloader.js';
import { clearAssetPreloadSectionCache } from './getAssetPreloadEntriesForSection.js';

/**
 * @typedef {object} ResetAssetLibraryOptions
 * @property {boolean} [clearSectionRollup=true] - Clear memoized route `assetPreload` rollups per section
 */

/**
 * Clear all coordinated asset caches: map/URL TTL, section metadata, preload store URLs, in-flight preloads.
 * Does **not** clear `usePreloadStore.preloadedSections` or `buildHash` (section bundle preload SSOT).
 *
 * @param {ResetAssetLibraryOptions} [options]
 * @returns {{ before: object, after: object, sectionRollupCacheCleared: boolean }}
 */
export function resetAssetLibrary(options = {}) {
  const { clearSectionRollup = true } = options;

  const preloadStore = usePreloadStore();

  const before = {
    loadedAssets: getAssetStatistics().loadedCount,
    cacheHandlerEntries: getCacheStatistics().totalEntries,
    preloadedUrls: getPreloadedAssetsCount(),
    preloadedSections: preloadStore.preloadedSections.length,
  };

  log('resetAssetLibrary.js', 'resetAssetLibrary', 'start', 'Resetting all asset library caches', {
    before,
    clearSectionRollup,
  });

  clearAssetCaches();
  clearPreloadCache();

  let sectionRollupCacheCleared = false;

  if (clearSectionRollup) {
    clearAssetPreloadSectionCache();
    sectionRollupCacheCleared = true;
  }

  const after = {
    loadedAssets: getAssetStatistics().loadedCount,
    cacheHandlerEntries: getCacheStatistics().totalEntries,
    preloadedUrls: getPreloadedAssetsCount(),
    preloadedSections: preloadStore.preloadedSections.length,
  };

  const summary = {
    before,
    after,
    sectionRollupCacheCleared,
  };

  log('resetAssetLibrary.js', 'resetAssetLibrary', 'success', 'Asset library caches reset', summary);

  return summary;
}

/** @deprecated Alias for {@link resetAssetLibrary} (M-06 naming). */
export const resetAssetSystem = resetAssetLibrary;
