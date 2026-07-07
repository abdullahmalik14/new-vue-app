<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-[16px]">
      <div class="p-2 flex flex-col gap-[24px]">
        <h1 class="text-[28px] font-semibold text-[#101828]">{{ t('demo.premiumOrders.title') }}</h1>

        <div class="flex flex-col gap-4 lg:flex-row lg:items-start justify-between">
          <div class="flex flex-col sm:flex-row gap-6 items-start sm:items-start">
            <div class="flex flex-col gap-2">
              <DashboardTabs :model-value="currentTab" :tabs="tabList" @update:model-value="handleTabChange" />
              <ShowCodeToggle :code="codeExamples.tabs" />
            </div>

            <div class="flex flex-col gap-2">
              <OrdersTableSearchInput
                :model-value="searchQuery"
                input-id="orders-search"
                @update:model-value="handleSearchInput"
              />
              <ShowCodeToggle :code="codeExamples.search" />
            </div>
          </div>

          <div class="flex flex-col gap-2 items-start">
            <BasePlanDropdown
              :model-value="selectedOrderType"
              :options="orderTypeOptions"
              :unstyled="true"
              widthClass="w-max"
              @update:model-value="handleOrderTypeChange"
            >
              <template #trigger="{ isOpen }">
                <div class="flex items-center gap-2 cursor-pointer h-full">
                  <span class="text-[#344054] text-sm font-medium">{{ t('demo.premiumOrders.orderTypeLabel') }}</span>
                  <img
                    v-if="dropdownIconUrl"
                    :src="dropdownIconUrl"
                    :alt="t('demo.premiumOrders.dropdownAlt')"
                    :class="{ 'rotate-180': isOpen }"
                    class="w-3 h-2 transition-transform duration-300 opacity-60"
                  />
                </div>
              </template>

              <template #options-container="{ options, selectOption, modelValue, isOpen, isUpwards }">
                <div
                  v-show="isOpen"
                  class="absolute right-0 w-max rounded-lg bg-white border border-[#EAECF0] shadow-lg max-h-[245px] overflow-y-auto z-50"
                  :class="isUpwards ? 'bottom-[calc(100%+0.5rem)] top-auto' : 'top-[calc(100%+0.5rem)]'"
                >
                  <div
                    v-for="option in options"
                    :key="option.value"
                    class="flex items-center gap-2 h-10 px-4 transition-all duration-200 cursor-pointer hover:bg-[#F9FAFB] border-b border-[#EAECF0] last:border-none"
                    :class="{ 'bg-[#F9FAFB] font-semibold': modelValue === option.value }"
                    @click.stop="selectOption(option)"
                  >
                    <span class="text-sm font-medium text-[#101828]">{{ option.label }}</span>
                  </div>
                </div>
              </template>
            </BasePlanDropdown>
            <ShowCodeToggle :code="codeExamples.dropdown" />
          </div>
        </div>
      </div>

      <div class="flex-1 p-4 flex flex-col gap-2">
        <div class="premium-orders-table">
          <FlexTable
            :columns="columns"
            :rows="filteredRows"
            row-key="id"
            :theme="theme"
            :inner-scroll="true"
            max-height="calc(100vh - 150px)"
            :sticky-header="true"
          >
            <template #cell.orderNum="{ row }">
              <div class="flex items-center h-full">
                <div
                  class="flex justify-center items-center h-full w-[4.5rem] shrink-0"
                  :style="{ backgroundColor: row.iconBg }"
                >
                  <img v-if="row.icon" :src="row.icon" class="w-9 h-9 object-contain" alt="" />
                  <template v-else>
                    <svg v-if="row.iconBg === '#07F468'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                    <svg v-else-if="row.orderNum.includes('group')" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </template>
                </div>
                <div class="flex flex-col justify-center items-start flex-1 px-4 overflow-hidden">
                  <span class="truncate text-[13px] font-semibold text-[#101828] w-full">{{ row.orderNum }}</span>
                  <a v-if="row.linkKey" href="#" class="text-[11px] text-[#1570EF] underline mt-0.5" @click.stop>{{ linkLabel(row.linkKey) }}</a>
                </div>
              </div>
            </template>

            <template #cell.from="{ row }">
              <div class="flex items-center gap-2 px-3 h-full">
                <img :src="demoAvatarUrl || ''" class="w-5 h-5 rounded-full object-cover" alt="" />
                <span class="truncate text-[13px] text-[#344054]">{{ row.from }}</span>
              </div>
            </template>

            <template #cell.status="{ row }">
              <div class="flex items-center px-3 h-full">
                <div class="flex items-center rounded-[2px] overflow-hidden">
                  <div class="flex justify-center items-center h-6 w-6 shrink-0" :class="statusStyles[row.status]?.iconBg">
                    <svg v-if="statusStyles[row.status]?.icon === 'check'" width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4.5L4.5 8L11 1.5" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    <svg v-else-if="statusStyles[row.status]?.icon === 'calendar'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <svg v-else-if="statusStyles[row.status]?.icon === 'cross'" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M9 1L1 9M1 1L9 9" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    <svg v-else-if="statusStyles[row.status]?.icon === 'new'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                  </div>
                  <div class="flex justify-center items-center text-[12px] font-medium h-6 px-2 tracking-tight" :class="statusStyles[row.status]?.textClass">
                    {{ row.status }}
                  </div>
                </div>
              </div>
            </template>

            <template #cell.date="{ value }">
              <div class="px-3 text-xs text-zinc-800 h-full flex items-center">{{ value }}</div>
            </template>

            <template #cell.total="{ row }">
              <div class="px-3 text-[13px] font-bold text-[#101828] h-full flex items-center">{{ row.total }}</div>
            </template>

            <template #empty>{{ t('demo.premiumOrders.empty') }}</template>
          </FlexTable>
        </div>
        <ShowCodeToggle :code="codeExamples.table" />
      </div>
    </div>

    <ShowCodeToggle :code="codeExamples.fullPage" />
  </div>
</template>

<script setup>
import { ref, computed, defineComponent, h, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import FlexTable from '@/dev/components/ui/table/FlexTable.vue';
import DashboardTabs from '@/components/ui/nav/dashboard/DashboardTabs.vue';
import BasePlanDropdown from '@/dev/components/plan/parts/BasePlanDropdown.vue';
import OrdersTableSearchInput from '@/dev/components/ui/table/dashboard/OrdersTableSearchInput.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';

const SCOPE_ID = 'premiumOrdersTable';

const ShowCodeToggle = defineComponent({
  props: { code: { type: String, default: '' } },
  setup(props) {
    const open = ref(false);
    const copied = ref(false);
    const copy = async () => {
      await navigator.clipboard.writeText(props.code).catch(() => { });
      copied.value = true;
      setTimeout(() => (copied.value = false), 2000);
    };
    return () => h('div', { class: 'flex flex-col gap-0' }, [
      h('button', {
        type: 'button',
        onClick: () => (open.value = !open.value),
        class: 'self-start flex items-center gap-1.5 text-[0.7rem] font-medium text-gray-500 hover:text-gray-800 dark:text-white/50 dark:hover:text-white/80 transition-colors mt-1 px-0 py-0',
      }, [
        h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', 'stroke-width': '1.8', stroke: 'currentColor', class: 'w-3 h-3' },
          [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5' })]),
        open.value ? 'Hide Code' : 'Show Code',
      ]),
      open.value && h('div', { class: 'mt-2 rounded-lg overflow-hidden bg-[#1a1a1a] max-w-full' }, [
        h('div', { class: 'flex justify-between items-center px-3 py-1.5 bg-[#252525]' }, [
          h('span', { class: 'text-[0.6rem] font-mono text-white/30 uppercase tracking-wider' }, 'Vue'),
          h('button', { type: 'button', onClick: copy, class: 'text-[0.65rem] text-white/40 hover:text-white/70 transition-colors' }, copied.value ? '✓ Copied' : 'Copy'),
        ]),
        h('pre', { class: 'p-3 overflow-x-auto text-[0.72rem] leading-relaxed text-[#d4d4d4] font-mono whitespace-pre-wrap' },
          h('code', {}, props.code)),
      ]),
    ]);
  },
});

const { t } = useI18n();
const { url: demoAvatarUrl } = useAssetUrl('orders.demo.avatar');
const { url: dropdownIconUrl } = useAssetUrl('icon.orders.dropdown');

const currentTab = ref('All');
const searchQuery = ref('');
const selectedOrderType = ref('all');

const searchConfig = { scope: SCOPE_ID, id: 'searchQuery' };
const tabConfig = { scope: SCOPE_ID, id: 'currentTab' };
const orderTypeConfig = { scope: SCOPE_ID, id: 'selectedOrderType' };

function handleSearchInput(value) {
  searchQuery.value = value;
  const state = interactionsEngine.getFieldState(searchConfig);
  if (state) {
    state.value = value;
    state.touched = true;
    state.dirty = value !== state.initialValue;
  }
}

function handleTabChange(value) {
  currentTab.value = value;
  const state = interactionsEngine.getFieldState(tabConfig);
  if (state) {
    state.value = value;
    state.touched = true;
    state.dirty = value !== state.initialValue;
  }
}

function handleOrderTypeChange(value) {
  selectedOrderType.value = value;
  const state = interactionsEngine.getFieldState(orderTypeConfig);
  if (state) {
    state.value = value;
    state.touched = true;
    state.dirty = value !== state.initialValue;
  }
}

onMounted(() => {
  const searchElement = document.getElementById('orders-search');
  interactionsEngine.register(searchConfig, searchQuery.value, searchElement);
  interactionsEngine.register(tabConfig, currentTab.value);
  interactionsEngine.register(orderTypeConfig, selectedOrderType.value);

  if (import.meta.env.DEV) {
    window.__ordersEngine = interactionsEngine;
  }
});

onBeforeUnmount(() => {
  interactionsEngine.clearScope(SCOPE_ID);
});

const tabList = computed(() => [
  { id: 'In Progress', labelKey: 'demo.premiumOrders.tabs.inProgress' },
  { id: 'Completed', labelKey: 'demo.premiumOrders.tabs.completed' },
  { id: 'Canceled', labelKey: 'demo.premiumOrders.tabs.canceled' },
  { id: 'All', labelKey: 'demo.premiumOrders.tabs.all' },
]);

const orderTypeOptions = computed(() => [
  { label: t('demo.premiumOrders.orderTypes.all'), value: 'all' },
  { label: t('demo.premiumOrders.orderTypes.p2v'), value: 'p2v' },
  { label: t('demo.premiumOrders.orderTypes.subscription'), value: 'subscription' },
  { label: t('demo.premiumOrders.orderTypes.merch'), value: 'merch' },
  { label: t('demo.premiumOrders.orderTypes.mix'), value: 'mix' },
]);

const orders = [
  { id: '1', orderNum: 'Call - Instant (Video)', linkKey: '', icon: '', iconBg: '#07F468', from: '@Mangoes4eva', status: 'Completed', orderType: 'p2v', date: '22 Jan 2022', total: 'USD$ 9.99' },
  { id: '2', orderNum: 'Call - group event', linkKey: 'eventDetail', icon: '', iconBg: '#101828', from: '@Mangoes4eva', status: 'Confirmed', orderType: 'mix', date: '22 Jan 2022', total: 'USD$ 9.99' },
  { id: '3', orderNum: 'Call - Instant (Audio)', linkKey: '', icon: '', iconBg: '#07F468', from: '@Mangoes4eva', status: 'Completed', orderType: 'p2v', date: '22 Jan 2022', total: 'USD$ 9.99' },
  { id: '4', orderNum: 'Call - Scheduled (Video)', linkKey: 'bookingDetail', icon: '', iconBg: '#101828', from: '@Mangoes4eva', status: 'Declined', orderType: 'subscription', date: '22 Jan 2022', total: 'USD$ 9.99' },
  { id: '5', orderNum: 'Call - Scheduled (Audio)', linkKey: 'bookingDetail', icon: '', iconBg: '#101828', from: '@Mangoes4eva', status: 'Canceled', orderType: 'subscription', date: '22 Jan 2022', total: 'USD$ 9.99' },
  { id: '6', orderNum: 'Call - Instant (Video)', linkKey: '', icon: '', iconBg: '#07F468', from: '@Mangoes4eva', status: 'Completed', orderType: 'p2v', date: '22 Jan 2022', total: 'USD$ 9.99' },
  { id: '7', orderNum: 'Call - group event', linkKey: 'eventDetail', icon: '', iconBg: '#101828', from: '@Mangoes4eva', status: 'New', orderType: 'mix', date: '22 Jan 2022', total: 'USD$ 9.99' },
  { id: '8', orderNum: 'Call - Instant (Audio)', linkKey: '', icon: '', iconBg: '#07F468', from: '@Mangoes4eva', status: 'Completed', orderType: 'merch', date: '22 Jan 2022', total: 'USD$ 9.99' },
  { id: '9', orderNum: 'Call - Scheduled (Video)', linkKey: 'bookingDetail', icon: '', iconBg: '#101828', from: '@Mangoes4eva', status: 'New', orderType: 'p2v', date: '22 Jan 2022', total: 'USD$ 9.99' },
  { id: '10', orderNum: 'Call - Scheduled (Audio)', linkKey: 'bookingDetail', icon: '', iconBg: '#101828', from: '@Mangoes4eva', status: 'New', orderType: 'subscription', date: '22 Jan 2022', total: 'USD$ 9.99' },
];

const filteredRows = computed(() => orders.filter((row) => {
  const query = searchQuery.value.toLowerCase();
  const matchesSearch = row.orderNum.toLowerCase().includes(query) || row.from.toLowerCase().includes(query);
  const matchesTab = currentTab.value === 'All' || row.status === currentTab.value || (currentTab.value === 'In Progress' && row.status === 'New');
  const matchesType = selectedOrderType.value === 'all' || row.orderType === selectedOrderType.value;
  return matchesSearch && matchesTab && matchesType;
}));

const columns = computed(() => [
  { key: 'orderNum', label: t('demo.premiumOrders.columns.orderNum'), basis: 'basis-[25%]', type: 'custom' },
  { key: 'from', label: t('demo.premiumOrders.columns.from'), basis: 'basis-[12%]', type: 'user', config: { avatarKey: 'fromAvatar' } },
  { key: 'status', label: t('demo.premiumOrders.columns.status'), basis: 'basis-[12%]', type: 'status' },
  { key: 'date', label: t('demo.premiumOrders.columns.date'), basis: 'basis-[15%]' },
  { key: 'total', label: t('demo.premiumOrders.columns.total'), basis: 'basis-[12%]' },
]);

const statusStyles = {
  Completed: { iconBg: 'bg-[#07F468]', textClass: 'text-[#07F468] bg-black', icon: 'check' },
  Confirmed: { iconBg: 'bg-[#00D1FF]', textClass: 'text-[#00D1FF] bg-black', icon: 'calendar' },
  Declined: { iconBg: 'bg-[#FF9C66]', textClass: 'text-[#FF9C66] bg-black', icon: 'cross' },
  Canceled: { iconBg: 'bg-[#98A2B3]', textClass: 'text-[#98A2B3] bg-black', icon: 'cross' },
  New: { iconBg: 'bg-[#FFE500]', textClass: 'text-[#FFE500] bg-black', icon: 'new' },
};

const theme = {
  container: 'relative overflow-hidden',
  header: 'border-b border-[#667085] dark:border-background-dark-app sticky top-0 z-30 backdrop-blur-md',
  headerRow: 'flex items-center',
  headerCell: 'px-3 py-3 text-xs font-[400] text-[#667085] tracking-wider',
  row: 'flex items-stretch border-b border-zinc-100 odd:bg-transparent even:bg-[#F2F4F780] transition-colors cursor-pointer last:border-0 min-h-[4.5rem]',
  cell: 'text-xs text-zinc-800 p-0',
  footer: 'p-3 text-center text-xs text-zinc-400',
};

function linkLabel(linkKey) {
  if (!linkKey) return '';
  return t(`demo.premiumOrders.links.${linkKey}`);
}

const codeExamples = computed(() => ({
  tabs: `<!-- DashboardTabs — status filter with interactionsEngine -->
<DashboardTabs
  :model-value="currentTab"
  :tabs="tabList"
  @update:model-value="handleTabChange"
/>

<!-- Script -->
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import DashboardTabs from '@/components/ui/nav/dashboard/DashboardTabs.vue';
import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';

const SCOPE_ID = 'premiumOrdersTable';
const { t } = useI18n();
const currentTab = ref('All');
const tabConfig = { scope: SCOPE_ID, id: 'currentTab' };

function handleTabChange(value) {
  currentTab.value = value;
  const state = interactionsEngine.getFieldState(tabConfig);
  if (state) {
    state.value = value;
    state.touched = true;
    state.dirty = value !== state.initialValue;
  }
}

onMounted(() => {
  interactionsEngine.register(tabConfig, currentTab.value);
});

onBeforeUnmount(() => {
  interactionsEngine.clearScope(SCOPE_ID);
});

const tabList = computed(() => [
  { id: 'In Progress', labelKey: 'demo.premiumOrders.tabs.inProgress' },
  { id: 'Completed', labelKey: 'demo.premiumOrders.tabs.completed' },
  { id: 'Canceled', labelKey: 'demo.premiumOrders.tabs.canceled' },
  { id: 'All', labelKey: 'demo.premiumOrders.tabs.all' },
]);`,
  search: `<!-- OrdersTableSearchInput — search filter with interactionsEngine -->
<OrdersTableSearchInput
  :model-value="searchQuery"
  input-id="orders-search"
  @update:model-value="handleSearchInput"
/>

<!-- Script -->
import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';
import OrdersTableSearchInput from '@/dev/components/ui/table/dashboard/OrdersTableSearchInput.vue';

const SCOPE_ID = 'premiumOrdersTable';
const searchConfig = { scope: SCOPE_ID, id: 'searchQuery' };
const searchQuery = ref('');

function handleSearchInput(value) {
  searchQuery.value = value;
  const state = interactionsEngine.getFieldState(searchConfig);
  if (state) {
    state.value = value;
    state.touched = true;
    state.dirty = value !== state.initialValue;
  }
}

onMounted(() => {
  const searchElement = document.getElementById('orders-search');
  interactionsEngine.register(searchConfig, searchQuery.value, searchElement);
});

<!-- OrdersTableSearchInput uses useAssetUrl('icon.search') + t('demo.premiumOrders.searchPlaceholder') -->`,
  dropdown: `<!-- BasePlanDropdown — Order Type filter with interactionsEngine -->
<BasePlanDropdown
  :model-value="selectedOrderType"
  :options="orderTypeOptions"
  :unstyled="true"
  widthClass="w-max"
  @update:model-value="handleOrderTypeChange"
>
  <template #trigger="{ isOpen }">
    <div class="flex items-center gap-2 cursor-pointer h-full">
      <span class="text-[#344054] text-sm font-medium">
        {{ t('demo.premiumOrders.orderTypeLabel') }}
      </span>
      <img
        v-if="dropdownIconUrl"
        :src="dropdownIconUrl"
        :alt="t('demo.premiumOrders.dropdownAlt')"
        :class="{ 'rotate-180': isOpen }"
        class="w-3 h-2 transition-transform duration-300 opacity-60"
      />
    </div>
  </template>

  <template #options-container="{ options, selectOption, modelValue, isOpen, isUpwards }">
    <div
      v-show="isOpen"
      class="absolute right-0 w-max rounded-lg bg-white border border-[#EAECF0] shadow-lg max-h-[245px] overflow-y-auto z-50"
      :class="isUpwards ? 'bottom-[calc(100%+0.5rem)] top-auto' : 'top-[calc(100%+0.5rem)]'"
    >
      <div
        v-for="option in options"
        :key="option.value"
        class="flex items-center gap-2 h-10 px-4 cursor-pointer hover:bg-[#F9FAFB] border-b border-[#EAECF0] last:border-none"
        :class="{ 'bg-[#F9FAFB] font-semibold': modelValue === option.value }"
        @click.stop="selectOption(option)"
      >
        <span class="text-sm font-medium text-[#101828]">{{ option.label }}</span>
      </div>
    </div>
  </template>
</BasePlanDropdown>

<!-- Script -->
import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';
import BasePlanDropdown from '@/dev/components/plan/parts/BasePlanDropdown.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const SCOPE_ID = 'premiumOrdersTable';
const orderTypeConfig = { scope: SCOPE_ID, id: 'selectedOrderType' };
const selectedOrderType = ref('all');
const { url: dropdownIconUrl } = useAssetUrl('icon.orders.dropdown');

function handleOrderTypeChange(value) {
  selectedOrderType.value = value;
  const state = interactionsEngine.getFieldState(orderTypeConfig);
  if (state) {
    state.value = value;
    state.touched = true;
    state.dirty = value !== state.initialValue;
  }
}

onMounted(() => {
  interactionsEngine.register(orderTypeConfig, selectedOrderType.value);
});

const orderTypeOptions = computed(() => [
  { label: t('demo.premiumOrders.orderTypes.all'), value: 'all' },
  { label: t('demo.premiumOrders.orderTypes.p2v'), value: 'p2v' },
  { label: t('demo.premiumOrders.orderTypes.subscription'), value: 'subscription' },
  { label: t('demo.premiumOrders.orderTypes.merch'), value: 'merch' },
  { label: t('demo.premiumOrders.orderTypes.mix'), value: 'mix' },
]);`,
  table: `<!-- FlexTable — Premium Orders -->
<FlexTable
  :columns="columns"
  :rows="filteredRows"
  row-key="id"
  :theme="theme"
  :inner-scroll="true"
  max-height="calc(100vh - 150px)"
  :sticky-header="true"
>
  <template #cell.orderNum="{ row }">
    <!-- icon box + order title + optional link -->
  </template>

  <template #cell.from="{ row }">
    <!-- avatar via useAssetUrl('orders.demo.avatar') + handle -->
  </template>

  <template #cell.status="{ row }">
    <!-- status badge with icon + label -->
  </template>

  <template #cell.date="{ value }">{{ value }}</template>

  <template #cell.total="{ row }">{{ row.total }}</template>

  <template #empty>{{ t('demo.premiumOrders.empty') }}</template>
</FlexTable>

<!-- Script -->
import FlexTable from '@/dev/components/ui/table/FlexTable.vue';

const columns = computed(() => [
  { key: 'orderNum', label: t('demo.premiumOrders.columns.orderNum'), basis: 'basis-[25%]', type: 'custom' },
  { key: 'from', label: t('demo.premiumOrders.columns.from'), basis: 'basis-[12%]' },
  { key: 'status', label: t('demo.premiumOrders.columns.status'), basis: 'basis-[12%]' },
  { key: 'date', label: t('demo.premiumOrders.columns.date'), basis: 'basis-[15%]' },
  { key: 'total', label: t('demo.premiumOrders.columns.total'), basis: 'basis-[12%]' },
]);

const filteredRows = computed(() => orders.filter((row) => {
  const query = searchQuery.value.toLowerCase();
  const matchesSearch = row.orderNum.toLowerCase().includes(query)
    || row.from.toLowerCase().includes(query);
  const matchesTab = currentTab.value === 'All'
    || row.status === currentTab.value
    || (currentTab.value === 'In Progress' && row.status === 'New');
  const matchesType = selectedOrderType.value === 'all'
    || row.orderType === selectedOrderType.value;
  return matchesSearch && matchesTab && matchesType;
}));`,
  fullPage: `<!-- Full Premium Orders page -->
<OrdersPremiumTable />

<!-- Single component includes:
  - DemoSectionHeader (#PremiumOrdersTable)
  - DashboardTabs (status filter)
  - OrdersTableSearchInput (search filter)
  - BasePlanDropdown (order type filter)
  - FlexTable (orders list with custom cell slots)
-->

<!-- Import -->
import OrdersPremiumTable from '@/dev/components/ui/table/dashboard/OrdersPremiumTable.vue';`,
}));
</script>

<style scoped>
.premium-orders-table :deep(.flex-table-row) {
  height: 4.5rem;
}
</style>
