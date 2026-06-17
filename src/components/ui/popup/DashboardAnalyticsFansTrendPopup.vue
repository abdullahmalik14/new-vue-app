<template>
  <DashboardAnalyticsTrendPopup :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" :period="period"
    @update:period="handlePeriodChange" title="Fans Insight"
    logo="https://i.ibb.co.com/rGSXLKX4/money.webp">
    <div v-if="hasFansData" class="flex flex-col gap-4">
      <!-- row: stats -->
      <div class="grid grid-cols-2">
        <!-- New Followers -->
        <div
          class="flex w-full flex-col gap-4 rounded-[0.125rem] bg-light-bg-container p-4 text-center backdrop-blur-[25px] dark:border-dark-border-primary dark:bg-dark-bg-container">
          <h3 class="text-light-text-darkgray dark:text-white text-base leading-7 md:text-lg font-semibold">New
            Followers</h3>
          <div class="flex flex-col justify-center items-center gap-4">
            <span
              class="text-gray-900 tracking-[-0.045rem] text-3xl leading-[2.375rem] font-semibold md:text-4xl md:leading-[2.75rem]">
              {{ insightData?.newFollowers != null ? insightData.newFollowers.toLocaleString() : '--' }}
            </span>
            <div class="inline-flex items-center gap-2" v-if="followersPct !== null">
              <div class="w-14 flex justify-center items-center gap-1">
                <img v-if="followersPct >= 0" :src="icon4Url || ''" alt="trend-up" class="h-5 w-5" />
                <div :class="followersPct >= 0 ? 'text-emerald-700' : 'text-red-500'" class="text-center text-sm font-medium font-['Poppins'] leading-5">{{ followersPct >= 0 ? '+' : '' }}{{ followersPct }}%</div>
              </div>
              <div class="text-slate-700 text-xs font-normal font-['Poppins'] leading-4">{{ formatComparisonLabel(period) }}</div>
            </div>
          </div>
        </div>

        <!-- Total Profile Visit -->
        <div
          class="flex w-full flex-col gap-4 rounded-[0.125rem] bg-light-bg-container p-4 text-center backdrop-blur-[25px] dark:bg-dark-bg-container">
          <h3 class="text-light-text-darkgray dark:text-white text-base leading-7 md:text-lg font-semibold">Total
            Profile Visit</h3>
          <div class="flex flex-col justify-center items-center gap-4">
            <span
              class="text-gray-900 tracking-[-0.045rem] text-3xl leading-[2.375rem] font-semibold md:text-4xl md:leading-[2.75rem]">
              {{ insightData?.profileVisit != null ? insightData.profileVisit.toLocaleString() : '--' }}
            </span>
            <div class="inline-flex items-center gap-2" v-if="visitsPct !== null">
              <div class="w-14 flex justify-center items-center gap-1">
                <img v-if="visitsPct >= 0" :src="icon4Url || ''" alt="trend-up" class="h-5 w-5" />
                <div :class="visitsPct >= 0 ? 'text-emerald-700' : 'text-red-500'" class="text-center text-sm font-medium font-['Poppins'] leading-5">{{ visitsPct >= 0 ? '+' : '' }}{{ visitsPct }}%</div>
              </div>
              <div class="text-slate-700 text-xs font-normal font-['Poppins'] leading-4">{{ formatComparisonLabel(period) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- row: Followers/Visit Trend Chart (hidden for Daily) -->
      <div v-if="!isDaily" class="flex flex-col gap-3 p-4 bg-light-bg-container dark:bg-dark-bg-container rounded w-full h-[25rem] relative">
        <div class="flex justify-between items-center z-10 relative">
          <h3 class="text-base font-semibold text-[#101828] dark:text-[#dbd8d3]">{{ $t('dashboard.analytics.trends.followersAndVisits') }}</h3>
          <div class="flex gap-1 bg-[#F9FAFB] p-1 rounded-lg border border-[#EAECF0]">
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent" :class="activeTrendViewMode==='bar'?'bg-white shadow-sm':'bg-transparent'" @click="setTrendView('bar')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="activeTrendViewMode==='bar'?'#344054':'#98A2B3'" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </button>
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent" :class="activeTrendViewMode==='line'?'bg-white shadow-sm':'bg-transparent'" @click="setTrendView('line')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="activeTrendViewMode==='line'?'#344054':'#98A2B3'" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </button>
          </div>
        </div>

        <div class="absolute top-[40px] left-0 right-0 bottom-[30px]">
          <!-- Weekly bar/line -->
          <div data-chart-container data-chart-id="fans-weekly-bar" :hidden="!(activePeriod==='weekly'&&activeTrendViewMode==='bar')||undefined" class="absolute inset-0"
            :data-chart-config='getFansBarCfg("fans-weekly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="fans-weekly-line" :hidden="!(activePeriod==='weekly'&&activeTrendViewMode==='line')||undefined" class="absolute inset-0"
            :data-chart-config='getFansLineCfg("fans-weekly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>

          <!-- Monthly bar/line -->
          <div data-chart-container data-chart-id="fans-monthly-bar" :hidden="!(activePeriod==='monthly'&&activeTrendViewMode==='bar')||undefined" class="absolute inset-0"
            :data-chart-config='getFansBarCfg("fans-monthly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="fans-monthly-line" :hidden="!(activePeriod==='monthly'&&activeTrendViewMode==='line')||undefined" class="absolute inset-0"
            :data-chart-config='getFansLineCfg("fans-monthly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>

          <!-- Yearly bar/line -->
          <div data-chart-container data-chart-id="fans-yearly-bar" :hidden="!(activePeriod==='yearly'&&activeTrendViewMode==='bar')||undefined" class="absolute inset-0"
            :data-chart-config='getFansBarCfg("fans-yearly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="fans-yearly-line" :hidden="!(activePeriod==='yearly'&&activeTrendViewMode==='line')||undefined" class="absolute inset-0"
            :data-chart-config='getFansLineCfg("fans-yearly")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>

          <!-- Alltime bar/line -->
          <div data-chart-container data-chart-id="fans-alltime-bar" :hidden="!(activePeriod==='alltime'&&activeTrendViewMode==='bar')||undefined" class="absolute inset-0"
            :data-chart-config='getFansBarCfg("fans-alltime")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="fans-alltime-line" :hidden="!(activePeriod==='alltime'&&activeTrendViewMode==='line')||undefined" class="absolute inset-0"
            :data-chart-config='getFansLineCfg("fans-alltime")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
        </div>
      </div>

      <!-- row: charts -->
      <div class="flex flex-col md:flex-row gap-4">
        <!-- {{ $t('dashboard.analytics.trends.trafficSource') }} -->
        <div class="flex flex-col gap-4 p-4 w-full h-[25.875rem] bg-light-bg-container dark:bg-dark-bg-container relative">
          <div class="flex justify-between items-center gap-2 relative z-10">
            <h3 class="text-light-text-darkgray dark:text-white text-lg font-semibold">{{ $t('dashboard.analytics.trends.trafficSource') }}</h3>
          </div>
          <div class="absolute top-[60px] left-0 right-0 bottom-4 p-2">
            <div data-chart-container data-chart-id="traffic-sources-donut" class="w-full h-full"
              :data-chart-config='getSourcesDonutCfg("traffic-sources-donut")'>
              <div amchart data-role="chart" style="width:100%;height:100%;"></div>
            </div>
          </div>
        </div>

        <!-- {{ $t('dashboard.analytics.trends.topCountries') }} -->
        <div
          class="flex flex-col gap-4 p-4 w-full h-[25.875rem] bg-light-bg-container dark:bg-dark-bg-container overflow-hidden">
          <div class="flex justify-between items-center gap-2">
            <h3 class="text-light-text-darkgray dark:text-white text-lg font-semibold">{{ $t('dashboard.analytics.trends.topCountries') }}</h3>
          </div>

          <div v-if="insightData?.topCountries?.length > 0" class="w-full h-full overflow-hidden">
            <FlexTable :columns="fansTopCountriesColumns" :rows="insightData.topCountries"
              :theme="fansTopCountriesTheme">
              <template #cell.media="{ row }">
                <div class="flex items-center gap-3 w-full px-3">
                  <div class="w-8 h-8 rounded-sm bg-black flex justify-center items-center shrink-0">
                    <span class="text-white text-xs font-semibold">{{ row.rank }}</span>
                  </div>
                  <span class="flex-1 text-gray-900 text-sm font-normal truncate">{{ row.country }}</span>
                </div>
              </template>
              <template #cell.visits="{ value }">
                <div class="flex justify-end items-center px-3 w-full">
                  <span class="text-gray-900 text-sm font-medium">{{ value }}</span>
                </div>
              </template>
            </FlexTable>
          </div>

          <div v-else class="flex flex-col justify-center items-center gap-6 h-full text-center py-6">
            <div class="relative flex justify-center items-center">
              <img src="/images/noTrendImg.png" alt="illustration" class="w-32 h-32 object-contain" />
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-base font-medium text-light-text-secondary dark:text-dark-text-secondary">No trend to
                show at the
                moment</span>
              <a href="#" class="text-xs text-light-text-secondary dark:text-dark-text-secondary underline">Learn ways
                to earn</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="flex flex-col justify-center items-center gap-6 h-[400px] text-center w-full">
      <div class="relative flex justify-center items-center">
        <img src="/images/noTrendImg.png" alt="illustration" class="w-32 h-32 object-contain" />
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-base font-medium text-light-text-secondary dark:text-dark-text-secondary">{{ $t('dashboard.analytics.trends.noTrend') }}</span>
        <a href="#" class="text-xs text-light-text-secondary dark:text-dark-text-secondary underline">{{ $t('dashboard.analytics.trends.learnToEarn') }}</a>
      </div>
    </div>
  </DashboardAnalyticsTrendPopup>
</template>

<script setup> 
import { useAssetUrl } from '@/composables/useAssetUrl.js'
const { url: icon4Url } = useAssetUrl('dashboard.analytics.icon4')

import DashboardAnalyticsTrendPopup from './DashboardAnalyticsTrendPopup.vue'
import FlexTable from '@/dev/components/ui/table/FlexTable.vue'
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

const hasFansData = computed(() => props.insightData && props.insightData.newFollowers != null)

const analyticsStore = useDashboardAnalyticsStore()

const activePeriod = computed(() => {
  // Linden: 'on open should be default bar chart for week'
  const p = (props.period || 'weekly').toLowerCase().trim()
  if (p === 'all-time' || p === 'alltime') return 'alltime'
  return p
})
const isDaily = computed(() => activePeriod.value === 'daily')

const activeTrendViewMode = ref('bar')

const legendConfig = { enabled:true, class:"absolute -bottom-2 left-0 w-full flex flex-wrap justify-center gap-4", itemClass:"inline-flex items-center gap-1.5 px-2 py-1", markerClass:"w-2.5 h-2.5 rounded-full", labelClass:"text-slate-500 text-xs font-medium font-sans" }
const fansChartStyles = computed(() => ({ profileVisits: { color: "#4CC9F0", name: t('dashboard.analytics.legends.profileVisit', 'Profile Visit') }, newFollowers: { color: "#4361EE", name: t('dashboard.analytics.legends.newFollowers', 'New Followers') } }))
const fansChartLabels = { profileVisits: "Profile Visit", newFollowers: "New Followers" }

function getFansBarCfg(dk) {
  return JSON.stringify({ type:"bar", period:"slot", datasetKey:dk, fields:{category:"period",total:"total"}, breakdownKeys:["newFollowers","profileVisits"], stacked:true, seriesStyles:fansChartStyles.value, seriesLabels:fansChartLabels, bar:{widthPercent:35}, axisLabelColor:"#475467", axisLabelFontSize:"10px", xAxis:{minGridDistance:80}, tooltip:{aggregated:{enabled:true,mode:"codepen",valuePrefix:"",valueSuffix:""}}, yAxis:{autoMax:true,autoMaxBuffer:0.12,strict:true}, legentHint:legendConfig })
}
function getFansLineCfg(dk) {
  return JSON.stringify({ type:"line", period:"slot", datasetKey:dk, fields:{category:"period",total:"total"}, breakdownKeys:["newFollowers","profileVisits"], stacked:false, seriesStyles:fansChartStyles.value, seriesLabels:fansChartLabels, axisLabelColor:"#475467", axisLabelFontSize:"10px", xAxis:{minGridDistance:80}, tooltip:{aggregated:{enabled:true,mode:"codepen",valuePrefix:"",valueSuffix:""}}, yAxis:{autoMax:true,autoMaxBuffer:0.12,strict:true}, line:{strokeWidth:4}, legentHint:legendConfig })
}

function getSourcesDonutCfg(dk) {
  const styles = {
    Instagram: { color:"#E1306C", name:"Instagram" },
    TikTok: { color:"#000000", name:"TikTok" },
    Twitter: { color:"#1DA1F2", name:"Twitter" },
    Reddit: { color:"#FF4500", name:"Reddit" },
    Direct: { color:"#4CC9F0", name:"Direct" },
    Other: { color:"#98A2B3", name:"Other" }
  }
  const keyMap = { Instagram:"Instagram", TikTok:"TikTok", Twitter:"Twitter", Reddit:"Reddit", Direct:"Direct", Other:"Other" }
  return JSON.stringify({
    type:"donut", period:"slot", datasetKey:dk, fields:{category:"source",total:"value"},
    categoryKeyMap: keyMap, seriesStyles: styles,
    legentHint:{enabled:true,class:"absolute -bottom-2 left-0 w-full flex flex-wrap justify-center gap-4",itemClass:"inline-flex items-center gap-1.5 px-2 py-1",markerClass:"w-2.5 h-2.5 rounded-full",labelClass:"text-slate-500 text-xs font-medium font-sans"}
  })
}

function injectChartData() {
  if (!window.chartsHandler) return
  const sources = props.insightData?.sources || []
  window.chartsHandler._configs.data['traffic-sources-donut'] = { slot: sources }

  // Inject fans trend data per period
  const fi = analyticsStore.fanInsights || {}
  const mapFansData = (arr) => (arr || []).map(item => ({
    period: item.period || '',
    newFollowers: item.newFollowers || 0,
    profileVisits: item.profileVisits || 0,
    total: (item.newFollowers || 0) + (item.profileVisits || 0)
  }))
  window.chartsHandler._configs.data['fans-weekly']  = { slot: mapFansData(fi.weekly) }
  window.chartsHandler._configs.data['fans-monthly'] = { slot: mapFansData(fi.monthly) }
  window.chartsHandler._configs.data['fans-yearly']  = { slot: mapFansData(fi.yearly) }
  window.chartsHandler._configs.data['fans-alltime'] = { slot: mapFansData(fi.alltime) }
}

async function ensureReady() {
  if (!window.chartsHandler) return
  const hasFansData = window.chartsHandler._configs?.data && Object.keys(window.chartsHandler._configs.data).length > 0
  if (!hasFansData) await window.chartsHandler.loadChartConfigsAndData()
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

async function renderCurrentCharts() {
  await ensureReady()
  await renderChart('traffic-sources-donut')
  if (!isDaily.value) {
    const p = activePeriod.value
    await renderChart(`fans-${p}-${activeTrendViewMode.value}`)
  }
}

async function setTrendView(v) {
  activeTrendViewMode.value = v
  await nextTick()
  if (!isDaily.value) await renderChart(`fans-${activePeriod.value}-${v}`)
}

async function handlePeriodChange(val) {
  emit('update:period', val)
  await nextTick()
  await renderCurrentCharts()
}

watch(() => props.modelValue, async (isOpen) => { if (isOpen) { await nextTick(); await renderCurrentCharts() } })
onMounted(async () => { if (props.modelValue) { await nextTick(); await renderCurrentCharts() } })

const fansTopCountriesColumns = [
  { key: 'media', label: 'Countries', grow: true, align: 'left' },
  { key: 'visits', label: 'Profile Visits', basis: 'basis-32', align: 'right' }
]

const fansTopCountriesTheme = {
  container: 'relative bg-transparent border-none w-full ',
  header: 'bg-transparent text-slate-600',
  headerRow: 'flex items-center',
  headerCell: 'px-3 py-3 text-xs font-medium border-b border-gray-500',
  row: 'flex items-center h-10 odd:bg-transparent even:bg-gray-100/80 transition-colors',
  cell: 'flex items-center h-10',
  footer: 'hidden'
}

// Compute dynamic percentage changes (replaces hardcoded 20%)
const fanInsightsData = computed(() => analyticsStore.fanInsights || {})

const followersPct = computed(() => {
  const b = fanInsightsData.value
  const p = activePeriod.value
  const arr = b[p] || []
  if (arr.length < 2) return null
  const currentPeriodData = arr[arr.length - 1]?.newFollowers || 0
  const previousPeriodData = arr[arr.length - 2]?.newFollowers || 0
  if (previousPeriodData === 0) return null
  return Math.round(((currentPeriodData - previousPeriodData) / previousPeriodData) * 100)
})

const visitsPct = computed(() => {
  const b = fanInsightsData.value
  const p = activePeriod.value
  const arr = b[p] || []
  if (arr.length < 2) return null
  const currentPeriodData = arr[arr.length - 1]?.profileVisits || 0
  const previousPeriodData = arr[arr.length - 2]?.profileVisits || 0
  if (previousPeriodData === 0) return null
  return Math.round(((currentPeriodData - previousPeriodData) / previousPeriodData) * 100)
})

function formatComparisonLabel(period) {
  switch ((period || '').toLowerCase()) {
    case 'daily': return 'vs last 24 hour'
    case 'weekly': return 'vs last week'
    case 'monthly': return 'vs last 30 days'
    case 'yearly': return 'vs last year'
    default: return 'vs last year'
  }
}
</script>
