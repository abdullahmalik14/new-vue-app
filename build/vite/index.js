/**
 * Vite Build Utilities - Central export file
 * 
 * Exports Vite plugins and utilities for section-based bundling.
 */

// Export section bundler functions and plugin
export {
  discoverAllSectionsFromConfig,
  generateManualChunksConfiguration,
  groupComponentsBySection,
  getPreloadConfiguration,
  getSectionDependencies,
  createSectionBundlerPlugin
} from './sectionBundler.js';

// Export manifest generator functions and plugin
export {
  scanDistAssetsForSections,
  generateSectionManifestFile,
  enrichManifestWithMetadata,
  createManifestGeneratorPlugin,
  validateManifestIntegrity
} from './manifestGenerator.js';

// Export section CSS builder plugin
export {
  createSectionCssBuilderPlugin
} from './sectionCssPlugin.js';

