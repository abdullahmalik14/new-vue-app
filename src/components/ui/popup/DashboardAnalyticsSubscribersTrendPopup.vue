<template>
  <DashboardAnalyticsTrendPopup :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" :period="period"
    @update:period="handlePeriodChange" title="{{ $t('dashboard.analytics.trends.subscriptionsInsight') }}"
    logo="https://i.ibb.co.com/MyhfGRNH/svgviewer-png-output-12.webp">
    <div v-if="hasSubscribersData" :class="isDaily ? 'flex flex-row gap-6' : 'flex flex-col gap-6'">

      <!-- STAT CARDS (Hidden to match Figma) -->
      <!--
      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-2 rounded bg-light-bg-container dark:bg-dark-bg-container p-4 text-center">
          <h3 class="text-sm font-semibold text-[#101828] dark:text-white">{{ $t('dashboard.analytics.trends.newSubscribers') }}</h3>
          <span class="text-3xl font-semibold text-gray-900 dark:text-white">{{ newCount ?? '--' }}</span>
          <span v-if="newPct !== null" :class="newPct >= 0 ? 'text-emerald-600' : 'text-red-500'" class="text-sm font-medium">
            {{ newPct >= 0 ? '+' : '' }}{{ newPct }}% {{ vsLabel }}
          </span>
        </div>
        <div class="flex flex-col gap-2 rounded bg-light-bg-container dark:bg-dark-bg-container p-4 text-center">
          <h3 class="text-sm font-semibold text-[#101828] dark:text-white">{{ $t('dashboard.analytics.trends.recurringSubscribers') }}</h3>
          <span class="text-3xl font-semibold text-gray-900 dark:text-white">{{ recurringCount ?? '--' }}</span>
          <span v-if="recurringPct !== null" :class="recurringPct >= 0 ? 'text-emerald-600' : 'text-red-500'" class="text-sm font-medium">
            {{ recurringPct >= 0 ? '+' : '' }}{{ recurringPct }}% {{ vsLabel }}
          </span>
        </div>
      </div>
      -->

      <!-- SUBSCRIPTIONS INSIGHT -->
      <div :class="isDaily ? 'flex-1' : 'w-full'" class="flex flex-col gap-3 p-4   h-[25rem] relative">
        <div class="flex justify-between items-center z-10 relative">
          <h3 class="text-base font-semibold text-[#101828] dark:text-[#dbd8d3]">{{ $t('dashboard.analytics.trends.subscriptionsInsight') }}</h3>
          <div v-if="!isDaily" class="flex gap-1 bg-[#F9FAFB] p-1 rounded-lg border border-[#EAECF0]">
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent"
              :class="activeSubsViewMode === 'bar' ? 'bg-white shadow-sm' : 'bg-transparent'" @click="setSubsView('bar')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                :stroke="activeSubsViewMode === 'bar' ? '#344054' : '#98A2B3'" stroke-width="2" stroke-linecap="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </button>
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent"
              :class="activeSubsViewMode === 'line' ? 'bg-white shadow-sm' : 'bg-transparent'" @click="setSubsView('line')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                :stroke="activeSubsViewMode === 'line' ? '#344054' : '#98A2B3'" stroke-width="2" stroke-linecap="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="absolute top-[40px] left-0 right-0 bottom-[30px]">
          <!-- Daily Donut -->
          <div data-chart-container data-chart-id="subs-daily-donut" :hidden="!isDaily || undefined"
            class="absolute inset-0"
            :data-chart-config='JSON.stringify({ type: "donut", period: "slot", datasetKey: "subs-donut", fields: { category: "name", total: "value" }, categoryKeyMap: { "New Subscriber": "New Subscriber", "Recurring Subscriber": "Recurring Subscriber" }, seriesStyles: { "New Subscriber": { color: "#4CC9F0", name: "New Subscriber" }, "Recurring Subscriber": { color: "#4361EE", name: "Recurring Subscriber" } }, legentHint: { enabled: true, class: "absolute -bottom-2 left-0 w-full flex flex-wrap justify-center gap-4", itemClass: "inline-flex items-center gap-1.5 px-2 py-1", markerClass: "w-2.5 h-2.5 rounded-full", labelClass: "text-slate-500 text-xs font-medium font-sans" } })'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>

          <!-- Weekly bar/line -->
          <div data-chart-container data-chart-id="subs-weekly-bar"
            :hidden="isDaily || !(activePeriod === 'weekly' && activeSubsViewMode === 'bar') || undefined"
            class="absolute inset-0" :data-chart-config='getSubsBarCfg("subs-weekly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="subs-weekly-line"
            :hidden="isDaily || !(activePeriod === 'weekly' && activeSubsViewMode === 'line') || undefined"
            class="absolute inset-0" :data-chart-config='getSubsLineCfg("subs-weekly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>

          <!-- Monthly bar/line -->
          <div data-chart-container data-chart-id="subs-monthly-bar"
            :hidden="isDaily || !(activePeriod === 'monthly' && activeSubsViewMode === 'bar') || undefined"
            class="absolute inset-0" :data-chart-config='getSubsBarCfg("subs-monthly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="subs-monthly-line"
            :hidden="isDaily || !(activePeriod === 'monthly' && activeSubsViewMode === 'line') || undefined"
            class="absolute inset-0" :data-chart-config='getSubsLineCfg("subs-monthly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>

          <!-- Yearly bar/line -->
          <div data-chart-container data-chart-id="subs-yearly-bar"
            :hidden="isDaily || !(activePeriod === 'yearly' && activeSubsViewMode === 'bar') || undefined"
            class="absolute inset-0" :data-chart-config='getSubsBarCfg("subs-yearly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="subs-yearly-line"
            :hidden="isDaily || !(activePeriod === 'yearly' && activeSubsViewMode === 'line') || undefined"
            class="absolute inset-0" :data-chart-config='getSubsLineCfg("subs-yearly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>

          <!-- Alltime bar/line -->
          <div data-chart-container data-chart-id="subs-alltime-bar"
            :hidden="isDaily || !(activePeriod === 'alltime' && activeSubsViewMode === 'bar') || undefined"
            class="absolute inset-0" :data-chart-config='getSubsBarCfg("subs-alltime")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="subs-alltime-line"
            :hidden="isDaily || !(activePeriod === 'alltime' && activeSubsViewMode === 'line') || undefined"
            class="absolute inset-0" :data-chart-config='getSubsLineCfg("subs-alltime")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
        </div>
      </div>

      <!-- TIERS BREAKDOWN -->
      <div :class="isDaily ? 'flex-1' : 'w-full'" class="flex flex-col gap-3 p-4 h-[25rem] relative">
        <div class="flex justify-between items-center z-10 relative">
          <h3 class="text-base font-semibold text-[#101828] dark:text-[#dbd8d3]">{{ $t('dashboard.analytics.trends.tiersBreakdown') }}</h3>
          <div v-if="!isDaily" class="flex gap-1 bg-[#F9FAFB] p-1 rounded-lg border border-[#EAECF0]">
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent"
              :class="activeTiersViewMode === 'bar' ? 'bg-white shadow-sm' : 'bg-transparent'" @click="setTiersView('bar')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                :stroke="activeTiersViewMode === 'bar' ? '#344054' : '#98A2B3'" stroke-width="2" stroke-linecap="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </button>
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent"
              :class="activeTiersViewMode === 'line' ? 'bg-white shadow-sm' : 'bg-transparent'" @click="setTiersView('line')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                :stroke="activeTiersViewMode === 'line' ? '#344054' : '#98A2B3'" stroke-width="2" stroke-linecap="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="absolute top-[40px] left-0 right-0 bottom-[30px]">
          <!-- Daily Donut -->
          <div data-chart-container data-chart-id="tiers-daily-donut" :hidden="!isDaily || undefined"
            class="absolute inset-0"
            :data-chart-config='JSON.stringify({ type: "donut", period: "slot", datasetKey: "tiers-donut", fields: { category: "name", total: "value" }, categoryKeyMap: { Free: "Free", "Tier 1": "Tier 1", "Tier 2": "Tier 2", "Tier 3": "Tier 3", "Tier 4": "Tier 4", "Tier 5": "Tier 5" }, seriesStyles: { Free: { color: "#4CC9F0", name: "Free" }, "Tier 1": { color: "#4361EE", name: "Tier 1" }, "Tier 2": { color: "#3A0CA3", name: "Tier 2" }, "Tier 3": { color: "#AE4AEF", name: "Tier 3" }, "Tier 4": { color: "#98A2B3", name: "Tier 4" }, "Tier 5": { color: "#F72485", name: "Tier 5" } }, legentHint: legendConfig })'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>

          <!-- Weekly -->
          <div data-chart-container data-chart-id="tiers-weekly-bar"
            :hidden="isDaily || !(activePeriod === 'weekly' && activeTiersViewMode === 'bar') || undefined"
            class="absolute inset-0" :data-chart-config='getTiersBarCfg("subs-weekly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="tiers-weekly-line"
            :hidden="isDaily || !(activePeriod === 'weekly' && activeTiersViewMode === 'line') || undefined"
            class="absolute inset-0" :data-chart-config='getTiersLineCfg("subs-weekly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>

          <!-- Monthly -->
          <div data-chart-container data-chart-id="tiers-monthly-bar"
            :hidden="isDaily || !(activePeriod === 'monthly' && activeTiersViewMode === 'bar') || undefined"
            class="absolute inset-0" :data-chart-config='getTiersBarCfg("subs-monthly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="tiers-monthly-line"
            :hidden="isDaily || !(activePeriod === 'monthly' && activeTiersViewMode === 'line') || undefined"
            class="absolute inset-0" :data-chart-config='getTiersLineCfg("subs-monthly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>

          <!-- Yearly -->
          <div data-chart-container data-chart-id="tiers-yearly-bar"
            :hidden="isDaily || !(activePeriod === 'yearly' && activeTiersViewMode === 'bar') || undefined"
            class="absolute inset-0" :data-chart-config='getTiersBarCfg("subs-yearly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="tiers-yearly-line"
            :hidden="isDaily || !(activePeriod === 'yearly' && activeTiersViewMode === 'line') || undefined"
            class="absolute inset-0" :data-chart-config='getTiersLineCfg("subs-yearly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>

          <!-- Alltime -->
          <div data-chart-container data-chart-id="tiers-alltime-bar"
            :hidden="isDaily || !(activePeriod === 'alltime' && activeTiersViewMode === 'bar') || undefined"
            class="absolute inset-0" :data-chart-config='getTiersBarCfg("subs-alltime")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="tiers-alltime-line"
            :hidden="isDaily || !(activePeriod === 'alltime' && activeTiersViewMode === 'line') || undefined"
            class="absolute inset-0" :data-chart-config='getTiersLineCfg("subs-alltime")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
        </div>
      </div>

    </div>
    <div v-else class="flex flex-col justify-center items-center gap-6 h-[400px] text-center w-full">
      <div class="relative flex justify-center items-center">
        <img src="/images/noTrendImg.png" alt="illustration" class="w-32 h-32 object-contain" />
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-base font-medium text-light-text-secondary dark:text-dark-text-secondary">No trend to show at
          the moment</span>
        <a href="#" class="text-xs text-light-text-secondary dark:text-dark-text-secondary underline">Learn ways to
          earn</a>
      </div>
    </div>
  </DashboardAnalyticsTrendPopup>
</template>

<script setup>
import DashboardAnalyticsTrendPopup from './DashboardAnalyticsTrendPopup.vue'
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useDashboardAnalyticsStore } from '@/stores/useDashboardAnalyticsStore.js'

const props = defineProps({ modelValue: Boolean, period: String, insightData: Object })
const emit = defineEmits(['update:modelValue', 'update:period'])

const hasSubscribersData = computed(() => props.insightData && props.insightData.new != null)

const analyticsStore = useDashboardAnalyticsStore()
const bundle = computed(() => analyticsStore.subscriptionsBundle || {})

// Active period mapping
const activePeriod = computed(() => {
  // Linden: 'on open should be default bar chart for week'
  const p = (props.period || 'weekly').toLowerCase().trim()
  if (p === 'all-time' || p === 'alltime') return 'alltime'
  return p // daily | weekly | monthly | yearly
})

const isDaily = computed(() => activePeriod.value === 'daily')

const activeSubsViewMode = ref('bar')
const activeTiersViewMode = ref('bar')

// ===== CONFIG HELPERS (Said's field names) =====
const legendConfig = { enabled: true, class: "absolute -bottom-2 left-0 w-full flex flex-wrap justify-center gap-4", itemClass: "inline-flex items-center gap-1.5 px-2 py-1", markerClass: "w-2.5 h-2.5 rounded-full", labelClass: "text-slate-500 text-xs font-medium font-sans" }
const subsChartStyles = { sub: { color: "#4CC9F0", name: "New Subscriber" }, tip: { color: "#4361EE", name: "Recurring Subscriber" } }
const subsChartLabels = { sub: "New Subscriber", tip: "Recurring Subscriber" }
const tiersChartStyles = { free: { color: "#4CC9F0", name: "Free" }, tier1: { color: "#4361EE", name: "Tier 1" }, tier2: { color: "#3A0CA3", name: "Tier 2" }, tier3: { color: "#AE4AEF", name: "Tier 3" }, tier4: { color: "#98A2B3", name: "Tier 4" }, tier5: { color: "#F72485", name: "Tier 5" } }
const tiersChartLabels = { free: "Free", tier1: "Tier 1", tier2: "Tier 2", tier3: "Tier 3", tier4: "Tier 4", tier5: "Tier 5" }

function getSubsBarCfg(dk) {
  return JSON.stringify({ type: "bar", period: "slot", datasetKey: dk, fields: { category: "period", total: "total" }, breakdownKeys: ["sub", "tip"], stacked: true, seriesStyles: subsChartStyles, seriesLabels: subsChartLabels, bar: { widthPercent: 35 }, axisLabelColor: "#475467", axisLabelFontSize: "10px", xAxis: { minGridDistance: 80 }, tooltip: { aggregated: { enabled: true, mode: "codepen", valuePrefix: "", valueSuffix: "", totalLabel: "Total Subscribers:" } }, yAxis: { autoMax: true, autoMaxBuffer: 0.12, strict: true }, legentHint: legendConfig })
}
function getSubsLineCfg(dk) {
  return JSON.stringify({ type: "line", period: "slot", datasetKey: dk, fields: { category: "period", total: "total" }, breakdownKeys: ["sub", "tip"], stacked: true, seriesStyles: subsChartStyles, seriesLabels: subsChartLabels, axisLabelColor: "#475467", axisLabelFontSize: "10px", xAxis: { minGridDistance: 80 }, tooltip: { aggregated: { enabled: true, mode: "codepen", valuePrefix: "", valueSuffix: "", totalLabel: "Total Subscribers:" } }, yAxis: { autoMax: true, autoMaxBuffer: 0.12, strict: true }, line: { strokeWidth: 4 }, legentHint: legendConfig })
}
function getTiersBarCfg(dk) {
  return JSON.stringify({ type: "bar", period: "slot", datasetKey: dk, fields: { category: "period", total: "total" }, breakdownKeys: ["free", "tier1", "tier2", "tier3", "tier4", "tier5"], stacked: true, seriesStyles: tiersChartStyles, seriesLabels: tiersChartLabels, bar: { widthPercent: 35 }, axisLabelColor: "#475467", axisLabelFontSize: "10px", xAxis: { minGridDistance: 80 }, tooltip: { aggregated: { enabled: true, mode: "codepen", valuePrefix: "", valueSuffix: "", totalLabel: "Total Subscribers:" } }, yAxis: { min: 0, autoMax: true, autoMaxBuffer: 0.12, strict: true }, legentHint: legendConfig })
}
function getTiersLineCfg(dk) {
  return JSON.stringify({ type: "line", period: "slot", datasetKey: dk, fields: { category: "period", total: "total" }, breakdownKeys: ["free", "tier1", "tier2", "tier3", "tier4", "tier5"], stacked: true, seriesStyles: tiersChartStyles, seriesLabels: tiersChartLabels, axisLabelColor: "#475467", axisLabelFontSize: "10px", xAxis: { minGridDistance: 80 }, tooltip: { aggregated: { enabled: true, mode: "codepen", valuePrefix: "", valueSuffix: "", totalLabel: "Total Subscribers:" } }, yAxis: { min: 0, autoMax: true, autoMaxBuffer: 0.12, strict: true }, line: { strokeWidth: 4 }, legentHint: legendConfig })
}

// ===== STAT DATA =====
function calculatePercentage(currentPeriodData, previousPeriodData) {
  if (currentPeriodData == null || !previousPeriodData) return null
  return Math.round(((currentPeriodData - previousPeriodData) / previousPeriodData) * 100)
}

const statData = computed(() => {
  const p = activePeriod.value
  const b = bundle.value
  if (p === 'yearly' || p === 'alltime') {
    const gt = b.grandTotal || {}
    return { new: gt.sub ?? null, recurring: gt.tip ?? null, newPct: null, recurringPct: null }
  }
  const arrMap = { daily: b.daily, weekly: b.weekly, monthly: b.monthly }
  const arr = arrMap[p] || []
  const last = arr[arr.length - 1] || {}
  const previousPeriodData = arr[arr.length - 2] || {}
  return {
    new: last.sub ?? null,
    recurring: last.tip ?? null,
    newPct: calculatePercentage(last.sub, previousPeriodData.sub),
    recurringPct: calculatePercentage(last.tip, previousPeriodData.tip),
  }
})

const newCount = computed(() => statData.value.new)
const recurringCount = computed(() => statData.value.recurring)
const newPct = computed(() => statData.value.newPct)
const recurringPct = computed(() => statData.value.recurringPct)
const vsLabel = computed(() => {
  const m = { daily: 'vs yesterday', weekly: 'vs last week', monthly: 'vs last month' }
  return m[activePeriod.value] || ''
})

// ===== INJECT CHART DATA (Said's format: sub, tip, month) =====
function injectChartData() {
  if (!window.chartsHandler) return
  const b = bundle.value
  if (!b?.daily?.length) return

  const daily = b.daily || []
  const lastDaily = daily[daily.length - 1] || {}

  // FIXED: Each period maps to its CORRECT data array
  // weekly = b.weekly (7 entries, not daily.slice(-7))
  // monthly = b.monthly (29 entries, not weekly)
  // yearly = b.yearly (5 years, not monthly)
  // alltime = b.alltime (fallback to yearly)
  window.chartsHandler._configs.data['subs-weekly'] = { slot: b.weekly || [] }
  window.chartsHandler._configs.data['subs-monthly'] = { slot: b.monthly || [] }
  window.chartsHandler._configs.data['subs-yearly'] = { slot: b.yearly || [] }
  window.chartsHandler._configs.data['subs-alltime'] = { slot: b.alltime || b.yearly || [] }

  // Donut — Said's field names (sub, tip)
  window.chartsHandler._configs.data['subs-donut'] = {
    slot: [
      { name: 'New Subscriber', value: lastDaily.sub || 0 },
      { name: 'Recurring Subscriber', value: lastDaily.tip || 0 },
    ]
  }
  window.chartsHandler._configs.data['tiers-donut'] = {
    slot: [
      { name: 'Free', value: lastDaily.free || 0 },
      { name: 'Tier 1', value: lastDaily.tier1 || 0 },
      { name: 'Tier 2', value: lastDaily.tier2 || 0 },
      { name: 'Tier 3', value: lastDaily.tier3 || 0 },
      { name: 'Tier 4', value: lastDaily.tier4 || 0 },
      { name: 'Tier 5', value: lastDaily.tier5 || 0 },
    ]
  }
}

// ===== CHART RENDERING =====
async function ensureReady() {
  if (!window.chartsHandler) return
  const hasSubscribersData = window.chartsHandler._configs?.data && Object.keys(window.chartsHandler._configs.data).length > 0
  if (!hasSubscribersData) await window.chartsHandler.loadChartConfigsAndData()
  injectChartData()
}

async function renderChart(chartId) {
  if (!window.chartsHandler) return
  const container = document.querySelector(`[data-chart-id="${chartId}"]`)
  if (!container) return

  try { window.chartsHandler.destroyChartInstance(chartId) } catch (e) { }
  container.removeAttribute('hidden')
  const host = container.querySelector('[amchart]')
  if (host) host.innerHTML = ''
  await window.chartsHandler.renderChartInstance(container)
}

async function renderCurrentCharts() {
  await ensureReady()
  if (isDaily.value) {
    await renderChart('subs-daily-donut')
    await renderChart('tiers-daily-donut')
  } else {
    const p = activePeriod.value
    await renderChart(`subs-${p}-${activeSubsViewMode.value}`)
    await renderChart(`tiers-${p}-${activeTiersViewMode.value}`)
  }
}

async function setSubsView(v) {
  activeSubsViewMode.value = v
  await nextTick()
  if (!isDaily.value) await renderChart(`subs-${activePeriod.value}-${v}`)
}
async function setTiersView(v) {
  activeTiersViewMode.value = v
  await nextTick()
  if (!isDaily.value) await renderChart(`tiers-${activePeriod.value}-${v}`)
}
async function handlePeriodChange(val) {
  emit('update:period', val)
  await nextTick()
  await renderCurrentCharts()
}

watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) { await nextTick(); await renderCurrentCharts() }
})
onMounted(async () => {
  if (props.modelValue) { await nextTick(); await renderCurrentCharts() }
})
</script>
