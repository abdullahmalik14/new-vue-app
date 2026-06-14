const fs = require('fs');
const path = require('path');

const filePaths = [
  'c:/Users/user/Downloads/newVueApp/vuemain/src/dev/templates/analytics/AnalyticsPage.vue',
  'c:/Users/user/Downloads/newVueApp/vuemain/src/components/ui/card/dashboard/DashboardOrderCard.vue',
  'c:/Users/user/Downloads/newVueApp/vuemain/src/components/ui/card/dashboard/AnalyticsMainCardWrapper.vue',
  'c:/Users/user/Downloads/newVueApp/vuemain/src/components/ui/card/dashboard/DashboardTrendCard.vue',
  'c:/Users/user/Downloads/newVueApp/vuemain/src/components/ui/card/dashboard/DashboardTrendContent.vue',
  'c:/Users/user/Downloads/newVueApp/vuemain/src/components/ui/popup/TrendPopup.vue',
  'c:/Users/user/Downloads/newVueApp/vuemain/src/components/ui/popup/EarningsTrendPopup.vue',
  'c:/Users/user/Downloads/newVueApp/vuemain/src/components/ui/popup/SubscribersTrendPopup.vue',
  'c:/Users/user/Downloads/newVueApp/vuemain/src/components/ui/popup/FansTrendPopup.vue',
  'c:/Users/user/Downloads/newVueApp/vuemain/src/components/ui/popup/LikesTrendPopup.vue',
  'c:/Users/user/Downloads/newVueApp/vuemain/src/components/ui/popup/ContributorsTrendPopup.vue',
  'c:/Users/user/Downloads/newVueApp/vuemain/src/dev/components/ui/table/dashboard/analytics-tables/OrdersReceivedTable.vue',
  'c:/Users/user/Downloads/newVueApp/vuemain/src/dev/components/ui/table/dashboard/analytics-tables/TopMediaTable.vue',
  'c:/Users/user/Downloads/newVueApp/vuemain/src/dev/components/ui/table/dashboard/analytics-tables/TopTagsTable.vue',
  'c:/Users/user/Downloads/newVueApp/vuemain/src/dev/components/ui/table/dashboard/analytics-tables/TopMerchTable.vue',
  'c:/Users/user/Downloads/newVueApp/vuemain/src/dev/components/ui/table/dashboard/analytics-tables/TopCountriesTable.vue'
];

let output = '';

filePaths.forEach(fp => {
  if (!fs.existsSync(fp)) {
    output += `FILE NOT FOUND: ${fp}\n`;
    return;
  }
  const content = fs.readFileSync(fp, 'utf8');
  output += `\n==============================\n${path.basename(fp)}\n==============================\n`;
  
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.match(/(?:const|let|var)\s+([\w\d_]+)\s*=/)) {
      const match = line.match(/(?:const|let|var)\s+([\w\d_]+)\s*=/);
      if(match && match[1]) output += `L${index+1}: VAR ${match[1]}\n`;
    }
    if (line.match(/function\s+([\w\d_]+)\s*\(/)) {
      const match = line.match(/function\s+([\w\d_]+)\s*\(/);
      if(match && match[1]) output += `L${index+1}: FUNC ${match[1]}\n`;
    }
    if (line.match(/defineProps\(/)) {
      output += `L${index+1}: PROPS found\n`;
    }
    if (line.match(/<[A-Za-z0-9\-]+\b[^>]*>([^<{]+)<\/[A-Za-z0-9\-]+>/)) {
      const match = line.match(/<[A-Za-z0-9\-]+\b[^>]*>([^<{]+)<\/[A-Za-z0-9\-]+>/);
      if(match && match[1].trim().length > 3) {
        output += `L${index+1}: TEXT ${match[1].trim()}\n`;
      }
    }
    if (line.match(/import\s+([A-Za-z0-9_]+)\s+from/)) {
      const match = line.match(/import\s+([A-Za-z0-9_]+)\s+from/);
      if(match && match[1]) output += `L${index+1}: IMPORT ${match[1]}\n`;
    }
  });
});

if (!fs.existsSync('c:/Users/user/Downloads/newVueApp/vuemain/scratch')) {
  fs.mkdirSync('c:/Users/user/Downloads/newVueApp/vuemain/scratch');
}
fs.writeFileSync('c:/Users/user/Downloads/newVueApp/vuemain/scratch/analytics_variables_dump.txt', output, 'utf8');
console.log('Dump completed');
