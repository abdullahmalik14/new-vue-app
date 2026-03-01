/**
 * JSON Config Loader (Node.js) - Global utility for loading and caching JSON configurations
 * 
 * Node.js version for build scripts and server-side configuration loading.
 * Handles both absolute and relative paths with validation and caching.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, isAbsolute, join, dirname } from 'path';
import { fileURLToPath } from 'url';

// In-memory cache for Node.js context
const configCache = new Map();

// Track which configs are currently loading to prevent duplicates
const configsLoadingInProgress = new Set();

/**
 * Validate that JSON data is properly formatted
 * 
 * @param {any} data - Parsed JSON data to validate
 * @param {string} configName - Name of config for logging
 * @returns {object} - Validation result { valid: boolean, error: string|null }
 */
function validateJsonData(data, configName) {
  console.log(`[jsonConfigLoaderNode] Validating JSON data for ${configName}`);

  // Check if data is null or undefined
  if (data === null || data === undefined) {
    console.error(`[jsonConfigLoaderNode] JSON data is null or undefined for ${configName}`);
    return {
      valid: false,
      error: 'JSON data is null or undefined'
    };
  }

  // Check for basic JSON types
  const dataType = typeof data;
  if (dataType !== 'object' && !Array.isArray(data)) {
    console.error(`[jsonConfigLoaderNode] JSON data is not an object or array for ${configName}: ${dataType}`);
    return {
      valid: false,
      error: `JSON data must be an object or array, received: ${dataType}`
    };
  }

  console.log(`[jsonConfigLoaderNode] JSON data is valid for ${configName}`);
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
  console.log(`[jsonConfigLoaderNode] Parsing JSON string for ${configName}`);

  if (typeof jsonString !== 'string') {
    console.error(`[jsonConfigLoaderNode] Input is not a string for ${configName}`);
    return {
      success: false,
      data: null,
      error: 'Input must be a string'
    };
  }

  try {
    const parsed = JSON.parse(jsonString);
    console.log(`[jsonConfigLoaderNode] Successfully parsed JSON for ${configName}`);
    return {
      success: true,
      data: parsed,
      error: null
    };
  } catch (error) {
    console.error(`[jsonConfigLoaderNode] Failed to parse JSON for ${configName}:`, error.message);
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
}

/**
 * Resolve path to absolute file path
 * Handles both absolute and relative paths
 * 
 * @param {string} path - Path to resolve
 * @param {string} basePath - Base path for relative resolution (defaults to current working directory)
 * @returns {string} - Resolved absolute path
 */
function resolvePath(path, basePath = process.cwd()) {
  console.log(`[jsonConfigLoaderNode] Resolving path: ${path}`);

  // If already absolute path, return as-is
  if (isAbsolute(path)) {
    console.log(`[jsonConfigLoaderNode] Path is already absolute: ${path}`);
    return path;
  }

  // Relative path - resolve relative to base path
  const resolved = resolve(basePath, path);
  console.log(`[jsonConfigLoaderNode] Resolved relative path: ${path} -> ${resolved}`);
  return resolved;
}

/**
 * Load JSON configuration from file path with caching
 * Handles both absolute and relative paths
 * Validates JSON format before caching
 * 
 * @param {string} path - Path to JSON file (absolute or relative)
 * @param {object} options - Load options
 * @param {string} options.configName - Name for logging and caching (required)
 * @param {string} options.basePath - Base path for relative resolution (default: process.cwd())
 * @param {boolean} options.skipCache - Skip cache and force fresh load (default: false)
 * @param {boolean} options.skipValidation - Skip JSON validation (default: false)
 * @param {Function} options.validator - Custom validator function (data) => { valid, errors, warnings }
 * @returns {object} - Result { success: boolean, data: any, error: string|null }
 */
export function loadJsonConfig(path, options = {}) {
  const {
    configName = 'unknown_config',
    basePath = process.cwd(),
    skipCache = false,
    skipValidation = false,
    validator = null
  } = options;

  console.log(`[jsonConfigLoaderNode] Loading JSON config: ${configName} from ${path}`);

  // Validate path is provided
  if (!path || typeof path !== 'string') {
    console.error(`[jsonConfigLoaderNode] Invalid path provided for ${configName}`);
    return {
      success: false,
      data: null,
      error: 'Path must be a non-empty string'
    };
  }

  // Build cache key
  const cacheKey = `${configName}_${path}`;

  // Check cache first (unless skipCache is true)
  if (!skipCache && configCache.has(cacheKey)) {
    const cachedData = configCache.get(cacheKey);
    console.log(`[jsonConfigLoaderNode] Config loaded from cache: ${configName}`);
    return {
      success: true,
      data: cachedData,
      error: null
    };
  }

  // Check if already loading this config
  if (configsLoadingInProgress.has(cacheKey)) {
    console.warn(`[jsonConfigLoaderNode] Config load already in progress for ${configName}`);
    return {
      success: false,
      data: null,
      error: 'Config load already in progress'
    };
  }

  // Mark as loading
  configsLoadingInProgress.add(cacheKey);

  try {
    // Resolve path to absolute
    const resolvedPath = resolvePath(path, basePath);

    // Check if file exists
    if (!existsSync(resolvedPath)) {
      console.error(`[jsonConfigLoaderNode] File not found: ${resolvedPath}`);
      configsLoadingInProgress.delete(cacheKey);
      return {
        success: false,
        data: null,
        error: `File not found: ${resolvedPath}`
      };
    }

    // Read file contents
    let fileContents;
    try {
      fileContents = readFileSync(resolvedPath, 'utf-8');
    } catch (readError) {
      console.error(`[jsonConfigLoaderNode] Failed to read file ${resolvedPath}:`, readError.message);
      configsLoadingInProgress.delete(cacheKey);
      return {
        success: false,
        data: null,
        error: `Failed to read file: ${readError.message}`
      };
    }

    // Parse JSON
    const parseResult = parseJsonString(fileContents, configName);
    if (!parseResult.success) {
      console.error(`[jsonConfigLoaderNode] Failed to parse JSON for ${configName}`);
      configsLoadingInProgress.delete(cacheKey);
      return {
        success: false,
        data: null,
        error: parseResult.error
      };
    }

    const data = parseResult.data;

    // Validate JSON data (unless skipValidation is true)
    if (!skipValidation) {
      const validation = validateJsonData(data, configName);

      if (!validation.valid) {
        console.error(`[jsonConfigLoaderNode] JSON validation failed for ${configName}:`, validation.error);
        configsLoadingInProgress.delete(cacheKey);
        return {
          success: false,
          data: null,
          error: `Validation failed: ${validation.error}`
        };
      }

      // Run custom validator if provided
      if (validator && typeof validator === 'function') {
        console.log(`[jsonConfigLoaderNode] Running custom validator for ${configName}`);

        try {
          const customValidation = validator(data);

          if (customValidation && !customValidation.valid) {
            const errorCount = customValidation.errors?.length || 0;
            const warningCount = customValidation.warnings?.length || 0;

            console.warn(`[jsonConfigLoaderNode] Custom validation warnings for ${configName}: ${errorCount} errors, ${warningCount} warnings`);

            // Log errors and warnings but don't fail
            if (customValidation.errors?.length > 0) {
              console.error(`[jsonConfigLoaderNode] Custom validation errors for ${configName}:`, customValidation.errors);
            }

            if (customValidation.warnings?.length > 0) {
              console.warn(`[jsonConfigLoaderNode] Custom validation warnings for ${configName}:`, customValidation.warnings);
            }
          }
        } catch (validatorError) {
          console.error(`[jsonConfigLoaderNode] Custom validator threw exception for ${configName}:`, validatorError.message);
          // Continue despite validator error
        }
      }
    }

    // Cache the loaded config
    configCache.set(cacheKey, data);

    // Remove from loading set
    configsLoadingInProgress.delete(cacheKey);

    console.log(`[jsonConfigLoaderNode] Config loaded and cached: ${configName}`);

    // Note: Unlike browser version, we keep configCache entries for build performance
    // since Node build scripts are typically single-threaded and sequential
    // clearConfigCache() properly removes entries when needed

    return {
      success: true,
      data,
      error: null
    };

  } catch (error) {
    console.error(`[jsonConfigLoaderNode] Failed to load config ${configName}:`, error.message);
    configsLoadingInProgress.delete(cacheKey);
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
}

/**
 * Load JSON configuration synchronously (for build scripts)
 * Similar to loadJsonConfig but returns data directly or throws
 * 
 * @param {string} path - Path to JSON file
 * @param {object} options - Load options (same as loadJsonConfig)
 * @returns {any} - Parsed JSON data
 * @throws {Error} - If loading or validation fails
 */
export function loadJsonConfigSync(path, options = {}) {
  const result = loadJsonConfig(path, options);

  if (!result.success) {
    throw new Error(result.error || 'Failed to load JSON config');
  }

  return result.data;
}

/**
 * Clear config cache for a specific config
 * 
 * @param {string} configName - Name of config to clear (clears all entries starting with this name)
 * @returns {number} - Number of cache entries cleared
 */
export function clearConfigCache(configName) {
  console.log(`[jsonConfigLoaderNode] Clearing cache for config: ${configName}`);

  let clearedCount = 0;
  const keysToDelete = [];

  for (const key of configCache.keys()) {
    if (key.startsWith(configName)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => {
    configCache.delete(key);
    clearedCount++;
  });

  console.log(`[jsonConfigLoaderNode] Cleared ${clearedCount} cache entries for ${configName}`);
  return clearedCount;
}

/**
 * Clear all config cache
 * 
 * @returns {number} - Number of cache entries cleared
 */
export function clearAllConfigCache() {
  console.log('[jsonConfigLoaderNode] Clearing all config cache');
  const count = configCache.size;
  configCache.clear();
  console.log(`[jsonConfigLoaderNode] Cleared ${count} cache entries`);
  return count;
}

/**
 * Get statistics about loaded configs
 * 
 * @returns {object} - Statistics { loadedCount, loadedConfigs, loadingInProgress }
 */
export function getConfigStatistics() {
  const stats = {
    loadedCount: configCache.size,
    loadedConfigs: Array.from(configCache.keys()),
    loadingInProgress: Array.from(configsLoadingInProgress)
  };

  console.log('[jsonConfigLoaderNode] Config statistics:', stats);
  return stats;
}

