/**
 * @file bundlePathValidation.js
 * @description Same-origin and CDN allow-list checks for manifest bundle paths (S-03)
 */

function getTrustedBundleOrigins() {
  const raw = import.meta.env.VITE_TRUSTED_BUNDLE_ORIGINS;
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return [];
  }

  return raw.split(',').map((origin) => origin.trim()).filter(Boolean);
}

/**
 * Returns true when a manifest bundle path is safe to inject into a DOM link href.
 * Relative same-origin paths must start with `/`. Absolute URLs must match
 * `VITE_TRUSTED_BUNDLE_ORIGINS` (comma-separated prefix list).
 *
 * @param {string} path
 * @returns {boolean}
 */
export function isTrustedBundlePath(path) {
  if (typeof path !== 'string' || path.trim().length === 0) {
    return false;
  }

  const trimmed = path.trim();

  if (trimmed.startsWith('//')) {
    return false;
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !/^https?:\/\//i.test(trimmed)) {
    return false;
  }

  if (trimmed.startsWith('/')) {
    return true;
  }

  const trustedOrigins = getTrustedBundleOrigins();
  return trustedOrigins.some((origin) => trimmed.startsWith(origin));
}

/**
 * Escape a value for safe use inside a CSS attribute selector.
 * @param {string} value
 * @returns {string}
 */
export function escapeSelectorAttributeValue(value) {
  if (typeof value !== 'string') {
    return '';
  }

  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }

  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
