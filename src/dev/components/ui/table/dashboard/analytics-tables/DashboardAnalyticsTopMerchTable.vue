<template>
  <!-- white-card-column-container (merch) -->
  <div class="third-white-card-column col-span-full gap-4 w-full order-1 xl:col-span-2 flex flex-col">
    <!-- white-card -->
    <DashboardTrendCard>
      <!-- tabs-container -->
      <div>
        <!-- title -->
        <div class="flex items-center justify-between gap-2 px-[16px]">
          <h3 
            data-testid="dashboard-analytics-top-merch-heading"
            class="text-light-text-secondary font-sans dark:text-dark-text-secondary m-0 leading-6 text-base font-medium">
            {{ $t('dashboard.analytics.trends.topMerch', 'Top Merch') }}
          </h3>
        </div>
      </div>

      <!-- table-content -->
      <div v-if="topMerchRows && topMerchRows.length > 0" class="w-full flex-1 pt-4">
        <FlexTable :columns="dashboardAnalyticsTopMerchColumns" :rows="topMerchRows" :theme="topMerchTheme"
          :inner-scroll="true" max-height="300px" :sticky-header="true">
          <!-- merch column -->
          <template #cell.merch="{ row }">
            <div class="flex items-center gap-3 h-full w-full">
              <div class="relative w-[3.5rem] sm:w-[4rem] h-[6rem] flex-shrink-0 -my-2 -ml-2.5">
                <img :src="row.image" alt="merch" class="w-full h-full object-cover">
                <div class="w-5 h-5 left-0 top-0 absolute bg-black flex justify-center items-center">
                  <span class="text-white text-sm font-bold font-['Poppins'] leading-none">{{ row.rank }}</span>
                </div>
              </div>
              <div
                :data-value="row.title"
                class="text-gray-900 text-xs font-semibold font-['Poppins'] leading-4 line-clamp-2 md:line-clamp-3 w-[200px] text-wrap text-left whitespace-normal break-words sm:px-1">
                {{ row.title }}
              </div>
            </div>
          </template>

          <!-- views column -->
          <template #cell.views="{ row }">
            <div
              :data-value="row.views"
              class="text-right w-full text-gray-900 text-xs font-semibold font-['Poppins'] leading-4 truncate sm:px-1">
              {{ row.views }}
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
      <DashboardTrendContent v-else :image="analyticsEmptyStateUrl || ''"
        alt="list" :message="$t('dashboard.analytics.trends.noTrend')" link="/dashboard" :linkText="$t('dashboard.analytics.trends.learnToEarn')" />
    </DashboardTrendCard>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { onMounted } from 'vue';

onMounted(() => {
  if (window.performanceTracker) {
    window.performanceTracker.step({
      flowName: 'AnalyticsRender',
      stepName: 'DashboardAnalyticsTopMerchTable Mounted',
      status: 'success'
    });
  }
});

import DashboardTrendCard from '@/components/ui/card/dashboard/DashboardTrendCard.vue'
import DashboardTrendContent from '@/components/ui/card/dashboard/DashboardTrendContent.vue'
import FlexTable from '@/dev/components/ui/table/FlexTable.vue'
import { useAssetUrl } from '@/composables/useAssetUrl.js'

import { computed } from 'vue'
import { useDashboardAnalyticsStore } from '@/stores/useDashboardAnalyticsStore.js'

const { url: analyticsEmptyStateUrl } = useAssetUrl('dashboard.analytics.emptyContributors')

const { t } = useI18n()
const props = defineProps({
  period: { type: String, default: 'daily' }
})
const analyticsStore = useDashboardAnalyticsStore()

const dashboardAnalyticsTopMerchColumns = [
  { key: 'merch', label: t('dashboard.analytics.tables.merch.merch', 'Merch'), basis: 'basis-1/2', grow: true, align: 'left' },
  { key: 'views', label: t('dashboard.analytics.tables.merch.views', '# of views'), basis: 'basis-1/4', grow: true, align: 'right' },
  { key: 'sales', label: t('dashboard.analytics.tables.salesUsd', 'Sales (USD)'), basis: 'basis-1/4', grow: true, align: 'right' }
]

const topMerchRows = computed(() => {
  const data = analyticsStore.trendingMerch?.[props.period] || [];
  return data.map((item, index) => ({
    id: index,
    rank: item.rank || index + 1,
    title: item.merch || item.title || `Merch #${index + 1}`,
    views: item.views || 0,
    sales: `USD$ ${(item.salesUSD || item.sales_usd || 0).toFixed(2)}`,
    image: item.thumbnailUrl || '/images/profile-thumbnail.png'
  }));
});

const topMerchTheme = {
  container: 'relative bg-transparent border-none w-full ',
  header: 'text-gray-500 bg-transparent',
  headerRow: 'flex items-center border-b border-gray-500 w-full',
  headerCell: 'px-2.5 py-2.5 text-sm font-normal',
  row: 'flex items-center min-h-[6rem] odd:bg-transparent even:bg-gray-100/50 hover:bg-gray-50 transition-colors w-full',
  cell: 'px-2.5 py-2 flex items-center h-full',
  footer: 'hidden'
}
</script>
