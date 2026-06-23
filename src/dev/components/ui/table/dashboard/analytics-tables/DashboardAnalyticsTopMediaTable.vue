<template>
  <!-- white-card-column-container (media) -->
  <div class="col-span-full xl:col-span-2 gap-4 w-full order-0 flex flex-col">
    <!-- white-card -->
    <DashboardTrendCard>
      <!-- tabs-container -->
      <div
        class="w-full px-4 flex justify-between flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-start lg:items-center gap-4">
        <!-- title -->
        <div class="flex items-center gap-2">
          <h3 
            data-testid="dashboard-analytics-top-media-heading"
            class="text-slate-700 m-0 leading-6 text-base font-medium font-['Poppins']">
            {{ $t('dashboard.analytics.trends.topMedia', 'Top Media') }}
          </h3>
        </div>

        <!-- tabs-button-group -->
        <DashboardTabs 
          :tabs="topMediaTabs" 
          v-model="selectedTopMediaTab" 
        />
      </div>

      <!-- tabs-content -->
      <div v-if="(selectedTopMediaTab === 'Views' ? topMediaRows : p2vSalesRows).length > 0"
        class="w-full flex-1 pt-4">
        <FlexTable :columns="selectedTopMediaTab === 'Views' ? dashboardAnalyticsTopMediaColumns : dashboardAnalyticsP2VSalesColumns"
          :rows="selectedTopMediaTab === 'Views' ? topMediaRows : p2vSalesRows" :theme="topMediaTheme"
          :inner-scroll="true" max-height="300px" :sticky-header="true">
          <template #cell.media="{ row }">
            <div class="flex items-center gap-3 h-full">
              <div class="relative w-[3.5rem] sm:w-[5rem] h-[6rem] flex-shrink-0 -my-2 -ml-2.5">
                <img :src="row.image" alt="media" class="w-full h-full object-cover">
                <div class="w-5 h-5 left-0 top-0 absolute bg-black flex justify-center items-center">
                  <span class="text-white text-xs font-bold font-['Poppins'] leading-5">{{ row.rank }}</span>
                </div>
              </div>
              <div
                :data-value="row.title"
                class="text-gray-900 text-xs font-semibold font-['Poppins'] leading-4 line-clamp-2 md:line-clamp-3">
                {{ row.title }}
              </div>
            </div>
          </template>
          <template #cell.clicks="{ row }">
            <div 
              :data-value="row.clicks"
              class="text-center w-full text-gray-900 text-xs font-semibold font-['Poppins'] leading-4">
              {{ row.clicks }}
            </div>
          </template>
          <template #cell.duration="{ row }">
            <div 
              :data-value="row.duration"
              class="text-right w-full text-gray-900 text-xs font-semibold font-['Poppins'] leading-4">
              {{ row.duration }}
            </div>
          </template>
          <template #cell.sales_count="{ row }">
            <div
              :data-value="row.sales_count"
              class="text-center w-full text-gray-900 text-xs font-semibold font-['Poppins'] leading-4 truncate sm:px-1">
              {{ row.sales_count }}
            </div>
          </template>
          <template #cell.sales_usd="{ row }">
            <div
              :data-value="row.sales_usd"
              class="text-right w-full text-gray-900 text-xs font-semibold font-['Poppins'] leading-4 truncate sm:px-1">
              {{ row.sales_usd }}
            </div>
          </template>
        </FlexTable>
      </div>
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
      stepName: 'DashboardAnalyticsTopMediaTable Mounted',
      status: 'success'
    });
  }
});

import { ref, computed } from 'vue'
import DashboardTrendCard from '@/components/ui/card/dashboard/DashboardTrendCard.vue'
import DashboardTrendContent from '@/components/ui/card/dashboard/DashboardTrendContent.vue'
import DashboardTabs from '@/components/ui/nav/dashboard/DashboardTabs.vue'
import FlexTable from '@/dev/components/ui/table/FlexTable.vue'

import { useDashboardAnalyticsStore } from '@/stores/useDashboardAnalyticsStore.js'
import { useAssetUrl } from '@/composables/useAssetUrl.js'

const { url: analyticsEmptyStateUrl } = useAssetUrl('dashboard.analytics.emptyContributors')

const { t } = useI18n()
const props = defineProps({
  period: { type: String, default: 'daily' }
})
const analyticsStore = useDashboardAnalyticsStore()

const topMediaTabs = ['Views', 'P2V Sales']
const selectedTopMediaTab = ref('Views')

const dashboardAnalyticsTopMediaColumns = [
  { key: 'media', label: t('dashboard.analytics.tables.media.media', 'Media'), basis: 'basis-1/3', grow: true, align: 'left' },
  { key: 'clicks', label: t('dashboard.analytics.tables.media.clicks', '# of Clicks'), basis: 'basis-1/3', grow: true, align: 'center' },
  { key: 'duration', label: t('dashboard.analytics.tables.media.watchDuration', 'Watch Duration'), basis: 'basis-1/3', grow: true, align: 'right' }
]

const dashboardAnalyticsP2VSalesColumns = [
  { key: 'media', label: t('dashboard.analytics.tables.media.media', 'Media'), basis: 'basis-1/3', grow: true, align: 'left' },
  { key: 'sales_count', label: t('dashboard.analytics.tables.media.sales', '# of Sales'), basis: 'basis-1/3', grow: true, align: 'center' },
  { key: 'sales_usd', label: t('dashboard.analytics.tables.media.salesUsd', 'Sales (USD)'), basis: 'basis-1/3', grow: true, align: 'right' }
]

function formatDuration(sec) {
  if (!sec || sec <= 0) return '0h0m';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h${m}m`;
}

const topMediaRows = computed(() => {
  const data = analyticsStore.trendingMedia?.[props.period] || [];
  return data.map((item, index) => ({
    id: index,
    rank: item.rank || index + 1,
    title: item.media || item.title || `Media #${index + 1}`,
    clicks: item.views || item.clicks || 0,
    duration: formatDuration(item.watchDurationSec),
    image: item.thumbnailUrl || '/images/profile-thumbnail.png'
  }));
});

const p2vSalesRows = computed(() => {
  const data = analyticsStore.trendingMedia?.[props.period] || [];
  const aggregated = {};
  data.forEach(item => {
    const key = item.media || item.title || `Media #${item.rank || 'unknown'}`;
    if (!key) return;
    const salesUSD = item.ppvSalesUSD || item.salesUSD || item.sales_usd || 0;
    const salesCount = item.ppvSalesCount || item.salesCount || item.sales_count || 0;
    if (!aggregated[key]) {
      aggregated[key] = {
        title: key,
        salesUSD: 0,
        salesCount: 0,
        thumbnailUrl: item.thumbnailUrl
      };
    }
    aggregated[key].salesUSD += salesUSD;
    aggregated[key].salesCount += salesCount;
  });

  const sorted = Object.values(aggregated)
    .filter(item => item.salesCount > 0)
    .sort((a, b) => b.salesUSD - a.salesUSD)
    .slice(0, 10);

  return sorted.map((item, index) => ({
    id: index,
    rank: index + 1,
    title: item.title,
    sales_count: item.salesCount,
    sales_usd: `USD$ ${item.salesUSD.toFixed(2)}`,
    image: item.thumbnailUrl || '/images/profile-thumbnail.png'
  }));
});


const topMediaTheme = {
  container: 'relative bg-transparent border-none w-full ',
  header: 'text-gray-500 bg-transparent',
  headerRow: 'flex items-center border-b border-gray-500',
  headerCell: 'px-2.5 py-2.5 text-sm font-normal',
  row: 'flex items-center min-h-[6rem] odd:bg-transparent even:bg-gray-100/50 ',
  cell: 'px-2.5 py-2 flex items-center h-full',
  footer: 'hidden'
}
</script>
