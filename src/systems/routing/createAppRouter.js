/**
 * App router factory — creates Vue Router from routeConfig.json.
 *
 * Dynamically generates routes from routeConfig.json.
 * Applies guards using route utilities.
 * Tracks all navigation with performance tracker.
 */

import { createRouter, createWebHistory } from 'vue-router';
import { getActivePinia } from 'pinia';
import {
  getRouteConfiguration,
  runAllRouteGuards,
  setCurrentActiveRoute,
  resolveComponentPathForRoute,
  clearGuardNavigationHistory,
  markGuardRedirectNavigation,
  consumeGuardRedirectNavigation,
  shouldClearGuardLoopHistoryAfterNavigation
} from './index.js';
import { isRouteAccessibleInCurrentEnvironment } from './routeEnvAccess.js';
import { log } from '../../infrastructure/logging/logHandler.js';
import { trackStep } from '../../infrastructure/logging/performanceTrackerAccess.js';
import { logError, reportApplicationError } from '../../infrastructure/errors/errorHandler.js';
import { useAuthStore } from '../../stores/useAuthStore.js';
import { usePreloadStore } from '../../stores/usePreloadStore.js';
import {
  SUPPORTED_LOCALES,
  resolveActiveLocale,
  resolveActiveLocaleForNavigation,
  getActiveLocale,
  applyLocaleTemporarily,
  reapplyTemporaryPageLocaleForRoute,
  syncTemporaryPageLocaleFromUrl,
  resolveLocaleForUrlInjection,
  getLeadingLocaleFromPath,
  stripLeadingLocaleFromPath,
} from '../i18n/localeManager.js';
import { resolveRoleSectionVariant } from '../sections/sectionResolver.js';
import { preloadSection } from '../sections/sectionPreloader.js';
import { preloadSectionCriticalImages } from '../assets/assetPreloader.js';
import {
  getRoutePreloadPlan,
  resolveEffectiveRouteConfig,
  startBackgroundSectionPreloads
} from '../sections/sectionPreloadOrchestrator.js';
import { loadNotFoundComponent } from './notFoundComponentLoader.js';
import { findComponentLoader } from './routeComponentLoader.js';
import {
  isChunkLoadNavigationError,
  recoverFromChunkLoadError,
} from './navigationErrorHandler.js';
import { resolveRouterScrollPosition } from './scrollBehavior.js';
import {
  startNavigationProgress,
  finishNavigationProgress,
  failNavigationProgress,
} from './navigationProgressTracker.js';
import {
  buildVueRouterAliases,
  createRedirectFromRouteRecords,
} from './routeAliasResolver.js';
import { startCurrentSectionResourceLoads, resolveCurrentSectionForNavigation } from './routeNavigationResourceLoader.js';
import { syncHreflangTagsForPath, clearHreflangTags } from '../i18n/hreflangTags.js';

const DEFAULT_LOCALE = 'en';

/**
 * Locale for config redirects (L16) — params first, then leading path segment.
 * L-14: Case-insensitive locale matching.
 * @param {import('vue-router').RouteLocationNormalized} to
 * @param {string[]} supportedLocales
 * @returns {string|null}
 */
function resolveLocaleFromRouteLocation(to, supportedLocales) {
  const paramLocale = to.params?.locale;
  if (paramLocale) {
    const normalizedParamLocale = (Array.isArray(paramLocale) ? paramLocale[0] : String(paramLocale)).toLowerCase();
    if (supportedLocales.includes(normalizedParamLocale)) {
      return normalizedParamLocale;
    }
  }
  return getLeadingLocaleFromPath(to.path, supportedLocales);
}

/**
 * Prefix redirect targets for non-default locales only (en stays unprefixed).
 * @param {string} targetPath
 * @param {string|null} locale
 * @param {string[]} supportedLocales
 * @returns {string}
 */
function buildLocaleAwareRedirectPath(targetPath, locale, supportedLocales) {
  if (!locale || !supportedLocales.includes(locale) || locale === DEFAULT_LOCALE) {
    return targetPath;
  }
  return `/${locale}${targetPath}`;
}

/**
 * Generate Vue Router routes from route configuration
 * 
 * @returns {Array} - Array of Vue Router route objects
 */
function generateRoutesFromConfig() {
  log('createAppRouter.js', 'generateRoutesFromConfig', 'start', 'Generating routes from configuration', {});
  trackStep({
        step: 'generateRoutes_start',
        file: 'createAppRouter.js',
        method: 'generateRoutesFromConfig',
        flag: 'router-init',
        purpose: 'Generate routes from configuration'
      });

  // Get route configuration
  const routeConfig = getRouteConfiguration();

  const routes = [];

  // Generate route for each configuration entry with locale support
  // Each route is created with optional locale prefix: /:locale?/slug
  for (const route of routeConfig) {
    // Skip disabled routes — no Vue Router entry; direct URLs hit catch-all → /404 (B3).
    // Guards do not re-check enabled; this is the single enforcement point.
    if (route.enabled === false) {
      log('createAppRouter.js', 'generateRoutesFromConfig', 'skip-disabled', 'Skipping disabled route', {
        path: route.slug,
        section: route.section
      });
      continue;
    }

    // Skip development-only routes outside local dev (S1)
    if (!isRouteAccessibleInCurrentEnvironment(route)) {
      log('createAppRouter.js', 'generateRoutesFromConfig', 'skip-env', 'Skipping route unavailable in this environment', {
        path: route.slug,
        envAccess: route.envAccess
      });
      continue;
    }

    // Handle redirects
    if (route.redirect) {
      // Add locale-aware redirect
      const localePath = `/:locale?${route.slug}`;
      routes.push({
        path: localePath,
        redirect: to => {
          const locale = resolveLocaleFromRouteLocation(to, SUPPORTED_LOCALES);
          return buildLocaleAwareRedirectPath(route.redirect, locale, SUPPORTED_LOCALES);
        }
      });
      log('createAppRouter.js', 'generateRoutesFromConfig', 'redirect', 'Added locale-aware redirect route', {
        from: localePath,
        to: route.redirect
      });
      continue;
    }

    // Handle regular routes with optional locale prefix
    // Pattern: /:locale?/slug allows /en/dashboard, /vi/dashboard, or /dashboard
    const localePath = `/:locale?${route.slug}`;
    const vueRoute = {
      path: localePath,
      name: route.slug, // Keep original slug as name for lookups
      // Component will be loaded dynamically
      component: () => loadRouteComponent(route),
      meta: {
        routeConfig: route,
        section: route.section,
        requiresAuth: route.requiresAuth || false,
        enabled: route.enabled !== false
      }
    };

    const aliases = buildVueRouterAliases(route.aliases);
    if (aliases.length === 1) {
      vueRoute.alias = aliases[0];
    } else if (aliases.length > 1) {
      vueRoute.alias = aliases;
    }

    routes.push(vueRoute);

    const redirectFromRoutes = createRedirectFromRouteRecords(route, {
      resolveLocaleFromRouteLocation,
      buildLocaleAwareRedirectPath,
      supportedLocales: SUPPORTED_LOCALES,
    });

    for (const redirectRoute of redirectFromRoutes) {
      routes.push(redirectRoute);
      log('createAppRouter.js', 'generateRoutesFromConfig', 'redirect-from', 'Added legacy redirect route', {
        from: redirectRoute.path,
        to: route.slug,
      });
    }

    log('createAppRouter.js', 'generateRoutesFromConfig', 'add-route', 'Added locale-aware route', {
      path: localePath,
      section: route.section,
      aliasCount: aliases.length,
      redirectFromCount: redirectFromRoutes.length,
    });
  }

  log('createAppRouter.js', 'generateRoutesFromConfig', 'success', 'Routes generated from config', {
    routeCount: routes.length
  });
  trackStep({
        step: 'generateRoutes_complete',
        file: 'createAppRouter.js',
        method: 'generateRoutesFromConfig',
        flag: 'router-ready',
        purpose: `${routes.length} routes generated`
      });

  return routes;
}

/**
 * Resolve user role for route component loading (L15).
 * Uses explicit Pinia instance when active; falls back to guest in tests/early boot.
 *
 * @returns {string}
 */
function resolveUserRoleForComponentLoad() {
  const pinia = getActivePinia();
  if (!pinia) {
    log('createAppRouter.js', 'resolveUserRoleForComponentLoad', 'warn', 'No active Pinia — using guest role for component load', {});
    return 'guest';
  }
  return useAuthStore(pinia).currentUser?.role || 'guest';
}

/**
 * Load component for a route
 * Uses pre-loaded component map from import.meta.glob
 * 
 * @param {object} route - Route configuration object
 * @returns {Promise} - Component promise
 */
async function loadRouteComponent(route) {
  log('createAppRouter.js', 'loadRouteComponent', 'start', 'Loading component for route', { slug: route.slug });
  trackStep({
        step: 'loadComponent_start',
        file: 'createAppRouter.js',
        method: 'loadRouteComponent',
        flag: 'component-load',
        purpose: `Load component for ${route.slug}`
      });

  const userRole = resolveUserRoleForComponentLoad();
  const rawSection = route.section;
  const sectionName = rawSection ? resolveRoleSectionVariant(rawSection, userRole) : null;

  if (sectionName) {
    const pinia = getActivePinia();
    const store = pinia ? usePreloadStore(pinia) : null;
    const sectionPreloaded = !!store?.hasSection(sectionName);

    // B-03: kick off high/critical section image preloads in the background.
    // Never await — preloading is non-blocking cache warming, navigation must not wait on image I/O.
    preloadSectionCriticalImages(sectionName).catch(() => {});

    const componentModule = await loadViaGlob(route, userRole);

    if (sectionPreloaded) {
      log('createAppRouter.js', 'loadRouteComponent', 'cache-hit', 'Section preloaded, fast load', { sectionName });
    } else {
      log('createAppRouter.js', 'loadRouteComponent', 'cache-miss', 'Section not preloaded, lazy load + background preload', { sectionName });
      preloadSection(sectionName).catch(() => {});
    }

    return componentModule;
  }

  // No section on this route — standard lazy load only
  return loadViaGlob(route, userRole);
}

/**
 * Load a route component via import.meta.glob — the standard lazy load path.
 * Used by both the fast path (cache hit, instant) and slow path (cache miss).
 *
 * @param {object} route - Route configuration object
 * @param {string} userRole - Resolved user role string
 * @returns {Promise} - Component default export
 */
async function loadViaGlob(route, userRole) {
  try {
    // Resolve component path (handles role-based customComponentPath)
    const componentPath = resolveComponentPathForRoute(route, userRole);

    if (!componentPath) {
      throw new Error(`No component path found for route: ${route.slug}`);
    }

    log('createAppRouter.js', 'loadViaGlob', 'resolve', 'Component path resolved', {
      slug: route.slug,
      userRole,
      componentPath
    });

    if (import.meta.env.DEV) {
      log('createAppRouter.js', 'loadViaGlob', 'debug', 'Component path lookup failed', {
        componentPath
      });
    }

    const componentLoader = findComponentLoader(componentPath);

    if (!componentLoader) {
      log('createAppRouter.js', 'loadViaGlob', 'error', 'Component not found in pre-loaded modules', {
        componentPath
      });
      throw new Error(`Component not found in pre-loaded modules: ${componentPath}`);
    }

    const componentModule = await componentLoader();

    log('createAppRouter.js', 'loadViaGlob', 'success', 'Component loaded successfully', {
      slug: route.slug,
      path: componentPath
    });
  trackStep({
          step: 'loadComponent_complete',
          file: 'createAppRouter.js',
          method: 'loadViaGlob',
          flag: 'component-success',
          purpose: `Component loaded for ${route.slug}`
        });

    log('createAppRouter.js', 'loadViaGlob', 'return', 'Returning loaded component', { slug: route.slug });
    return componentModule.default || componentModule;

  } catch (error) {
    log('createAppRouter.js', 'loadViaGlob', 'error', 'Failed to load component, using fallback', {
      slug: route.slug,
      error: error.message,
      stack: error.stack,
      componentPath: route.componentPath
    });
  trackStep({
          step: 'loadComponent_fallback',
          file: 'createAppRouter.js',
          method: 'loadViaGlob',
          flag: 'component-error',
          purpose: `Component load failed, using NotFound fallback`
        });

    log('createAppRouter.js', 'loadViaGlob', 'return', 'Returning NotFound fallback component', { slug: route.slug });
    return loadNotFoundComponent();
  }
}

// Generate routes from configuration
const routes = generateRoutesFromConfig();

// Create router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return resolveRouterScrollPosition(to, from, savedPosition);
  }
});

/**
 * Before each route navigation
 * Handles locale injection and runs guards
 */
router.beforeEach(async (to, from, next) => {
  startNavigationProgress();

  log('createAppRouter.js', 'beforeEach', 'start', 'Navigation started', {
    from: from.path,
    to: to.path
  });

  const localeInParams = to.params?.locale;
  // L-13: Check query parameter (?locale=vi) with case-insensitive normalization
  const localeInQuery = to.query?.locale?.toLowerCase?.();
  const localeFromPath = getLeadingLocaleFromPath(to.path, SUPPORTED_LOCALES);
  const urlLocale =
    (localeInParams && SUPPORTED_LOCALES.includes(localeInParams) ? localeInParams : null) ||
    (localeInQuery && SUPPORTED_LOCALES.includes(localeInQuery) ? localeInQuery : null) ||
    localeFromPath;

  if (urlLocale) {
    await applyLocaleTemporarily(urlLocale, {
      routePath: to.path,
      loadTranslations: false,
    });
    syncTemporaryPageLocaleFromUrl(urlLocale);

    log('createAppRouter.js', 'beforeEach', 'locale-from-url', 'Locale applied temporarily from URL (not persisted)', {
      urlLocale,
      fromParams: localeInParams === urlLocale,
      fromQuery: localeInQuery === urlLocale,
      fromPath: localeFromPath === urlLocale,
      note: 'Store preference unchanged - only language switcher changes store'
    });

    // L-13: If locale came from query parameter, redirect to inject it into the path
    // (e.g., /dashboard?locale=vi → /vi/dashboard)
    if (localeInQuery === urlLocale && !localeFromPath) {
      const basePath = stripLeadingLocaleFromPath(to.path, SUPPORTED_LOCALES);
      const pathWithLocale = urlLocale === DEFAULT_LOCALE
        ? basePath
        : `/${urlLocale}${basePath}`;

      if (pathWithLocale !== to.path || 'locale' in to.query) {
        // Strip locale from query since it's now in the path
        const { locale: _, ...remainingQuery } = to.query;
        return next({
          path: pathWithLocale,
          query: remainingQuery,
          hash: to.hash,
          replace: true
        });
      }
    }
  } else {
    await reapplyTemporaryPageLocaleForRoute(to.path);
    if (localeInParams && !SUPPORTED_LOCALES.includes(localeInParams)) {
      log('createAppRouter.js', 'beforeEach', 'invalid-locale', 'Invalid locale in path, treating as route path', {
        invalidLocale: localeInParams,
        path: to.path
      });
    }

    const resolvedLocale = resolveLocaleForUrlInjection();
    const basePath = stripLeadingLocaleFromPath(to.path, SUPPORTED_LOCALES);

    let pathWithLocale;
    if (resolvedLocale === DEFAULT_LOCALE) {
      pathWithLocale = basePath;
    } else {
      pathWithLocale = `/${resolvedLocale}${basePath}`;
    }

    log('createAppRouter.js', 'beforeEach', 'locale-inject', 'Injecting locale into URL', {
      originalPath: to.path,
      basePath,
      newPath: pathWithLocale,
      locale: resolvedLocale,
      isDefaultLocale: resolvedLocale === DEFAULT_LOCALE
    });

    // Redirect only when the target differs. Double-prefix loops are prevented by
    // stripLeadingLocaleFromPath + urlLocale from path; do not compare from.path (L14 fix).
    if (pathWithLocale !== to.path) {
      // Locale inject is URL normalization, not a guard loop redirect (L5).
      return next({
        path: pathWithLocale,
        query: to.query,
        hash: to.hash,
        replace: true
      });
    }
  }
  trackStep({
        step: 'navigationStart',
        file: 'createAppRouter.js',
        method: 'beforeEach',
        flag: 'nav-start',
        purpose: `Navigate from ${from.path} to ${to.path}`
      });

  // Get route configuration from meta
  const routeConfig = to.meta?.routeConfig;

  if (!routeConfig) {
    log('createAppRouter.js', 'beforeEach', 'no-config', 'No route configuration found in meta, allowing navigation', { path: to.path });
    next();
    return;
  }

  const effectiveRouteConfig = resolveEffectiveRouteConfig(routeConfig);
  const effectiveFromRouteConfig = resolveEffectiveRouteConfig(from.meta?.routeConfig);

  // Get auth context from auth store
  const authStore = useAuthStore();
  const guardContext = {
    isAuthenticated: authStore.isAuthenticated,
    userRole: authStore.currentUser?.role || 'guest',
    userProfile: authStore.currentUser || {}
  };

  log('createAppRouter.js', 'beforeEach', 'auth-context', 'Auth context prepared', guardContext);

  // Resolve section for current user role and store on meta to ensure downstream consumers get a concrete section string
  try {
    const resolvedSection = resolveRoleSectionVariant(effectiveRouteConfig.section, guardContext.userRole);
    if (resolvedSection && typeof resolvedSection === 'string') {
      to.meta.section = resolvedSection;
    } else {
      // fallback to original section if resolution fails
      to.meta.section = effectiveRouteConfig.section;
    }
    log('createAppRouter.js', 'beforeEach', 'section-resolve', 'Resolved meta.section for current role', {
      role: guardContext.userRole,
      resolvedSection: to.meta.section
    });
  } catch (e) {
    log('createAppRouter.js', 'beforeEach', 'section-resolve-error', 'Failed to resolve meta.section (non-blocking)', {
      error: e?.message
    });
    to.meta.section = effectiveRouteConfig.section;
  }

  // Run all route guards against inherited/effective route config (L-11)
  const guardResult = await runAllRouteGuards(effectiveRouteConfig, effectiveFromRouteConfig, guardContext);

  // Handle guard result
  if (guardResult.allow) {
    log('createAppRouter.js', 'beforeEach', 'allow', 'Navigation allowed by guards', { to: to.path });
  trackStep({
          step: 'navigationAllowed',
          file: 'createAppRouter.js',
          method: 'beforeEach',
          flag: 'nav-allow',
          purpose: `Navigation to ${to.path} allowed`
        });

    next();
  } else {
    log('createAppRouter.js', 'beforeEach', 'block', 'Navigation blocked by guards', {
      to: to.path,
      reason: guardResult.reason,
      redirectTo: guardResult.redirectTo
    });
  trackStep({
          step: 'navigationBlocked',
          file: 'createAppRouter.js',
          method: 'beforeEach',
          flag: 'nav-block',
          purpose: `Navigation blocked: ${guardResult.reason}`
        });

    if (guardResult.redirectTo) {
      markGuardRedirectNavigation();
      next(guardResult.redirectTo);
    } else {
      failNavigationProgress();
      next(false);
    }
  }
});

/**
 * Before resolve — after in-component guards, before navigation is confirmed.
 * Starts current-section CSS/translations/assets (non-blocking, M9).
 */
router.beforeResolve((to, from) => {
  if (!to.meta?.routeConfig) {
    return;
  }

  const authStore = useAuthStore();
  const userRole = authStore.currentUser?.role || 'guest';
  const activeLocale = resolveActiveLocaleForNavigation(to);

  startCurrentSectionResourceLoads({
    to,
    from,
    userRole,
    activeLocale,
    logContext: { file: 'createAppRouter.js', method: 'beforeResolve' },
  });

  trackStep({
    step: 'routeNavigationDataStart',
    file: 'createAppRouter.js',
    method: 'beforeResolve',
    flag: 'route-data',
    purpose: `Started current-section resource loads for ${to.path}`,
  });
});

/**
 * After each route navigation
 * Update active route, preload future sections, track completion
 */
router.afterEach(async (to, from) => {
  finishNavigationProgress();

  log('createAppRouter.js', 'afterEach', 'start', 'Navigation completed', {
    from: from.path,
    to: to.path
  });
  trackStep({
        step: 'navigationComplete',
        file: 'createAppRouter.js',
        method: 'afterEach',
        flag: 'nav-complete',
        purpose: `Navigation to ${to.path} completed`
      });

  // Clear loop-detection history only after user-initiated navigation settles (L5).
  // Do not clear after guard/locale redirects so same-slug loop history can accumulate.
  const completedViaGuardRedirect = consumeGuardRedirectNavigation();
  if (
    shouldClearGuardLoopHistoryAfterNavigation(from.path, to.path, {
      completedViaGuardRedirect,
    })
  ) {
    clearGuardNavigationHistory();

    log('createAppRouter.js', 'afterEach', 'loop-reset', 'Loop history cleared after user navigation', {
      from: from.path,
      to: to.path
    });
  } else if (from.path) {
    log('createAppRouter.js', 'afterEach', 'loop-reset-skip', 'Loop history retained', {
      from: from.path,
      to: to.path,
      completedViaGuardRedirect,
      samePath: to.path === from.path
    });
  }

  // Update active route in navigation tracker
  if (to.meta?.routeConfig) {
    setCurrentActiveRoute(to.meta.routeConfig);
    syncHreflangTagsForPath(to.path, { enabled: true });
  } else {
    clearHreflangTags();
  }

  const routeConfig = to.meta?.routeConfig;
  const effectiveRouteConfig = resolveEffectiveRouteConfig(routeConfig);

  // Check if route should be excluded from preloading
  const preloadExclude = effectiveRouteConfig?.preloadExclude === true;

  // Note: preloadExclude only skips the background preLoadSections loop below.
  // Current page CSS, translations, and assets still run regardless.

  if (effectiveRouteConfig) {
    // Get auth store for role-based preload resolution
    const authStore = useAuthStore();
    const userRole = authStore.currentUser?.role || 'guest';

    const { identifiers: sectionsToPreload, resolved: resolvedSectionsToPreload } =
      getRoutePreloadPlan(routeConfig, userRole);

    // Log what we're about to preload for debugging
    log('createAppRouter.js', 'afterEach', 'preload-check', 'Checking preload sections', {
      path: to.path,
      preLoadSections: effectiveRouteConfig.preLoadSections,
      sectionsToPreload,
      resolvedSections: resolvedSectionsToPreload,
      routeConfigSlug: effectiveRouteConfig.slug
    });

    const activeLocale = resolveActiveLocale();
    const resolvedCurrentSection = resolveCurrentSectionForNavigation(to, userRole);

    if (resolvedSectionsToPreload.length > 0 && !preloadExclude) {
      log('createAppRouter.js', 'afterEach', 'preload', 'Preloading sections for route', {
        path: to.path,
        originalIdentifiers: sectionsToPreload,
        resolvedSections: resolvedSectionsToPreload,
        note: 'ONLY these sections will be preloaded, not all sections'
      });

      startBackgroundSectionPreloads({
        sections: resolvedSectionsToPreload,
        skipSection: resolvedCurrentSection,
        locale: activeLocale,
        preloadTranslations: true,
        logContext: { file: 'createAppRouter.js', method: 'afterEach' },
        path: to.path
      })
        .then(() => {
          log('createAppRouter.js', 'afterEach', 'success', 'Section preload and translation load initiated', {
            sections: resolvedSectionsToPreload
          });
        })
        .catch((error) => {
          log('createAppRouter.js', 'afterEach', 'error', 'Error during post-navigation tasks', {
            error: error.message,
            stack: error.stack
          });
        });
    } else {
      log('createAppRouter.js', 'afterEach', 'no-preload', 'No sections to preload for route', {
        path: to.path,
        hasPreLoadSections: !!effectiveRouteConfig.preLoadSections,
        preLoadSectionsValue: effectiveRouteConfig.preLoadSections
      });
    }
  } else {
    log('createAppRouter.js', 'afterEach', 'no-config', 'Route has no configuration, skipping preload', { path: to.path });
  }
});

/**
 * Handle navigation errors
 */
router.onError((error) => {
  failNavigationProgress();

  const chunkLoadFailure = isChunkLoadNavigationError(error);

  log('createAppRouter.js', 'onError', 'error', 'Navigation error occurred', {
    error: error.message,
    stack: error.stack,
    chunkLoadFailure,
  });

  trackStep({
        step: 'navigationError',
        file: 'createAppRouter.js',
        method: 'onError',
        flag: 'nav-error',
        purpose: `Navigation error: ${error.message}`
      });

  reportApplicationError(
    'createAppRouter.js',
    'onError',
    chunkLoadFailure ? 'Route chunk load failed' : 'Navigation error occurred',
    error,
    {
      errorCode: chunkLoadFailure ? 'CHUNK_LOAD_FAILURE' : 'NAVIGATION_FAILURE',
    },
  );

  if (chunkLoadFailure) {
    recoverFromChunkLoadError(router).catch((redirectError) => {
      logError(
        'createAppRouter.js',
        'onError',
        'Failed to redirect after chunk load error',
        redirectError,
      );
    });
  }
});

export default router;
