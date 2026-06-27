export const settingConfig = {
  creator: [
    {
      categoryKey: 'profileSettings.creator.categories.general',
      items: [
        {
          labelKey: 'profileSettings.creator.items.accountInformation',
          iconKey: 'icon.profileSettings.menuItem',
          route: '/account-info',
          isActive: true,
          isDisabled: false,
        },
        {
          labelKey: 'profileSettings.creator.items.changePassword',
          iconKey: 'icon.profileSettings.menuItem',
          route: '/change-password',
          isActive: false,
          isDisabled: false,
        },
        {
          labelKey: 'profileSettings.creator.items.privacySecurity',
          iconKey: 'icon.profileSettings.menuItem',
          route: '/privacy',
          isActive: false,
          isDisabled: true,
          badgeKey: 'profileSettings.badges.comingSoon',
        },
      ],
    },
    {
      categoryKey: 'profileSettings.creator.categories.callLive',
      items: [
        {
          labelKey: 'profileSettings.creator.items.liveStreamSettings',
          iconKey: 'icon.profileSettings.menuItem',
          route: '/live-settings',
          isActive: false,
          isDisabled: true,
          badgeKey: 'profileSettings.badges.comingSoon',
        },
        {
          labelKey: 'profileSettings.creator.items.callSettings',
          iconKey: 'icon.profileSettings.menuItem',
          route: '/call-settings',
          isActive: false,
          isDisabled: true,
          badgeKey: 'profileSettings.badges.comingSoon',
        },
      ],
    },
    {
      categoryKey: 'profileSettings.creator.categories.transaction',
      items: [
        {
          labelKey: 'profileSettings.creator.items.shippingAddress',
          iconKey: 'icon.profileSettings.menuItem',
          route: '/shipping',
          isActive: false,
          isDisabled: false,
        },
        {
          labelKey: 'profileSettings.creator.items.payoutDetails',
          iconKey: 'icon.profileSettings.menuItem',
          route: '/payout',
          isActive: false,
          isDisabled: false,
        },
      ],
    },
    {
      categoryKey: 'profileSettings.creator.categories.social',
      items: [
        {
          labelKey: 'profileSettings.creator.items.newsletterEmailSettings',
          iconKey: 'icon.profileSettings.menuItem',
          route: '/newsletter',
          isActive: false,
          isDisabled: true,
          badgeKey: 'profileSettings.badges.comingSoon',
        },
        {
          labelKey: 'profileSettings.creator.items.xRepostAutomation',
          iconKey: 'icon.profileSettings.menuItem',
          route: '/x-repost',
          isActive: false,
          isDisabled: true,
          badgeKey: 'profileSettings.badges.comingSoon',
        },
      ],
    },
  ],

  vendor: [
    {
      categoryKey: 'profileSettings.vendor.categories.storeSettings',
      items: [
        {
          labelKey: 'profileSettings.vendor.items.shopProfile',
          iconKey: 'icon.profileSettings.menuItem',
          route: '/shop-profile',
          isActive: true,
          isDisabled: false,
        },
        {
          labelKey: 'profileSettings.vendor.items.inventoryManagement',
          iconKey: 'icon.profileSettings.menuItem',
          route: '/inventory',
          isActive: false,
          isDisabled: false,
        },
      ],
    },
    {
      categoryKey: 'profileSettings.vendor.categories.ordersFinance',
      items: [
        {
          labelKey: 'profileSettings.vendor.items.orderHistory',
          iconKey: 'icon.profileSettings.menuItem',
          route: '/orders',
          isActive: false,
          isDisabled: false,
        },
        {
          labelKey: 'profileSettings.vendor.items.payoutSettings',
          iconKey: 'icon.profileSettings.menuItem',
          route: '/vendor-payout',
          isActive: false,
          isDisabled: false,
        },
      ],
    },
  ],

  fan: [
    {
      categoryKey: 'profileSettings.fan.categories.myAccount',
      items: [
        {
          labelKey: 'profileSettings.fan.items.profileSettings',
          iconKey: 'icon.profileSettings.menuItem',
          route: '/fan-profile',
          isActive: true,
          isDisabled: false,
        },
        {
          labelKey: 'profileSettings.fan.items.mySubscriptions',
          iconKey: 'icon.profileSettings.menuItem',
          route: '/subscriptions',
          isActive: false,
          isDisabled: false,
        },
      ],
    },
    {
      categoryKey: 'profileSettings.fan.categories.billing',
      items: [
        {
          labelKey: 'profileSettings.fan.items.paymentMethods',
          iconKey: 'icon.profileSettings.menuItem',
          route: '/payment-methods',
          isActive: false,
          isDisabled: false,
        },
        {
          labelKey: 'profileSettings.fan.items.purchaseHistory',
          iconKey: 'icon.profileSettings.menuItem',
          route: '/purchases',
          isActive: false,
          isDisabled: true,
          badgeKey: 'profileSettings.badges.comingSoon',
        },
      ],
    },
  ],

  agent: [
    {
      categoryKey: 'profileSettings.agent.categories.agencyControls',
      items: [
        {
          labelKey: 'profileSettings.agent.items.agencyDashboard',
          iconKey: 'icon.profileSettings.menuItem',
          route: '/agency-dash',
          isActive: true,
          isDisabled: false,
        },
        {
          labelKey: 'profileSettings.agent.items.manageCreators',
          iconKey: 'icon.profileSettings.menuItem',
          route: '/manage-creators',
          isActive: false,
          isDisabled: false,
        },
      ],
    },
    {
      categoryKey: 'profileSettings.agent.categories.finance',
      items: [
        {
          labelKey: 'profileSettings.agent.items.commissionReports',
          iconKey: 'icon.profileSettings.menuItem',
          route: '/commissions',
          isActive: false,
          isDisabled: false,
        },
      ],
    },
  ],
};
