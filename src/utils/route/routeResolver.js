/**
 * RouteResolver - Resolve routes, components, and configurations
 * 
 * Handles:
 * - Finding routes by path
 * - Resolving role-based component paths
 * - Inheriting configurations from parent routes
 * 
 * All operations tracked with global window.performanceTracker.
 */

import { getRouteConfiguration } from './routeConfigLoader.js';
import { log } from '../common/logHandler.js';
import { deepMergePreferChild, safelyGetNestedProperty } from '../common/objectSafety.js';


// Performance tracker available globally as window.performanceTracker

/**
 * Find a route by its slug path
 * Supports exact matches and wildcard patterns
 * 
 * @param {string} targetPath - Path to find (e.g., "/dashboard", "/log-in")
 * @returns {object|null} - Matched route object or null if not found
 */
export function resolveRouteFromPath(targetPath) {
  log('routeResolver.js', 'resolveRouteFromPath', 'start', 'Finding route by path', { targetPath });
  window.performanceTracker.step({
    step: 'resolveRoute',
    file: 'route/routeResolver.js',
    method: 'resolveRouteFromPath',
    flag: 'lookup',
    purpose: `Find route for path: ${targetPath}`
  });

  // Get all routes
  const allRoutes = getRouteConfiguration();

  // Try exact match first
  for (const route of allRoutes) {
    if (route.slug === targetPath) {
      log('routeResolver.js', 'resolveRouteFromPath', 'exact-match', 'Exact route match found', {
        slug: route.slug,
        section: route.section
      });

      // Track success
      window.performanceTracker.step({
        step: 'routeResolved',
        file: 'routeResolver.js',
        method: 'resolveRouteFromPath',
        flag: 'exact-match',
        purpose: `Route found: ${route.slug}`
      });

      log('routeResolver.js', 'resolveRouteFromPath', 'return', 'Returning matched route', { route: route.slug });
      return route;
    }
  }

  // Try wildcard patterns (e.g., "/:pathMatch(.*)*")
  for (const route of allRoutes) {
    if (route.slug.includes(':') || route.slug.includes('*')) {
      // Simple wildcard matching - can be enhanced with path-to-regexp
      const wildcardMatch = matchWildcardRoute(targetPath, route.slug);
      
      if (wildcardMatch) {
        log('routeResolver.js', 'resolveRouteFromPath', 'wildcard-match', 'Wildcard route match found', {
          slug: route.slug,
          targetPath
        });

        // Track success
        window.performanceTracker.step({
          step: 'routeResolved',
          file: 'routeResolver.js',
          method: 'resolveRouteFromPath',
          flag: 'wildcard-match',
          purpose: `Wildcard route matched: ${route.slug}`
        });

        log('routeResolver.js', 'resolveRouteFromPath', 'return', 'Returning wildcard matched route', { route: route.slug });
        return route;
      }
    }
  }

  // No match found
  log('routeResolver.js', 'resolveRouteFromPath', 'not-found', 'No route match found for path', { targetPath });

  // Track miss
  window.performanceTracker.step({
    step: 'routeNotFound',
    file: 'routeResolver.js',
    method: 'resolveRouteFromPath',
    flag: 'not-found',
    purpose: `No route found for path: ${targetPath}`
  });

  log('routeResolver.js', 'resolveRouteFromPath', 'return', 'Returning null - no route found', { targetPath });
  return null;
}

/**
 * Match a path against a wildcard route pattern
 * Basic implementation - can be enhanced with path-to-regexp library
 * 
 * @param {string} targetPath - Actual path to match
 * @param {string} routePattern - Route pattern with wildcards
 * @returns {boolean} - True if path matches pattern
 */
function matchWildcardRoute(targetPath, routePattern) {
  // Handle catch-all pattern
  if (routePattern === '/:pathMatch(.*)*') {
    return true;
  }

  // Handle dynamic segments (simplified)
  if (routePattern.includes(':')) {
    const patternParts = routePattern.split('/');
    const pathParts = targetPath.split('/');

    // Must have same number of parts (unless wildcard at end)
    if (patternParts.length !== pathParts.length && !routePattern.includes('*')) {
      return false;
    }

    // Check each part
    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      // Dynamic segment matches anything
      if (patternPart.startsWith(':')) {
        continue;
      }

      // Literal segment must match exactly
      if (patternPart !== pathPart) {
        return false;
      }
    }

    return true;
  }

  return false;
}

/**
 * Resolve component path for a route based on user role
 * Handles role-specific component overrides
 * 
 * @param {object} route - Route object
 * @param {string} userRole - Current user role (creator, fan, agent, vendor)
 * @returns {string|null} - Resolved component path or null
 */
export function resolveComponentPathForRoute(route, userRole) {
  log('routeResolver.js', 'resolveComponentPathForRoute', 'start', 'Resolving component path for route', {
    slug: route.slug,
    userRole
  });
  window.performanceTracker.step({
    step: 'resolveComponentPath',
    file: 'route/routeResolver.js',
    method: 'resolveComponentPathForRoute',
    flag: 'resolve',
    purpose: `Resolve component for role: ${userRole}`
  });

  // Check for redirect - no component needed
  if (route.redirect) {
    log('routeResolver.js', 'resolveComponentPathForRoute', 'redirect', 'Route is redirect, no component path', {});
    log('routeResolver.js', 'resolveComponentPathForRoute', 'return', 'Returning null - redirect route', { slug: route.slug });
    return null;
  }

  // Check for custom component path based on role
  if (route.customComponentPath && userRole) {
    const roleSpecificPath = safelyGetNestedProperty(
      route.customComponentPath,
      `${userRole}.componentPath`
    );

    if (roleSpecificPath) {
      log('routeResolver.js', 'resolveComponentPathForRoute', 'role-specific', 'Role-specific component path found', {
        role: userRole,
        path: roleSpecificPath
      });

      // Track resolution
      window.performanceTracker.step({
        step: 'componentPathResolved',
        file: 'routeResolver.js',
        method: 'resolveComponentPathForRoute',
        flag: 'role-specific',
        purpose: `Component path resolved for role: ${userRole}`
      });

      log('routeResolver.js', 'resolveComponentPathForRoute', 'return', 'Returning role-specific component path', { role: userRole, path: roleSpecificPath });
      return roleSpecificPath;
    }
  }

  // Use default component path
  if (route.componentPath) {
    log('routeResolver.js', 'resolveComponentPathForRoute', 'default', 'Using default component path', {
      path: route.componentPath
    });

    // Track resolution
    window.performanceTracker.step({
      step: 'componentPathResolved',
      file: 'routeResolver.js',
      method: 'resolveComponentPathForRoute',
      flag: 'default',
      purpose: 'Using default component path'
    });

    log('routeResolver.js', 'resolveComponentPathForRoute', 'return', 'Returning default component path', { path: route.componentPath });
    return route.componentPath;
  }

  // No component path found
  log('routeResolver.js', 'resolveComponentPathForRoute', 'not-found', 'No component path found for route', {
    slug: route.slug,
    userRole
  });

  log('routeResolver.js', 'resolveComponentPathForRoute', 'return', 'Returning null - no component path found', { slug: route.slug, userRole });
  return null;
}

/**
 * Inherit configuration from parent route
 * Merges parent route config with child route config, child values take precedence
 * 
 * @param {object} childRoute - Child route object
 * @returns {object} - Merged route configuration
 */
export function inheritConfigurationFromParentRoute(childRoute) {
  log('routeResolver.js', 'inheritConfigurationFromParentRoute', 'start', 'Inheriting configuration from parent', {
    childSlug: childRoute.slug
  });

  // Check if route wants to inherit from parent
  if (!childRoute.inheritConfigFromParent) {
    log('routeResolver.js', 'inheritConfigurationFromParentRoute', 'skip', 'Route does not inherit from parent, returning as-is', {});
    log('routeResolver.js', 'inheritConfigurationFromParentRoute', 'return', 'Returning original route - no inheritance', { slug: childRoute.slug });
    return childRoute;
  }
  window.performanceTracker.step({
    step: 'inheritParentConfig',
    file: 'route/routeResolver.js',
    method: 'inheritConfigurationFromParentRoute',
    flag: 'merge',
    purpose: `Inherit config for: ${childRoute.slug}`
  });

  // Find parent route by slug hierarchy
  const parentRoute = findParentRouteBySlug(childRoute.slug);

  if (!parentRoute) {
    log('routeResolver.js', 'inheritConfigurationFromParentRoute', 'no-parent', 'No parent route found for inheritance', {
      childSlug: childRoute.slug
    });
    log('routeResolver.js', 'inheritConfigurationFromParentRoute', 'return', 'Returning original route - no parent found', { slug: childRoute.slug });
    return childRoute;
  }

  // Merge parent config with child config (child wins)
  const mergedConfig = deepMergePreferChild(parentRoute, childRoute);

  log('routeResolver.js', 'inheritConfigurationFromParentRoute', 'success', 'Parent configuration inherited', {
    childSlug: childRoute.slug,
    parentSlug: parentRoute.slug
  });

  // Track merge completion
  window.performanceTracker.step({
    step: 'parentConfigInherited',
    file: 'routeResolver.js',
    method: 'inheritConfigurationFromParentRoute',
    flag: 'merged',
    purpose: `Config inherited from parent: ${parentRoute.slug}`
  });

  log('routeResolver.js', 'inheritConfigurationFromParentRoute', 'return', 'Returning merged configuration', { childSlug: childRoute.slug, parentSlug: parentRoute.slug });
  return mergedConfig;
}

/**
 * Find parent route based on slug hierarchy
 * E.g., for "/dashboard/settings/privacy", parent is "/dashboard/settings"
 * 
 * @param {string} childSlug - Child route slug
 * @returns {object|null} - Parent route object or null
 */
function findParentRouteBySlug(childSlug) {
  // Get all routes
  const allRoutes = getRouteConfiguration();

  // Split slug into parts
  const slugParts = childSlug.split('/').filter(part => part.length > 0);

  // Try progressively shorter paths
  for (let i = slugParts.length - 1; i > 0; i--) {
    const potentialParentSlug = '/' + slugParts.slice(0, i).join('/');

    // Look for matching route
    const parentRoute = allRoutes.find(route => route.slug === potentialParentSlug);

    if (parentRoute) {
      log('routeResolver.js', 'findParentRouteBySlug', 'found', 'Parent route found', {
        childSlug,
        parentSlug: potentialParentSlug
      });
      log('routeResolver.js', 'findParentRouteBySlug', 'return', 'Returning found parent route', { childSlug, parentSlug: potentialParentSlug });
      return parentRoute;
    }
  }

  // No parent found
  log('routeResolver.js', 'findParentRouteBySlug', 'return', 'Returning null - no parent route found', { childSlug });
  return null;
}

/**
 * Get all matched routes for a path (including parent chain)
 * Useful for breadcrumbs and nested layouts
 * 
 * @param {string} targetPath - Path to get route chain for
 * @returns {Array} - Array of route objects from root to target
 */
export function getRouteChainForPath(targetPath) {
  log('routeResolver.js', 'getRouteChainForPath', 'start', 'Getting route chain for path', { targetPath });

  const routeChain = [];
  const slugParts = targetPath.split('/').filter(part => part.length > 0);

  // Build progressively longer paths
  for (let i = 1; i <= slugParts.length; i++) {
    const partialPath = '/' + slugParts.slice(0, i).join('/');
    const route = resolveRouteFromPath(partialPath);

    if (route) {
      routeChain.push(route);
    }
  }

  log('routeResolver.js', 'getRouteChainForPath', 'success', 'Route chain resolved', {
    targetPath,
    chainLength: routeChain.length
  });

  log('routeResolver.js', 'getRouteChainForPath', 'return', 'Returning route chain', { targetPath, chainLength: routeChain.length, routes: routeChain.map(r => r.slug) });
  return routeChain;
}

