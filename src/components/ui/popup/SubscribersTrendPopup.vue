<template>
  <TrendPopup :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" :period="period"
    @update:period="onPeriodChange" title="Subscriptions Insight"
    logo="https://i.ibb.co.com/MyhfGRNH/svgviewer-png-output-12.webp">
    <div v-if="hasData" :class="isDaily ? 'flex flex-row gap-6' : 'flex flex-col gap-6'">

      <!-- STAT CARDS (Hidden to match Figma) -->
      <!--
      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-2 rounded bg-light-bg-container dark:bg-dark-bg-container p-4 text-center">
          <h3 class="text-sm font-semibold text-[#101828] dark:text-white">New Subscribers</h3>
          <span class="text-3xl font-semibold text-gray-900 dark:text-white">{{ newCount ?? '--' }}</span>
          <span v-if="newPct !== null" :class="newPct >= 0 ? 'text-emerald-600' : 'text-red-500'" class="text-sm font-medium">
            {{ newPct >= 0 ? '+' : '' }}{{ newPct }}% {{ vsLabel }}
          </span>
        </div>
        <div class="flex flex-col gap-2 rounded bg-light-bg-container dark:bg-dark-bg-container p-4 text-center">
          <h3 class="text-sm font-semibold text-[#101828] dark:text-white">Recurring Subscribers</h3>
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
          <h3 class="text-base font-semibold text-[#101828] dark:text-[#dbd8d3]">Subscriptions Insight</h3>
          <div v-if="!isDaily" class="flex gap-1 bg-[#F9FAFB] p-1 rounded-lg border border-[#EAECF0]">
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent"
              :class="subsView === 'bar' ? 'bg-white shadow-sm' : 'bg-transparent'" @click="setSubsView('bar')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                :stroke="subsView === 'bar' ? '#344054' : '#98A2B3'" stroke-width="2" stroke-linecap="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </button>
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent"
              :class="subsView === 'line' ? 'bg-white shadow-sm' : 'bg-transparent'" @click="setSubsView('line')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                :stroke="subsView === 'line' ? '#344054' : '#98A2B3'" stroke-width="2" stroke-linecap="round">
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
            :hidden="isDaily || !(activePeriod === 'weekly' && subsView === 'bar') || undefined"
            class="absolute inset-0" :data-chart-config='subsBarCfg("subs-weekly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="subs-weekly-line"
            :hidden="isDaily || !(activePeriod === 'weekly' && subsView === 'line') || undefined"
            class="absolute inset-0" :data-chart-config='subsLineCfg("subs-weekly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>

          <!-- Monthly bar/line -->
          <div data-chart-container data-chart-id="subs-monthly-bar"
            :hidden="isDaily || !(activePeriod === 'monthly' && subsView === 'bar') || undefined"
            class="absolute inset-0" :data-chart-config='subsBarCfg("subs-monthly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="subs-monthly-line"
            :hidden="isDaily || !(activePeriod === 'monthly' && subsView === 'line') || undefined"
            class="absolute inset-0" :data-chart-config='subsLineCfg("subs-monthly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>

          <!-- Yearly bar/line -->
          <div data-chart-container data-chart-id="subs-yearly-bar"
            :hidden="isDaily || !(activePeriod === 'yearly' && subsView === 'bar') || undefined"
            class="absolute inset-0" :data-chart-config='subsBarCfg("subs-yearly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="subs-yearly-line"
            :hidden="isDaily || !(activePeriod === 'yearly' && subsView === 'line') || undefined"
            class="absolute inset-0" :data-chart-config='subsLineCfg("subs-yearly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>

          <!-- Alltime bar/line -->
          <div data-chart-container data-chart-id="subs-alltime-bar"
            :hidden="isDaily || !(activePeriod === 'alltime' && subsView === 'bar') || undefined"
            class="absolute inset-0" :data-chart-config='subsBarCfg("subs-alltime")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="subs-alltime-line"
            :hidden="isDaily || !(activePeriod === 'alltime' && subsView === 'line') || undefined"
            class="absolute inset-0" :data-chart-config='subsLineCfg("subs-alltime")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
        </div>
      </div>

      <!-- TIERS BREAKDOWN -->
      <div :class="isDaily ? 'flex-1' : 'w-full'" class="flex flex-col gap-3 p-4 h-[25rem] relative">
        <div class="flex justify-between items-center z-10 relative">
          <h3 class="text-base font-semibold text-[#101828] dark:text-[#dbd8d3]">Tiers Breakdown</h3>
          <div v-if="!isDaily" class="flex gap-1 bg-[#F9FAFB] p-1 rounded-lg border border-[#EAECF0]">
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent"
              :class="tiersView === 'bar' ? 'bg-white shadow-sm' : 'bg-transparent'" @click="setTiersView('bar')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                :stroke="tiersView === 'bar' ? '#344054' : '#98A2B3'" stroke-width="2" stroke-linecap="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </button>
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent"
              :class="tiersView === 'line' ? 'bg-white shadow-sm' : 'bg-transparent'" @click="setTiersView('line')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                :stroke="tiersView === 'line' ? '#344054' : '#98A2B3'" stroke-width="2" stroke-linecap="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="absolute top-[40px] left-0 right-0 bottom-[30px]">
          <!-- Daily Donut -->
          <div data-chart-container data-chart-id="tiers-daily-donut" :hidden="!isDaily || undefined"
            class="absolute inset-0"
            :data-chart-config='JSON.stringify({ type: "donut", period: "slot", datasetKey: "tiers-donut", fields: { category: "name", total: "value" }, categoryKeyMap: { Free: "Free", "Tier 1": "Tier 1", "Tier 2": "Tier 2", "Tier 3": "Tier 3", "Tier 4": "Tier 4", "Tier 5": "Tier 5" }, seriesStyles: { Free: { color: "#4CC9F0", name: "Free" }, "Tier 1": { color: "#4361EE", name: "Tier 1" }, "Tier 2": { color: "#3A0CA3", name: "Tier 2" }, "Tier 3": { color: "#AE4AEF", name: "Tier 3" }, "Tier 4": { color: "#98A2B3", name: "Tier 4" }, "Tier 5": { color: "#F72485", name: "Tier 5" } }, legentHint: LEGEND })'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>

          <!-- Weekly -->
          <div data-chart-container data-chart-id="tiers-weekly-bar"
            :hidden="isDaily || !(activePeriod === 'weekly' && tiersView === 'bar') || undefined"
            class="absolute inset-0" :data-chart-config='tiersBarCfg("subs-weekly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="tiers-weekly-line"
            :hidden="isDaily || !(activePeriod === 'weekly' && tiersView === 'line') || undefined"
            class="absolute inset-0" :data-chart-config='tiersLineCfg("subs-weekly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>

          <!-- Monthly -->
          <div data-chart-container data-chart-id="tiers-monthly-bar"
            :hidden="isDaily || !(activePeriod === 'monthly' && tiersView === 'bar') || undefined"
            class="absolute inset-0" :data-chart-config='tiersBarCfg("subs-monthly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="tiers-monthly-line"
            :hidden="isDaily || !(activePeriod === 'monthly' && tiersView === 'line') || undefined"
            class="absolute inset-0" :data-chart-config='tiersLineCfg("subs-monthly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>

          <!-- Yearly -->
          <div data-chart-container data-chart-id="tiers-yearly-bar"
            :hidden="isDaily || !(activePeriod === 'yearly' && tiersView === 'bar') || undefined"
            class="absolute inset-0" :data-chart-config='tiersBarCfg("subs-yearly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="tiers-yearly-line"
            :hidden="isDaily || !(activePeriod === 'yearly' && tiersView === 'line') || undefined"
            class="absolute inset-0" :data-chart-config='tiersLineCfg("subs-yearly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>

          <!-- Alltime -->
          <div data-chart-container data-chart-id="tiers-alltime-bar"
            :hidden="isDaily || !(activePeriod === 'alltime' && tiersView === 'bar') || undefined"
            class="absolute inset-0" :data-chart-config='tiersBarCfg("subs-alltime")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="tiers-alltime-line"
            :hidden="isDaily || !(activePeriod === 'alltime' && tiersView === 'line') || undefined"
            class="absolute inset-0" :data-chart-config='tiersLineCfg("subs-alltime")'>
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
  </TrendPopup>
</template>

<script setup>
import TrendPopup from './TrendPopup.vue'
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useDashboardAnalyticsStore } from '@/stores/useDashboardAnalyticsStore.js'

const props = defineProps({ modelValue: Boolean, period: String, insightData: Object })
const emit = defineEmits(['update:modelValue', 'update:period'])

const hasData = computed(() => props.insightData && props.insightData.new != null)

const store = useDashboardAnalyticsStore()
const bundle = computed(() => store.subscriptionsBundle || {})

// Active period mapping
const activePeriod = computed(() => {
  // Linden: 'on open should be default bar chart for week'
  const p = (props.period || 'weekly').toLowerCase().trim()
  if (p === 'all-time' || p === 'alltime') return 'alltime'
  return p // daily | weekly | monthly | yearly
})

const isDaily = computed(() => activePeriod.value === 'daily')

const subsView = ref('bar')
const tiersView = ref('bar')

// ===== CONFIG HELPERS (Said's field names) =====
const LEGEND = { enabled: true, class: "absolute -bottom-2 left-0 w-full flex flex-wrap justify-center gap-4", itemClass: "inline-flex items-center gap-1.5 px-2 py-1", markerClass: "w-2.5 h-2.5 rounded-full", labelClass: "text-slate-500 text-xs font-medium font-sans" }
const SUBS_STYLES = { sub: { color: "#4CC9F0", name: "New Subscriber" }, tip: { color: "#4361EE", name: "Recurring Subscriber" } }
const SUBS_LABELS = { sub: "New Subscriber", tip: "Recurring Subscriber" }
const TIERS_STYLES = { free: { color: "#4CC9F0", name: "Free" }, tier1: { color: "#4361EE", name: "Tier 1" }, tier2: { color: "#3A0CA3", name: "Tier 2" }, tier3: { color: "#AE4AEF", name: "Tier 3" }, tier4: { color: "#98A2B3", name: "Tier 4" }, tier5: { color: "#F72485", name: "Tier 5" } }
const TIERS_LABELS = { free: "Free", tier1: "Tier 1", tier2: "Tier 2", tier3: "Tier 3", tier4: "Tier 4", tier5: "Tier 5" }

function subsBarCfg(dk) {
  return JSON.stringify({ type: "bar", period: "slot", datasetKey: dk, fields: { category: "period", total: "total" }, breakdownKeys: ["sub", "tip"], stacked: true, seriesStyles: SUBS_STYLES, seriesLabels: SUBS_LABELS, bar: { widthPercent: 35 }, axisLabelColor: "#475467", axisLabelFontSize: "10px", xAxis: { minGridDistance: 80 }, tooltip: { aggregated: { enabled: true, mode: "codepen", valuePrefix: "", valueSuffix: "", totalLabel: "Total Subscribers:" } }, yAxis: { autoMax: true, autoMaxBuffer: 0.12, strict: true }, legentHint: LEGEND })
}
function subsLineCfg(dk) {
  return JSON.stringify({ type: "line", period: "slot", datasetKey: dk, fields: { category: "period", total: "total" }, breakdownKeys: ["sub", "tip"], stacked: true, seriesStyles: SUBS_STYLES, seriesLabels: SUBS_LABELS, axisLabelColor: "#475467", axisLabelFontSize: "10px", xAxis: { minGridDistance: 80 }, tooltip: { aggregated: { enabled: true, mode: "codepen", valuePrefix: "", valueSuffix: "", totalLabel: "Total Subscribers:" } }, yAxis: { autoMax: true, autoMaxBuffer: 0.12, strict: true }, line: { strokeWidth: 4 }, legentHint: LEGEND })
}
function tiersBarCfg(dk) {
  return JSON.stringify({ type: "bar", period: "slot", datasetKey: dk, fields: { category: "period", total: "total" }, breakdownKeys: ["free", "tier1", "tier2", "tier3", "tier4", "tier5"], stacked: true, seriesStyles: TIERS_STYLES, seriesLabels: TIERS_LABELS, bar: { widthPercent: 35 }, axisLabelColor: "#475467", axisLabelFontSize: "10px", xAxis: { minGridDistance: 80 }, tooltip: { aggregated: { enabled: true, mode: "codepen", valuePrefix: "", valueSuffix: "", totalLabel: "Total Subscribers:" } }, yAxis: { min: 0, autoMax: true, autoMaxBuffer: 0.12, strict: true }, legentHint: LEGEND })
}
function tiersLineCfg(dk) {
  return JSON.stringify({ type: "line", period: "slot", datasetKey: dk, fields: { category: "period", total: "total" }, breakdownKeys: ["free", "tier1", "tier2", "tier3", "tier4", "tier5"], stacked: true, seriesStyles: TIERS_STYLES, seriesLabels: TIERS_LABELS, axisLabelColor: "#475467", axisLabelFontSize: "10px", xAxis: { minGridDistance: 80 }, tooltip: { aggregated: { enabled: true, mode: "codepen", valuePrefix: "", valueSuffix: "", totalLabel: "Total Subscribers:" } }, yAxis: { min: 0, autoMax: true, autoMaxBuffer: 0.12, strict: true }, line: { strokeWidth: 4 }, legentHint: LEGEND })
}

// ===== STAT DATA =====
function calcPct(curr, prev) {
  if (curr == null || !prev) return null
  return Math.round(((curr - prev) / prev) * 100)
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
  const prev = arr[arr.length - 2] || {}
  return {
    new: last.sub ?? null,
    recurring: last.tip ?? null,
    newPct: calcPct(last.sub, prev.sub),
    recurringPct: calcPct(last.tip, prev.tip),
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
  const hasData = window.chartsHandler._configs?.data && Object.keys(window.chartsHandler._configs.data).length > 0
  if (!hasData) await window.chartsHandler.loadChartConfigsAndData()
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
    await renderChart(`subs-${p}-${subsView.value}`)
    await renderChart(`tiers-${p}-${tiersView.value}`)
  }
}

async function setSubsView(v) {
  subsView.value = v
  await nextTick()
  if (!isDaily.value) await renderChart(`subs-${activePeriod.value}-${v}`)
}
async function setTiersView(v) {
  tiersView.value = v
  await nextTick()
  if (!isDaily.value) await renderChart(`tiers-${activePeriod.value}-${v}`)
}
async function onPeriodChange(val) {
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
