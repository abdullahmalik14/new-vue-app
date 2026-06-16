/**
 * Expand route-level assetPreloadRef keys into concrete assetPreload arrays.
 */

/**
 * @param {string} referenceKey
 * @param {Record<string, unknown[]>} sharedCatalog
 * @param {string} slug
 * @returns {unknown[]}
 */
function resolveAssetPreloadRefKey(referenceKey, sharedCatalog, slug) {
  const catalogEntries = sharedCatalog[referenceKey];

  if (!Array.isArray(catalogEntries)) {
    throw new Error(`Unknown assetPreloadRef "${referenceKey}" on route ${slug}`);
  }

  return catalogEntries;
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
    const assetPreloadReference = route.assetPreloadRef;

    if (!assetPreloadReference) {
      return route;
    }

    const assetPreloadReferenceKeys = Array.isArray(assetPreloadReference)
      ? assetPreloadReference
      : [assetPreloadReference];
    const preloadsFromReferences = assetPreloadReferenceKeys.flatMap((referenceKey) => {
      if (typeof referenceKey !== 'string' || !referenceKey.trim()) {
        throw new Error(`Invalid assetPreloadRef on route ${route.slug ?? '(unknown)'}`);
      }
      return resolveAssetPreloadRefKey(referenceKey.trim(), sharedCatalog, route.slug ?? '(unknown)');
    });

    const inlineAssetPreloads = Array.isArray(route.assetPreload) ? route.assetPreload : [];
    const { assetPreloadRef, ...routeWithoutPreloadReference } = route;

    return {
      ...routeWithoutPreloadReference,
      assetPreload: [...preloadsFromReferences, ...inlineAssetPreloads],
    };
  });
}
