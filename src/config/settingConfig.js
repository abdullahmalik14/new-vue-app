export const settingConfig = {
  // --- CREATOR ---
  creator: [
    {
      categoryName: "GENERAL",
      items: [
        { 
          label: "Account Information", 
          iconFlag: "settings.menu.item", 
          route: "/account-info", 
          isActive: true, 
          isDisabled: false 
        },
        { 
          label: "Change Password", 
          iconFlag: "settings.menu.item", 
          route: "/change-password", 
          isActive: false, 
          isDisabled: false 
        },
        { 
          label: "Privacy & Security", 
          iconFlag: "settings.menu.item", 
          route: "/privacy", 
          isActive: false, 
          isDisabled: true, 
          badge: "(Coming Soon)" 
        },
      ]
    },
    {
      categoryName: "CALL & LIVE STREAM SETTINGS",
      items: [
        { 
          label: "Live Stream Settings", 
          iconFlag: "settings.menu.item", 
          route: "/live-settings", 
          isActive: false, 
          isDisabled: true, 
          badge: "(Coming Soon)" 
        },
        { 
          label: "Call Settings", 
          iconFlag: "settings.menu.item", 
          route: "/call-settings", 
          isActive: false, 
          isDisabled: true, 
          badge: "(Coming Soon)" 
        },
      ]
    },
    {
      categoryName: "TRANSACTION",
      items: [
        { 
          label: "Shipping Address", 
          iconFlag: "settings.menu.item", 
          route: "/shipping", 
          isActive: false, 
          isDisabled: false 
        },
        { 
          label: "Payout Details", 
          iconFlag: "settings.menu.item", 
          route: "/payout", 
          isActive: false, 
          isDisabled: false 
        },
      ]
    },
    {
      categoryName: "SOCIAL MEDIA AND SHARING",
      items: [
        { 
          label: "Newsletter & Email Settings", 
          iconFlag: "settings.menu.item", 
          route: "/newsletter", 
          isActive: false, 
          isDisabled: true, 
          badge: "(Coming Soon)" 
        },
        { 
          label: "X Repost Automation", 
          iconFlag: "settings.menu.item", 
          route: "/x-repost", 
          isActive: false, 
          isDisabled: true, 
          badge: "(Coming Soon)" 
        },
      ]
    }
  ],

  // --- VENDOR  ---
  vendor: [
    {
      categoryName: "STORE SETTINGS",
      items: [
        { 
          label: "Shop Profile", 
          iconFlag: "settings.menu.item", 
          route: "/shop-profile", 
          isActive: true, 
          isDisabled: false 
        },
        { 
          label: "Inventory Management", 
          iconFlag: "settings.menu.item", 
          route: "/inventory", 
          isActive: false, 
          isDisabled: false 
        }
      ]
    },
    {
      categoryName: "ORDERS & FINANCE",
      items: [
        { 
          label: "Order History", 
          iconFlag: "settings.menu.item", 
          route: "/orders", 
          isActive: false, 
          isDisabled: false 
        },
        { 
          label: "Payout Settings", 
          iconFlag: "settings.menu.item", 
          route: "/vendor-payout", 
          isActive: false, 
          isDisabled: false 
        }
      ]
    }
  ],

  // --- FAN ---
  fan: [
    {
      categoryName: "MY ACCOUNT",
      items: [
        { 
          label: "Profile Settings", 
          iconFlag: "settings.menu.item", 
          route: "/fan-profile", 
          isActive: true, 
          isDisabled: false 
        },
        { 
          label: "My Subscriptions", 
          iconFlag: "settings.menu.item", 
          route: "/subscriptions", 
          isActive: false, 
          isDisabled: false 
        }
      ]
    },
    {
      categoryName: "BILLING",
      items: [
        { 
          label: "Payment Methods", 
          iconFlag: "settings.menu.item", 
          route: "/payment-methods", 
          isActive: false, 
          isDisabled: false 
        },
        { 
          label: "Purchase History", 
          iconFlag: "settings.menu.item", 
          route: "/purchases", 
          isActive: false, 
          isDisabled: true,
          badge: "(Coming Soon)"
        }
      ]
    }
  ],

  // --- AGENT ---
  agent: [
    {
      categoryName: "AGENCY CONTROLS",
      items: [
        { 
          label: "Agency Dashboard", 
          iconFlag: "settings.menu.item", 
          route: "/agency-dash", 
          isActive: true, 
          isDisabled: false 
        },
        { 
          label: "Manage Creators", 
          iconFlag: "settings.menu.item", 
          route: "/manage-creators", 
          isActive: false, 
          isDisabled: false 
        }
      ]
    },
    {
      categoryName: "FINANCE",
      items: [
        { 
          label: "Commission Reports", 
          iconFlag: "settings.menu.item", 
          route: "/commissions", 
          isActive: false, 
          isDisabled: false 
        }
      ]
    }
  ]
};

/**
 * Resolve settings nav groups with icon URLs from assetMap flags.
 * @param {Record<string, Array>} [configByRole]
 * @param {string} [userRole]
 * @returns {Promise<Array>}
 */
export async function resolveSettingConfigWithAssets(
  configByRole = settingConfig,
  userRole = 'creator',
) {
  const { getAssetUrls } = await import('@/systems/assets/assetLibrary.js');
  const groups = configByRole[userRole] || configByRole.creator || [];
  const iconFlags = new Set();

  groups.forEach((group) => {
    group.items.forEach((item) => {
      if (typeof item.iconFlag === 'string' && item.iconFlag.trim()) {
        iconFlags.add(item.iconFlag.trim());
      }
    });
  });

  const iconUrlsByFlag = await getAssetUrls([...iconFlags]);

  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      const flag = typeof item.iconFlag === 'string' ? item.iconFlag.trim() : '';
      const icon = flag ? iconUrlsByFlag[flag] || '' : '';

      if (flag && !icon) {
        console.warn(`[settingConfig] Missing asset for flag: ${flag}`);
      }

      return {
        ...item,
        icon,
      };
    }),
  }));
}