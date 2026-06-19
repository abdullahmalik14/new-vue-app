<template>
  <!-- Trends Section -->
      <DashboardSectionWrapper>
        <div class="relative gap-6 flex flex-col">
          <!-- section-header -->
          <div class="flex flex-col gap-4 sm:flex-row px-4 pt-4 pb-0 justify-between items-start md:items-center">
            <!-- title -->
            <div class="dashboard-analytics-trends-heading flex items-center gap-2 flex-grow flex-shrink basis-auto min-w-0 min-h-0">
              <span>
                <img :src="analyticsTrendsIconUrl || ''" alt="trends" class="w-6 h-6" />
              </span>
              <h2 data-testid="dashboard-analytics-trends-heading"
                class="m-0 text-light-text-quaternary font-sans dark:text-dark-text-quaternary text-xl leading-[1.875rem] font-medium">
                {{ $t('dashboard.analytics.page.trends') }}
              </h2>
            </div>

            <!-- tabs-button-group -->
            <div class="flex flex-col md:flex-row md:items-center gap-4 w-full sm:w-auto">
              <!-- last-date -->
              <!-- <div class="flex items-center gap-4 w-full justify-between sm:justify-end sm:w-auto">
              <span class="text-sm leading-5 font-sans text-light-text-quaternary dark:text-dark-text-quaternary">{{ $t('dashboard.analytics.page.lastUpdated') }}
                <span class="text-sm leading-5 font-sans text-light-text-quaternary dark:text-dark-text-quaternary">7:14
                  PM</span></span>
              <DashboardPrimaryButton variant="none" text="Refresh" / :wrapperOverrides="[{target:'wrapper1', removeClass:true}, {target:'wrapper2', removeClass:true}]">
            </div> -->

              <!-- tabs -->
              <DashboardTabs v-model="selectedAnalyticsTrendPeriod" :tabs="dashboardAnalyticsTrendPeriodTabs" />
            </div>
          </div>

          <!-- all-analytics-data -->
          <div class="dashboard-analytics-trends-content px-4 pt-0 pb-4 flex flex-col gap-4">
            <!-- row -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3">
              <DashboardAnalyticsTopMediaTable :period="selectedAnalyticsTrendPeriod.toLowerCase()" />
              <DashboardAnalyticsTopTagsTable :period="selectedAnalyticsTrendPeriod.toLowerCase()" />
              <DashboardAnalyticsTopMerchTable :period="selectedAnalyticsTrendPeriod.toLowerCase()" />
              <DashboardAnalyticsTopCountriesTable :period="selectedAnalyticsTrendPeriod.toLowerCase()" />
            </div>
          </div>


        </div>
      </DashboardSectionWrapper>
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

const { url: analyticsTrendsIconUrl } = useAssetUrl('dashboard.analytics.trendsIcon')
const selectedAnalyticsTrendPeriod = ref(DASHBOARD_ANALYTICS_PERIODS.DAILY)
</script>
