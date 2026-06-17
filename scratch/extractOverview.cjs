const fs = require('fs');
const path = require('path');

const pagePath = 'c:/Users/user/Downloads/newVueApp/vuemain/src/dev/templates/dashboard/analytics/DashboardAnalyticsPage.vue';
let pageContent = fs.readFileSync(pagePath, 'utf8');

const overviewRegex = /<!-- overview\/insight section -->\s*<DashboardSectionWrapper>[\s\S]*?<\/DashboardSectionWrapper>/;
const overviewMatch = pageContent.match(overviewRegex);

if (overviewMatch) {
  let overviewContent = `<template>
  ${overviewMatch[0].replace('<!-- overview/insight section -->\n      ', '')}
</template>

<script setup>
import DashboardSectionWrapper from '@/components/ui/card/dashboard/DashboardSectionWrapper.vue'
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue'
import DashboardAnalyticsMetricCard from '@/dev/components/ui/card/dashboard/DashboardAnalyticsMetricCard.vue'
import DashboardStatIndicator from '@/components/ui/badge/dashboard/DashboardStatIndicator.vue'
import DashboardAnalyticsContributorsPreviewTable from '@/dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsContributorsPreviewTable.vue'
import SparkLine from '@/components/ui/charts/SparkLine.vue'
import { useDashboardAnalyticsStore } from '@/stores/useDashboardAnalyticsStore.js'
import { useAssetUrl } from '@/composables/useAssetUrl.js'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

const dashboardAnalyticsStore = useDashboardAnalyticsStore()
const { lastUpdated } = storeToRefs(dashboardAnalyticsStore)

const { url: analyticsIcon1Url } = useAssetUrl('dashboard.analytics.icon1')
const { url: analyticsIcon2Url } = useAssetUrl('dashboard.analytics.icon2')
const { url: analyticsIcon4Url } = useAssetUrl('dashboard.analytics.icon4')
const { url: analyticsIcon5Url } = useAssetUrl('dashboard.analytics.icon5')

defineEmits([
  'openSubscribersTrendPopup',
  'openEarningsTrendPopup',
  'openFansTrendPopup',
  'openLikesTrendPopup',
  'openContributorsTrendPopup',
  'refresh'
])

function formatAnalyticsLastUpdatedAt(dateString) {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

defineProps({
  isAnalyticsRefreshing: {
    type: Boolean,
    default: false
  }
})
</script>
`;
  
  const overviewPath = 'c:/Users/user/Downloads/newVueApp/vuemain/src/dev/components/ui/section/dashboard/DashboardAnalyticsOverviewSection.vue';
  fs.mkdirSync(path.dirname(overviewPath), { recursive: true });
  
  // Replace direct function calls with $emit
  overviewContent = overviewContent.replace(/openAnalyticsSubscribersTrendPopup/g, "$emit('openSubscribersTrendPopup')");
  overviewContent = overviewContent.replace(/openAnalyticsEarningsTrendPopup/g, "$emit('openEarningsTrendPopup')");
  overviewContent = overviewContent.replace(/openAnalyticsFansTrendPopup/g, "$emit('openFansTrendPopup')");
  overviewContent = overviewContent.replace(/openAnalyticsLikesTrendPopup/g, "$emit('openLikesTrendPopup')");
  overviewContent = overviewContent.replace(/openAnalyticsContributorsTrendPopup/g, "$emit('openContributorsTrendPopup')");
  overviewContent = overviewContent.replace(/refreshDashboardAnalytics\(\)/g, "$emit('refresh')");

  fs.writeFileSync(overviewPath, overviewContent, 'utf8');
  
  // Replace in page
  pageContent = pageContent.replace(overviewRegex, `<!-- Overview Section -->
      <DashboardAnalyticsOverviewSection
        :is-analytics-refreshing="isAnalyticsRefreshing"
        @openSubscribersTrendPopup="openAnalyticsSubscribersTrendPopup"
        @openEarningsTrendPopup="openAnalyticsEarningsTrendPopup"
        @openFansTrendPopup="openAnalyticsFansTrendPopup"
        @openLikesTrendPopup="openAnalyticsLikesTrendPopup"
        @openContributorsTrendPopup="openAnalyticsContributorsTrendPopup"
        @refresh="refreshDashboardAnalytics"
      />`);
      
  pageContent = pageContent.replace(/import DashboardAnalyticsMetricCard[^\n]+\n/g, '');
  pageContent = pageContent.replace(/import DashboardAnalyticsContributorsPreviewTable[^\n]+\n/g, '');
  pageContent = pageContent.replace(/import DashboardStatIndicator[^\n]+\n/g, '');
  pageContent = pageContent.replace(/import SparkLine[^\n]+\n/g, '');
  pageContent = pageContent.replace(/const \{ url: analyticsIcon1Url \} = useAssetUrl\('dashboard\.analytics\.icon1'\)\n/g, '');
  pageContent = pageContent.replace(/const \{ url: analyticsIcon2Url \} = useAssetUrl\('dashboard\.analytics\.icon2'\)\n/g, '');
  pageContent = pageContent.replace(/const \{ url: analyticsIcon4Url \} = useAssetUrl\('dashboard\.analytics\.icon4'\)\n/g, '');
  pageContent = pageContent.replace(/const \{ url: analyticsIcon5Url \} = useAssetUrl\('dashboard\.analytics\.icon5'\)\n/g, '');
  pageContent = pageContent.replace(/function formatAnalyticsLastUpdatedAt\([^\}]+\}\n/g, '');
  
  // Clean up remaining store view model computeds that were moved to Pinia in previous step
  // They might be lingering in DashboardAnalyticsPage.vue!
  // Wait, I haven't deleted them from the page yet! I'll do that in another script just to be safe.
  
  // inject import
  pageContent = pageContent.replace(
    /import DashboardAnalyticsTrendsSection[^\n]+/,
    `$& \nimport DashboardAnalyticsOverviewSection from '@/dev/components/ui/section/dashboard/DashboardAnalyticsOverviewSection.vue'`
  );
  
  console.log('Extracted DashboardAnalyticsOverviewSection');
} else {
  console.log('Overview section regex not matched');
}

fs.writeFileSync(pagePath, pageContent, 'utf8');
