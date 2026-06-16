import { getRouteConfiguration } from '../routing/routeConfigLoader.js';
import { resolveEffectiveAssetPreloadForRoute } from '../routing/routeResolver.js';
import { log } from '../../infrastructure/logging/logHandler.js';

/** @type {Map<string, { assets: object[], routeCount: number, rawAssetCount: number }>} */
const sectionAssetPreloadCache = new Map();

/** @type {Record<string, number>} Higher value = preferred when duplicate flag/src appears */
const ASSET_PRELOAD_PRIORITY_MAP = { critical: 4, high: 3, medium: 2, low: 1, normal: 1 };

/**
 * @param {string | undefined} priority
 * @returns {number}
 */
function getAssetPreloadPriorityValue(priority) {
  return ASSET_PRELOAD_PRIORITY_MAP[priority] ?? 1;
}

/**
 * Stable key for deduplicating merged assetPreload entries (M-01).
 *
 * @param {object} entry
 * @returns {string | null}
 */
function getAssetPreloadDedupeKey(entry) {
  if (entry?.flag) {
    return `flag:${entry.flag}`;
  }

  if (entry?.src) {
    return `src:${entry.src}`;
  }

  return null;
}

/**
 * Collapse duplicate flag/src entries; keep the highest-priority definition.
 *
 * @param {object[]} entries
 * @returns {object[]}
 */
export function dedupeAssetPreloadEntries(entries) {
  const entriesByDedupeKey = new Map();

  for (const entry of entries) {
    const dedupeKey = getAssetPreloadDedupeKey(entry);
    if (!dedupeKey) {
      continue;
    }

    const existing = entriesByDedupeKey.get(dedupeKey);
    if (
      !existing ||
      getAssetPreloadPriorityValue(entry.priority) > getAssetPreloadPriorityValue(existing.priority)
    ) {
      entriesByDedupeKey.set(dedupeKey, entry);
    }
  }

  return Array.from(entriesByDedupeKey.values());
}

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
 * Disabled routes are omitted from Vue Router; they must not contribute assetPreload rollups (C-01).
 *
 * @param {object | null | undefined} route
 * @returns {boolean}
 */
export function isRouteEnabledForAssetPreload(route) {
  return Boolean(route) && route.enabled !== false;
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
 * @returns {{ assets: object[], routeCount: number, rawAssetCount: number }}
 */
export function getAssetPreloadEntriesForSection(sectionName) {
  const cachedSectionRollup = sectionAssetPreloadCache.get(sectionName);
  if (cachedSectionRollup) {
    log('routeSectionAssetPreloadEntries.js', 'getAssetPreloadEntriesForSection', 'cache-hit', 'Returning cached section asset preload rollup', {
      sectionName,
      routeCount: cachedSectionRollup.routeCount,
      assetCount: cachedSectionRollup.assets.length,
      rawAssetCount: cachedSectionRollup.rawAssetCount,
    });
    return cachedSectionRollup;
  }

  const routes = getRouteConfiguration();
  const sectionRoutes = routes.filter(
    (route) => isRouteEnabledForAssetPreload(route) && routeBelongsToSection(route, sectionName),
  );

  const rawAssets = [];
  for (const route of sectionRoutes) {
    rawAssets.push(...resolveEffectiveAssetPreloadForRoute(route));
  }

  const assets = dedupeAssetPreloadEntries(rawAssets);
  const sectionAssetRollup = { assets, routeCount: sectionRoutes.length, rawAssetCount: rawAssets.length };
  sectionAssetPreloadCache.set(sectionName, sectionAssetRollup);

  log('routeSectionAssetPreloadEntries.js', 'getAssetPreloadEntriesForSection', 'success', 'Section asset preload rollup built', {
    sectionName,
    routeCount: sectionAssetRollup.routeCount,
    assetCount: assets.length,
    rawAssetCount: rawAssets.length,
    duplicateCount: rawAssets.length - assets.length,
  });

  return sectionAssetRollup;
}
