const fs = require('fs');
const path = require('path');

const i18nPath = 'c:/Users/user/Downloads/newVueApp/vuemain/src/i18n/section-dashboard-global/en.json';
const preloadsPath = 'c:/Users/user/Downloads/newVueApp/vuemain/src/router/sharedAssetPreloads.json';
const assetMapPath = 'c:/Users/user/Downloads/newVueApp/vuemain/src/config/assetMap.json';

// 1. UPDATE I18N
let i18nContent = JSON.parse(fs.readFileSync(i18nPath, 'utf8'));
if (!i18nContent.dashboard) i18nContent.dashboard = {};
if (!i18nContent.dashboard.analytics) i18nContent.dashboard.analytics = {};

i18nContent.dashboard.analytics = {
  ...i18nContent.dashboard.analytics,
  page: {
    overviewTitle: "Overview/Insight",
    lastUpdated: "Last updated at",
    refresh: "Refresh",
    refreshing: "Refreshing...",
    learnHowToEarn: "Learn how you can earn"
  },
  trends: {
    salesInsights: "Sales Insights",
    tokenInsights: "Token Insights",
    topCountries: "Top Countries",
    noTrend: "No trend to show at the moment",
    learnToEarn: "Learn ways to earn",
    newSubscribers: "New Subscribers",
    recurringSubscribers: "Recurring Subscribers",
    subscriptionsInsight: "Subscriptions Insight",
    tiersBreakdown: "Tiers Breakdown",
    followersAndVisits: "Followers & Visits Trend",
    trafficSource: "Traffic Source",
    likesInsight: "Likes Insight",
    topContributors: "Top Contributors",
    topFans: "Top Fans",
    topOrderSpenders: "Top Order Spenders"
  },
  likes: {
    media: "Media Likes",
    merch: "Merch Likes",
    profile: "Profile Likes",
    feed: "Feed Likes"
  },
  contributors: {
    contributor: "Contributor",
    fan: "Fan",
    spender: "Spender"
  },
  tables: {
    orders: {
      details: "Details",
      noOrders: "You don't have any orders at the moment",
      allOrders: "All Orders",
      orderLabel: "Order#"
    },
    tabs: {
      subscriptions: "Subscriptions",
      payToView: "Pay to View",
      merch: "Merch",
      customRequest: "Custom Request",
      wishtender: "Wishtender"
    }
  }
};
fs.writeFileSync(i18nPath, JSON.stringify(i18nContent, null, 2));

// 2. UPDATE SHARED PRELOADS
let preloads = JSON.parse(fs.readFileSync(preloadsPath, 'utf8'));
preloads.dashboardAnalyticsIcons = [
  { flag: "dashboard.analytics.icon1", type: "image", priority: "normal" },
  { flag: "dashboard.analytics.icon2", type: "image", priority: "normal" },
  { flag: "dashboard.analytics.icon3", type: "image", priority: "normal" },
  { flag: "dashboard.analytics.icon4", type: "image", priority: "normal" },
  { flag: "dashboard.analytics.icon5", type: "image", priority: "normal" },
  { flag: "dashboard.analytics.money", type: "image", priority: "normal" }
];
preloads.dashboardAnalyticsChrome = {
  icon1: "dashboard.analytics.icon1",
  icon2: "dashboard.analytics.icon2",
  icon3: "dashboard.analytics.icon3",
  icon4: "dashboard.analytics.icon4",
  icon5: "dashboard.analytics.icon5",
  money: "dashboard.analytics.money"
};
fs.writeFileSync(preloadsPath, JSON.stringify(preloads, null, 2));

// 3. UPDATE ASSET MAP
let assetMap = JSON.parse(fs.readFileSync(assetMapPath, 'utf8'));
['development', 'staging', 'production'].forEach(env => {
  if (!assetMap[env]) assetMap[env] = {};
  assetMap[env]['dashboard.analytics.icon1'] = "/dev/cdn/analytics/icons/icon-1.webp";
  assetMap[env]['dashboard.analytics.icon2'] = "/dev/cdn/analytics/icons/icon-2.webp";
  assetMap[env]['dashboard.analytics.icon3'] = "/dev/cdn/analytics/icons/icon-3.webp";
  assetMap[env]['dashboard.analytics.icon4'] = "/dev/cdn/analytics/icons/icon-4.webp";
  assetMap[env]['dashboard.analytics.icon5'] = "/dev/cdn/analytics/icons/icon-5.webp";
  assetMap[env]['dashboard.analytics.money'] = "/dev/cdn/analytics/icons/money.webp";
});
fs.writeFileSync(assetMapPath, JSON.stringify(assetMap, null, 2));

console.log('Configs updated!');
