<template>
  <AnalyticsMainCardWrapper>
    <div class="flex flex-col justify-start items-start gap-6 ">
      <!-- Header & Tabs -->
      <div
        class="w-full px-4 pt-4 flex justify-between flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-start lg:items-center gap-4">
        <div class="flex justify-start  gap-2">
          <div class="w-6 h-6 flex items-center justify-center">
            <img src="/images/cartIcon.png" alt="Cart" class="w-5 h-5 opacity-70" />
          </div>
          <div 
            data-label="Order Received"
            class="text-gray-500 text-xl font-medium font-['Poppins'] leading-8">Order Received</div>
        </div>

        <!-- Tabs (Desktop) -->
        <div
          class="hidden md:flex w-full lg:w-auto bg-white/30 rounded-lg justify-start items-start overflow-hidden border border-gray-200">
          <div v-for="tab in orderTabs" :key="tab" @click="selectedTab = tab" 
            :data-value="tab"
            :class="[
            'flex-1 lg:flex-initial whitespace-nowrap cursor-pointer h-full px-4 py-2 flex justify-center items-center gap-2 transition-all font-[\'Poppins\'] text-sm outline-none border-r border-gray-200 last:border-r-0',
            selectedTab === tab ? 'bg-white text-gray-800 font-bold' : 'bg-transparent text-gray-500 font-medium hover:bg-gray-50'
          ]">
            {{ tab }}
          </div>
        </div>

        <!-- Tabs Dropdown (Mobile) -->
        <div class="md:hidden relative w-full sm:w-auto">
          <button @click="isDropdownOpen = !isDropdownOpen"
            class="w-full sm:w-[200px] px-4 py-2 bg-white/70 backdrop-blur-md border border-gray-200 rounded-lg flex justify-center gap-2 items-center outline-none hover:bg-white/90 transition-colors">
            <span class="text-gray-900 font-semibold text-sm">{{ selectedTab }}</span>
            <div class="w-4 h-4 flex items-center justify-center transition-transform"
              :class="{ 'rotate-180': isDropdownOpen }">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#667085" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
          </button>
          <div v-if="isDropdownOpen"
            class="absolute right-0 z-20 w-full sm:w-[200px] mt-1.5 bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div v-for="tab in orderTabs" :key="tab" @click="selectedTab = tab; isDropdownOpen = false" 
              :data-value="tab"
              :class="[
              'px-4 py-3 text-sm transition-colors cursor-pointer text-center',
              selectedTab === tab ? 'bg-blue-50/80 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-50/80'
            ]">
              {{ tab }}
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="self-stretch w-full">
        <div v-if="currentRows && currentRows.length > 0" class="w-full">
          <FlexTable :columns="currentColumns" :rows="currentRows" :theme="ordersTheme"
            :inner-scroll="true" max-height="60vh" :sticky-header="true">
            <!-- Order Slot -->
            <template #cell.order="{ row }">
              <!-- Desktop View (Visible on md and up) -->
              <div class="hidden md:flex items-center gap-4 h-full w-full pr-4">
                <div v-if="selectedTab === 'Merch' || selectedTab === 'Custom Request'"
                  :class="['w-[4rem] h-full flex-shrink-0 grid place-items-center', row.bg]">
                  <img :src="row.bg === 'bg-black' ? '/images/merch.png' : '/images/cartIcon.png'"
                    class="w-8 h-8 object-contain" />
                </div>
                <div v-else class="relative w-[3.5rem] sm:w-[4rem] h-[6rem] flex-shrink-0 -my-2 -ml-2.5">
                  <img src="/images/profile-thumbnail.png" class="w-full h-full object-cover" />
                </div>
                <div class="flex flex-col justify-center items-start gap-0.5 overflow-hidden">
                  <div v-if="row.tier"
                    class="self-stretch text-gray-900 text-sm font-semibold leading-tight line-clamp-1">{{ row.tier }}
                  </div>
                  <div v-else-if="row.title"
                    class="self-stretch justify-start text-gray-900 text-xs font-semibold font-['Poppins'] leading-4 line-clamp-2">
                    {{ row.title }}</div>
                  <div v-else-if="row.type"
                    class="self-stretch justify-start text-gray-900 text-xs font-semibold font-['Poppins'] leading-4 line-clamp-2">
                    {{ row.type }}</div>
                  <div 
                    :data-value="row.orderId"
                    class="self-stretch text-slate-500 text-xs font-normal leading-4 line-clamp-1">{{ row.orderId
                  }}</div>
                </div>
              </div>

              <!-- Mobile View (Visible below md) -->
              <div class="flex md:hidden items-center gap-3 h-full w-full py-2">
                <div v-if="selectedTab === 'Merch' || selectedTab === 'Custom Request'"
                  :class="['h-full w-16 shrink-0 grid place-items-center', row.bg]">
                  <img :src="row.bg === 'bg-black' ? '/images/merch.png' : '/images/cartIcon.png'"
                    class="w-10 h-10 object-contain" />
                </div>
                <div v-else class="h-16 w-16 shrink-0 rounded overflow-hidden">
                  <img src="/images/profile-thumbnail.png" class="w-full h-full object-cover" />
                </div>
                <div class="flex flex-col justify-center items-start gap-1 overflow-hidden">
                  <div class="flex items-center gap-1.5 text-slate-400 text-[11px] font-normal">
                    <span>{{ row.orderId }}</span>
                    <span>{{ row.date }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <img src="/images/mangoes.png" class="w-4 h-4 rounded-full border border-black/5" />
                    <span class="text-slate-500 text-[11px] font-normal">{{ row.handle }}</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- From Slot -->
            <template #cell.from="{ row }">
              <div class="flex items-center gap-2 px-4 w-full h-full">
                <div class="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-black/5">
                  <img src="/images/mangoes.png" class="w-full h-full object-cover" />
                </div>
                <span 
                  :data-value="row.handle"
                  class="truncate text-slate-700 text-[13px] font-normal">{{ row.handle }}</span>
              </div>
            </template>

            <!-- Status Slot -->
            <template #cell.status="{ row }">
              <div class="flex items-center h-full px-4 w-full">
                <div class="p-1 bg-yellow-400 backdrop-blur-[10px] flex justify-center items-center gap-2">
                  <img src="/images/mangoes.png" class="w-4 h-4 object-cover" />
                </div>
                <div class="h-6 px-1.5 py-[3px] bg-black backdrop-blur-[10px] flex justify-center items-center gap-2">
                  <div 
                    :data-value="row.status"
                    class="justify-start text-yellow-400 text-xs font-medium font-['Poppins'] leading-4">{{
                    row.status }}</div>
                </div>
              </div>
            </template>

            <!-- Date Slot -->
            <template #cell.date="{ row }">
              <div 
                :data-value="row.date"
                class="px-4 text-slate-600 text-[13px] font-normal h-full flex items-center">{{ row.date }}</div>
            </template>

            <!-- Total Slot -->
            <template #cell.total="{ row }">
              <div
                :data-value="row.total"
                class="pr-4 text-gray-900 text-[13px] font-bold h-full flex items-center justify-end w-full whitespace-nowrap">
                {{ row.total }}
              </div>
            </template>

            <!-- Details Slot (Hover) -->
            <template #cell.details>
              <div
                class="px-4 flex items-center justify-end gap-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer h-full w-full bg-gradient-to-l from-white/80 via-white/40 to-transparent">
                <span class="hidden lg:inline text-blue-600 text-[13px] font-normal whitespace-nowrap">Details</span>
                <div class="w-3.5 h-3.5 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 11L11 1M11 1H4M11 1V8" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </div>
              </div>
            </template>

          </FlexTable>
        </div>
        <!-- Empty State -->
        <div v-else class="py-12 flex flex-col justify-center items-center gap-4 w-full">
          <img src="/images/shopping-cart.png" alt="Empty Cart" class="w-32 h-32 opacity-80" />
          <div class="flex flex-col items-center gap-1">
            <p class="text-slate-700 text-base font-normal">You don't have any orders at the moment</p>
            <a href="#" class="text-slate-700 text-base font-normal underline decoration-slate-400">Learn how
              you
              can earn</a>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="w-full flex justify-end">
        <button
          class="inline-flex items-center gap-2.5 pr-2 pl-6 py-1 bg-white border border-gray-200 rounded-none [clip-path:polygon(0_100%,100%_100%,100%_0,16%_0)] shadow-sm hover:bg-gray-50 transition-colors">
          <span class="text-blue-700 text-base font-medium">All Orders</span>
          <span class="text-blue-700 text-[10px] font-bold -translate-y-2 -ml-1">{{ totalOrdersCount }}</span>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 5H13M13 5L9 1M13 5L9 9" stroke="#1D4ED8" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  </AnalyticsMainCardWrapper>
</template>

<script setup>
import { ref, computed } from 'vue'
import AnalyticsMainCardWrapper from '@/components/ui/card/AnalyticsMainCardWrapper.vue'
import FlexTable from '@/components/ui/table/FlexTable.vue'
import { useDashboardAnalyticsStore } from '@/stores/useDashboardAnalyticsStore.js'

// --- Orders Tabs ---
const orderTabs = ['Subscriptions', 'Pay to View', 'Merch', 'Custom Request', 'Wishtender']
const selectedTab = ref('Subscriptions')
const isDropdownOpen = ref(false)

// --- Orders Table Data ---
const ordersColumns = [
  { key: 'order', label: 'Order#', basis: { default: 'grow md:grow-0 md:basis-[300px]' }, align: 'left' },
  { key: 'from', label: 'From', basis: 'basis-[220px]', align: 'left', hiddenAt: ['xs', 'sm'] },
  { key: 'date', label: 'Date', basis: 'basis-[180px]', align: 'left', hiddenAt: ['xs', 'sm'] },
  { key: 'total', label: 'Total', basis: { default: 'ml-auto basis-[110px]' }, align: 'right' },
  { key: 'details', label: '', basis: { default: 'shrink-0 basis-[80px]' }, align: 'right', hiddenAt: ['xs', 'sm'] }
]

const merchOrdersColumns = [
  { key: 'order', label: 'Order#', basis: { default: 'grow md:grow-0 md:basis-[280px]' }, align: 'left' },
  { key: 'from', label: 'From', basis: 'basis-[180px]', align: 'left', hiddenAt: ['xs', 'sm'] },
  { key: 'status', label: 'Status', basis: 'basis-[160px]', align: 'left', hiddenAt: ['xs', 'sm'] },
  { key: 'date', label: 'Date', basis: 'basis-[150px]', align: 'left', hiddenAt: ['xs', 'sm'] },
  { key: 'total', label: 'Total', basis: { default: 'ml-auto basis-[110px]' }, align: 'right' },
  { key: 'details', label: '', basis: { default: 'shrink-0 basis-[80px]' }, align: 'right', hiddenAt: ['xs', 'sm'] }
]

const customRequestOrdersColumns = merchOrdersColumns



const currentRows = computed(() => {
  const store = useDashboardAnalyticsStore()
  const recent = store.recentOrders || {}
  
  if (!store.bundleLoaded) return []

  switch (selectedTab.value) {
    case 'Merch': return recent.merch || []
    case 'Pay to View': return recent.p2v || []
    case 'Custom Request': return recent.customRequest || []
    case 'Wishtender': return recent.wishtender || []
    default: return recent.subscriptions || []
  }
})

const totalOrdersCount = computed(() => {
  const store = useDashboardAnalyticsStore()
  const recent = store.recentOrders || {}
  return (recent.subscriptions?.length || 0) +
         (recent.p2v?.length || 0) +
         (recent.merch?.length || 0) +
         (recent.customRequest?.length || 0) +
         (recent.wishtender?.length || 0)
})

const currentColumns = computed(() => {
  if (selectedTab.value === 'Merch' || selectedTab.value === 'Custom Request') {
    return merchOrdersColumns
  }
  return ordersColumns
})

const ordersTheme = {
  container: 'relative bg-transparent border-none w-full overflow-x-auto ',
  header: 'text-[#667085] bg-transparent',
  headerRow: 'flex items-center h-12',
  headerCell: 'px-4 text-[13px] font-normal tracking-tight',
  row: 'relative group/row flex items-center h-20 odd:bg-transparent even:bg-[#F2F4F780] transition-all',
  cell: 'flex items-center h-full',
  footer: 'hidden'
}
</script>
