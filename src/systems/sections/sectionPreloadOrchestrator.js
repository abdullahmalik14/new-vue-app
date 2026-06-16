/**
 * Shared section preload orchestration for startup (main.js) and navigation (router.afterEach).
 */

import { log } from '../../infrastructure/logging/logHandler.js';
import { loadTranslationsForSection, areTranslationsLoadedForSection } from '../i18n/translationLoader.js';
import { inheritConfigurationFromParentRoute } from '../routing/routeResolver.js';
import {
  getPreloadSectionsForRoute,
  resolveSectionIdentifier,
  resolveRoleSectionVariant
} from './sectionResolver.js';
import { usePreloadStore } from '../../stores/usePreloadStore.js';
import { preloadSection, resetSectionPreloadState } from './sectionPreloader.js';

/**
 * Snapshot each section's preload state before any preload work begins.
 *
 * @param {Array<string>} sections
 * @param {string|null|undefined} skipSection
 * @returns {Array<{ section: string, skipped: boolean, willPreload: boolean, isPreloaded: boolean, inProgress: boolean, needsPreload: boolean }>}
 */
function buildSectionPreloadStatusSnapshot(sections, skipSection = null) {
  const preloadStore = usePreloadStore();

  return sections
    .filter((section) => typeof section === 'string' && section.length > 0)
    .map((section) => {
      const skipped = Boolean(skipSection && section === skipSection);
      const isPreloaded = preloadStore.hasSection(section);
      const inProgress = preloadStore.isSectionInProgress(section);

      return {
        section,
        skipped,
        willPreload: !skipped,
        isPreloaded,
        inProgress,
        needsPreload: !skipped && !isPreloaded && !inProgress
      };
    });
}

/**
 * Merge parent route config when inheritConfigFromParent is set (L-11).
 *
 * @param {object|null|undefined} routeConfig
 * @returns {object|null}
 */
export function resolveEffectiveRouteConfig(routeConfig) {
  if (!routeConfig) {
    return null;
  }

  return inheritConfigurationFromParentRoute(routeConfig);
}

/**
 * Resolve route preLoadSections identifiers to deduplicated section name strings.
 *
 * @param {object|null|undefined} routeConfig
 * @param {string} userRole
 * @param {{ additionalSections?: Array<string> }} [options]
 * @returns {{ preloadSectionIdentifiers: Array<string>, resolvedSectionNames: Array<string> }}
 */
export function getRoutePreloadPlan(routeConfig, userRole, { additionalSections = [] } = {}) {
  const effectiveRouteConfig = resolveEffectiveRouteConfig(routeConfig);

  if (!effectiveRouteConfig) {
    return { preloadSectionIdentifiers: [], resolvedSectionNames: [] };
  }

  const preloadSectionIdentifiers = getPreloadSectionsForRoute(effectiveRouteConfig, userRole);
  const resolvedSectionNames = [...new Set(
    preloadSectionIdentifiers
      .map((identifier) => resolveSectionIdentifier(identifier, userRole))
      .filter((sectionName) => typeof sectionName === 'string' && sectionName.length > 0)
  )];

  for (const section of additionalSections) {
    if (typeof section === 'string' && section.length > 0 && !resolvedSectionNames.includes(section)) {
      resolvedSectionNames.push(section);
    }
  }

  log('sectionPreloadOrchestrator.js', 'getRoutePreloadPlan', 'config', 'Sections configured for preload from routeConfig', {
    routeSlug: effectiveRouteConfig.slug ?? null,
    userRole,
    preLoadSections: effectiveRouteConfig.preLoadSections ?? null,
    resolvedIdentifiers: preloadSectionIdentifiers,
    resolvedSectionNames,
    ...(additionalSections.length > 0 ? { additionalSections } : {})
  });

  return { preloadSectionIdentifiers, resolvedSectionNames };
}

/**
 * Resolve the concrete section name for a route's section config.
 *
 * @param {object|null|undefined} routeConfig
 * @param {string} userRole
 * @returns {string|null}
 */
export function resolveCurrentRouteSectionName(routeConfig, userRole) {
  const effectiveRouteConfig = resolveEffectiveRouteConfig(routeConfig);

  if (!effectiveRouteConfig?.section) {
    return null;
  }

  return resolveRoleSectionVariant(effectiveRouteConfig.section, userRole);
}

/**
 * Whether the default auth section should be preloaded on startup.
 *
 * @param {{ isAuthenticated: boolean, currentPath: string, resolvedSections: Array<string> }} authPreloadCheckParams
 * @returns {boolean}
 */
export function shouldPreloadDefaultAuthSection(authPreloadCheckParams) {
  const { isAuthenticated, currentPath, resolvedSections } = authPreloadCheckParams;
  return !isAuthenticated || currentPath === '/log-in' || resolvedSections.includes('auth');
}

/**
 * Preload the default auth section (startup-only).
 *
 * @param {{ file: string, method: string }} logContext
 * @returns {Promise<void>}
 */
export function preloadDefaultAuthSection(logContext) {
  const { file, method } = logContext;
  const preloadStore = usePreloadStore();
  const isPreloaded = preloadStore.hasSection('auth');
  const inProgress = preloadStore.isSectionInProgress('auth');

  log(file, method, 'preload-status', 'Auth section preload status before default auth preload', {
    section: 'auth',
    isPreloaded,
    inProgress,
    needsPreload: !isPreloaded && !inProgress
  });

  log(file, method, 'preload-default', 'Preloading default auth section', { section: 'auth' });

  return preloadSection('auth').catch((preloadError) => {
    log(file, method, 'preload-error', 'Default auth section preload failed (non-blocking)', {
      section: 'auth',
      error: preloadError.message
    });
  });
}

/**
 * Fire-and-forget background preloads for resolved section names.
 *
 * @param {{
 *   sections: Array<string>,
 *   skipSection?: string|null,
 *   locale?: string|null,
 *   preloadTranslations?: boolean,
 *   logContext: { file: string, method: string },
 *   path?: string|null
 * }} options
 * @returns {Promise<void>}
 */
export function startBackgroundSectionPreloads({
  sections,
  skipSection = null,
  locale = null,
  preloadTranslations = false,
  logContext,
  path = null
}) {
  const { file, method } = logContext;
  const sectionStatus = buildSectionPreloadStatusSnapshot(sections, skipSection);

  log(file, method, 'preload-status', 'Section preload status before background preloads start', {
    path,
    configuredSections: sections,
    skipSection: skipSection ?? null,
    sectionStatus,
    alreadyPreloaded: sectionStatus
      .filter((sectionStatusEntry) => sectionStatusEntry.willPreload && sectionStatusEntry.isPreloaded)
      .map((sectionStatusEntry) => sectionStatusEntry.section),
    needsPreload: sectionStatus
      .filter((sectionStatusEntry) => sectionStatusEntry.needsPreload)
      .map((sectionStatusEntry) => sectionStatusEntry.section),
    skippedSections: sectionStatus
      .filter((sectionStatusEntry) => sectionStatusEntry.skipped)
      .map((sectionStatusEntry) => sectionStatusEntry.section)
  });

  const preloadPromises = [];

  for (const section of sections) {
    if (skipSection && section === skipSection) {
      continue;
    }

    if (!section || typeof section !== 'string') {
      log(file, method, 'preload-skip', 'Skipping invalid section name', {
        section,
        type: typeof section
      });
      continue;
    }

    log(file, method, 'preload-section', 'Preloading specific section', {
      section,
      path
    });

    preloadPromises.push(
      preloadSection(section).catch((preloadError) => {
        log(file, method, 'preload-error', 'Section preload failed (non-blocking)', {
          section,
          error: preloadError.message
        });
      })
    );

    if (preloadTranslations && locale) {
      if (areTranslationsLoadedForSection(section, locale)) {
        log(file, method, 'translation-skip', 'Translations already loaded for background section', {
          section,
          locale,
          path
        });
      } else {
        preloadPromises.push(
          loadTranslationsForSection(section, locale).catch((preloadError) => {
            log(file, method, 'translation-error', 'Translation load failed (non-blocking)', {
              section,
              locale,
              error: preloadError.message
            });
          })
        );
      }
    }
  }

  return Promise.all(preloadPromises);
}

/**
 * Re-warm section bundles and translations after a locale change.
 * Resets cached preload state first so already-preloaded sections can refresh.
 *
 * @param {{
 *   sections: Array<string>,
 *   locale: string,
 *   skipSection?: string|null,
 *   logContext: { file: string, method: string }
 * }} options
 * @returns {Promise<void>}
 */
export async function refreshSectionPreloadsOnLocaleChange({
  sections,
  locale,
  skipSection = null,
  logContext
}) {
  const { file, method } = logContext;

  const sectionsToRefresh = sections.filter(
    (section) => typeof section === 'string'
      && section.length > 0
      && section !== skipSection
  );

  if (sectionsToRefresh.length === 0) {
    return;
  }

  log(file, method, 'locale-refresh', 'Refreshing section preloads for locale change', {
    locale,
    sections: sectionsToRefresh,
    skipSection
  });

  for (const section of sectionsToRefresh) {
    resetSectionPreloadState(section);
  }

  return startBackgroundSectionPreloads({
    sections: sectionsToRefresh,
    locale,
    preloadTranslations: true,
    logContext
  });
}
