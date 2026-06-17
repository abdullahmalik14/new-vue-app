const fs = require('fs');
const file = 'c:/Users/user/Downloads/newVueApp/vuemain/src/dev/components/ui/section/dashboard/DashboardAnalyticsOverviewSection.vue';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\$t\('dashboard\.analytics\.trends\.vsYesterday'\)/g, "($te('dashboard.analytics.trends.vsYesterday') ? $t('dashboard.analytics.trends.vsYesterday') : 'vs yesterday')");

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed fallback');
