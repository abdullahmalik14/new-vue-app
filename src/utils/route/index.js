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
  resolveComponentPathForRoute,
  inheritConfigurationFromParentRoute,
  getRouteChainForPath
} from './routeResolver.js';

// Export route guard functions
export {
  runAllRouteGuards,
  guardPreventNavigationLoop,
  guardCheckRouteEnabled,
  guardCheckAuthentication,
  guardCheckUserRole,
  guardCheckDependencies,
  clearNavigationHistory as clearGuardNavigationHistory
} from './routeGuards.js';

// Export navigation functions
export {
  setCurrentActiveRoute,
  getCurrentActivePath,
  getCurrentActiveRoute,
  getPreviousActivePath,
  getPreviousActiveRoute,
  getNavigationHistory,
  canNavigateBack,
  clearNavigationHistory,
  getNavigationStatistics,
  isOnPath,
  wasPreviouslyOnPath
} from './routeNavigation.js';

