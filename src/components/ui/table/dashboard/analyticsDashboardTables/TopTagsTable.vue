<template>
  <!-- white-card-column-container (tags) -->
  <div class="second-white-card-column w-full gap-4 order-2 xl:order-1 flex flex-col">
    <!-- white-card -->
    <DashboardTrendCard>
      <!-- tabs-container -->
      <div>
        <!-- title -->
        <div class="flex items-center justify-between gap-2 px-[16px]">
          <h3 
            data-label="Top Tags"
            class="text-light-text-secondary font-sans dark:text-dark-text-secondary m-0 leading-6 text-base font-medium">
            Top Tags
          </h3>
        </div>
      </div>

      <!-- table-content -->
      <div v-if="topTagsRows && topTagsRows.length > 0" class="w-full h-full pt-4">
        <FlexTable :columns="topTagsColumns" :rows="topTagsRows" :theme="topTagsTheme"
          :inner-scroll="true" max-height="300px" :sticky-header="true">
          <!-- tag column -->
          <template #cell.tag="{ row }">
            <div class="flex justify-start items-center gap-2.5 h-full w-full sm:px-1">
              <div class="w-5 h-5 bg-black flex justify-center items-center shrink-0">
                <span class="text-white text-sm font-bold font-['Poppins']">{{ row.rank }}</span>
              </div>
              <div class="px-1.5 py-0.5 bg-gray-200 rounded-md border border-gray-200 flex justify-start items-center">
                <span 
                  :data-value="row.name"
                  class="text-slate-700 text-xs font-medium font-['Poppins']">{{ row.name }}</span>
              </div>
            </div>
          </template>

          <!-- views column -->
          <template #cell.views="{ row }">
            <div 
              :data-value="row.views"
              class="text-gray-900 text-xs font-semibold font-['Poppins'] text-right w-full sm:px-1">
              {{ row.views }}
            </div>
          </template>
        </FlexTable>
      </div>
      <!-- empty-state -->
      <DashboardTrendContent v-else image="https://i.ibb.co.com/vx2RDHM3/svgviewer-png-output-3.webp"
        alt="list" message="No trend to show at the moment" link="#" linkText="Learn ways to earn" />
    </DashboardTrendCard>
  </div>
</template>

<script setup>
import DashboardTrendCard from '@/components/ui/card/DashboardTrendCard.vue'
import DashboardTrendContent from '@/components/ui/content/DashboardTrendContent.vue'
import FlexTable from '@/components/ui/table/FlexTable.vue'

import { computed } from 'vue'
import { useDashboardAnalytics } from '@/stores/DashboardAnalytics'

const props = defineProps({
  period: { type: String, default: 'daily' }
})
const store = useDashboardAnalytics()

const topTagsColumns = [
  { key: 'tag', label: 'Tags', basis: 'basis-1/2', grow: true, align: 'left' },
  { key: 'views', label: '# of views', basis: 'basis-1/2', grow: true, align: 'right' }
]

const topTagsRows = computed(() => {
  const data = store.trendingTags?.[props.period] || [];
  return data.map((item, index) => ({
    id: index,
    rank: item.rank || index + 1,
    name: item.tag || `Tag #${index + 1}`,
    views: item.views || 0
  }));
});

const topTagsTheme = {
  container: 'relative bg-transparent border-none w-full ',
  header: 'text-gray-500 bg-transparent',
  headerRow: 'flex items-center border-b border-gray-500',
  headerCell: 'px-2.5 py-2.5 text-sm font-normal',
  row: 'flex items-center min-h-[3rem] odd:bg-transparent even:bg-gray-100/50  hover:bg-gray-50 transition-colors',
  cell: 'px-2.5 py-2 flex items-center h-full',
  footer: 'hidden'
}
</script>
