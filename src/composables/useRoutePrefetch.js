import {
  prefetchRouteComponent,
  createRoutePrefetchIntentHandler as createComponentPrefetchIntentHandler,
} from '../systems/routing/routeComponentPrefetch.js';
import {
  prefetchSectionAssetsForRoute,
  createSectionAssetPrefetchIntentHandler,
} from '../systems/assets/routeAssetPrefetch.js';

/**
 * Combined hover/focus handler — prefetches route component + section assets (M-08).
 *
 * @param {string|object} targetPath
 * @param {{ userRole?: string }} [options]
 * @returns {() => void}
 */
export function createRoutePrefetchIntentHandler(targetPath, options = {}) {
  return () => {
    prefetchRouteComponent(targetPath, options);
    prefetchSectionAssetsForRoute(targetPath, options);
  };
}

/**
 * Composable for intent-based route component + section asset prefetch on nav links.
 */
export function useRoutePrefetch() {
  return {
    prefetchRoute: prefetchRouteComponent,
    prefetchSectionAssets: prefetchSectionAssetsForRoute,
    prefetchComponentOnIntent: createComponentPrefetchIntentHandler,
    prefetchAssetsOnIntent: createSectionAssetPrefetchIntentHandler,
    prefetchOnIntent: createRoutePrefetchIntentHandler,
    createRoutePrefetchIntentHandler,
  };
}
