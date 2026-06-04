// vueApp-main-new/src/utils/assets/assetMapSource.js

import bundledAssetMap from '../../config/assetMap.json';

/**
 * Injected at build time via vite `define` from src/config/assetMap.json file bytes.
 * Must be a bare identifier (not `typeof __ASSET_MAP_SHA256__`) so Vite can replace it.
 */
const BUNDLED_ASSET_MAP_SHA256 = __ASSET_MAP_SHA256__;

/**
 * @returns {boolean}
 */
export function shouldAllowRuntimeAssetMapFetch() {
  if (import.meta.env.PROD) {
    return false;
  }

  return import.meta.env.VITE_ASSET_MAP_RUNTIME_OVERRIDE === 'true';
}

/**
 * Deep-clone bundled map so runtime cannot mutate the build artifact.
 * @returns {object}
 */
export function getBundledAssetMap() {
  return structuredClone(bundledAssetMap);
}

/**
 * @returns {string}
 */
export function getBundledAssetMapSha256() {
  return BUNDLED_ASSET_MAP_SHA256 || import.meta.env.VITE_ASSET_MAP_SHA256 || '';
}

/**
 * @param {string} text
 * @returns {Promise<string>}
 */
export async function sha256HexFromText(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify fetched JSON text matches the build-time asset map hash.
 * @param {string} rawText
 * @returns {Promise<boolean>}
 */
export async function verifyFetchedAssetMapText(rawText) {
  if (!BUNDLED_ASSET_MAP_SHA256) {
    return true;
  }

  const digest = await sha256HexFromText(rawText);
  return digest === BUNDLED_ASSET_MAP_SHA256;
}

/**
 * @param {string} rawText
 * @returns {object|null}
 */
export function parseAssetMapJsonText(rawText) {
  try {
    const parsed = JSON.parse(rawText);

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
