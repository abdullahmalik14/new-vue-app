const fs = require('fs');

// 1. Update assetMap.json
const assetMapPath = 'c:/Users/user/Downloads/newVueApp/vuemain/src/config/assetMap.json';
let assetMap = JSON.parse(fs.readFileSync(assetMapPath, 'utf8'));

Object.assign(assetMap, {
  "dashboard.analytics.overviewIcon": "https://i.ibb.co.com/8xV4vKX/insight.png", // using generic fallback URLs for now or keep them as local assets
  "dashboard.analytics.refreshIcon": "https://i.ibb.co.com/yFjN96x/refresh.png",
  "dashboard.analytics.trendExpand": "https://i.ibb.co.com/0f0L1V9/expand.png",
  "dashboard.analytics.trendUp": "https://i.ibb.co.com/sWjT20Q/trend-up.png",
  "dashboard.analytics.trendDown": "https://i.ibb.co.com/s6n6z6m/trend-down.png",
  "dashboard.analytics.trendsIcon": "https://i.ibb.co.com/W2d2j2H/trends.png",
  "dashboard.analytics.emptyContributors": "https://i.ibb.co.com/XxyZ1Jb/empty.png",
  "dashboard.analytics.defaultAvatar": "https://i.ibb.co.com/mXyG1hS/mangoes.png"
});

fs.writeFileSync(assetMapPath, JSON.stringify(assetMap, null, 2), 'utf8');


// 2. Update sharedAssetPreloads.json
const preloadsPath = 'c:/Users/user/Downloads/newVueApp/vuemain/src/router/sharedAssetPreloads.json';
let preloads = JSON.parse(fs.readFileSync(preloadsPath, 'utf8'));

preloads.dashboardAnalyticsChrome = [
  { "flag": "dashboard.analytics.overviewIcon", "type": "image", "priority": "high" },
  { "flag": "dashboard.analytics.refreshIcon", "type": "image", "priority": "high" },
  { "flag": "dashboard.analytics.trendExpand", "type": "image", "priority": "normal" },
  { "flag": "dashboard.analytics.trendUp", "type": "image", "priority": "high" },
  { "flag": "dashboard.analytics.trendDown", "type": "image", "priority": "high" },
  { "flag": "dashboard.analytics.trendsIcon", "type": "image", "priority": "high" },
  { "flag": "dashboard.analytics.emptyContributors", "type": "image", "priority": "low" },
  { "flag": "dashboard.analytics.defaultAvatar", "type": "image", "priority": "high" }
];

fs.writeFileSync(preloadsPath, JSON.stringify(preloads, null, 2), 'utf8');

console.log('Updated asset configs');
