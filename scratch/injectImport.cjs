const fs = require('fs');
const path = 'c:/Users/user/Downloads/newVueApp/vuemain/src/dev/templates/dashboard/analytics/DashboardAnalyticsPage.vue';
let content = fs.readFileSync(path, 'utf8');

if (content.includes('import DashboardOrderCard from \'@/components/ui/card/dashboard/DashboardOrderCard.vue\'')) {
  content = content.replace('import DashboardOrderCard from \'@/components/ui/card/dashboard/DashboardOrderCard.vue\'', 
    'import DashboardOrderCard from \'@/components/ui/card/dashboard/DashboardOrderCard.vue\'\nimport DashboardAnalyticsMetricCard from \'@/dev/components/ui/card/dashboard/DashboardAnalyticsMetricCard.vue\'');
  
  // Wait, if it uses DashboardOrderCard for top contributors, we keep the import.
  // The audit said: "Replace with a dashboard-analytics card component in this page's template; stop using DashboardOrderCard here" for the 4 sections.
  // Is it used for Top Contributors? 
  // Let's replace the Top Contributors one as well to fix it completely if needed, or just leave it.
}

fs.writeFileSync(path, content, 'utf8');
console.log('Import injected');
