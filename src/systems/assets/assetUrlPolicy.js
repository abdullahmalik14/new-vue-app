/**
 * Asset URL policy helpers.
 *
 * Centralizes the rules that decide whether a raw string value should be
 * treated as an asset-library flag (e.g. "dashboard.menu.analytics") versus an
 * already-resolved URL/path/data-URI. Lives in the asset systems layer so data
 * and config modules don't have to embed asset-resolution logic.
 */

/**
 * Returns true when `value` looks like an asset-library flag candidate:
 * a non-empty, dotted identifier that is not a URL, path, or data URI.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isAssetLibraryFlagCandidate(value) {
  if (typeof value !== "string") {
    return false;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  if (trimmed.startsWith("data:") || trimmed.includes("://") || trimmed.includes("/")) {
    return false;
  }
  return trimmed.includes(".");
}
