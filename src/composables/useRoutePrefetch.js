import { prefetchRouteComponent } from '../systems/routing/routeComponentPreloader.js';
import {
  prefetchSectionAssetsForRoute,
  createSectionAssetPrefetchIntentHandler,
} from '../systems/assets/routeAssetPrefetch.js';

/**
 * Component-only hover/focus handler (no section assets).
 *
 * @param {string|object} targetPath
 * @param {{ userRole?: string }} [options]
 * @returns {() => void}
 */
function createComponentPrefetchOnIntentHandler(targetPath, options = {}) {
  return () => {
    prefetchRouteComponent(targetPath, options);
  };
}

/**
 * Combined hover/focus handler — prefetches route component + section assets (M-08).
 *
 * @param {string|object} targetPath
 * @param {{ userRole?: string }} [options]
 * @returns {() => void}
 */
export function createCombinedRoutePrefetchIntentHandler(targetPath, options = {}) {
  return () => {
    prefetchRouteComponent(targetPath, options);
    prefetchSectionAssetsForRoute(targetPath, options);
  };
}

/** @deprecated Use {@link createCombinedRoutePrefetchIntentHandler} */
export const createRoutePrefetchIntentHandler = createCombinedRoutePrefetchIntentHandler;

/**
 * Composable for intent-based route component + section asset prefetch on nav links.
 */
export function useRoutePrefetch() {
  return {
    prefetchRouteComponent,
    prefetchSectionAssets: prefetchSectionAssetsForRoute,
    prefetchComponentOnIntent: createComponentPrefetchOnIntentHandler,
    prefetchAssetsOnIntent: createSectionAssetPrefetchIntentHandler,
    prefetchRouteOnIntent: createCombinedRoutePrefetchIntentHandler,
    createCombinedRoutePrefetchIntentHandler,
    createRoutePrefetchIntentHandler,
  };
}
