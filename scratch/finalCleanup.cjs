const fs = require('fs');
const path = 'c:/Users/user/Downloads/newVueApp/vuemain/src/dev/templates/dashboard/analytics/DashboardAnalyticsPage.vue';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove selectedAnalyticsTrendPeriod and DASHBOARD_ANALYTICS_PERIODS which causes the error
content = content.replace(/const selectedAnalyticsTrendPeriod = ref\(DASHBOARD_ANALYTICS_PERIODS\.DAILY\);?\r?\n/g, '');
content = content.replace(/import \{ dashboardAnalyticsTrendPeriodTabs, DASHBOARD_ANALYTICS_PERIODS \} from '[^']+';?\r?\n/g, '');
content = content.replace(/const isAnalyticsTrendPeriodDropdownOpen = ref\(false\);?\r?\n/g, '');
content = content.replace(/import \{ dashboardAnalyticsTrendPeriodTabs, DASHBOARD_ANALYTICS_PERIODS \} from '[^']+';?\r?\n/g, '');

// 2. Remove lingering ViewModels
content = content.replace(/const dashboardAnalyticsSubscribersViewModel = computed\(\(\) => \{[\s\S]*?\}\)\r?\n/g, '');
content = content.replace(/const dashboardAnalyticsFansViewModel = computed\(\(\) => \{[\s\S]*?\}\)\r?\n/g, '');
content = content.replace(/const dashboardAnalyticsLikesViewModel = computed\(\(\) => \{[\s\S]*?\}\)\r?\n/g, '');

// 3. Remove lingering imports for mappers and country labels
content = content.replace(/import \{ analyticsCountryCodeToDisplayName, analyticsCountryCodeToIso3166 \} from '[^']+';?\r?\n/g, '');
content = content.replace(/import \{ mapContributorToPreviewRow, getContributorsListForPeriod \} from '[^']+';?\r?\n/g, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Cleaned up DashboardAnalyticsPage');
