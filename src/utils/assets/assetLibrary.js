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
import {
  getValueFromCache,
  setValueWithExpiration,
  clearAllCache,
  removeFromCache,
  removeCacheKeysByPrefix
} from '../common/cacheHandler.js';
import { loadSectionManifest, getSectionBundlePaths } from '../build/manifestLoader.js';
import { getAssetPreloadEntriesForSection } from './getAssetPreloadEntriesForSection.js';
import { assertAllowedPreloadUrl } from './assertAllowedPreloadUrl.js';
import {
  getBundledAssetMap,
  parseAssetMapJsonText,
  shouldAllowRuntimeAssetMapFetch,
  verifyFetchedAssetMapText,
} from './assetMapSource.js';

// ============================================================================
// SECTION-BASED ASSET LOADING
// ============================================================================

// Cache configuration for asset metadata
const ASSET_CACHE_KEY_PREFIX = 'asset_metadata_';
const ASSET_CACHE_TTL = 3600000; // 1 hour

// In-flight section metadata loads — shared Promise per section (see L-02)
const assetsLoadingPromises = new Map();

// Track loaded section bundle metadata in memory (NOT per-URL preload completion; see usePreloadStore.hasAsset)
const loadedAssets = new Map();
/** @type {Map<string, object>} In-memory category snapshots (P-07); mirrors cacheHandler TTL entries */
const categoryAssetsMemoryCache = new Map();

// In-memory manifest cache
let cachedManifest = null;

// ============================================================================
// FLAG-TO-URL ASSET MAPPING
// ============================================================================

// Cache configuration for asset map
const ASSET_MAP_CACHE_KEY = 'asset_map_config';
const ASSET_MAP_SOURCE_CACHE_KEY = 'asset_map_config_source';
const ASSET_MAP_CACHE_TTL = 3600000; // 1 hour
const ASSET_URL_CACHE_PREFIX = 'asset_url_';
const ASSET_URL_CACHE_TTL = 1800000; // 30 minutes
const ASSET_CATEGORY_CACHE_PREFIX = 'asset_category_';
const ASSET_CATEGORY_CACHE_TTL = ASSET_MAP_CACHE_TTL;

// In-memory cache for asset map
let cachedAssetMap = null;
let assetMapLoadPromise = null;
/** @type {'bundled-production'|'bundled-dev'|'bundled-fallback'|'runtime-verified'|'cache-restored'|null} */
let assetMapConfigSource = null;

/**
 * Default map source when only the map body was cached (legacy TTL entries).
 * @returns {string}
 */
function resolveDefaultAssetMapConfigSource() {
  if (import.meta.env.PROD) {
    return 'bundled-production';
  }

  if (shouldAllowRuntimeAssetMapFetch()) {
    return 'runtime-verified';
  }

  return 'bundled-dev';
}

/**
 * Restore {@link assetMapConfigSource} from TTL cache or infer for legacy entries.
 * @returns {void}
 */
function restoreAssetMapConfigSourceFromCache() {
  const cachedSource = getValueFromCache(ASSET_MAP_SOURCE_CACHE_KEY);
  assetMapConfigSource =
    typeof cachedSource === 'string' && cachedSource
      ? cachedSource
      : resolveDefaultAssetMapConfigSource();
}

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
    const { assets, routeCount } = getAssetPreloadEntriesForSection(sectionName);

    log('assetLibrary.js', 'getAssetPreloadConfigForSection', 'info', 'Section routes found', {
      sectionName,
      routeCount
    });

    log('assetLibrary.js', 'getAssetPreloadConfigForSection', 'success', 'Asset preload configs collected', {
      sectionName,
      assetCount: assets.length
    });

    return assets;
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
export function loadAssetsForSection(sectionName) {
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
    loadedAssets.set(sectionName, cachedAssets);
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

  if (assetsLoadingPromises.has(sectionName)) {
    log('assetLibrary.js', 'loadAssetsForSection', 'in-progress', 'Asset load already in progress — sharing promise', {
      sectionName
    });
    return assetsLoadingPromises.get(sectionName);
  }

  const loadPromise = (async () => {
    try {
      const manifest = await getManifest();
      const bundlePaths = await getSectionBundlePaths(sectionName, manifest);
      const assetPreloadConfigs = getAssetPreloadConfigForSection(sectionName);

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

      setValueWithExpiration(cacheKey, assets, ASSET_CACHE_TTL);
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
    }
  })();

  const sharedPromise = loadPromise.finally(() => {
    assetsLoadingPromises.delete(sectionName);
  });

  assetsLoadingPromises.set(sectionName, sharedPromise);
  return sharedPromise;
}

/**
 * Preload assets for multiple sections
 * Loads assets in parallel for better performance
 * 
 * @param {Array<string>} sectionNames - Array of section names
 * @returns {Promise<object>} - Map of section name to assets
 */
export async function preloadAssetsForSections(sectionNames) {
  if (!Array.isArray(sectionNames)) {
    log('assetLibrary.js', 'preloadAssetsForSections', 'error', 'Invalid section names array', {
      sectionNames
    });
    return {};
  }

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

  const assetsMap = {};
  const sectionsToLoad = [];

  for (const sectionName of sectionNames) {
    if (typeof sectionName !== 'string' || sectionName.trim().length === 0) {
      continue;
    }

    if (areAssetsLoadedForSection(sectionName)) {
      const existing = getAssetsForSection(sectionName);
      if (existing) {
        assetsMap[sectionName] = existing;
        continue;
      }
    }

    sectionsToLoad.push(sectionName);
  }

  const skippedCount = sectionNames.length - sectionsToLoad.length;

  if (skippedCount > 0) {
    log('assetLibrary.js', 'preloadAssetsForSections', 'skip', 'Skipped already-loaded sections', {
      skippedCount,
      sectionsToLoad
    });
  }

  const loadPromises = sectionsToLoad.map((sectionName) =>
    loadAssetsForSection(sectionName)
      .then((assets) => ({ sectionName, assets, success: true }))
      .catch((error) => {
        logError('assetLibrary.js', 'preloadAssetsForSections', 'Section asset load failed', error, {
          sectionName
        });
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

  const results = await Promise.all(loadPromises);

  results.forEach((result) => {
    assetsMap[result.sectionName] = result.assets;
  });

  const successCount = results.filter((r) => r.success).length;

  log('assetLibrary.js', 'preloadAssetsForSections', 'info', 'Batch asset preload completed', {
    totalSections: sectionNames.length,
    skipped: skippedCount,
    loaded: sectionsToLoad.length,
    successful: successCount,
    failed: sectionsToLoad.length - successCount
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
 * Check if section bundle metadata is loaded (manifest paths, preload config rollup).
 * For resolved URL preload completion, use usePreloadStore.hasAsset(url) instead.
 *
 * @param {string} sectionName - Section name
 * @returns {boolean} - True if section bundle metadata is loaded
 */
export function areAssetsLoadedForSection(sectionName) {
  const loaded = getAssetsForSection(sectionName) !== null;
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

  if (assetsLoadingPromises.has(sectionName)) {
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
  assetsLoadingPromises.clear();

  // Clear cached manifest
  cachedManifest = null;

  // Reset in-memory asset map + in-flight load (see L-01 / clearAssetMapConfigCache)
  clearAssetMapConfigCache();
  clearAssetLibraryInitState();

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
    loadingInProgress: Array.from(assetsLoadingPromises.keys()),
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
    removeFromCache(ASSET_CACHE_KEY_PREFIX + sectionName);
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

function isLocalhostHostname(hostname) {
  const host = String(hostname).toLowerCase();
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
}

/**
 * Remote URL hostname checks (L-08 / S-07 — e.g. i.ibb.co.com typo).
 * @param {string} url
 * @returns {string|null} Error message or null if OK
 */
function validateRemoteAssetUrl(url) {
  if (typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return null;
  }

  try {
    const { hostname } = new URL(url);
    const host = hostname.toLowerCase();

    if (host.endsWith('.co.com') || host.includes('.ibb.co.com')) {
      return `malformed hostname (invalid double TLD): ${hostname}`;
    }

    if (host.includes('ibb.co') && host !== 'i.ibb.co') {
      return `invalid ImgBB hostname "${hostname}"; expected i.ibb.co`;
    }

    return null;
  } catch {
    return 'malformed absolute URL';
  }
}

/**
 * Upgrade insecure http:// asset URLs to https:// except on localhost.
 * @param {string} url
 * @returns {string}
 */
export function normalizeAssetMapUrl(url) {
  if (typeof url !== 'string' || !url.trim()) {
    return url;
  }

  const trimmed = url.trim();

  if (!trimmed.startsWith('http://')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);

    if (isLocalhostHostname(parsed.hostname)) {
      return trimmed;
    }

    return `https://${trimmed.slice('http://'.length)}`;
  } catch {
    return trimmed;
  }
}

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

  clearAssetMapConfigCache();
  removeCacheKeysByPrefix(ASSET_URL_CACHE_PREFIX);
  removeCacheKeysByPrefix(ASSET_CATEGORY_CACHE_PREFIX);
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
 * Candidate URLs for runtime asset map fetch (L-10 / S-06).
 * Order: optional `VITE_ASSET_MAP_URL`, then `public/config`, then `src/config` in dev.
 * Network fetch runs only when `shouldAllowRuntimeAssetMapFetch()` is true (dev override flag).
 *
 * @returns {string[]}
 */
export function getAssetMapFetchCandidates() {
  const candidates = [];

  const override = import.meta.env.VITE_ASSET_MAP_URL;
  if (override && typeof override === 'string' && override.trim()) {
    candidates.push(override.trim());
  }

  candidates.push('/config/assetMap.json');

  if (import.meta.env.DEV) {
    candidates.push('/src/config/assetMap.json');
  }

  return [...new Set(candidates)];
}

/**
 * Fetch asset map JSON from the first reachable candidate URL.
 * @returns {Promise<object|null>}
 */
async function fetchAssetMapFromNetwork() {
  for (const url of getAssetMapFetchCandidates()) {
    try {
      log('assetLibrary.js', 'fetchAssetMapFromNetwork', 'fetch', 'Fetching asset map', { url });

      const response = await fetch(url);

      if (!response.ok) {
        log('assetLibrary.js', 'fetchAssetMapFromNetwork', 'warn', 'Asset map fetch failed for URL', {
          url,
          status: response.status
        });
        continue;
      }

      const rawText = await response.text();

      if (!(await verifyFetchedAssetMapText(rawText))) {
        log('assetLibrary.js', 'fetchAssetMapFromNetwork', 'warn', 'Asset map hash mismatch — rejected', {
          url
        });
        continue;
      }

      const assetMap = parseAssetMapJsonText(rawText);

      if (!assetMap) {
        log('assetLibrary.js', 'fetchAssetMapFromNetwork', 'warn', 'Invalid asset map JSON', { url });
        continue;
      }

      log('assetLibrary.js', 'fetchAssetMapFromNetwork', 'success', 'Asset map loaded from network', { url });
      return assetMap;
    } catch (error) {
      log('assetLibrary.js', 'fetchAssetMapFromNetwork', 'warn', 'Asset map fetch error', {
        url,
        error: error.message
      });
    }
  }

  return null;
}

/**
 * Load asset map configuration from JSON file
 * 
 * @returns {Promise<object>} - Asset map configuration
 */
/**
 * Clear in-memory and handler cache for asset map (tests / environment switches).
 */
export function clearAssetMapConfigCache() {
  cachedAssetMap = null;
  assetMapLoadPromise = null;
  assetMapConfigSource = null;
  categoryAssetsMemoryCache.clear();
  removeFromCache(ASSET_MAP_CACHE_KEY);
  removeFromCache(ASSET_MAP_SOURCE_CACHE_KEY);
  removeCacheKeysByPrefix(ASSET_CATEGORY_CACHE_PREFIX);
}

/**
 * @param {string} env
 * @param {string} category
 * @returns {string}
 */
function getAssetCategoryCacheKey(env, category) {
  return `${ASSET_CATEGORY_CACHE_PREFIX}${env}_${category}`;
}

/**
 * @param {string} env
 * @param {string} category
 * @returns {string}
 */
function getCategoryMemoryCacheKey(env, category) {
  return `${env}:${category}`;
}

/**
 * Whether category assets are cached for the environment (memory or cacheHandler).
 *
 * @param {string} category
 * @param {string} [environment]
 * @returns {boolean}
 */
export function isAssetCategoryCached(category, environment = null) {
  if (!category || typeof category !== 'string') {
    return false;
  }

  const env = environment || detectEnvironment();
  const memoryKey = getCategoryMemoryCacheKey(env, category);

  if (categoryAssetsMemoryCache.has(memoryKey)) {
    return true;
  }

  return getValueFromCache(getAssetCategoryCacheKey(env, category)) !== null;
}

/**
 * Build flag → URL map for a category prefix from a loaded asset map.
 *
 * @param {object} assetMap
 * @param {string} env
 * @param {string} category
 * @returns {object}
 */
function buildAssetsByCategoryFromMap(assetMap, env, category) {
  const categoryPrefix = category.endsWith('.') ? category : `${category}.`;
  const resolvedMap = resolveAssetMapForEnvironment(assetMap, env);
  const matchingAssets = {};

  Object.entries(resolvedMap).forEach(([flag, url]) => {
    if (flag.startsWith(categoryPrefix)) {
      matchingAssets[flag] = url;
    }
  });

  return matchingAssets;
}

/**
 * @returns {string|null} How the current asset map was loaded
 */
export function getAssetMapConfigSource() {
  return assetMapConfigSource;
}

export function loadAssetMapConfig() {
  log('assetLibrary.js', 'loadAssetMapConfig', 'start', 'Loading asset map configuration', {});

  // Return cached map if available
  if (cachedAssetMap) {
    if (!assetMapConfigSource) {
      restoreAssetMapConfigSourceFromCache();
    }

    log('assetLibrary.js', 'loadAssetMapConfig', 'memory-hit', 'Returning cached asset map from memory', {
      source: assetMapConfigSource
    });
    return Promise.resolve(cachedAssetMap);
  }

  // Check cache
  const cachedConfig = getValueFromCache(ASSET_MAP_CACHE_KEY);
  if (cachedConfig) {
    cachedAssetMap = cachedConfig;
    restoreAssetMapConfigSourceFromCache();

    log('assetLibrary.js', 'loadAssetMapConfig', 'cache-hit', 'Asset map loaded from cache', {
      source: assetMapConfigSource
    });
    return Promise.resolve(cachedConfig);
  }

  // If already loading, wait for existing promise
  if (assetMapLoadPromise) {
    log('assetLibrary.js', 'loadAssetMapConfig', 'waiting', 'Asset map load in progress, waiting', {});
    return assetMapLoadPromise;
  }

  const loadPromise = (async () => {
    try {
      let assetMap;
      let source;

      if (shouldAllowRuntimeAssetMapFetch()) {
        log('assetLibrary.js', 'loadAssetMapConfig', 'fetch', 'Dev runtime override enabled', {
          candidates: getAssetMapFetchCandidates()
        });

        assetMap = await fetchAssetMapFromNetwork();
        source = assetMap ? 'runtime-verified' : 'bundled-fallback';

        if (!assetMap) {
          log('assetLibrary.js', 'loadAssetMapConfig', 'bundled-fallback', 'Using bundled asset map', {});
          assetMap = getBundledAssetMap();
        }
      } else {
        assetMap = getBundledAssetMap();
        source = import.meta.env.PROD ? 'bundled-production' : 'bundled-dev';
        log('assetLibrary.js', 'loadAssetMapConfig', 'bundled', 'Using build-time bundled asset map', {
          source
        });
      }

      if (!assetMap || typeof assetMap !== 'object') {
        throw new Error('Invalid asset map structure');
      }

      if (!assetMap.production) {
        log('assetLibrary.js', 'loadAssetMapConfig', 'warn', 'No production environment in asset map', {});
        assetMap.production = {};
      }

      log('assetLibrary.js', 'loadAssetMapConfig', 'success', 'Asset map loaded successfully', {
        environments: Object.keys(assetMap),
        totalFlags: Object.keys(assetMap.production || {}).length,
        source
      });

      cachedAssetMap = assetMap;
      assetMapConfigSource = source;
      setValueWithExpiration(ASSET_MAP_CACHE_KEY, assetMap, ASSET_MAP_CACHE_TTL);
      setValueWithExpiration(ASSET_MAP_SOURCE_CACHE_KEY, source, ASSET_MAP_CACHE_TTL);

      return assetMap;
    } catch (error) {
      logError('assetLibrary.js', 'loadAssetMapConfig', 'Failed to load asset map', error);

      const emptyMap = {
        development: {},
        staging: {},
        production: {}
      };

      cachedAssetMap = emptyMap;
      assetMapConfigSource = 'bundled-fallback';
      return emptyMap;
    }
  })();

  const sharedPromise = loadPromise.finally(() => {
    assetMapLoadPromise = null;
  });

  assetMapLoadPromise = sharedPromise;
  return sharedPromise;
}

/**
 * @param {string} flag
 * @returns {string}
 */
function inferAssetTypeFromFlag(flag) {
  if (flag.startsWith('script.')) {
    return 'script';
  }

  if (flag.startsWith('font.')) {
    return 'font';
  }

  return 'default';
}

/**
 * Resolve a flag against an already-loaded map (no cache I/O).
 *
 * @param {string} flag
 * @param {string} env
 * @param {object} assetMap
 * @returns {string|null}
 */
function resolveFlagUrlFromLoadedMap(flag, env, assetMap) {
  let url = assetMap[env]?.[flag];

  if (!url && env !== 'production') {
    url = assetMap.production?.[flag];
  }

  if (!url) {
    return null;
  }

  const normalizedUrl = normalizeAssetMapUrl(url);
  const urlCheck = assertAllowedPreloadUrl(normalizedUrl, {
    assetType: inferAssetTypeFromFlag(flag),
  });

  if (!urlCheck.ok) {
    return null;
  }

  return urlCheck.url;
}

/**
 * URL cache lookup + map resolution for one flag (P-04 shared path).
 *
 * @param {string} flag
 * @param {string} env
 * @param {object} assetMap
 * @param {{ logDetail?: boolean }} [options]
 * @returns {string|null}
 */
function resolveAndCacheFlagUrl(flag, env, assetMap, options = {}) {
  const { logDetail = false } = options;
  const cacheKey = `${ASSET_URL_CACHE_PREFIX}${env}_${flag}`;
  const cachedUrl = getValueFromCache(cacheKey);

  if (cachedUrl) {
    if (logDetail) {
      log('assetLibrary.js', 'getAssetUrl', 'cache-hit', 'Asset URL from cache', { flag, url: cachedUrl });
    }
    return cachedUrl;
  }

  const rawUrl = assetMap[env]?.[flag];
  const usedInheritance = !rawUrl && env !== 'production' && assetMap.production?.[flag];

  if (logDetail && usedInheritance) {
    log('assetLibrary.js', 'getAssetUrl', 'inheritance', 'Using production fallback', {
      flag,
      requestedEnv: env,
      fallbackEnv: 'production',
    });
  }

  const safeUrl = resolveFlagUrlFromLoadedMap(flag, env, assetMap);

  if (!safeUrl) {
    if (logDetail) {
      const hadRaw = rawUrl || (env !== 'production' && assetMap.production?.[flag]);
      if (hadRaw) {
        log('assetLibrary.js', 'getAssetUrl', 'blocked', 'Resolved URL blocked by policy', { flag, environment: env });
      } else {
        log('assetLibrary.js', 'getAssetUrl', 'not-found', 'Asset flag not found in any environment', {
          flag,
          environment: env,
          availableEnvironments: Object.keys(assetMap),
        });
      }
    }
    return null;
  }

  if (logDetail) {
    log('assetLibrary.js', 'getAssetUrl', 'success', 'Asset URL resolved', {
      flag,
      url: safeUrl,
      environment: env,
    });
  }

  setValueWithExpiration(cacheKey, safeUrl, ASSET_URL_CACHE_TTL);
  return safeUrl;
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

  const env = environment || detectEnvironment();

  try {
    const assetMap = await loadAssetMapConfig();
    return resolveAndCacheFlagUrl(flag, env, assetMap, { logDetail: true });
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
  if (!Array.isArray(flags)) {
    log('assetLibrary.js', 'getAssetUrls', 'error', 'Invalid flags array', { flags });
    return {};
  }

  log('assetLibrary.js', 'getAssetUrls', 'start', 'Getting multiple asset URLs', {
    flagCount: flags.length,
    flags,
  });

  const env = environment || detectEnvironment();

  try {
    const assetMap = await loadAssetMapConfig();
    const urlMap = {};

    for (const flag of flags) {
      if (!flag || typeof flag !== 'string') {
        urlMap[flag] = null;
        continue;
      }

      urlMap[flag] = resolveAndCacheFlagUrl(flag, env, assetMap);
    }

    log('assetLibrary.js', 'getAssetUrls', 'success', 'Multiple asset URLs resolved', {
      total: flags.length,
      resolved: Object.values(urlMap).filter(Boolean).length,
      missing: Object.values(urlMap).filter((url) => !url).length,
      mapLoad: 'single-pass',
    });

    return urlMap;
  } catch (error) {
    logError('assetLibrary.js', 'getAssetUrls', 'Error getting multiple asset URLs', error, { flags });
    return {};
  }
}

/**
 * Production base map with environment-specific overrides (L-07).
 * Same inheritance rules for flag lists and category lookups.
 *
 * @param {object} assetMap - Full asset map config
 * @param {string} env - Target environment
 * @returns {object} Merged flag → URL map
 */
function resolveAssetMapForEnvironment(assetMap, env) {
  const merged = {};

  if (assetMap?.production && typeof assetMap.production === 'object') {
    Object.assign(merged, assetMap.production);
  }

  if (env !== 'production' && assetMap?.[env] && typeof assetMap[env] === 'object') {
    Object.assign(merged, assetMap[env]);
  }

  return merged;
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
    const flagArray = Object.keys(resolveAssetMapForEnvironment(assetMap, env)).sort();

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
    const memoryKey = getCategoryMemoryCacheKey(env, category);
    const memoryCached = categoryAssetsMemoryCache.get(memoryKey);

    if (memoryCached) {
      log('assetLibrary.js', 'getAssetsByCategory', 'cache-hit', 'Category assets from memory cache', {
        category,
        environment: env,
        count: Object.keys(memoryCached).length
      });
      return memoryCached;
    }

    const cacheKey = getAssetCategoryCacheKey(env, category);
    const cachedCategory = getValueFromCache(cacheKey);

    if (cachedCategory) {
      categoryAssetsMemoryCache.set(memoryKey, cachedCategory);
      log('assetLibrary.js', 'getAssetsByCategory', 'cache-hit', 'Category assets from cache', {
        category,
        environment: env,
        count: Object.keys(cachedCategory).length
      });
      return cachedCategory;
    }

    const assetMap = await loadAssetMapConfig();
    const matchingAssets = buildAssetsByCategoryFromMap(assetMap, env, category);

    categoryAssetsMemoryCache.set(memoryKey, matchingAssets);
    setValueWithExpiration(cacheKey, matchingAssets, ASSET_CATEGORY_CACHE_TTL);

    log('assetLibrary.js', 'getAssetsByCategory', 'success', 'Assets by category retrieved', {
      category,
      environment: env,
      count: Object.keys(matchingAssets).length,
      cached: true
    });

    return matchingAssets;

  } catch (error) {
    logError('assetLibrary.js', 'getAssetsByCategory', 'Error getting assets by category', error, { category });
    return {};
  }
}

// Eager startup init (P-01 / M-02) — deduped across callers
let assetLibraryInitPromise = null;

/**
 * Reset init promise (tests / clearAssetCaches).
 * @returns {void}
 */
function clearAssetLibraryInitState() {
  assetLibraryInitPromise = null;
}

/**
 * All flags for the active environment from the loaded map (map must be loaded first).
 *
 * @param {string} [environment] - Optional environment override
 * @returns {string[]}
 */
export function getKnownGlobalFlags(environment = null) {
  const env = environment || detectEnvironment();

  if (!cachedAssetMap) {
    return [];
  }

  return Object.keys(resolveAssetMapForEnvironment(cachedAssetMap, env)).sort();
}

/**
 * Whether {@link initAssetLibrary} has been started (may still be in flight until awaited).
 * @returns {boolean}
 */
export function isAssetLibraryInitialized() {
  return assetLibraryInitPromise !== null;
}

/**
 * Eager startup: detect environment, load asset map, warm flag→URL resolution cache.
 *
 * @param {object} [options]
 * @param {string[]} [options.flags] - Explicit flags to warm (default: all flags for environment)
 * @param {boolean} [options.warmFlags=true] - When false, only loads the map
 * @returns {Promise<{ environment: string, flagCount: number, warmedCount: number, mapSource: string|null }>}
 */
export function initAssetLibrary(options = {}) {
  if (assetLibraryInitPromise) {
    return assetLibraryInitPromise;
  }

  const { flags: flagsOverride = null, warmFlags = true } = options;

  assetLibraryInitPromise = (async () => {
    const environment = detectEnvironment();

    if (window.performanceTracker) {
      window.performanceTracker.step({
        step: 'initAssetLibrary_start',
        file: 'assetLibrary.js',
        method: 'initAssetLibrary',
        flag: 'asset-init',
        purpose: 'Eager asset map and URL cache warm-up',
      });
    }

    await loadAssetMapConfig();

    const flags =
      Array.isArray(flagsOverride) && flagsOverride.length > 0
        ? flagsOverride
        : getKnownGlobalFlags(environment);

    let warmedCount = 0;
    if (warmFlags && flags.length > 0) {
      warmedCount = await preloadAssetUrls(flags, environment);
    }

    const result = {
      environment,
      flagCount: flags.length,
      warmedCount,
      mapSource: getAssetMapConfigSource(),
    };

    log('assetLibrary.js', 'initAssetLibrary', 'ready', 'Asset library initialised', result);

    if (window.performanceTracker) {
      window.performanceTracker.step({
        step: 'initAssetLibrary_ready',
        file: 'assetLibrary.js',
        method: 'initAssetLibrary',
        flag: 'asset-init',
        purpose: `Asset library ready (${warmedCount}/${flags.length} URLs warmed)`,
      });
    }

    return result;
  })().catch((error) => {
    assetLibraryInitPromise = null;
    logError('assetLibrary.js', 'initAssetLibrary', 'Asset library init failed', error);
    throw error;
  });

  return assetLibraryInitPromise;
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

        const hostnameIssue = validateRemoteAssetUrl(url);
        if (hostnameIssue) {
          errors.push(`Flag "${flag}" in environment "${env}": ${hostnameIssue}`);
        }

        if (url.startsWith('http://')) {
          try {
            const parsed = new URL(url);

            if (!isLocalhostHostname(parsed.hostname)) {
              const upgraded = normalizeAssetMapUrl(url);

              if (env === 'production') {
                errors.push(
                  `Production flag "${flag}" uses HTTP; use HTTPS (${upgraded})`,
                );
              } else {
                warnings.push(
                  `Flag "${flag}" in "${env}" uses HTTP; will be upgraded to HTTPS at runtime (${upgraded})`,
                );
              }
            }
          } catch {
            warnings.push(`HTTP URL for flag "${flag}" in environment "${env}" is malformed: ${url}`);
          }
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

