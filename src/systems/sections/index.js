/**
 * Section system — central export file
 */

export {
  getPreloadSectionsForRoute,
  getAllRouteSectionsForRoute,
  normalizeSectionConfiguration,
  resolveRoleSectionVariant,
  isSectionRoleBased,
  getAllSectionVariants,
  resolveSectionIdentifier,
} from './sectionResolver.js';

export {
  preloadSection,
  preloadMultipleSections,
  isSectionPreloaded,
  clearSectionPreloadState,
  getPreloadStatistics,
  resetSectionPreloadState,
} from './sectionPreloader.js';

export {
  clearSectionCssPreloadHint,
  loadSectionCss,
  preloadSectionCss,
  unloadSectionCss,
  getLoadedSections,
  clearAllSectionCss,
} from './sectionCssLoader.js';

export {
  getSectionPreloadPlan,
  resolveCurrentSectionNameFromRouteConfig,
  shouldPreloadDefaultAuthSection,
  preloadDefaultAuthSection,
  startBackgroundSectionPreloads,
  refreshSectionPreloadsOnLocaleChange,
} from './sectionPreloadOrchestrator.js';

export {
  loadSectionManifest,
  getSectionBundlePaths,
  clearManifestCache,
} from './sectionManifestHelpers.js';

export {
  resolveCurrentSectionForNavigation,
  loadCurrentSectionResources,
} from './sectionNavigationResources.js';

export {
  assignResolvedSectionToRouteMeta,
  loadRouteComponentWithSectionPreload,
  startCurrentSectionResourceLoads,
  startPostNavigationSectionPreloads,
} from './sectionNavigationHooks.js';
