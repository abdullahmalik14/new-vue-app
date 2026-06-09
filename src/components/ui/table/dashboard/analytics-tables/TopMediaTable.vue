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
            data-label="Top Media"
            class="text-slate-700 m-0 leading-6 text-base font-medium font-['Poppins']">
            Top Media
          </h3>
        </div>

        <!-- tabs-button-group -->
        <div
          class="flex w-full sm:w-auto bg-white/30 rounded-lg justify-start items-start overflow-hidden border border-gray-200 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]">
          <div v-for="tab in topMediaTabs" :key="tab" @click="selectedTopMediaTab = tab" 
            :data-value="tab"
            :class="[
            'flex-1 sm:flex-initial whitespace-nowrap cursor-pointer h-full px-4 py-2 flex justify-center items-center gap-2 transition-all font-[\'Poppins\'] text-sm outline-none border-r border-gray-200 last:border-r-0',
            selectedTopMediaTab === tab ? 'bg-white text-gray-800 font-bold' : 'bg-transparent text-gray-500 font-medium hover:bg-gray-50'
          ]">
            {{ tab }}
          </div>
        </div>
      </div>

      <!-- tabs-content -->
      <div v-if="(selectedTopMediaTab === 'Views' ? topMediaRows : p2vSalesRows).length > 0"
        class="w-full flex-1 pt-4">
        <FlexTable :columns="selectedTopMediaTab === 'Views' ? topMediaColumns : p2vSalesColumns"
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
      <DashboardTrendContent v-else image="https://i.ibb.co.com/vx2RDHM3/svgviewer-png-output-3.webp"
        alt="list" message="No trend to show at the moment" link="#" linkText="Learn ways to earn" />
    </DashboardTrendCard>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DashboardTrendCard from '@/components/ui/card/dashboard/DashboardTrendCard.vue'
import DashboardTrendContent from '@/components/ui/card/dashboard/DashboardTrendContent.vue'
import FlexTable from '@/components/ui/table/FlexTable.vue'

import { useDashboardAnalyticsStore } from '@/stores/useDashboardAnalyticsStore.js'

const props = defineProps({
  period: { type: String, default: 'daily' }
})
const store = useDashboardAnalyticsStore()

const topMediaTabs = ['Views', 'P2V Sales']
const selectedTopMediaTab = ref('Views')

const topMediaColumns = [
  { key: 'media', label: 'Media', basis: 'basis-1/3', grow: true, align: 'left' },
  { key: 'clicks', label: '# of Clicks', basis: 'basis-1/3', grow: true, align: 'center' },
  { key: 'duration', label: 'Watch Duration', basis: 'basis-1/3', grow: true, align: 'right' }
]

const p2vSalesColumns = [
  { key: 'media', label: 'Media', basis: 'basis-1/3', grow: true, align: 'left' },
  { key: 'sales_count', label: '# of Sales', basis: 'basis-1/3', grow: true, align: 'center' },
  { key: 'sales_usd', label: 'Sales(USD)', basis: 'basis-1/3', grow: true, align: 'right' }
]

function formatDuration(sec) {
  if (!sec || sec <= 0) return '0h0m';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h${m}m`;
}

const topMediaRows = computed(() => {
  const data = store.trendingMedia?.[props.period] || [];
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
  const data = store.trendingMedia?.[props.period] || [];
  return data.map((item, index) => ({
    id: index,
    rank: item.rank || index + 1,
    title: item.media || item.title || `Media #${index + 1}`,
    sales_count: item.ppvSalesCount || item.salesCount || item.sales_count || 0,
    sales_usd: `USD$ ${(item.ppvSalesUSD || item.salesUSD || item.sales_usd || 0).toFixed(2)}`,
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
