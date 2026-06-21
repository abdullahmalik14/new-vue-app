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
    route: "/dashboard/demo-page",
    submenuItems: [
      {
        menuItemId: 301,
        fallbackLabel: "Orders Received", // Fallback text
        translationKey: "dashboard.menu.ordersReceived", // Translation key
        route: "/dashboard/demo-page",
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
        route: "/dashboard/demo-page",
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
    route: "/dashboard/demo-page",
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
    isEnabled: false // Disabled as in original
  },
  {
    menuItemId: 6,
    fallbackLabel: "Subscriptions", // Fallback text
    translationKey: "dashboard.menu.subscriptions", // Translation key
    iconAssetFlag: "dashboard.menu.subscriptions", // Asset flag instead of hardcoded URL
    route: "/dashboard/demo-page",
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
    isEnabled: false // Disabled as in original
  },
  {
    menuItemId: 8,
    fallbackLabel: "Profile", // Fallback text
    translationKey: "dashboard.menu.profile", // Translation key (using existing profile key)
    iconAssetFlag: "dashboard.menu.profile", // Asset flag instead of hardcoded URL
    route: "/dashboard/demo-page",
    submenuItems: [
      {
        menuItemId: 801,
        fallbackLabel: "Edit Profile", // Fallback text
        translationKey: "dashboard.menu.editProfile", // Translation key
        route: "/dashboard/demo-page",
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
        route: "/dashboard/demo-page",
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
    route: "/dashboard/demo-page",
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