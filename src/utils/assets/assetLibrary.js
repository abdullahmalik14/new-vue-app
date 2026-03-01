/**
 * AssetLibrary - Centralized repository for managing assets
 * 
 * Provides two main functionalities:
 * 
 * 1. Section-based asset loading:
 *    - Bundle paths (JS, CSS) from section manifest
 *    - Asset preload configurations from route configs
 *    - Section-specific asset metadata
 * 
 * 2. Flag-to-URL asset mapping:
 *    - Map asset flags (e.g., "icon.cart") to absolute URLs
 *    - Environment-specific configurations (development, staging, production)
 *    - Inheritance: dev/staging fall back to production
 *    - Caching for performance
 * 
 * All operations tracked with global window.performanceTracker.
 */

import { log } from '../common/logHandler.js';
import { logError } from '../common/errorHandler.js';
import { getValueFromCache, setValueWithExpiration, clearAllCache } from '../common/cacheHandler.js';
import { loadSectionManifest, getSectionBundlePaths } from '../build/manifestLoader.js';
import { getRouteConfiguration } from '../route/routeConfigLoader.js';

// ============================================================================
// SECTION-BASED ASSET LOADING
// ============================================================================

// Cache configuration for asset metadata
const ASSET_CACHE_KEY_PREFIX = 'asset_metadata_';
const ASSET_CACHE_TTL = 3600000; // 1 hour

// Track which assets are currently loading to prevent duplicates
const assetsLoadingInProgress = new Set();

// Track loaded assets in memory
const loadedAssets = new Map();

// In-memory manifest cache
let cachedManifest = null;

// ============================================================================
// FLAG-TO-URL ASSET MAPPING
// ============================================================================

// Cache configuration for asset map
const ASSET_MAP_CACHE_KEY = 'asset_map_config';
const ASSET_MAP_CACHE_TTL = 3600000; // 1 hour
const ASSET_URL_CACHE_PREFIX = 'asset_url_';
const ASSET_URL_CACHE_TTL = 1800000; // 30 minutes

// In-memory cache for asset map
let cachedAssetMap = null;
let assetMapLoadPromise = null;

// Current environment
let currentEnvironment = null;

/**
 * Get or load the section manifest
 * Caches manifest for reuse across asset loads
 * 
 * @returns {Promise<object>} - Section manifest
 */
async function getManifest() {
  log('assetLibrary.js', 'getManifest', 'start', 'Getting section manifest', {});

  if (cachedManifest) {
    log('assetLibrary.js', 'getManifest', 'cache-hit', 'Returning cached manifest', {});
    return cachedManifest;
  }

  try {
    cachedManifest = await loadSectionManifest();
    log('assetLibrary.js', 'getManifest', 'success', 'Manifest loaded', {
      sectionCount: Object.keys(cachedManifest).length
    });
    return cachedManifest;
  } catch (error) {
    logError('assetLibrary.js', 'getManifest', 'Failed to load manifest', error);
    return {};
  }
}

/**
 * Extract asset preload configuration from route config for a section
 * 
 * @param {string} sectionName - Section name
 * @returns {Array<object>} - Array of asset preload configurations
 */
function getAssetPreloadConfigForSection(sectionName) {
  log('assetLibrary.js', 'getAssetPreloadConfigForSection', 'start', 'Getting asset preload config', { sectionName });

  try {
    const routes = getRouteConfiguration();
    const sectionRoutes = routes.filter(route => {
      if (typeof route.section === 'string') {
        return route.section === sectionName;
      }
      if (typeof route.section === 'object') {
        return Object.values(route.section).includes(sectionName);
      }
      return false;
    });

    log('assetLibrary.js', 'getAssetPreloadConfigForSection', 'info', 'Section routes found', {
      sectionName,
      routeCount: sectionRoutes.length
    });

    // Collect all asset preload configs from routes
    const assetConfigs = [];
    for (const route of sectionRoutes) {
      if (route.assetPreload && Array.isArray(route.assetPreload)) {
        assetConfigs.push(...route.assetPreload);
      }
    }

    log('assetLibrary.js', 'getAssetPreloadConfigForSection', 'success', 'Asset preload configs collected', {
      sectionName,
      assetCount: assetConfigs.length
    });

    return assetConfigs;
  } catch (error) {
    logError('assetLibrary.js', 'getAssetPreloadConfigForSection', 'Failed to get asset preload config', error, { sectionName });
    return [];
  }
}

/**
 * Load assets for a specific section
 * Includes bundle paths, asset preload configs, and metadata
 * 
 * @param {string} sectionName - Section to load assets for
 * @returns {Promise<object>} - Asset metadata object
 */
export async function loadAssetsForSection(sectionName) {
  log('assetLibrary.js', 'loadAssetsForSection', 'start', 'Loading assets for section', { sectionName });

  if (typeof sectionName !== 'string' || sectionName.trim().length === 0) {
    log('assetLibrary.js', 'loadAssetsForSection', 'error', 'Invalid section name', { sectionName });
    return {};
  }

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'loadSectionAssets',
      file: 'assetLibrary.js',
      method: 'loadAssetsForSection',
      flag: 'load',
      purpose: `Load assets for section: ${sectionName}`
    });
  }

  // Create cache key
  const cacheKey = ASSET_CACHE_KEY_PREFIX + sectionName;

  // Check cache first
  const cachedAssets = getValueFromCache(cacheKey);
  if (cachedAssets) {
    log('assetLibrary.js', 'loadAssetsForSection', 'cache-hit', 'Assets loaded from cache', { sectionName });

    if (window.performanceTracker) {
      window.performanceTracker.step({
        step: 'assetCacheHit',
        file: 'assetLibrary.js',
        method: 'loadAssetsForSection',
        flag: 'cache-hit',
        purpose: `Assets found in cache for ${sectionName}`
      });
    }

    return cachedAssets;
  }

  // Check if already loading
  const loadingKey = `asset_${sectionName}`;
  if (assetsLoadingInProgress.has(loadingKey)) {
    log('assetLibrary.js', 'loadAssetsForSection', 'in-progress', 'Asset load already in progress, waiting', { sectionName });

    // Wait for existing load to complete
    const result = await waitForAssetLoad(loadingKey);
    return result;
  }

  // Mark as loading
  assetsLoadingInProgress.add(loadingKey);

  try {
    // Load manifest to get bundle paths
    const manifest = await getManifest();
    const bundlePaths = await getSectionBundlePaths(sectionName, manifest);

    // Get asset preload configurations
    const assetPreloadConfigs = getAssetPreloadConfigForSection(sectionName);

    // Build asset metadata
    const assets = {
      sectionName,
      bundlePaths: bundlePaths || { js: null, css: null },
      assetPreloadConfigs: assetPreloadConfigs || [],
      manifestEntry: manifest[sectionName] || null,
      loadedAt: new Date().toISOString(),
      state: 'loaded'
    };

    log('assetLibrary.js', 'loadAssetsForSection', 'success', 'Assets loaded for section', {
      sectionName,
      hasBundle: !!bundlePaths,
      preloadAssetCount: assetPreloadConfigs.length
    });

    // Cache the loaded assets
    setValueWithExpiration(cacheKey, assets, ASSET_CACHE_TTL);

    // Store in memory map
    loadedAssets.set(sectionName, assets);

    if (window.performanceTracker) {
      window.performanceTracker.step({
        step: 'assetsLoaded',
        file: 'assetLibrary.js',
        method: 'loadAssetsForSection',
        flag: 'load-complete',
        purpose: `Assets loaded for ${sectionName}`
      });
    }

    return assets;

  } catch (error) {
    logError('assetLibrary.js', 'loadAssetsForSection', 'Failed to load assets', error, { sectionName });
    return {
      sectionName,
      bundlePaths: { js: null, css: null },
      assetPreloadConfigs: [],
      manifestEntry: null,
      loadedAt: new Date().toISOString(),
      state: 'error',
      error: error.message
    };
  } finally {
    // Remove from loading set
    assetsLoadingInProgress.delete(loadingKey);
  }
}

/**
 * Wait for an in-progress asset load to complete
 * 
 * @param {string} loadingKey - Key of asset being loaded
 * @returns {Promise<object>} - Loaded assets
 */
async function waitForAssetLoad(loadingKey) {
  log('assetLibrary.js', 'waitForAssetLoad', 'start', 'Waiting for asset load', { loadingKey });

  // Extract section name from loading key
  const sectionName = loadingKey.replace('asset_', '');

  // Poll until asset is loaded or timeout
  const maxWaitTime = 5000; // 5 seconds
  const pollInterval = 100; // 100ms
  let waitedTime = 0;

  while (waitedTime < maxWaitTime) {
    // Check if asset is now loaded
    if (loadedAssets.has(sectionName)) {
      const result = loadedAssets.get(sectionName);
      log('assetLibrary.js', 'waitForAssetLoad', 'return', 'Returning loaded asset', { sectionName });
      return result;
    }

    // Check if loading has finished (even if failed)
    if (!assetsLoadingInProgress.has(loadingKey)) {
      log('assetLibrary.js', 'waitForAssetLoad', 'warn', 'Loading finished but not in map', { loadingKey });
      return {
        sectionName,
        bundlePaths: { js: null, css: null },
        assetPreloadConfigs: [],
        manifestEntry: null,
        state: 'error'
      };
    }

    // Wait before checking again
    await new Promise(resolve => setTimeout(resolve, pollInterval));
    waitedTime += pollInterval;
  }

  // Timeout - return empty object
  log('assetLibrary.js', 'waitForAssetLoad', 'warn', 'Asset load timeout', { loadingKey, waitedTime });
  return {
    sectionName,
    bundlePaths: { js: null, css: null },
    assetPreloadConfigs: [],
    manifestEntry: null,
    state: 'timeout'
  };
}

/**
 * Preload assets for multiple sections
 * Loads assets in parallel for better performance
 * 
 * @param {Array<string>} sectionNames - Array of section names
 * @returns {Promise<object>} - Map of section name to assets
 */
export async function preloadAssetsForSections(sectionNames) {
  log('assetLibrary.js', 'preloadAssetsForSections', 'start', 'Preloading assets for sections', {
    sectionCount: sectionNames.length,
    sections: sectionNames
  });

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'preloadBatchAssets',
      file: 'assetLibrary.js',
      method: 'preloadAssetsForSections',
      flag: 'batch-preload',
      purpose: `Preload assets for ${sectionNames.length} sections`
    });
  }

  // Load all sections in parallel
  const loadPromises = sectionNames.map(sectionName =>
    loadAssetsForSection(sectionName)
      .then(assets => ({ sectionName, assets, success: true }))
      .catch(error => {
        logError('assetLibrary.js', 'preloadAssetsForSections', 'Section asset load failed', error, { sectionName });
        return {
          sectionName,
          assets: {
            sectionName,
            bundlePaths: { js: null, css: null },
            assetPreloadConfigs: [],
            manifestEntry: null,
            state: 'error'
          },
          success: false,
          error
        };
      })
  );

  // Wait for all loads to complete
  const results = await Promise.all(loadPromises);

  // Build result map
  const assetsMap = {};
  results.forEach(result => {
    assetsMap[result.sectionName] = result.assets;
  });

  // Count successes
  const successCount = results.filter(r => r.success).length;

  log('assetLibrary.js', 'preloadAssetsForSections', 'info', 'Batch asset preload completed', {
    totalSections: sectionNames.length,
    successful: successCount,
    failed: sectionNames.length - successCount
  });

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'batchAssetsLoaded',
      file: 'assetLibrary.js',
      method: 'preloadAssetsForSections',
      flag: 'batch-complete',
      purpose: `Loaded ${successCount}/${sectionNames.length} section assets`
    });
  }

  return assetsMap;
}

/**
 * Get assets for a section (from cache/memory only, doesn't load)
 * 
 * @param {string} sectionName - Section name
 * @returns {object|null} - Asset metadata or null if not loaded
 */
export function getAssetsForSection(sectionName) {
  log('assetLibrary.js', 'getAssetsForSection', 'start', 'Getting assets for section', { sectionName });

  // Check memory first
  if (loadedAssets.has(sectionName)) {
    const assets = loadedAssets.get(sectionName);
    log('assetLibrary.js', 'getAssetsForSection', 'memory-hit', 'Assets found in memory', { sectionName });
    return assets;
  }

  // Check cache
  const cacheKey = ASSET_CACHE_KEY_PREFIX + sectionName;
  const cachedAssets = getValueFromCache(cacheKey);

  if (cachedAssets) {
    log('assetLibrary.js', 'getAssetsForSection', 'cache-hit', 'Assets found in cache', { sectionName });
    // Also store in memory for faster subsequent access
    loadedAssets.set(sectionName, cachedAssets);
    return cachedAssets;
  }

  log('assetLibrary.js', 'getAssetsForSection', 'not-found', 'Assets not loaded for section', { sectionName });
  return null;
}

/**
 * Check if assets are loaded for a section
 * 
 * @param {string} sectionName - Section name
 * @returns {boolean} - True if assets are loaded
 */
export function areAssetsLoadedForSection(sectionName) {
  const loaded = loadedAssets.has(sectionName);
  log('assetLibrary.js', 'areAssetsLoadedForSection', 'return', 'Returning loaded status', { sectionName, loaded });
  return loaded;
}

/**
 * Get the loading state of a section's assets
 * 
 * @param {string} sectionName - Section name
 * @returns {string} - Loading state: 'not-loaded', 'loading', 'loaded', 'error'
 */
export function getAssetLoadingState(sectionName) {
  log('assetLibrary.js', 'getAssetLoadingState', 'start', 'Getting asset loading state', { sectionName });

  // Check if loading
  const loadingKey = `asset_${sectionName}`;
  if (assetsLoadingInProgress.has(loadingKey)) {
    log('assetLibrary.js', 'getAssetLoadingState', 'return', 'Assets are loading', { sectionName, state: 'loading' });
    return 'loading';
  }

  // Check if loaded
  const assets = getAssetsForSection(sectionName);
  if (assets) {
    const state = assets.state || 'loaded';
    log('assetLibrary.js', 'getAssetLoadingState', 'return', 'Assets state', { sectionName, state });
    return state;
  }

  log('assetLibrary.js', 'getAssetLoadingState', 'return', 'Assets not loaded', { sectionName, state: 'not-loaded' });
  return 'not-loaded';
}

/**
 * Clear all asset caches
 * Useful for development or testing
 * 
 * @returns {void}
 */
export function clearAssetCaches() {
  log('assetLibrary.js', 'clearAssetCaches', 'start', 'Clearing all asset caches', {});

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'clearAssetCache',
      file: 'assetLibrary.js',
      method: 'clearAssetCaches',
      flag: 'cache-clear',
      purpose: 'Clear all asset caches'
    });
  }

  // Clear in-memory Map
  const mapCount = loadedAssets.size;
  loadedAssets.clear();

  // Clear cached manifest
  cachedManifest = null;

  // Also clear cacheHandler (which has TTL-based caching)
  clearAllCache();

  log('assetLibrary.js', 'clearAssetCaches', 'success', 'Asset caches cleared', {
    mapCount,
    note: 'Both loadedAssets Map, manifest, and cacheHandler cleared'
  });
}

/**
 * Get asset library statistics
 * 
 * @returns {object} - Statistics about loaded assets
 */
export function getAssetStatistics() {
  const stats = {
    loadedCount: loadedAssets.size,
    loadedSections: Array.from(loadedAssets.keys()),
    loadingInProgress: Array.from(assetsLoadingInProgress).map(key => key.replace('asset_', '')),
    manifestCached: !!cachedManifest
  };

  log('assetLibrary.js', 'getAssetStatistics', 'return', 'Returning asset statistics', stats);
  return stats;
}

/**
 * Unload assets for sections not in the provided keep list
 * Useful for memory optimization - keeps only current and preloaded sections
 * 
 * @param {Array<string>} sectionsToKeep - Array of section names to keep in memory
 * @returns {number} - Number of sections unloaded
 */
export function unloadUnusedSections(sectionsToKeep = []) {
  log('assetLibrary.js', 'unloadUnusedSections', 'start', 'Unloading unused sections', {
    keepCount: sectionsToKeep.length,
    sectionsToKeep
  });

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'unloadUnusedSections',
      file: 'assetLibrary.js',
      method: 'unloadUnusedSections',
      flag: 'cleanup',
      purpose: `Keep ${sectionsToKeep.length} sections, unload others`
    });
  }

  let unloadedCount = 0;
  const keysToDelete = [];

  // Find sections to unload
  for (const sectionName of loadedAssets.keys()) {
    if (!sectionsToKeep.includes(sectionName)) {
      keysToDelete.push(sectionName);
    }
  }

  // Unload sections
  keysToDelete.forEach(sectionName => {
    loadedAssets.delete(sectionName);

    // Also clear from cache
    const cacheKey = ASSET_CACHE_KEY_PREFIX + sectionName;
    // Note: cacheHandler doesn't expose individual key deletion, but TTL will handle it

    unloadedCount++;
  });

  log('assetLibrary.js', 'unloadUnusedSections', 'success', 'Unused sections unloaded', {
    unloadedCount,
    remainingCount: loadedAssets.size,
    unloadedSections: keysToDelete
  });

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'unusedSectionsUnloaded',
      file: 'assetLibrary.js',
      method: 'unloadUnusedSections',
      flag: 'complete',
      purpose: `Unloaded ${unloadedCount} unused sections`
    });
  }

  return unloadedCount;
}

// ============================================================================
// FLAG-TO-URL ASSET MAPPING FUNCTIONS
// ============================================================================

/**
 * Detect the current environment
 * 
 * @returns {string} - Environment name: 'development', 'staging', or 'production'
 */
function detectEnvironment() {
  if (currentEnvironment) {
    return currentEnvironment;
  }

  // Check Vite environment variables
  if (import.meta.env.DEV) {
    currentEnvironment = 'development';
  } else if (import.meta.env.MODE === 'staging') {
    currentEnvironment = 'staging';
  } else if (import.meta.env.PROD) {
    currentEnvironment = 'production';
  } else {
    // Fallback: check hostname patterns
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
      currentEnvironment = 'development';
    } else if (hostname.includes('staging') || hostname.includes('stg')) {
      currentEnvironment = 'staging';
    } else {
      currentEnvironment = 'production';
    }
  }

  log('assetLibrary.js', 'detectEnvironment', 'detected', 'Environment detected', {
    environment: currentEnvironment,
    hostname: window.location.hostname,
    mode: import.meta.env.MODE
  });

  return currentEnvironment;
}

/**
 * Set the current environment manually (useful for testing)
 * 
 * @param {string} env - Environment name
 * @returns {void}
 */
export function setEnvironment(env) {
  if (!['development', 'staging', 'production'].includes(env)) {
    logError('assetLibrary.js', 'setEnvironment', 'Invalid environment', new Error(`Unknown environment: ${env}`));
    return;
  }

  currentEnvironment = env;
  log('assetLibrary.js', 'setEnvironment', 'set', 'Environment manually set', { environment: env });

  // Clear asset map cache when environment changes
  cachedAssetMap = null;
}

/**
 * Get the current environment
 * 
 * @returns {string} - Current environment name
 */
export function getEnvironment() {
  return detectEnvironment();
}

/**
 * Load asset map configuration from JSON file
 * 
 * @returns {Promise<object>} - Asset map configuration
 */
async function loadAssetMapConfig() {
  log('assetLibrary.js', 'loadAssetMapConfig', 'start', 'Loading asset map configuration', {});

  // Return cached map if available
  if (cachedAssetMap) {
    log('assetLibrary.js', 'loadAssetMapConfig', 'memory-hit', 'Returning cached asset map from memory', {});
    return cachedAssetMap;
  }

  // Check cache
  const cachedConfig = getValueFromCache(ASSET_MAP_CACHE_KEY);
  if (cachedConfig) {
    log('assetLibrary.js', 'loadAssetMapConfig', 'cache-hit', 'Asset map loaded from cache', {});
    cachedAssetMap = cachedConfig;
    return cachedConfig;
  }

  // If already loading, wait for existing promise
  if (assetMapLoadPromise) {
    log('assetLibrary.js', 'loadAssetMapConfig', 'waiting', 'Asset map load in progress, waiting', {});
    return assetMapLoadPromise;
  }

  // Load from JSON file
  assetMapLoadPromise = (async () => {
    try {
      log('assetLibrary.js', 'loadAssetMapConfig', 'fetch', 'Fetching asset map from JSON file', {});

      const response = await fetch('/config/assetMap.json');

      if (!response.ok) {
        throw new Error(`Failed to fetch asset map: ${response.status} ${response.statusText}`);
      }

      const assetMap = await response.json();

      // Validate structure
      if (!assetMap || typeof assetMap !== 'object') {
        throw new Error('Invalid asset map structure');
      }

      // Ensure required environments exist
      if (!assetMap.production) {
        log('assetLibrary.js', 'loadAssetMapConfig', 'warn', 'No production environment in asset map', {});
        assetMap.production = {};
      }

      log('assetLibrary.js', 'loadAssetMapConfig', 'success', 'Asset map loaded successfully', {
        environments: Object.keys(assetMap),
        totalFlags: Object.keys(assetMap.production || {}).length
      });

      // Cache the loaded map
      cachedAssetMap = assetMap;
      setValueWithExpiration(ASSET_MAP_CACHE_KEY, assetMap, ASSET_MAP_CACHE_TTL);

      return assetMap;

    } catch (error) {
      logError('assetLibrary.js', 'loadAssetMapConfig', 'Failed to load asset map', error);

      // Return empty map on error
      const emptyMap = {
        development: {},
        staging: {},
        production: {}
      };

      cachedAssetMap = emptyMap;
      return emptyMap;

    } finally {
      assetMapLoadPromise = null;
    }
  })();

  return assetMapLoadPromise;
}

/**
 * Get asset URL for a given flag with environment inheritance
 * 
 * @param {string} flag - Asset flag (e.g., "icon.cart")
 * @param {string} [environment] - Optional environment override
 * @returns {Promise<string|null>} - Asset URL or null if not found
 */
export async function getAssetUrl(flag, environment = null) {
  log('assetLibrary.js', 'getAssetUrl', 'start', 'Getting asset URL', { flag, environment });

  if (!flag || typeof flag !== 'string') {
    log('assetLibrary.js', 'getAssetUrl', 'error', 'Invalid flag', { flag });
    return null;
  }

  // Determine environment
  const env = environment || detectEnvironment();

  // Check cache first
  const cacheKey = `${ASSET_URL_CACHE_PREFIX}${env}_${flag}`;
  const cachedUrl = getValueFromCache(cacheKey);
  if (cachedUrl) {
    log('assetLibrary.js', 'getAssetUrl', 'cache-hit', 'Asset URL from cache', { flag, url: cachedUrl });
    return cachedUrl;
  }

  try {
    // Load asset map
    const assetMap = await loadAssetMapConfig();

    // Try current environment first
    let url = assetMap[env]?.[flag];

    // If not found and not production, try production (inheritance)
    if (!url && env !== 'production') {
      url = assetMap.production?.[flag];
      log('assetLibrary.js', 'getAssetUrl', 'inheritance', 'Using production fallback', {
        flag,
        requestedEnv: env,
        fallbackEnv: 'production'
      });
    }

    if (url) {
      log('assetLibrary.js', 'getAssetUrl', 'success', 'Asset URL resolved', { flag, url, environment: env });

      // Cache the resolved URL
      setValueWithExpiration(cacheKey, url, ASSET_URL_CACHE_TTL);

      return url;
    }

    log('assetLibrary.js', 'getAssetUrl', 'not-found', 'Asset flag not found in any environment', {
      flag,
      environment: env,
      availableEnvironments: Object.keys(assetMap)
    });

    return null;

  } catch (error) {
    logError('assetLibrary.js', 'getAssetUrl', 'Error getting asset URL', error, { flag, environment: env });
    return null;
  }
}

/**
 * Get multiple asset URLs at once
 * 
 * @param {Array<string>} flags - Array of asset flags
 * @param {string} [environment] - Optional environment override
 * @returns {Promise<object>} - Map of flag to URL
 */
export async function getAssetUrls(flags, environment = null) {
  log('assetLibrary.js', 'getAssetUrls', 'start', 'Getting multiple asset URLs', {
    flagCount: flags.length,
    flags
  });

  if (!Array.isArray(flags)) {
    log('assetLibrary.js', 'getAssetUrls', 'error', 'Invalid flags array', { flags });
    return {};
  }

  try {
    // Load all URLs in parallel
    const urlPromises = flags.map(async (flag) => {
      const url = await getAssetUrl(flag, environment);
      return { flag, url };
    });

    const results = await Promise.all(urlPromises);

    // Build result map
    const urlMap = {};
    results.forEach(({ flag, url }) => {
      urlMap[flag] = url;
    });

    log('assetLibrary.js', 'getAssetUrls', 'success', 'Multiple asset URLs resolved', {
      total: flags.length,
      resolved: Object.values(urlMap).filter(Boolean).length,
      missing: Object.values(urlMap).filter(url => !url).length
    });

    return urlMap;

  } catch (error) {
    logError('assetLibrary.js', 'getAssetUrls', 'Error getting multiple asset URLs', error, { flags });
    return {};
  }
}

/**
 * Get all available asset flags for current environment
 * 
 * @param {string} [environment] - Optional environment override
 * @returns {Promise<Array<string>>} - Array of available flags
 */
export async function getAvailableAssetFlags(environment = null) {
  log('assetLibrary.js', 'getAvailableAssetFlags', 'start', 'Getting available asset flags', { environment });

  try {
    const env = environment || detectEnvironment();
    const assetMap = await loadAssetMapConfig();

    // Combine flags from current environment and production (for inheritance)
    const flags = new Set();

    // Add production flags (base)
    if (assetMap.production) {
      Object.keys(assetMap.production).forEach(flag => flags.add(flag));
    }

    // Add environment-specific flags
    if (assetMap[env]) {
      Object.keys(assetMap[env]).forEach(flag => flags.add(flag));
    }

    const flagArray = Array.from(flags).sort();

    log('assetLibrary.js', 'getAvailableAssetFlags', 'success', 'Available flags retrieved', {
      environment: env,
      count: flagArray.length
    });

    return flagArray;

  } catch (error) {
    logError('assetLibrary.js', 'getAvailableAssetFlags', 'Error getting available flags', error);
    return [];
  }
}

/**
 * Check if an asset flag exists
 * 
 * @param {string} flag - Asset flag to check
 * @param {string} [environment] - Optional environment override
 * @returns {Promise<boolean>} - True if flag exists
 */
export async function hasAssetFlag(flag, environment = null) {
  log('assetLibrary.js', 'hasAssetFlag', 'start', 'Checking if asset flag exists', { flag, environment });

  try {
    const url = await getAssetUrl(flag, environment);
    const exists = !!url;

    log('assetLibrary.js', 'hasAssetFlag', 'return', 'Asset flag existence check', { flag, exists });

    return exists;

  } catch (error) {
    logError('assetLibrary.js', 'hasAssetFlag', 'Error checking asset flag', error, { flag });
    return false;
  }
}

/**
 * Get all assets for a specific category (e.g., all "icon.*" flags)
 * 
 * @param {string} category - Category prefix (e.g., "icon", "logo", "image")
 * @param {string} [environment] - Optional environment override
 * @returns {Promise<object>} - Map of flag to URL for matching category
 */
export async function getAssetsByCategory(category, environment = null) {
  log('assetLibrary.js', 'getAssetsByCategory', 'start', 'Getting assets by category', { category, environment });

  if (!category || typeof category !== 'string') {
    log('assetLibrary.js', 'getAssetsByCategory', 'error', 'Invalid category', { category });
    return {};
  }

  try {
    const env = environment || detectEnvironment();
    const assetMap = await loadAssetMapConfig();

    const categoryPrefix = category.endsWith('.') ? category : `${category}.`;
    const matchingAssets = {};

    // Check current environment
    if (assetMap[env]) {
      Object.entries(assetMap[env]).forEach(([flag, url]) => {
        if (flag.startsWith(categoryPrefix)) {
          matchingAssets[flag] = url;
        }
      });
    }

    // Check production for inheritance
    if (env !== 'production' && assetMap.production) {
      Object.entries(assetMap.production).forEach(([flag, url]) => {
        if (flag.startsWith(categoryPrefix) && !matchingAssets[flag]) {
          matchingAssets[flag] = url;
        }
      });
    }

    log('assetLibrary.js', 'getAssetsByCategory', 'success', 'Assets by category retrieved', {
      category,
      count: Object.keys(matchingAssets).length
    });

    return matchingAssets;

  } catch (error) {
    logError('assetLibrary.js', 'getAssetsByCategory', 'Error getting assets by category', error, { category });
    return {};
  }
}

/**
 * Preload asset URLs into cache
 * 
 * @param {Array<string>} flags - Array of asset flags to preload
 * @param {string} [environment] - Optional environment override
 * @returns {Promise<number>} - Number of assets preloaded
 */
export async function preloadAssetUrls(flags, environment = null) {
  log('assetLibrary.js', 'preloadAssetUrls', 'start', 'Preloading asset URLs', {
    flagCount: flags.length,
    environment
  });

  if (!Array.isArray(flags)) {
    log('assetLibrary.js', 'preloadAssetUrls', 'error', 'Invalid flags array', { flags });
    return 0;
  }

  try {
    // Load all URLs (this will cache them)
    const urlMap = await getAssetUrls(flags, environment);
    const preloadedCount = Object.values(urlMap).filter(Boolean).length;

    log('assetLibrary.js', 'preloadAssetUrls', 'success', 'Asset URLs preloaded', {
      total: flags.length,
      preloaded: preloadedCount
    });

    return preloadedCount;

  } catch (error) {
    logError('assetLibrary.js', 'preloadAssetUrls', 'Error preloading asset URLs', error, { flags });
    return 0;
  }
}

/**
 * Validate asset map configuration
 * 
 * @returns {Promise<object>} - Validation result with errors and warnings
 */
export async function validateAssetMap() {
  log('assetLibrary.js', 'validateAssetMap', 'start', 'Validating asset map configuration', {});

  try {
    const assetMap = await loadAssetMapConfig();
    const errors = [];
    const warnings = [];

    // Check if production environment exists
    if (!assetMap.production || Object.keys(assetMap.production).length === 0) {
      errors.push('Production environment is missing or empty');
    }

    // Check for valid URLs
    Object.entries(assetMap).forEach(([env, assets]) => {
      if (typeof assets !== 'object') {
        errors.push(`Environment "${env}" has invalid structure`);
        return;
      }

      Object.entries(assets).forEach(([flag, url]) => {
        if (typeof url !== 'string' || url.trim().length === 0) {
          errors.push(`Invalid URL for flag "${flag}" in environment "${env}"`);
        }

        // Check URL format
        if (!url.startsWith('/') && !url.startsWith('http://') && !url.startsWith('https://')) {
          warnings.push(`URL for flag "${flag}" in environment "${env}" may be invalid: ${url}`);
        }
      });
    });

    // Check for flags in dev/staging that don't exist in production
    ['development', 'staging'].forEach(env => {
      if (assetMap[env]) {
        Object.keys(assetMap[env]).forEach(flag => {
          if (!assetMap.production?.[flag]) {
            warnings.push(`Flag "${flag}" exists in ${env} but not in production (no fallback)`);
          }
        });
      }
    });

    const result = {
      valid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalErrors: errors.length,
        totalWarnings: warnings.length,
        environments: Object.keys(assetMap).length
      }
    };

    log('assetLibrary.js', 'validateAssetMap', 'complete', 'Asset map validation complete', result.summary);

    return result;

  } catch (error) {
    logError('assetLibrary.js', 'validateAssetMap', 'Error validating asset map', error);
    return {
      valid: false,
      errors: [`Failed to load asset map: ${error.message}`],
      warnings: [],
      summary: {
        totalErrors: 1,
        totalWarnings: 0,
        environments: 0
      }
    };
  }
}

