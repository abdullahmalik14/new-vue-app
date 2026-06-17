const fs = require('fs');
const path = require('path');

const pagePath = 'c:/Users/user/Downloads/newVueApp/vuemain/src/dev/templates/dashboard/analytics/DashboardAnalyticsPage.vue';
let pageContent = fs.readFileSync(pagePath, 'utf8');

// The trends section
const trendsRegex = /<!-- Trends Section -->\s*<DashboardSectionWrapper>[\s\S]*?<\/DashboardSectionWrapper>/;
const trendsMatch = pageContent.match(trendsRegex);

if (trendsMatch) {
  const trendsContent = `<template>
  ${trendsMatch[0].replace('<!-- Trends Section -->\n      ', '')}
</template>

<script setup>
import { ref } from 'vue'
import DashboardSectionWrapper from '@/components/ui/card/dashboard/DashboardSectionWrapper.vue'
import DashboardTabs from '@/components/ui/nav/dashboard/DashboardTabs.vue'
import DashboardAnalyticsTopMediaTable from '@/dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsTopMediaTable.vue'
import DashboardAnalyticsTopTagsTable from '@/dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsTopTagsTable.vue'
import DashboardAnalyticsTopMerchTable from '@/dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsTopMerchTable.vue'
import DashboardAnalyticsTopCountriesTable from '@/dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsTopCountriesTable.vue'
import { useAssetUrl } from '@/composables/useAssetUrl.js'
import { dashboardAnalyticsTrendPeriodTabs, DASHBOARD_ANALYTICS_PERIODS } from '@/systems/analytics/analyticsPeriodsConfig.js'

const { url: analyticsIcon7Url } = useAssetUrl('dashboard.analytics.icon7')
const selectedAnalyticsTrendPeriod = ref(DASHBOARD_ANALYTICS_PERIODS.DAILY)
</script>
`;
  
  const trendsPath = 'c:/Users/user/Downloads/newVueApp/vuemain/src/dev/components/ui/section/dashboard/DashboardAnalyticsTrendsSection.vue';
  fs.mkdirSync(path.dirname(trendsPath), { recursive: true });
  fs.writeFileSync(trendsPath, trendsContent, 'utf8');
  
  // Replace in page
  pageContent = pageContent.replace(trendsRegex, `<!-- Trends Section -->\n      <DashboardAnalyticsTrendsSection />`);
  pageContent = pageContent.replace(/import DashboardAnalyticsTopMediaTable[^\n]+\n/g, '');
  pageContent = pageContent.replace(/import DashboardAnalyticsTopTagsTable[^\n]+\n/g, '');
  pageContent = pageContent.replace(/import DashboardAnalyticsTopMerchTable[^\n]+\n/g, '');
  pageContent = pageContent.replace(/import DashboardAnalyticsTopCountriesTable[^\n]+\n/g, '');
  pageContent = pageContent.replace(/import \{ dashboardAnalyticsTrendPeriodTabs, DASHBOARD_ANALYTICS_PERIODS \}[^\n]+\n/g, '');
  pageContent = pageContent.replace(/const selectedAnalyticsTrendPeriod = ref\(DASHBOARD_ANALYTICS_PERIODS\.DAILY\)\n/g, '');
  pageContent = pageContent.replace(/const isAnalyticsTrendPeriodDropdownOpen = ref\(false\)\n/g, '');
  pageContent = pageContent.replace(/const \{ url: analyticsIcon7Url \} = useAssetUrl\('dashboard\.analytics\.icon7'\)\n/g, '');
  
  // inject import
  pageContent = pageContent.replace(
    /import DashboardAnalyticsOrdersReceivedTable[^\n]+/,
    `$& \nimport DashboardAnalyticsTrendsSection from '@/dev/components/ui/section/dashboard/DashboardAnalyticsTrendsSection.vue'`
  );
  
  console.log('Extracted DashboardAnalyticsTrendsSection');
}

// Write back to page
fs.writeFileSync(pagePath, pageContent, 'utf8');
