// vueApp-main-new/build/tailwind/index.js

/**
 * @file index.js
 * @description Exports all Tailwind build utilities
 * @purpose Central export point for Tailwind section scanning and CSS building
 */

// Export section scanner functions
export {
  scanRouteConfigForSections,
  resolveComponentPath,
  generateContentPathsForSection,
  generateAllSectionContentPaths,
  getSectionForComponent
} from './sectionScanner.js';

// Export ignored component handler functions
export {
  checkCommentIgnore,
  checkExportIgnore,
  shouldIgnoreComponent,
  scanDirectoryForIgnoredComponents,
  generateExclusionPatterns,
  filterContentPathsWithIgnores,
  getIgnoredComponentsReport
} from './ignoredComponentHandler.js';

// Export section CSS builder functions
export {
  buildSectionTailwindConfig,
  buildAllSectionConfigs,
  generateSectionCssBuildReport,
  logSectionBuildInfo,
  getSectionContentPaths
} from './sectionCssBuilder.js';

// Export individual component CSS generator functions
export {
  generateComponentTailwindConfig,
  getComponentCssPath,
  generateIndividualComponentCss,
  generateAllIndividualComponentCss,
  createComponentCssManifest,
  cleanupGeneratedCss,
  logGenerationReport
} from './individualCssGenerator.js';

// Export class extractor functions
export {
  extractClassesFromFile,
  extractClassesFromContent,
  extractClassesFromFiles,
  extractClassesFromContentPaths,
  extractNumericUtilities,
  generateSafelistForNumericUtilities
} from './classExtractor.js';

// Export section CSS compiler functions
export {
  generateSectionTailwindConfig,
  compileSectionCss,
  compileAllSectionsCss,
  generateSectionCssManifest,
  buildAllSectionCss
} from './sectionCssCompiler.js';

