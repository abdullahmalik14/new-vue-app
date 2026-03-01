/**
 * Section CSS Loader
 * 
 * Dynamically loads and injects CSS for sections at runtime.
 * Handles section CSS swapping when navigating between sections.
 * Supports lazy loading and preloading of section CSS.
 */

import { log } from '../common/logHandler.js';
import { logError } from '../common/errorHandler.js';

/**
 * Track loaded CSS files
 * Prevents duplicate loading and manages cleanup
 */
const loadedSectionCss = new Set();
const activeSectionCss = new Map(); // section -> link element

/**
 * CSS loading manifest cache
 */
let cssManifest = null;
let cssManifestPromise = null;

/**
 * Load section CSS manifest
 * Contains mapping of sections to CSS files
 * 
 * @returns {Promise<object>} CSS manifest
 */
async function loadCssManifest() {
  if (cssManifest) {
    return cssManifest;
  }

  if (cssManifestPromise) {
    return cssManifestPromise;
  }

  try {
    // In development, return empty manifest
    if (import.meta.env.DEV) {
      log('sectionCssLoader.js', 'loadCssManifest', 'dev', 'Development mode, no CSS manifest needed', {});
      cssManifest = {};
      return cssManifest;
    }

    // Load section manifest
    cssManifestPromise = fetch('/section-css-manifest.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load CSS manifest: ${response.status}`);
        }
        return response.json();
      })
      .then(manifest => {
        cssManifest = manifest;

        log('sectionCssLoader.js', 'loadCssManifest', 'success', 'CSS manifest loaded', {
          sectionCount: Object.keys(cssManifest.sections || {}).length
        });

        return cssManifest;
      })
      .catch(error => {
        logError('sectionCssLoader.js', 'loadCssManifest', 'Error loading CSS manifest', error, {});
        cssManifest = { sections: {} };
        return cssManifest;
      })
      .finally(() => {
        cssManifestPromise = null;
      });

    return cssManifestPromise;
  } catch (error) {
    logError('sectionCssLoader.js', 'loadCssManifest', 'Error loading CSS manifest', error, {});
    cssManifest = { sections: {} };
    cssManifestPromise = null;
    return cssManifest;
  }
}

/**
 * Get CSS path for a section
 * 
 * @param {string} sectionName - Section name
 * @returns {Promise<string|null>} CSS file path or null
 */
async function getSectionCssPath(sectionName) {
  log('sectionCssLoader.js', 'getSectionCssPath', 'start', 'Getting CSS path for section', { sectionName });

  try {
    // In development, section CSS is handled by Vite's dev server via main.css
    // Skip section CSS loading in dev mode
    if (import.meta.env.DEV) {
      log('sectionCssLoader.js', 'getSectionCssPath', 'dev', 'Dev mode - CSS handled by Vite', {
        sectionName
      });
      return null;
    }

    // In production, use manifest
    const manifest = await loadCssManifest();

    if (manifest.sections && manifest.sections[sectionName]) {
      const cssEntry = manifest.sections[sectionName];
      const rawPath = typeof cssEntry === 'string' ? cssEntry : cssEntry.css;
      if (rawPath) {
        const normalized = rawPath.startsWith('/')
          ? rawPath
          : `/${rawPath.replace(/^\/+/, '')}`;

        log('sectionCssLoader.js', 'getSectionCssPath', 'success', 'CSS path found', {
          sectionName,
          cssPath: normalized
        });

        return normalized;
      }
    }

    log('sectionCssLoader.js', 'getSectionCssPath', 'not-found', 'No CSS path for section', {
      sectionName
    });

    return null;
  } catch (error) {
    logError('sectionCssLoader.js', 'getSectionCssPath', 'Error getting CSS path', error, {
      sectionName
    });
    return null;
  }
}

/**
 * Inject CSS link element into document head
 * 
 * @param {string} cssPath - Path to CSS file
 * @param {string} sectionName - Section name
 * @returns {Promise<HTMLLinkElement>} Link element
 */
async function injectCssLink(cssPath, sectionName) {
  log('sectionCssLoader.js', 'injectCssLink', 'start', 'Injecting CSS link', {
    cssPath,
    sectionName
  });

  return new Promise((resolve, reject) => {
    // Check if CSS is already loaded
    const existingLink = document.querySelector(`link[data-section="${sectionName}"]`);
    if (existingLink) {
      log('sectionCssLoader.js', 'injectCssLink', 'exists', 'CSS already loaded', { sectionName });
      resolve(existingLink);
      return;
    }

    // Create link element
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = cssPath;
    linkElement.setAttribute('data-section', sectionName);
    linkElement.setAttribute('data-section-css', 'true');

    // Handle load success
    linkElement.onload = () => {
      log('sectionCssLoader.js', 'injectCssLink', 'success', 'CSS loaded', {
        cssPath,
        sectionName
      });

      if (window.performanceTracker) {
        window.performanceTracker.step({
          step: 'sectionCss_loaded',
          file: 'sectionCssLoader.js',
          method: 'injectCssLink',
          flag: 'success',
          purpose: `Section CSS loaded: ${sectionName}`
        });
      }

      resolve(linkElement);
    };

    // Handle load error
    linkElement.onerror = (error) => {
      logError('sectionCssLoader.js', 'injectCssLink', 'CSS load failed', error, {
        cssPath,
        sectionName
      });

      if (window.performanceTracker) {
        window.performanceTracker.step({
          step: 'sectionCss_error',
          file: 'sectionCssLoader.js',
          method: 'injectCssLink',
          flag: 'error',
          purpose: `Section CSS failed: ${sectionName}`
        });
      }

      reject(new Error(`Failed to load CSS for section: ${sectionName}`));
    };

    // Append to head
    document.head.appendChild(linkElement);

    log('sectionCssLoader.js', 'injectCssLink', 'appended', 'CSS link appended to head', {
      cssPath,
      sectionName
    });
  });
}

/**
 * Load CSS for a section
 * Main entry point for loading section-specific CSS
 * 
 * @param {string} sectionName - Section name
 * @returns {Promise<boolean>} True if loaded successfully
 */
export async function loadSectionCss(sectionName) {
  log('sectionCssLoader.js', 'loadSectionCss', 'start', 'Loading CSS for section', { sectionName });

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'loadSectionCss_start',
      file: 'sectionCssLoader.js',
      method: 'loadSectionCss',
      flag: 'start',
      purpose: `Load CSS for section: ${sectionName}`
    });
  }

  try {
    // Check if already loaded
    if (loadedSectionCss.has(sectionName)) {
      log('sectionCssLoader.js', 'loadSectionCss', 'cached', 'CSS already loaded', { sectionName });
      return true;
    }

    // Get CSS path
    const cssPath = await getSectionCssPath(sectionName);

    if (!cssPath) {
      log('sectionCssLoader.js', 'loadSectionCss', 'skip', 'No CSS file for section', { sectionName });
      return false;
    }

    // Inject CSS
    const linkElement = await injectCssLink(cssPath, sectionName);

    // Mark as loaded
    loadedSectionCss.add(sectionName);
    activeSectionCss.set(sectionName, linkElement);

    log('sectionCssLoader.js', 'loadSectionCss', 'success', 'Section CSS loaded', { sectionName });

    if (window.performanceTracker) {
      window.performanceTracker.step({
        step: 'loadSectionCss_complete',
        file: 'sectionCssLoader.js',
        method: 'loadSectionCss',
        flag: 'complete',
        purpose: `Section CSS loaded: ${sectionName}`
      });
    }

    return true;
  } catch (error) {
    logError('sectionCssLoader.js', 'loadSectionCss', 'Error loading section CSS', error, {
      sectionName
    });

    if (window.performanceTracker) {
      window.performanceTracker.step({
        step: 'loadSectionCss_error',
        file: 'sectionCssLoader.js',
        method: 'loadSectionCss',
        flag: 'error',
        purpose: `Section CSS load failed: ${sectionName}`
      });
    }

    return false;
  }
}

/**
 * Preload CSS for a section (non-blocking)
 * Uses rel="preload" for faster subsequent loading
 * 
 * @param {string} sectionName - Section name
 * @returns {Promise<boolean>} True if preloaded successfully
 */
export async function preloadSectionCss(sectionName) {
  log('sectionCssLoader.js', 'preloadSectionCss', 'start', 'Preloading CSS for section', { sectionName });

  try {
    // Skip if already loaded
    if (loadedSectionCss.has(sectionName)) {
      return true;
    }

    // Get CSS path
    const cssPath = await getSectionCssPath(sectionName);

    if (!cssPath) {
      return false;
    }

    // Check if preload link already exists
    const existingPreload = document.querySelector(`link[rel="preload"][href="${cssPath}"]`);
    if (existingPreload) {
      return true;
    }

    // Create preload link
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'style';
    preloadLink.href = cssPath;
    preloadLink.setAttribute('data-section-preload', sectionName);

    document.head.appendChild(preloadLink);

    log('sectionCssLoader.js', 'preloadSectionCss', 'success', 'CSS preloaded', { sectionName });

    return true;
  } catch (error) {
    logError('sectionCssLoader.js', 'preloadSectionCss', 'Error preloading CSS', error, {
      sectionName
    });
    return false;
  }
}

/**
 * Unload CSS for a section (cleanup)
 * Removes CSS link from document head
 * 
 * @param {string} sectionName - Section name
 * @returns {boolean} True if unloaded successfully
 */
export function unloadSectionCss(sectionName) {
  // Skip in dev mode
  if (import.meta.env.DEV) {
    return false;
  }

  log('sectionCssLoader.js', 'unloadSectionCss', 'start', 'Unloading CSS for section', { sectionName });

  try {
    const linkElement = activeSectionCss.get(sectionName);

    if (linkElement && linkElement.parentNode) {
      linkElement.parentNode.removeChild(linkElement);
      activeSectionCss.delete(sectionName);
      loadedSectionCss.delete(sectionName);

      log('sectionCssLoader.js', 'unloadSectionCss', 'success', 'CSS unloaded', { sectionName });

      return true;
    }

    return false;
  } catch (error) {
    logError('sectionCssLoader.js', 'unloadSectionCss', 'Error unloading CSS', error, {
      sectionName
    });
    return false;
  }
}

/**
 * Get currently loaded sections
 * 
 * @returns {Array<string>} Array of loaded section names
 */
export function getLoadedSections() {
  return Array.from(loadedSectionCss);
}

/**
 * Clear all section CSS (cleanup)
 * Useful for testing or hard resets
 */
export function clearAllSectionCss() {
  log('sectionCssLoader.js', 'clearAllSectionCss', 'start', 'Clearing all section CSS', {});

  try {
    // Remove all section CSS links
    const allSectionLinks = document.querySelectorAll('link[data-section-css="true"]');
    allSectionLinks.forEach(link => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    });

    // Clear tracking
    activeSectionCss.clear();
    loadedSectionCss.clear();

    log('sectionCssLoader.js', 'clearAllSectionCss', 'success', 'All section CSS cleared', {});
  } catch (error) {
    logError('sectionCssLoader.js', 'clearAllSectionCss', 'Error clearing CSS', error, {});
  }
}

