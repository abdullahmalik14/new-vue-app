/**
 * Navigation error helpers for Vue Router (B6).
 */

import { getDefaultNavigationErrorSlug } from './routeDefaults.js';

/**
 * Detect lazy-route / code-split chunk load failures (Webpack, Vite, Safari).
 *
 * @param {unknown} error
 * @returns {boolean}
 */
export function isChunkLoadNavigationError(error) {
  if (!error) {
    return false;
  }

  const name = error instanceof Error ? error.name : '';
  const message = String(
    error instanceof Error ? error.message : error,
  ).toLowerCase();

  if (name === 'ChunkLoadError') {
    return true;
  }

  return (
    message.includes('loading chunk') ||
    message.includes('failed to fetch dynamically imported module') ||
    message.includes('importing a module script failed') ||
    message.includes('error loading dynamically imported module')
  );
}

/**
 * @param {import('vue-router').Router} router
 * @returns {boolean}
 */
export function isOnNavigationErrorRoute(router) {
  const targetSlug = getDefaultNavigationErrorSlug();
  const current = router.currentRoute.value;
  const slug = current?.meta?.routeConfig?.slug ?? current?.name;

  return slug === targetSlug || current?.path === targetSlug;
}

/**
 * Redirect to configured navigation error route after chunk load failure.
 *
 * @param {import('vue-router').Router} router
 * @returns {Promise<void>}
 */
export async function recoverFromChunkLoadError(router) {
  if (isOnNavigationErrorRoute(router)) {
    return;
  }

  const target = getDefaultNavigationErrorSlug();
  await router.replace(target);
}
