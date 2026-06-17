const fs = require('fs');
const path = 'c:/Users/user/Downloads/newVueApp/vuemain/src/dev/templates/dashboard/analytics/DashboardAnalyticsPage.vue';
let content = fs.readFileSync(path, 'utf8');

// Replace the inline FlexTable with DashboardAnalyticsContributorsPreviewTable
const tableRegex = /<FlexTable :columns="dashboardAnalyticsContributorsPreviewColumns"[\s\S]*?<\/FlexTable>/;
content = content.replace(tableRegex, `<DashboardAnalyticsContributorsPreviewTable :rows="dashboardAnalyticsContributorsViewModel.topContributors.slice(0, 6)" />`);

// Add the import
content = content.replace(
  /import FlexTable from '@\/dev\/components\/ui\/table\/FlexTable\.vue'/,
  `import FlexTable from '@/dev/components/ui/table/FlexTable.vue'\nimport DashboardAnalyticsContributorsPreviewTable from '@/dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsContributorsPreviewTable.vue'`
);

// Remove the inline columns definition
const columnsRegex = /const dashboardAnalyticsContributorsPreviewColumns = \[\s*\{[^\}]+\},\s*\{[^\}]+\}\s*\]\n+/;
content = content.replace(columnsRegex, '');

// Remove the inline theme definition
const themeRegex = /const dashboardAnalyticsContributorsTableTheme = \{[\s\S]*?\}\n+/;
content = content.replace(themeRegex, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Extracted contributors table');
