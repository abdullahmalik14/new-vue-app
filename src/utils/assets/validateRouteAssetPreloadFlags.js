/**
 * Cross-reference route assetPreload flags against assetMap.json (M-04 / C-09).
 */

export const ALLOWED_ASSET_PRELOAD_TYPES = new Set([
  'image',
  'font',
  'video',
  'audio',
  'script',
  'json',
]);

export const ALLOWED_ASSET_PRELOAD_PRIORITIES = new Set([
  'critical',
  'high',
  'medium',
  'low',
  'normal',
]);

/**
 * @param {Record<string, Record<string, string>>} assetMap
 * @returns {Set<string>}
 */
export function collectAssetMapFlags(assetMap) {
  const flags = new Set();

  if (!assetMap || typeof assetMap !== 'object') {
    return flags;
  }

  for (const envAssets of Object.values(assetMap)) {
    if (envAssets && typeof envAssets === 'object' && !Array.isArray(envAssets)) {
      Object.keys(envAssets).forEach((flag) => flags.add(flag));
    }
  }

  return flags;
}

/**
 * @param {object} entry
 * @param {string} routeSlug
 * @param {number} entryIndex
 * @returns {string[]}
 */
export function validateAssetPreloadEntryShape(entry, routeSlug, entryIndex) {
  const errors = [];
  const label = `Route "${routeSlug ?? '(unknown)'}": assetPreload[${entryIndex}]`;

  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    errors.push(`${label} must be an object`);
    return errors;
  }

  if (!entry.type || typeof entry.type !== 'string' || !ALLOWED_ASSET_PRELOAD_TYPES.has(entry.type)) {
    errors.push(
      `${label} has invalid or missing type "${entry.type ?? ''}" — allowed: ${[...ALLOWED_ASSET_PRELOAD_TYPES].join(', ')}`,
    );
  }

  if (!entry.flag && !entry.src) {
    errors.push(`${label} must define either "flag" or "src"`);
  }

  if (entry.priority !== undefined) {
    if (typeof entry.priority !== 'string' || !ALLOWED_ASSET_PRELOAD_PRIORITIES.has(entry.priority)) {
      errors.push(
        `${label} has invalid priority "${entry.priority}" — allowed: ${[...ALLOWED_ASSET_PRELOAD_PRIORITIES].join(', ')}`,
      );
    }
  }

  if (entry.defer !== undefined && typeof entry.defer !== 'boolean') {
    errors.push(`${label} "defer" must be a boolean when present`);
  }

  if (entry.async !== undefined && typeof entry.async !== 'boolean') {
    errors.push(`${label} "async" must be a boolean when present`);
  }

  if (entry.location !== undefined && typeof entry.location !== 'string') {
    errors.push(`${label} "location" must be a string when present`);
  }

  if (entry.name !== undefined && typeof entry.name !== 'string') {
    errors.push(`${label} "name" must be a string when present`);
  }

  if (entry.flags !== undefined) {
    if (
      !Array.isArray(entry.flags) ||
      entry.flags.some((flag) => typeof flag !== 'string' || !flag.trim())
    ) {
      errors.push(`${label} "flags" must be a string[] when present`);
    }
  }

  return errors;
}

/**
 * @param {object} route
 * @param {Record<string, unknown[]>} [sharedCatalog]
 * @returns {string[]}
 */
export function validateRouteAssetPreloadRefs(route, sharedCatalog = {}) {
  const ref = route?.assetPreloadRef;

  if (!ref) {
    return [];
  }

  const errors = [];
  const refKeys = Array.isArray(ref) ? ref : [ref];
  const slug = route.slug ?? '(unknown)';

  for (const key of refKeys) {
    if (typeof key !== 'string' || !key.trim()) {
      errors.push(`Route "${slug}": assetPreloadRef entries must be non-empty strings`);
      continue;
    }

    if (!Array.isArray(sharedCatalog[key.trim()])) {
      errors.push(`Route "${slug}": unknown assetPreloadRef "${key.trim()}"`);
    }
  }

  return errors;
}

/**
 * @param {Array<object>} routes Route config with expanded assetPreload[] entries
 * @param {Record<string, Record<string, string>>} [assetMap]
 * @param {Record<string, unknown[]>} [sharedCatalog]
 * @returns {{ valid: boolean, errors: string[], missingCount: number }}
 */
export function validateRouteAssetPreloadFlags(routes, assetMap = null, sharedCatalog = null) {
  const availableFlags = assetMap ? collectAssetMapFlags(assetMap) : null;
  const errors = [];
  const reported = new Set();

  if (!Array.isArray(routes)) {
    return {
      valid: false,
      errors: ['Route configuration must be an array'],
      missingCount: 1,
    };
  }

  for (const route of routes) {
    if (sharedCatalog) {
      errors.push(...validateRouteAssetPreloadRefs(route, sharedCatalog));
    }

    if (!Array.isArray(route.assetPreload)) {
      continue;
    }

    route.assetPreload.forEach((entry, entryIndex) => {
      errors.push(...validateAssetPreloadEntryShape(entry, route.slug, entryIndex));
    });

    if (!availableFlags) {
      continue;
    }

    for (const entry of route.assetPreload) {
      const flag = entry?.flag;

      if (!flag || typeof flag !== 'string') {
        continue;
      }

      const reportKey = `${route.slug ?? '(unknown)'}::${flag}`;
      if (reported.has(reportKey)) {
        continue;
      }
      reported.add(reportKey);

      if (!availableFlags.has(flag)) {
        errors.push(
          `Route "${route.slug ?? '(unknown)'}": assetPreload flag "${flag}" not found in assetMap.json`,
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    missingCount: errors.length,
  };
}
