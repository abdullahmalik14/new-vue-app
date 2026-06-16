/**
 * Route-level resource loading after navigation guards settle (M9).
 * Fire-and-forget only — must not block beforeResolve or navigation.
 */

import { log } from '../../infrastructure/logging/logHandler';
import { preloadSectionAssets } from '../assets/assetPreloader.js';
import { loadSectionCss, unloadSectionCss } from '../sections/sectionCssLoader.js';
import { loadTranslationsForSection, areTranslationsLoadedForSection } from '../i18n/translationLoader.js';
import { resolveRoleSectionVariant } from '../sections/sectionResolver.js';

/**
 * Resolve the concrete section string for the destination route.
 *
 * @param {import('vue-router').RouteLocationNormalized} to
 * @param {string} userRole
 * @returns {string|null}
 */
export function resolveCurrentSectionForNavigation(to, userRole) {
  const currentSection = to.meta?.section;
  if (!currentSection) {
    return null;
  }

  const resolved =
    typeof currentSection === 'object'
      ? resolveRoleSectionVariant(currentSection, userRole)
      : currentSection;

  return typeof resolved === 'string' && resolved ? resolved : null;
}

/**
 * Start current-section CSS, translations, and asset loads (non-blocking).
 *
 * @param {object} options
 * @param {import('vue-router').RouteLocationNormalized} options.to
 * @param {import('vue-router').RouteLocationNormalized} options.from
 * @param {string} options.userRole
 * @param {string} options.activeLocale
 * @param {{ file?: string, method?: string }} [options.logContext]
 * @returns {string|null} resolved current section name
 */
export function loadCurrentSectionResources({
  to,
  from,
  userRole,
  activeLocale,
  logContext = {},
}) {
  const file = logContext.file || 'routeNavigationResourceLoader.js';
  const method = logContext.method || 'loadCurrentSectionResources';

  const routeConfig = to.meta?.routeConfig;
  if (!routeConfig) {
    return null;
  }

  const currentSection = to.meta?.section;
  const previousSection = from.meta?.section;

  if (previousSection && previousSection !== currentSection) {
    unloadSectionCss(previousSection);
    log(file, method, 'css-unload', 'Unloaded previous section CSS', {
      previousSection,
    });
  }

  const resolvedCurrentSection = resolveCurrentSectionForNavigation(to, userRole);

  if (resolvedCurrentSection) {
    loadSectionCss(resolvedCurrentSection).catch((err) => {
      log(file, method, 'css-error', 'Section CSS load failed (non-blocking)', {
        section: resolvedCurrentSection,
        error: err.message,
      });
    });

    if (!areTranslationsLoadedForSection(resolvedCurrentSection, activeLocale)) {
      loadTranslationsForSection(resolvedCurrentSection, activeLocale).catch((err) => {
        log(file, method, 'translation-error', 'Translation load failed (non-blocking)', {
          originalSection: currentSection,
          resolvedSection: resolvedCurrentSection,
          locale: activeLocale,
          error: err.message,
        });
      });
    } else {
      log(file, method, 'translation-skip', 'Translations already loaded for section/locale', {
        resolvedSection: resolvedCurrentSection,
        locale: activeLocale,
      });
    }

    preloadSectionAssets(resolvedCurrentSection).catch((err) => {
      log(file, method, 'asset-preload-error', 'Current section asset preload failed (non-blocking)', {
        section: resolvedCurrentSection,
        error: err.message,
      });
    });
  } else if (currentSection) {
    log(file, method, 'translation-warn', 'Could not resolve section to string, skipping resource load', {
      section: currentSection,
      userRole,
    });
  }

  return resolvedCurrentSection;
}
