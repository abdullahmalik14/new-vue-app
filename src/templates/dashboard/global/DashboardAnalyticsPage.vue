<template>
  <DashboardSharedTwoColLayout>
    <div class="relative flex flex-col mt-6 gap-6 md:p-[40px]">
      <DashboardSharedHeader v-if="!hideLayout" />
      <DashboardAnalyticsWelcomeBanner />
      
      <!-- Analytics Content Wrapper -->
      <div class="flex flex-col gap-6 transition-opacity duration-200" :class="{ 'opacity-50 pointer-events-none': isAnalyticsRefreshing, 'opacity-100': !isAnalyticsRefreshing }">
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
      </div>

      <!-- Subscribers popup -->
      <DashboardAnalyticsSubscribersTrendPopup v-if="isSubscribersTrendPopupOpen" v-model="isSubscribersTrendPopupOpen" v-model:period="analyticsSubscribersTrendPeriod"
        :insight-data="dashboardAnalyticsStore.getSubscribersViewModel(analyticsSubscribersTrendPeriod)" />

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

      <!-- Toast Notification -->
      <transition enter-active-class="transition duration-300 ease-out" enter-from-class="transform translate-y-2 opacity-0" enter-to-class="transform translate-y-0 opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="transform translate-y-0 opacity-100" leave-to-class="transform translate-y-2 opacity-0">
        <div v-if="isAnalyticsRefreshing" class="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-[#1D1D20] text-white px-5 py-3 rounded-xl shadow-lg border border-[#333]">
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm font-medium">Fetching Analytics Data...</span>
        </div>
      </transition>
    </div>
  </DashboardSharedTwoColLayout>
</template>

<script setup>
import DashboardSharedTwoColLayout from '@/dev/templates/dashboard/shared/DashboardSharedTwoColLayout.vue'
import DashboardSharedHeader from '@/dev/templates/dashboard/shared/DashboardSharedHeader.vue'
import { useDashboardAnalyticsStore } from '@/stores/useDashboardAnalyticsStore.js'
import { FlowHandler } from '@/services/flow-system/FlowHandler'
import FlowRefreshManager from '@/services/flow-system/flowRefreshManager'
import { ANALYTICS_FETCH_FLOW } from '@/config/dashboardAnalyticsFlows.js'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import DashboardAnalyticsEarningsTrendPopup from '@/components/ui/popups/DashboardAnalyticsEarningsTrendPopup.vue'
import DashboardAnalyticsSubscribersTrendPopup from '@/components/ui/popups/DashboardAnalyticsSubscribersTrendPopup.vue'
import DashboardAnalyticsFansTrendPopup from '@/components/ui/popups/DashboardAnalyticsFansTrendPopup.vue'
import DashboardAnalyticsLikesTrendPopup from '@/components/ui/popups/DashboardAnalyticsLikesTrendPopup.vue'
import DashboardAnalyticsContributorsTrendPopup from '@/components/ui/popups/DashboardAnalyticsContributorsTrendPopup.vue'
import DashboardAnalyticsOrdersReceivedTable from '@/dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsOrdersReceivedTable.vue'
import DashboardAnalyticsTrendsSection from '@/dev/components/ui/section/dashboard/DashboardAnalyticsTrendsSection.vue'
import DashboardAnalyticsOverviewSection from '@/dev/components/ui/section/dashboard/DashboardAnalyticsOverviewSection.vue'
import DashboardAnalyticsWelcomeBanner from '@/dev/components/ui/section/dashboard/DashboardAnalyticsWelcomeBanner.vue'

const route = useRoute()
const hideLayout = computed(() => route.meta?.routeConfig?.hideLayout || route.meta?.hideLayout || false)

const dashboardAnalyticsStore = useDashboardAnalyticsStore()

const analyticsSubscribersTrendPeriod = ref('daily')
const analyticsEarningsTrendPeriod = ref('daily')
const analyticsFansTrendPeriod = ref('daily')
const analyticsLikesTrendPeriod = ref('daily')
const analyticsContributorsTrendPeriod = ref('daily')

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

onMounted(async () => {
  if (window.performanceTracker) {
    window.performanceTracker.step({
      flowName: 'AnalyticsRender',
      stepName: 'DashboardAnalyticsPage Mounted',
      status: 'success'
    });
  }

  isAnalyticsRefreshing.value = true
  try {
    await FlowHandler.run(ANALYTICS_FETCH_FLOW, { source: 'full' })
  } finally {
    isAnalyticsRefreshing.value = false
  }

  FlowRefreshManager.startFromRegistry(ANALYTICS_FETCH_FLOW, { source: 'full' })
})

onUnmounted(() => {
  FlowRefreshManager.stop(ANALYTICS_FETCH_FLOW)
})

</script>
