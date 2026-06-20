/**
 * Asset preload policy — URL allow-list and preload entry validation entry point.
 */

const BLOCKED_SCHEME_PREFIXES = ['javascript:', 'data:', 'blob:', 'vbscript:'];

/**
 * Legacy ImgBB host — allowed until S-01 self-hosts dashboard/auth images.
 * Remove when assetMap.json no longer references i.ibb.co.
 */
const LEGACY_IMAGE_HOSTS = new Set(['i.ibb.co']);

function parseAllowedHosts() {
  const hosts = new Set(LEGACY_IMAGE_HOSTS);
  const raw = import.meta.env.VITE_ASSET_ALLOWED_HOSTS;

  if (!raw || typeof raw !== 'string') {
    return hosts;
  }

  raw
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean)
    .forEach((host) => hosts.add(host));

  return hosts;
}

function isLocalhost(hostname) {
  const host = hostname.toLowerCase();
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
}

function isSameOriginAbsolute(url) {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Validate a preload URL before injecting into the DOM.
 * @param {string} url
 * @param {{ assetType?: string }} [options]
 * @returns {{ ok: true, url: string, requiresIntegrity: boolean } | { ok: false, reason: string }}
 */
export function assertAllowedAssetUrl(url, options = {}) {
  const assetType = options.assetType || 'default';

  if (typeof url !== 'string' || !url.trim()) {
    return { ok: false, reason: 'empty-url' };
  }

  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  for (const scheme of BLOCKED_SCHEME_PREFIXES) {
    if (lower.startsWith(scheme)) {
      return { ok: false, reason: 'blocked-scheme' };
    }
  }

  if (trimmed.startsWith('//')) {
    return { ok: false, reason: 'protocol-relative' };
  }

  if (trimmed.startsWith('/')) {
    return { ok: true, url: trimmed, requiresIntegrity: false };
  }

  let parsed;

  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, reason: 'invalid-url' };
  }

  if (parsed.protocol === 'http:') {
    if (!isLocalhost(parsed.hostname)) {
      return { ok: false, reason: 'http-not-localhost' };
    }

    return { ok: true, url: trimmed, requiresIntegrity: false };
  }

  if (parsed.protocol !== 'https:') {
    return { ok: false, reason: 'unsupported-scheme' };
  }

  const hostname = parsed.hostname.toLowerCase();
  const allowedHosts = parseAllowedHosts();
  const sameOrigin = isSameOriginAbsolute(trimmed);
  const onAllowlist = allowedHosts.has(hostname);
  const isLocal = isLocalhost(hostname);

  if (!sameOrigin && !onAllowlist && !isLocal) {
    return { ok: false, reason: 'host-not-allowed' };
  }

  const requiresIntegrity =
    assetType === 'script' &&
    import.meta.env.PROD &&
    !sameOrigin &&
    !trimmed.startsWith('/');

  return { ok: true, url: trimmed, requiresIntegrity };
}

/** @deprecated Use {@link assertAllowedAssetUrl} — removed in a future naming pass. */
export const assertAllowedPreloadUrl = assertAllowedAssetUrl;

export {
  ALLOWED_ASSET_PRELOAD_TYPES,
  ALLOWED_ASSET_PRELOAD_PRIORITIES,
  collectAssetMapFlags,
  validateAssetPreloadEntryShape,
  validateRouteAssetPreloadRefs,
  validateRouteAssetPreloadFlags,
  validateSharedCatalogAssetPreloadFlags,
} from './validateRouteAssetPreloadFlags.js';

/** @alias validateAssetPreloadEntryShape */
export { validateAssetPreloadEntryShape as validateAssetPreloadEntry } from './validateRouteAssetPreloadFlags.js';
