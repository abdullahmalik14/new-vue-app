const fs = require('fs');
const file = 'c:/Users/user/Downloads/newVueApp/vuemain/src/dev/components/ui/section/dashboard/DashboardAnalyticsOverviewSection.vue';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\{\{\s*\('dashboard\.analytics\.trends\.vsYesterday'\)\s*\}\}/g, "{{ $t('dashboard.analytics.trends.vsYesterday') }}");

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed missing $t');
