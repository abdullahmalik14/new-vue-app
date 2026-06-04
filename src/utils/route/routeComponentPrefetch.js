/**
 * Intent-based route component prefetch — warms import.meta.glob module cache on hover/focus.
 * Non-blocking; does not run guards or block navigation.
 */

import { getActivePinia } from 'pinia';
import { stripLeadingLocaleFromPath } from '../translation/localeManager.js';
import { useAuthStore } from '../../stores/useAuthStore.js';
import { getRouteConfiguration } from './routeConfigLoader.js';
import { resolveComponentPathForRoute } from './routeResolver.js';
import { resolveEffectiveRouteConfig } from '../section/sectionPreloadOrchestrator.js';
import { findComponentLoader } from './routeComponentLoader.js';
import { log } from '../common/logHandler.js';

const prefetchedPaths = new Set();
const prefetchInProgress = new Map();

/** @type {Map<string, object>|null} */
let routeBySlugCache = null;

const PATH_ALIASES = {
  '/shops': '/shop',
};

/**
 * @param {string|object} target
 * @returns {string|null}
 */
export function normalizeTargetPath(target) {
  if (typeof target === 'string') {
    return stripLeadingLocaleFromPath(target.split('?')[0].split('#')[0]);
  }

  if (target && typeof target === 'object' && typeof target.path === 'string') {
    return stripLeadingLocaleFromPath(target.path.split('?')[0].split('#')[0]);
  }

  return null;
}

/**
 * @returns {string}
 */
function resolveUserRoleForPrefetch() {
  const pinia = getActivePinia();
  if (!pinia) {
    return 'guest';
  }
  return useAuthStore(pinia).currentUser?.role || 'guest';
}

/**
 * @param {object|null|undefined} route
 * @returns {boolean}
 */
function isPrefetchableRoute(route) {
  if (!route || route.enabled === false) {
    return false;
  }

  const slug = route.slug;
  if (typeof slug !== 'string' || slug.includes(':') || slug.includes('*')) {
    return false;
  }

  if (route.redirect && !route.componentPath && !route.customComponentPath) {
    return false;
  }

  return true;
}

/**
 * @param {string} menuPath - Path from nav UI (may differ from routeConfig slug)
 * @returns {string[]}
 */
function buildPrefetchPathCandidates(menuPath) {
  const candidates = [menuPath];

  if (PATH_ALIASES[menuPath]) {
    candidates.push(PATH_ALIASES[menuPath]);
  }

  if (menuPath.startsWith('/dashboard/')) {
    candidates.push(menuPath.slice('/dashboard'.length) || '/');
  } else if (menuPath !== '/dashboard') {
    candidates.push(`/dashboard${menuPath}`);
  }

  return [...new Set(candidates.filter(Boolean))];
}

/**
 * @returns {Map<string, object>}
 */
function getRouteBySlugCache() {
  if (!routeBySlugCache) {
    routeBySlugCache = new Map(getRouteConfiguration().map((route) => [route.slug, route]));
  }
  return routeBySlugCache;
}

/**
 * @param {string} menuPath
 * @returns {{ route: object, resolvedSlug: string }|null}
 */
export function resolveRouteForPrefetch(menuPath) {
  const slugIndex = getRouteBySlugCache();

  for (const candidate of buildPrefetchPathCandidates(menuPath)) {
    const route = slugIndex.get(candidate);
    if (isPrefetchableRoute(route)) {
      return { route, resolvedSlug: candidate };
    }
  }

  return null;
}

/**
 * Prefetch a route's Vue component module on user intent (hover/focus).
 *
 * @param {string|object} targetPath - Route slug or vue-router `to` object
 * @param {{ userRole?: string }} [options]
 * @returns {Promise<void>}
 */
export function prefetchRouteComponent(targetPath, options = {}) {
  const menuPath = normalizeTargetPath(targetPath);

  if (!menuPath || menuPath === '/') {
    return Promise.resolve();
  }

  if (prefetchedPaths.has(menuPath)) {
    return Promise.resolve();
  }

  const inFlight = prefetchInProgress.get(menuPath);
  if (inFlight) {
    return inFlight;
  }

  const userRole = options.userRole ?? resolveUserRoleForPrefetch();

  const promise = (async () => {
    const resolved = resolveRouteForPrefetch(menuPath);
    if (!resolved) {
      log('routeComponentPrefetch.js', 'prefetchRouteComponent', 'skip', 'No exact prefetchable route for path', {
        menuPath,
        candidates: buildPrefetchPathCandidates(menuPath)
      });
      return;
    }

    const { route, resolvedSlug } = resolved;
    const effectiveRoute = resolveEffectiveRouteConfig(route);
    const componentPath = resolveComponentPathForRoute(effectiveRoute, userRole);
    if (!componentPath) {
      log('routeComponentPrefetch.js', 'prefetchRouteComponent', 'skip', 'Route has no component path for prefetch', {
        menuPath,
        resolvedSlug,
        userRole
      });
      return;
    }

    const loader = findComponentLoader(componentPath);
    if (!loader) {
      log('routeComponentPrefetch.js', 'prefetchRouteComponent', 'skip', 'Component loader not found for prefetch', {
        menuPath,
        resolvedSlug,
        componentPath
      });
      return;
    }

    await loader();
    prefetchedPaths.add(menuPath);

    log('routeComponentPrefetch.js', 'prefetchRouteComponent', 'success', 'Route component prefetched on intent', {
      menuPath,
      resolvedSlug,
      componentPath
    });
  })()
    .catch((error) => {
      log('routeComponentPrefetch.js', 'prefetchRouteComponent', 'warn', 'Route component prefetch failed (non-blocking)', {
        menuPath,
        error: error?.message
      });
    })
    .finally(() => {
      prefetchInProgress.delete(menuPath);
    });

  prefetchInProgress.set(menuPath, promise);
  return promise;
}

/**
 * @param {string|object} targetPath
 * @param {{ userRole?: string }} [options]
 * @returns {() => void}
 */
export function createRoutePrefetchIntentHandler(targetPath, options = {}) {
  return () => {
    prefetchRouteComponent(targetPath, options);
  };
}

/**
 * Reset cached route slug index (for tests).
 */
export function resetRoutePrefetchCache() {
  routeBySlugCache = null;
  prefetchedPaths.clear();
  prefetchInProgress.clear();
}
