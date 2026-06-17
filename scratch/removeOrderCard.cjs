const fs = require('fs');
const path = 'c:/Users/user/Downloads/newVueApp/vuemain/src/dev/templates/dashboard/analytics/DashboardAnalyticsPage.vue';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/<DashboardOrderCard([^>]*)>/g, '<div class="group/container relative flex flex-col flex-grow flex-shrink [flex-basis:auto] gap-4 p-4 rounded-sm min-w-0 min-h-0 [backdrop-filter:blur(25px)] bg-light-bg-container dark:bg-dark-bg-container transition-all duration-300 hover:shadow-[0px_0px_20px_0px_rgba(0,0,0,0.10)] hover:backdrop-blur-xl overflow-hidden"$1>');
content = content.replace(/<\/DashboardOrderCard>/g, '</div>');
content = content.replace(/import DashboardOrderCard from '[^']+';?\n?/, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Removed all DashboardOrderCard');
