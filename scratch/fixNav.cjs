const fs = require('fs');
const path = 'c:/Users/user/Downloads/newVueApp/vuemain/src/dev/templates/dashboard/analytics/DashboardAnalyticsPage.vue';
let content = fs.readFileSync(path, 'utf8');

// Replace empty state 'Learn how to earn' link
content = content.replace(
  /<a\s+href="#"\s+class="px-4 py-2 border border-light-border-brand[^>]*>([\s\S]*?)<\/a>/g,
  `<RouterLink to="/dashboard" class="px-4 py-2 border border-light-border-brand dark:border-dark-border-brand rounded-full text-light-text-brand dark:text-dark-text-brand text-sm font-medium hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors">{{ $t('dashboard.analytics.page.learnHowToEarn', 'Learn how to earn') }}</RouterLink>`
);

// If the previous regex didn't match perfectly, just try a simpler one:
content = content.replace(
  /<a href="#" class="([^"]*)">([^<]*)<\/a>/g,
  '<RouterLink to="/dashboard" class="$1">{{ $t(\'dashboard.analytics.page.learnHowToEarn\', \'Learn how to earn\') }}</RouterLink>'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed placeholder navigation');
