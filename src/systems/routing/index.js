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
  resolveEffectiveRouteConfig,
  resolveEffectiveAssetPreloadForRoute,
  getRouteChainForPath
} from './routeResolver.js';

// Export route guard functions
export {
  runAllRouteGuards,
  guardPreventNavigationLoop,
  guardCheckRouteEnvironmentAccess,
  guardCheckRouteAdminAccess,
  guardCheckAuthentication,
  guardCheckRouteUserRole,
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
  normalizeTargetPath,
  resolveRouteForPrefetch,
} from './routeComponentPreloader.js';

export {
  prefetchSectionAssetsForRoute,
  createSectionAssetPrefetchIntentHandler,
  resetRouteAssetPrefetchCache,
} from '../assets/routeAssetPrefetch.js';

export {
  useRoutePrefetch,
  createCombinedRoutePrefetchIntentHandler,
  createRoutePrefetchIntentHandler,
} from '../../composables/useRoutePrefetch.js';

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
  doesRouteConfigMatchPath,
  createRedirectFromRouteRecords,
  findDuplicateRoutePathClaims,
} from './routeAliasResolver.js';

export {
  resolveCurrentSectionForNavigation,
  loadCurrentSectionResources,
} from './routeNavigationResourceLoader.js';

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
} from './navigationProgressTracker.js';

