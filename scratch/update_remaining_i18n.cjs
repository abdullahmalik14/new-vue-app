const fs = require('fs');
const path = require('path');

const srcDir = 'c:/Users/user/Downloads/newVueApp/vuemain/src';

const replacements = [
  // Earnings Popup
  {
    file: 'components/ui/popup/DashboardAnalyticsEarningsTrendPopup.vue',
    search: 'Sales Insights',
    replace: "{{ $t('dashboard.analytics.trends.salesInsights') }}"
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsEarningsTrendPopup.vue',
    search: 'Token Insights',
    replace: "{{ $t('dashboard.analytics.trends.tokenInsights') }}"
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsEarningsTrendPopup.vue',
    search: 'Top Countries',
    replace: "{{ $t('dashboard.analytics.trends.topCountries') }}"
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsEarningsTrendPopup.vue',
    search: 'No trend to show at the moment',
    replace: "{{ $t('dashboard.analytics.trends.noTrend') }}"
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsEarningsTrendPopup.vue',
    search: 'Learn ways to earn',
    replace: "{{ $t('dashboard.analytics.trends.learnToEarn') }}"
  },

  // Subscribers Popup
  {
    file: 'components/ui/popup/DashboardAnalyticsSubscribersTrendPopup.vue',
    search: 'New Subscribers',
    replace: "{{ $t('dashboard.analytics.trends.newSubscribers') }}"
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsSubscribersTrendPopup.vue',
    search: 'Recurring Subscribers',
    replace: "{{ $t('dashboard.analytics.trends.recurringSubscribers') }}"
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsSubscribersTrendPopup.vue',
    search: 'Subscriptions Insight',
    replace: "{{ $t('dashboard.analytics.trends.subscriptionsInsight') }}"
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsSubscribersTrendPopup.vue',
    search: 'Tiers Breakdown',
    replace: "{{ $t('dashboard.analytics.trends.tiersBreakdown') }}"
  },

  // Fans Popup
  {
    file: 'components/ui/popup/DashboardAnalyticsFansTrendPopup.vue',
    search: 'Followers & Visits Trend',
    replace: "{{ $t('dashboard.analytics.trends.followersAndVisits') }}"
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsFansTrendPopup.vue',
    search: 'Traffic Source',
    replace: "{{ $t('dashboard.analytics.trends.trafficSource') }}"
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsFansTrendPopup.vue',
    search: 'Top Countries',
    replace: "{{ $t('dashboard.analytics.trends.topCountries') }}"
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsFansTrendPopup.vue',
    search: 'No trend to show at the moment',
    replace: "{{ $t('dashboard.analytics.trends.noTrend') }}"
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsFansTrendPopup.vue',
    search: 'Learn ways to earn',
    replace: "{{ $t('dashboard.analytics.trends.learnToEarn') }}"
  },

  // Contributors Popup
  {
    file: 'components/ui/popup/DashboardAnalyticsContributorsTrendPopup.vue',
    search: 'Top Contributors',
    replace: "{{ $t('dashboard.analytics.trends.topContributors') }}"
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsContributorsTrendPopup.vue',
    search: 'Top Fans',
    replace: "{{ $t('dashboard.analytics.trends.topFans') }}"
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsContributorsTrendPopup.vue',
    search: 'Top Order Spenders',
    replace: "{{ $t('dashboard.analytics.trends.topOrderSpenders') }}"
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsContributorsTrendPopup.vue',
    search: 'No trend to show at the moment',
    replace: "{{ $t('dashboard.analytics.trends.noTrend') }}"
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsContributorsTrendPopup.vue',
    search: 'Learn ways to earn',
    replace: "{{ $t('dashboard.analytics.trends.learnToEarn') }}"
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsContributorsTrendPopup.vue',
    search: 'import { useDashboardAnalyticsStore } from',
    replace: "import { useI18n } from 'vue-i18n';\nimport { useDashboardAnalyticsStore } from"
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsContributorsTrendPopup.vue',
    search: 'const analyticsStore = useDashboardAnalyticsStore()',
    replace: "const { t } = useI18n();\nconst analyticsStore = useDashboardAnalyticsStore()"
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsContributorsTrendPopup.vue',
    search: 'name:"Contributor"',
    replace: 'name: t("dashboard.analytics.contributors.contributor")'
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsContributorsTrendPopup.vue',
    search: 'name:"Fan"',
    replace: 'name: t("dashboard.analytics.contributors.fan")'
  },
  {
    file: 'components/ui/popup/DashboardAnalyticsContributorsTrendPopup.vue',
    search: 'name:"Spender"',
    replace: 'name: t("dashboard.analytics.contributors.spender")'
  }
];

replacements.forEach(rep => {
  const p = path.join(srcDir, rep.file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    // regex replace all for template strings
    const regex = new RegExp(rep.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    content = content.replace(regex, rep.replace);
    fs.writeFileSync(p, content, 'utf8');
    console.log('Replaced in', rep.file, rep.search);
  }
});
