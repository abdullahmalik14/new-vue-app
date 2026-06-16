/**
 * RouteNavigation - Navigation state and history management
 * 
 * Tracks navigation events and provides access to current/previous routes.
 * All operations tracked with performance tracker.
 */

import { log } from '../../infrastructure/logging/logHandler.js';
import { trackStep } from '../../infrastructure/logging/performanceTrackerAccess.js';
import { deepClone } from '../../utils/common/objectSafety.js';
import { getRouteChainForPath } from './routeResolver.js';

// Navigation state
let currentActiveRoute = null;
let previousActiveRoute = null;
let currentRouteChain = [];
const fullNavigationHistory = [];

// Maximum history entries to keep in memory
const MAX_HISTORY_ENTRIES = 100;

/**
 * Store an immutable snapshot of route config (meta.routeConfig is mutable in-place).
 *
 * @param {object|null|undefined} route
 * @returns {object|null}
 */
function createRouteConfigSnapshot(route) {
  if (!route) {
    return null;
  }

  return deepClone(route);
}

/**
 * Update current active route
 * Called when navigation completes successfully
 * 
 * @param {object} route - Route object that is now active
 * @returns {void}
 */
export function setCurrentActiveRoute(route) {
  log('routeNavigation.js', 'setCurrentActiveRoute', 'start', 'Setting active route', {
    slug: route?.slug
  });

  trackStep({
    step: 'updateActiveRoute',
    file: 'routeNavigation.js',
    method: 'setCurrentActiveRoute',
    flag: 'navigation',
    purpose: `Set active route: ${route?.slug}`
  });

  // Move current to previous
  if (currentActiveRoute) {
    previousActiveRoute = currentActiveRoute;
  }

  const routeSnapshot = createRouteConfigSnapshot(route);

  // Set new current (snapshot — not shared with meta.routeConfig reference)
  currentActiveRoute = routeSnapshot;

  // Parent chain for breadcrumbs / path introspection (A7)
  currentRouteChain = route?.slug
    ? getRouteChainForPath(route.slug).map(createRouteConfigSnapshot).filter(Boolean)
    : [];

  // Add to history
  fullNavigationHistory.push({
    route: routeSnapshot,
    timestamp: Date.now(),
    path: routeSnapshot?.slug
  });

  // Trim history if too large
  if (fullNavigationHistory.length > MAX_HISTORY_ENTRIES) {
    fullNavigationHistory.shift();
  }

  log('routeNavigation.js', 'setCurrentActiveRoute', 'success', 'Active route updated', {
    currentPath: route?.slug,
    previousPath: previousActiveRoute?.slug,
    historySize: fullNavigationHistory.length,
    routeChainLength: currentRouteChain.length
  });
}

/**
 * Get current active route path
 * 
 * @returns {string|null} - Current route path or null
 */
export function getCurrentActivePath() {
  const currentPath = currentActiveRoute?.slug || null;
  log('routeNavigation.js', 'getCurrentActivePath', 'get', 'Getting current path', { currentPath });
  log('routeNavigation.js', 'getCurrentActivePath', 'return', 'Returning current active path', { currentPath });
  return currentPath;
}

/**
 * Get current active route object
 * 
 * @returns {object|null} - Current route object or null
 */
export function getCurrentActiveRoute() {
  log('routeNavigation.js', 'getCurrentActiveRoute', 'get', 'Getting current route', {
    hasRoute: !!currentActiveRoute,
    slug: currentActiveRoute?.slug
  });
  log('routeNavigation.js', 'getCurrentActiveRoute', 'return', 'Returning current active route', { slug: currentActiveRoute?.slug });
  return currentActiveRoute;
}

/**
 * Get parent chain for the current active route (root → current).
 *
 * @returns {Array<object>} - Snapshot route objects from root to current
 */
export function getCurrentRouteChain() {
  log('routeNavigation.js', 'getCurrentRouteChain', 'get', 'Getting current route chain', {
    chainLength: currentRouteChain.length
  });
  log('routeNavigation.js', 'getCurrentRouteChain', 'return', 'Returning current route chain', {
    chainLength: currentRouteChain.length,
    slugs: currentRouteChain.map(route => route.slug)
  });
  return currentRouteChain;
}

/**
 * Get previous active route path
 * 
 * @returns {string|null} - Previous route path or null
 */
export function getPreviousActivePath() {
  const previousPath = previousActiveRoute?.slug || null;
  log('routeNavigation.js', 'getPreviousActivePath', 'get', 'Getting previous path', { previousPath });
  log('routeNavigation.js', 'getPreviousActivePath', 'return', 'Returning previous active path', { previousPath });
  return previousPath;
}

/**
 * Get previous active route object
 * 
 * @returns {object|null} - Previous route object or null
 */
export function getPreviousActiveRoute() {
  log('routeNavigation.js', 'getPreviousActiveRoute', 'get', 'Getting previous route', {
    hasRoute: !!previousActiveRoute,
    slug: previousActiveRoute?.slug
  });
  log('routeNavigation.js', 'getPreviousActiveRoute', 'return', 'Returning previous active route', { slug: previousActiveRoute?.slug });
  return previousActiveRoute;
}

/**
 * Get full navigation history
 * 
 * @param {number} [maxEntries] - Maximum number of entries to return
 * @returns {Array} - Array of navigation history entries
 */
export function getNavigationHistory(maxEntries = null) {
  log('routeNavigation.js', 'getNavigationHistory', 'get', 'Getting navigation history', { 
    maxEntries,
    totalEntries: fullNavigationHistory.length
  });

  if (maxEntries && maxEntries > 0) {
    const limitedHistory = fullNavigationHistory.slice(-maxEntries);
    log('routeNavigation.js', 'getNavigationHistory', 'return', 'Returning limited navigation history', { requested: maxEntries, returned: limitedHistory.length });
    return limitedHistory;
  }

  const fullHistory = [...fullNavigationHistory];
  log('routeNavigation.js', 'getNavigationHistory', 'return', 'Returning full navigation history', { entries: fullHistory.length });
  return fullHistory;
}

/**
 * Check if user can navigate back
 * 
 * @returns {boolean} - True if there is previous navigation history
 */
export function canNavigateBack() {
  const hasHistory = fullNavigationHistory.length > 1;
  log('routeNavigation.js', 'canNavigateBack', 'check', 'Checking if can navigate back', {
    hasHistory,
    historyLength: fullNavigationHistory.length
  });
  log('routeNavigation.js', 'canNavigateBack', 'return', 'Returning navigation back capability', { canNavigateBack: hasHistory });
  return hasHistory;
}

/**
 * Clear navigation history
 * Resets all navigation state
 * 
 * @returns {void}
 */
export function clearNavigationHistory() {
  log('routeNavigation.js', 'clearNavigationHistory', 'start', 'Clearing navigation history', {});

  trackStep({
    step: 'clearHistory',
    file: 'routeNavigation.js',
    method: 'clearNavigationHistory',
    flag: 'clear',
    purpose: 'Clear all navigation history'
  });

  currentActiveRoute = null;
  previousActiveRoute = null;
  currentRouteChain = [];
  fullNavigationHistory.length = 0;

  log('routeNavigation.js', 'clearNavigationHistory', 'success', 'Navigation history cleared', {});
}

/**
 * Get navigation statistics
 * 
 * @returns {object} - Statistics about navigation
 */
export function getNavigationStatistics() {
  log('routeNavigation.js', 'getNavigationStatistics', 'get', 'Getting navigation statistics', {});

  const statistics = {
    totalNavigations: fullNavigationHistory.length,
    currentRoute: currentActiveRoute?.slug || null,
    previousRoute: previousActiveRoute?.slug || null,
    canGoBack: fullNavigationHistory.length > 1,
    uniqueRoutes: new Set(fullNavigationHistory.map(entry => entry.path)).size,
    oldestEntry: fullNavigationHistory[0]?.timestamp || null,
    newestEntry: fullNavigationHistory[fullNavigationHistory.length - 1]?.timestamp || null
  };

  log('routeNavigation.js', 'getNavigationStatistics', 'success', 'Navigation statistics calculated', statistics);

  log('routeNavigation.js', 'getNavigationStatistics', 'return', 'Returning navigation statistics', { totalNavigations: statistics.totalNavigations });
  return statistics;
}

/**
 * Check if currently on a specific path
 * 
 * @param {string} targetPath - Path to check against
 * @returns {boolean} - True if currently on target path
 */
export function isOnPath(targetPath) {
  const isMatch = currentActiveRoute?.slug === targetPath;

  log('routeNavigation.js', 'isOnPath', 'check', 'Checking if on path', {
    targetPath,
    currentPath: currentActiveRoute?.slug,
    isMatch
  });

  log('routeNavigation.js', 'isOnPath', 'return', 'Returning path match result', { targetPath, isMatch });
  return isMatch;
}

/**
 * Check if was previously on a specific path
 * 
 * @param {string} targetPath - Path to check against
 * @returns {boolean} - True if was previously on target path
 */
export function wasPreviouslyOnPath(targetPath) {
  const wasOnPath = fullNavigationHistory.some(entry => entry.path === targetPath);
  
  log('routeNavigation.js', 'wasPreviouslyOnPath', 'check', 'Checking if was previously on path', {
    targetPath,
    wasOnPath,
    historyLength: fullNavigationHistory.length
  });

  log('routeNavigation.js', 'wasPreviouslyOnPath', 'return', 'Returning previous path check result', { targetPath, wasOnPath });
  return wasOnPath;
}
