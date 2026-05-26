import { getRouteConfiguration } from '../route/routeConfigLoader.js';
import { log } from '../common/logHandler.js';

/** @type {Map<string, { assets: object[], routeCount: number }>} */
const sectionAssetPreloadCache = new Map();

/**
 * @param {object} route
 * @param {string} sectionName
 * @returns {boolean}
 */
export function routeBelongsToSection(route, sectionName) {
  if (typeof route.section === 'string') {
    return route.section === sectionName;
  }

  if (typeof route.section === 'object' && route.section !== null) {
    return Object.values(route.section).includes(sectionName);
  }

  return false;
}

/**
 * Clear memoized section assetPreload rollups (e.g. tests or route config reload).
 */
export function clearAssetPreloadSectionCache() {
  sectionAssetPreloadCache.clear();
}

/**
 * Merge assetPreload[] from all routes in a section (memoized per section name).
 *
 * @param {string} sectionName
 * @returns {{ assets: object[], routeCount: number }}
 */
export function getAssetPreloadEntriesForSection(sectionName) {
  const cached = sectionAssetPreloadCache.get(sectionName);
  if (cached) {
    log('getAssetPreloadEntriesForSection.js', 'getAssetPreloadEntriesForSection', 'cache-hit', 'Returning cached section asset preload rollup', {
      sectionName,
      routeCount: cached.routeCount,
      assetCount: cached.assets.length,
    });
    return cached;
  }

  const routes = getRouteConfiguration();
  const sectionRoutes = routes.filter((route) => routeBelongsToSection(route, sectionName));

  const assets = [];
  for (const route of sectionRoutes) {
    if (route.assetPreload && Array.isArray(route.assetPreload)) {
      assets.push(...route.assetPreload);
    }
  }

  const entry = { assets, routeCount: sectionRoutes.length };
  sectionAssetPreloadCache.set(sectionName, entry);

  log('getAssetPreloadEntriesForSection.js', 'getAssetPreloadEntriesForSection', 'success', 'Section asset preload rollup built', {
    sectionName,
    routeCount: entry.routeCount,
    assetCount: assets.length,
  });

  return entry;
}
