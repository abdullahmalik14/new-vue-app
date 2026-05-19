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
            data-label="Top Countries"
            class="text-light-text-secondary dark:text-dark-text-secondary m-0 leading-6 text-base font-medium">
            Top Countries
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
              <div class="w-5 h-5 bg-black flex justify-center items-center shrink-0">
                <span class="text-white text-sm font-bold font-['Poppins']">{{ row.rank }}</span>
              </div>
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

const countryNameMap = {
  'Country 36': 'Australia',
  'Country 840': 'United States',
  'Country 826': 'United Kingdom',
  'Country 276': 'Germany',
  'Country 392': 'Japan',
  'Country 344': 'Hong Kong',
  'Country 702': 'Singapore',
  'Country 158': 'Taiwan',
  'Country 124': 'Canada',
  'Country 250': 'France',
  'Country 380': 'Italy',
  'Country 724': 'Spain',
  'Country 528': 'Netherlands',
  'Country 752': 'Sweden',
  'Country 756': 'Switzerland',
  'Country 56': 'Belgium',
  'Country 40': 'Austria',
  'Country 578': 'Norway',
  'Country 208': 'Denmark',
  'Country 372': 'Ireland',
  'Country 76': 'Brazil',
  'Country 484': 'Mexico',
  'Country 356': 'India',
  'Country 156': 'China',
  'Country 410': 'South Korea',
  'Country 360': 'Indonesia',
  'Country 608': 'Philippines',
  'Country 458': 'Malaysia',
  'Country 704': 'Vietnam'
}

const topCountriesColumns = [
  { key: 'tags', label: 'Countries', basis: 'basis-1/2', grow: true, align: 'left' },
  { key: 'sales', label: 'Sales (USD)', basis: 'basis-1/2', grow: true, align: 'right' }
]

const topCountriesRows = computed(() => {
  const data = store.trendingCountries?.[props.period] || [];
  return data.map((item, index) => ({
    id: index,
    rank: item.rank || index + 1,
    country: countryNameMap[item.country] || item.country,
    sales: `USD$ ${(item.salesUSD || item.earningsUSD || item.sales_usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
