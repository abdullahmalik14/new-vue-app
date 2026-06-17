const fs = require('fs');

const paths = [
  'c:/Users/user/Downloads/newVueApp/vuemain/src/config/assetMap.json',
  'c:/Users/user/Downloads/newVueApp/vuemain/public/config/assetMap.json',
  'c:/Users/user/Downloads/newVueApp/vuemain/dist/config/assetMap.json'
];

const envs = ['development', 'staging', 'production'];

const correctMappings = {
  "dashboard.analytics.overviewIcon": "/dev/cdn/analytics/icons/icon-1.webp",
  "dashboard.analytics.refreshIcon": "/dev/cdn/analytics/icons/icon-2.webp",
  "dashboard.analytics.trendExpand": "/dev/cdn/analytics/icons/icon-3.webp",
  "dashboard.analytics.trendUp": "/dev/cdn/analytics/icons/icon-4.webp",
  "dashboard.analytics.trendDown": "/dev/cdn/analytics/icons/icon-5.webp",
  "dashboard.analytics.emptyContributors": "/dev/cdn/analytics/icons/icon-6.webp",
  "dashboard.analytics.trendsIcon": "/dev/cdn/analytics/icons/icon-7.webp",
  "dashboard.analytics.defaultAvatar": "https://i.ibb.co/mXyG1hS/mangoes.png"
};

for (const p of paths) {
  if (fs.existsSync(p)) {
    let assetMap = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const env of envs) {
      if (assetMap[env]) {
        for (const [k, v] of Object.entries(correctMappings)) {
          assetMap[env][k] = v;
        }
      }
    }
    fs.writeFileSync(p, JSON.stringify(assetMap, null, 2), 'utf8');
  }
}

console.log('Fixed icon URLs in all assetMap.json files');
