<template>
  <TrendPopup
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :period="period"
    @update:period="handlePeriodChange"
    title="Likes Insight"
    logo="https://i.ibb.co.com/rGSXLKX4/money.webp"
  >
    <div class="flex flex-col gap-6">
      
      <!-- LIKES INSIGHT CHART -->
      <div class="flex flex-col gap-3 p-4 rounded w-full h-[25rem] relative">
        <div class="flex justify-between items-center z-10 relative">
          <h3 class="text-base font-semibold text-[#101828] dark:text-[#dbd8d3]">Likes Insight</h3>
          <div class="flex gap-1 bg-[#F9FAFB] p-1 rounded-lg border border-[#EAECF0]">
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent" :class="likesView==='bar'?'bg-white shadow-sm':'bg-transparent'" @click="setLikesView('bar')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="likesView==='bar'?'#344054':'#98A2B3'" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </button>
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent" :class="likesView==='line'?'bg-white shadow-sm':'bg-transparent'" @click="setLikesView('line')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="likesView==='line'?'#344054':'#98A2B3'" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </button>
          </div>
        </div>

        <div v-if="hasData" class="absolute top-[40px] left-0 right-0 bottom-[30px]">
          <!-- Bar/Line Container -->
          <div data-chart-container data-chart-id="likes-chart-bar" :hidden="likesView!=='bar'||undefined" class="absolute inset-0"
            :data-chart-config='getLikesBarCfg("likes-chart")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="likes-chart-line" :hidden="likesView!=='line'||undefined" class="absolute inset-0"
            :data-chart-config='getLikesLineCfg("likes-chart")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else class="absolute inset-0 flex flex-col justify-center items-center gap-6 w-full text-center bg-light-bg-container dark:bg-dark-bg-container z-20">
          <img src="/dev/cdn/analytics/icons/icon-6.webp" alt="illustration" class="w-24 h-24 object-contain" />
          <div class="flex flex-col gap-1">
            <span class="text-base font-medium text-light-text-secondary dark:text-dark-text-secondary">No trend to show at the moment</span>
            <a href="#" class="text-sm text-primary-600 dark:text-primary-400 underline">Learn ways to earn</a>
          </div>
        </div>
      </div>

    </div>
  </TrendPopup>
</template>

<script setup>
import TrendPopup from './TrendPopup.vue'
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useDashboardAnalyticsStore } from '@/stores/useDashboardAnalyticsStore.js'

const props = defineProps({
  modelValue: Boolean,
  period: String,
  insightData: Object
})

const emit = defineEmits(['update:modelValue', 'update:period'])
const store = useDashboardAnalyticsStore()

// Active period mapping
const activePeriod = computed(() => {
  const p = (props.period || 'weekly').toLowerCase().trim()
  if (p === 'all-time' || p === 'alltime') return 'alltime'
  return p
})

const likesView = ref('bar')

const likesDataAvailable = ref(false)

const hasData = computed(() => {
  // First check: store has any likes data at all
  if (store.likes?.media != null) return true
  // Second check: data was loaded from bundle
  return likesDataAvailable.value
})

// ===== CONFIG HELPERS =====
const LEGEND = { enabled:true, class:"absolute -bottom-2 left-0 w-full flex flex-wrap justify-center gap-4", itemClass:"inline-flex items-center gap-1.5 px-2 py-1", markerClass:"w-2.5 h-2.5 rounded-full", labelClass:"text-slate-500 text-xs font-medium font-sans" }
const LIKES_STYLES = {
  media:   { color:"#4CC9F0", name:"Media Likes" },
  merch:   { color:"#4361EE", name:"Merch Likes" },
  profile: { color:"#7209B7", name:"Profile Likes" },
  feed:    { color:"#F72585", name:"Feed Likes" }
}
const LIKES_LABELS = { media:"Media", merch:"Merch", profile:"Profile", feed:"Feed" }
const BREAKDOWN_KEYS = ["media","merch","profile","feed"]

function getLikesBarCfg(dk) {
  return JSON.stringify({
    type:"bar", period:"slot", datasetKey:dk, fields:{category:"period",total:"total"}, 
    breakdownKeys:BREAKDOWN_KEYS, stacked:true, seriesStyles:LIKES_STYLES, seriesLabels:LIKES_LABELS, 
    bar:{widthPercent:35}, axisLabelColor:"#475467", axisLabelFontSize:"10px", xAxis:{minGridDistance:80}, 
    tooltip:{aggregated:{enabled:true,mode:"codepen",valuePrefix:"",valueSuffix:""}}, 
    yAxis:{autoMax:true,autoMaxBuffer:0.12,strict:true}, legentHint:LEGEND 
  })
}

function getLikesLineCfg(dk) {
  return JSON.stringify({
    type:"line", period:"slot", datasetKey:dk, fields:{category:"period",total:"total"}, 
    breakdownKeys:BREAKDOWN_KEYS, stacked:true, seriesStyles:LIKES_STYLES, seriesLabels:LIKES_LABELS, 
    axisLabelColor:"#475467", axisLabelFontSize:"10px", xAxis:{minGridDistance:80}, 
    tooltip:{aggregated:{enabled:true,mode:"codepen",valuePrefix:"",valueSuffix:""}}, 
    yAxis:{autoMax:true,autoMaxBuffer:0.12,strict:true}, line:{strokeWidth:4}, legentHint:LEGEND 
  })
}

// ===== INJECT CHART DATA =====
async function fetchLikesData() {
  try {
    // We fetch the bundle directly to get the history since store only holds latest daily
    const urlParams = new URLSearchParams(window.location.search)
    const source = urlParams.get('data') || 'full'
    const bundleFile = source === 'empty' ? '/chartsData.empty.json' : '/api/charts/456?nocache=1'
    const res = await fetch(bundleFile)
    const bundle = await res.json()
    return bundle.likes || {}
  } catch(e) {
    return {}
  }
}

async function injectChartData() {
  if (!window.chartsHandler) return
  const likesBundle = await fetchLikesData()
  const p = activePeriod.value
  let dataArr = likesBundle[p] || []
  
  if (p === 'alltime' && (!dataArr || dataArr.length === 0)) {
    dataArr = likesBundle['yearly'] || []
  }

  const mapForChart = (arr) => {
    if (!Array.isArray(arr)) return []
    return arr.map(item => ({
      period: item.period || '',
      media: item.media || 0,
      merch: item.merch || 0,
      profile: item.profile || 0,
      feed: item.feed || 0,
    }))
  }

  window.chartsHandler._configs.data['likes-chart'] = { slot: mapForChart(dataArr) }
  likesDataAvailable.value = dataArr.length > 0
}

// ===== CHART RENDERING =====
async function ensureReady() {
  if (!window.chartsHandler) return
  const hasCfg = window.chartsHandler._configs?.data && Object.keys(window.chartsHandler._configs.data).length > 0
  if (!hasCfg) await window.chartsHandler.loadChartConfigsAndData()
  await injectChartData()
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

async function renderCurrentCharts() {
  await ensureReady()
  await renderChart(`likes-chart-${likesView.value}`)
}

async function setLikesView(v) {
  likesView.value = v
  await nextTick()
  await renderChart(`likes-chart-${v}`)
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
