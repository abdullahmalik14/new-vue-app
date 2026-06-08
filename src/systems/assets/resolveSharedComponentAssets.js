import sharedAssetPreloads from '../../router/sharedAssetPreloads.json';
import { getAssetUrls } from './assetLibrary.js';

const PRELOAD_TIER_ORDER = ['critical', 'high', 'normal'];

/**
 * @param {string} catalogRef
 * @returns {Map<string, { flag: string, priority?: string, type?: string }>}
 */
export function getSharedCatalogEntriesByFlag(catalogRef) {
  const entries = sharedAssetPreloads[catalogRef];
  const byFlag = new Map();

  if (!Array.isArray(entries)) {
    return byFlag;
  }

  for (const entry of entries) {
    if (entry?.flag) {
      byFlag.set(entry.flag, entry);
    }
  }

  return byFlag;
}

/**
 * @param {string} mappingRef
 * @returns {Record<string, string>}
 */
export function getSharedComponentAssetMapping(mappingRef) {
  const mapping = sharedAssetPreloads[mappingRef];

  if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) {
    throw new Error(`Unknown shared component asset mapping: ${mappingRef}`);
  }

  return { ...mapping };
}

/**
 * @param {string} priority
 * @returns {'critical' | 'high' | 'normal'}
 */
function getPreloadTier(priority) {
  if (priority === 'critical') {
    return 'critical';
  }

  if (priority === 'high') {
    return 'high';
  }

  return 'normal';
}

/**
 * Group component slots by preload priority from a shared catalog entry.
 *
 * @param {string} componentRef
 * @param {string} catalogRef
 * @returns {Record<'critical' | 'high' | 'normal', Array<{ slot: string, flag: string }>>}
 */
export function groupComponentSlotsByPreloadTier(componentRef, catalogRef) {
  const mapping = getSharedComponentAssetMapping(componentRef);
  const priorityByFlag = getSharedCatalogEntriesByFlag(catalogRef);
  const groups = {
    critical: [],
    high: [],
    normal: [],
  };

  for (const [slot, flag] of Object.entries(mapping)) {
    const priority = priorityByFlag.get(flag)?.priority || 'normal';
    groups[getPreloadTier(priority)].push({ slot, flag });
  }

  return groups;
}

/**
 * Resolve component slot URLs from sharedAssetPreloads.json mappings.
 *
 * @param {string} mappingRef
 * @returns {Promise<Record<string, string | null>>}
 */
export async function resolveSharedComponentAssets(mappingRef) {
  const mapping = getSharedComponentAssetMapping(mappingRef);
  const flags = Object.values(mapping);
  const urlMap = await getAssetUrls(flags);
  const assets = {};

  for (const [slot, flag] of Object.entries(mapping)) {
    assets[slot] = urlMap[flag] ?? null;
  }

  return assets;
}

export { PRELOAD_TIER_ORDER };
