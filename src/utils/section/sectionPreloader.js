/**
 * SectionPreloader - Coordinate section bundle preloading
 * 
 * Handles eager loading of section bundles for instant navigation.
 * Tracks all preload operations with performance tracker.
 */

import { log } from '../common/logHandler.js';
import { logError } from '../common/errorHandler.js';
import { getSectionBundlePaths } from '../build/manifestLoader.js';
import { preloadSectionCss } from '../section/sectionCssLoader.js';
import { preloadSectionAssets } from '../assets/assetPreloader.js';
import { usePreloadStore } from '../../stores/usePreloadStore.js';

// Track in-progress preloads — maps sectionName → shared Promise
const inProgressPromises = new Map();

/**
 * Preload a section bundle
 * Downloads and caches section JS and CSS for instant loading
 * 
 * @param {string} sectionName - Name of section to preload
 * @returns {Promise<boolean>} - True if preload successful
 */
export function preloadSection(sectionName) {
  const preloadStore = usePreloadStore();

  log('sectionPreloader.js', 'preloadSection', 'start', 'Starting section preload', { sectionName });

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'preloadSection_start',
      file: 'sectionPreloader.js',
      method: 'preloadSection',
      flag: 'preload-start',
      purpose: `Begin preloading section: ${sectionName}`
    });
  }

  // Check if already preloaded — fast return
  if (preloadStore.hasSection(sectionName)) {
    log('sectionPreloader.js', 'preloadSection', 'cache-hit', 'Section already preloaded', { sectionName });

    if (window.performanceTracker) {
      window.performanceTracker.step({
        step: 'preloadSection_cached',
        file: 'sectionPreloader.js',
        method: 'preloadSection',
        flag: 'cache-hit',
        purpose: `Section ${sectionName} already in memory`
      });
    }

    log('sectionPreloader.js', 'preloadSection', 'return', 'Returning cached section status', { sectionName, preloaded: true });
    return Promise.resolve(true);
  }

  // return shared promise so concurrent callers wait on the same operation
  if (inProgressPromises.has(sectionName)) {
    log('sectionPreloader.js', 'preloadSection', 'in-progress', 'Section preload already in progress — sharing promise', { sectionName });
    return inProgressPromises.get(sectionName);
  }

  const promise = _doPreload(sectionName).finally(() => {
    inProgressPromises.delete(sectionName);
  });

  inProgressPromises.set(sectionName, promise);
  return promise;
}

/**
 * Internal: perform the actual preload work for a section.
 * Called only once per section — concurrent callers share the promise above.
 *
 * @param {string} sectionName
 * @returns {Promise<boolean>}
 */
async function _doPreload(sectionName) {
  const preloadStore = usePreloadStore();

  try {
    // Get section bundle paths from manifest
    const bundlePaths = await getSectionBundlePaths(sectionName);

    if (!bundlePaths) {
      log('sectionPreloader.js', '_doPreload', 'no-paths', 'No bundle paths found in manifest', { sectionName });
      log('sectionPreloader.js', '_doPreload', 'return', 'Returning no-paths status', { sectionName, preloaded: false });
      return false;
    }

    log('sectionPreloader.js', '_doPreload', 'paths-resolved', 'Bundle paths resolved from manifest', {
      sectionName,
      hasCss: !!bundlePaths.css,
      hasJs: !!bundlePaths.js
    });

    // run JS + CSS in parallel; Fix 5c: delegate CSS to sectionCssLoader
    await Promise.all([
      bundlePaths.js  ? preloadJavaScriptBundle(bundlePaths.js, sectionName) : Promise.resolve(),
      bundlePaths.css ? preloadSectionCss(sectionName)                       : Promise.resolve()
    ]);

    // addSection only after both JS + CSS are fully cached
    preloadStore.addSection(sectionName);

    // Preload section assets (non-blocking)
    preloadSectionAssets(sectionName).catch(err => {
      log('sectionPreloader.js', '_doPreload', 'asset-preload-error', 'Asset preload failed (non-blocking)', {
        sectionName,
        error: err.message
      });
    });

    log('sectionPreloader.js', '_doPreload', 'success', 'Section preload completed successfully', { sectionName });

    if (window.performanceTracker) {
      window.performanceTracker.step({
        step: 'preloadSection_complete',
        file: 'sectionPreloader.js',
        method: '_doPreload',
        flag: 'preload-complete',
        purpose: `Section ${sectionName} preloaded successfully`
      });
    }

    log('sectionPreloader.js', '_doPreload', 'return', 'Returning successful preload status', { sectionName, preloaded: true });
    return true;

  } catch (error) {
    logError('sectionPreloader.js', '_doPreload', 'Section preload failed', error, { sectionName });

    if (window.performanceTracker) {
      window.performanceTracker.step({
        step: 'preloadSection_error',
        file: 'sectionPreloader.js',
        method: '_doPreload',
        flag: 'preload-error',
        purpose: `Section ${sectionName} preload failed`
      });
    }

    log('sectionPreloader.js', '_doPreload', 'return', 'Returning failed preload status', { sectionName, preloaded: false, error: error.message });
    return false;
  }
}

/**
 * Preload JavaScript bundle using link preload
 * 
 * @param {string} bundlePath - Path to JS bundle
 * @param {string} sectionName - Section name for logging
 * @returns {Promise<void>}
 */
async function preloadJavaScriptBundle(bundlePath, sectionName) {
  log('sectionPreloader.js', 'preloadJavaScriptBundle', 'start', 'Preloading JavaScript bundle', {
    bundlePath,
    sectionName
  });

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'preloadJs_start',
      file: 'sectionPreloader.js',
      method: 'preloadJavaScriptBundle',
      flag: 'js-preload',
      purpose: `Preload JS for ${sectionName}`
    });
  }

  // Check if a link with the same href already exists in the DOM
  // This prevents duplicate JS loading when the same section is preloaded multiple times
  const existingLink = document.querySelector(`link[href="${bundlePath}"]`);
  if (existingLink) {
    log('sectionPreloader.js', 'preloadJavaScriptBundle', 'already-exists', 'JavaScript link already exists in DOM', {
      bundlePath,
      sectionName,
      existingRel: existingLink.rel
    });

    if (window.performanceTracker) {
      window.performanceTracker.step({
        step: 'preloadJs_skipped',
        file: 'sectionPreloader.js',
        method: 'preloadJavaScriptBundle',
        flag: 'js-skip',
        purpose: `JavaScript link already exists for ${sectionName}`
      });
    }

    // If it already exists, resolve immediately
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    // Create link element for preload
    const linkElement = document.createElement('link');
    linkElement.rel = 'modulepreload'; // Use modulepreload for ES modules
    linkElement.href = bundlePath;
    linkElement.as = 'script';

    // Handle load success
    linkElement.onload = () => {
      log('sectionPreloader.js', 'preloadJavaScriptBundle', 'success', 'JavaScript bundle preloaded', {
        bundlePath,
        sectionName
      });

      if (window.performanceTracker) {
        window.performanceTracker.step({
          step: 'preloadJs_complete',
          file: 'sectionPreloader.js',
          method: 'preloadJavaScriptBundle',
          flag: 'js-complete',
          purpose: `JS preload complete for ${sectionName}`
        });
      }

      resolve();
    };

    // Handle load error
    linkElement.onerror = (error) => {
      logError('sectionPreloader.js', 'preloadJavaScriptBundle', 'JavaScript bundle preload failed', error, {
        bundlePath,
        sectionName
      });
      reject(error);
    };

    // Append to document head to start preload
    document.head.appendChild(linkElement);
  });
}

/**
 * Preload multiple sections in parallel
 * 
 * @param {Array<string>} sectionNames - Array of section names to preload
 * @returns {Promise<object>} - Results { successful: Array, failed: Array }
 */
export async function preloadMultipleSections(sectionNames) {
  log('sectionPreloader.js', 'preloadMultipleSections', 'start', 'Starting batch preload', {
    sectionCount: sectionNames.length,
    sections: sectionNames
  });

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'batchPreload_start',
      file: 'sectionPreloader.js',
      method: 'preloadMultipleSections',
      flag: 'batch-start',
      purpose: `Preload ${sectionNames.length} sections in parallel`
    });
  }

  try {
    // Preload all sections in parallel
    const preloadPromises = sectionNames.map(sectionName =>
      preloadSection(sectionName)
        .then(success => ({ sectionName, success }))
        .catch(error => {
          logError('sectionPreloader.js', 'preloadMultipleSections', 'Section preload failed in batch', error, { sectionName });
          return { sectionName, success: false, error: error.message };
        })
    );

    // Wait for all preloads to complete
    const results = await Promise.all(preloadPromises);

    // Separate successful and failed preloads
    const successful = results.filter(r => r.success).map(r => r.sectionName);
    const failed = results.filter(r => !r.success).map(r => r.sectionName);

    log('sectionPreloader.js', 'preloadMultipleSections', 'complete', 'Batch preload completed', {
      totalSections: sectionNames.length,
      successful: successful.length,
      failed: failed.length
    });

    if (window.performanceTracker) {
      window.performanceTracker.step({
        step: 'batchPreload_complete',
        file: 'sectionPreloader.js',
        method: 'preloadMultipleSections',
        flag: 'batch-complete',
        purpose: `Batch preload: ${successful.length}/${sectionNames.length} successful`
      });
    }

    log('sectionPreloader.js', 'preloadMultipleSections', 'return', 'Returning batch results', { successful: successful.length, failed: failed.length });
    return { successful, failed };

  } catch (error) {
    logError('sectionPreloader.js', 'preloadMultipleSections', 'Batch preload failed', error);

    log('sectionPreloader.js', 'preloadMultipleSections', 'return', 'Returning all failed due to error', {});
    return { successful: [], failed: sectionNames };
  }
}

/**
 * Check if a section has been preloaded
 * 
 * @param {string} sectionName - Section name to check
 * @returns {boolean} - True if section is preloaded
 */
export function isSectionPreloaded(sectionName) {
  const preloadStore = usePreloadStore();
  const isPreloaded = preloadStore.hasSection(sectionName);
  log('sectionPreloader.js', 'isSectionPreloaded', 'return', 'Returning preload status', { sectionName, isPreloaded });
  return isPreloaded;
}

/**
 * Clear all preload state
 * Useful for testing or cache invalidation
 * 
 * @returns {void}
 */
export function clearPreloadState() {
  log('sectionPreloader.js', 'clearPreloadState', 'start', 'Clearing preload state', {});

  const preloadStore = usePreloadStore();
  const preloadedCount = preloadStore.preloadedSections.length;

  preloadStore.clearState();
  inProgressPromises.clear();

  log('sectionPreloader.js', 'clearPreloadState', 'success', 'Preload state cleared', { clearedCount: preloadedCount });
  log('sectionPreloader.js', 'clearPreloadState', 'return', 'Clear complete', {});
}

/**
 * Get preload statistics
 * 
 * @returns {object} - Preload statistics
 */
export function getPreloadStatistics() {
  const preloadStore = usePreloadStore();
  const stats = {
    preloadedCount: preloadStore.preloadedSections.length,
    preloadedSections: [...preloadStore.preloadedSections],
    inProgressCount: inProgressPromises.size,
    inProgressSections: Array.from(inProgressPromises.keys())
  };

  log('sectionPreloader.js', 'getPreloadStatistics', 'return', 'Returning preload statistics', {
    preloadedCount: stats.preloadedCount,
    inProgressCount: stats.inProgressCount
  });

  return stats;
}
