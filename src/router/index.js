/**
 * Vue Router Configuration
 * 
 * Dynamically generates routes from routeConfig.json.
 * Applies guards using route utilities.
 * Tracks all navigation with performance tracker.
 */

import { createRouter, createWebHistory } from 'vue-router';
import {
  getRouteConfiguration,
  runAllRouteGuards,
  setCurrentActiveRoute,
  resolveComponentPathForRoute
} from '../utils/route/index.js';
import { log } from '../utils/common/logHandler.js';
import { logError } from '../utils/common/errorHandler.js';
import { useAuthStore } from '../stores/useAuthStore.js';
import { preloadSection } from '../utils/section/sectionPreloader.js';
import { preloadSectionAssets, preloadSectionCriticalImages } from '../utils/assets/assetPreloader.js';
import { loadSectionCss, preloadSectionCss } from '../utils/section/sectionCssLoader.js';
import { loadTranslationsForSection } from '../utils/translation/translationLoader.js';
import { SUPPORTED_LOCALES } from '../utils/translation/localeManager.js';
import { resolveSectionIdentifier } from '../utils/section/sectionResolver.js';
import { loadNotFoundComponent } from '../utils/route/notFoundComponentLoader.js';

/**
 * Generate Vue Router routes from route configuration
 * 
 * @returns {Array} - Array of Vue Router route objects
 */
function generateRoutesFromConfig() {
  log('router/index.js', 'generateRoutesFromConfig', 'start', 'Generating routes from configuration', {});

  if (window.performanceTracker) {
    try {
      window.performanceTracker.step({
        step: 'generateRoutes_start',
        file: 'router/index.js',
        method: 'generateRoutesFromConfig',
        flag: 'router-init',
        purpose: 'Generate routes from configuration'
      });
    } catch (e) {
      // Performance tracker session ended, ignore
    }
  }

  // Get route configuration
  const routeConfig = getRouteConfiguration();

  const routes = [];

  // Generate route for each configuration entry with locale support
  // Each route is created with optional locale prefix: /:locale?/slug
  for (const route of routeConfig) {
    // Skip disabled routes - don't create routes or chunks for them
    if (route.enabled === false) {
      log('router/index.js', 'generateRoutesFromConfig', 'skip-disabled', 'Skipping disabled route', {
        path: route.slug,
        section: route.section
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
          // Only preserve locale in redirect if it's a valid supported locale
          // This prevents invalid routes like "/nonexist" from being treated as locales
          const locale = to.params.locale;
          if (locale && SUPPORTED_LOCALES.includes(locale)) {
            return `/${locale}${route.redirect}`;
          }
          return route.redirect;
        }
      });
      log('router/index.js', 'generateRoutesFromConfig', 'redirect', 'Added locale-aware redirect route', {
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

    routes.push(vueRoute);
    log('router/index.js', 'generateRoutesFromConfig', 'add-route', 'Added locale-aware route', {
      path: localePath,
      section: route.section
    });
  }

  log('router/index.js', 'generateRoutesFromConfig', 'success', 'Routes generated from config', {
    routeCount: routes.length
  });

  if (window.performanceTracker) {
    try {
      window.performanceTracker.step({
        step: 'generateRoutes_complete',
        file: 'router/index.js',
        method: 'generateRoutesFromConfig',
        flag: 'router-ready',
        purpose: `${routes.length} routes generated`
      });
    } catch (e) {
      // Performance tracker session ended, ignore
    }
  }

  return routes;
}

/**
 * Pre-load all components using import.meta.glob
 * This allows Vite to analyze and bundle all components at build time
 * The glob pattern matches all Vue components in templates and components directories
 */
const componentModules = import.meta.glob([
  '@/templates/**/*.vue',
  '@/components/**/*.vue'
], { eager: false });

/**
 * Find component in the pre-loaded modules
 * Handles different path formats that might be in the glob keys
 * 
 * @param {string} componentPath - Component path (e.g., '@/templates/auth/...')
 * @returns {Function|null} - Component loader function or null
 */
function findComponentLoader(componentPath) {
  // Try direct match first
  if (componentModules[componentPath]) {
    return componentModules[componentPath];
  }

  // Try with /src/ prefix (in case glob resolves @/ to src/)
  const srcPath = componentPath.replace('@/', '/src/');
  if (componentModules[srcPath]) {
    return componentModules[srcPath];
  }

  // Try with ./src/ prefix
  const relativeSrcPath = componentPath.replace('@/', './src/');
  if (componentModules[relativeSrcPath]) {
    return componentModules[relativeSrcPath];
  }

  // Try with relative path from router
  const relativePath = componentPath.replace('@/', '../');
  if (componentModules[relativePath]) {
    return componentModules[relativePath];
  }

  // Try to find by matching the end of the path (filename)
  const fileName = componentPath.split('/').pop();
  for (const [key, loader] of Object.entries(componentModules)) {
    if (key.endsWith(fileName)) {
      return loader;
    }
  }

  return null;
}

/**
 * Load component for a route
 * Uses pre-loaded component map from import.meta.glob
 * 
 * @param {object} route - Route configuration object
 * @returns {Promise} - Component promise
 */
async function loadRouteComponent(route) {
  log('router/index.js', 'loadRouteComponent', 'start', 'Loading component for route', { slug: route.slug });

  if (window.performanceTracker) {
    try {
      window.performanceTracker.step({
        step: 'loadComponent_start',
        file: 'router/index.js',
        method: 'loadRouteComponent',
        flag: 'component-load',
        purpose: `Load component for ${route.slug}`
      });
    } catch (e) {
      // Performance tracker session ended, ignore
    }
  }

  try {
    // Get auth store for role-based resolution
    const authStore = useAuthStore();
    const userRole = authStore.currentUser?.role || 'guest';

    // Resolve component path (handles role-based customComponentPath)
    const componentPath = resolveComponentPathForRoute(route, userRole);

    if (!componentPath) {
      throw new Error(`No component path found for route: ${route.slug}`);
    }

    log('router/index.js', 'loadRouteComponent', 'resolve', 'Component path resolved', {
      slug: route.slug,
      userRole,
      componentPath
    });

    // Find the component loader in the pre-loaded modules
    // Log available keys in development for debugging
    if (import.meta.env.DEV) {
      const availableKeys = Object.keys(componentModules).slice(0, 5); // Log first 5 for debugging
      log('router/index.js', 'loadRouteComponent', 'debug', 'Sample glob keys (first 5)', {
        availableKeys,
        componentPath,
        totalKeys: Object.keys(componentModules).length
      });
    }

    const componentLoader = findComponentLoader(componentPath);

    if (!componentLoader) {
      // Log available keys for debugging
      const allKeys = Object.keys(componentModules);
      log('router/index.js', 'loadRouteComponent', 'error', 'Component not found in pre-loaded modules', {
        componentPath,
        availableKeys: allKeys.slice(0, 10), // Log first 10 keys
        totalKeys: allKeys.length
      });
      throw new Error(`Component not found in pre-loaded modules: ${componentPath}`);
    }

    // Load the component - this will use the bundled chunk reference
    const componentModule = await componentLoader();

    log('router/index.js', 'loadRouteComponent', 'success', 'Component loaded successfully', {
      slug: route.slug,
      path: componentPath
    });

    if (window.performanceTracker) {
      try {
        window.performanceTracker.step({
          step: 'loadComponent_complete',
          file: 'router/index.js',
          method: 'loadRouteComponent',
          flag: 'component-success',
          purpose: `Component loaded for ${route.slug}`
        });
      } catch (e) {
        // Performance tracker session ended, ignore
      }
    }

    log('router/index.js', 'loadRouteComponent', 'return', 'Returning loaded component', { slug: route.slug, componentType: typeof componentModule.default });
    return componentModule.default || componentModule;
  } catch (error) {
    log('router/index.js', 'loadRouteComponent', 'error', 'Failed to load component, using fallback', {
      slug: route.slug,
      error: error.message,
      stack: error.stack,
      componentPath: route.componentPath
    });

    if (window.performanceTracker) {
      try {
        window.performanceTracker.step({
          step: 'loadComponent_fallback',
          file: 'router/index.js',
          method: 'loadRouteComponent',
          flag: 'component-error',
          purpose: `Component load failed, using NotFound fallback`
        });
      } catch (e) {
        // Performance tracker session ended, ignore
      }
    }

    log('router/index.js', 'loadRouteComponent', 'return', 'Returning NotFound fallback component', { slug: route.slug });
    // Fallback to centralized NotFound component loader
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
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

/**
 * Before each route navigation
 * Handles locale injection and runs guards
 */
router.beforeEach(async (to, from, next) => {
  log('router/index.js', 'beforeEach', 'start', 'Navigation started', {
    from: from.path,
    to: to.path
  });

  // Import locale utilities dynamically to avoid circular dependency
  const { resolveActiveLocale, setActiveLocale, SUPPORTED_LOCALES } = await import('../utils/translation/localeManager.js');

  // Check if URL has locale in path
  const localeInPath = to.params.locale;

  // Only treat as locale if it's actually a supported locale
  // This prevents non-existent routes like "/nonexist" from being treated as locales
  if (localeInPath && SUPPORTED_LOCALES.includes(localeInPath)) {
    // URL has explicit locale - validate and use it TEMPORARILY
    // URL locale has highest priority but does NOT persist to store
    // Only the language switcher form should change the saved preference
    // Apply locale temporarily (updates Vue I18n, document lang, but NOT store)
    // This allows URL to override display without changing saved preference
    const { applyLocaleTemporarily } = await import('../utils/translation/localeManager.js');
    await applyLocaleTemporarily(localeInPath);

    log('router/index.js', 'beforeEach', 'locale-from-url', 'Locale applied temporarily from URL (not persisted)', {
      urlLocale: localeInPath,
      note: 'Store preference unchanged - only language switcher changes store'
    });
  } else {
    // No valid locale in URL - treat localeInPath as part of the route path if it exists
    // This handles cases where a non-existent route like "/nonexist" was matched as locale
    if (localeInPath && !SUPPORTED_LOCALES.includes(localeInPath)) {
      log('router/index.js', 'beforeEach', 'invalid-locale', 'Invalid locale in path, treating as route path', {
        invalidLocale: localeInPath,
        path: to.path
      });
    }
    // No locale in URL - inject saved/browser/default locale
    const resolvedLocale = resolveActiveLocale();
    const DEFAULT_LOCALE = 'en';

    // Only add locale prefix for non-default locales
    // Default locale (en) should not have prefix in URL
    let pathWithLocale;
    if (resolvedLocale === DEFAULT_LOCALE) {
      // Default locale - no prefix needed
      pathWithLocale = to.path;
    } else {
      // Non-default locale - add prefix
      pathWithLocale = `/${resolvedLocale}${to.path}`;
    }

    log('router/index.js', 'beforeEach', 'locale-inject', 'Injecting locale into URL', {
      originalPath: to.path,
      newPath: pathWithLocale,
      locale: resolvedLocale,
      isDefaultLocale: resolvedLocale === DEFAULT_LOCALE
    });

    // Only redirect if path actually changed
    if (pathWithLocale !== to.path) {
      // Redirect to path with locale using replaceState (no history entry)
      return next({
        path: pathWithLocale,
        query: to.query,
        hash: to.hash,
        replace: true // Use replace to avoid adding history entry
      });
    }
  }

  if (window.performanceTracker) {
    try {
      window.performanceTracker.step({
        step: 'navigationStart',
        file: 'router/index.js',
        method: 'beforeEach',
        flag: 'nav-start',
        purpose: `Navigate from ${from.path} to ${to.path}`
      });
    } catch (e) {
      // Performance tracker session ended, ignore
    }
  }

  // Get route configuration from meta
  const routeConfig = to.meta?.routeConfig;

  if (!routeConfig) {
    log('router/index.js', 'beforeEach', 'no-config', 'No route configuration found in meta, allowing navigation', { path: to.path });
    next();
    return;
  }

  // Get auth context from auth store
  const authStore = useAuthStore();
  const guardContext = {
    isAuthenticated: authStore.isAuthenticated,
    userRole: authStore.currentUser?.role || 'guest',
    userProfile: authStore.currentUser || {}
  };

  log('router/index.js', 'beforeEach', 'auth-context', 'Auth context prepared', guardContext);

  // Resolve section for current user role and store on meta to ensure downstream consumers get a concrete section string
  try {
    const resolvedSection = resolveSectionIdentifier(routeConfig.section, guardContext.userRole);
    if (resolvedSection && typeof resolvedSection === 'string') {
      to.meta.section = resolvedSection;
    } else {
      // fallback to original section if resolution fails
      to.meta.section = routeConfig.section;
    }
    log('router/index.js', 'beforeEach', 'section-resolve', 'Resolved meta.section for current role', {
      role: guardContext.userRole,
      resolvedSection: to.meta.section
    });
  } catch (e) {
    log('router/index.js', 'beforeEach', 'section-resolve-error', 'Failed to resolve meta.section (non-blocking)', {
      error: e?.message
    });
    to.meta.section = routeConfig.section;
  }

  // Run all route guards (AWAIT the async call)
  const guardResult = await runAllRouteGuards(routeConfig, from.meta?.routeConfig, guardContext);

  // Handle guard result
  if (guardResult.allow) {
    log('router/index.js', 'beforeEach', 'allow', 'Navigation allowed by guards', { to: to.path });

    if (window.performanceTracker) {
      try {
        window.performanceTracker.step({
          step: 'navigationAllowed',
          file: 'router/index.js',
          method: 'beforeEach',
          flag: 'nav-allow',
          purpose: `Navigation to ${to.path} allowed`
        });
      } catch (e) {
        // Performance tracker session ended, ignore
      }
    }

    // Load translations for current section BEFORE allowing navigation
    // This ensures translations are ready before component renders (no placeholder text flash)
    const currentSection = to.meta?.section;
    if (currentSection) {
      let resolvedSection = currentSection;
      if (typeof currentSection === 'object' && currentSection !== null) {
        const { resolveRoleSectionVariant } = await import('../utils/section/sectionResolver.js');
        resolvedSection = resolveRoleSectionVariant(currentSection, guardContext.userRole);
      }

      if (resolvedSection && typeof resolvedSection === 'string') {
        try {
          // Get the active locale to ensure we load the correct translations
          const activeLocale = resolveActiveLocale();

          log('router/index.js', 'beforeEach', 'translation-preload', 'Loading translations before navigation', {
            section: resolvedSection,
            locale: activeLocale,
            path: to.path
          });

          if (window.performanceTracker) {
            try {
              window.performanceTracker.step({
                step: 'translationPreload_start',
                file: 'router/index.js',
                method: 'beforeEach',
                flag: 'translation-preload',
                purpose: `Preload translations for ${resolvedSection} (locale: ${activeLocale})`
              });
            } catch (e) {
              // Performance tracker session ended, ignore
            }
          }

          // AWAIT translation loading - blocks navigation until complete
          // Explicitly pass the active locale to ensure correct translations are loaded
          await loadTranslationsForSection(resolvedSection, activeLocale);

          log('router/index.js', 'beforeEach', 'translation-preloaded', 'Translations loaded before navigation', {
            section: resolvedSection,
            path: to.path
          });

          if (window.performanceTracker) {
            try {
              window.performanceTracker.step({
                step: 'translationPreload_complete',
                file: 'router/index.js',
                method: 'beforeEach',
                flag: 'translation-ready',
                purpose: `Translations ready for ${resolvedSection}`
              });
            } catch (e) {
              // Performance tracker session ended, ignore
            }
          }
        } catch (err) {
          // Log error but don't block navigation
          log('router/index.js', 'beforeEach', 'translation-preload-error', 'Translation preload failed (non-blocking)', {
            section: resolvedSection,
            path: to.path,
            error: err.message
          });
        }
      }
    }

    next();
  } else {
    log('router/index.js', 'beforeEach', 'block', 'Navigation blocked by guards', {
      to: to.path,
      reason: guardResult.reason,
      redirectTo: guardResult.redirectTo
    });

    if (window.performanceTracker) {
      try {
        window.performanceTracker.step({
          step: 'navigationBlocked',
          file: 'router/index.js',
          method: 'beforeEach',
          flag: 'nav-block',
          purpose: `Navigation blocked: ${guardResult.reason}`
        });
      } catch (e) {
        // Performance tracker session ended, ignore
      }
    }

    if (guardResult.redirectTo) {
      next(guardResult.redirectTo);
    } else {
      next(false);
    }
  }
});

/**
 * After each route navigation
 * Update active route, preload section, load translations, track completion
 */
router.afterEach(async (to, from) => {
  log('router/index.js', 'afterEach', 'start', 'Navigation completed', {
    from: from.path,
    to: to.path
  });

  if (window.performanceTracker) {
    try {
      window.performanceTracker.step({
        step: 'navigationComplete',
        file: 'router/index.js',
        method: 'afterEach',
        flag: 'nav-complete',
        purpose: `Navigation to ${to.path} completed`
      });
    } catch (e) {
      // Performance tracker session ended, ignore
    }
  }

  // Clear navigation loop history on successful navigation
  // This prevents legitimate visits from accumulating and being flagged as loops
  const { clearNavigationHistory } = await import('../utils/route/routeGuards.js');
  clearNavigationHistory();

  log('router/index.js', 'afterEach', 'loop-reset', 'Navigation history cleared after successful navigation', {
    to: to.path
  });

  // Update active route in navigation tracker
  if (to.meta?.routeConfig) {
    setCurrentActiveRoute(to.meta.routeConfig);
  }

  const routeConfig = to.meta?.routeConfig;

  // Check if route should be excluded from preloading
  const preloadExclude = routeConfig?.preloadExclude === true;

  if (preloadExclude) {
    log('router/index.js', 'afterEach', 'preload-excluded', 'Route excluded from preloading', {
      path: to.path,
      preloadExclude
    });
    return;
  }

  if (routeConfig) {
    // Get auth store for role-based preload resolution
    const authStore = useAuthStore();
    const userRole = authStore.currentUser?.role || 'guest';

    // IMPORTANT: Only use preLoadSections directly from routeConfig
    // Do NOT use getPreloadSectionsForRoute if it might merge/inherit other sections
    // Get sections to preload ONLY from the route's preLoadSections array
    const sectionsToPreload = Array.isArray(routeConfig.preLoadSections)
      ? [...routeConfig.preLoadSections]  // Create a copy to avoid mutations
      : [];

    const resolvedSectionsToPreload = sectionsToPreload
      .map(identifier => resolveSectionIdentifier(identifier, userRole))
      .filter(sectionName => typeof sectionName === 'string' && sectionName.length > 0);

    const uniqueResolvedSections = [...new Set(resolvedSectionsToPreload)];

    // Log what we're about to preload for debugging
    log('router/index.js', 'afterEach', 'preload-check', 'Checking preload sections', {
      path: to.path,
      preLoadSections: routeConfig.preLoadSections,
      sectionsToPreload,
      resolvedSections: uniqueResolvedSections,
      routeConfigSlug: routeConfig.slug
    });

    // Load CSS for the current route's section (blocking)
    const currentSection = to.meta?.section;
    const previousSection = from.meta?.section;

    // Unload previous section CSS if navigating to a different section
    if (previousSection && previousSection !== currentSection) {
      const { unloadSectionCss } = await import('../utils/section/sectionCssLoader.js');
      unloadSectionCss(previousSection);
      log('router/index.js', 'afterEach', 'css-unload', 'Unloaded previous section CSS', {
        previousSection
      });
    }

    // Load current section CSS
    if (currentSection) {
      loadSectionCss(currentSection).catch(err => {
        log('router/index.js', 'afterEach', 'css-error', 'Section CSS load failed (non-blocking)', {
          section: currentSection,
          error: err.message
        });
      });
    }

    // Also load translations for the current route's section (for current view)
    if (currentSection) {
      // Resolve section to string (handles both string and object sections)
      let resolvedSection = currentSection;
      if (typeof currentSection === 'object' && currentSection !== null) {
        const { resolveRoleSectionVariant } = await import('../utils/section/sectionResolver.js');
        resolvedSection = resolveRoleSectionVariant(currentSection, userRole);
      }

      if (resolvedSection && typeof resolvedSection === 'string') {
        // Get the active locale to ensure we load the correct translations
        const { resolveActiveLocale } = await import('../utils/translation/localeManager.js');
        const activeLocale = resolveActiveLocale();

        loadTranslationsForSection(resolvedSection, activeLocale).catch(err => {
          log('router/index.js', 'afterEach', 'translation-error', 'Translation load failed (non-blocking)', {
            originalSection: currentSection,
            resolvedSection,
            locale: activeLocale,
            error: err.message
          });
        });
      } else {
        log('router/index.js', 'afterEach', 'translation-warn', 'Could not resolve section to string, skipping translation load', {
          section: currentSection,
          resolvedSection,
          userRole
        });
      }
    }

    // Preload assets for the current section (non-blocking)
    if (currentSection) {
      let resolvedSectionForAssets = currentSection;
      if (typeof currentSection === 'object' && currentSection !== null) {
        const { resolveRoleSectionVariant } = await import('../utils/section/sectionResolver.js');
        resolvedSectionForAssets = resolveRoleSectionVariant(currentSection, userRole);
      }

      if (resolvedSectionForAssets && typeof resolvedSectionForAssets === 'string') {
        preloadSectionAssets(resolvedSectionForAssets).catch(err => {
          log('router/index.js', 'afterEach', 'asset-preload-error', 'Current section asset preload failed (non-blocking)', {
            section: resolvedSectionForAssets,
            error: err.message
          });
        });
      }
    }

    if (uniqueResolvedSections.length > 0) {
      log('router/index.js', 'afterEach', 'preload', 'Preloading sections for route', {
        path: to.path,
        originalIdentifiers: sectionsToPreload,
        resolvedSections: uniqueResolvedSections,
        note: 'ONLY these sections will be preloaded, not all sections'
      });

      try {
        // Preload ONLY sections from preLoadSections array (non-blocking)
        for (const sectionToPreload of uniqueResolvedSections) {
          // Skip preloading the current section (it's already loaded)
          if (sectionToPreload === currentSection) {
            continue;
          }

          if (sectionToPreload && typeof sectionToPreload === 'string') {
            log('router/index.js', 'afterEach', 'preload-section', 'Preloading specific section', {
              section: sectionToPreload,
              path: to.path
            });

            // Preload CSS for future sections
            preloadSectionCss(sectionToPreload).catch(err => {
              log('router/index.js', 'afterEach', 'preload-css-error', 'CSS preload failed (non-blocking)', {
                section: sectionToPreload,
                error: err.message
              });
            });

            preloadSection(sectionToPreload).catch(err => {
              log('router/index.js', 'afterEach', 'preload-error', 'Section preload failed (non-blocking)', {
                section: sectionToPreload,
                error: err.message
              });
            });

            // Load translations for preloaded sections (non-blocking)
            // Get the active locale to ensure we load the correct translations
            const { resolveActiveLocale } = await import('../utils/translation/localeManager.js');
            const activeLocale = resolveActiveLocale();

            loadTranslationsForSection(sectionToPreload, activeLocale).catch(err => {
              log('router/index.js', 'afterEach', 'translation-error', 'Translation load failed (non-blocking)', {
                section: sectionToPreload,
                locale: activeLocale,
                error: err.message
              });
            });
          } else {
            log('router/index.js', 'afterEach', 'preload-skip', 'Skipping invalid section name', {
              sectionToPreload,
              type: typeof sectionToPreload
            });
          }
        }

        log('router/index.js', 'afterEach', 'success', 'Section preload and translation load initiated', {
          sections: uniqueResolvedSections
        });
      } catch (error) {
        log('router/index.js', 'afterEach', 'error', 'Error during post-navigation tasks', {
          error: error.message,
          stack: error.stack
        });
      }
    } else {
      log('router/index.js', 'afterEach', 'no-preload', 'No sections to preload for route', {
        path: to.path,
        hasPreLoadSections: !!routeConfig.preLoadSections,
        preLoadSectionsValue: routeConfig.preLoadSections
      });
    }
  } else {
    log('router/index.js', 'afterEach', 'no-config', 'Route has no configuration, skipping preload', { path: to.path });
  }
});

/**
 * Handle navigation errors
 */
router.onError((error) => {
  log('router/index.js', 'onError', 'error', 'Navigation error occurred', {
    error: error.message,
    stack: error.stack
  });

  if (window.performanceTracker) {
    try {
      window.performanceTracker.step({
        step: 'navigationError',
        file: 'router/index.js',
        method: 'onError',
        flag: 'nav-error',
        purpose: `Navigation error: ${error.message}`
      });
    } catch (e) {
      // Performance tracker session ended, ignore
    }
  }
});

export default router;
export { runAllRouteGuards };
