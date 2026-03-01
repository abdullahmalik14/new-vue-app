/**
 * Section Utilities - Central export file
 * 
 * Exports all section-related utilities:
 * - Section resolution from routes
 * - Section preloading coordination
 */

// Export section resolver functions
export {
  getPreloadSectionsForRoute,
  getAllRouteSectionsForRoute,
  normalizeSectionConfiguration,
  resolveRoleSectionVariant,
  isSectionRoleBased,
  getAllSectionVariants
} from './sectionResolver.js';

// Export section preloader functions
export {
  preloadSectionBundle,
  preloadMultipleSections,
  isSectionPreloaded,
  clearPreloadState,
  getPreloadStatistics
} from './sectionPreloader.js';

