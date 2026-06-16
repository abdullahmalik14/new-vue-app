/**
 * Intent-based section asset prefetch — warms assetPreload[] for a route's section on hover/focus.
 * Non-blocking; does not run guards or block navigation.
 */

import { getActivePinia } from 'pinia';
import { useAuthStore } from '../../stores/useAuthStore.js';
import { resolveCurrentRouteSectionName } from '../sections/sectionPreloadOrchestrator.js';
import { preloadSectionAssets } from './assetPreloader.js';
import { log } from '../../infrastructure/logging/logHandler.js';
import { normalizeTargetPath, resolveRouteForPrefetch } from '../routing/routeComponentPrefetch.js';

const prefetchedSections = new Set();
const prefetchInProgress = new Map();

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
 * Prefetch static assets declared for a route's section on user intent (hover/focus).
 *
 * @param {string|object} targetPath - Route slug or vue-router `to` object
 * @param {{ userRole?: string }} [options]
 * @returns {Promise<void>}
 */
export function prefetchSectionAssetsForRoute(targetPath, options = {}) {
  const menuPath = normalizeTargetPath(targetPath);

  if (!menuPath || menuPath === '/') {
    return Promise.resolve();
  }

  const userRole = options.userRole ?? resolveUserRoleForPrefetch();
  const resolved = resolveRouteForPrefetch(menuPath);

  if (!resolved) {
    log('routeAssetPrefetch.js', 'prefetchSectionAssetsForRoute', 'skip', 'No prefetchable route for asset intent', {
      menuPath,
    });
    return Promise.resolve();
  }

  const sectionName = resolveCurrentRouteSectionName(resolved.route, userRole);

  if (!sectionName) {
    log('routeAssetPrefetch.js', 'prefetchSectionAssetsForRoute', 'skip', 'Route has no section for asset prefetch', {
      menuPath,
      resolvedSlug: resolved.resolvedSlug,
      userRole,
    });
    return Promise.resolve();
  }

  if (prefetchedSections.has(sectionName)) {
    return Promise.resolve();
  }

  const inFlight = prefetchInProgress.get(sectionName);
  if (inFlight) {
    return inFlight;
  }

  const promise = preloadSectionAssets(sectionName)
    .then(() => {
      prefetchedSections.add(sectionName);
      log('routeAssetPrefetch.js', 'prefetchSectionAssetsForRoute', 'success', 'Section assets prefetched on intent', {
        menuPath,
        resolvedSlug: resolved.resolvedSlug,
        sectionName,
      });
    })
    .catch((error) => {
      log('routeAssetPrefetch.js', 'prefetchSectionAssetsForRoute', 'warn', 'Section asset prefetch failed (non-blocking)', {
        menuPath,
        sectionName,
        error: error?.message,
      });
    })
    .finally(() => {
      prefetchInProgress.delete(sectionName);
    });

  prefetchInProgress.set(sectionName, promise);
  return promise;
}

/**
 * @param {string|object} targetPath
 * @param {{ userRole?: string }} [options]
 * @returns {() => void}
 */
export function createSectionAssetPrefetchIntentHandler(targetPath, options = {}) {
  return () => {
    prefetchSectionAssetsForRoute(targetPath, options);
  };
}

/**
 * Reset intent asset prefetch dedupe state (tests).
 */
export function resetRouteAssetPrefetchCache() {
  prefetchedSections.clear();
  prefetchInProgress.clear();
}
