/**
 * RouteConfigLoader - Load and cache route configuration
 * 
 * Handles loading routeConfig.json with caching and validation.
 * Uses global JSON config loader utility.
 * Uses performance tracker to track all operations.
 */

import routeConfigData from '../../router/routeConfig.json';
import { loadJsonConfigFromImport } from '../common/jsonConfigLoader.js';
import { log } from '../common/logHandler.js';
import { logError } from '../common/errorHandler.js';
import { validateRouteConfig } from '../build/jsonConfigValidator.js';

// Performance tracker available globally as window.performanceTracker

// Cache TTL - route config rarely changes at runtime
const ROUTE_CONFIG_CACHE_TTL = 3600000; // 1 hour

/**
 * Load route configuration from JSON file with validation
 * Performs deep validation of route structure
 * Uses global JSON config loader utility
 * 
 * @returns {Array} - Array of validated route objects
 */
export function loadRouteConfigurationFromFile() {
  log('routeConfigLoader.js', 'loadRouteConfigurationFromFile', 'start', 'Loading route configuration', {});

  if (window.performanceTracker) {
    try {
      window.performanceTracker.step({
        step: 'loadRouteConfig_start',
        file: 'routeConfigLoader.js',
        method: 'loadRouteConfigurationFromFile',
        flag: 'io',
        purpose: 'Load route configuration from JSON file'
      });
    } catch (e) {
      // Performance tracker session ended, ignore
    }
  }

  try {
    // Load route config using global JSON config loader
    const result = loadJsonConfigFromImport(routeConfigData, {
      configName: 'route_config',
      cacheTTL: ROUTE_CONFIG_CACHE_TTL,
      skipValidation: false,
      validator: validateRouteConfig
    });

    if (!result.success) {
      log('routeConfigLoader.js', 'loadRouteConfigurationFromFile', 'error', 'Failed to load route configuration', {
        error: result.error
      });
      throw new Error(result.error || 'Failed to load route configuration');
    }

    const loadedRouteConfig = result.data;

    // Validate it's an array
    if (!Array.isArray(loadedRouteConfig)) {
      log('routeConfigLoader.js', 'loadRouteConfigurationFromFile', 'error', 'Route configuration is not an array', {
        type: typeof loadedRouteConfig
      });
      throw new Error('Route configuration is not an array');
    }

    log('routeConfigLoader.js', 'loadRouteConfigurationFromFile', 'success', 'Route configuration loaded', {
      routeCount: loadedRouteConfig.length
    });

    if (window.performanceTracker) {
      try {
        window.performanceTracker.step({
          step: 'loadRouteConfig_complete',
          file: 'routeConfigLoader.js',
          method: 'loadRouteConfigurationFromFile',
          flag: 'success',
          purpose: `Loaded ${loadedRouteConfig.length} routes`
        });
      } catch (e) {
        // Performance tracker session ended, ignore
      }
    }

    log('routeConfigLoader.js', 'loadRouteConfigurationFromFile', 'return', 'Returning loaded route configuration', { routeCount: loadedRouteConfig.length });
    return loadedRouteConfig;

  } catch (error) {
    logError('routeConfigLoader.js', 'loadRouteConfigurationFromFile', 'Failed to load route configuration', error);

    if (window.performanceTracker) {
      try {
        window.performanceTracker.step({
          step: 'loadRouteConfig_error',
          file: 'routeConfigLoader.js',
          method: 'loadRouteConfigurationFromFile',
          flag: 'error',
          purpose: 'Route config load failed'
        });
      } catch (e) {
        // Performance tracker session ended, ignore
      }
    }

    log('routeConfigLoader.js', 'loadRouteConfigurationFromFile', 'return', 'Returning empty array due to error', { error: error.message });
    return [];
  }
}

/**
 * Get cached route configuration or load from file
 * Implements caching strategy for performance
 * Cache is handled by global JSON config loader
 * 
 * @returns {Array} - Array of route objects
 */
export function getCachedRouteConfiguration() {
  log('routeConfigLoader.js', 'getCachedRouteConfiguration', 'start', 'Getting cached route configuration', {});

  if (window.performanceTracker) {
    try {
      window.performanceTracker.step({
        step: 'getCachedConfig_start',
        file: 'routeConfigLoader.js',
        method: 'getCachedRouteConfiguration',
        flag: 'cache',
        purpose: 'Get cached route configuration'
      });
    } catch (e) {
      // Performance tracker session ended, ignore
    }
  }

  try {
    // Load from file (caching is handled by jsonConfigLoader)
    const loadedConfig = loadRouteConfigurationFromFile();

    log('routeConfigLoader.js', 'getCachedRouteConfiguration', 'success', 'Route configuration retrieved', {
      routeCount: loadedConfig.length
    });

    if (window.performanceTracker) {
      try {
        window.performanceTracker.step({
          step: 'getCachedConfig_complete',
          file: 'routeConfigLoader.js',
          method: 'getCachedRouteConfiguration',
          flag: 'success',
          purpose: 'Route config retrieved'
        });
      } catch (e) {
        // Performance tracker session ended, ignore
      }
    }

    log('routeConfigLoader.js', 'getCachedRouteConfiguration', 'return', 'Returning route configuration', { routeCount: loadedConfig.length });
    return loadedConfig;

  } catch (error) {
    logError('routeConfigLoader.js', 'getCachedRouteConfiguration', 'Failed to get route configuration', error);

    log('routeConfigLoader.js', 'getCachedRouteConfiguration', 'return', 'Returning empty array due to error', { error: error.message });
    return [];
  }
}

/**
 * Reset route configuration cache
 * Forces reload on next access
 * Uses global JSON config loader cache clearing
 * 
 * @returns {void}
 */
export function resetRouteConfigurationCache() {
  log('routeConfigLoader.js', 'resetRouteConfigurationCache', 'start', 'Resetting route configuration cache', {});

  if (window.performanceTracker) {
    try {
      window.performanceTracker.step({
        step: 'resetCache',
        file: 'routeConfigLoader.js',
        method: 'resetRouteConfigurationCache',
        flag: 'cache-clear',
        purpose: 'Clear route configuration cache'
      });
    } catch (e) {
      // Performance tracker session ended, ignore
    }
  }

  // Import and use clearConfigCache from jsonConfigLoader
  import('../common/jsonConfigLoader.js').then(({ clearConfigCache }) => {
    clearConfigCache('route_config');
  });

  log('routeConfigLoader.js', 'resetRouteConfigurationCache', 'success', 'Route configuration cache cleared', {});

  if (window.performanceTracker) {
    try {
      window.performanceTracker.step({
        step: 'resetCache_complete',
        file: 'routeConfigLoader.js',
        method: 'resetRouteConfigurationCache',
        flag: 'success',
        purpose: 'Cache cleared'
      });
    } catch (e) {
      // Performance tracker session ended, ignore
    }
  }

  log('routeConfigLoader.js', 'resetRouteConfigurationCache', 'return', 'Cache reset complete', {});
}

/**
 * Get route configuration (convenience method)
 * Always returns cached version for performance
 * 
 * @returns {Array} - Array of route objects
 */
export function getRouteConfiguration() {
  log('routeConfigLoader.js', 'getRouteConfiguration', 'call', 'Getting route configuration', {});
  const routes = getCachedRouteConfiguration();
  log('routeConfigLoader.js', 'getRouteConfiguration', 'return', 'Returning route configuration via cache', { routeCount: routes.length });
  return routes;
}
