import {
  prefetchSectionAssetsForRoute,
  createSectionAssetPrefetchIntentHandler,
  resetRouteAssetPrefetchCache,
} from '../systems/assets/routeAssetPrefetch.js';

/**
 * Composable for intent-based section asset prefetch (no route component preload).
 */
export function useAssetPrefetch() {
  return {
    prefetchSectionAssets: prefetchSectionAssetsForRoute,
    prefetchAssetsOnIntent: createSectionAssetPrefetchIntentHandler,
    resetAssetPrefetchCache: resetRouteAssetPrefetchCache,
  };
}
