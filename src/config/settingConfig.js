export const settingConfig = {
  // --- CREATOR ---
  creator: [
    {
      categoryName: "GENERAL",
      items: [
        { 
          label: "Account Information", 
          icon: "https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp", 
          route: "/account-info", 
          isActive: true, 
          isDisabled: false 
        },
        { 
          label: "Change Password", 
          icon: "https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp", 
          route: "/change-password", 
          isActive: false, 
          isDisabled: false 
        },
        { 
          label: "Privacy & Security", 
          icon: "https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp", 
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
          icon: "https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp", 
          route: "/live-settings", 
          isActive: false, 
          isDisabled: true, 
          badge: "(Coming Soon)" 
        },
        { 
          label: "Call Settings", 
          icon: "https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp", 
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
          icon: "https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp", 
          route: "/shipping", 
          isActive: false, 
          isDisabled: false 
        },
        { 
          label: "Payout Details", 
          icon: "https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp", 
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
          icon: "https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp", 
          route: "/newsletter", 
          isActive: false, 
          isDisabled: true, 
          badge: "(Coming Soon)" 
        },
        { 
          label: "X Repost Automation", 
          icon: "https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp", 
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
          icon: "https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp", 
          route: "/shop-profile", 
          isActive: true, 
          isDisabled: false 
        },
        { 
          label: "Inventory Management", 
          icon: "https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp", 
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
          icon: "https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp", 
          route: "/orders", 
          isActive: false, 
          isDisabled: false 
        },
        { 
          label: "Payout Settings", 
          icon: "https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp", 
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
          icon: "https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp", 
          route: "/fan-profile", 
          isActive: true, 
          isDisabled: false 
        },
        { 
          label: "My Subscriptions", 
          icon: "https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp", 
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
          icon: "https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp", 
          route: "/payment-methods", 
          isActive: false, 
          isDisabled: false 
        },
        { 
          label: "Purchase History", 
          icon: "https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp", 
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
          icon: "https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp", 
          route: "/agency-dash", 
          isActive: true, 
          isDisabled: false 
        },
        { 
          label: "Manage Creators", 
          icon: "https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp", 
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
          icon: "https://i.ibb.co.com/YTFLKydW/svgviewer-png-output-6.webp", 
          route: "/commissions", 
          isActive: false, 
          isDisabled: false 
        }
      ]
    }
  ]
};