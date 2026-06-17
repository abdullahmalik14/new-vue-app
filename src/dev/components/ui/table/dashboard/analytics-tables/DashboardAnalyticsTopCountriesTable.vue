<template>
  <!-- white-card-column-container (countries) -->
  <div class="fourth-white-card-column w-full gap-4 order-3 flex flex-col">
    <!-- white-card -->
    <DashboardTrendCard>
      <!-- tabs-container -->
      <div>
        <!-- title -->
        <div class="flex items-center justify-between gap-2 px-[16px]">
          <h3 
            data-testid="dashboard-analytics-top-countries-heading"
            class="text-light-text-secondary dark:text-dark-text-secondary m-0 leading-6 text-base font-medium">
            {{ $t('dashboard.analytics.trends.topCountries') }}
          </h3>
        </div>
      </div>

      <!-- table-content -->
      <div v-if="topCountriesRows && topCountriesRows.length > 0" class="w-full flex-1 pt-4">
        <FlexTable :columns="topCountriesColumns" :rows="topCountriesRows" :theme="topCountriesTheme"
          :inner-scroll="true" max-height="300px" :sticky-header="true">
          <!-- tags column -->
          <template #cell.tags="{ row }">
            <div class="flex justify-start items-center gap-2.5 h-full w-full sm:px-1">
              <DashboardTableBadge type="rank" :text="row.rank" />
              <div 
                :data-value="row.country"
                class="flex-1 text-gray-900 text-xs font-semibold font-['Poppins'] leading-4 line-clamp-2">
                {{ row.country }}
              </div>
            </div>
          </template>

          <!-- sales column -->
          <template #cell.sales="{ row }">
            <div
              :data-value="row.sales"
              class="text-right w-full text-gray-900 text-xs font-semibold font-['Poppins'] leading-4 truncate sm:px-1">
              {{ row.sales }}
            </div>
          </template>
        </FlexTable>
      </div>
      <!-- empty-state -->
      <DashboardTrendContent v-else :image="analyticsEmptyContributorsUrl || ''"
        alt="list" :message="$t('dashboard.analytics.trends.noTrend')" link="#" :linkText="$t('dashboard.analytics.trends.learnToEarn')" />
    </DashboardTrendCard>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  if (window.performanceTracker) {
    window.performanceTracker.step({
      flowName: 'AnalyticsRender',
      stepName: 'DashboardAnalyticsTopCountriesTable Mounted',
      status: 'success'
    });
  }
});

import DashboardTrendCard from '@/components/ui/card/dashboard/DashboardTrendCard.vue'
import DashboardTrendContent from '@/components/ui/card/dashboard/DashboardTrendContent.vue'
import FlexTable from '@/dev/components/ui/table/FlexTable.vue'
import DashboardTableBadge from '@/components/ui/badge/dashboard/DashboardTableBadge.vue'

import { computed } from 'vue'
import { useDashboardAnalyticsStore } from '@/stores/useDashboardAnalyticsStore.js'
import { useI18n } from 'vue-i18n'
import { useAssetUrl } from '@/composables/useAssetUrl.js'
import { analyticsCountryCodeToDisplayName } from '@/systems/analytics/analyticsCountryLabels.js'

const props = defineProps({
  period: { type: String, default: 'daily' }
})
const analyticsStore = useDashboardAnalyticsStore()

const { t, n } = useI18n()
const { url: analyticsEmptyContributorsUrl } = useAssetUrl('dashboard.analytics.emptyContributors')

const topCountriesColumns = [
  { key: 'tags', label: t('dashboard.analytics.trends.topCountries'), basis: 'basis-1/2', grow: true, align: 'left' },
  { key: 'sales', label: 'Sales (USD)', basis: 'basis-1/2', grow: true, align: 'right' }
]

const topCountriesRows = computed(() => {
  const data = analyticsStore.trendingCountries?.[props.period] || [];
  return data.map((item, index) => ({
    id: index,
    rank: item.rank || index + 1,
    country: analyticsCountryCodeToDisplayName[item.country] || item.country,
    sales: `USD$ ${n(item.salesUSD || item.earningsUSD || item.sales_usd || 0)}`
  }));
});

const topCountriesTheme = {
  container: 'relative bg-transparent border-none w-full ',
  header: 'text-gray-500 bg-transparent',
  headerRow: 'flex items-center border-b border-gray-500 w-full',
  headerCell: 'px-3 py-2.5 text-sm font-normal',
  row: 'flex items-center min-h-[3rem] odd:bg-transparent even:bg-gray-100/50 hover:bg-gray-50 transition-colors w-full',
  cell: 'px-3 py-2 flex items-center h-full',
  footer: 'hidden'
}
</script>
