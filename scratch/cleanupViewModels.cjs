const fs = require('fs');
const path = 'c:/Users/user/Downloads/newVueApp/vuemain/src/dev/templates/dashboard/analytics/DashboardAnalyticsPage.vue';
let content = fs.readFileSync(path, 'utf8');

// Replace popup props
content = content.replace(/:insight-data="dashboardAnalyticsSubscribersViewModel"/g, `:insight-data="dashboardAnalyticsStore.subscriberInsights[analyticsSubscribersTrendPeriod === 'all-time' ? 'yearly' : analyticsSubscribersTrendPeriod.toLowerCase()] || { new: null, recurring: null }"`);
content = content.replace(/:insight-data="dashboardAnalyticsEarningsViewModel"/g, `:insight-data="dashboardAnalyticsStore.getEarningsViewModel(analyticsEarningsTrendPeriod)"`);
content = content.replace(/:insight-data="dashboardAnalyticsFansViewModel"/g, `:insight-data="dashboardAnalyticsStore.getFansViewModel(analyticsFansTrendPeriod)"`);
content = content.replace(/:insight-data="dashboardAnalyticsLikesViewModel"/g, `:insight-data="dashboardAnalyticsStore.getLikesViewModel(analyticsLikesTrendPeriod)()"`);
content = content.replace(/:insight-data="dashboardAnalyticsContributorsViewModel"/g, `:insight-data="dashboardAnalyticsStore.getContributorsViewModel(analyticsContributorsTrendPeriod)"`);

// Remove old computeds
const removeRegexes = [
  /const dashboardAnalyticsContributorsViewModel = computed\(\(\) => \{[\s\S]*?\}\);\n+/,
  /const dashboardAnalyticsEarningsViewModel = computed\(\(\) => \{[\s\S]*?\}\)\n+/,
  /const dashboardAnalyticsSubscribersViewModel = computed\(\(\) => \{[\s\S]*?\}\)\n+/,
  /const dashboardAnalyticsFansViewModel = computed\(\(\) => \{[\s\S]*?\}\)\n+/,
  /const dashboardAnalyticsLikesViewModel = computed\(\(\) => \{[\s\S]*?\}\)\n+/,
  /import \{ mapContributorToPreviewRow, getContributorsListForPeriod \} from '@\/systems\/analytics\/analyticsDataMappers\.js'\n/,
  /import \{ analyticsCountryCodeToDisplayName, analyticsCountryCodeToIso3166 \} from '@\/systems\/analytics\/analyticsCountryLabels\.js'\n/
];

removeRegexes.forEach(regex => {
  content = content.replace(regex, '');
});

fs.writeFileSync(path, content, 'utf8');
console.log('Cleaned up DashboardAnalyticsPage view models');
