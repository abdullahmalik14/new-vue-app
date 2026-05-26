/**
 * Cross-reference route assetPreload flags against assetMap.json (M-04).
 */

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
 * @param {Array<object>} routes Route config with expanded assetPreload[] entries
 * @param {Record<string, Record<string, string>>} assetMap
 * @returns {{ valid: boolean, errors: string[], missingCount: number }}
 */
export function validateRouteAssetPreloadFlags(routes, assetMap) {
  const availableFlags = collectAssetMapFlags(assetMap);
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
    if (!Array.isArray(route.assetPreload)) {
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
