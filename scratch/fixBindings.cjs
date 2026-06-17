const fs = require('fs');
const path = 'c:/Users/user/Downloads/newVueApp/vuemain/src/dev/components/ui/section/dashboard/DashboardAnalyticsOverviewSection.vue';
let content = fs.readFileSync(path, 'utf8');

// The OverviewSection uses:
// dashboardAnalyticsStore.subscriberInsights?.daily -> this works
// dashboardAnalyticsStore.fans?.daily -> this works
// dashboardAnalyticsStore.earningsInsights?.daily -> this works
// dashboardAnalyticsStore.likes -> this works
// dashboardAnalyticsContributorsViewModel.topContributors.slice(0, 6) -> needs to be dashboardAnalyticsStore.getContributorsViewModel('daily').topContributors.slice(0, 6) (Assuming default period is 'daily' or we should pass period)

content = content.replace(/dashboardAnalyticsContributorsViewModel/g, `dashboardAnalyticsStore.getContributorsViewModel('daily')`);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed bindings in OverviewSection');
