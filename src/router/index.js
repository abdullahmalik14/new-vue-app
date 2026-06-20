/**
 * Vue Router entry — config lives in routeConfig.json; orchestration in createAppRouter.js.
 */

export { default } from '../systems/routing/createAppRouter.js';

export {
  prefetchRouteComponent,
  createCombinedRoutePrefetchIntentHandler,
  createRoutePrefetchIntentHandler,
  prefetchSectionAssetsForRoute,
} from '../systems/routing/index.js';
