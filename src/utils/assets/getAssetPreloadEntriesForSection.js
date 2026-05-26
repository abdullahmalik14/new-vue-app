import { getRouteConfiguration } from '../route/routeConfigLoader.js';
import { log } from '../common/logHandler.js';

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
  const byKey = new Map();

  for (const entry of entries) {
    const key = getAssetPreloadDedupeKey(entry);
    if (!key) {
      continue;
    }

    const existing = byKey.get(key);
    if (
      !existing ||
      getAssetPreloadPriorityValue(entry.priority) > getAssetPreloadPriorityValue(existing.priority)
    ) {
      byKey.set(key, entry);
    }
  }

  return Array.from(byKey.values());
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
  const cached = sectionAssetPreloadCache.get(sectionName);
  if (cached) {
    log('getAssetPreloadEntriesForSection.js', 'getAssetPreloadEntriesForSection', 'cache-hit', 'Returning cached section asset preload rollup', {
      sectionName,
      routeCount: cached.routeCount,
      assetCount: cached.assets.length,
      rawAssetCount: cached.rawAssetCount,
    });
    return cached;
  }

  const routes = getRouteConfiguration();
  const sectionRoutes = routes.filter((route) => routeBelongsToSection(route, sectionName));

  const rawAssets = [];
  for (const route of sectionRoutes) {
    if (route.assetPreload && Array.isArray(route.assetPreload)) {
      rawAssets.push(...route.assetPreload);
    }
  }

  const assets = dedupeAssetPreloadEntries(rawAssets);
  const entry = { assets, routeCount: sectionRoutes.length, rawAssetCount: rawAssets.length };
  sectionAssetPreloadCache.set(sectionName, entry);

  log('getAssetPreloadEntriesForSection.js', 'getAssetPreloadEntriesForSection', 'success', 'Section asset preload rollup built', {
    sectionName,
    routeCount: entry.routeCount,
    assetCount: assets.length,
    rawAssetCount: rawAssets.length,
    duplicateCount: rawAssets.length - assets.length,
  });

  return entry;
}
