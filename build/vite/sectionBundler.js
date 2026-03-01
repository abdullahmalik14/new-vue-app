/**
 * SectionBundler - Core logic to bundle per section
 * 
 * Parses routeConfig to discover sections and generates Rollup configuration
 * for section-based code splitting. All operations tracked with perfTracker.
 * Uses global JSON config loader for configuration loading.
 */

import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { loadJsonConfigSync } from '../../src/utils/common/jsonConfigLoaderNode.js';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Discover all sections from route configuration
 * Scans routeConfig.json and extracts unique section names
 * Uses global JSON config loader utility
 * 
 * @returns {Set<string>} - Set of unique section names
 */
export function discoverAllSectionsFromConfig() {
  console.log('[SectionBundler] discoverAllSectionsFromConfig() started');

  try {
    // Load route configuration using global JSON config loader
    const routeConfigPath = join(__dirname, '../../src/router/routeConfig.json');

    const routeConfigData = loadJsonConfigSync(routeConfigPath, {
      configName: 'route_config_bundler',
      basePath: __dirname,
      skipValidation: false
    });

    // Validate config is an array
    if (!Array.isArray(routeConfigData)) {
      console.error('[SectionBundler] Invalid route config format. Expected array, got:', typeof routeConfigData);
      throw new Error('Route config must be an array');
    }

    const discoveredSections = new Set();
    const warnings = [];

    // Iterate through all routes
    for (const route of routeConfigData) {
      // Validate route has slug
      if (!route.slug) {
        warnings.push(`Route missing slug: ${JSON.stringify(route)}`);
        continue;
      }

      // Skip disabled routes - don't create chunks for them
      if (route.enabled === false) {
        continue;
      }

      // Skip routes without section
      if (!route.section) {
        continue;
      }

      // Handle string section (simple)
      if (typeof route.section === 'string') {
        // Validate section name is not empty
        if (!route.section.trim()) {
          warnings.push(`Route ${route.slug} has empty section name`);
          continue;
        }
        discoveredSections.add(route.section);
        continue;
      }

      // Handle object section (role-based)
      if (typeof route.section === 'object' && route.section !== null && !Array.isArray(route.section)) {
        // Validate object has at least one role
        if (Object.keys(route.section).length === 0) {
          warnings.push(`Route ${route.slug} has empty section object`);
          continue;
        }

        // Add all role-specific section names
        for (const [role, sectionName] of Object.entries(route.section)) {
          if (typeof sectionName === 'string') {
            if (!sectionName.trim()) {
              warnings.push(`Route ${route.slug} role ${role} has empty section name`);
              continue;
            }
            discoveredSections.add(sectionName);
          } else {
            warnings.push(`Route ${route.slug} role ${role} has invalid section type: ${typeof sectionName}`);
          }
        }
      } else if (route.section !== null && typeof route.section === 'object') {
        warnings.push(`Route ${route.slug} has invalid section format (array not allowed)`);
      }
    }

    // Log warnings if any
    if (warnings.length > 0) {
      console.warn('[SectionBundler] Validation warnings:', warnings);
    }

    // Validate we found at least one section
    if (discoveredSections.size === 0) {
      console.warn('[SectionBundler] No sections found in route config. Build may not work as expected.');
    }

    console.log('[SectionBundler] Sections discovered:', {
      count: discoveredSections.size,
      sections: Array.from(discoveredSections),
      warningCount: warnings.length
    });

    return discoveredSections;
  } catch (error) {
    console.error('[SectionBundler] Failed to discover sections:', error.message);
    return new Set();
  }
}

/**
 * Generate manual chunks configuration for Rollup
 * Creates section-based code splitting strategy
 * 
 * @param {Set<string>} sections - Set of section names
 * @returns {Function} - Manual chunks function for Rollup
 */
export function generateManualChunksConfiguration(sections) {
  console.log('[SectionBundler] generateManualChunksConfiguration() called');

  // Convert Set to Array for easier processing
  const sectionArray = Array.from(sections);

  /**
   * Manual chunks function
   * Determines which chunk each module should go into
   * 
   * @param {string} id - Module ID (file path)
   * @returns {string|undefined} - Chunk name or undefined for default chunk
   */
  return function manualChunks(id) {
    // Normalize path separators so chunking works consistently on Windows and POSIX.
    // Vite/Rollup module ids can be absolute paths with "\" on Windows.
    const normalizedId = typeof id === 'string' ? id.replace(/\\/g, '/') : id;

    // Keep Vite/Vue helper modules out of section chunks.
    // Otherwise Rollup can accidentally place them into a section chunk and create
    // circular chunk graphs (e.g., section-auth <-> utils) that trigger TDZ errors
    // like: "Cannot access '_export_sfc' before initialization".
    //
    // Helpers we explicitly isolate:
    // - Vue SFC export helper (provides _export_sfc)
    // - Vite preload helper (provides __vitePreload)
    if (
      normalizedId &&
      (normalizedId.includes('plugin-vue:export-helper') ||
        normalizedId.includes('vite/preload-helper') ||
        normalizedId.includes('@vite/preload-helper') ||
        normalizedId.includes('preload-helper'))
    ) {
      return 'vite-helpers';
    }

    // Keep app-wide shared code together with other shared utilities.
    // Important: splitting stores/router into a separate "core" chunk can create a
    // circular chunk graph (core <-> utils) because stores frequently import utils
    // (e.g. authHandler/logging), while utils imports stores for convenience APIs.
    if (
      normalizedId.includes('/src/stores/') ||
      normalizedId.includes('/src/composables/') ||
      normalizedId.includes('/src/router/')
    ) {
      return 'utils';
    }

    // Bundle node_modules separately
    if (normalizedId.includes('node_modules')) {
      // Extract package name
      const match = normalizedId.match(/node_modules\/(@?[^/]+)/);
      if (match) {
        const packageName = match[1];

        // Group common Vue ecosystem packages
        if (packageName === 'vue' || packageName === '@vue') {
          return 'vendor-vue';
        }
        if (packageName === 'vue-router') {
          return 'vendor-vue-router';
        }
        if (packageName === 'pinia') {
          return 'vendor-pinia';
        }
        if (packageName === 'vue-i18n' || packageName === '@intlify') {
          return 'vendor-i18n';
        }

        // All other vendors
        return 'vendor';
      }
    }

    // Bundle components and templates by section
    for (const sectionName of sectionArray) {
      // Skip 'dev' section - it contains shared components that should be bundled as utilities
      // to prevent circular dependencies (e.g., section-auth importing InputAuthComponent from section-dev)
      if (sectionName === 'dev') {
        continue;
      }

      // Check if file belongs to this section
      if (
        normalizedId.includes(`/components/${sectionName}/`) ||
        normalizedId.includes(`/templates/${sectionName}/`) ||
        normalizedId.includes(`/components/layout/${sectionName}/`)
      ) {
        return `section-${sectionName}`;
      }

      // Handle role-specific sections (e.g., dashboard-creator)
      if (sectionName.includes('-')) {
        const baseSection = sectionName.split('-')[0];
        if (
          normalizedId.includes(`/components/${baseSection}/`) ||
          normalizedId.includes(`/templates/${baseSection}/`)
        ) {
          return `section-${sectionName}`;
        }
      }
    }

    // DO NOT bundle translation files - they should be loaded dynamically per locale
    // Each translation JSON file will be its own chunk, loaded on demand
    // This prevents bundling all languages together
    if (normalizedId.includes('/i18n/section-')) {
      // Return undefined to let each JSON file be its own dynamic chunk
      return undefined;
    }

    // Bundle dev components as shared utilities to prevent circular dependencies
    if (normalizedId.includes('/components/dev/')) {
      return 'utils';
    }

    // Utilities and common code stay in main bundle
    if (normalizedId.includes('/utils/')) {
      return 'utils';
    }

    // Return undefined to let Rollup decide (goes to main bundle)
    return undefined;
  };
}

/**
 * Group components by section for analysis
 * Returns map of section names to component file paths
 * 
 * @param {Set<string>} sections - Set of section names
 * @returns {Map<string, Array<string>>} - Map of section to component paths
 */
export function groupComponentsBySection(sections) {
  console.log('[SectionBundler] groupComponentsBySection() called');

  const componentMap = new Map();

  // Initialize map for each section
  for (const sectionName of sections) {
    componentMap.set(sectionName, []);
  }

  // Note: Actual file scanning would happen here in a real implementation
  // For now, this provides the structure

  console.log('[SectionBundler] Component grouping complete:', {
    sectionCount: componentMap.size
  });

  return componentMap;
}

/**
 * Get preload configuration for sections
 * Determines which sections should be eagerly loaded
 * 
 * @param {Set<string>} sections - All discovered sections
 * @returns {object} - Configuration { eager: Array, lazy: Array }
 */
export function getPreloadConfiguration(sections) {
  console.log('[SectionBundler] getPreloadConfiguration() called');

  // Sections that should always be preloaded
  const alwaysPreload = ['auth', 'misc'];

  const eagerSections = [];
  const lazySections = [];

  for (const sectionName of sections) {
    if (alwaysPreload.includes(sectionName)) {
      eagerSections.push(sectionName);
    } else {
      lazySections.push(sectionName);
    }
  }

  console.log('[SectionBundler] Preload configuration:', {
    eager: eagerSections.length,
    lazy: lazySections.length
  });

  return {
    eager: eagerSections,
    lazy: lazySections
  };
}

/**
 * Get section dependencies from route config
 * Analyzes which sections depend on each other for loading
 * Uses global JSON config loader utility
 * 
 * @returns {Map<string, Array<string>>} - Map of section to dependencies
 */
export function getSectionDependencies() {
  console.log('[SectionBundler] getSectionDependencies() called');

  try {
    // Load route configuration using global JSON config loader
    const routeConfigPath = join(__dirname, '../../src/router/routeConfig.json');
    const routeConfigData = loadJsonConfigSync(routeConfigPath, {
      configName: 'route_config_dependencies',
      basePath: __dirname,
      skipValidation: false
    });

    const dependencyMap = new Map();

    // Analyze preLoadSections for each route
    for (const route of routeConfigData) {
      if (!route.section || !route.preLoadSections) {
        continue;
      }

      // Get section name
      const sectionName = typeof route.section === 'string'
        ? route.section
        : Object.values(route.section)[0];

      // Initialize dependency array if needed
      if (!dependencyMap.has(sectionName)) {
        dependencyMap.set(sectionName, []);
      }

      // Add preload sections as dependencies
      const currentDeps = dependencyMap.get(sectionName);
      for (const depSection of route.preLoadSections) {
        if (!currentDeps.includes(depSection)) {
          currentDeps.push(depSection);
        }
      }
    }

    console.log('[SectionBundler] Section dependencies mapped:', {
      sectionCount: dependencyMap.size
    });

    return dependencyMap;
  } catch (error) {
    console.error('[SectionBundler] Failed to get section dependencies:', error.message);
    return new Map();
  }
}

/**
 * Create Vite plugin for section-based bundling
 * 
 * @returns {object} - Vite plugin object
 */
export function createSectionBundlerPlugin() {
  console.log('[SectionBundler] Creating section bundler plugin');

  return {
    name: 'vite-plugin-section-bundler',

    config(config, { command }) {
      console.log('[SectionBundler] Plugin config hook called:', { command });

      // Discover sections
      const sections = discoverAllSectionsFromConfig();

      // Generate manual chunks configuration
      const manualChunks = generateManualChunksConfiguration(sections);

      // Return configuration to merge with Vite config
      return {
        build: {
          rollupOptions: {
            output: {
              manualChunks
            }
          }
        }
      };
    },

    buildStart() {
      console.log('[SectionBundler] Build started - analyzing sections');
      const sections = discoverAllSectionsFromConfig();
      const preloadConfig = getPreloadConfiguration(sections);

      console.log('[SectionBundler] Section analysis complete:', {
        totalSections: sections.size,
        eagerSections: preloadConfig.eager.length,
        lazySections: preloadConfig.lazy.length
      });
    },

    buildEnd() {
      console.log('[SectionBundler] Build ended');
    }
  };
}

