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

import { log } from '../../infrastructure/logging/logHandler.js';
import { logError } from '../../infrastructure/errors/errorHandler.js';
import { deepClone, isPlainObject } from '../../utils/common/objectSafety.js';
import {
  getValueFromCache,
  setValueWithExpiration,
  removeFromCache,
  removeCacheKeysByPrefix
} from '../../infrastructure/cache/cacheHandler.js';
import { loadSectionManifest, getSectionBundlePaths } from '../build/manifestLoader.js';
import { getAssetPreloadEntriesForSection } from './getAssetPreloadEntriesForSection.js';
import { assertAllowedPreloadUrl } from './assertAllowedPreloadUrl.js';
import {
  getBundledAssetMap,
  parseAssetMapJsonText,
  shouldAllowRuntimeAssetMapFetch,
  verifyFetchedAssetMapText,
} from './assetMapSource.js';
import {
  fetchSectionAssetMapFromNetwork,
  getBundledSectionAssetMap,
  getKnownBundledSectionNames as listKnownBundledSectionNames,
  isValidSectionAssetMapName,
} from './sectionAssetMapSource.js';

// ============================================================================
// SECTION-BASED ASSET LOADING
// ============================================================================

// Cache configuration for asset metadata
const ASSET_CACHE_KEY_PREFIX = 'asset_metadata_';
const ASSET_CACHE_TTL = 3600000; // 1 hour

/**
 * @param {string} sectionName
 * @returns {string}
 */
function getSectionAssetCacheKey(sectionName) {
  return ASSET_CACHE_KEY_PREFIX + sectionName;
}

/**
 * Lazy TTL persist: memory is canonical during session; cacheHandler repopulated on read (B-06).
 *
 * @param {string} sectionName
 * @returns {boolean} Whether a new cache entry was written
 */
function persistSectionAssetsToHandlerCache(sectionName) {
  if (!loadedAssets.has(sectionName)) {
    return false;
  }

  const cacheKey = getSectionAssetCacheKey(sectionName);

  if (getValueFromCache(cacheKey) !== null) {
    return false;
  }

  setValueWithExpiration(cacheKey, loadedAssets.get(sectionName), ASSET_CACHE_TTL);
  return true;
}

// In-flight section metadata loads — shared Promise per section (see L-02)
const assetsLoadingPromises = new Map();

// Track loaded section bundle metadata in memory (NOT per-URL preload completion; see usePreloadStore.hasAsset)
const loadedAssets = new Map();
/** @type {Map<string, object>} In-memory category snapshots (P-07); mirrors cacheHandler TTL entries */
const categoryAssetsMemoryCache = new Map();
/** @type {Map<string, object>} In-memory merged flag indexes (A-M01) */
const assetIndexMemoryCache = new Map();

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
const ASSET_URL_MISS_CACHE_PREFIX = 'asset_url_miss_';
const ASSET_URL_MISS_CACHE_TTL = 120000; // 2 minutes
const ASSET_CATEGORY_CACHE_PREFIX = 'asset_category_';
const ASSET_CATEGORY_CACHE_TTL = ASSET_MAP_CACHE_TTL;
const ASSET_INDEX_CACHE_PREFIX = 'asset_index_';
const ASSET_INDEX_CACHE_TTL = ASSET_MAP_CACHE_TTL;
/** @type {Set<string>} Section names with cached flag URLs (M-07) */
const sectionUrlCacheSections = new Set();

// In-memory cache for asset map
let cachedAssetMap = null;
let assetMapLoadPromise = null;
let assetMapLoadGeneration = 0;
/** @type {'bundled-production'|'bundled-dev'|'bundled-fallback'|'runtime-verified'|'cache-restored'|null} */
let assetMapConfigSource = null;

/** Empty map shape returned when load fails (A-L06 external callers). */
const EMPTY_ASSET_MAP_SHAPE = {
  development: {},
  staging: {},
  production: {},
};

/**
 * Clone-on-read for external callers (A-L06). Uses structuredClone when available — no trace logging.
 *
 * @param {any} value
 * @returns {any}
 */
function cloneOnRead(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch {
      // Non-cloneable values fall back to deepClone (JSON-like asset payloads only).
    }
  }

  return deepClone(value);
}

const SECTION_ASSET_MAP_CACHE_PREFIX = 'section_asset_map_';
const SECTION_ASSET_MAP_CACHE_TTL = ASSET_MAP_CACHE_TTL;
/** @type {Map<string, object>} */
const sectionAssetMapsMemory = new Map();
/** @type {Map<string, Promise<object|null>>} */
const sectionAssetMapLoadPromises = new Map();

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

/** Manual override from `setEnvironment` only; auto-detect does not cache here (B-07). */
let environmentOverride = null;

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
    return Promise.resolve({});
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

  const cacheKey = getSectionAssetCacheKey(sectionName);

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

    return Promise.resolve(cloneOnRead(cachedAssets));
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

  const clonedPromise = loadPromise
    .then((assets) => cloneOnRead(assets))
    .finally(() => {
      assetsLoadingPromises.delete(sectionName);
    });
  assetsLoadingPromises.set(sectionName, clonedPromise);
  return clonedPromise;
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
 * Internal read of section metadata without clone-on-read (hot paths).
 *
 * @param {string} sectionName
 * @returns {object|null}
 */
function getSectionAssetsReference(sectionName) {
  if (loadedAssets.has(sectionName)) {
    return loadedAssets.get(sectionName);
  }

  const cacheKey = getSectionAssetCacheKey(sectionName);
  const cachedAssets = getValueFromCache(cacheKey);

  if (cachedAssets) {
    loadedAssets.set(sectionName, cachedAssets);
    return cachedAssets;
  }

  return null;
}

/**
 * Get assets for a section (from cache/memory only, doesn't load)
 * 
 * @param {string} sectionName - Section name
 * @returns {object|null} - Asset metadata or null if not loaded
 */
export function getAssetsForSection(sectionName) {
  log('assetLibrary.js', 'getAssetsForSection', 'start', 'Getting assets for section', { sectionName });

  const assets = getSectionAssetsReference(sectionName);

  if (assets) {
    persistSectionAssetsToHandlerCache(sectionName);
    log('assetLibrary.js', 'getAssetsForSection', 'memory-hit', 'Assets found in memory', { sectionName });
    return cloneOnRead(assets);
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
  const loaded = getSectionAssetsReference(sectionName) !== null;
  log('assetLibrary.js', 'areAssetsLoadedForSection', 'return', 'Returning loaded status', { sectionName, loaded });
  return loaded;
}

/**
 * Whether section metadata is in the in-memory map (B-06 browser probe).
 * @param {string} sectionName
 * @returns {boolean}
 */
export function isSectionAssetMetadataInMemory(sectionName) {
  return loadedAssets.has(sectionName);
}

/**
 * Whether section metadata is in cacheHandler TTL (same module instance as assetLibrary).
 * @param {string} sectionName
 * @returns {boolean}
 */
export function isSectionAssetMetadataCached(sectionName) {
  return getValueFromCache(getSectionAssetCacheKey(sectionName)) !== null;
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

  const assets = getSectionAssetsReference(sectionName);
  if (assets) {
    const state = assets.state || 'loaded';
    log('assetLibrary.js', 'getAssetLoadingState', 'return', 'Assets state', { sectionName, state });
    return state;
  }

  log('assetLibrary.js', 'getAssetLoadingState', 'return', 'Assets not loaded', { sectionName, state: 'not-loaded' });
  return 'not-loaded';
}

/**
 * Clear asset map, section metadata, and cacheHandler TTL caches.
 * For a full reset including preload store URLs, use {@link resetAssetLibrary} from `resetAssetLibrary.js`.
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
  environmentOverride = null;
  clearAssetLibraryInitState();
  sectionUrlCacheSections.clear();
  assetIndexMemoryCache.clear();

  // Clear only asset-related cache entries (avoid wiping shared cacheHandler storage)
  removeCacheKeysByPrefix(ASSET_CACHE_KEY_PREFIX);
  removeCacheKeysByPrefix(ASSET_URL_MISS_CACHE_PREFIX);
  removeCacheKeysByPrefix(ASSET_INDEX_CACHE_PREFIX);

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
    removeFromCache(getSectionAssetCacheKey(sectionName));
    removeCacheKeysByPrefix(getSectionAssetUrlCachePrefix(sectionName));
    sectionUrlCacheSections.delete(sectionName);
    unloadedCount++;
  });

  // Also clear section URL caches that may have been created without loading section metadata (M-07)
  for (const sectionName of [...sectionUrlCacheSections]) {
    if (!sectionsToKeep.includes(sectionName) && !keysToDelete.includes(sectionName)) {
      removeCacheKeysByPrefix(getSectionAssetUrlCachePrefix(sectionName));
      sectionUrlCacheSections.delete(sectionName);
    }
  }

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
 * Escape a URL for safe use inside CSS url("...") contexts.
 *
 * @param {string} url
 * @returns {string}
 */
function escapeUrlForCss(url) {
  const encoded = encodeURI(url)
    .replace(/"/g, '%22')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
  return `url("${encoded}")`;
}

/**
 * Escape a URL for use in HTML attribute contexts (src/href).
 *
 * @param {string} url
 * @returns {string}
 */
function escapeUrlForAttr(url) {
  return encodeURI(url).replace(/"/g, '%22').replace(/'/g, '%27');
}

/**
 * Resolve environment from Vite `import.meta.env` and hostname (never cached — B-07).
 *
 * @returns {string} - Environment name: 'development', 'staging', or 'production'
 */
function resolveEnvironmentFromImportMeta() {
  if (import.meta.env.DEV) {
    return 'development';
  }
  if (import.meta.env.MODE === 'staging') {
    return 'staging';
  }
  if (import.meta.env.PROD) {
    return 'production';
  }

  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
    return 'development';
  }
  if (hostname.includes('staging') || hostname.includes('stg')) {
    return 'staging';
  }
  return 'production';
}

/**
 * Detect the current environment
 *
 * @returns {string} - Environment name: 'development', 'staging', or 'production'
 */
function detectEnvironment() {
  if (environmentOverride !== null) {
    return environmentOverride;
  }

  const environment = resolveEnvironmentFromImportMeta();

  log('assetLibrary.js', 'detectEnvironment', 'detected', 'Environment detected', {
    environment,
    hostname: window.location.hostname,
    mode: import.meta.env.MODE,
    source: 'import.meta.env',
  });

  return environment;
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

  environmentOverride = env;
  log('assetLibrary.js', 'setEnvironment', 'set', 'Environment manually set', {
    environment: env,
    source: 'manual-override',
  });

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

      const response = await fetch(url, { cache: 'no-store' });

      if (!response.ok) {
        log('assetLibrary.js', 'fetchAssetMapFromNetwork', 'warn', 'Asset map fetch failed for URL', {
          url,
          status: response.status
        });
        continue;
      }

      const contentType = response.headers.get('content-type') || '';
      if (
        contentType &&
        !contentType.includes('application/json') &&
        !contentType.includes('+json')
      ) {
        log('assetLibrary.js', 'fetchAssetMapFromNetwork', 'warn', 'Asset map rejected due to Content-Type', {
          url,
          contentType,
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
  assetMapLoadGeneration += 1;
  categoryAssetsMemoryCache.clear();
  sectionAssetMapsMemory.clear();
  sectionAssetMapLoadPromises.clear();
  removeFromCache(ASSET_MAP_CACHE_KEY);
  removeFromCache(ASSET_MAP_SOURCE_CACHE_KEY);
  removeCacheKeysByPrefix(ASSET_CATEGORY_CACHE_PREFIX);
  removeCacheKeysByPrefix(SECTION_ASSET_MAP_CACHE_PREFIX);
  removeCacheKeysByPrefix(ASSET_URL_CACHE_PREFIX);
}

/**
 * @param {unknown} value
 * @returns {value is { environment?: string, section?: string }}
 */
function isGetAssetUrlOptions(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  return 'section' in value || 'environment' in value;
}

/**
 * Normalize {@link getAssetUrl} / {@link getAssetUrls} arguments (flag + env string or options).
 *
 * @param {string} flag
 * @param {string|{ environment?: string, section?: string }|null} [environmentOrOptions]
 * @returns {{ flag: string, environment: string|null, section: string|null }}
 */
export function normalizeGetAssetUrlArgs(flag, environmentOrOptions = null) {
  if (isGetAssetUrlOptions(environmentOrOptions)) {
    const section =
      typeof environmentOrOptions.section === 'string' &&
      isValidSectionAssetMapName(environmentOrOptions.section)
        ? environmentOrOptions.section.trim()
        : null;

    return {
      flag,
      environment:
        typeof environmentOrOptions.environment === 'string'
          ? environmentOrOptions.environment
          : null,
      section,
    };
  }

  return {
    flag,
    environment: typeof environmentOrOptions === 'string' ? environmentOrOptions : null,
    section: null,
  };
}

/**
 * @param {string} sectionName
 * @returns {string}
 */
function getSectionAssetMapCacheKey(sectionName) {
  return `${SECTION_ASSET_MAP_CACHE_PREFIX}${sectionName}`;
}

/**
 * @param {string} flag
 * @param {string} env
 * @param {string|null} section
 * @returns {string}
 */
function getAssetUrlCacheKey(flag, env, section) {
  const scope = section ? `s_${section}` : 'g';
  return `${ASSET_URL_CACHE_PREFIX}${scope}_${env}_${flag}`;
}

/**
 * @param {string} flag
 * @param {string} env
 * @param {string|null} section
 * @returns {string}
 */
function getAssetUrlMissCacheKey(flag, env, section) {
  const scope = section ? `s_${section}` : 'g';
  return `${ASSET_URL_MISS_CACHE_PREFIX}${scope}_${env}_${flag}`;
}

/**
 * Prefix for clearing section-specific URL caches (M-07).
 *
 * @param {string} sectionName
 * @returns {string}
 */
function getSectionAssetUrlCachePrefix(sectionName) {
  return `${ASSET_URL_CACHE_PREFIX}s_${sectionName}_`;
}

/**
 * @param {string} env
 * @param {string|null} section
 * @returns {string}
 */
function getAssetIndexCacheKey(env, section) {
  const scope = section ? `s_${section}` : 'g';
  return `${ASSET_INDEX_CACHE_PREFIX}${scope}_${env}`;
}

/**
 * Load optional per-section asset map overrides (404 / missing file → null).
 *
 * @param {string} sectionName
 * @returns {Promise<object|null>}
 */
export function loadSectionAssetMap(sectionName) {
  if (!isValidSectionAssetMapName(sectionName)) {
    return Promise.resolve(null);
  }

  const section = sectionName.trim();

  if (sectionAssetMapsMemory.has(section)) {
    return Promise.resolve(sectionAssetMapsMemory.get(section));
  }

  const cached = getValueFromCache(getSectionAssetMapCacheKey(section));

  if (cached) {
    sectionAssetMapsMemory.set(section, cached);
    return Promise.resolve(cached);
  }

  if (sectionAssetMapLoadPromises.has(section)) {
    return sectionAssetMapLoadPromises.get(section);
  }

  const loadPromise = (async () => {
    let assetMap = getBundledSectionAssetMap(section);

    if (!assetMap && shouldAllowRuntimeAssetMapFetch()) {
      assetMap = await fetchSectionAssetMapFromNetwork(section);
    }

    if (!assetMap) {
      return null;
    }

    sectionAssetMapsMemory.set(section, assetMap);
    setValueWithExpiration(getSectionAssetMapCacheKey(section), assetMap, SECTION_ASSET_MAP_CACHE_TTL);

    log('assetLibrary.js', 'loadSectionAssetMap', 'success', 'Section asset map loaded', {
      section,
      environments: Object.keys(assetMap),
    });

    return assetMap;
  })().finally(() => {
    sectionAssetMapLoadPromises.delete(section);
  });

  sectionAssetMapLoadPromises.set(section, loadPromise);
  return loadPromise;
}

/**
 * Bundled section override map names (from `assetMap.<section>.json` glob).
 * @returns {string[]}
 */
export function getKnownBundledSectionNames() {
  return listKnownBundledSectionNames();
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
 * @param {string|{ environment?: string, section?: string }} [environmentOrOptions] - Environment or options
 * @returns {boolean}
 */
export function isAssetCategoryCached(category, environmentOrOptions = null) {
  if (!category || typeof category !== 'string') {
    return false;
  }

  const { environment, section } = normalizeGetAssetUrlArgs('', environmentOrOptions);
  const env = environment || detectEnvironment();
  
  // Include section in cache key for proper isolation (M-01)
  const memoryKey = section
    ? `${getCategoryMemoryCacheKey(env, category)}:section:${section}`
    : getCategoryMemoryCacheKey(env, category);

  if (categoryAssetsMemoryCache.has(memoryKey)) {
    return true;
  }

  const cacheKey = section
    ? `${getAssetCategoryCacheKey(env, category)}:section:${section}`
    : getAssetCategoryCacheKey(env, category);

  return getValueFromCache(cacheKey) !== null;
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

  Object.keys(resolvedMap).forEach((flag) => {
    if (!flag.startsWith(categoryPrefix)) {
      return;
    }

    const resolved = resolveFlagUrlFromLoadedMap(flag, env, assetMap);

    if (resolved?.url) {
      matchingAssets[flag] = resolved.url;
    }
  });

  return matchingAssets;
}

/**
 * Build flag → URL map for a category with section overrides (M-01 step 4).
 * Section flags take precedence over global flags.
 *
 * @param {object} globalMap
 * @param {object|null} sectionMap
 * @param {string} env
 * @param {string} category
 * @returns {object}
 */
function buildAssetsByCategoryWithSectionOverride(globalMap, sectionMap, env, category) {
  // Start with global category assets
  const globalAssets = buildAssetsByCategoryFromMap(globalMap, env, category);

  if (!sectionMap) {
    return globalAssets;
  }

  // Get section category assets (these override global)
  const sectionAssets = buildAssetsByCategoryFromMap(sectionMap, env, category);

  // Merge: section takes precedence over global
  return { ...globalAssets, ...sectionAssets };
}

/**
 * @returns {string|null} How the current asset map was loaded
 */
export function getAssetMapConfigSource() {
  return assetMapConfigSource;
}

export function loadAssetMapConfig() {
  log('assetLibrary.js', 'loadAssetMapConfig', 'start', 'Loading asset map configuration', {});

  return ensureAssetMapLoaded().then((assetMap) => {
    if (assetMap) {
      log('assetLibrary.js', 'loadAssetMapConfig', 'return', 'Returning clone-on-read asset map', {
        source: assetMapConfigSource,
      });
      return cloneOnRead(assetMap);
    }

    return cloneOnRead(EMPTY_ASSET_MAP_SHAPE);
  });
}

/**
 * Load the shared asset map reference for internal resolution (no clone-on-read).
 *
 * @returns {Promise<object|null>}
 */
async function ensureAssetMapLoaded() {
  if (cachedAssetMap) {
    if (!assetMapConfigSource) {
      restoreAssetMapConfigSourceFromCache();
    }

    return cachedAssetMap;
  }

  const cachedConfig = getValueFromCache(ASSET_MAP_CACHE_KEY);
  if (cachedConfig) {
    cachedAssetMap = cachedConfig;
    restoreAssetMapConfigSourceFromCache();

    log('assetLibrary.js', 'loadAssetMapConfig', 'cache-hit', 'Asset map loaded from cache', {
      source: assetMapConfigSource,
    });
    return cachedAssetMap;
  }

  if (assetMapLoadPromise) {
    log('assetLibrary.js', 'loadAssetMapConfig', 'waiting', 'Asset map load in progress, waiting', {});
    return assetMapLoadPromise;
  }

  const loadGeneration = assetMapLoadGeneration;
  const loadPromise = (async () => {
    try {
      let assetMap;
      let source;

      if (shouldAllowRuntimeAssetMapFetch()) {
        log('assetLibrary.js', 'loadAssetMapConfig', 'fetch', 'Dev runtime override enabled', {
          candidates: getAssetMapFetchCandidates(),
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
          source,
        });
      }

      if (!isPlainObject(assetMap)) {
        throw new Error('Invalid asset map structure');
      }

      if (!assetMap.production) {
        log('assetLibrary.js', 'loadAssetMapConfig', 'warn', 'No production environment in asset map', {});
        assetMap.production = {};
      }

      log('assetLibrary.js', 'loadAssetMapConfig', 'success', 'Asset map loaded successfully', {
        environments: Object.keys(assetMap),
        totalFlags: Object.keys(assetMap.production || {}).length,
        source,
      });

      if (loadGeneration !== assetMapLoadGeneration) {
        log('assetLibrary.js', 'loadAssetMapConfig', 'stale', 'Asset map load skipped cache update due to newer generation', {
          source,
        });
        return assetMap;
      }

      cachedAssetMap = assetMap;
      assetMapConfigSource = source;
      setValueWithExpiration(ASSET_MAP_CACHE_KEY, assetMap, ASSET_MAP_CACHE_TTL);
      setValueWithExpiration(ASSET_MAP_SOURCE_CACHE_KEY, source, ASSET_MAP_CACHE_TTL);

      return assetMap;
    } catch (error) {
      logError('assetLibrary.js', 'loadAssetMapConfig', 'Failed to load asset map', error);
      return null;
    }
  })();

  assetMapLoadPromise = loadPromise.finally(() => {
    assetMapLoadPromise = null;
  });

  return assetMapLoadPromise;
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
 * @returns {{ url: string, ttl: number|null }|null}
 */
function normalizeAssetMapEntry(entry) {
  if (typeof entry === 'string') {
    return { url: entry, ttl: null };
  }

  if (entry && typeof entry === 'object' && typeof entry.url === 'string') {
    const rawTtl = entry.ttl ?? entry.ttlMs ?? null;
    let ttl = null;
    if (rawTtl !== null && rawTtl !== undefined) {
      const parsed = Number(rawTtl);
      ttl = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }
    return { url: entry.url, ttl };
  }

  return null;
}

function resolveFlagUrlFromLoadedMap(flag, env, assetMap) {
  let entry = assetMap[env]?.[flag];

  if (!entry && env !== 'production') {
    entry = assetMap.production?.[flag];
  }

  const normalizedEntry = normalizeAssetMapEntry(entry);

  if (!normalizedEntry) {
    return null;
  }

  const normalizedUrl = normalizeAssetMapUrl(normalizedEntry.url);
  const urlCheck = assertAllowedPreloadUrl(normalizedUrl, {
    assetType: inferAssetTypeFromFlag(flag),
  });

  if (!urlCheck.ok) {
    return null;
  }

  return {
    url: urlCheck.url,
    ttl: normalizedEntry.ttl,
  };
}

/**
 * Section-first, then global resolution (B-01).
 *
 * @param {string} flag
 * @param {string} env
 * @param {object} globalMap
 * @param {object|null} sectionMap
 * @returns {{ url: string|null, ttl: number|null, source: string|null }}
 */
function resolveFlagUrlWithSectionOverride(flag, env, globalMap, sectionMap) {
  if (sectionMap) {
    const sectionEntry = resolveFlagUrlFromLoadedMap(flag, env, sectionMap);

    if (sectionEntry) {
      return { url: sectionEntry.url, ttl: sectionEntry.ttl, source: 'section-map' };
    }
  }

  const globalEntry = resolveFlagUrlFromLoadedMap(flag, env, globalMap);

  if (globalEntry) {
    return { url: globalEntry.url, ttl: globalEntry.ttl, source: 'global-map' };
  }

  return { url: null, ttl: null, source: null };
}

/**
 * Single structured log line per {@link getAssetUrl} outcome (B-04).
 *
 * @param {object} params
 * @param {string} params.flag
 * @param {string} params.url
 * @param {'section-cache'|'section-map'|'global-cache'|'global-map'} params.source
 * @param {string} params.environment
 * @param {string|null} params.section
 * @param {boolean} params.cacheHit
 */
function logGetAssetUrlResolved({ flag, url, source, environment, section, cacheHit }) {
  log('assetLibrary.js', 'getAssetUrl', 'resolved', 'Flag resolved', {
    flag,
    url,
    source,
    environment,
    section: section || null,
    cacheHit,
  });
}

/**
 * @param {object} params
 * @param {string} params.flag
 * @param {string} params.environment
 * @param {string|null} params.section
 * @param {'not-found'|'blocked'} params.reason
 */
function logGetAssetUrlMiss({ flag, environment, section, reason }) {
  log(
    'assetLibrary.js',
    'getAssetUrl',
    reason,
    reason === 'blocked' ? 'URL blocked by policy' : 'Flag not found',
    {
      flag,
      environment,
      section: section || null,
    },
  );
}

/**
 * URL cache lookup + map resolution for one flag (P-04 / B-01).
 *
 * @param {string} flag
 * @param {string} env
 * @param {object} globalMap
 * @param {{ logResolution?: boolean, section?: string|null, sectionMap?: object|null }} [options]
 * @returns {string|null}
 */
function resolveAndCacheFlagUrl(flag, env, globalMap, options = {}) {
  const { logResolution = false, section = null, sectionMap = null } = options;
  const cacheKey = getAssetUrlCacheKey(flag, env, section);
  const missCacheKey = getAssetUrlMissCacheKey(flag, env, section);
  const missCached = getValueFromCache(missCacheKey);

  if (missCached) {
    if (logResolution) {
      logGetAssetUrlMiss({
        flag,
        environment: env,
        section,
        reason: 'not-found-cached',
      });
    }
    return null;
  }
  const cachedUrl = getValueFromCache(cacheKey);

  if (cachedUrl) {
    const cachedCheck = assertAllowedPreloadUrl(normalizeAssetMapUrl(cachedUrl), {
      assetType: inferAssetTypeFromFlag(flag),
    });

    if (cachedCheck.ok) {
      if (logResolution) {
        logGetAssetUrlResolved({
          flag,
          url: cachedCheck.url,
          source: section ? 'section-cache' : 'global-cache',
          environment: env,
          section,
          cacheHit: true,
        });
      }
      return cachedCheck.url;
    }

    removeFromCache(cacheKey);
  }

  const { url: safeUrl, ttl, source } = resolveFlagUrlWithSectionOverride(
    flag,
    env,
    globalMap,
    sectionMap,
  );

  if (!safeUrl) {
    if (logResolution) {
      const hadSectionRaw =
        sectionMap &&
        (sectionMap[env]?.[flag] ||
          (env !== 'production' && sectionMap.production?.[flag]));
      const hadGlobalRaw =
        globalMap[env]?.[flag] ||
        (env !== 'production' && globalMap.production?.[flag]);

      logGetAssetUrlMiss({
        flag,
        environment: env,
        section,
        reason: hadSectionRaw || hadGlobalRaw ? 'blocked' : 'not-found',
      });
    }
    setValueWithExpiration(missCacheKey, true, ASSET_URL_MISS_CACHE_TTL);
    return null;
  }

  if (logResolution) {
    logGetAssetUrlResolved({
      flag,
      url: safeUrl,
      source,
      environment: env,
      section,
      cacheHit: false,
    });
  }

  removeFromCache(missCacheKey);
  const ttlMs = Number.isFinite(ttl) && ttl > 0 ? ttl : ASSET_URL_CACHE_TTL;
  setValueWithExpiration(cacheKey, safeUrl, ttlMs);
  if (section) {
    sectionUrlCacheSections.add(section);
  }
  return safeUrl;
}

/**
 * Get asset URL for a given flag with environment inheritance
 *
 * @param {string} flag - Asset flag (e.g., "icon.cart")
 * @param {string|{ environment?: string, section?: string }} [environmentOrOptions] - Environment or options
 * @returns {Promise<string|null>} - Asset URL or null if not found
 */
export async function getAssetUrl(flag, environmentOrOptions = null) {
  const trimmedFlag = typeof flag === 'string' ? flag.trim() : flag;
  const { environment, section } = normalizeGetAssetUrlArgs(trimmedFlag, environmentOrOptions);

  if (environment && typeof environment === 'object') {
    logError(
      'assetLibrary.js',
      'getAssetUrl',
      'Invalid environment argument — pass a string or { environment, section }. Restart dev server if you recently pulled B-01.',
      new Error('environment must be a string'),
      { flag, environmentOrOptions },
    );
    return null;
  }

  if (!trimmedFlag || typeof trimmedFlag !== 'string') {
    log('assetLibrary.js', 'getAssetUrl', 'error', 'Invalid flag', { flag: trimmedFlag });
    return null;
  }

  const env = environment || detectEnvironment();

  try {
    const globalMap = (await ensureAssetMapLoaded()) || EMPTY_ASSET_MAP_SHAPE;
    const sectionMap = section ? await loadSectionAssetMap(section) : null;

    return resolveAndCacheFlagUrl(trimmedFlag, env, globalMap, {
      logResolution: true,
      section,
      sectionMap,
    });
  } catch (error) {
    logError('assetLibrary.js', 'getAssetUrl', 'Error getting asset URL', error, {
      flag: trimmedFlag,
      environment: env,
      section,
    });
    return null;
  }
}

/**
 * Synchronous lookup for already-resolved asset URLs (cache or warmed map only).
 *
 * @param {string} flag
 * @param {string|{ environment?: string, section?: string }} [environmentOrOptions]
 * @returns {string|null}
 */
export function getAssetUrlSync(flag, environmentOrOptions = null) {
  const trimmedFlag = typeof flag === 'string' ? flag.trim() : flag;
  const { environment, section } = normalizeGetAssetUrlArgs(trimmedFlag, environmentOrOptions);

  if (!trimmedFlag || typeof trimmedFlag !== 'string') {
    return null;
  }

  const env = environment || detectEnvironment();
  const missCacheKey = getAssetUrlMissCacheKey(trimmedFlag, env, section);
  if (getValueFromCache(missCacheKey)) {
    return null;
  }

  const cacheKey = getAssetUrlCacheKey(trimmedFlag, env, section);
  const cachedUrl = getValueFromCache(cacheKey);
  if (cachedUrl) {
    const cachedCheck = assertAllowedPreloadUrl(normalizeAssetMapUrl(cachedUrl), {
      assetType: inferAssetTypeFromFlag(trimmedFlag),
    });
    return cachedCheck.ok ? cachedCheck.url : null;
  }

  if (cachedAssetMap) {
    const sectionMap = section ? sectionAssetMapsMemory.get(section) || null : null;
    const resolved = resolveFlagUrlWithSectionOverride(trimmedFlag, env, cachedAssetMap, sectionMap);
    return resolved?.url || null;
  }

  return null;
}

/**
 * Get a CSS-safe `url("...")` string for a given asset flag.
 *
 * @param {string} flag
 * @param {string|{ environment?: string, section?: string }} [environmentOrOptions]
 * @returns {Promise<string|null>}
 */
export async function getAssetUrlForCss(flag, environmentOrOptions = null) {
  const url = await getAssetUrl(flag, environmentOrOptions);
  return url ? escapeUrlForCss(url) : null;
}

/**
 * Get a URL escaped for HTML attribute usage (src/href).
 *
 * @param {string} flag
 * @param {string|{ environment?: string, section?: string }} [environmentOrOptions]
 * @returns {Promise<string|null>}
 */
export async function getAssetUrlForAttr(flag, environmentOrOptions = null) {
  const url = await getAssetUrl(flag, environmentOrOptions);
  return url ? escapeUrlForAttr(url) : null;
}

/**
 * Get multiple asset URLs at once
 *
 * @param {Array<string>} flags - Array of asset flags
 * @param {string|{ environment?: string, section?: string }} [environmentOrOptions] - Environment or options
 * @returns {Promise<object>} - Map of flag to URL
 */
export async function getAssetUrls(flags, environmentOrOptions = null) {
  if (!Array.isArray(flags)) {
    log('assetLibrary.js', 'getAssetUrls', 'error', 'Invalid flags array', { flags });
    return {};
  }

  const section =
    environmentOrOptions &&
    typeof environmentOrOptions === 'object' &&
    !Array.isArray(environmentOrOptions)
      ? normalizeGetAssetUrlArgs('', environmentOrOptions).section
      : null;
  const environment =
    typeof environmentOrOptions === 'string'
      ? environmentOrOptions
      : environmentOrOptions?.environment ?? null;

  const uniqueFlags = [...new Set(flags)];

  log('assetLibrary.js', 'getAssetUrls', 'start', 'Getting multiple asset URLs', {
    flagCount: uniqueFlags.length,
    flags: uniqueFlags,
    section,
  });

  const env = environment || detectEnvironment();

  try {
    const globalMap = (await ensureAssetMapLoaded()) || EMPTY_ASSET_MAP_SHAPE;
    const sectionMap = section ? await loadSectionAssetMap(section) : null;
    const urlMap = {};

    for (const flag of uniqueFlags) {
      if (!flag || typeof flag !== 'string') {
        urlMap[flag] = null;
        continue;
      }

      const trimmedFlag = flag.trim();
      if (!trimmedFlag) {
        urlMap[flag] = null;
        continue;
      }

      urlMap[flag] = resolveAndCacheFlagUrl(trimmedFlag, env, globalMap, { section, sectionMap });
    }

    log('assetLibrary.js', 'getAssetUrls', 'success', 'Multiple asset URLs resolved', {
      total: uniqueFlags.length,
      resolved: Object.values(urlMap).filter(Boolean).length,
      missing: Object.values(urlMap).filter((url) => !url).length,
      mapLoad: 'single-pass',
      section,
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
    const assetMap = await ensureAssetMapLoaded();
    const flagArray = Object.keys(resolveAssetMapForEnvironment(assetMap || EMPTY_ASSET_MAP_SHAPE, env)).sort();

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
export async function hasAssetFlagInMap(flag, environmentOrOptions = null) {
  const trimmedFlag = typeof flag === 'string' ? flag.trim() : flag;
  const { environment, section } = normalizeGetAssetUrlArgs(trimmedFlag, environmentOrOptions);

  if (!trimmedFlag || typeof trimmedFlag !== 'string') {
    return false;
  }

  const env = environment || detectEnvironment();

  const globalMap = (await ensureAssetMapLoaded()) || EMPTY_ASSET_MAP_SHAPE;
  const sectionMap = section ? await loadSectionAssetMap(section) : null;
  const resolved = resolveFlagUrlWithSectionOverride(trimmedFlag, env, globalMap, sectionMap);
  return Boolean(resolved.url);
}

/**
 * Check if an asset flag exists
 * 
 * @param {string} flag - Asset flag to check
 * @param {string} [environment] - Optional environment override
 * @returns {Promise<boolean>} - True if flag exists
 */
export async function hasAssetFlag(flag, environmentOrOptions = null) {
  const trimmedFlag = typeof flag === 'string' ? flag.trim() : flag;
  const { environment, section } = normalizeGetAssetUrlArgs(trimmedFlag, environmentOrOptions);

  log('assetLibrary.js', 'hasAssetFlag', 'start', 'Checking if asset flag exists', {
    flag: trimmedFlag,
    environment,
    section,
  });

  try {
    const exists = await hasAssetFlagInMap(trimmedFlag, { environment, section });

    log('assetLibrary.js', 'hasAssetFlag', 'return', 'Asset flag existence check', { flag: trimmedFlag, exists });

    return exists;

  } catch (error) {
    logError('assetLibrary.js', 'hasAssetFlag', 'Error checking asset flag', error, { flag: trimmedFlag });
    return false;
  }
}

/**
 * Get all assets for a specific category (e.g., all "icon.*" flags)
 * 
 * @param {string} category - Category prefix (e.g., "icon", "logo", "image")
 * @param {string|{ environment?: string, section?: string }} [environmentOrOptions] - Environment or options
 * @returns {Promise<object>} - Map of flag to URL for matching category
 */
export async function getAssetsByCategory(category, environmentOrOptions = null) {
  const { environment, section } = normalizeGetAssetUrlArgs('', environmentOrOptions);

  log('assetLibrary.js', 'getAssetsByCategory', 'start', 'Getting assets by category', { 
    category, 
    environment,
    section: section || null
  });

  if (!category || typeof category !== 'string') {
    log('assetLibrary.js', 'getAssetsByCategory', 'error', 'Invalid category', { category });
    return {};
  }

  try {
    const env = environment || detectEnvironment();
    // Include section in cache key for proper isolation (M-01)
    const memoryKey = section 
      ? `${getCategoryMemoryCacheKey(env, category)}:section:${section}`
      : getCategoryMemoryCacheKey(env, category);
    const memoryCached = categoryAssetsMemoryCache.get(memoryKey);

    if (memoryCached) {
      log('assetLibrary.js', 'getAssetsByCategory', 'cache-hit', 'Category assets from memory cache', {
        category,
        environment: env,
        section: section || null,
        count: Object.keys(memoryCached).length
      });
      return memoryCached;
    }

    // Include section in cache key for proper isolation (M-01)
    const cacheKey = section
      ? `${getAssetCategoryCacheKey(env, category)}:section:${section}`
      : getAssetCategoryCacheKey(env, category);
    const cachedCategory = getValueFromCache(cacheKey);

    if (cachedCategory) {
      categoryAssetsMemoryCache.set(memoryKey, cachedCategory);
      log('assetLibrary.js', 'getAssetsByCategory', 'cache-hit', 'Category assets from cache', {
        category,
        environment: env,
        section: section || null,
        count: Object.keys(cachedCategory).length
      });
      return cachedCategory;
    }

    const globalMap = (await ensureAssetMapLoaded()) || EMPTY_ASSET_MAP_SHAPE;
    const sectionMap = section ? await loadSectionAssetMap(section) : null;

    // Merge section over global: section takes precedence (M-01)
    const matchingAssets = buildAssetsByCategoryWithSectionOverride(globalMap, sectionMap, env, category);
    const resolvedAssets = {};

    for (const flag of Object.keys(matchingAssets)) {
      const resolvedUrl = resolveAndCacheFlagUrl(flag, env, globalMap, {
        logResolution: true,
        section,
        sectionMap,
      });
      if (resolvedUrl) {
        resolvedAssets[flag] = resolvedUrl;
      }
    }

    categoryAssetsMemoryCache.set(memoryKey, resolvedAssets);
    setValueWithExpiration(cacheKey, resolvedAssets, ASSET_CATEGORY_CACHE_TTL);

    log('assetLibrary.js', 'getAssetsByCategory', 'success', 'Assets by category retrieved', {
      category,
      environment: env,
      section: section || null,
      count: Object.keys(resolvedAssets).length,
      cached: true,
      source: sectionMap ? 'merged-section-global' : 'global-only'
    });

    return resolvedAssets;

  } catch (error) {
    logError('assetLibrary.js', 'getAssetsByCategory', 'Error getting assets by category', error, { 
      category,
      section: section || null
    });
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
 * Prime and cache merged flag index for fast lookup (A-M01).
 *
 * @param {object} [options]
 * @param {string} [options.environment] - Optional environment override
 * @param {string} [options.section] - Optional section name
 * @returns {Promise<{ environment: string, section: string|null, flags: object, flagCount: number }>}
 */
export async function primeAssetIndex(options = {}) {
  const env = options.environment || detectEnvironment();
  const section = typeof options.section === 'string' ? options.section : null;
  const cacheKey = getAssetIndexCacheKey(env, section);

  if (assetIndexMemoryCache.has(cacheKey)) {
    const cached = assetIndexMemoryCache.get(cacheKey);
    return {
      environment: env,
      section,
      flags: cached,
      flagCount: Object.keys(cached).length,
    };
  }

  const cached = getValueFromCache(cacheKey);
  if (cached) {
    assetIndexMemoryCache.set(cacheKey, cached);
    return {
      environment: env,
      section,
      flags: cached,
      flagCount: Object.keys(cached).length,
    };
  }

  const globalMap = (await ensureAssetMapLoaded()) || EMPTY_ASSET_MAP_SHAPE;
  const sectionMap = section ? await loadSectionAssetMap(section) : null;
  const globalResolved = resolveAssetMapForEnvironment(globalMap, env);
  const sectionResolved = sectionMap ? resolveAssetMapForEnvironment(sectionMap, env) : {};
  const flagsToResolve = new Set([
    ...Object.keys(globalResolved),
    ...Object.keys(sectionResolved),
  ]);
  const merged = {};

  for (const flag of flagsToResolve) {
    const resolved = resolveFlagUrlWithSectionOverride(flag, env, globalMap, sectionMap);
    if (resolved.url) {
      merged[flag] = resolved.url;
    }
  }

  assetIndexMemoryCache.set(cacheKey, merged);
  setValueWithExpiration(cacheKey, merged, ASSET_INDEX_CACHE_TTL);

  return {
    environment: env,
    section,
    flags: merged,
    flagCount: Object.keys(merged).length,
  };
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

    if (typeof window !== 'undefined' && window.performanceTracker) {
      window.performanceTracker.step({
        step: 'initAssetLibrary_start',
        file: 'assetLibrary.js',
        method: 'initAssetLibrary',
        flag: 'asset-init',
        purpose: 'Eager asset map and URL cache warm-up',
      });
    }

    await ensureAssetMapLoaded();

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

    if (typeof window !== 'undefined' && window.performanceTracker) {
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
 * @param {string|{ environment?: string, section?: string }} [environmentOrOptions] - Environment or options
 * @returns {Promise<number>} - Number of assets preloaded
 */
export async function preloadAssetUrls(flags, environmentOrOptions = null) {
  const section =
    environmentOrOptions &&
    typeof environmentOrOptions === 'object' &&
    !Array.isArray(environmentOrOptions)
      ? normalizeGetAssetUrlArgs('', environmentOrOptions).section
      : null;
  const environment =
    typeof environmentOrOptions === 'string'
      ? environmentOrOptions
      : environmentOrOptions?.environment ?? null;

  if (!Array.isArray(flags)) {
    log('assetLibrary.js', 'preloadAssetUrls', 'error', 'Invalid flags array', { flags });
    return 0;
  }

  log('assetLibrary.js', 'preloadAssetUrls', 'start', 'Preloading asset URLs', {
    flagCount: flags.length,
    environment,
    section,
  });

  try {
    const urlMap = await getAssetUrls(
      flags,
      section || environment ? { environment, section } : environment,
    );
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
 * @param {object} [options] - Validation options
 * @param {string} [options.section] - Optional section name to validate with section overrides
 * @returns {Promise<object>} - Validation result with errors and warnings
 */
export async function validateAssetMap(options = {}) {
  const { section = null } = options;
  
  log('assetLibrary.js', 'validateAssetMap', 'start', 'Validating asset map configuration', {
    section: section || null
  });

  try {
    const globalMap = (await ensureAssetMapLoaded()) || EMPTY_ASSET_MAP_SHAPE;
    const sectionMap = section ? await loadSectionAssetMap(section) : null;
    
    // Use merged map for validation: section takes precedence (M-01)
    const assetMap = sectionMap 
      ? mergeSectionAssetMapForValidation(globalMap, sectionMap)
      : globalMap;
    
    const errors = [];
    const warnings = [];
    const sectionFlags = new Set(); // Track which flags came from section map

    // Check if production environment exists
    if (!assetMap.production || Object.keys(assetMap.production).length === 0) {
      errors.push('Production environment is missing or empty');
    }

    // Track section-originated flags for reporting
    if (sectionMap?.production) {
      Object.keys(sectionMap.production).forEach(flag => sectionFlags.add(flag));
    }
    if (sectionMap?.development) {
      Object.keys(sectionMap.development).forEach(flag => sectionFlags.add(flag));
    }
    if (sectionMap?.staging) {
      Object.keys(sectionMap.staging).forEach(flag => sectionFlags.add(flag));
    }

    // Check for valid URLs
    Object.entries(assetMap).forEach(([env, assets]) => {
      if (typeof assets !== 'object') {
        errors.push(`Environment "${env}" has invalid structure`);
        return;
      }

      Object.entries(assets).forEach(([flag, url]) => {
        const source = sectionFlags.has(flag) ? 'section' : 'global';
        const normalized = normalizeAssetMapEntry(url);

        if (!normalized || !normalized.url.trim()) {
          errors.push(`Invalid URL for flag "${flag}" in environment "${env}" (${source})`);
          return;
        }

        if (url && typeof url === 'object') {
          const rawTtl = url.ttl ?? url.ttlMs;
          if (rawTtl !== undefined && rawTtl !== null) {
            const parsedTtl = Number(rawTtl);
            if (!Number.isFinite(parsedTtl) || parsedTtl <= 0) {
              warnings.push(`Flag "${flag}" in "${env}" has invalid ttl "${rawTtl}" (${source})`);
            }
          }
        }

        const resolvedUrl = normalized.url;

        // Check URL format
        if (!resolvedUrl.startsWith('/') && !resolvedUrl.startsWith('http://') && !resolvedUrl.startsWith('https://')) {
          warnings.push(`URL for flag "${flag}" in environment "${env}" may be invalid: ${resolvedUrl} (${source})`);
        }

        const hostnameIssue = validateRemoteAssetUrl(resolvedUrl);
        if (hostnameIssue) {
          errors.push(`Flag "${flag}" in environment "${env}": ${hostnameIssue} (${source})`);
        }

        if (resolvedUrl.startsWith('http://')) {
          try {
            const parsed = new URL(resolvedUrl);

            if (!isLocalhostHostname(parsed.hostname)) {
              const upgraded = normalizeAssetMapUrl(resolvedUrl);

              if (env === 'production') {
                errors.push(
                  `Production flag "${flag}" uses HTTP; use HTTPS (${upgraded}) (${source})`,
                );
              } else {
                warnings.push(
                  `Flag "${flag}" in "${env}" uses HTTP; will be upgraded to HTTPS at runtime (${upgraded}) (${source})`,
                );
              }
            }
          } catch {
            warnings.push(`HTTP URL for flag "${flag}" in environment "${env}" is malformed: ${resolvedUrl} (${source})`);
          }
        }
      });
    });

    // Check for flags in dev/staging that don't exist in production
    ['development', 'staging'].forEach(env => {
      if (assetMap[env]) {
        Object.keys(assetMap[env]).forEach(flag => {
          const source = sectionFlags.has(flag) ? 'section' : 'global';
          if (!assetMap.production?.[flag]) {
            warnings.push(`Flag "${flag}" exists in ${env} but not in production (no fallback) (${source})`);
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
        environments: Object.keys(assetMap).length,
        section: section || null,
        sectionFlagCount: sectionFlags.size,
        merged: !!sectionMap
      }
    };

    log('assetLibrary.js', 'validateAssetMap', 'complete', 'Asset map validation complete', result.summary);

    return result;

  } catch (error) {
    logError('assetLibrary.js', 'validateAssetMap', 'Error validating asset map', error, { section });
    return {
      valid: false,
      errors: [`Failed to load asset map: ${error.message}`],
      warnings: [],
      summary: {
        totalErrors: 1,
        totalWarnings: 0,
        environments: 0,
        section: section || null,
        sectionFlagCount: 0,
        merged: false
      }
    };
  }
}

/**
 * Merge section asset map over global for validation purposes (M-01).
 * Section flags take precedence over global flags.
 * 
 * @param {object} globalMap-
 * @param {object} sectionMap
 * @returns {object} Merged map
 */
function mergeSectionAssetMapForValidation(globalMap, sectionMap) {
  const merged = {};
  
  // Get all environment keys from both maps
  const environments = new Set([
    ...Object.keys(globalMap),
    ...Object.keys(sectionMap)
  ]);
  
  environments.forEach(env => {
    const globalEnv = globalMap[env] || {};
    const sectionEnv = sectionMap[env] || {};
    
    // Section takes precedence: spread global first, then section overrides
    merged[env] = { ...globalEnv, ...sectionEnv };
  });
  
  // Handle production fallback for environments missing in section map
  // but present in global map
  ['development', 'staging'].forEach(env => {
    if (globalMap[env] && !sectionMap[env] && sectionMap.production) {
      // If section has production but not this env, merge section production over global env
      const globalEnv = globalMap[env] || {};
      merged[env] = { ...globalEnv, ...sectionMap.production };
    }
  });
  
  return merged;
}

