/**
 * Menu items configuration with asset flags and translation keys
 * Asset flags will be resolved to URLs using assetLibrary
 * Translation keys will be resolved using translationLoader
 */
export const dashboardSidebarMenuItems = [
  {
    menuItemId: 1,
    fallbackLabel: "Analytics", // Fallback text
    translationKey: "dashboard.menu.analytics", // Translation key
    iconAssetFlag: "dashboard.menu.analytics", // Asset flag instead of hardcoded URL
    route: "/dashboard/analytics",
    submenuItems: [],
    isEnabled: true
  },
  {
    menuItemId: 2,
    fallbackLabel: "Payout", // Fallback text
    translationKey: "dashboard.menu.payout", // Translation key
    iconAssetFlag: "dashboard.menu.payout", // Asset flag instead of hardcoded URL
    route: "/payout",
    submenuItems: [],
    isEnabled: true,
    roles: ['creator']
  },
  {
    menuItemId: 3,
    fallbackLabel: "Orders", // Fallback text
    translationKey: "dashboard.menu.orders", // Translation key
    iconAssetFlag: "dashboard.menu.orders", // Asset flag instead of hardcoded URL
    route: "/dashboard/orders",
    submenuItems: [
      {
        menuItemId: 301,
        fallbackLabel: "Orders Received", // Fallback text
        translationKey: "dashboard.menu.ordersReceived", // Translation key
        route: "/dashboard/orders/order-received",
        iconAssetFlag: "",
        isEnabled: true
      },
      {
        menuItemId: 302,
        fallbackLabel: "Custom Product Request", // Fallback text
        translationKey: "dashboard.menu.customProductRequest", // Translation key
        route: "/orders/custom-product-request",
        iconAssetFlag: "",
        isEnabled: false
      },
      {
        menuItemId: 303,
        fallbackLabel: "Item Purchased", // Fallback text
        translationKey: "dashboard.menu.itemPurchased", // Translation key
        route: "/dashboard/orders/item-purchased",
        iconAssetFlag: "",
        isEnabled: true
      }
    ],
    isEnabled: true
  },
  {
    menuItemId: 4,
    fallbackLabel: "Media", // Fallback text
    translationKey: "dashboard.menu.media", // Translation key
    iconAssetFlag: "dashboard.menu.media", // Asset flag instead of hardcoded URL
    route: "/dashboard/my-media",
    submenuItems: [],
    isEnabled: true
  },
  {
    menuItemId: 5,
    fallbackLabel: "Chats", // Fallback text
    translationKey: "dashboard.menu.chats", // Translation key
    iconAssetFlag: "dashboard.menu.chats", // Asset flag instead of hardcoded URL
    route: "/dashboard/chats",
    submenuItems: [],
    isEnabled: true // Disabled as in original
  },
  {
    menuItemId: 6,
    fallbackLabel: "Subscriptions", // Fallback text
    translationKey: "dashboard.menu.subscriptions", // Translation key
    iconAssetFlag: "dashboard.menu.subscriptions", // Asset flag instead of hardcoded URL
    route: "/dashboard/subscriptions",
    submenuItems: [],
    isEnabled: true
  },
  // Overflow items (these will appear in the floating panel)
  {
    menuItemId: 7,
    fallbackLabel: "Shops", // Fallback text
    translationKey: "dashboard.menu.shops", // Translation key
    iconAssetFlag: "dashboard.menu.shops", // Asset flag instead of hardcoded URL
    route: "/shop",
    submenuItems: [],
    isEnabled: true // Disabled as in original
  },
  {
    menuItemId: 8,
    fallbackLabel: "Profile", // Fallback text
    translationKey: "dashboard.menu.profile", // Translation key (using existing profile key)
    iconAssetFlag: "dashboard.menu.profile", // Asset flag instead of hardcoded URL
    route: "/profile",
    submenuItems: [
      {








































        
        menuItemId: 801,
        fallbackLabel: "Edit Profile", // Fallback text
        translationKey: "dashboard.menu.editProfile", // Translation key
        route: "/dashboard/edit-profile",
        iconAssetFlag: "",
        isEnabled: true
      },
      {
        menuItemId: 802,
        fallbackLabel: "Subscribers & Followers", // Fallback text
        translationKey: "dashboard.menu.subscribersFollowers", // Translation key
        route: "/profile/subscribers-followers",
        iconAssetFlag: "",
        badgeId: "dashboard.menu.subscribersFollowers",
        isEnabled: false
      },
      {
        menuItemId: 803,
        fallbackLabel: "Your Posts", // Fallback text
        translationKey: "dashboard.menu.yourPosts", // Translation key
        route: "/profile/your-posts",
        iconAssetFlag: "",
        isEnabled: false
      },
      {
        menuItemId: 804,
        fallbackLabel: "Referrals", // Fallback text
        translationKey: "dashboard.menu.referrals", // Translation key
        route: "/dashboard/referrals",
        iconAssetFlag: "",
        badgeId: "dashboard.menu.referrals",
        isEnabled: true
      }
    ],
    isEnabled: true
  },
  {
    menuItemId: 9,
    fallbackLabel: "Settings", // Fallback text
    translationKey: "dashboard.menu.settings", // Translation key (using existing settings key)
    iconAssetFlag: "dashboard.menu.settings", // Asset flag instead of hardcoded URL
    route: "/dashboard/settings",
    submenuItems: [],
    isEnabled: true
  },
  {
    menuItemId: 10,
    fallbackLabel: "X Repost", // Fallback text
    translationKey: "dashboard.menu.xrepost", // Translation key
    iconAssetFlag: "dashboard.menu.xrepost", // Asset flag instead of hardcoded URL
    route: "/x-repost",
    submenuItems: [],
    isEnabled: false // Disabled as in original
  },
  {
    menuItemId: 11,
    fallbackLabel: "Blog", // Fallback text
    translationKey: "dashboard.menu.blog", // Translation key
    iconAssetFlag: "dashboard.menu.blog", // Asset flag instead of hardcoded URL
    route: "/blog",
    submenuItems: [],
    isEnabled: false // Disabled as in original
  }
]

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
  items.forEach(item => {
    if (isValidAssetLibraryFlagCandidate(item.iconAssetFlag)) {
      assetFlags.add(item.iconAssetFlag.trim());
    }
  });

  // Load all asset URLs in parallel
  const assetFlagsArray = Array.from(assetFlags);
  const iconAssetUrlsByFlag = await getAssetUrls(assetFlagsArray);

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
      resolved.iconUrl = resolvedIconUrl;
    }

    // Recursively resolve children
    if (item.submenuItems && item.submenuItems.length > 0) {
      resolved.submenuItems = item.submenuItems.map(child => resolveMenuItem(child)).filter(Boolean);
    }

    return resolved;
  };

  return items.map(resolveMenuItem).filter(Boolean);
}