/**
 * Menu items configuration with asset flags and translation keys
 * Asset flags will be resolved to URLs using assetLibrary
 * Translation keys will be resolved using translationLoader
 */
export const menuItems = [
  {
    id: 1,
    title: "Analytics", // Fallback text
    translationKey: "dashboard.menu.analytics", // Translation key
    image: "dashboard.menu.analytics", // Asset flag instead of hardcoded URL
    route: "/dashboard/analytics",
    parent: false,
    children: [],
    enabled: true
  },
  {
    id: 2,
    title: "Payout", // Fallback text
    translationKey: "dashboard.menu.payout", // Translation key
    image: "dashboard.menu.payout", // Asset flag instead of hardcoded URL
    route: "/dashboard/payout",
    parent: false,
    children: [],
    enabled: true
  },
  {
    id: 3,
    title: "Orders", // Fallback text
    translationKey: "dashboard.menu.orders", // Translation key
    image: "dashboard.menu.orders", // Asset flag instead of hardcoded URL
    route: "/dashboard/orders",
    parent: false,
    children: [
      {
        id: 301,
        title: "Orders Received", // Fallback text
        translationKey: "dashboard.menu.ordersReceived", // Translation key
        route: "/dashboard/orders/order-received",
        image: "",
        enabled: true
      },
      {
        id: 302,
        title: "Custom Product Request", // Fallback text
        translationKey: "dashboard.menu.customProductRequest", // Translation key
        route: "/orders/custom-product-request",
        image: "",
        enabled: false
      },
      {
        id: 303,
        title: "Item Purchased", // Fallback text
        translationKey: "dashboard.menu.itemPurchased", // Translation key
        route: "/dashboard/orders/item-purchased",
        image: "",
        enabled: true
      }
    ],
    enabled: true
  },
  {
    id: 4,
    title: "Media", // Fallback text
    translationKey: "dashboard.menu.media", // Translation key
    image: "dashboard.menu.media", // Asset flag instead of hardcoded URL
    route: "/dashboard/my-media",
    parent: false,
    children: [],
    enabled: true
  },
  {
    id: 5,
    title: "Chats", // Fallback text
    translationKey: "dashboard.menu.chats", // Translation key
    image: "dashboard.menu.chats", // Asset flag instead of hardcoded URL
    route: "/chats",
    parent: false,
    children: [],
    enabled: false // Disabled as in original
  },
  {
    id: 6,
    title: "Subscriptions", // Fallback text
    translationKey: "dashboard.menu.subscriptions", // Translation key
    image: "dashboard.menu.subscriptions", // Asset flag instead of hardcoded URL
    route: "/dashboard/subscriptions",
    parent: false,
    children: [],
    enabled: true
  },
  // Overflow items (these will appear in the floating panel)
  {
    id: 7,
    title: "Shops", // Fallback text
    translationKey: "dashboard.menu.shops", // Translation key
    image: "dashboard.menu.shops", // Asset flag instead of hardcoded URL
    route: "/shops",
    parent: false,
    children: [],
    enabled: false // Disabled as in original
  },
  {
    id: 8,
    title: "Profile", // Fallback text
    translationKey: "dashboard.profile", // Translation key (using existing profile key)
    image: "dashboard.menu.profile", // Asset flag instead of hardcoded URL
    route: "/profile",
    parent: false,
    children: [
      {
        id: 801,
        title: "Edit Profile", // Fallback text
        translationKey: "dashboard.menu.editProfile", // Translation key
        route: "/dashboard/edit-profile",
        image: "",
        enabled: true
      },
      {
        id: 802,
        title: "Subscribers & Followers", // Fallback text
        translationKey: "dashboard.menu.subscribersFollowers", // Translation key
        route: "/profile/subscribers-followers",
        image: "",
        count: "79",
        enabled: false
      },
      {
        id: 803,
        title: "Your Posts", // Fallback text
        translationKey: "dashboard.menu.yourPosts", // Translation key
        route: "/profile/your-posts",
        image: "",
        enabled: false
      },
      {
        id: 804,
        title: "Referrals", // Fallback text
        translationKey: "dashboard.menu.referrals", // Translation key
        route: "/dashboard/referrals",
        image: "",
        count: "19",
        enabled: true
      }
    ],
    enabled: true
  },
  {
    id: 9,
    title: "Settings", // Fallback text
    translationKey: "dashboard.settings", // Translation key (using existing settings key)
    image: "dashboard.menu.settings", // Asset flag instead of hardcoded URL
    route: "/dashboard/settings",
    parent: false,
    children: [],
    enabled: true
  },
  {
    id: 10,
    title: "X Repost", // Fallback text
    translationKey: "dashboard.menu.xrepost", // Translation key
    image: "dashboard.menu.xrepost", // Asset flag instead of hardcoded URL
    route: "/x-repost",
    parent: false,
    children: [],
    enabled: false // Disabled as in original
  },
  {
    id: 11,
    title: "Blog", // Fallback text
    translationKey: "dashboard.menu.blog", // Translation key
    image: "dashboard.menu.blog", // Asset flag instead of hardcoded URL
    route: "/blog",
    parent: false,
    children: [],
    enabled: false // Disabled as in original
  }
]

/**
 * Resolve menu items with asset URLs from assetLibrary and translated titles
 * @param {Array} items - Menu items array (defaults to menuItems)
 * @returns {Promise<Array>} - Menu items with resolved image URLs and translated titles
 */
export async function resolveMenuItemsWithAssets(items = menuItems) {
  const { getAssetUrls } = await import("@/utils/assets/assetLibrary.js");
  const { loadTranslationsForSection } = await import("@/utils/translation/translationLoader.js");
  const { getI18nInstance } = await import("@/utils/translation/i18nInstance.js");
  const { getActiveLocale } = await import("@/utils/translation/localeManager.js");

  // Load translations for dashboard section
  const locale = getActiveLocale() || 'en';
  await loadTranslationsForSection('dashboard-global', locale);

  // Get i18n instance for translation
  const i18nInstance = getI18nInstance();
  const t = i18nInstance?.global?.t || ((key, fallback) => fallback || key);

  // Collect all unique asset flags from menu items
  const assetFlags = new Set();
  items.forEach(item => {
    if (item.image && item.image.startsWith('dashboard.menu.')) {
      assetFlags.add(item.image);
    }
  });

  // Load all asset URLs in parallel
  const assetFlagsArray = Array.from(assetFlags);
  const loadedAssets = await getAssetUrls(assetFlagsArray);

  // Resolve menu items with asset URLs and translations
  const resolveItem = (item) => {
    const resolved = { ...item };

    // Resolve image URL
    if (item.image && item.image.startsWith('dashboard.menu.')) {
      resolved.image = loadedAssets[item.image] || item.image; // Fallback to flag if not found
    }

    // Resolve title translation
    if (item.translationKey) {
      try {
        const translatedTitle = t(item.translationKey, item.title);
        resolved.title = translatedTitle || item.title; // Fallback to original title
      } catch (error) {
        console.warn(`[menuItems] Failed to translate key: ${item.translationKey}`, error);
        resolved.title = item.title; // Fallback to original title
      }
    }

    // Recursively resolve children
    if (item.children && item.children.length > 0) {
      resolved.children = item.children.map(child => resolveItem(child));
    }

    return resolved;
  };

  return items.map(resolveItem);
}