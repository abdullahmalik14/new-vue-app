// vueApp-main-new/src/utils/assets/assetScanner.js

import { log } from '../common/logHandler';

/**
 * @file assetScanner.js
 * @description Scan Vue components and templates for asset declarations
 * @purpose Extract asset preload configurations from components
 */

// Performance tracker available globally as window.performanceTracker

/**
 * @function extractAssetsFromComponent
 * @description Extract asset preload configuration from Vue component
 * @param {object} component - Vue component definition
 * @returns {Array<object>} Array of asset definitions
 */
export function extractAssetsFromComponent(component) {
  log('assetScanner.js', 'extractAssetsFromComponent', 'start', 'Extracting assets from component', { 
    hasComponent: !!component 
  });
  window.performanceTracker.step({
    step: 'extractAssetsFromComponent_start',
    file: 'assetScanner.js',
    method: 'extractAssetsFromComponent',
    flag: 'start',
    purpose: 'Extract assets from component'
  });

  try {
    const assets = [];

    // Check for preloadAssets in component options
    if (component.preloadAssets && Array.isArray(component.preloadAssets)) {
      assets.push(...component.preloadAssets);
      log('assetScanner.js', 'extractAssetsFromComponent', 'found', 'Found preloadAssets array', { 
        count: component.preloadAssets.length 
      });
    }

    // Check for assets in setup function return
    if (component.setup) {
      const setupResult = component.setup();
      if (setupResult && setupResult.preloadAssets && Array.isArray(setupResult.preloadAssets)) {
        assets.push(...setupResult.preloadAssets);
        log('assetScanner.js', 'extractAssetsFromComponent', 'found-setup', 'Found assets in setup return', { 
          count: setupResult.preloadAssets.length 
        });
      }
    }

    // Check for PRELOAD_ASSETS constant
    if (component.PRELOAD_ASSETS && Array.isArray(component.PRELOAD_ASSETS)) {
      assets.push(...component.PRELOAD_ASSETS);
      log('assetScanner.js', 'extractAssetsFromComponent', 'found-const', 'Found PRELOAD_ASSETS constant', { 
        count: component.PRELOAD_ASSETS.length 
      });
    }

    log('assetScanner.js', 'extractAssetsFromComponent', 'success', 'Assets extracted from component', { 
      totalCount: assets.length 
    });
    window.performanceTracker.step({
      step: 'extractAssetsFromComponent_complete',
      file: 'assetScanner.js',
      method: 'extractAssetsFromComponent',
      flag: 'success',
      purpose: 'Asset extraction complete'
    });

    return assets;
  } catch (error) {
    log('assetScanner.js', 'extractAssetsFromComponent', 'error', 'Error extracting assets', { 
      error: error.message, 
      stack: error.stack 
    });
    window.performanceTracker.step({
      step: 'extractAssetsFromComponent_error',
      file: 'assetScanner.js',
      method: 'extractAssetsFromComponent',
      flag: 'error',
      purpose: 'Asset extraction failed'
    });
    return [];
  }
}

/**
 * @function scanComponentForAssetReferences
 * @description Scan component template for asset URLs (images, etc.)
 * @param {string} template - Component template string
 * @returns {Array<object>} Array of detected asset references
 */
export function scanComponentForAssetReferences(template) {
  log('assetScanner.js', 'scanComponentForAssetReferences', 'start', 'Scanning template for assets', { 
    templateLength: template?.length 
  });
  window.performanceTracker.step({
    step: 'scanComponentForAssetReferences_start',
    file: 'assetScanner.js',
    method: 'scanComponentForAssetReferences',
    flag: 'start',
    purpose: 'Scan template for asset URLs'
  });

  try {
    const assets = [];

    if (!template || typeof template !== 'string') {
      log('assetScanner.js', 'scanComponentForAssetReferences', 'invalid', 'Invalid template provided', {});
      window.performanceTracker.step({
        step: 'scanComponentForAssetReferences_invalid',
        file: 'assetScanner.js',
        method: 'scanComponentForAssetReferences',
        flag: 'invalid',
        purpose: 'Invalid template'
      });
      return assets;
    }

    // Scan for image sources
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(template)) !== null) {
      const src = imgMatch[1];
      if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
        assets.push({ src, type: 'image', auto: true });
        log('assetScanner.js', 'scanComponentForAssetReferences', 'found-image', 'Found image reference', { src });
      }
    }

    // Scan for video sources
    const videoRegex = /<video[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let videoMatch;
    while ((videoMatch = videoRegex.exec(template)) !== null) {
      const src = videoMatch[1];
      if (src) {
        assets.push({ src, type: 'video', auto: true });
        log('assetScanner.js', 'scanComponentForAssetReferences', 'found-video', 'Found video reference', { src });
      }
    }

    // Scan for audio sources
    const audioRegex = /<audio[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let audioMatch;
    while ((audioMatch = audioRegex.exec(template)) !== null) {
      const src = audioMatch[1];
      if (src) {
        assets.push({ src, type: 'audio', auto: true });
        log('assetScanner.js', 'scanComponentForAssetReferences', 'found-audio', 'Found audio reference', { src });
      }
    }

    log('assetScanner.js', 'scanComponentForAssetReferences', 'success', 'Template scanning complete', { 
      totalFound: assets.length 
    });
    window.performanceTracker.step({
      step: 'scanComponentForAssetReferences_complete',
      file: 'assetScanner.js',
      method: 'scanComponentForAssetReferences',
      flag: 'success',
      purpose: 'Template scanning complete'
    });

    return assets;
  } catch (error) {
    log('assetScanner.js', 'scanComponentForAssetReferences', 'error', 'Error scanning template', { 
      error: error.message, 
      stack: error.stack 
    });
    window.performanceTracker.step({
      step: 'scanComponentForAssetReferences_error',
      file: 'assetScanner.js',
      method: 'scanComponentForAssetReferences',
      flag: 'error',
      purpose: 'Template scanning failed'
    });
    return [];
  }
}

/**
 * @function scanSectionComponents
 * @description Scan all components in a section for assets
 * @param {string} sectionName - Section name
 * @returns {Promise<Array<object>>} Array of all assets in section
 */
export async function scanSectionComponents(sectionName) {
  log('assetScanner.js', 'scanSectionComponents', 'start', 'Scanning section components', { sectionName });
  window.performanceTracker.step({
    step: 'scanSectionComponents_start',
    file: 'assetScanner.js',
    method: 'scanSectionComponents',
    flag: 'start',
    purpose: 'Scan all components in section'
  });

  try {
    const allAssets = [];

    // Get section routes
    const { getRouteConfiguration } = await import('../route/routeConfigLoader');
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

    log('assetScanner.js', 'scanSectionComponents', 'routes-found', 'Section routes found', { 
      sectionName, 
      routeCount: sectionRoutes.length 
    });

    // Collect assets from routes
    for (const route of sectionRoutes) {
      if (route.assetPreload && Array.isArray(route.assetPreload)) {
        allAssets.push(...route.assetPreload);
      }
    }

    log('assetScanner.js', 'scanSectionComponents', 'success', 'Section component scanning complete', { 
      sectionName, 
      assetCount: allAssets.length 
    });
    window.performanceTracker.step({
      step: 'scanSectionComponents_complete',
      file: 'assetScanner.js',
      method: 'scanSectionComponents',
      flag: 'success',
      purpose: 'Section scanning complete'
    });

    return allAssets;
  } catch (error) {
    log('assetScanner.js', 'scanSectionComponents', 'error', 'Error scanning section components', { 
      sectionName, 
      error: error.message, 
      stack: error.stack 
    });
    window.performanceTracker.step({
      step: 'scanSectionComponents_error',
      file: 'assetScanner.js',
      method: 'scanSectionComponents',
      flag: 'error',
      purpose: 'Section scanning failed'
    });
    return [];
  }
}

/**
 * @function shouldIgnoreComponent
 * @description Check if component should be ignored from asset scanning
 * @param {object} component - Vue component
 * @returns {boolean} True if should ignore
 */
export function shouldIgnoreComponent(component) {
  log('assetScanner.js', 'shouldIgnoreComponent', 'check', 'Checking if component should be ignored', {});
  window.performanceTracker.step({
    step: 'shouldIgnoreComponent',
    file: 'assetScanner.js',
    method: 'shouldIgnoreComponent',
    flag: 'check',
    purpose: 'Check component ignore status'
  });

  try {
    // Check for IGNORE_ASSET_PRELOAD constant
    if (component.IGNORE_ASSET_PRELOAD === true) {
      log('assetScanner.js', 'shouldIgnoreComponent', 'ignored', 'Component has IGNORE_ASSET_PRELOAD=true', {});
      return true;
    }

    // Check for ignoreAssetPreload option
    if (component.ignoreAssetPreload === true) {
      log('assetScanner.js', 'shouldIgnoreComponent', 'ignored', 'Component has ignoreAssetPreload option', {});
      return true;
    }

    log('assetScanner.js', 'shouldIgnoreComponent', 'not-ignored', 'Component should be scanned', {});
    return false;
  } catch (error) {
    log('assetScanner.js', 'shouldIgnoreComponent', 'error', 'Error checking ignore status', { 
      error: error.message, 
      stack: error.stack 
    });
    window.performanceTracker.step({
      step: 'shouldIgnoreComponent_error',
      file: 'assetScanner.js',
      method: 'shouldIgnoreComponent',
      flag: 'error',
      purpose: 'Ignore check failed'
    });
    return false;
  }
}

/**
 * @function normalizeAssetDefinition
 * @description Normalize asset definition to standard format
 * @param {object|string} asset - Asset definition (object or URL string)
 * @returns {object} Normalized asset definition
 */
export function normalizeAssetDefinition(asset) {
  log('assetScanner.js', 'normalizeAssetDefinition', 'start', 'Normalizing asset definition', { 
    assetType: typeof asset 
  });
  window.performanceTracker.step({
    step: 'normalizeAssetDefinition',
    file: 'assetScanner.js',
    method: 'normalizeAssetDefinition',
    flag: 'normalize',
    purpose: 'Normalize asset to standard format'
  });

  try {
    // If string, convert to object
    if (typeof asset === 'string') {
      const normalized = {
        src: asset,
        type: inferAssetType(asset),
        priority: 'low'
      };
      log('assetScanner.js', 'normalizeAssetDefinition', 'normalized', 'String converted to object', { normalized });
      return normalized;
    }

    // If object, ensure required fields
    const normalized = {
      src: asset.src || asset.url || asset.path,
      type: asset.type || inferAssetType(asset.src || asset.url || asset.path),
      priority: asset.priority || 'low',
      ...asset
    };

    log('assetScanner.js', 'normalizeAssetDefinition', 'normalized', 'Asset definition normalized', { normalized });
    return normalized;
  } catch (error) {
    log('assetScanner.js', 'normalizeAssetDefinition', 'error', 'Error normalizing asset', { 
      asset, 
      error: error.message, 
      stack: error.stack 
    });
    window.performanceTracker.step({
      step: 'normalizeAssetDefinition_error',
      file: 'assetScanner.js',
      method: 'normalizeAssetDefinition',
      flag: 'error',
      purpose: 'Normalization failed'
    });
    return { src: '', type: 'unknown', priority: 'low' };
  }
}

/**
 * @function inferAssetType
 * @description Infer asset type from URL/path
 * @param {string} url - Asset URL or path
 * @returns {string} Inferred type
 */
function inferAssetType(url) {
  if (!url) return 'unknown';

  const ext = url.split('.').pop().toLowerCase().split('?')[0];

  const typeMap = {
    // Images
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    webp: 'image',
    svg: 'image',
    // Fonts
    woff: 'font',
    woff2: 'font',
    ttf: 'font',
    otf: 'font',
    // Media
    mp4: 'video',
    webm: 'video',
    ogg: 'video',
    mp3: 'audio',
    wav: 'audio',
    // Scripts
    js: 'script',
    mjs: 'script'
  };

  const type = typeMap[ext] || 'unknown';
  
  log('assetScanner.js', 'inferAssetType', 'inferred', 'Asset type inferred', { url, ext, type });
  
  return type;
}

