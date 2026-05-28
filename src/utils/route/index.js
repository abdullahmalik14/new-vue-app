/**
 * Route Utilities - Central export file
 * 
 * Exports all route-related utilities:
 * - Route configuration loading and caching
 * - Route resolution and component path determination
 * - Route guards for navigation security
 * - Navigation state management
 */

// Export route configuration functions
export {
  loadRouteConfigurationFromFile,
  getCachedRouteConfiguration,
  resetRouteConfigurationCache,
  getRouteConfiguration
} from './routeConfigLoader.js';

// Export route resolver functions
export {
  resolveRouteFromPath,
  resolveExactRouteFromPath,
  resolveComponentPathForRoute,
  inheritConfigurationFromParentRoute,
  resolveEffectiveAssetPreloadForRoute,
  getRouteChainForPath
} from './routeResolver.js';

// Export route guard functions
export {
  runAllRouteGuards,
  guardPreventNavigationLoop,
  guardCheckRouteEnvironmentAccess,
  guardCheckRouteEnabled,
  guardCheckRouteAdminAccess,
  guardCheckAuthentication,
  guardCheckUserRole,
  guardCheckDependencies,
  clearGuardNavigationHistory,
  markGuardRedirectNavigation,
  consumeGuardRedirectNavigation,
  shouldClearGuardLoopHistoryAfterNavigation
} from './routeGuards.js';

// Export navigation functions
export {
  setCurrentActiveRoute,
  getCurrentActivePath,
  getCurrentActiveRoute,
  getCurrentRouteChain,
  getPreviousActivePath,
  getPreviousActiveRoute,
  getNavigationHistory,
  canNavigateBack,
  clearNavigationHistory,
  getNavigationStatistics,
  isOnPath,
  wasPreviouslyOnPath
} from './routeNavigation.js';

export {
  prefetchRouteComponent,
  createRoutePrefetchIntentHandler,
  normalizeTargetPath,
  resolveRouteForPrefetch,
} from './routeComponentPrefetch.js';

export {
  prefetchSectionAssetsForRoute,
  createSectionAssetPrefetchIntentHandler,
  resetRouteAssetPrefetchCache,
} from './routeAssetPrefetch.js';

export { useRoutePrefetch } from './useRoutePrefetch.js';

export {
  resolveRouteTransition,
  ROUTE_TRANSITION_PRESETS,
} from './routeTransition.js';

export {
  createRouteRenderError,
  shouldClearRouteErrorOnNavigation,
} from './routeErrorBoundary.js';

export {
  normalizeRoutePath,
  buildLocaleOptionalRoutePath,
  buildVueRouterAliases,
  normalizeRedirectFromList,
  normalizeAliasList,
  routeConfigMatchesPath,
  createRedirectFromRouteRecords,
  findDuplicateRoutePathClaims,
} from './routeAliases.js';

export {
  resolveCurrentSectionForNavigation,
  startCurrentSectionResourceLoads,
} from './routeNavigationData.js';

export {
  isAdminUser,
  isRouteAccessibleToAdmin,
} from './routeAdminAccess.js';

export {
  collectComponentPathsFromRoute,
  collectComponentPathsFromRoutes,
  componentPathToRelativeFile,
  validateRouteComponentPathsWithResolver,
} from './routeComponentPathValidator.js';

export {
  startNavigationProgress,
  finishNavigationProgress,
  failNavigationProgress,
  useNavigationProgress,
} from './navigationProgress.js';

