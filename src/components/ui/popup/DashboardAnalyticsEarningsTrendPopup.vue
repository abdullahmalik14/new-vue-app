<template>
  <DashboardAnalyticsTrendPopup :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" :period="period"
    @update:period="handlePeriodChange" title="Earnings Insight"
    logo="https://i.ibb.co.com/rGSXLKX4/money.webp">
    <div v-if="hasEarningsData" class="flex flex-col gap-4">

      <!-- row: stats -->
      <div class="flex w-full items-center py-6 ">
        <div class="flex-1 flex flex-col justify-center items-center gap-4 border-r border-gray-200 dark:border-gray-700">
          <h3 class="text-light-text-darkgray dark:text-white text-sm md:text-base font-semibold">
            Total Earnings
          </h3>
          <div class="flex flex-col justify-center items-center gap-2">
            <template v-if="insightData?.total">
              <div>
                <span class="text-gray-900 text-3xl md:text-4xl font-semibold font-['Poppins']">{{
                  insightData.total.toLocaleString() }} </span>
                <span class="text-gray-900 text-lg md:text-xl font-bold font-['Poppins']">USD</span>
              </div>
            </template>
            <span v-else
              class="text-gray-900 tracking-[-0.045rem] text-3xl font-semibold md:text-4xl">--</span>
            <div class="inline-flex items-center gap-2" v-if="earningsPctChange !== null">
              <div class="flex justify-center items-center gap-1">
                <img v-if="earningsPctChange >= 0" src="/dev/cdn/analytics/icons/icon-4.webp" alt="trend-up" class="h-4 w-4" />
                <div :class="earningsPctChange >= 0 ? 'text-emerald-700' : 'text-red-500'" class="text-center text-xs md:text-sm font-medium font-['Poppins']">{{ earningsPctChange >= 0 ? '+' : '' }}{{ earningsPctChange }}%</div>
              </div>
              <div class="text-slate-500 text-xs font-normal font-['Poppins']">{{ formatComparisonLabel(period) }}</div>
            </div>
          </div>
        </div>

        <div class="flex-1 flex flex-col justify-center items-center gap-4">
          <h3 class="text-light-text-darkgray dark:text-white text-sm md:text-base font-semibold">
            Tokens Received
          </h3>
          <div class="flex flex-col justify-center items-center gap-2">
            <template v-if="insightData?.totalTokens">
              <div class="text-gray-900 text-3xl md:text-4xl font-semibold font-['Poppins']">
                {{ insightData.totalTokens.toLocaleString() }}
              </div>
            </template>
            <span v-else
              class="text-gray-900 tracking-[-0.045rem] text-3xl font-semibold md:text-4xl">--</span>
            <div class="inline-flex items-center gap-2" v-if="tokensPctChange !== null">
              <div class="flex justify-center items-center gap-1">
                <img v-if="tokensPctChange >= 0" src="/dev/cdn/analytics/icons/icon-4.webp" alt="trend-up" class="h-4 w-4" />
                <div :class="tokensPctChange >= 0 ? 'text-emerald-700' : 'text-red-500'" class="text-center text-xs md:text-sm font-medium font-['Poppins']">{{ tokensPctChange >= 0 ? '+' : '' }}{{ tokensPctChange }}%</div>
              </div>
              <div class="text-slate-500 text-xs font-normal font-['Poppins']">{{ formatComparisonLabel(period) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- row: charts -->
      <div :class="isDaily ? 'flex flex-row gap-6' : 'flex flex-col gap-8'" class="w-full mt-2">
        <!-- Sales Insight -->
        <div :class="isDaily ? 'flex-1' : 'w-full'" class="flex flex-col gap-4 h-[25rem] relative">
          <div class="flex justify-between items-center gap-2">
            <h3 class="text-light-text-darkgray dark:text-white text-lg font-semibold relative z-10">{{ $t('dashboard.analytics.trends.salesInsights') }}</h3>
            <div v-if="!isDaily" class="flex gap-1 bg-[#F9FAFB] p-1 rounded-lg border border-[#EAECF0] relative z-10">
              <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent" :class="activeSalesViewMode==='bar'?'bg-white shadow-sm':'bg-transparent'" @click="setSalesView('bar')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="activeSalesViewMode==='bar'?'#344054':'#98A2B3'" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </button>
              <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent" :class="activeSalesViewMode==='line'?'bg-white shadow-sm':'bg-transparent'" @click="setSalesView('line')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="activeSalesViewMode==='line'?'#344054':'#98A2B3'" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </button>
            </div>
          </div>
          <div class="absolute top-[40px] left-0 right-0 bottom-[30px]">
             <!-- DAILY = DONUT (Linden: 'Day is a doughnut graph!') -->
             <div data-chart-container data-chart-id="sales-daily-donut" :hidden="!isDaily||undefined" class="absolute inset-0"
               :data-chart-config='JSON.stringify({type:"donut",period:"slot",datasetKey:"sales-donut",fields:{category:"name",total:"value"},categoryKeyMap:{subscription:"subscription",paytoview:"paytoview",merch:"merch",wishtender:"wishtender",customrequest:"customrequest"},seriesStyles:salesChartStyles,legentHint:legendConfig})'>
               <div amchart data-role="chart" style="width:100%;height:100%;"></div>
             </div>
             <div data-chart-container data-chart-id="sales-weekly-bar" :hidden="isDaily||!(activePeriod==='weekly'&&activeSalesViewMode==='bar')||undefined" class="absolute inset-0" :data-chart-config='getSalesBarCfg("sales-weekly")'><div amchart data-role="chart" style="width:100%;height:100%;"></div></div>
             <div data-chart-container data-chart-id="sales-weekly-line" :hidden="isDaily||!(activePeriod==='weekly'&&activeSalesViewMode==='line')||undefined" class="absolute inset-0" :data-chart-config='getSalesLineCfg("sales-weekly")'><div amchart data-role="chart" style="width:100%;height:100%;"></div></div>
             <div data-chart-container data-chart-id="sales-monthly-bar" :hidden="isDaily||!(activePeriod==='monthly'&&activeSalesViewMode==='bar')||undefined" class="absolute inset-0" :data-chart-config='getSalesBarCfg("sales-monthly")'><div amchart data-role="chart" style="width:100%;height:100%;"></div></div>
             <div data-chart-container data-chart-id="sales-monthly-line" :hidden="isDaily||!(activePeriod==='monthly'&&activeSalesViewMode==='line')||undefined" class="absolute inset-0" :data-chart-config='getSalesLineCfg("sales-monthly")'><div amchart data-role="chart" style="width:100%;height:100%;"></div></div>
             <div data-chart-container data-chart-id="sales-yearly-bar" :hidden="isDaily||!(activePeriod==='yearly'&&activeSalesViewMode==='bar')||undefined" class="absolute inset-0" :data-chart-config='getSalesBarCfg("sales-yearly")'><div amchart data-role="chart" style="width:100%;height:100%;"></div></div>
             <div data-chart-container data-chart-id="sales-yearly-line" :hidden="isDaily||!(activePeriod==='yearly'&&activeSalesViewMode==='line')||undefined" class="absolute inset-0" :data-chart-config='getSalesLineCfg("sales-yearly")'><div amchart data-role="chart" style="width:100%;height:100%;"></div></div>
             <div data-chart-container data-chart-id="sales-alltime-bar" :hidden="isDaily||!(activePeriod==='alltime'&&activeSalesViewMode==='bar')||undefined" class="absolute inset-0" :data-chart-config='getSalesBarCfg("sales-alltime")'><div amchart data-role="chart" style="width:100%;height:100%;"></div></div>
             <div data-chart-container data-chart-id="sales-alltime-line" :hidden="isDaily||!(activePeriod==='alltime'&&activeSalesViewMode==='line')||undefined" class="absolute inset-0" :data-chart-config='getSalesLineCfg("sales-alltime")'><div amchart data-role="chart" style="width:100%;height:100%;"></div></div>
          </div>
        </div>

        <!-- Tokens Trend -->
        <div :class="isDaily ? 'flex-1' : 'w-full'" class="flex flex-col gap-4 h-[25rem] relative">
          <div class="flex justify-between items-center gap-2">
            <h3 class="text-light-text-darkgray dark:text-white text-lg font-semibold relative z-10">{{ $t('dashboard.analytics.trends.tokenInsights') }}</h3>
            <div v-if="!isDaily" class="flex gap-1 bg-[#F9FAFB] p-1 rounded-lg border border-[#EAECF0] relative z-10">
              <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent" :class="activeTokensViewMode==='bar'?'bg-white shadow-sm':'bg-transparent'" @click="setTokensView('bar')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="activeTokensViewMode==='bar'?'#344054':'#98A2B3'" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </button>
              <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent" :class="activeTokensViewMode==='line'?'bg-white shadow-sm':'bg-transparent'" @click="setTokensView('line')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="activeTokensViewMode==='line'?'#344054':'#98A2B3'" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </button>
            </div>
          </div>
          <div class="absolute top-[40px] left-0 right-0 bottom-[30px]">
             <!-- DAILY = DONUT (Linden: 'Day is a doughnut graph!') -->
             <div data-chart-container data-chart-id="tokens-daily-donut" :hidden="!isDaily||undefined" class="absolute inset-0"
               :data-chart-config='JSON.stringify({type:"donut",period:"slot",datasetKey:"tokens-donut",fields:{category:"name",total:"value"},categoryKeyMap:{tipTokens:"tipTokens",callTokens:"callTokens",chatTokens:"chatTokens",liveStreamTokens:"liveStreamTokens"},seriesStyles:tokensChartStyles,legentHint:legendConfig})'>
               <div amchart data-role="chart" style="width:100%;height:100%;"></div>
             </div>
             <div data-chart-container data-chart-id="tokens-weekly-bar" :hidden="isDaily||!(activePeriod==='weekly'&&activeTokensViewMode==='bar')||undefined" class="absolute inset-0" :data-chart-config='getTokensBarCfg("tokens-weekly")'><div amchart data-role="chart" style="width:100%;height:100%;"></div></div>
             <div data-chart-container data-chart-id="tokens-weekly-line" :hidden="isDaily||!(activePeriod==='weekly'&&activeTokensViewMode==='line')||undefined" class="absolute inset-0" :data-chart-config='getTokensLineCfg("tokens-weekly")'><div amchart data-role="chart" style="width:100%;height:100%;"></div></div>
             <div data-chart-container data-chart-id="tokens-monthly-bar" :hidden="isDaily||!(activePeriod==='monthly'&&activeTokensViewMode==='bar')||undefined" class="absolute inset-0" :data-chart-config='getTokensBarCfg("tokens-monthly")'><div amchart data-role="chart" style="width:100%;height:100%;"></div></div>
             <div data-chart-container data-chart-id="tokens-monthly-line" :hidden="isDaily||!(activePeriod==='monthly'&&activeTokensViewMode==='line')||undefined" class="absolute inset-0" :data-chart-config='getTokensLineCfg("tokens-monthly")'><div amchart data-role="chart" style="width:100%;height:100%;"></div></div>
             <div data-chart-container data-chart-id="tokens-yearly-bar" :hidden="isDaily||!(activePeriod==='yearly'&&activeTokensViewMode==='bar')||undefined" class="absolute inset-0" :data-chart-config='getTokensBarCfg("tokens-yearly")'><div amchart data-role="chart" style="width:100%;height:100%;"></div></div>
             <div data-chart-container data-chart-id="tokens-yearly-line" :hidden="isDaily||!(activePeriod==='yearly'&&activeTokensViewMode==='line')||undefined" class="absolute inset-0" :data-chart-config='getTokensLineCfg("tokens-yearly")'><div amchart data-role="chart" style="width:100%;height:100%;"></div></div>
             <div data-chart-container data-chart-id="tokens-alltime-bar" :hidden="isDaily||!(activePeriod==='alltime'&&activeTokensViewMode==='bar')||undefined" class="absolute inset-0" :data-chart-config='getTokensBarCfg("tokens-alltime")'><div amchart data-role="chart" style="width:100%;height:100%;"></div></div>
             <div data-chart-container data-chart-id="tokens-alltime-line" :hidden="isDaily||!(activePeriod==='alltime'&&activeTokensViewMode==='line')||undefined" class="absolute inset-0" :data-chart-config='getTokensLineCfg("tokens-alltime")'><div amchart data-role="chart" style="width:100%;height:100%;"></div></div>
          </div>
        </div>
      </div>

      <!-- row: {{ $t('dashboard.analytics.trends.topCountries') }} -->
      <div
        class="flex flex-col gap-4 p-4 rounded-sm ">
        <h3 class="text-light-text-darkgray dark:text-white text-lg font-semibold">{{ $t('dashboard.analytics.trends.topCountries') }}</h3>

        <div v-if="insightData?.topCountries?.length > 0" class="flex flex-col md:flex-row gap-8 w-full mt-2">
          <!-- Left: Table -->
          <div class="flex-1 min-w-0">
            <FlexTable :columns="earningsTopCountriesColumns" :rows="topCountriesWithRank"
              :theme="earningsTopCountriesTheme">
              <template #cell.media="{ row }">
                <div class="flex items-center gap-3 w-full px-3">
                  <div class="w-8 flex justify-start items-center shrink-0">
                    <span class="text-gray-900 text-xs font-semibold">{{ row.rank }}</span>
                  </div>
                  <span class="flex-1 text-gray-900 text-sm font-normal truncate">{{ row.country }}</span>
                </div>
              </template>
              <template #cell.sales="{ value }">
                <div class="flex justify-end items-center px-3 w-full">
                  <span class="text-gray-900 text-sm font-medium">{{ value }}</span>
                </div>
              </template>
            </FlexTable>
          </div>

          <!-- Right: Chart Placeholder -->
          <div class="flex-1 min-w-0 flex flex-col p-2 min-h-[300px] relative">
            <div data-chart-container data-chart-id="countries-map" class="absolute inset-0 top-0 w-full h-[calc(100%-30px)]"
              :data-chart-config='getCountriesMapCfg("countries-map")'>
              <div amchart data-role="chart" style="width:100%;height:100%;"></div>
            </div>
            
            <!-- Custom Heatmap Legend -->
            <div class="absolute bottom-0 left-0 w-full flex items-center  gap-3">
              <span class="text-[10px] text-gray-500 font-medium tracking-wide">0</span>
              <div class="w-40 h-2.5 " style="background: linear-gradient(to right, #00f2fe, #F72585, #3A0CA3);"></div>
              <span class="text-[10px] text-gray-500 font-medium tracking-wide">{{ insightData?.topCountries?.[0]?.sales || '0.00' }} USD</span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="flex flex-col justify-center items-center gap-6 w-full py-12 text-center">
          <div class="relative flex justify-center items-center">
            <img src="/images/noTrendImg.png" alt="illustration" class="w-32 h-32 object-contain" />
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-base font-medium text-light-text-secondary dark:text-dark-text-secondary">No trend to show
              at
              the moment</span>
            <a href="#" class="text-sm text-light-text-secondary dark:text-dark-text-secondary underline">Learn ways to
              earn</a>
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
import DashboardAnalyticsTrendPopup from './DashboardAnalyticsTrendPopup.vue'
import FlexTable from '@/dev/components/ui/table/FlexTable.vue'
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useDashboardAnalyticsStore } from '@/stores/useDashboardAnalyticsStore.js'

const props = defineProps({
  modelValue: Boolean,
  period: String,
  insightData: Object
})

const emit = defineEmits(['update:modelValue', 'update:period'])

const hasEarningsData = computed(() => props.insightData && props.insightData.total != null)

const analyticsStore = useDashboardAnalyticsStore()

// Linden: 'on open should be default bar chart for week'
const activePeriod = computed(() => {
  const p = (props.period || 'weekly').toLowerCase().trim()
  if (p === 'all-time' || p === 'alltime') return 'alltime'
  return p
})
const isDaily = computed(() => activePeriod.value === 'daily')

const activeSalesViewMode = ref('bar')
const activeTokensViewMode = ref('bar')
const topCountriesWithRank = computed(() => {
  return (props.insightData?.topCountries || []).map((c, i) => ({ ...c, rank: i + 1 }))
})

const legendConfig = { enabled:true, class:"absolute -bottom-2 left-0 w-full flex flex-wrap justify-center gap-4", itemClass:"inline-flex items-center gap-1.5 px-2 py-1", markerClass:"w-2.5 h-2.5 rounded-full", labelClass:"text-slate-500 text-xs font-medium font-sans" }
const salesChartStyles = { subscription:{color:"#4CC9F0",name:"Subscription"}, paytoview:{color:"#4361EE",name:"Pay to view"}, merch:{color:"#7209B7",name:"Merch"}, wishtender:{color:"#F72585",name:"Wishtender"}, customrequest:{color:"#94A3B8",name:"Custom request"} }
const salesChartLabels = { subscription:"Subscription", paytoview:"Pay to view", merch:"Merch", wishtender:"Wishtender", customrequest:"Custom request" }
const tokensChartStyles = { tipTokens:{color:"#4CC9F0",name:"Tip"}, callTokens:{color:"#4361EE",name:"Call"}, chatTokens:{color:"#7209B7",name:"Chat"}, liveStreamTokens:{color:"#F72585",name:"Live streaming"} }
const tokensChartLabels = { tipTokens:"Tip", callTokens:"Call", chatTokens:"Chat", liveStreamTokens:"Live streaming" }

function getSalesBarCfg(dk) { return JSON.stringify({ type:"bar", period:"slot", datasetKey:dk, fields:{category:"period",total:"total"}, breakdownKeys:["subscription","paytoview","merch","wishtender","customrequest"], stacked:true, seriesStyles:salesChartStyles, seriesLabels:salesChartLabels, bar:{widthPercent:35}, axisLabelColor:"#475467", axisLabelFontSize:"10px", xAxis:{minGridDistance:30}, tooltip:{aggregated:{enabled:true,mode:"codepen",valuePrefix:"$",valueSuffix:""}}, yAxis:{autoMax:true,autoMaxBuffer:0.12,strict:true}, legentHint:legendConfig }) }
function getSalesLineCfg(dk) { return JSON.stringify({ type:"line", period:"slot", datasetKey:dk, fields:{category:"period",total:"total"}, breakdownKeys:["subscription","paytoview","merch","wishtender","customrequest"], stacked:true, seriesStyles:salesChartStyles, seriesLabels:salesChartLabels, axisLabelColor:"#475467", axisLabelFontSize:"10px", xAxis:{minGridDistance:30}, tooltip:{aggregated:{enabled:true,mode:"codepen",valuePrefix:"$",valueSuffix:""}}, yAxis:{autoMax:true,autoMaxBuffer:0.12,strict:true}, line:{strokeWidth:4}, legentHint:legendConfig }) }

function getTokensBarCfg(dk) { return JSON.stringify({ type:"bar", period:"slot", datasetKey:dk, fields:{category:"period",total:"totalTokens"}, breakdownKeys:["tipTokens","callTokens","chatTokens","liveStreamTokens"], stacked:true, seriesStyles:tokensChartStyles, seriesLabels:tokensChartLabels, bar:{widthPercent:35}, axisLabelColor:"#475467", axisLabelFontSize:"10px", xAxis:{minGridDistance:30}, tooltip:{aggregated:{enabled:true,mode:"codepen",valuePrefix:"",valueSuffix:" tokens"}}, yAxis:{autoMax:true,autoMaxBuffer:0.12,strict:true}, legentHint:legendConfig }) }
function getTokensLineCfg(dk) { return JSON.stringify({ type:"line", period:"slot", datasetKey:dk, fields:{category:"period",total:"totalTokens"}, breakdownKeys:["tipTokens","callTokens","chatTokens","liveStreamTokens"], stacked:true, seriesStyles:tokensChartStyles, seriesLabels:tokensChartLabels, axisLabelColor:"#475467", axisLabelFontSize:"10px", xAxis:{minGridDistance:30}, tooltip:{aggregated:{enabled:true,mode:"codepen",valuePrefix:"",valueSuffix:" tokens"}}, yAxis:{autoMax:true,autoMaxBuffer:0.12,strict:true}, line:{strokeWidth:4}, legentHint:legendConfig }) }

function getCountriesMapCfg(dk) { return JSON.stringify({ type:"map", period:"slot", datasetKey:dk, groupColors: { "base": "#e8e8e8", "g1": "#3A0CA3", "g2": "#7209B7", "g3": "#F72585", "g4": "#4CC9F0", "g5": "#00f2fe" }, tooltip: { color: "#344054", valuePrefix: "USD$ " } }) }

function injectChartData() {
  if (!window.chartsHandler) return
  const b = analyticsStore.earnings || {}
  
  window.chartsHandler._configs.data['sales-daily']  = { slot: b.daily || [] }
  window.chartsHandler._configs.data['sales-weekly'] = { slot: b.weekly || [] }
  window.chartsHandler._configs.data['sales-monthly'] = { slot: b.monthly || [] }
  window.chartsHandler._configs.data['sales-yearly'] = { slot: b.yearly || [] }
  window.chartsHandler._configs.data['sales-alltime'] = { slot: b.alltime || [] }

  window.chartsHandler._configs.data['tokens-daily']  = { slot: b.daily || [] }
  window.chartsHandler._configs.data['tokens-weekly'] = { slot: b.weekly || [] }
  window.chartsHandler._configs.data['tokens-monthly'] = { slot: b.monthly || [] }
  window.chartsHandler._configs.data['tokens-yearly'] = { slot: b.yearly || [] }
  window.chartsHandler._configs.data['tokens-alltime'] = { slot: b.alltime || [] }

  const lastDaily = (b.daily || [])[0] || {}
  window.chartsHandler._configs.data['sales-donut'] = {
    slot: [
      { name: 'subscription',    value: lastDaily.subscription || 0 },
      { name: 'paytoview',       value: lastDaily.paytoview || 0 },
      { name: 'merch',           value: lastDaily.merch || 0 },
      { name: 'wishtender',      value: lastDaily.wishtender || 0 },
      { name: 'customrequest',   value: lastDaily.customrequest || 0 },
    ]
  }
  window.chartsHandler._configs.data['tokens-donut'] = {
    slot: [
      { name: 'tipTokens',         value: lastDaily.tipTokens || 0 },
      { name: 'callTokens',        value: lastDaily.callTokens || 0 },
      { name: 'chatTokens',        value: lastDaily.chatTokens || 0 },
      { name: 'liveStreamTokens',  value: lastDaily.liveStreamTokens || 0 },
    ]
  }

  const tc = topCountriesWithRank.value
  const mapData = tc.map(c => ({ id: c.iso || c.country, sales: c.salesRaw || c.salesUSD || (typeof c.sales === 'number' ? c.sales : 0) || c.earningsUSD || 0 }));
  
  const ALL_ISO_CODES = ["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BQ","BA","BW","BV","BR","IO","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","UM","US","UY","UZ","VU","VE","VN","VG","VI","WF","EH","YE","ZM","ZW"];
  const topIds = mapData.map(d => d.id);
  const baseData = ALL_ISO_CODES.filter(id => !topIds.includes(id)).map(id => ({ id, sales: 0 }));

  window.chartsHandler._configs.data['countries-map'] = { 
    slot: [
      { name: "base", data: baseData },
      { name: "g1", data: mapData.slice(0, 2) },
      { name: "g2", data: mapData.slice(2, 4) },
      { name: "g3", data: mapData.slice(4, 6) },
      { name: "g4", data: mapData.slice(6, 8) },
      { name: "g5", data: mapData.slice(8, 10) }
    ].filter(g => g.data.length > 0)
  }
}

async function ensureReady() {
  if (!window.chartsHandler) return
  const hasEarningsData = window.chartsHandler._configs?.data && Object.keys(window.chartsHandler._configs.data).length > 0
  if (!hasEarningsData) await window.chartsHandler.loadChartConfigsAndData()
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
  if (isDaily.value) {
    // Daily = DONUT (Linden's rule)
    await renderChart('sales-daily-donut')
    await renderChart('tokens-daily-donut')
  } else {
    const p = activePeriod.value
    await renderChart(`sales-${p}-${activeSalesViewMode.value}`)
    await renderChart(`tokens-${p}-${activeTokensViewMode.value}`)
  }
  if (props.insightData?.topCountries?.length > 0) {
    await renderChart('countries-map')
  }
}

async function setSalesView(v) { activeSalesViewMode.value = v; await nextTick(); if (!isDaily.value) await renderChart(`sales-${activePeriod.value}-${v}`) }
async function setTokensView(v) { activeTokensViewMode.value = v; await nextTick(); if (!isDaily.value) await renderChart(`tokens-${activePeriod.value}-${v}`) }

async function handlePeriodChange(val) {
  emit('update:period', val)
  await nextTick()
  await renderCurrentCharts()
}

watch(() => props.modelValue, async (isOpen) => { if (isOpen) { await nextTick(); await renderCurrentCharts() } })
watch(() => props.insightData, async () => { if (props.modelValue) { await nextTick(); await renderCurrentCharts() } }, { deep: true })
onMounted(async () => { if (props.modelValue) { await nextTick(); await renderCurrentCharts() } })

const earningsTopCountriesColumns = [
  { key: 'media', label: 'Media', grow: true, align: 'left' },
  { key: 'sales', label: 'Sales (USD)', basis: 'basis-32', align: 'right' }
]

const earningsTopCountriesTheme = {
  container: 'relative bg-transparent border-none w-full ',
  header: 'bg-transparent text-slate-600',
  headerRow: 'flex items-center',
  headerCell: 'px-3 py-3 text-xs font-medium border-b border-gray-500',
  row: 'flex items-center h-10 odd:bg-transparent even:bg-gray-100/80 transition-colors',
  cell: 'flex items-center h-10',
  footer: 'hidden'
}

// Compute dynamic percentage changes (replaces hardcoded 20%)
const earningsPctChange = computed(() => {
  const b = analyticsStore.earnings || {}
  const p = activePeriod.value
  const arr = b[p] || []
  if (arr.length < 2) return null
  const currentPeriodData = arr[arr.length - 1]?.total || 0
  const previousPeriodData = arr[arr.length - 2]?.total || 0
  if (previousPeriodData === 0) return null
  return Math.round(((currentPeriodData - previousPeriodData) / previousPeriodData) * 100)
})

const tokensPctChange = computed(() => {
  const b = analyticsStore.earnings || {}
  const p = activePeriod.value
  const arr = b[p] || []
  if (arr.length < 2) return null
  const currentPeriodData = arr[arr.length - 1]?.totalTokens || 0
  const previousPeriodData = arr[arr.length - 2]?.totalTokens || 0
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
