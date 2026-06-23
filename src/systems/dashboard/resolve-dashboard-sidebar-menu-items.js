import { dashboardSidebarMenuItems } from "@/config/dashboard-sidebar-menu-items.js";
import { isAssetLibraryFlagCandidate } from "@/systems/assets/assetUrlPolicy.js";

/**
 * Resolve menu items with asset URLs from assetLibrary and translated titles
 * @param {Array} items - Menu items array (defaults to menuItems)
 * @returns {Promise<Array>} - Menu items with resolved image URLs and translated titles
 */
export async function resolveDashboardSidebarMenuItems(items = dashboardSidebarMenuItems, userRole = null) {
  const { getAssetUrls } = await import("@/systems/assets/assetLibrary.js");

  // Collect all unique asset flags from menu items
  const assetFlags = new Set();
  
  const collectFlags = (item) => {
    if (isAssetLibraryFlagCandidate(item.iconAssetFlag)) {
      assetFlags.add(item.iconAssetFlag.trim());
    }
    if (item.submenuItems && item.submenuItems.length > 0) {
      item.submenuItems.forEach(collectFlags);
    }
  };
  
  items.forEach(collectFlags);

  // Load all asset URLs in parallel
  const assetFlagsArray = Array.from(assetFlags);
  const iconAssetUrlsByFlag = await getAssetUrls(assetFlagsArray, { section: 'dashboard-global' }); // Use the section name used in useDashboardSidebarAssets

  // Resolve menu items with asset URLs and translations
  const resolveMenuItem = (item) => {
    const resolved = { ...item };

    // Role-based filtering: role-gated items are hidden unless the current role
    // is known AND explicitly allowed. Treat a missing role as "not allowed"
    // so restricted items never leak during auth bootstrap.
    if (resolved.roles && Array.isArray(resolved.roles) && resolved.roles.length > 0) {
      if (!userRole || !resolved.roles.includes(userRole)) {
        return null;
      }
    }

    // Resolve image URL
    if (isAssetLibraryFlagCandidate(item.iconAssetFlag)) {
      const resolvedIconUrl = iconAssetUrlsByFlag[item.iconAssetFlag.trim()] || null;
      if (!resolvedIconUrl) {
        console.warn(`[dashboardSidebarMenuItems] Missing asset for flag: ${item.iconAssetFlag}`);
      }
    }

    // Recursively resolve children
    if (item.submenuItems && item.submenuItems.length > 0) {
      resolved.submenuItems = item.submenuItems.map(child => resolveMenuItem(child)).filter(Boolean);
    }

    return resolved;
  };

  return items.map(resolveMenuItem).filter(Boolean);
}
