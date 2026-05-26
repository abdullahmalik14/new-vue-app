import { prefetchRouteComponent, createRoutePrefetchIntentHandler } from './routeComponentPrefetch.js';

/**
 * Composable for intent-based route component prefetch on nav links.
 */
export function useRoutePrefetch() {
  return {
    prefetchRoute: prefetchRouteComponent,
    prefetchOnIntent: createRoutePrefetchIntentHandler
  };
}
