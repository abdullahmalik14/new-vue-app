const fs = require('fs');
const path = require('path');

const srcDir = 'c:/Users/user/Downloads/newVueApp/vuemain/src';

const replacements = [
  {
    file: 'dev/templates/analytics/DashboardAnalyticsPage.vue',
    search: 'Overview/Insight',
    replace: "{{ $t('dashboard.analytics.page.overviewTitle') }}"
  },
  {
    file: 'dev/templates/analytics/DashboardAnalyticsPage.vue',
    search: "Last\\s+updated at",
    replace: "{{ $t('dashboard.analytics.page.lastUpdated') }}",
    isRegex: true
  },
  {
    file: 'dev/templates/analytics/DashboardAnalyticsPage.vue',
    search: "{{ isRefreshing \\? 'Refreshing...' : 'Refresh' }}",
    replace: "{{ isRefreshing ? $t('dashboard.analytics.page.refreshing') : $t('dashboard.analytics.page.refresh') }}"
  },
  // Table
  {
    file: 'dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsOrdersReceivedTable.vue',
    search: "const orderTabs = \\['Subscriptions', 'Pay to View', 'Merch', 'Custom Request', 'Wishtender'\\]",
    replace: "import { useI18n } from 'vue-i18n';\n\nconst { t } = useI18n();\nconst orderTabs = [t('dashboard.analytics.tables.tabs.subscriptions'), t('dashboard.analytics.tables.tabs.payToView'), t('dashboard.analytics.tables.tabs.merch'), t('dashboard.analytics.tables.tabs.customRequest'), t('dashboard.analytics.tables.tabs.wishtender')]"
  },
  {
    file: 'dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsOrdersReceivedTable.vue',
    search: "label: 'Order#'",
    replace: "label: t('dashboard.analytics.tables.orders.orderLabel')"
  },
  {
    file: 'dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsOrdersReceivedTable.vue',
    search: ">Details<",
    replace: ">{{ $t('dashboard.analytics.tables.orders.details') }}<"
  },
  {
    file: 'dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsOrdersReceivedTable.vue',
    search: ">All Orders<",
    replace: ">{{ $t('dashboard.analytics.tables.orders.allOrders') }}<"
  },
  {
    file: 'dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsOrdersReceivedTable.vue',
    search: "You don't have any orders at the moment",
    replace: "{{ $t('dashboard.analytics.tables.orders.noOrders') }}"
  },
  // Popups
  {
    file: 'components/ui/popup/DashboardAnalyticsLikesTrendPopup.vue',
    search: 'name:"Media Likes"',
    replace: 'name: t("dashboard.analytics.likes.media")'
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsLikesTrendPopup.vue',
    search: 'name:"Merch Likes"',
    replace: 'name: t("dashboard.analytics.likes.merch")'
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsLikesTrendPopup.vue',
    search: 'name:"Profile Likes"',
    replace: 'name: t("dashboard.analytics.likes.profile")'
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsLikesTrendPopup.vue',
    search: 'name:"Feed Likes"',
    replace: 'name: t("dashboard.analytics.likes.feed")'
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsLikesTrendPopup.vue',
    search: 'import { useDashboardAnalyticsStore } from',
    replace: "import { useI18n } from 'vue-i18n';\nimport { useDashboardAnalyticsStore } from"
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsLikesTrendPopup.vue',
    search: 'const analyticsStore = useDashboardAnalyticsStore()',
    replace: "const { t } = useI18n();\nconst analyticsStore = useDashboardAnalyticsStore()"
  }
];

replacements.forEach(rep => {
  const p = path.join(srcDir, rep.file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    if (rep.isRegex) {
      const regex = new RegExp(rep.search, 'g');
      content = content.replace(regex, rep.replace);
    } else {
      content = content.replace(rep.search, rep.replace);
    }
    fs.writeFileSync(p, content, 'utf8');
    console.log('Replaced in', rep.file);
  }
});
