// vueApp-main-new/src/utils/assets/assetPreloader.js

import { log } from '../common/logHandler';
import { logError } from '../common/errorHandler.js';
import { getAssetUrl } from './assetLibrary';
import { usePreloadStore } from '../../stores/usePreloadStore.js';

/**
 * @file assetPreloader.js
 * @description Asset preloading utilities for images, fonts, media, and scripts
 * @purpose Preload assets per section to optimize performance
 */

// Performance tracker available globally as window.performanceTracker

// Track in-progress preloads to avoid duplicate requests
const preloadInProgress = new Map();

/**
 * @function preloadImage
 * @description Preload an image asset
 * @param {string} src - Image source URL
 * @param {object} options - Preload options
 * @returns {Promise<HTMLImageElement>} Loaded image element
 */
export function preloadImage(src, options = {}) {
  const preloadStore = usePreloadStore();

  log('assetPreloader.js', 'preloadImage', 'start', 'Preloading image', { src, options });
  window.performanceTracker.step({
    step: 'preloadImage_start',
    file: 'assetPreloader.js',
    method: 'preloadImage',
    flag: 'start',
    purpose: 'Preload image asset'
  });

  if (preloadStore.hasAsset(src)) {
    log('assetPreloader.js', 'preloadImage', 'already-preloaded', 'Image already preloaded', { src });
    window.performanceTracker.step({
      step: 'preloadImage_cached',
      file: 'assetPreloader.js',
      method: 'preloadImage',
      flag: 'cache-hit',
      purpose: 'Image already preloaded'
    });
    return Promise.resolve(null);
  }

  if (preloadInProgress.has(src)) {
    log('assetPreloader.js', 'preloadImage', 'in-progress', 'Image preload already in progress', { src });
    return preloadInProgress.get(src);
  }

  // Check if a link with the same href already exists in the DOM
  const existingLink = document.querySelector(`link[rel="preload"][href="${src}"]`);
  if (existingLink) {
    log('assetPreloader.js', 'preloadImage', 'already-exists', 'Image preload link already exists in DOM', { src });
    preloadStore.addAsset(src);
    window.performanceTracker.step({
      step: 'preloadImage_dom_exists',
      file: 'assetPreloader.js',
      method: 'preloadImage',
      flag: 'dom-exists',
      purpose: 'Image preload link already in DOM'
    });
    return Promise.resolve(null);
  }

  const promise = new Promise((resolve, reject) => {
    // Use link preload instead of Image object for better browser caching
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;

    if (options.crossOrigin) {
      link.crossOrigin = options.crossOrigin;
    }

    link.onload = () => {
      preloadStore.addAsset(src);
      preloadInProgress.delete(src);
      log('assetPreloader.js', 'preloadImage', 'success', 'Image preloaded successfully', { src });
      window.performanceTracker.step({
        step: 'preloadImage_complete',
        file: 'assetPreloader.js',
        method: 'preloadImage',
        flag: 'success',
        purpose: 'Image preload complete'
      });
      resolve();
    };

    link.onerror = (error) => {
      preloadInProgress.delete(src);
      log('assetPreloader.js', 'preloadImage', 'error', 'Image preload failed', {
        src,
        error: error.message || 'Load error'
      });
      window.performanceTracker.step({
        step: 'preloadImage_error',
        file: 'assetPreloader.js',
        method: 'preloadImage',
        flag: 'error',
        purpose: 'Image preload failed'
      });
      reject(new Error(`Failed to preload image: ${src}`));
    };

    // Append to document head to start preload
    document.head.appendChild(link);
  });

  preloadInProgress.set(src, promise);
  return promise;
}

/**
 * @function preloadFont
 * @description Preload a font asset
 * @param {string} src - Font source URL
 * @param {object} options - Preload options
 * @returns {Promise<void>} Completion promise
 */
export function preloadFont(src, options = {}) {
  const preloadStore = usePreloadStore();

  log('assetPreloader.js', 'preloadFont', 'start', 'Preloading font', { src, options });
  window.performanceTracker.step({
    step: 'preloadFont_start',
    file: 'assetPreloader.js',
    method: 'preloadFont',
    flag: 'start',
    purpose: 'Preload font asset'
  });

  if (preloadStore.hasAsset(src)) {
    log('assetPreloader.js', 'preloadFont', 'already-preloaded', 'Font already preloaded', { src });
    window.performanceTracker.step({
      step: 'preloadFont_cached',
      file: 'assetPreloader.js',
      method: 'preloadFont',
      flag: 'cache-hit',
      purpose: 'Font already preloaded'
    });
    return Promise.resolve();
  }

  if (preloadInProgress.has(src)) {
    log('assetPreloader.js', 'preloadFont', 'in-progress', 'Font preload already in progress', { src });
    return preloadInProgress.get(src);
  }

  const promise = new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.href = src;
    link.type = options.type || 'font/woff2';

    if (options.crossOrigin !== false) {
      link.crossOrigin = 'anonymous';
    }

    link.onload = () => {
      preloadStore.addAsset(src);
      preloadInProgress.delete(src);
      log('assetPreloader.js', 'preloadFont', 'success', 'Font preloaded successfully', { src });
      window.performanceTracker.step({
        step: 'preloadFont_complete',
        file: 'assetPreloader.js',
        method: 'preloadFont',
        flag: 'success',
        purpose: 'Font preload complete'
      });
      resolve();
    };

    link.onerror = (error) => {
      preloadInProgress.delete(src);
      log('assetPreloader.js', 'preloadFont', 'error', 'Font preload failed', {
        src,
        error: error.message || 'Load error'
      });
      window.performanceTracker.step({
        step: 'preloadFont_error',
        file: 'assetPreloader.js',
        method: 'preloadFont',
        flag: 'error',
        purpose: 'Font preload failed'
      });
      reject(new Error(`Failed to preload font: ${src}`));
    };

    document.head.appendChild(link);
  });

  preloadInProgress.set(src, promise);
  return promise;
}

/**
 * @function preloadMedia
 * @description Preload a media asset (video/audio)
 * @param {string} src - Media source URL
 * @param {string} type - Media type ('video' or 'audio')
 * @param {object} options - Preload options
 * @returns {Promise<void>} Completion promise
 */
export function preloadMedia(src, type = 'video', options = {}) {
  const preloadStore = usePreloadStore();

  log('assetPreloader.js', 'preloadMedia', 'start', 'Preloading media', { src, type, options });
  window.performanceTracker.step({
    step: 'preloadMedia_start',
    file: 'assetPreloader.js',
    method: 'preloadMedia',
    flag: 'start',
    purpose: 'Preload media asset'
  });

  if (preloadStore.hasAsset(src)) {
    log('assetPreloader.js', 'preloadMedia', 'already-preloaded', 'Media already preloaded', { src });
    window.performanceTracker.step({
      step: 'preloadMedia_cached',
      file: 'assetPreloader.js',
      method: 'preloadMedia',
      flag: 'cache-hit',
      purpose: 'Media already preloaded'
    });
    return Promise.resolve();
  }

  if (preloadInProgress.has(src)) {
    log('assetPreloader.js', 'preloadMedia', 'in-progress', 'Media preload already in progress', { src });
    return preloadInProgress.get(src);
  }

  const promise = new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = type;
    link.href = src;

    if (options.type) {
      link.type = options.type;
    }

    link.onload = () => {
      preloadStore.addAsset(src);
      preloadInProgress.delete(src);
      log('assetPreloader.js', 'preloadMedia', 'success', 'Media preloaded successfully', { src, type });
      window.performanceTracker.step({
        step: 'preloadMedia_complete',
        file: 'assetPreloader.js',
        method: 'preloadMedia',
        flag: 'success',
        purpose: 'Media preload complete'
      });
      resolve();
    };

    link.onerror = (error) => {
      preloadInProgress.delete(src);
      log('assetPreloader.js', 'preloadMedia', 'error', 'Media preload failed', {
        src,
        type,
        error: error.message || 'Load error'
      });
      window.performanceTracker.step({
        step: 'preloadMedia_error',
        file: 'assetPreloader.js',
        method: 'preloadMedia',
        flag: 'error',
        purpose: 'Media preload failed'
      });
      reject(new Error(`Failed to preload ${type}: ${src}`));
    };

    document.head.appendChild(link);
  });

  preloadInProgress.set(src, promise);
  return promise;
}

/**
 * @function preloadScript
 * @description Preload a script asset
 * @param {string} src - Script source URL
 * @param {object} options - Preload options
 * @returns {Promise<void>} Completion promise
 */
export function preloadScript(src, options = {}) {
  const preloadStore = usePreloadStore();

  log('assetPreloader.js', 'preloadScript', 'start', 'Preloading script', { src, options });
  window.performanceTracker.step({
    step: 'preloadScript_start',
    file: 'assetPreloader.js',
    method: 'preloadScript',
    flag: 'start',
    purpose: 'Preload script asset'
  });

  if (preloadStore.hasAsset(src)) {
    log('assetPreloader.js', 'preloadScript', 'already-preloaded', 'Script already preloaded', { src });
    window.performanceTracker.step({
      step: 'preloadScript_cached',
      file: 'assetPreloader.js',
      method: 'preloadScript',
      flag: 'cache-hit',
      purpose: 'Script already preloaded'
    });
    return Promise.resolve();
  }

  if (preloadInProgress.has(src)) {
    log('assetPreloader.js', 'preloadScript', 'in-progress', 'Script preload already in progress', { src });
    return preloadInProgress.get(src);
  }

  const promise = new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = src;

    if (options.crossOrigin) {
      link.crossOrigin = options.crossOrigin;
    }

    link.onload = () => {
      preloadStore.addAsset(src);
      preloadInProgress.delete(src);
      log('assetPreloader.js', 'preloadScript', 'success', 'Script preloaded successfully', { src });
      window.performanceTracker.step({
        step: 'preloadScript_complete',
        file: 'assetPreloader.js',
        method: 'preloadScript',
        flag: 'success',
        purpose: 'Script preload complete'
      });
      resolve();
    };

    link.onerror = (error) => {
      preloadInProgress.delete(src);
      log('assetPreloader.js', 'preloadScript', 'error', 'Script preload failed', {
        src,
        error: error.message || 'Load error'
      });
      window.performanceTracker.step({
        step: 'preloadScript_error',
        file: 'assetPreloader.js',
        method: 'preloadScript',
        flag: 'error',
        purpose: 'Script preload failed'
      });
      reject(new Error(`Failed to preload script: ${src}`));
    };

    document.head.appendChild(link);
  });

  preloadInProgress.set(src, promise);
  return promise;
}

// Cache for JSON data
const jsonDataCache = new Map();

/**
 * @function preloadJSON
 * @description Preload and cache a JSON file
 * @param {string} src - JSON file URL/path
 * @param {object} options - Preload options
 * @returns {Promise<object>} Loaded JSON data
 */
export async function preloadJSON(src, options = {}) {
  const preloadStore = usePreloadStore();

  log('assetPreloader.js', 'preloadJSON', 'start', 'Preloading JSON', { src, options });
  window.performanceTracker.step({
    step: 'preloadJSON_start',
    file: 'assetPreloader.js',
    method: 'preloadJSON',
    flag: 'start',
    purpose: 'Preload JSON asset'
  });

  // Check if JSON data is already cached
  if (jsonDataCache.has(src)) {
    log('assetPreloader.js', 'preloadJSON', 'cache-hit', 'JSON already cached', { src });
    window.performanceTracker.step({
      step: 'preloadJSON_cached',
      file: 'assetPreloader.js',
      method: 'preloadJSON',
      flag: 'cache-hit',
      purpose: 'JSON already cached'
    });
    return jsonDataCache.get(src);
  }

  // Check if load is in progress
  if (preloadInProgress.has(src)) {
    log('assetPreloader.js', 'preloadJSON', 'in-progress', 'JSON load already in progress', { src });
    return preloadInProgress.get(src);
  }

  const promise = new Promise(async (resolve, reject) => {
    try {
      log('assetPreloader.js', 'preloadJSON', 'fetching', 'Fetching JSON file', { src });

      const response = await fetch(src);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Cache the parsed JSON data
      jsonDataCache.set(src, data);
      preloadStore.addAsset(src);
      preloadInProgress.delete(src);

      log('assetPreloader.js', 'preloadJSON', 'success', 'JSON loaded and cached successfully', { src });
      window.performanceTracker.step({
        step: 'preloadJSON_complete',
        file: 'assetPreloader.js',
        method: 'preloadJSON',
        flag: 'success',
        purpose: 'JSON preload complete'
      });

      resolve(data);
    } catch (error) {
      preloadInProgress.delete(src);
      log('assetPreloader.js', 'preloadJSON', 'error', 'JSON load failed', {
        src,
        error: error.message,
        stack: error.stack
      });
      window.performanceTracker.step({
        step: 'preloadJSON_error',
        file: 'assetPreloader.js',
        method: 'preloadJSON',
        flag: 'error',
        purpose: 'JSON preload failed'
      });
      reject(new Error(`Failed to preload JSON: ${src} - ${error.message}`));
    }
  });

  preloadInProgress.set(src, promise);
  return promise;
}

/**
 * @function preloadAsset
 * @description Preload a single asset based on type
 * @param {object} asset - Asset definition { src, type, priority, ...options }
 * @returns {Promise<void>} Completion promise
 */
export async function preloadAsset(asset) {
  log('assetPreloader.js', 'preloadAsset', 'start', 'Preloading asset', { asset });
  window.performanceTracker.step({
    step: 'preloadAsset_start',
    file: 'assetPreloader.js',
    method: 'preloadAsset',
    flag: 'start',
    purpose: 'Preload single asset'
  });

  try {
    let { src, type, flag, ...options } = asset;

    // If src is missing but flag is provided, resolve it
    if (!src && flag) {
      src = await getAssetUrl(flag);
      if (!src) {
        log('assetPreloader.js', 'preloadAsset', 'warn', 'Failed to resolve asset flag', { flag });
        return;
      }
    }

    if (!src) {
      log('assetPreloader.js', 'preloadAsset', 'warn', 'Missing src and flag for asset', { asset });
      return;
    }

    switch (type) {
      case 'image':
        await preloadImage(src, options);
        break;
      case 'font':
        await preloadFont(src, options);
        break;
      case 'video':
        await preloadMedia(src, 'video', options);
        break;
      case 'audio':
        await preloadMedia(src, 'audio', options);
        break;
      case 'script':
        await preloadScript(src, options);
        break;
      case 'json':
        await preloadJSON(src, options);
        break;
      default:
        log('assetPreloader.js', 'preloadAsset', 'unknown-type', 'Unknown asset type', { src, type });
        window.performanceTracker.step({
          step: 'preloadAsset_unknown_type',
          file: 'assetPreloader.js',
          method: 'preloadAsset',
          flag: 'unknown',
          purpose: 'Unknown asset type'
        });
        return;
    }

    log('assetPreloader.js', 'preloadAsset', 'success', 'Asset preloaded', { src, type });
    window.performanceTracker.step({
      step: 'preloadAsset_complete',
      file: 'assetPreloader.js',
      method: 'preloadAsset',
      flag: 'success',
      purpose: 'Asset preload complete'
    });
  } catch (error) {
    log('assetPreloader.js', 'preloadAsset', 'error', 'Asset preload failed', {
      asset,
      error: error.message,
      stack: error.stack
    });
    window.performanceTracker.step({
      step: 'preloadAsset_error',
      file: 'assetPreloader.js',
      method: 'preloadAsset',
      flag: 'error',
      purpose: 'Asset preload failed'
    });
    // Don't throw - continue preloading other assets
  }
}

/**
 * @function preloadAssets
 * @description Preload multiple assets in parallel
 * @param {Array<object>} assets - Array of asset definitions
 * @returns {Promise<void>} Completion promise
 */
export async function preloadAssets(assets) {
  log('assetPreloader.js', 'preloadAssets', 'start', 'Preloading multiple assets', { count: assets.length });
  window.performanceTracker.step({
    step: 'preloadAssets_start',
    file: 'assetPreloader.js',
    method: 'preloadAssets',
    flag: 'start',
    purpose: 'Preload multiple assets'
  });

  try {
    // Sort by priority (high first)
    const sortedAssets = [...assets].sort((a, b) => {
      const priorityMap = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityMap[a.priority] || 1;
      const bPriority = priorityMap[b.priority] || 1;
      return bPriority - aPriority;
    });

    log('assetPreloader.js', 'preloadAssets', 'sorted', 'Assets sorted by priority', { count: sortedAssets.length });

    // Preload all assets in parallel
    await Promise.allSettled(sortedAssets.map(asset => preloadAsset(asset)));

    log('assetPreloader.js', 'preloadAssets', 'success', 'All assets preloaded', { count: assets.length });
    window.performanceTracker.step({
      step: 'preloadAssets_complete',
      file: 'assetPreloader.js',
      method: 'preloadAssets',
      flag: 'success',
      purpose: 'Multiple assets preload complete'
    });
  } catch (error) {
    log('assetPreloader.js', 'preloadAssets', 'error', 'Error preloading assets', {
      error: error.message,
      stack: error.stack
    });
    window.performanceTracker.step({
      step: 'preloadAssets_error',
      file: 'assetPreloader.js',
      method: 'preloadAssets',
      flag: 'error',
      purpose: 'Multiple assets preload failed'
    });
  }
}

/**
 * @function preloadSectionCriticalImages
 * @description Preload only high-priority images for a specific section (for blocking preload before component mount)
 * @param {string} sectionName - Section name
 * @returns {Promise<void>} Completion promise
 */
export async function preloadSectionCriticalImages(sectionName) {
  log('assetPreloader.js', 'preloadSectionCriticalImages', 'start', 'Preloading critical section images', { sectionName });
  window.performanceTracker.step({
    step: 'preloadSectionCriticalImages_start',
    file: 'assetPreloader.js',
    method: 'preloadSectionCriticalImages',
    flag: 'start',
    purpose: 'Preload critical images for section'
  });

  try {
    // Get section manifest
    const { getRouteConfiguration } = await import('../route/routeConfigLoader');
    const routes = getRouteConfiguration();

    // Find all routes for this section
    const sectionRoutes = routes.filter(route => {
      if (typeof route.section === 'string') {
        return route.section === sectionName;
      }
      if (typeof route.section === 'object') {
        return Object.values(route.section).includes(sectionName);
      }
      return false;
    });

    log('assetPreloader.js', 'preloadSectionCriticalImages', 'routes-found', 'Section routes found', {
      sectionName,
      routeCount: sectionRoutes.length
    });

    // Collect only high-priority image assets from these routes
    const criticalAssets = [];
    for (const route of sectionRoutes) {
      if (route.assetPreload && Array.isArray(route.assetPreload)) {
        // Filter for high-priority images only
        const highPriorityImages = route.assetPreload.filter(asset => 
          asset.type === 'image' && (asset.priority === 'high' || asset.priority === 'critical')
        );
        criticalAssets.push(...highPriorityImages);
      }
    }

    log('assetPreloader.js', 'preloadSectionCriticalImages', 'assets-collected', 'Critical images collected for section', {
      sectionName,
      assetCount: criticalAssets.length
    });

    // Preload critical images (await to ensure they're loaded before components mount)
    if (criticalAssets.length > 0) {
      await preloadAssets(criticalAssets);
    }

    log('assetPreloader.js', 'preloadSectionCriticalImages', 'success', 'Critical section images preloaded', {
      sectionName,
      assetCount: criticalAssets.length
    });
    window.performanceTracker.step({
      step: 'preloadSectionCriticalImages_complete',
      file: 'assetPreloader.js',
      method: 'preloadSectionCriticalImages',
      flag: 'success',
      purpose: 'Critical section images preload complete'
    });
  } catch (error) {
    log('assetPreloader.js', 'preloadSectionCriticalImages', 'error', 'Error preloading critical section images', {
      sectionName,
      error: error.message,
      stack: error.stack
    });
    window.performanceTracker.step({
      step: 'preloadSectionCriticalImages_error',
      file: 'assetPreloader.js',
      method: 'preloadSectionCriticalImages',
      flag: 'error',
      purpose: 'Critical section images preload failed'
    });
    // Don't throw - continue navigation even if preload fails
  }
}

/**
 * @function preloadSectionAssets
 * @description Preload all assets for a specific section
 * @param {string} sectionName - Section name
 * @returns {Promise<void>} Completion promise
 */
export async function preloadSectionAssets(sectionName) {
  log('assetPreloader.js', 'preloadSectionAssets', 'start', 'Preloading section assets', { sectionName });
  window.performanceTracker.step({
    step: 'preloadSectionAssets_start',
    file: 'assetPreloader.js',
    method: 'preloadSectionAssets',
    flag: 'start',
    purpose: 'Preload all assets for section'
  });

  try {
    // Get section manifest
    const { getRouteConfiguration } = await import('../route/routeConfigLoader');
    const routes = getRouteConfiguration();

    // Find all routes for this section
    const sectionRoutes = routes.filter(route => {
      if (typeof route.section === 'string') {
        return route.section === sectionName;
      }
      if (typeof route.section === 'object') {
        return Object.values(route.section).includes(sectionName);
      }
      return false;
    });

    log('assetPreloader.js', 'preloadSectionAssets', 'routes-found', 'Section routes found', {
      sectionName,
      routeCount: sectionRoutes.length
    });

    // Collect all assets from these routes
    const allAssets = [];
    for (const route of sectionRoutes) {
      if (route.assetPreload && Array.isArray(route.assetPreload)) {
        allAssets.push(...route.assetPreload);
      }
    }

    log('assetPreloader.js', 'preloadSectionAssets', 'assets-collected', 'Assets collected for section', {
      sectionName,
      assetCount: allAssets.length
    });

    // Preload all collected assets
    await preloadAssets(allAssets);

    log('assetPreloader.js', 'preloadSectionAssets', 'success', 'Section assets preloaded', {
      sectionName,
      assetCount: allAssets.length
    });
    window.performanceTracker.step({
      step: 'preloadSectionAssets_complete',
      file: 'assetPreloader.js',
      method: 'preloadSectionAssets',
      flag: 'success',
      purpose: 'Section assets preload complete'
    });
  } catch (error) {
    log('assetPreloader.js', 'preloadSectionAssets', 'error', 'Error preloading section assets', {
      sectionName,
      error: error.message,
      stack: error.stack
    });
    window.performanceTracker.step({
      step: 'preloadSectionAssets_error',
      file: 'assetPreloader.js',
      method: 'preloadSectionAssets',
      flag: 'error',
      purpose: 'Section assets preload failed'
    });
  }
}

/**
 * @function clearPreloadCache
 * @description Clear the preloaded assets cache
 * @returns {void}
 */
export function clearPreloadCache() {
  const preloadStore = usePreloadStore();
  log('assetPreloader.js', 'clearPreloadCache', 'start', 'Clearing preload cache', { cacheSize: preloadStore.preloadedAssets.length });
  window.performanceTracker.step({
    step: 'clearPreloadCache',
    file: 'assetPreloader.js',
    method: 'clearPreloadCache',
    flag: 'clear',
    purpose: 'Clear preload cache'
  });

  preloadStore.clearState();
  preloadInProgress.clear();
  jsonDataCache.clear();

  log('assetPreloader.js', 'clearPreloadCache', 'success', 'Preload cache cleared', {});
}

/**
 * @function getPreloadedAssetsCount
 * @description Get count of preloaded assets
 * @returns {number} Count of preloaded assets
 */
export function getPreloadedAssetsCount() {
  const preloadStore = usePreloadStore();
  const count = preloadStore.preloadedAssets.length;

  log('assetPreloader.js', 'getPreloadedAssetsCount', 'get', 'Getting preloaded assets count', { count });
  window.performanceTracker.step({
    step: 'getPreloadedAssetsCount',
    file: 'assetPreloader.js',
    method: 'getPreloadedAssetsCount',
    flag: 'get',
    purpose: 'Get preload count'
  });

  return count;
}
