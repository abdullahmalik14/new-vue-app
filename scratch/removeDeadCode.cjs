const fs = require('fs');
const path = 'c:/Users/user/Downloads/newVueApp/vuemain/src/dev/templates/dashboard/analytics/DashboardAnalyticsPage.vue';
let content = fs.readFileSync(path, 'utf8');

// 1. Unused components
content = content.replace(/import DashboardTrendCard from '[^']+';?\n?/, '');
content = content.replace(/import DashboardTrendContent from '[^']+';?\n?/, '');
content = content.replace(/import TrendPopup from '[^']+';?\n?/, '');

// 2. Unused constants
content = content.replace(/const earningsTopCountriesColumns = \[\s*\{[^\}]+\},\s*\{[^\}]+\}\s*\]\n+/, '');
content = content.replace(/const earningsTopCountriesTheme = \{[\s\S]*?\}\n+/, '');
content = content.replace(/const fansTopCountriesColumns = \[\s*\{[^\}]+\},\s*\{[^\}]+\}\s*\]\n+/, '');

// 3. Unused methods
content = content.replace(/const getVsLabel = \(\) => \{[\s\S]*?\}\n+/, '');
content = content.replace(/const trendComparisonLabel = computed\(\(\) => \{[\s\S]*?\}\)\n+/, '');

// Wait! Since I previously used multiple replaces that might have changed exact line formats, let's just use generic regexes or check if they exist.
let changes = 0;
if (content.includes('import DashboardTrendCard')) { content = content.replace(/import DashboardTrendCard[^\n]+\n/g, ''); changes++; }
if (content.includes('import DashboardTrendContent')) { content = content.replace(/import DashboardTrendContent[^\n]+\n/g, ''); changes++; }
if (content.includes('import TrendPopup')) { content = content.replace(/import TrendPopup[^\n]+\n/g, ''); changes++; }

if (content.includes('earningsTopCountriesColumns')) {
  content = content.replace(/const earningsTopCountriesColumns = \[[\s\S]*?\];?\n/g, ''); changes++;
}
if (content.includes('earningsTopCountriesTheme')) {
  content = content.replace(/const earningsTopCountriesTheme = \{[\s\S]*?\};?\n/g, ''); changes++;
}
if (content.includes('fansTopCountriesColumns')) {
  content = content.replace(/const fansTopCountriesColumns = \[[\s\S]*?\];?\n/g, ''); changes++;
}
if (content.includes('getVsLabel')) {
  content = content.replace(/const getVsLabel = \([^)]*\) => \{[\s\S]*?\};?\n/g, ''); changes++;
}
if (content.includes('trendComparisonLabel')) {
  content = content.replace(/const trendComparisonLabel = computed\(\(\) => \{[\s\S]*?\}\);?\n/g, ''); changes++;
}

fs.writeFileSync(path, content, 'utf8');
console.log('Removed unused code pieces: ' + changes);
