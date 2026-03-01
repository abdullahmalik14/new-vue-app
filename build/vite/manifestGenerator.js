/**
 * ManifestGenerator - Generate section manifest after build
 * 
 * Scans dist/assets for section bundles and creates manifest file
 * mapping section names to bundle paths with metadata.
 * Uses global JSON config loader for configuration loading.
 */

import { readdirSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { loadJsonConfigSync } from '../../src/utils/common/jsonConfigLoaderNode.js';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Scan dist/assets directory for section bundles
 * 
 * @param {string} distPath - Path to dist directory
 * @returns {Array<object>} - Array of found bundle files with metadata
 */
export function scanDistAssetsForSections(distPath) {
  console.log('[ManifestGenerator] scanDistAssetsForSections() started:', { distPath });

  const assetsPath = join(distPath, 'assets');
  const foundBundles = [];

  try {
    // Read assets directory
    const files = readdirSync(assetsPath);

    // Find section bundle files
    for (const file of files) {
      // Look for section-* files (both JS and CSS)
      if (file.startsWith('section-')) {
        const filePath = join(assetsPath, file);
        const stats = statSync(filePath);

        // Extract section name from filename
        // Format: section-{name}-{hash}.{ext}
        const match = file.match(/^section-([^-]+)-.+\.(js|css)$/);

        if (match) {
          const sectionName = match[1];
          const fileType = match[2];

          foundBundles.push({
            sectionName,
            fileType,
            fileName: file,
            filePath: `/assets/${file}`,
            fileSize: stats.size,
            timestamp: stats.mtime.toISOString()
          });

          console.log('[ManifestGenerator] Found bundle:', {
            section: sectionName,
            type: fileType,
            file
          });
        }
      }
    }

    console.log('[ManifestGenerator] Scan complete:', {
      totalBundles: foundBundles.length
    });

    return foundBundles;
  } catch (error) {
    console.error('[ManifestGenerator] Failed to scan assets:', error.message);
    return [];
  }
}

/**
 * Generate section manifest file
 * Creates JSON manifest mapping sections to bundle paths
 * 
 * @param {Array<object>} bundles - Array of bundle metadata
 * @param {string} distPath - Path to dist directory
 * @returns {object} - Generated manifest object
 */
export function generateSectionManifestFile(bundles, distPath) {
  console.log('[ManifestGenerator] generateSectionManifestFile() started');

  const manifest = {};

  // Group bundles by section
  const sectionMap = new Map();

  for (const bundle of bundles) {
    const { sectionName, fileType, filePath, fileSize, timestamp } = bundle;

    // Initialize section entry if not exists
    if (!sectionMap.has(sectionName)) {
      sectionMap.set(sectionName, {
        section: sectionName,
        js: null,
        css: null,
        size: 0,
        timestamp: null
      });
    }

    const sectionEntry = sectionMap.get(sectionName);

    // Add file path based on type
    if (fileType === 'js') {
      sectionEntry.js = filePath;
    } else if (fileType === 'css') {
      sectionEntry.css = filePath;
    }

    // Update size and timestamp
    sectionEntry.size += fileSize;
    if (!sectionEntry.timestamp || timestamp > sectionEntry.timestamp) {
      sectionEntry.timestamp = timestamp;
    }
  }

  // Convert map to manifest object
  for (const [sectionName, sectionData] of sectionMap.entries()) {
    manifest[sectionName] = sectionData;
  }

  // Write manifest to dist directory
  const manifestPath = join(distPath, 'section-manifest.json');

  try {
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

    console.log('[ManifestGenerator] Manifest generated successfully:', {
      path: manifestPath,
      sectionCount: Object.keys(manifest).length
    });
  } catch (error) {
    console.error('[ManifestGenerator] Failed to write manifest:', error.message);
  }

  return manifest;
}

/**
 * Add metadata to manifest from route configuration
 * Enriches manifest with priority, dependencies, etc.
 * 
 * @param {object} manifest - Base manifest object
 * @param {string} routeConfigPath - Path to route configuration
 * @returns {object} - Enriched manifest
 */
export function enrichManifestWithMetadata(manifest, routeConfigPath) {
  console.log('[ManifestGenerator] enrichManifestWithMetadata() called');

  try {
    // Load route configuration using global JSON config loader
    const routeConfigData = loadJsonConfigSync(routeConfigPath, {
      configName: 'route_config_manifest',
      basePath: dirname(routeConfigPath),
      skipValidation: false
    });

    // Build metadata map from routes
    const metadataMap = new Map();

    for (const route of routeConfigData) {
      if (!route.section) {
        continue;
      }

      // Get section name
      const sectionName = typeof route.section === 'string'
        ? route.section
        : Object.values(route.section)[0];

      // Initialize metadata if not exists
      if (!metadataMap.has(sectionName)) {
        metadataMap.set(sectionName, {
          priority: 'normal',
          preloadSections: [],
          dependencies: []
        });
      }

      const metadata = metadataMap.get(sectionName);

      // Collect preload sections
      if (route.preLoadSections) {
        for (const preloadSection of route.preLoadSections) {
          if (!metadata.preloadSections.includes(preloadSection)) {
            metadata.preloadSections.push(preloadSection);
          }
        }
      }

      // Extract custom manifest metadata if present
      if (route.manifestMeta) {
        if (route.manifestMeta.priority) {
          metadata.priority = route.manifestMeta.priority;
        }
        if (route.manifestMeta.dependencies) {
          metadata.dependencies = route.manifestMeta.dependencies;
        }
      }
    }

    // Merge metadata into manifest
    for (const [sectionName, metadata] of metadataMap.entries()) {
      if (manifest[sectionName]) {
        manifest[sectionName] = {
          ...manifest[sectionName],
          ...metadata
        };
      }
    }

    console.log('[ManifestGenerator] Manifest enriched with metadata');

    return manifest;
  } catch (error) {
    console.error('[ManifestGenerator] Failed to enrich manifest:', error.message);
    return manifest;
  }
}

/**
 * Create Vite plugin for manifest generation
 * Runs after build to generate section manifest
 * 
 * @returns {object} - Vite plugin object
 */
export function createManifestGeneratorPlugin() {
  console.log('[ManifestGenerator] Creating manifest generator plugin');

  return {
    name: 'vite-plugin-manifest-generator',

    async closeBundle() {
      console.log('[ManifestGenerator] closeBundle hook - generating manifest');

      // Get dist directory path
      const distPath = join(process.cwd(), 'dist');

      // Scan for section bundles
      const bundles = scanDistAssetsForSections(distPath);

      // Generate manifest
      const manifest = generateSectionManifestFile(bundles, distPath);

      // Enrich with metadata from route config
      const routeConfigPath = join(process.cwd(), 'src/router/routeConfig.json');
      const enrichedManifest = enrichManifestWithMetadata(manifest, routeConfigPath);

      console.log('[ManifestGenerator] Manifest generation complete:', {
        sections: Object.keys(enrichedManifest).length,
        totalSize: Object.values(enrichedManifest).reduce((sum, s) => sum + (s.size || 0), 0)
      });
    }
  };
}

/**
 * Validate manifest integrity
 * Checks that all sections have required bundles
 * 
 * @param {object} manifest - Manifest to validate
 * @returns {object} - Validation result { valid: boolean, errors: Array }
 */
export function validateManifestIntegrity(manifest) {
  console.log('[ManifestGenerator] validateManifestIntegrity() called');

  const errors = [];

  for (const [sectionName, sectionData] of Object.entries(manifest)) {
    // Check for JS bundle (required)
    if (!sectionData.js) {
      errors.push(`Section "${sectionName}" missing JS bundle`);
    }

    // CSS is optional, so we don't validate it

    // Check for file paths validity
    if (sectionData.js && !sectionData.js.startsWith('/assets/')) {
      errors.push(`Section "${sectionName}" has invalid JS path: ${sectionData.js}`);
    }
  }

  const isValid = errors.length === 0;

  console.log('[ManifestGenerator] Validation result:', {
    valid: isValid,
    errorCount: errors.length
  });

  return {
    valid: isValid,
    errors
  };
}

