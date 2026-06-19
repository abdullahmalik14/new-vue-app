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
  clearPreloadState,
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
  getRoutePreloadPlan,
  resolveCurrentRouteSectionName,
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
