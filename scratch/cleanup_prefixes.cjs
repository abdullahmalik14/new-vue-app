const fs = require('fs');
const path = require('path');

const srcDir = 'c:/Users/user/Downloads/newVueApp/vuemain/src';

const analyticsDirs = [
  path.join(srcDir, 'dev/templates/analytics'),
  path.join(srcDir, 'components/ui/card/dashboard'),
  path.join(srcDir, 'components/ui/popup'),
  path.join(srcDir, 'dev/components/ui/table/dashboard/analytics-tables'),
];

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, callback);
    else if (p.endsWith('.vue') || p.endsWith('.js') || p.endsWith('.ts')) callback(p);
  });
}

const fixRegexes = [
  { search: /DashboardDashboardAnalyticsMainCardWrapper/g, replace: 'DashboardAnalyticsMainCardWrapper' },
  { search: /DashboardAnalyticsDashboardAnalyticsTrendPopup/g, replace: 'DashboardAnalyticsTrendPopup' },
  { search: /DashboardAnalyticsDashboardAnalyticsEarningsDashboardAnalyticsTrendPopup/g, replace: 'DashboardAnalyticsEarningsTrendPopup' },
  { search: /DashboardAnalyticsDashboardAnalyticsSubscribersDashboardAnalyticsTrendPopup/g, replace: 'DashboardAnalyticsSubscribersTrendPopup' },
  { search: /DashboardAnalyticsDashboardAnalyticsFansDashboardAnalyticsTrendPopup/g, replace: 'DashboardAnalyticsFansTrendPopup' },
  { search: /DashboardAnalyticsDashboardAnalyticsLikesDashboardAnalyticsTrendPopup/g, replace: 'DashboardAnalyticsLikesTrendPopup' },
  { search: /DashboardAnalyticsDashboardAnalyticsContributorsDashboardAnalyticsTrendPopup/g, replace: 'DashboardAnalyticsContributorsTrendPopup' },
  { search: /DashboardAnalyticsDashboardAnalyticsOrdersReceivedTable/g, replace: 'DashboardAnalyticsOrdersReceivedTable' },
  { search: /DashboardAnalyticsDashboardAnalyticsTopMediaTable/g, replace: 'DashboardAnalyticsTopMediaTable' },
  { search: /DashboardAnalyticsDashboardAnalyticsTopTagsTable/g, replace: 'DashboardAnalyticsTopTagsTable' },
  { search: /DashboardAnalyticsDashboardAnalyticsTopMerchTable/g, replace: 'DashboardAnalyticsTopMerchTable' },
  { search: /DashboardAnalyticsDashboardAnalyticsTopCountriesTable/g, replace: 'DashboardAnalyticsTopCountriesTable' },
  { search: /DashboardAnalyticsEarningsDashboardAnalyticsTrendPopup/g, replace: 'DashboardAnalyticsEarningsTrendPopup' },
  { search: /DashboardAnalyticsSubscribersDashboardAnalyticsTrendPopup/g, replace: 'DashboardAnalyticsSubscribersTrendPopup' },
  { search: /DashboardAnalyticsFansDashboardAnalyticsTrendPopup/g, replace: 'DashboardAnalyticsFansTrendPopup' },
  { search: /DashboardAnalyticsLikesDashboardAnalyticsTrendPopup/g, replace: 'DashboardAnalyticsLikesTrendPopup' },
  { search: /DashboardAnalyticsContributorsDashboardAnalyticsTrendPopup/g, replace: 'DashboardAnalyticsContributorsTrendPopup' },
  { search: /DashboardAnalyticsDashboardAnalyticsPage/g, replace: 'DashboardAnalyticsPage' },
  { search: /DashboardDashboardAnalyticsMainCardWrapper/g, replace: 'DashboardAnalyticsMainCardWrapper' },
];

analyticsDirs.forEach(dir => {
  walk(dir, (p) => {
    let content = fs.readFileSync(p, 'utf8');
    let original = content;

    fixRegexes.forEach(fix => {
      content = content.replace(fix.search, fix.replace);
    });

    if (content !== original) {
      fs.writeFileSync(p, content, 'utf8');
      console.log('Fixed double prefixes in', path.basename(p));
    }
  });
});

console.log('Cleanup completed!');
