<template>
  <DashboardSharedTwoColLayout>
    <div class="relative flex flex-col mt-6 gap-6 md:p-[40px]">
      <AnalyticsDashboardDesktopHeaderPart />
      <!-- Overview Section -->
      <DashboardAnalyticsOverviewSection
        :is-analytics-refreshing="isAnalyticsRefreshing"
        @openSubscribersTrendPopup="openAnalyticsSubscribersTrendPopup"
        @openEarningsTrendPopup="openAnalyticsEarningsTrendPopup"
        @openFansTrendPopup="openAnalyticsFansTrendPopup"
        @openLikesTrendPopup="openAnalyticsLikesTrendPopup"
        @openContributorsTrendPopup="openAnalyticsContributorsTrendPopup"
        @refresh="refreshDashboardAnalytics"
      />

      <!-- Orders Received section -->
      <DashboardAnalyticsOrdersReceivedTable />

      <!-- Trends Section -->
      <DashboardAnalyticsTrendsSection />

      <!-- Subscribers popup -->
      <DashboardAnalyticsSubscribersTrendPopup v-if="isSubscribersTrendPopupOpen" v-model="isSubscribersTrendPopupOpen" v-model:period="analyticsSubscribersTrendPeriod"
        :insight-data="dashboardAnalyticsStore.subscriberInsights[analyticsSubscribersTrendPeriod === 'all-time' ? 'yearly' : analyticsSubscribersTrendPeriod.toLowerCase()] || { new: null, recurring: null }" />

      <!-- Earnings popup -->
      <DashboardAnalyticsEarningsTrendPopup v-if="isEarningsTrendPopupOpen" v-model="isEarningsTrendPopupOpen" v-model:period="analyticsEarningsTrendPeriod"
        :insight-data="dashboardAnalyticsStore.getEarningsViewModel(analyticsEarningsTrendPeriod)" />

      <!-- Fans popup -->
      <DashboardAnalyticsFansTrendPopup v-if="isFansTrendPopupOpen" v-model="isFansTrendPopupOpen" v-model:period="analyticsFansTrendPeriod" :insight-data="dashboardAnalyticsStore.getFansViewModel(analyticsFansTrendPeriod)" />

      <!-- Likes popup -->
      <DashboardAnalyticsLikesTrendPopup v-if="isLikesTrendPopupOpen" v-model="isLikesTrendPopupOpen" v-model:period="analyticsLikesTrendPeriod" :insight-data="dashboardAnalyticsStore.getLikesViewModel()" />

      <!-- Contributors popup -->
      <DashboardAnalyticsContributorsTrendPopup v-if="isContributorsTrendPopupOpen" v-model="isContributorsTrendPopupOpen" v-model:period="analyticsContributorsTrendPeriod"
        :insight-data="dashboardAnalyticsStore.getContributorsViewModel(analyticsContributorsTrendPeriod)" />

    </div>
  </DashboardSharedTwoColLayout>
</template>

<script setup>
import DashboardSharedTwoColLayout from '@/dev/templates/dashboard/shared/DashboardSharedTwoColLayout.vue'
import AnalyticsDashboardDesktopHeaderPart from '@/components/ui/nav/AnalyticsDashboardDesktopHeaderPart.vue'
import { useDashboardAnalyticsStore } from '@/stores/useDashboardAnalyticsStore.js'
import { FlowHandler } from '@/services/flow-system/FlowHandler'
import FlowRefreshManager from '@/services/flow-system/flowRefreshManager'
import { ANALYTICS_FETCH_FLOW } from '@/config/dashboardAnalyticsFlows.js'
import { ref, onMounted, onUnmounted } from 'vue'
import DashboardAnalyticsEarningsTrendPopup from '@/components/ui/popup/DashboardAnalyticsEarningsTrendPopup.vue'
import DashboardAnalyticsSubscribersTrendPopup from '@/components/ui/popup/DashboardAnalyticsSubscribersTrendPopup.vue'
import DashboardAnalyticsFansTrendPopup from '@/components/ui/popup/DashboardAnalyticsFansTrendPopup.vue'
import DashboardAnalyticsLikesTrendPopup from '@/components/ui/popup/DashboardAnalyticsLikesTrendPopup.vue'
import DashboardAnalyticsContributorsTrendPopup from '@/components/ui/popup/DashboardAnalyticsContributorsTrendPopup.vue'
import DashboardAnalyticsOrdersReceivedTable from '@/dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsOrdersReceivedTable.vue'
import DashboardAnalyticsTrendsSection from '@/dev/components/ui/section/dashboard/DashboardAnalyticsTrendsSection.vue'
import DashboardAnalyticsOverviewSection from '@/dev/components/ui/section/dashboard/DashboardAnalyticsOverviewSection.vue'

const dashboardAnalyticsStore = useDashboardAnalyticsStore()

const analyticsSubscribersTrendPeriod = ref('weekly')
const analyticsEarningsTrendPeriod = ref('weekly')
const analyticsFansTrendPeriod = ref('weekly')
const analyticsLikesTrendPeriod = ref('weekly')
const analyticsContributorsTrendPeriod = ref('weekly')

const isSubscribersTrendPopupOpen = ref(false)
function openAnalyticsSubscribersTrendPopup() {
  isSubscribersTrendPopupOpen.value = true
}

const isEarningsTrendPopupOpen = ref(false)
function openAnalyticsEarningsTrendPopup() {
  isEarningsTrendPopupOpen.value = true
}

const isFansTrendPopupOpen = ref(false)
function openAnalyticsFansTrendPopup() {
  isFansTrendPopupOpen.value = true
}

const isLikesTrendPopupOpen = ref(false)
function openAnalyticsLikesTrendPopup() {
  isLikesTrendPopupOpen.value = true
}

const isContributorsTrendPopupOpen = ref(false)
function openAnalyticsContributorsTrendPopup() {
  isContributorsTrendPopupOpen.value = true
}

const isAnalyticsRefreshing = ref(false)

async function refreshDashboardAnalytics() {
  if (isAnalyticsRefreshing.value) return
  isAnalyticsRefreshing.value = true
  try {
    await FlowHandler.run(ANALYTICS_FETCH_FLOW, { source: 'full' })
  } finally {
    isAnalyticsRefreshing.value = false
  }
}

onMounted(() => {
  if (window.performanceTracker) {
    window.performanceTracker.step({
      flowName: 'AnalyticsRender',
      stepName: 'DashboardAnalyticsPage Mounted',
      status: 'success'
    });
  }

  FlowRefreshManager.startFromRegistry(ANALYTICS_FETCH_FLOW, { source: 'full' })
})

onUnmounted(() => {
  FlowRefreshManager.stop(ANALYTICS_FETCH_FLOW)
})

</script>
