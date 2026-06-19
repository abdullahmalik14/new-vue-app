/**
 * Router section navigation hooks — resolve meta.section, component preload, afterEach background preloads.
 * Non-blocking: preload I/O must never block navigation.
 */

import { getActivePinia } from 'pinia';
import { log } from '../../infrastructure/logging/logHandler.js';
import { trackStep } from '../../infrastructure/logging/performanceTrackerAccess.js';
import { useAuthStore } from '../../stores/useAuthStore.js';
import { usePreloadStore } from '../../stores/usePreloadStore.js';
import { preloadSectionCriticalImages } from '../assets/assetPreloader.js';
import { resolveRoleSectionVariant } from './sectionResolver.js';
import { preloadSection } from './sectionPreloader.js';
import {
  getRoutePreloadPlan,
  startBackgroundSectionPreloads,
} from './sectionPreloadOrchestrator.js';
import {
  loadCurrentSectionResources,
  resolveCurrentSectionForNavigation,
} from './sectionNavigationResources.js';

/**
 * Resolve user role for route component loading (L15).
 *
 * @returns {string}
 */
function resolveUserRoleForComponentLoad() {
  const pinia = getActivePinia();
  if (!pinia) {
    log('sectionNavigationHooks.js', 'resolveUserRoleForComponentLoad', 'warn', 'No active Pinia — using guest role for component load', {});
    return 'guest';
  }
  return useAuthStore(pinia).currentUser?.role || 'guest';
}

/**
 * Assign resolved section string to route meta for downstream consumers.
 *
 * @param {import('vue-router').RouteLocationNormalized} to
 * @param {object|null} effectiveRouteConfig
 * @param {string} userRole
 */
export function assignResolvedSectionToRouteMeta(to, effectiveRouteConfig, userRole) {
  if (!effectiveRouteConfig) {
    return;
  }

  try {
    const resolvedSection = resolveRoleSectionVariant(effectiveRouteConfig.section, userRole);
    if (resolvedSection && typeof resolvedSection === 'string') {
      to.meta.section = resolvedSection;
    } else {
      to.meta.section = effectiveRouteConfig.section;
    }
    log('sectionNavigationHooks.js', 'assignResolvedSectionToRouteMeta', 'section-resolve', 'Resolved meta.section for current role', {
      role: userRole,
      resolvedSection: to.meta.section,
    });
  } catch (e) {
    log('sectionNavigationHooks.js', 'assignResolvedSectionToRouteMeta', 'section-resolve-error', 'Failed to resolve meta.section (non-blocking)', {
      error: e?.message,
    });
    to.meta.section = effectiveRouteConfig.section;
  }
}

/**
 * Load route component with section preload coordination.
 *
 * @param {object} route
 * @param {(route: object, userRole: string) => Promise<unknown>} loadComponentViaGlob
 * @returns {Promise<unknown>}
 */
export async function loadRouteComponentWithSectionPreload(route, loadComponentViaGlob) {
  log('sectionNavigationHooks.js', 'loadRouteComponentWithSectionPreload', 'start', 'Loading component for route', { slug: route.slug });
  trackStep({
    step: 'loadComponent_start',
    file: 'sectionNavigationHooks.js',
    method: 'loadRouteComponentWithSectionPreload',
    flag: 'component-load',
    purpose: `Load component for ${route.slug}`,
  });

  const userRole = resolveUserRoleForComponentLoad();
  const rawSection = route.section;
  const sectionName = rawSection ? resolveRoleSectionVariant(rawSection, userRole) : null;

  if (sectionName) {
    const pinia = getActivePinia();
    const store = pinia ? usePreloadStore(pinia) : null;
    const sectionPreloaded = !!store?.hasSection(sectionName);

    preloadSectionCriticalImages(sectionName).catch(() => {});

    const componentModule = await loadComponentViaGlob(route, userRole);

    if (sectionPreloaded) {
      log('sectionNavigationHooks.js', 'loadRouteComponentWithSectionPreload', 'cache-hit', 'Section preloaded, fast load', { sectionName });
    } else {
      log('sectionNavigationHooks.js', 'loadRouteComponentWithSectionPreload', 'cache-miss', 'Section not preloaded, lazy load + background preload', { sectionName });
      preloadSection(sectionName).catch(() => {});
    }

    return componentModule;
  }

  return loadComponentViaGlob(route, userRole);
}

/**
 * Start current-section CSS, translations, and assets (non-blocking, M9).
 *
 * @param {object} options
 * @param {import('vue-router').RouteLocationNormalized} options.to
 * @param {import('vue-router').RouteLocationNormalized} options.from
 * @param {string} options.userRole
 * @param {string} options.activeLocale
 * @param {{ file?: string, method?: string }} [options.logContext]
 */
export function startCurrentSectionResourceLoads({
  to,
  from,
  userRole,
  activeLocale,
  logContext = {},
}) {
  loadCurrentSectionResources({
    to,
    from,
    userRole,
    activeLocale,
    logContext: {
      file: logContext.file || 'sectionNavigationHooks.js',
      method: logContext.method || 'startCurrentSectionResourceLoads',
      ...logContext,
    },
  });
}

/**
 * Background section preloads after navigation completes.
 *
 * @param {object} options
 * @param {import('vue-router').RouteLocationNormalized} options.to
 * @param {object|null|undefined} options.routeConfig
 * @param {object|null} options.effectiveRouteConfig
 * @param {string} options.userRole
 * @param {string} options.activeLocale
 */
export function startPostNavigationSectionPreloads({
  to,
  routeConfig,
  effectiveRouteConfig,
  userRole,
  activeLocale,
}) {
  const preloadExclude = effectiveRouteConfig?.preloadExclude === true;

  if (!effectiveRouteConfig) {
    log('sectionNavigationHooks.js', 'startPostNavigationSectionPreloads', 'no-config', 'Route has no configuration, skipping preload', { path: to.path });
    return;
  }

  const {
    preloadSectionIdentifiers: sectionsToPreload,
    resolvedSectionNames: resolvedSectionsToPreload,
  } = getRoutePreloadPlan(routeConfig, userRole);

  log('sectionNavigationHooks.js', 'startPostNavigationSectionPreloads', 'preload-check', 'Checking preload sections', {
    path: to.path,
    preLoadSections: effectiveRouteConfig.preLoadSections,
    sectionsToPreload,
    resolvedSections: resolvedSectionsToPreload,
    routeConfigSlug: effectiveRouteConfig.slug,
  });

  const resolvedCurrentSection = resolveCurrentSectionForNavigation(to, userRole);

  if (resolvedSectionsToPreload.length > 0 && !preloadExclude) {
    log('sectionNavigationHooks.js', 'startPostNavigationSectionPreloads', 'preload', 'Preloading sections for route', {
      path: to.path,
      originalIdentifiers: sectionsToPreload,
      resolvedSections: resolvedSectionsToPreload,
      note: 'ONLY these sections will be preloaded, not all sections',
    });

    startBackgroundSectionPreloads({
      sections: resolvedSectionsToPreload,
      skipSection: resolvedCurrentSection,
      locale: activeLocale,
      preloadTranslations: true,
      logContext: { file: 'sectionNavigationHooks.js', method: 'startPostNavigationSectionPreloads' },
      path: to.path,
    })
      .then(() => {
        log('sectionNavigationHooks.js', 'startPostNavigationSectionPreloads', 'success', 'Section preload and translation load initiated', {
          sections: resolvedSectionsToPreload,
        });
      })
      .catch((error) => {
        log('sectionNavigationHooks.js', 'startPostNavigationSectionPreloads', 'error', 'Error during post-navigation tasks', {
          error: error.message,
          stack: error.stack,
        });
      });
  } else {
    log('sectionNavigationHooks.js', 'startPostNavigationSectionPreloads', 'no-preload', 'No sections to preload for route', {
      path: to.path,
      hasPreLoadSections: !!effectiveRouteConfig.preLoadSections,
      preLoadSectionsValue: effectiveRouteConfig.preLoadSections,
    });
  }
}
