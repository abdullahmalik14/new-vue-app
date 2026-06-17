const fs = require('fs');
const path = 'c:/Users/user/Downloads/newVueApp/vuemain/src/dev/templates/dashboard/analytics/DashboardAnalyticsPage.vue';
let content = fs.readFileSync(path, 'utf8');

// Replace standard src attributes
content = content.replace(/src="\/dev\/cdn\/analytics\/icons\/icon-([1-7])\.webp"/g, ':src="analyticsIcon$1Url || \'\'"');

// Replace the ternary operator
content = content.replace(
  /:src="dashboardAnalyticsStore\.earningsInsights\.daily\.percentage >= 0 \? '\/dev\/cdn\/analytics\/icons\/icon-4\.webp' : '\/dev\/cdn\/analytics\/icons\/icon-5\.webp'"/g,
  ':src="dashboardAnalyticsStore.earningsInsights.daily.percentage >= 0 ? (analyticsIcon4Url || \'\') : (analyticsIcon5Url || \'\')"'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Replacements completed successfully.');
