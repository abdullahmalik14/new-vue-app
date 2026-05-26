import {
  prefetchRouteComponent,
  createRoutePrefetchIntentHandler as createComponentPrefetchIntentHandler,
} from './routeComponentPrefetch.js';
import {
  prefetchSectionAssetsForRoute,
  createSectionAssetPrefetchIntentHandler,
} from './routeAssetPrefetch.js';

/**
 * Composable for intent-based route component + section asset prefetch on nav links.
 */
export function useRoutePrefetch() {
  return {
    prefetchRoute: prefetchRouteComponent,
    prefetchSectionAssets: prefetchSectionAssetsForRoute,
    prefetchComponentOnIntent: createComponentPrefetchIntentHandler,
    prefetchAssetsOnIntent: createSectionAssetPrefetchIntentHandler,
    prefetchOnIntent(targetPath, options = {}) {
      return () => {
        prefetchRouteComponent(targetPath, options);
        prefetchSectionAssetsForRoute(targetPath, options);
      };
    },
  };
}
