<template>
  <DashboardAnalyticsTrendPopup
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :period="period"
    @update:period="handlePeriodChange"
    :title="$t('dashboard.analytics.trends.titleContributors', 'Contributors Insight')"
    :logo="iconPopupLogo || ''"
  >
    <div class="flex flex-col gap-4">

      <!-- {{ $t('dashboard.analytics.trends.topContributors') }} -->
      <div class="flex flex-col gap-3 p-4 rounded-sm w-full h-[22rem] relative">
        <div class="flex justify-between items-center z-10 relative">
          <h3 class="text-base font-semibold text-[#101828] dark:text-[#dbd8d3]">{{ $t('dashboard.analytics.trends.topContributors') }}</h3>
          <div class="flex gap-1 bg-[#F9FAFB] p-1 rounded-lg border border-[#EAECF0]">
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent" :class="activeContribViewMode==='bar'?'bg-white shadow-sm':'bg-transparent'" @click="setContribView('bar')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="activeContribViewMode==='bar'?'#344054':'#98A2B3'" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </button>
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent" :class="activeContribViewMode==='line'?'bg-white shadow-sm':'bg-transparent'" @click="setContribView('line')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="activeContribViewMode==='line'?'#344054':'#98A2B3'" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </button>
          </div>
        </div>

        <div class="absolute top-[40px] left-0 right-0 bottom-[10px] transition-opacity duration-200" :class="{ 'opacity-0': isChartRendering, 'opacity-100': !isChartRendering }" v-show="analyticsStore.bundleLoaded && insightData?.topContributors?.length > 0">
          <div data-chart-container data-chart-id="contrib-top-bar" :hidden="activeContribViewMode!=='bar'||undefined" class="absolute inset-0"
            :data-chart-config='getContribBarCfg("contrib-top")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="contrib-top-line" :hidden="activeContribViewMode!=='line'||undefined" class="absolute inset-0"
            :data-chart-config='getContribLineCfg("contrib-top")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
        </div>
        <div class="flex flex-col justify-center items-center gap-6 w-full py-12 text-center absolute inset-0 mt-10 bg-white dark:bg-dark-bg-container z-20" v-if="!analyticsStore.bundleLoaded || !insightData?.topContributors?.length || isChartRendering">
          <img src="/images/noTrendImg.png" alt="list" class="w-16 h-16 object-contain opacity-50" />
          <div class="flex flex-col gap-1">
            <span class="text-xs leading-6 text-light-text-secondary dark:text-dark-text-secondary">{{ $t('dashboard.analytics.trends.noTrend') }}</span>
            <a href="#" class="text-[10px] leading-6 text-light-text-secondary dark:text-dark-text-secondary underline">{{ $t('dashboard.analytics.trends.learnToEarn') }}</a>
          </div>
        </div>
      </div>

      <!-- {{ $t('dashboard.analytics.trends.topFans') }} -->
      <div class="flex flex-col gap-3 p-4 rounded-sm w-full h-[22rem] relative">
        <div class="flex justify-between items-center z-10 relative">
          <h3 class="text-base font-semibold text-[#101828] dark:text-[#dbd8d3]">{{ $t('dashboard.analytics.trends.topFans') }}</h3>
          <div class="flex gap-1 bg-[#F9FAFB] p-1 rounded-lg border border-[#EAECF0]">
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent" :class="activeFansViewMode==='bar'?'bg-white shadow-sm':'bg-transparent'" @click="setFansView('bar')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="activeFansViewMode==='bar'?'#344054':'#98A2B3'" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </button>
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent" :class="activeFansViewMode==='line'?'bg-white shadow-sm':'bg-transparent'" @click="setFansView('line')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="activeFansViewMode==='line'?'#344054':'#98A2B3'" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </button>
          </div>
        </div>

        <div class="absolute top-[40px] left-0 right-0 bottom-[10px] transition-opacity duration-200" :class="{ 'opacity-0': isChartRendering, 'opacity-100': !isChartRendering }" v-show="analyticsStore.bundleLoaded && insightData?.topFans?.length > 0">
          <div data-chart-container data-chart-id="contrib-fans-bar" :hidden="activeFansViewMode!=='bar'||undefined" class="absolute inset-0"
            :data-chart-config='getContribBarCfg("contrib-fans")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="contrib-fans-line" :hidden="activeFansViewMode!=='line'||undefined" class="absolute inset-0"
            :data-chart-config='getContribLineCfg("contrib-fans")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
        </div>
        <div class="flex flex-col justify-center items-center gap-6 w-full py-12 text-center absolute inset-0 mt-10 bg-white dark:bg-dark-bg-container z-20" v-if="!analyticsStore.bundleLoaded || !insightData?.topFans?.length || isChartRendering">
          <img src="/images/noTrendImg.png" alt="list" class="w-16 h-16 object-contain opacity-50" />
          <div class="flex flex-col gap-1">
            <span class="text-xs leading-6 text-light-text-secondary dark:text-dark-text-secondary">{{ $t('dashboard.analytics.trends.noTrend') }}</span>
            <a href="#" class="text-[10px] leading-6 text-light-text-secondary dark:text-dark-text-secondary underline">{{ $t('dashboard.analytics.trends.learnToEarn') }}</a>
          </div>
        </div>
      </div>

      <!-- {{ $t('dashboard.analytics.trends.topOrderSpenders') }} -->
      <div class="flex flex-col gap-3 p-4 rounded-sm  backdrop-blur-[25px] dark:bg-dark-bg-container w-full h-[22rem] relative">
        <div class="flex justify-between items-center z-10 relative">
          <h3 class="text-base font-semibold text-[#101828] dark:text-[#dbd8d3]">{{ $t('dashboard.analytics.trends.topOrderSpenders') }}</h3>
          <div class="flex gap-1 bg-[#F9FAFB] p-1 rounded-lg border border-[#EAECF0]">
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent" :class="activeSpendersViewMode==='bar'?'bg-white shadow-sm':'bg-transparent'" @click="setSpendersView('bar')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="activeSpendersViewMode==='bar'?'#344054':'#98A2B3'" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </button>
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent" :class="activeSpendersViewMode==='line'?'bg-white shadow-sm':'bg-transparent'" @click="setSpendersView('line')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="activeSpendersViewMode==='line'?'#344054':'#98A2B3'" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </button>
          </div>
        </div>

        <div class="absolute top-[40px] left-0 right-0 bottom-[10px]" v-show="analyticsStore.bundleLoaded && insightData?.topOrderSpenders?.length > 0">
          <div data-chart-container data-chart-id="contrib-spenders-bar" :hidden="activeSpendersViewMode!=='bar'||undefined" class="absolute inset-0"
            :data-chart-config='getContribBarCfg("contrib-spenders")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="contrib-spenders-line" :hidden="activeSpendersViewMode!=='line'||undefined" class="absolute inset-0"
            :data-chart-config='getContribLineCfg("contrib-spenders")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
        </div>
        <div class="flex flex-col justify-center items-center gap-6 w-full py-12 text-center absolute inset-0 mt-10 bg-white dark:bg-dark-bg-container z-20" v-if="!analyticsStore.bundleLoaded || !insightData?.topOrderSpenders?.length || isChartRendering">
          <img src="/images/noTrendImg.png" alt="list" class="w-16 h-16 object-contain opacity-50" />
          <div class="flex flex-col gap-1">
            <span class="text-xs leading-6 text-light-text-secondary dark:text-dark-text-secondary">{{ $t('dashboard.analytics.trends.noTrend') }}</span>
            <a href="#" class="text-[10px] leading-6 text-light-text-secondary dark:text-dark-text-secondary underline">{{ $t('dashboard.analytics.trends.learnToEarn') }}</a>
          </div>
        </div>
      </div>

    </div>
  </DashboardAnalyticsTrendPopup>
</template>

<script setup> 
import { useAssetUrl } from '@/composables/useAssetUrl.js'
const { url: iconPopupLogo } = useAssetUrl('dashboard.analytics.money')
const { url: icon6Url } = useAssetUrl('dashboard.analytics.icon6')

import DashboardAnalyticsTrendPopup from './DashboardAnalyticsTrendPopup.vue'
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardAnalyticsStore } from '@/stores/useDashboardAnalyticsStore.js'

const props = defineProps({
  modelValue: Boolean,
  period: String,
  insightData: Object
})

const emit = defineEmits(['update:modelValue', 'update:period'])
const { t } = useI18n()
const analyticsStore = useDashboardAnalyticsStore()

const hasContributorsData = computed(() => {
  if (!props.insightData) return false
  const topContributors = props.insightData.topContributors || []
  const topFans = props.insightData.topFans || []
  const topSpenders = props.insightData.topSpenders || []
  return topContributors.length > 0 || topFans.length > 0 || topSpenders.length > 0
})

// View toggle state per section
const activeContribViewMode = ref('bar')
const activeFansViewMode = ref('bar')
const activeSpendersViewMode = ref('bar')

// ===== CHART CONFIG HELPERS =====
const legendConfig = { enabled:true, class:"absolute -bottom-2 left-0 w-full flex flex-wrap justify-center gap-4", itemClass:"inline-flex items-center gap-1.5 px-2 py-1", markerClass:"w-2.5 h-2.5 rounded-full", labelClass:"text-slate-500 text-xs font-medium font-sans" }
const contributorsChartStyles = computed(() => ({
  subscription:  { color:"#4CC9F0", name: t('dashboard.analytics.legends.subscription', 'Subscription') },
  paytoview:     { color:"#4361EE", name: t('dashboard.analytics.legends.paytoview', 'Pay to View') },
  merch:         { color:"#7209B7", name: t('dashboard.analytics.legends.merch', 'Merch') },
  wishtender:    { color:"#F72585", name: t('dashboard.analytics.legends.wishtender', 'Wishtender') },
  customrequest: { color:"#3A0CA3", name: t('dashboard.analytics.legends.customrequest', 'Custom Request') },
}))
const contributorsChartLabels = { subscription:"Subscription", paytoview:"Pay to View", merch:"Merch", wishtender:"Wishtender", customrequest:"Custom Request" }
const BREAKDOWN_KEYS = ["subscription","paytoview","merch","wishtender","customrequest"]

function getContribBarCfg(dk) {
  return JSON.stringify({
    type:"bar", period:"slot", datasetKey:dk,
    fields:{ category:"name", total:"tokens" },
    breakdownKeys: BREAKDOWN_KEYS,
    stacked:true,
    seriesStyles: contributorsChartStyles.value,
    seriesLabels: contributorsChartLabels,
    bar:{ widthPercent:50 },
    axisLabelColor:"#475467", axisLabelFontSize:"10px",
    xAxis:{ minGridDistance:60 },
    tooltip:{ aggregated:{ enabled:true, mode:"codepen", valuePrefix:"$", valueSuffix:"" }},
    yAxis:{ autoMax:true, autoMaxBuffer:0.12, strict:true },
    legentHint: legendConfig
  })
}

function getContribLineCfg(dk) {
  return JSON.stringify({
    type:"line", period:"slot", datasetKey:dk,
    fields:{ category:"name", total:"tokens" },
    breakdownKeys: BREAKDOWN_KEYS,
    stacked:true,
    seriesStyles: contributorsChartStyles.value,
    seriesLabels: contributorsChartLabels,
    axisLabelColor:"#475467", axisLabelFontSize:"10px",
    xAxis:{ minGridDistance:60 },
    tooltip:{ aggregated:{ enabled:true, mode:"codepen", valuePrefix:"$", valueSuffix:"" }},
    yAxis:{ autoMax:true, autoMaxBuffer:0.12, strict:true },
    line:{ strokeWidth:4 },
    legentHint: legendConfig
  })
}

// ===== INJECT CHART DATA =====
function injectChartData() {
  if (!window.chartsHandler) return
  const d = props.insightData
  if (!d) return

  // Map each section's data for chartsHandler
  const mapForChart = (arr) => {
    if (!Array.isArray(arr)) return []
    return arr.slice(0, 5).map(c => ({
      name: c.name || 'Unknown',
      subscription: c.subscription || 0,
      paytoview: c.paytoview || 0,
      merch: c.merch || 0,
      wishtender: c.wishtender || 0,
      customrequest: c.customrequest || 0,
      tokens: c.rawTotal || c.tokens || c.usdSpent || c.totalSpent || 0,
    }))
  }

  window.chartsHandler._configs.data['contrib-top']      = { slot: mapForChart(d.topContributors) }
  window.chartsHandler._configs.data['contrib-fans']     = { slot: mapForChart(d.topFans) }
  window.chartsHandler._configs.data['contrib-spenders'] = { slot: mapForChart(d.topOrderSpenders) }
}

// ===== CHART RENDERING =====
async function ensureReady() {
  if (!window.chartsHandler) return
  const hasContributorsData = window.chartsHandler._configs?.data && Object.keys(window.chartsHandler._configs.data).length > 0
  if (!hasContributorsData) await window.chartsHandler.loadChartConfigsAndData()
  injectChartData()
}

async function renderChart(chartId) {
  if (!window.chartsHandler) return
  const container = document.querySelector(`[data-chart-id="${chartId}"]`)
  if (!container) return
  try { window.chartsHandler.destroyChartInstance(chartId) } catch(e) {}
  container.removeAttribute('hidden')
  const host = container.querySelector('[amchart]')
  if (host) host.innerHTML = ''
  await window.chartsHandler.renderChartInstance(container)
}

const isChartRendering = ref(true)

async function renderAllCharts() {
  isChartRendering.value = true
  await ensureReady()
  await renderChart(`contrib-top-${activeContribViewMode.value}`)
  await renderChart(`contrib-fans-${activeFansViewMode.value}`)
  await renderChart(`contrib-spenders-${activeSpendersViewMode.value}`)
  isChartRendering.value = false
}

async function setContribView(v) {
  activeContribViewMode.value = v
  await nextTick()
  await renderChart(`contrib-top-${v}`)
}
async function setFansView(v) {
  activeFansViewMode.value = v
  await nextTick()
  await renderChart(`contrib-fans-${v}`)
}
async function setSpendersView(v) {
  activeSpendersViewMode.value = v
  await nextTick()
  await renderChart(`contrib-spenders-${v}`)
}

async function handlePeriodChange(val) {
  emit('update:period', val)
  await nextTick()
  await renderAllCharts()
}

watch(() => props.modelValue, async (isOpen) => {
  if (isOpen) { await nextTick(); await renderAllCharts() }
})

watch(() => props.insightData, async () => {
  if (props.modelValue) { await nextTick(); await renderAllCharts() }
}, { deep: true })

onMounted(async () => {
  if (props.modelValue) { await nextTick(); await renderAllCharts() }
})
</script>
