/**
 * BuildConfig - Global build configuration for section-based architecture
 * 
 * Defines how sections are discovered, bundled, and manifested.
 * This is the single source of truth for build-time behavior alongside routeConfig.json
 */

import { log } from '../src/utils/common/logHandler.js';

/**
 * Sections that should ALWAYS be preloaded (eagerly bundled)
 * These are critical paths that must load immediately
 * 
 * NOTE: Removed hardcoded sections. Now only preloads sections
 * defined in routeConfig.json per route.
 */
export const ALWAYS_PRELOAD_SECTIONS = [];

/**
 * Default asset preload configuration
 * Used when routes don't specify their own assetPreload array
 */
export const DEFAULT_ASSET_PRELOAD_CONFIG = {
  // Do not preload any assets by default - only explicit declarations
  preloadImages: false,
  preloadFonts: false,
  preloadScripts: false
};

/**
 * Tailwind ignore patterns
 * Components matching these patterns are excluded from Tailwind CSS generation
 */
export const TAILWIND_IGNORE_PATTERNS = [
  '/* tailwind-ignore */',      // Comment-based marker
  'export const IGNORE_TAILWIND = true',  // Export-based marker
  'TAILWIND_IGNORE: true'        // Alternative marker
];

/**
 * Asset type definitions for preloading
 */
export const ASSET_TYPE_DEFINITIONS = {
  IMAGE: {
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'],
    preloadAs: 'image',
    crossOrigin: 'anonymous'
  },
  FONT: {
    extensions: ['.woff', '.woff2', '.ttf', '.otf'],
    preloadAs: 'font',
    crossOrigin: 'anonymous'
  },
  SCRIPT: {
    extensions: ['.js', '.mjs'],
    preloadAs: 'script',
    crossOrigin: 'anonymous'
  },
  STYLE: {
    extensions: ['.css'],
    preloadAs: 'style',
    crossOrigin: null
  },
  VIDEO: {
    extensions: ['.mp4', '.webm', '.ogg'],
    preloadAs: 'video',
    crossOrigin: 'anonymous'
  }
};

/**
 * Extract all unique sections from route configuration
 * 
 * @param {Array} routeConfigArray - Array of route objects from routeConfig.json
 * @returns {Set<string>} - Set of unique section names
 */
export function extractAllSectionsFromRouteConfig(routeConfigArray) {
  log('buildConfig.js', 'extractAllSectionsFromRouteConfig', 'start', 'Extracting sections from route config', { 
    routeCount: routeConfigArray?.length 
  });

  const discoveredSections = new Set();

  // Validate input
  if (!Array.isArray(routeConfigArray)) {
    log('buildConfig.js', 'extractAllSectionsFromRouteConfig', 'error', 'Invalid route config provided, returning empty set', {});
    log('buildConfig.js', 'extractAllSectionsFromRouteConfig', 'return', 'Returning empty set', {});
    return discoveredSections;
  }

  // Iterate through all routes
  for (const route of routeConfigArray) {
    // Skip routes without section definition
    if (!route.section) {
      continue;
    }

    // Handle string section (simple case)
    if (typeof route.section === 'string') {
      discoveredSections.add(route.section);
      continue;
    }

    // Handle object section (role-based sections)
    if (typeof route.section === 'object' && route.section !== null) {
      // Add all role-specific sections
      for (const roleSectionName of Object.values(route.section)) {
        if (typeof roleSectionName === 'string') {
          discoveredSections.add(roleSectionName);
        }
      }
    }
  }

  log('buildConfig.js', 'extractAllSectionsFromRouteConfig', 'success', 'Sections discovered from route config', { 
    sectionCount: discoveredSections.size,
    sections: Array.from(discoveredSections)
  });

  log('buildConfig.js', 'extractAllSectionsFromRouteConfig', 'return', 'Returning discovered sections', { sectionCount: discoveredSections.size });
  return discoveredSections;
}

/**
 * Determine if a section should be eagerly loaded (preloaded)
 * 
 * @param {string} sectionName - Name of the section
 * @param {Array} routeConfigArray - Array of route objects
 * @returns {boolean} - True if section should be preloaded
 */
export function shouldSectionBePreloaded(sectionName, routeConfigArray) {
  // Only check if any route explicitly lists this section in preLoadSections
  for (const route of routeConfigArray) {
    if (Array.isArray(route.preLoadSections) && route.preLoadSections.includes(sectionName)) {
      return true;
    }
  }

  return false;
}

/**
 * Generate manifest metadata for a section
 * 
 * @param {string} sectionName - Name of the section
 * @param {object} options - Additional options for manifest generation
 * @returns {object} - Manifest metadata object
 */
export function generateManifestMetadataForSection(sectionName, options = {}) {
  const {
    priority = 'normal',  // normal, high, low
    version = '1.0.0',
    eager = false
  } = options;

  return {
    section: sectionName,
    priority,
    version,
    eager,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Determine component path pattern for a section
 * Used by Vite to bundle components into correct section chunks
 * 
 * @param {string} sectionName - Name of the section
 * @returns {Array<string>} - Array of path patterns to match
 */
export function getComponentPathPatternsForSection(sectionName) {
  log('buildConfig.js', 'getComponentPathPatternsForSection', 'start', 'Getting component path patterns for section', { sectionName });

  // Build path patterns based on section name
  const patterns = [
    `/components/${sectionName}/`,     // Main components directory
    `/templates/${sectionName}/`,       // Templates directory
    `/components/layout/${sectionName}/` // Layout components
  ];

  // Special handling for role-specific sections
  if (sectionName.includes('-')) {
    // Extract base section (e.g., "dashboard" from "dashboard-creator")
    const baseSection = sectionName.split('-')[0];
    patterns.push(`/components/${baseSection}/`);
    patterns.push(`/templates/${baseSection}/`);
  }

  log('buildConfig.js', 'getComponentPathPatternsForSection', 'return', 'Returning component path patterns', { patternCount: patterns.length });
  return patterns;
}

/**
 * Get CSS bundle configuration for a section
 * 
 * @param {string} sectionName - Name of the section
 * @returns {object} - CSS bundle configuration
 */
export function getCssBundleConfigForSection(sectionName) {
  return {
    section: sectionName,
    enabled: true,  // Generate CSS bundle for this section
    outputName: `section-${sectionName}-[hash].css`,
    minify: true
  };
}

/**
 * Validate route configuration structure
 * Ensures all required fields are present
 * 
 * @param {object} route - Route object to validate
 * @returns {object} - Validation result { valid: boolean, errors: string[] }
 */
export function validateRouteConfiguration(route) {
  const validationErrors = [];

  // Check required fields
  if (!route.slug) {
    validationErrors.push('Route missing required field: slug');
  }

  if (!route.section) {
    validationErrors.push('Route missing required field: section');
  }

  if (!route.componentPath && !route.customComponentPath && !route.redirect) {
    validationErrors.push('Route must have componentPath, customComponentPath, or redirect');
  }

  return {
    valid: validationErrors.length === 0,
    errors: validationErrors
  };
}

/**
 * Get default manifest metadata
 * Used when route doesn't specify custom manifestMeta
 * 
 * @returns {object} - Default manifest metadata
 */
export function getDefaultManifestMetadata() {
  return {
    version: '1.0.0',
    priority: 'normal',
    cacheDuration: 3600000  // 1 hour in milliseconds
  };
}

/**
 * Default export - configuration object for runtime use
 */
const buildConfig = {
  preLoadSections: ALWAYS_PRELOAD_SECTIONS, // Now empty - relies on routeConfig.json
  alwaysPreloadSections: ALWAYS_PRELOAD_SECTIONS,
  defaultAssetPreloadConfig: DEFAULT_ASSET_PRELOAD_CONFIG,
  assetTypeDefinitions: ASSET_TYPE_DEFINITIONS,
  tailwindIgnorePatterns: TAILWIND_IGNORE_PATTERNS
};

export default buildConfig;

