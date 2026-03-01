// vueApp-main-new/src/utils/build/manifestLoader.js

import { log } from '../common/logHandler';
/**
 * @file manifestLoader.js
 * @description Load section manifest in production
 * @purpose Provides bundle paths for section preloading
 */

// Performance tracker available globally as window.performanceTracker

let cachedManifest = null;
let manifestPromise = null;

/**
 * @function loadSectionManifest
 * @description Load section manifest from build output
 * @returns {Promise<object>} Section manifest with bundle paths
 */
export async function loadSectionManifest() {
  log('manifestLoader.js', 'loadSectionManifest', 'start', 'Loading section manifest', {});
  window.performanceTracker.step({
    step: 'loadSectionManifest_start',
    file: 'manifestLoader.js',
    method: 'loadSectionManifest',
    flag: 'start',
    purpose: 'Load section manifest'
  });

  // Return cached manifest if available
  if (cachedManifest) {
    log('manifestLoader.js', 'loadSectionManifest', 'cache-hit', 'Returning cached manifest', {
      sectionCount: Object.keys(cachedManifest).length
    });
    window.performanceTracker.step({
      step: 'loadSectionManifest_cached',
      file: 'manifestLoader.js',
      method: 'loadSectionManifest',
      flag: 'cache-hit',
      purpose: 'Manifest served from cache'
    });
    return cachedManifest;
  }

  try {
    // In production, load from dist/section-manifest.json
    if (import.meta.env.PROD) {
      if (!manifestPromise) {
        log('manifestLoader.js', 'loadSectionManifest', 'fetch', 'Fetching manifest from production build', {});

        manifestPromise = (async () => {
          try {
            const response = await fetch('/section-manifest.json');

            if (!response.ok) {
              log('manifestLoader.js', 'loadSectionManifest', 'error', 'Failed to fetch manifest', {
                status: response.status
              });
              return {};
            }

            const manifest = await response.json();
            cachedManifest = manifest;

            log('manifestLoader.js', 'loadSectionManifest', 'success', 'Manifest loaded from production', {
              sectionCount: Object.keys(manifest).length
            });
            window.performanceTracker.step({
              step: 'loadSectionManifest_complete',
              file: 'manifestLoader.js',
              method: 'loadSectionManifest',
              flag: 'success',
              purpose: 'Manifest loaded successfully'
            });

            return manifest;
          } catch (error) {
            log('manifestLoader.js', 'loadSectionManifest', 'error', 'Error loading manifest', {
              error: error.message,
              stack: error.stack
            });
            window.performanceTracker.step({
              step: 'loadSectionManifest_error',
              file: 'manifestLoader.js',
              method: 'loadSectionManifest',
              flag: 'error',
              purpose: 'Manifest load failed'
            });
            cachedManifest = {};
            return {};
          } finally {
            manifestPromise = null;
          }
        })();
      }

      return manifestPromise;
    }

    // In development, return empty (Vite handles module loading)
    log('manifestLoader.js', 'loadSectionManifest', 'dev', 'Development mode, using empty manifest', {});
    window.performanceTracker.step({
      step: 'loadSectionManifest_dev',
      file: 'manifestLoader.js',
      method: 'loadSectionManifest',
      flag: 'dev',
      purpose: 'Development mode, no manifest needed'
    });

    cachedManifest = {};
    return {};

  } catch (error) {
    log('manifestLoader.js', 'loadSectionManifest', 'error', 'Error loading manifest', {
      error: error.message,
      stack: error.stack
    });
    window.performanceTracker.step({
      step: 'loadSectionManifest_error',
      file: 'manifestLoader.js',
      method: 'loadSectionManifest',
      flag: 'error',
      purpose: 'Manifest load failed'
    });

    // Return empty manifest on error (fail gracefully)
    cachedManifest = {};
    return {};
  }
}

/**
 * @function getSectionBundlePaths
 * @description Get bundle paths for a specific section
 * @param {string} sectionName - Section name
 * @param {object} manifest - Section manifest (optional, will load if not provided)
 * @returns {Promise<object>} Bundle paths { js, css } or null
 */
export async function getSectionBundlePaths(sectionName, manifest) {
  log('manifestLoader.js', 'getSectionBundlePaths', 'start', 'Getting bundle paths for section', { sectionName });
  window.performanceTracker.step({
    step: 'getSectionBundlePaths_start',
    file: 'manifestLoader.js',
    method: 'getSectionBundlePaths',
    flag: 'start',
    purpose: `Get bundle paths for section: ${sectionName}`
  });

  try {
    // Load manifest if not provided (will be cached after first load)
    const manifestData = manifest || await loadSectionManifest();

    // IMPORTANT: We only extract the specific section we need
    // The manifest contains all sections, but we only use the one requested
    const sectionEntry = manifestData[sectionName];

    if (!sectionEntry) {
      log('manifestLoader.js', 'getSectionBundlePaths', 'not-found', 'Section not found in manifest', {
        sectionName,
        availableSections: Object.keys(manifestData).length + ' sections available'
      });
      window.performanceTracker.step({
        step: 'getSectionBundlePaths_not_found',
        file: 'manifestLoader.js',
        method: 'getSectionBundlePaths',
        flag: 'not-found',
        purpose: 'Section not in manifest'
      });
      return null;
    }

    // Handle string path (backward compatibility)
    if (typeof sectionEntry === 'string') {
      const paths = { js: sectionEntry, css: null };
      log('manifestLoader.js', 'getSectionBundlePaths', 'success', 'Bundle paths resolved (string format)', { sectionName, paths });
      window.performanceTracker.step({
        step: 'getSectionBundlePaths_complete',
        file: 'manifestLoader.js',
        method: 'getSectionBundlePaths',
        flag: 'success',
        purpose: 'Paths resolved'
      });
      return paths;
    }

    // Handle object with js and css paths
    if (typeof sectionEntry === 'object') {
      const paths = {
        js: sectionEntry.js || sectionEntry.path || null,
        css: sectionEntry.css || null
      };
      log('manifestLoader.js', 'getSectionBundlePaths', 'success', 'Bundle paths resolved (object format)', { sectionName, paths });
      window.performanceTracker.step({
        step: 'getSectionBundlePaths_complete',
        file: 'manifestLoader.js',
        method: 'getSectionBundlePaths',
        flag: 'success',
        purpose: 'Paths resolved'
      });
      return paths;
    }

    log('manifestLoader.js', 'getSectionBundlePaths', 'invalid', 'Invalid section entry format', { sectionName, entryType: typeof sectionEntry });
    return null;

  } catch (error) {
    log('manifestLoader.js', 'getSectionBundlePaths', 'error', 'Error getting bundle paths', {
      sectionName,
      error: error.message,
      stack: error.stack
    });
    window.performanceTracker.step({
      step: 'getSectionBundlePaths_error',
      file: 'manifestLoader.js',
      method: 'getSectionBundlePaths',
      flag: 'error',
      purpose: 'Failed to get paths'
    });
    return null;
  }
}

/**
 * @function clearManifestCache
 * @description Clear cached manifest (useful for testing)
 * @returns {void}
 */
export function clearManifestCache() {
  log('manifestLoader.js', 'clearManifestCache', 'clear', 'Clearing manifest cache', {});
  window.performanceTracker.step({
    step: 'clearManifestCache',
    file: 'manifestLoader.js',
    method: 'clearManifestCache',
    flag: 'clear',
    purpose: 'Clear manifest cache'
  });

  cachedManifest = null;

  log('manifestLoader.js', 'clearManifestCache', 'success', 'Manifest cache cleared', {});
}

