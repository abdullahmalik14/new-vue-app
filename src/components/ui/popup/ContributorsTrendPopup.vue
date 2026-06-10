<template>
  <TrendPopup
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :period="period"
    @update:period="handlePeriodChange"
    title="Contributors Insight"
    logo="https://i.ibb.co.com/rGSXLKX4/money.webp"
  >
    <div v-if="hasData" class="flex flex-col gap-4">

      <!-- Top Contributors -->
      <div class="flex flex-col gap-3 p-4 rounded-sm w-full h-[22rem] relative">
        <div class="flex justify-between items-center z-10 relative">
          <h3 class="text-base font-semibold text-[#101828] dark:text-[#dbd8d3]">Top Contributors</h3>
          <div class="flex gap-1 bg-[#F9FAFB] p-1 rounded-lg border border-[#EAECF0]">
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent" :class="contribView==='bar'?'bg-white shadow-sm':'bg-transparent'" @click="setContribView('bar')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="contribView==='bar'?'#344054':'#98A2B3'" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </button>
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent" :class="contribView==='line'?'bg-white shadow-sm':'bg-transparent'" @click="setContribView('line')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="contribView==='line'?'#344054':'#98A2B3'" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </button>
          </div>
        </div>

        <div v-if="insightData?.topContributors?.length > 0" class="absolute top-[40px] left-0 right-0 bottom-[10px]">
          <div data-chart-container data-chart-id="contrib-top-bar" :hidden="contribView!=='bar'||undefined" class="absolute inset-0"
            :data-chart-config='getContribBarCfg("contrib-top")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="contrib-top-line" :hidden="contribView!=='line'||undefined" class="absolute inset-0"
            :data-chart-config='getContribLineCfg("contrib-top")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
        </div>
        <div v-else class="flex flex-col justify-center items-center gap-6 w-full py-12 text-center">
          <img src="/dev/cdn/analytics/icons/icon-6.webp" alt="list" class="w-32 h-32 object-contain" />
          <div class="flex flex-col gap-1">
            <span class="text-base leading-6 text-light-text-secondary dark:text-dark-text-secondary">No trend to show at the moment</span>
            <a href="#" class="text-base leading-6 text-light-text-secondary dark:text-dark-text-secondary underline">Learn ways to earn</a>
          </div>
        </div>
      </div>

      <!-- Top Fans -->
      <div class="flex flex-col gap-3 p-4 rounded-sm w-full h-[22rem] relative">
        <div class="flex justify-between items-center z-10 relative">
          <h3 class="text-base font-semibold text-[#101828] dark:text-[#dbd8d3]">Top Fans</h3>
          <div class="flex gap-1 bg-[#F9FAFB] p-1 rounded-lg border border-[#EAECF0]">
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent" :class="fansView==='bar'?'bg-white shadow-sm':'bg-transparent'" @click="setFansView('bar')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="fansView==='bar'?'#344054':'#98A2B3'" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </button>
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent" :class="fansView==='line'?'bg-white shadow-sm':'bg-transparent'" @click="setFansView('line')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="fansView==='line'?'#344054':'#98A2B3'" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </button>
          </div>
        </div>

        <div v-if="insightData?.topFans?.length > 0" class="absolute top-[40px] left-0 right-0 bottom-[10px]">
          <div data-chart-container data-chart-id="contrib-fans-bar" :hidden="fansView!=='bar'||undefined" class="absolute inset-0"
            :data-chart-config='getContribBarCfg("contrib-fans")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="contrib-fans-line" :hidden="fansView!=='line'||undefined" class="absolute inset-0"
            :data-chart-config='getContribLineCfg("contrib-fans")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
        </div>
        <div v-else class="flex flex-col justify-center items-center gap-6 w-full py-12 text-center">
          <img src="/dev/cdn/analytics/icons/icon-6.webp" alt="list" class="w-32 h-32 object-contain" />
          <div class="flex flex-col gap-1">
            <span class="text-base leading-6 text-light-text-secondary dark:text-dark-text-secondary">No trend to show at the moment</span>
            <a href="#" class="text-base leading-6 text-light-text-secondary dark:text-dark-text-secondary underline">Learn ways to earn</a>
          </div>
        </div>
      </div>

      <!-- Top Order Spenders -->
      <div class="flex flex-col gap-3 p-4 rounded-sm  backdrop-blur-[25px] dark:bg-dark-bg-container w-full h-[22rem] relative">
        <div class="flex justify-between items-center z-10 relative">
          <h3 class="text-base font-semibold text-[#101828] dark:text-[#dbd8d3]">Top Order Spenders</h3>
          <div class="flex gap-1 bg-[#F9FAFB] p-1 rounded-lg border border-[#EAECF0]">
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent" :class="spendersView==='bar'?'bg-white shadow-sm':'bg-transparent'" @click="setSpendersView('bar')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="spendersView==='bar'?'#344054':'#98A2B3'" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </button>
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent" :class="spendersView==='line'?'bg-white shadow-sm':'bg-transparent'" @click="setSpendersView('line')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="spendersView==='line'?'#344054':'#98A2B3'" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </button>
          </div>
        </div>

        <div v-if="insightData?.topOrderSpenders?.length > 0" class="absolute top-[40px] left-0 right-0 bottom-[10px]">
          <div data-chart-container data-chart-id="contrib-spenders-bar" :hidden="spendersView!=='bar'||undefined" class="absolute inset-0"
            :data-chart-config='getContribBarCfg("contrib-spenders")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="contrib-spenders-line" :hidden="spendersView!=='line'||undefined" class="absolute inset-0"
            :data-chart-config='getContribLineCfg("contrib-spenders")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
        </div>
        <div v-else class="flex flex-col justify-center items-center gap-6 w-full py-12 text-center">
          <img src="/dev/cdn/analytics/icons/icon-6.webp" alt="list" class="w-32 h-32 object-contain" />
          <div class="flex flex-col gap-1">
            <span class="text-base leading-6 text-light-text-secondary dark:text-dark-text-secondary">No trend to show at the moment</span>
            <a href="#" class="text-base leading-6 text-light-text-secondary dark:text-dark-text-secondary underline">Learn ways to earn</a>
          </div>
        </div>
      </div>

    </div>
    <div v-else class="flex flex-col justify-center items-center gap-6 h-[400px] text-center w-full">
      <div class="relative flex justify-center items-center">
        <img src="/images/noTrendImg.png" alt="illustration" class="w-32 h-32 object-contain" />
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-base font-medium text-light-text-secondary dark:text-dark-text-secondary">No trend to show at the moment</span>
        <a href="#" class="text-xs text-light-text-secondary dark:text-dark-text-secondary underline">Learn ways to earn</a>
      </div>
    </div>
  </TrendPopup>
</template>

<script setup>
import TrendPopup from './TrendPopup.vue'
import { ref, computed, watch, nextTick, onMounted } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  period: String,
  insightData: Object
})

const emit = defineEmits(['update:modelValue', 'update:period'])

const hasData = computed(() => {
  if (!props.insightData) return false
  const topC = props.insightData.topContributors || []
  const topF = props.insightData.topFans || []
  const topS = props.insightData.topSpenders || []
  return topC.length > 0 || topF.length > 0 || topS.length > 0
})

// View toggle state per section
const contribView = ref('bar')
const fansView = ref('bar')
const spendersView = ref('bar')

// ===== CHART CONFIG HELPERS =====
const LEGEND = { enabled:true, class:"absolute -bottom-2 left-0 w-full flex flex-wrap justify-center gap-4", itemClass:"inline-flex items-center gap-1.5 px-2 py-1", markerClass:"w-2.5 h-2.5 rounded-full", labelClass:"text-slate-500 text-xs font-medium font-sans" }
const CATEGORY_STYLES = {
  subscription:  { color:"#4CC9F0", name:"Subscription" },
  paytoview:     { color:"#4361EE", name:"Pay to View" },
  merch:         { color:"#7209B7", name:"Merch" },
  wishtender:    { color:"#F72585", name:"Wishtender" },
  customrequest: { color:"#3A0CA3", name:"Custom Request" },
}
const CATEGORY_LABELS = { subscription:"Subscription", paytoview:"Pay to View", merch:"Merch", wishtender:"Wishtender", customrequest:"Custom Request" }
const BREAKDOWN_KEYS = ["subscription","paytoview","merch","wishtender","customrequest"]

function getContribBarCfg(dk) {
  return JSON.stringify({
    type:"bar", period:"slot", datasetKey:dk,
    fields:{ category:"name", total:"tokens" },
    breakdownKeys: BREAKDOWN_KEYS,
    stacked:true,
    seriesStyles: CATEGORY_STYLES,
    seriesLabels: CATEGORY_LABELS,
    bar:{ widthPercent:50 },
    axisLabelColor:"#475467", axisLabelFontSize:"10px",
    xAxis:{ minGridDistance:60 },
    tooltip:{ aggregated:{ enabled:true, mode:"codepen", valuePrefix:"$", valueSuffix:"" }},
    yAxis:{ autoMax:true, autoMaxBuffer:0.12, strict:true },
    legentHint: LEGEND
  })
}

function getContribLineCfg(dk) {
  return JSON.stringify({
    type:"line", period:"slot", datasetKey:dk,
    fields:{ category:"name", total:"tokens" },
    breakdownKeys: BREAKDOWN_KEYS,
    stacked:true,
    seriesStyles: CATEGORY_STYLES,
    seriesLabels: CATEGORY_LABELS,
    axisLabelColor:"#475467", axisLabelFontSize:"10px",
    xAxis:{ minGridDistance:60 },
    tooltip:{ aggregated:{ enabled:true, mode:"codepen", valuePrefix:"$", valueSuffix:"" }},
    yAxis:{ autoMax:true, autoMaxBuffer:0.12, strict:true },
    line:{ strokeWidth:4 },
    legentHint: LEGEND
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
  const hasData = window.chartsHandler._configs?.data && Object.keys(window.chartsHandler._configs.data).length > 0
  if (!hasData) await window.chartsHandler.loadChartConfigsAndData()
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

async function renderAllCharts() {
  await ensureReady()
  await renderChart(`contrib-top-${contribView.value}`)
  await renderChart(`contrib-fans-${fansView.value}`)
  await renderChart(`contrib-spenders-${spendersView.value}`)
}

async function setContribView(v) {
  contribView.value = v
  await nextTick()
  await renderChart(`contrib-top-${v}`)
}
async function setFansView(v) {
  fansView.value = v
  await nextTick()
  await renderChart(`contrib-fans-${v}`)
}
async function setSpendersView(v) {
  spendersView.value = v
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
