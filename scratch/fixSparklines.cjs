const fs = require('fs');
const path = 'c:/Users/user/Downloads/newVueApp/vuemain/src/dev/templates/dashboard/analytics/DashboardAnalyticsPage.vue';
let content = fs.readFileSync(path, 'utf8');

// Replace new subscribers sparkline
content = content.replace(
  /<div class="w-full"\s*v-if="dashboardAnalyticsStore\.subscriberInsights\?\.daily\?\.new != null">\s*<SparkLine :data="\[3, 4, 3, 5, 4, 6, 5, 7, 6, 8\]" color="#22c55e" :height="28" \/>\s*<\/div>/g,
  `<div class="w-full" v-if="dashboardAnalyticsStore.subscriberInsights?.daily?.newSparkline?.length > 0">
                            <SparkLine :data="dashboardAnalyticsStore.subscriberInsights.daily.newSparkline" color="#22c55e" :height="28" />
                          </div>`
);

// Replace recurring subscribers sparkline
content = content.replace(
  /<div v-if="dashboardAnalyticsStore\.subscriberInsights\?\.daily\?\.recurring != null" class="w-full">\s*<SparkLine :data="\[5, 6, 5, 4, 5, 6, 7, 6, 5, 6\]" color="#22c55e" :width="70" :height="28" \/>\s*<\/div>/g,
  `<div class="w-full" v-if="dashboardAnalyticsStore.subscriberInsights?.daily?.recurringSparkline?.length > 0">
                            <SparkLine :data="dashboardAnalyticsStore.subscriberInsights.daily.recurringSparkline" color="#22c55e" :width="70" :height="28" />
                          </div>`
);

// Replace fans new followers sparkline
content = content.replace(
  /<div v-if="dashboardAnalyticsStore\.fans\?\.daily\?\.newFollowers != null" class="w-full">\s*<SparkLine :data="\[8, 7, 6, 7, 5, 6, 4, 5, 4, 3\]" color="#ef4444" :width="60" :height="24" \/>\s*<\/div>/g,
  `<div class="w-full" v-if="dashboardAnalyticsStore.fans?.daily?.newFollowersSparkline?.length > 0">
                            <SparkLine :data="dashboardAnalyticsStore.fans.daily.newFollowersSparkline" color="#ef4444" :width="60" :height="24" />
                          </div>`
);

// Replace fans profile visit sparkline
content = content.replace(
  /<div v-if="dashboardAnalyticsStore\.fans\?\.daily\?\.profileVisit != null" class="w-full">\s*<SparkLine :data="\[20, 22, 21, 24, 23, 26, 25, 28, 27, 31\]" color="#ef4444" :width="60"\s*:height="24" \/>\s*<\/div>/g,
  `<div class="w-full" v-if="dashboardAnalyticsStore.fans?.daily?.profileVisitSparkline?.length > 0">
                            <SparkLine :data="dashboardAnalyticsStore.fans.daily.profileVisitSparkline" color="#ef4444" :width="60" :height="24" />
                          </div>`
);

// Replace likes media sparkline
content = content.replace(
  /<div v-if="dashboardAnalyticsStore\.likes\?\.media != null" class="w-full">\s*<SparkLine :data="\[95, 90, 88, 85, 82, 80, 78, 76\]" color="#ef4444" :width="55"\s*:height="22" \/>\s*<\/div>/g,
  `<div class="w-full" v-if="dashboardAnalyticsStore.likes?.mediaSparkline?.length > 0">
                            <SparkLine :data="dashboardAnalyticsStore.likes.mediaSparkline" color="#ef4444" :width="55" :height="22" />
                          </div>`
);

// Replace likes merch sparkline
content = content.replace(
  /<div v-if="dashboardAnalyticsStore\.likes\?\.merch != null" class="w-full">\s*<SparkLine :data="\[5, 4, 4, 3, 3, 3, 2, 2\]" color="#ef4444" :width="55" :height="22" \/>\s*<\/div>/g,
  `<div class="w-full" v-if="dashboardAnalyticsStore.likes?.merchSparkline?.length > 0">
                            <SparkLine :data="dashboardAnalyticsStore.likes.merchSparkline" color="#ef4444" :width="55" :height="22" />
                          </div>`
);

// Replace likes profile sparkline
content = content.replace(
  /<div v-if="dashboardAnalyticsStore\.likes\?\.profile != null" class="w-full">\s*<SparkLine :data="\[8000, 8500, 9000, 9500, 10000, 10500, 11000, 12000\]" color="#22c55e"\s*:width="55" :height="22" \/>\s*<\/div>/g,
  `<div class="w-full" v-if="dashboardAnalyticsStore.likes?.profileSparkline?.length > 0">
                            <SparkLine :data="dashboardAnalyticsStore.likes.profileSparkline" color="#22c55e" :width="55" :height="22" />
                          </div>`
);

// Replace likes feed sparkline
content = content.replace(
  /<div v-if="dashboardAnalyticsStore\.likes\?\.feed != null" class="w-full">\s*<SparkLine :data="\[2800, 3000, 3200, 3500, 3700, 3900, 4200, 4500\]" color="#22c55e"\s*:width="55" :height="22" \/>\s*<\/div>/g,
  `<div class="w-full" v-if="dashboardAnalyticsStore.likes?.feedSparkline?.length > 0">
                            <SparkLine :data="dashboardAnalyticsStore.likes.feedSparkline" color="#22c55e" :width="55" :height="22" />
                          </div>`
);

// Fix earnings sparkline v-if condition
content = content.replace(
  /<div v-if="dashboardAnalyticsStore\.earningsInsights\?\.daily\?\.total != null" class="w-full mt-auto">\s*<SparkLine :data="dashboardAnalyticsStore\.earningsInsights\.daily\.sparklineData" color="#22c55e" :height="28" \/>\s*<\/div>/g,
  `<div class="w-full mt-auto" v-if="dashboardAnalyticsStore.earningsInsights?.daily?.sparklineData?.length > 0">
                    <SparkLine :data="dashboardAnalyticsStore.earningsInsights.daily.sparklineData" color="#22c55e" :height="28" />
                  </div>`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Replaced all hardcoded sparklines');
