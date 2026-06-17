const fs = require('fs');

const assetMapPath = 'c:/Users/user/Downloads/newVueApp/vuemain/src/config/assetMap.json';
let assetMap = JSON.parse(fs.readFileSync(assetMapPath, 'utf8'));

const keysToMove = [
  "dashboard.analytics.overviewIcon",
  "dashboard.analytics.refreshIcon",
  "dashboard.analytics.trendExpand",
  "dashboard.analytics.trendUp",
  "dashboard.analytics.trendDown",
  "dashboard.analytics.trendsIcon",
  "dashboard.analytics.emptyContributors",
  "dashboard.analytics.defaultAvatar"
];

const envs = ['development', 'staging', 'production'];

for (const key of keysToMove) {
  if (assetMap[key]) {
    const value = assetMap[key];
    
    // Add to all envs
    for (const env of envs) {
      if (!assetMap[env]) assetMap[env] = {};
      assetMap[env][key] = value;
    }
    
    // Delete from root
    delete assetMap[key];
  }
}

fs.writeFileSync(assetMapPath, JSON.stringify(assetMap, null, 2), 'utf8');

console.log('Fixed assetMap.json structure');
