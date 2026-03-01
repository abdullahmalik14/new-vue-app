/**
 * JSON Config Loader - Global utility for loading and caching JSON configurations
 * 
 * Handles both absolute and relative paths with validation and caching.
 * Works in browser context for runtime configuration loading.
 * All operations tracked with global window.performanceTracker.
 */

import { getValueFromCache, setValueWithExpiration } from './cacheHandler.js';
import { log } from './logHandler.js';
import { logError } from './errorHandler.js';

// Cache configuration
const JSON_CONFIG_CACHE_KEY_PREFIX = 'json_config_';
const JSON_CONFIG_DEFAULT_CACHE_TTL = 3600000; // 1 hour

// Track which configs are currently loading to prevent duplicates
const configsLoadingInProgress = new Set();

// Track loaded configs in memory
const loadedConfigs = new Map();

/**
 * Validate that JSON data is properly formatted
 * 
 * @param {any} data - Parsed JSON data to validate
 * @param {string} configName - Name of config for logging
 * @returns {object} - Validation result { valid: boolean, error: string|null }
 */
function validateJsonData(data, configName) {
  log('jsonConfigLoader.js', 'validateJsonData', 'start', `Validating JSON data for ${configName}`, {});

  // Check if data is null or undefined
  if (data === null || data === undefined) {
    log('jsonConfigLoader.js', 'validateJsonData', 'error', 'JSON data is null or undefined', { configName });
    log('jsonConfigLoader.js', 'validateJsonData', 'return', 'Returning validation failure', { valid: false });
    return {
      valid: false,
      error: 'JSON data is null or undefined'
    };
  }

  // Check for basic JSON types
  const dataType = typeof data;
  if (dataType !== 'object' && !Array.isArray(data)) {
    log('jsonConfigLoader.js', 'validateJsonData', 'error', 'JSON data is not an object or array', {
      configName,
      type: dataType
    });
    log('jsonConfigLoader.js', 'validateJsonData', 'return', 'Returning validation failure', { valid: false });
    return {
      valid: false,
      error: `JSON data must be an object or array, received: ${dataType}`
    };
  }

  log('jsonConfigLoader.js', 'validateJsonData', 'success', 'JSON data is valid', { configName });
  log('jsonConfigLoader.js', 'validateJsonData', 'return', 'Returning validation success', { valid: true });
  return {
    valid: true,
    error: null
  };
}

/**
 * Parse JSON string and validate format
 * 
 * @param {string} jsonString - JSON string to parse
 * @param {string} configName - Name of config for logging
 * @returns {object} - Parse result { success: boolean, data: any, error: string|null }
 */
function parseJsonString(jsonString, configName) {
  log('jsonConfigLoader.js', 'parseJsonString', 'start', `Parsing JSON string for ${configName}`, {});

  if (typeof jsonString !== 'string') {
    log('jsonConfigLoader.js', 'parseJsonString', 'error', 'Input is not a string', {
      configName,
      type: typeof jsonString
    });
    log('jsonConfigLoader.js', 'parseJsonString', 'return', 'Returning parse failure', { success: false });
    return {
      success: false,
      data: null,
      error: 'Input must be a string'
    };
  }

  try {
    const parsed = JSON.parse(jsonString);

    log('jsonConfigLoader.js', 'parseJsonString', 'success', `Successfully parsed JSON for ${configName}`, {});
    log('jsonConfigLoader.js', 'parseJsonString', 'return', 'Returning parsed data', { success: true });

    return {
      success: true,
      data: parsed,
      error: null
    };
  } catch (error) {
    logError('jsonConfigLoader.js', 'parseJsonString', `Failed to parse JSON for ${configName}`, error, {
      configName
    });

    log('jsonConfigLoader.js', 'parseJsonString', 'return', 'Returning parse failure', {
      success: false,
      error: error.message
    });

    return {
      success: false,
      data: null,
      error: error.message
    };
  }
}

/**
 * Resolve path to absolute URL for fetching
 * Handles both absolute and relative paths
 * 
 * @param {string} path - Path to resolve
 * @returns {string} - Resolved absolute URL
 */
function resolvePath(path) {
  log('jsonConfigLoader.js', 'resolvePath', 'start', 'Resolving path', { path });

  // If already absolute URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    log('jsonConfigLoader.js', 'resolvePath', 'absolute', 'Path is already absolute URL', { path });
    log('jsonConfigLoader.js', 'resolvePath', 'return', 'Returning absolute URL', { path });
    return path;
  }

  // If absolute file path (starts with /), use relative to origin
  if (path.startsWith('/')) {
    const resolved = window.location.origin + path;
    log('jsonConfigLoader.js', 'resolvePath', 'absolute-file', 'Resolved absolute file path', {
      original: path,
      resolved
    });
    log('jsonConfigLoader.js', 'resolvePath', 'return', 'Returning resolved path', { resolved });
    return resolved;
  }

  // Relative path - resolve relative to current location
  const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
  const resolved = new URL(path, baseUrl).href;

  log('jsonConfigLoader.js', 'resolvePath', 'relative', 'Resolved relative path', {
    original: path,
    base: baseUrl,
    resolved
  });
  log('jsonConfigLoader.js', 'resolvePath', 'return', 'Returning resolved path', { resolved });

  return resolved;
}

/**
 * Fetch JSON configuration from a URL
 * 
 * @param {string} url - URL to fetch from
 * @param {string} configName - Name of config for logging
 * @returns {Promise<object>} - Fetch result { success: boolean, data: any, error: string|null }
 */
async function fetchJsonFromUrl(url, configName) {
  log('jsonConfigLoader.js', 'fetchJsonFromUrl', 'start', `Fetching JSON from URL for ${configName}`, { url });

  if (window.performanceTracker) {
    try {
      window.performanceTracker.step({
        step: 'fetchJsonConfig_start',
        file: 'jsonConfigLoader.js',
        method: 'fetchJsonFromUrl',
        flag: 'fetch',
        purpose: `Fetch JSON config: ${configName}`
      });
    } catch (e) {
      // Performance tracker session ended, ignore
    }
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      cache: 'no-cache' // Force fresh data
    });

    if (!response.ok) {
      log('jsonConfigLoader.js', 'fetchJsonFromUrl', 'error', 'Failed to fetch config', {
        configName,
        url,
        status: response.status,
        statusText: response.statusText
      });

      if (window.performanceTracker) {
        try {
          window.performanceTracker.step({
            step: 'fetchJsonConfig_error',
            file: 'jsonConfigLoader.js',
            method: 'fetchJsonFromUrl',
            flag: 'fetch-error',
            purpose: `Failed to fetch: ${response.status}`
          });
        } catch (e) {
          // Performance tracker session ended, ignore
        }
      }

      log('jsonConfigLoader.js', 'fetchJsonFromUrl', 'return', 'Returning fetch failure', { success: false });
      return {
        success: false,
        data: null,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    // Validate content type
    const contentType = response.headers?.get?.('content-type') || '';
    if (!contentType.includes('application/json') && !contentType.includes('text/plain')) {
      log('jsonConfigLoader.js', 'fetchJsonFromUrl', 'warn', 'Response content type is not JSON', {
        configName,
        contentType
      });
    }

    // Parse response as JSON
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      logError('jsonConfigLoader.js', 'fetchJsonFromUrl', 'Failed to parse response JSON', parseError, {
        configName,
        url
      });

      if (window.performanceTracker) {
        try {
          window.performanceTracker.step({
            step: 'fetchJsonConfig_parseError',
            file: 'jsonConfigLoader.js',
            method: 'fetchJsonFromUrl',
            flag: 'parse-error',
            purpose: 'JSON parse failed'
          });
        } catch (e) {
          // Performance tracker session ended, ignore
        }
      }

      log('jsonConfigLoader.js', 'fetchJsonFromUrl', 'return', 'Returning parse failure', { success: false });
      return {
        success: false,
        data: null,
        error: `Failed to parse JSON: ${parseError.message}`
      };
    }

    log('jsonConfigLoader.js', 'fetchJsonFromUrl', 'success', `Successfully fetched JSON for ${configName}`, {
      url,
      dataType: Array.isArray(data) ? 'array' : typeof data
    });

    if (window.performanceTracker) {
      try {
        window.performanceTracker.step({
          step: 'fetchJsonConfig_success',
          file: 'jsonConfigLoader.js',
          method: 'fetchJsonFromUrl',
          flag: 'fetch-success',
          purpose: `Config fetched: ${configName}`
        });
      } catch (e) {
        // Performance tracker session ended, ignore
      }
    }

    log('jsonConfigLoader.js', 'fetchJsonFromUrl', 'return', 'Returning fetched data', { success: true });
    return {
      success: true,
      data,
      error: null
    };

  } catch (error) {
    logError('jsonConfigLoader.js', 'fetchJsonFromUrl', `Failed to fetch JSON for ${configName}`, error, {
      url,
      configName
    });

    if (window.performanceTracker) {
      try {
        window.performanceTracker.step({
          step: 'fetchJsonConfig_exception',
          file: 'jsonConfigLoader.js',
          method: 'fetchJsonFromUrl',
          flag: 'fetch-exception',
          purpose: `Exception during fetch: ${error.message}`
        });
      } catch (e) {
        // Performance tracker session ended, ignore
      }
    }

    log('jsonConfigLoader.js', 'fetchJsonFromUrl', 'return', 'Returning fetch exception', { success: false });
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
}

/**
 * Load JSON configuration from path with caching
 * Handles both absolute and relative paths
 * Validates JSON format before caching
 * 
 * @param {string} path - Path to JSON file (absolute or relative)
 * @param {object} options - Load options
 * @param {string} options.configName - Name for logging and caching (required)
 * @param {number} options.cacheTTL - Cache TTL in milliseconds (default: 1 hour)
 * @param {boolean} options.skipCache - Skip cache and force fresh load (default: false)
 * @param {boolean} options.skipValidation - Skip JSON validation (default: false)
 * @param {Function} options.validator - Custom validator function (data) => { valid, errors, warnings }
 * @returns {Promise<object>} - Result { success: boolean, data: any, error: string|null }
 */
export async function loadJsonConfig(path, options = {}) {
  const {
    configName = 'unknown_config',
    cacheTTL = JSON_CONFIG_DEFAULT_CACHE_TTL,
    skipCache = false,
    skipValidation = false,
    validator = null
  } = options;

  log('jsonConfigLoader.js', 'loadJsonConfig', 'start', `Loading JSON config: ${configName}`, {
    path,
    configName,
    cacheTTL,
    skipCache,
    skipValidation
  });

  if (window.performanceTracker) {
    try {
      window.performanceTracker.step({
        step: 'loadJsonConfig_start',
        file: 'jsonConfigLoader.js',
        method: 'loadJsonConfig',
        flag: 'config-load',
        purpose: `Load config: ${configName}`
      });
    } catch (e) {
      // Performance tracker session ended, ignore
    }
  }

  // Validate path is provided
  if (!path || typeof path !== 'string') {
    log('jsonConfigLoader.js', 'loadJsonConfig', 'error', 'Invalid path provided', {
      path,
      pathType: typeof path
    });
    log('jsonConfigLoader.js', 'loadJsonConfig', 'return', 'Returning error - invalid path', { success: false });
    return {
      success: false,
      data: null,
      error: 'Path must be a non-empty string'
    };
  }

  // Build cache key
  const cacheKey = JSON_CONFIG_CACHE_KEY_PREFIX + configName;

  // Check cache first (unless skipCache is true)
  if (!skipCache) {
    const cachedData = getValueFromCache(cacheKey);
    if (cachedData) {
      log('jsonConfigLoader.js', 'loadJsonConfig', 'cache-hit', `Config loaded from cache: ${configName}`, {
        configName
      });

      if (window.performanceTracker) {
        try {
          window.performanceTracker.step({
            step: 'loadJsonConfig_cacheHit',
            file: 'jsonConfigLoader.js',
            method: 'loadJsonConfig',
            flag: 'cache-hit',
            purpose: `Config served from cache: ${configName}`
          });
        } catch (e) {
          // Performance tracker session ended, ignore
        }
      }

      log('jsonConfigLoader.js', 'loadJsonConfig', 'return', 'Returning cached data', { success: true });
      return {
        success: true,
        data: cachedData,
        error: null
      };
    }

    log('jsonConfigLoader.js', 'loadJsonConfig', 'cache-miss', `Cache miss for config: ${configName}`, {});
  } else {
    log('jsonConfigLoader.js', 'loadJsonConfig', 'skip-cache', 'Skipping cache check', { configName });
  }

  // Check if already loading this config
  const loadingKey = `${configName}_${path}`;
  if (configsLoadingInProgress.has(loadingKey)) {
    log('jsonConfigLoader.js', 'loadJsonConfig', 'in-progress', 'Config load already in progress, waiting', {
      configName
    });

    // Wait for existing load to complete
    const result = await waitForConfigLoad(loadingKey, configName);
    log('jsonConfigLoader.js', 'loadJsonConfig', 'return', 'Returning data from concurrent load', { success: result.success });
    return result;
  }

  // Mark as loading
  configsLoadingInProgress.add(loadingKey);

  try {
    // Resolve path to absolute URL
    const resolvedUrl = resolvePath(path);

    // Fetch JSON from URL
    const fetchResult = await fetchJsonFromUrl(resolvedUrl, configName);

    if (!fetchResult.success) {
      log('jsonConfigLoader.js', 'loadJsonConfig', 'error', 'Failed to fetch config', {
        configName,
        error: fetchResult.error
      });

      // Remove from loading set
      configsLoadingInProgress.delete(loadingKey);

      log('jsonConfigLoader.js', 'loadJsonConfig', 'return', 'Returning fetch error', { success: false });
      return {
        success: false,
        data: null,
        error: fetchResult.error
      };
    }

    const data = fetchResult.data;

    // Validate JSON data (unless skipValidation is true)
    if (!skipValidation) {
      const validation = validateJsonData(data, configName);

      if (!validation.valid) {
        log('jsonConfigLoader.js', 'loadJsonConfig', 'error', 'JSON validation failed', {
          configName,
          error: validation.error
        });

        // Remove from loading set
        configsLoadingInProgress.delete(loadingKey);

        log('jsonConfigLoader.js', 'loadJsonConfig', 'return', 'Returning validation error', { success: false });
        return {
          success: false,
          data: null,
          error: `Validation failed: ${validation.error}`
        };
      }

      // Run custom validator if provided
      if (validator && typeof validator === 'function') {
        log('jsonConfigLoader.js', 'loadJsonConfig', 'info', 'Running custom validator', { configName });

        try {
          const customValidation = validator(data);

          if (customValidation && !customValidation.valid) {
            log('jsonConfigLoader.js', 'loadJsonConfig', 'warn', 'Custom validation returned warnings', {
              configName,
              errorCount: customValidation.errors?.length || 0,
              warningCount: customValidation.warnings?.length || 0
            });

            // Log errors and warnings but don't fail
            if (customValidation.errors?.length > 0) {
              log('jsonConfigLoader.js', 'loadJsonConfig', 'error', 'Custom validation errors', {
                configName,
                errors: customValidation.errors
              });
            }

            if (customValidation.warnings?.length > 0) {
              log('jsonConfigLoader.js', 'loadJsonConfig', 'warn', 'Custom validation warnings', {
                configName,
                warnings: customValidation.warnings
              });
            }
          }
        } catch (validatorError) {
          logError('jsonConfigLoader.js', 'loadJsonConfig', 'Custom validator threw exception', validatorError, {
            configName
          });
          // Continue despite validator error
        }
      }
    }

    // Cache the loaded config
    setValueWithExpiration(cacheKey, data, cacheTTL);

    // Store in memory map temporarily for in-flight coordination
    loadedConfigs.set(loadingKey, data);

    // Remove from loading set
    configsLoadingInProgress.delete(loadingKey);

    log('jsonConfigLoader.js', 'loadJsonConfig', 'success', `Config loaded and cached: ${configName}`, {
      configName,
      dataType: Array.isArray(data) ? 'array' : typeof data
    });

    if (window.performanceTracker) {
      try {
        window.performanceTracker.step({
          step: 'loadJsonConfig_complete',
          file: 'jsonConfigLoader.js',
          method: 'loadJsonConfig',
          flag: 'config-loaded',
          purpose: `Config loaded: ${configName}`
        });
      } catch (e) {
        // Performance tracker session ended, ignore
      }
    }

    // Clean up loadedConfigs after a short delay to allow waiters to finish
    // This prevents unbounded growth while still coordinating concurrent loads
    setTimeout(() => {
      loadedConfigs.delete(loadingKey);
      log('jsonConfigLoader.js', 'loadJsonConfig', 'cleanup', 'Cleaned up in-flight coordination entry', { loadingKey });
    }, 1000);

    log('jsonConfigLoader.js', 'loadJsonConfig', 'return', 'Returning loaded data', { success: true });
    return {
      success: true,
      data,
      error: null
    };

  } catch (error) {
    logError('jsonConfigLoader.js', 'loadJsonConfig', `Failed to load config: ${configName}`, error, {
      path,
      configName
    });

    // Remove from loading set
    configsLoadingInProgress.delete(loadingKey);

    if (window.performanceTracker) {
      try {
        window.performanceTracker.step({
          step: 'loadJsonConfig_exception',
          file: 'jsonConfigLoader.js',
          method: 'loadJsonConfig',
          flag: 'config-exception',
          purpose: `Exception loading config: ${error.message}`
        });
      } catch (e) {
        // Performance tracker session ended, ignore
      }
    }

    log('jsonConfigLoader.js', 'loadJsonConfig', 'return', 'Returning exception error', { success: false });
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
}

/**
 * Wait for an in-progress config load to complete
 * 
 * @param {string} loadingKey - Key of config being loaded
 * @param {string} configName - Config name for logging
 * @returns {Promise<object>} - Load result { success: boolean, data: any, error: string|null }
 */
async function waitForConfigLoad(loadingKey, configName) {
  log('jsonConfigLoader.js', 'waitForConfigLoad', 'start', 'Waiting for config load', { loadingKey, configName });

  // Poll until config is loaded or timeout
  const maxWaitTime = 10000; // 10 seconds
  const pollInterval = 100; // 100ms
  let waitedTime = 0;

  while (waitedTime < maxWaitTime) {
    // Check if config is now loaded
    if (loadedConfigs.has(loadingKey)) {
      const data = loadedConfigs.get(loadingKey);
      log('jsonConfigLoader.js', 'waitForConfigLoad', 'success', 'Config loaded by concurrent request', { loadingKey });
      log('jsonConfigLoader.js', 'waitForConfigLoad', 'return', 'Returning loaded config', { success: true });
      return {
        success: true,
        data,
        error: null
      };
    }

    // Check if loading has finished (even if failed)
    if (!configsLoadingInProgress.has(loadingKey)) {
      log('jsonConfigLoader.js', 'waitForConfigLoad', 'warn', 'Loading finished but not in map', { loadingKey });
      log('jsonConfigLoader.js', 'waitForConfigLoad', 'return', 'Returning error - load completed without result', { success: false });
      return {
        success: false,
        data: null,
        error: 'Concurrent load completed without result'
      };
    }

    // Wait before checking again
    await new Promise(resolve => setTimeout(resolve, pollInterval));
    waitedTime += pollInterval;
  }

  // Timeout - return error
  log('jsonConfigLoader.js', 'waitForConfigLoad', 'error', 'Config load timeout', {
    loadingKey,
    configName,
    waitedTime
  });
  log('jsonConfigLoader.js', 'waitForConfigLoad', 'return', 'Returning timeout error', { success: false });
  return {
    success: false,
    data: null,
    error: `Config load timeout after ${waitedTime}ms`
  };
}

/**
 * Load JSON configuration from static import
 * For configs that are imported at build time
 * 
 * @param {any} importedData - Data imported via import statement
 * @param {object} options - Load options
 * @param {string} options.configName - Name for logging and caching (required)
 * @param {number} options.cacheTTL - Cache TTL in milliseconds (default: 1 hour)
 * @param {boolean} options.skipValidation - Skip JSON validation (default: false)
 * @param {Function} options.validator - Custom validator function
 * @returns {object} - Result { success: boolean, data: any, error: string|null }
 */
export function loadJsonConfigFromImport(importedData, options = {}) {
  const {
    configName = 'imported_config',
    cacheTTL = JSON_CONFIG_DEFAULT_CACHE_TTL,
    skipValidation = false,
    validator = null
  } = options;

  log('jsonConfigLoader.js', 'loadJsonConfigFromImport', 'start', `Loading JSON config from import: ${configName}`, {
    configName,
    dataType: Array.isArray(importedData) ? 'array' : typeof importedData
  });

  if (window.performanceTracker) {
    try {
      window.performanceTracker.step({
        step: 'loadJsonConfigFromImport_start',
        file: 'jsonConfigLoader.js',
        method: 'loadJsonConfigFromImport',
        flag: 'import-load',
        purpose: `Load imported config: ${configName}`
      });
    } catch (e) {
      // Performance tracker session ended, ignore
    }
  }

  try {
    // Validate JSON data (unless skipValidation is true)
    if (!skipValidation) {
      const validation = validateJsonData(importedData, configName);

      if (!validation.valid) {
        log('jsonConfigLoader.js', 'loadJsonConfigFromImport', 'error', 'JSON validation failed', {
          configName,
          error: validation.error
        });

        log('jsonConfigLoader.js', 'loadJsonConfigFromImport', 'return', 'Returning validation error', { success: false });
        return {
          success: false,
          data: null,
          error: `Validation failed: ${validation.error}`
        };
      }

      // Run custom validator if provided
      if (validator && typeof validator === 'function') {
        log('jsonConfigLoader.js', 'loadJsonConfigFromImport', 'info', 'Running custom validator', { configName });

        try {
          const customValidation = validator(importedData);

          if (customValidation && !customValidation.valid) {
            log('jsonConfigLoader.js', 'loadJsonConfigFromImport', 'warn', 'Custom validation returned warnings', {
              configName,
              errorCount: customValidation.errors?.length || 0,
              warningCount: customValidation.warnings?.length || 0
            });

            // Log errors and warnings but don't fail
            if (customValidation.errors?.length > 0) {
              log('jsonConfigLoader.js', 'loadJsonConfigFromImport', 'error', 'Custom validation errors', {
                configName,
                errors: customValidation.errors
              });
            }

            if (customValidation.warnings?.length > 0) {
              log('jsonConfigLoader.js', 'loadJsonConfigFromImport', 'warn', 'Custom validation warnings', {
                configName,
                warnings: customValidation.warnings
              });
            }
          }
        } catch (validatorError) {
          logError('jsonConfigLoader.js', 'loadJsonConfigFromImport', 'Custom validator threw exception', validatorError, {
            configName
          });
          // Continue despite validator error
        }
      }
    }

    // Cache the loaded config
    const cacheKey = JSON_CONFIG_CACHE_KEY_PREFIX + configName;
    setValueWithExpiration(cacheKey, importedData, cacheTTL);

    log('jsonConfigLoader.js', 'loadJsonConfigFromImport', 'success', `Config loaded and cached: ${configName}`, {
      configName,
      dataType: Array.isArray(importedData) ? 'array' : typeof importedData
    });

    if (window.performanceTracker) {
      try {
        window.performanceTracker.step({
          step: 'loadJsonConfigFromImport_complete',
          file: 'jsonConfigLoader.js',
          method: 'loadJsonConfigFromImport',
          flag: 'import-loaded',
          purpose: `Imported config loaded: ${configName}`
        });
      } catch (e) {
        // Performance tracker session ended, ignore
      }
    }

    log('jsonConfigLoader.js', 'loadJsonConfigFromImport', 'return', 'Returning imported data', { success: true });
    return {
      success: true,
      data: importedData,
      error: null
    };

  } catch (error) {
    logError('jsonConfigLoader.js', 'loadJsonConfigFromImport', `Failed to load imported config: ${configName}`, error, {
      configName
    });

    if (window.performanceTracker) {
      try {
        window.performanceTracker.step({
          step: 'loadJsonConfigFromImport_exception',
          file: 'jsonConfigLoader.js',
          method: 'loadJsonConfigFromImport',
          flag: 'import-exception',
          purpose: `Exception loading imported config: ${error.message}`
        });
      } catch (e) {
        // Performance tracker session ended, ignore
      }
    }

    log('jsonConfigLoader.js', 'loadJsonConfigFromImport', 'return', 'Returning exception error', { success: false });
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
}

/**
 * Clear config cache for a specific config
 * Actually removes entries from both cacheHandler and loadedConfigs
 * 
 * @param {string} configName - Name of config to clear
 * @returns {boolean} - True if cache was cleared
 */
export function clearConfigCache(configName) {
  log('jsonConfigLoader.js', 'clearConfigCache', 'start', `Clearing cache for config: ${configName}`, { configName });

  const cacheKey = JSON_CONFIG_CACHE_KEY_PREFIX + configName;

  // Actually remove from cache handler (not just check existence)
  const wasInCache = getValueFromCache(cacheKey) !== null;
  if (wasInCache) {
    removeFromCache(cacheKey);
  }

  // Clear from loaded configs map (all keys starting with configName)
  const loadedKeys = Array.from(loadedConfigs.keys()).filter(key => key.startsWith(configName));
  loadedKeys.forEach(key => loadedConfigs.delete(key));

  log('jsonConfigLoader.js', 'clearConfigCache', 'success', 'Config cache cleared', {
    configName,
    clearedFromCache: wasInCache,
    clearedLoadedCount: loadedKeys.length
  });
  log('jsonConfigLoader.js', 'clearConfigCache', 'return', 'Returning cleared status', { cleared: wasInCache });

  return wasInCache;
}

/**
 * Get statistics about loaded configs
 * 
 * @returns {object} - Statistics { loadedCount, loadedConfigs, loadingInProgress }
 */
export function getConfigStatistics() {
  const stats = {
    loadedCount: loadedConfigs.size,
    loadedConfigs: Array.from(loadedConfigs.keys()),
    loadingInProgress: Array.from(configsLoadingInProgress)
  };

  log('jsonConfigLoader.js', 'getConfigStatistics', 'return', 'Returning config statistics', stats);
  return stats;
}

