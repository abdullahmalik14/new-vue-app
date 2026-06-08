/**
 * Validate dashboard component asset slot mappings against shared preload catalogs (C-06).
 */

/**
 * @param {Record<string, unknown>} sharedCatalog
 * @returns {string[]}
 */
export function validateSharedComponentAssetMappings(sharedCatalog = {}) {
  const errors = [];
  const menuIconFlags = new Set(
    (Array.isArray(sharedCatalog.dashboardMenuIcons) ? sharedCatalog.dashboardMenuIcons : [])
      .map((entry) => entry?.flag)
      .filter(Boolean),
  );

  for (const mappingRef of ['dashboardSidebarChrome', 'dashboardHeaderChrome']) {
    const mapping = sharedCatalog[mappingRef];

    if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) {
      errors.push(`Missing shared component asset mapping: ${mappingRef}`);
      continue;
    }

    for (const [slot, flag] of Object.entries(mapping)) {
      if (typeof flag !== 'string' || !flag.trim()) {
        errors.push(`${mappingRef}.${slot} must reference a non-empty asset flag`);
        continue;
      }

      if (!menuIconFlags.has(flag)) {
        errors.push(
          `${mappingRef}.${slot} references "${flag}" which is not listed in dashboardMenuIcons`,
        );
      }
    }
  }

  return errors;
}
