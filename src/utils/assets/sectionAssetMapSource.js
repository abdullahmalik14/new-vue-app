// vueApp-main-new/src/utils/assets/sectionAssetMapSource.js

import { parseAssetMapJsonText, shouldAllowRuntimeAssetMapFetch } from './assetMapSource.js';

/** @type {Record<string, object>} section name → map (build-time glob) */
const bundledSectionMaps = import.meta.glob('../../config/assetMap.*.json', {
  eager: true,
  import: 'default',
});

/**
 * @param {string} path
 * @returns {string|null}
 */
export function parseSectionNameFromAssetMapPath(path) {
  const match = String(path).match(/assetMap\.([^.]+)\.json$/i);
  return match ? match[1] : null;
}

const bundledBySection = Object.create(null);

for (const [path, data] of Object.entries(bundledSectionMaps)) {
  const section = parseSectionNameFromAssetMapPath(path);

  if (section) {
    bundledBySection[section] = data;
  }
}

/**
 * @param {string} sectionName
 * @returns {boolean}
 */
export function isValidSectionAssetMapName(sectionName) {
  return typeof sectionName === 'string' && /^[a-z0-9][a-z0-9-]*$/i.test(sectionName.trim());
}

/**
 * @param {string} sectionName
 * @returns {object|null} Cloned map or null when no bundled section file exists
 */
export function getBundledSectionAssetMap(sectionName) {
  if (!isValidSectionAssetMapName(sectionName)) {
    return null;
  }

  const key = sectionName.trim();
  const map = bundledBySection[key];

  return map ? structuredClone(map) : null;
}

/**
 * @returns {string[]}
 */
export function getKnownBundledSectionNames() {
  return Object.keys(bundledBySection).sort();
}

/**
 * @param {string} sectionName
 * @returns {string[]}
 */
export function getSectionAssetMapFetchCandidates(sectionName) {
  const safe = sectionName.trim();
  const candidates = [`/config/assetMap.${safe}.json`];

  if (import.meta.env.DEV) {
    candidates.push(`/src/config/assetMap.${safe}.json`);
  }

  return candidates;
}

/**
 * @param {string} sectionName
 * @returns {Promise<object|null>}
 */
export async function fetchSectionAssetMapFromNetwork(sectionName) {
  if (!shouldAllowRuntimeAssetMapFetch() || !isValidSectionAssetMapName(sectionName)) {
    return null;
  }

  for (const url of getSectionAssetMapFetchCandidates(sectionName)) {
    try {
      const response = await fetch(url);

      if (response.status === 404) {
        continue;
      }

      if (!response.ok) {
        continue;
      }

      const rawText = await response.text();
      const assetMap = parseAssetMapJsonText(rawText);

      if (assetMap) {
        return assetMap;
      }
    } catch {
      // try next candidate
    }
  }

  return null;
}
