const fs = require('fs');
const path = require('path');

const filesToProcess = [
  'DashboardAnalyticsLikesTrendPopup.vue',
  'DashboardAnalyticsEarningsTrendPopup.vue',
  'DashboardAnalyticsFansTrendPopup.vue',
  'DashboardAnalyticsContributorsTrendPopup.vue'
];

const dir = 'c:/Users/user/Downloads/newVueApp/vuemain/src/components/ui/popup';

for (const file of filesToProcess) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Check which icons are needed
  const needsIcon4 = content.includes('icon-4.webp');
  const needsIcon5 = content.includes('icon-5.webp');
  const needsIcon6 = content.includes('icon-6.webp');

  if (needsIcon4 || needsIcon5 || needsIcon6) {
    // Replace template src
    content = content.replace(/src="\/dev\/cdn\/analytics\/icons\/icon-4\.webp"/g, ':src="icon4Url || \'\'"');
    content = content.replace(/src="\/dev\/cdn\/analytics\/icons\/icon-5\.webp"/g, ':src="icon5Url || \'\'"');
    content = content.replace(/src="\/dev\/cdn\/analytics\/icons\/icon-6\.webp"/g, ':src="icon6Url || \'\'"');

    // Add imports and variables to script setup
    const useAssetImport = `import { useAssetUrl } from '@/composables/useAssetUrl.js'\n`;
    let vars = '';
    if (needsIcon4) vars += `const { url: icon4Url } = useAssetUrl('dashboard.analytics.icon4')\n`;
    if (needsIcon5) vars += `const { url: icon5Url } = useAssetUrl('dashboard.analytics.icon5')\n`;
    if (needsIcon6) vars += `const { url: icon6Url } = useAssetUrl('dashboard.analytics.icon6')\n`;

    // Inject just after <script setup>
    content = content.replace(/<script setup[^>]*>/, `$& \n${useAssetImport}${vars}`);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
