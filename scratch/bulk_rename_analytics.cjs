const fs = require('fs');
const path = require('path');

const srcDir = 'c:/Users/user/Downloads/newVueApp/vuemain/src';

// 1. File renames mapping
const renameMap = {
  // Page
  'dev/templates/analytics/AnalyticsPage.vue': 'dev/templates/analytics/DashboardAnalyticsPage.vue',
  
  // Cards
  'components/ui/card/dashboard/AnalyticsMainCardWrapper.vue': 'components/ui/card/dashboard/DashboardAnalyticsMainCardWrapper.vue',
  // Note: DashboardOrderCard, DashboardTrendCard, DashboardTrendContent already have Dashboard prefix, skipping for now to avoid long names.
  
  // Popups
  'components/ui/popup/LikesTrendPopup.vue': 'components/ui/popup/DashboardAnalyticsLikesTrendPopup.vue',
  'components/ui/popup/EarningsTrendPopup.vue': 'components/ui/popup/DashboardAnalyticsEarningsTrendPopup.vue',
  'components/ui/popup/SubscribersTrendPopup.vue': 'components/ui/popup/DashboardAnalyticsSubscribersTrendPopup.vue',
  'components/ui/popup/FansTrendPopup.vue': 'components/ui/popup/DashboardAnalyticsFansTrendPopup.vue',
  'components/ui/popup/ContributorsTrendPopup.vue': 'components/ui/popup/DashboardAnalyticsContributorsTrendPopup.vue',
  'components/ui/popup/TrendPopup.vue': 'components/ui/popup/DashboardAnalyticsTrendPopup.vue',
  
  // Tables
  'dev/components/ui/table/dashboard/analytics-tables/OrdersReceivedTable.vue': 'dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsOrdersReceivedTable.vue',
  'dev/components/ui/table/dashboard/analytics-tables/TopMediaTable.vue': 'dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsTopMediaTable.vue',
  'dev/components/ui/table/dashboard/analytics-tables/TopTagsTable.vue': 'dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsTopTagsTable.vue',
  'dev/components/ui/table/dashboard/analytics-tables/TopMerchTable.vue': 'dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsTopMerchTable.vue',
  'dev/components/ui/table/dashboard/analytics-tables/TopCountriesTable.vue': 'dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsTopCountriesTable.vue',
};

// 2. Global Variable Replacements (applied across all matched files)
const globalReplacements = {
  // Store
  'const store = useDashboardAnalyticsStore': 'const analyticsStore = useDashboardAnalyticsStore',
  'store\\.': 'analyticsStore.',
  
  // Format Method
  'getVsLabel': 'formatComparisonLabel',
  
  // General abbreviations in charts
  '\\bcurr\\b': 'currentPeriodData',
  '\\bprev\\b': 'previousPeriodData',
  
  // Views
  '\\bsalesView\\b': 'activeSalesViewMode',
  '\\btokensView\\b': 'activeTokensViewMode',
  '\\bsubsView\\b': 'activeSubsViewMode',
  '\\btiersView\\b': 'activeTiersViewMode',
  '\\btrendView\\b': 'activeTrendViewMode',
  '\\blikesView\\b': 'activeLikesViewMode',
  '\\bcontribView\\b': 'activeContribViewMode',
  '\\bfansView\\b': 'activeFansViewMode',
  '\\bspendersView\\b': 'activeSpendersViewMode',
  
  // Configs
  '\\bLEGEND\\b': 'legendConfig',
  '\\bSALES_STYLES\\b': 'salesChartStyles',
  '\\bSALES_LABELS\\b': 'salesChartLabels',
  '\\bTOKENS_STYLES\\b': 'tokensChartStyles',
  '\\bTOKENS_LABELS\\b': 'tokensChartLabels',
  '\\bSUBS_STYLES\\b': 'subsChartStyles',
  '\\bSUBS_LABELS\\b': 'subsChartLabels',
  '\\bTIERS_STYLES\\b': 'tiersChartStyles',
  '\\bTIERS_LABELS\\b': 'tiersChartLabels',
  '\\bFANS_STYLES\\b': 'fansChartStyles',
  '\\bFANS_LABELS\\b': 'fansChartLabels',
  '\\bLIKES_STYLES\\b': 'likesChartStyles',
  '\\bLIKES_LABELS\\b': 'likesChartLabels',
  '\\bCATEGORY_STYLES\\b': 'contributorsChartStyles',
  '\\bCATEGORY_LABELS\\b': 'contributorsChartLabels',

  // Likes Popup specifics
  '\\blikesDataAvailable\\b': 'isLikesDataAvailable',

  // Contributors specifics
  '\\btopC\\b': 'topContributors',
  '\\btopF\\b': 'topFans',
  '\\btopS\\b': 'topSpenders',

  // Orders table specifics
  '\\brecent\\b': 'recentOrdersData',
  '\\bcurrentRows\\b': 'activeOrderRows',
};

// Target files for replacements (all analytics related)
function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, callback);
    else if (p.endsWith('.vue') || p.endsWith('.js') || p.endsWith('.ts')) callback(p);
  });
}

const analyticsDirs = [
  path.join(srcDir, 'dev/templates/analytics'),
  path.join(srcDir, 'components/ui/card/dashboard'),
  path.join(srcDir, 'components/ui/popup'),
  path.join(srcDir, 'dev/components/ui/table/dashboard/analytics-tables'),
  path.join(srcDir, 'router') // Router needs import updates!
];

// Phase 1: Rename files
for (const [oldRel, newRel] of Object.entries(renameMap)) {
  const oldPath = path.join(srcDir, oldRel);
  const newPath = path.join(srcDir, newRel);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log('Renamed', path.basename(oldPath), 'to', path.basename(newPath));
  }
}

// Phase 2: Update contents (Imports and Variables)
analyticsDirs.forEach(dir => {
  walk(dir, (p) => {
    let content = fs.readFileSync(p, 'utf8');
    let changed = false;

    // 2a: Replace imports based on file renames
    for (const [oldRel, newRel] of Object.entries(renameMap)) {
      const oldBase = path.basename(oldRel).replace('.vue', '');
      const newBase = path.basename(newRel).replace('.vue', '');

      // Replace component import name (e.g. import TrendPopup from)
      if (content.includes(`import ${oldBase} from`)) {
        content = content.replace(new RegExp(`import ${oldBase} from`, 'g'), `import ${newBase} from`);
        changed = true;
      }
      
      // Replace component path in import
      const oldPathStr = oldRel.split('/').pop();
      const newPathStr = newRel.split('/').pop();
      if (content.includes(oldPathStr)) {
        content = content.split(oldPathStr).join(newPathStr);
        changed = true;
      }

      // Replace component registration
      if (content.includes(`${oldBase},`)) {
        content = content.replace(new RegExp(`${oldBase},`, 'g'), `${newBase},`);
        changed = true;
      }
      if (content.includes(`${oldBase} `)) { // sometimes 'TrendPopup '
        content = content.replace(new RegExp(`${oldBase} `, 'g'), `${newBase} `);
        changed = true;
      }

      // Replace component tags <TrendPopup> -> <DashboardAnalyticsTrendPopup>
      if (content.includes(`<${oldBase}`)) {
        content = content.split(`<${oldBase}`).join(`<${newBase}`);
        changed = true;
      }
      if (content.includes(`</${oldBase}>`)) {
        content = content.split(`</${oldBase}>`).join(`</${newBase}>`);
        changed = true;
      }
      
      // router index.js references
      if (content.includes(`name: '${oldBase}'`)) {
        content = content.split(`name: '${oldBase}'`).join(`name: '${newBase}'`);
        changed = true;
      }
    }

    // 2b: Replace variables
    // Only apply variable replacements if it's an analytics file (not router)
    if (!p.includes('router')) {
      for (const [searchRegex, replaceText] of Object.entries(globalReplacements)) {
        const regex = new RegExp(searchRegex, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, replaceText);
          changed = true;
        }
      }

      // Specific replacements per file
      if (p.endsWith('DashboardAnalyticsLikesTrendPopup.vue')) {
        if (content.includes('hasData')) {
          content = content.replace(/\bhasData\b/g, 'hasLikesData');
          changed = true;
        }
      }
      if (p.endsWith('DashboardAnalyticsEarningsTrendPopup.vue')) {
        if (content.includes('hasData')) {
          content = content.replace(/\bhasData\b/g, 'hasEarningsData');
          changed = true;
        }
      }
      if (p.endsWith('DashboardAnalyticsSubscribersTrendPopup.vue')) {
        if (content.includes('hasData')) {
          content = content.replace(/\bhasData\b/g, 'hasSubscribersData');
          changed = true;
        }
      }
      if (p.endsWith('DashboardAnalyticsFansTrendPopup.vue')) {
        if (content.includes('hasData')) {
          content = content.replace(/\bhasData\b/g, 'hasFansData');
          changed = true;
        }
      }
      if (p.endsWith('DashboardAnalyticsContributorsTrendPopup.vue')) {
        if (content.includes('hasData')) {
          content = content.replace(/\bhasData\b/g, 'hasContributorsData');
          changed = true;
        }
      }
      if (p.endsWith('DashboardAnalyticsPage.vue')) {
        if (content.includes('countryNameMap')) {
          content = content.replace(/\bcountryNameMap\b/g, 'countryCodeMap');
          changed = true;
        }
      }
    }

    if (changed) {
      fs.writeFileSync(p, content, 'utf8');
      console.log('Updated', path.basename(p));
    }
  });
});

console.log('Bulk Rename Analytics Phase 1 & 2 completed!');
