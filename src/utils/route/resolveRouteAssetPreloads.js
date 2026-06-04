/**
 * Expand route-level assetPreloadRef keys into concrete assetPreload arrays.
 */

/**
 * @param {string} refKey
 * @param {Record<string, unknown[]>} sharedCatalog
 * @param {string} slug
 * @returns {unknown[]}
 */
function resolveAssetPreloadRefKey(refKey, sharedCatalog, slug) {
  const entries = sharedCatalog[refKey];

  if (!Array.isArray(entries)) {
    throw new Error(`Unknown assetPreloadRef "${refKey}" on route ${slug}`);
  }

  return entries;
}

/**
 * @param {Array<object>} routes
 * @param {Record<string, unknown[]>} [sharedCatalog]
 * @returns {Array<object>}
 */
export function resolveRouteAssetPreloads(routes, sharedCatalog = {}) {
  if (!Array.isArray(routes)) {
    return routes;
  }

  return routes.map((route) => {
    const ref = route.assetPreloadRef;

    if (!ref) {
      return route;
    }

    const refKeys = Array.isArray(ref) ? ref : [ref];
    const fromRefs = refKeys.flatMap((key) => {
      if (typeof key !== 'string' || !key.trim()) {
        throw new Error(`Invalid assetPreloadRef on route ${route.slug ?? '(unknown)'}`);
      }
      return resolveAssetPreloadRefKey(key.trim(), sharedCatalog, route.slug ?? '(unknown)');
    });

    const inline = Array.isArray(route.assetPreload) ? route.assetPreload : [];
    const { assetPreloadRef, ...rest } = route;

    return {
      ...rest,
      assetPreload: [...fromRefs, ...inline]
    };
  });
}
