import { dashboardSidebarMenuItems } from "@/assets/data/dashboard-sidebar-menu-items.js";

/**
 * Resolve menu items with asset URLs from assetLibrary and translated titles
 * @param {Array} items - Menu items array (defaults to menuItems)
 * @returns {Promise<Array>} - Menu items with resolved image URLs and translated titles
 */
export async function resolveDashboardSidebarMenuItems(items = dashboardSidebarMenuItems, userRole = null) {
  const { getAssetUrls } = await import("@/systems/assets/assetLibrary.js");

  const isValidAssetLibraryFlagCandidate = (value) => {
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
  };

  // Collect all unique asset flags from menu items
  const assetFlags = new Set();
  
  const collectFlags = (item) => {
    if (isValidAssetLibraryFlagCandidate(item.iconAssetFlag)) {
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

    // Role-based filtering: hide completely if role doesn't match
    if (resolved.roles && Array.isArray(resolved.roles) && userRole) {
      if (!resolved.roles.includes(userRole)) {
        return null;
      }
    }

    // Resolve image URL
    if (isValidAssetLibraryFlagCandidate(item.iconAssetFlag)) {
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
