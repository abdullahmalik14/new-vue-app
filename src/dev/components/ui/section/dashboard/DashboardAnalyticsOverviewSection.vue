<template>
  <!-- overview/insight section -->
      <DashboardSectionWrapper>
        <div>
          <!-- section-header -->
          <div class="flex flex-col items-start justify-between sm:flex-row sm:items-center p-4">
            <!-- title -->
            <div class="flex items-center gap-2 flex-grow flex-shrink [flex-basis: auto] min-w-0 min-h-0">
              <span>
                <img :src="analyticsOverviewIconUrl || ''" alt="overview/insight"
                  class="w-6 h-6" />
              </span>
              <h2 class="m-0 font-medium text-xl font-sans leading-[1.875rem] text-light-text-quaternary dark:text-dark-text-quaternary" data-testid="dashboard-analytics-overview-heading">{{ $t('dashboard.analytics.page.overviewTitle') }}</h2>
            </div>
            <!-- last-date -->
            <div class="flex items-center gap-4 w-full justify-between sm:justify-end sm:w-auto">
              <span class="text-sm font-sans leading-5 text-light-text-quaternary dark:text-dark-text-quaternary">{{ $t('dashboard.analytics.page.lastUpdated') }}
                <span :data-value="lastUpdated"
                  class="text-sm font-sans leading-5 text-light-text-quaternary dark:text-dark-text-quaternary">{{
                    formatAnalyticsLastUpdatedAt(lastUpdated) }}</span></span>
              <DashboardPrimaryButton 
                variant="none"
                @click="$emit('refresh')" 
                data-testid="dashboard-analytics-refresh-button" 
                :disabled="isAnalyticsRefreshing"
                customClass="group flex items-center justify-center gap-1 pl-[0.9375rem] pr-2 py-1 bg-white border border-gray-200 shadow-sm dark:bg-dark-bg-container dark:border-gray-700 [clip-path:polygon(0_0,100%_0,105%_105%,16%_105%)] rounded-none hover:bg-gray-50 dark:hover:bg-dark-primaryHover [outline:none] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                textClass="text-xs font-sans font-medium leading-[1.125rem] text-light-primary dark:text-dark-primary  dark:group-hover:text-[#e8e6e3]"
                :text="isAnalyticsRefreshing ? $t('dashboard.analytics.page.refreshing') : $t('dashboard.analytics.page.refresh')" :wrapperOverrides="[{target:'wrapper1', removeClass:true}, {target:'wrapper2', removeClass:true}]">
                <template #leftIcon>
                  <span :class="{ 'animate-spin': isAnalyticsRefreshing }">
                    <img :src="analyticsRefreshIconUrl || ''" alt="refresh"
                      class="w-[.875rem] h-[.875rem] " />
                  </span>
                </template>
              </DashboardPrimaryButton>
            </div>
          </div>

          <!-- row -->
          <div class="grid grid-cols-1 gap-4 pt-0 pb-4 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 px-4">
            <!-- left-column -->
            <div class="flex flex-col gap-4">
              <!-- subscribers -->
              <DashboardAnalyticsMetricCard
                :title="$t('dashboard.analytics.trends.subscribers')"
                @openTrend="$emit('openSubscribersTrendPopup')">

                  <!-- data-content (new) -->
                  <div
                    class="flex flex-col flex-grow flex-shrink [flex-basis: auto] justify-center items-start gap-4 min-w-0 min-h-0">
                    <div
                      class="flex items-center gap-6 w-full flex-grow flex-shrink [flex-basis: auto] min-w-0 min-h-0">
                      <div class="flex flex-col gap-2 flex-grow flex-shrink [flex-basis: auto] min-w-0 min-h-0">
                        <div class="relative">
                          <span
                            class="text-xs font-sans font-medium leading-[1.125rem] text-light-text-tertiary dark:text-dark-text-tertiary uppercase">{{ $t('dashboard.analytics.trends.newSubscribers').split(' ')[0].toUpperCase() }}</span>
                        </div>

                        <div class="flex justify-between items-end">
                          <span>
                            <span :data-value="dashboardAnalyticsStore.subscriberInsights?.daily?.new"
                              class="text-[2.25rem] font-sans font-semibold leading-[2.75rem] tracking-[-0.045rem] text-light-text-primary dark:text-dark-text-primary">{{ displayValue(dashboardAnalyticsStore.subscriberInsights?.daily?.new) }}</span>
                          </span>

                          <!-- right part only show when data are here -->
                          <DashboardStatIndicator v-if="dashboardAnalyticsStore.subscriberInsights?.daily?.newPercentage !== undefined && dashboardAnalyticsStore.subscriberInsights?.daily?.newPercentage !== null" :percentage="dashboardAnalyticsStore.subscriberInsights?.daily?.newPercentage" :period-label="$t('dashboard.analytics.trends.vsYesterday')" />
                        </div>
                        <div class="w-full" v-if="dashboardAnalyticsStore.subscriberInsights?.daily?.newSparkline?.length > 0">
<SparkLine :data="dashboardAnalyticsStore.subscriberInsights.daily.newSparkline" color="#22c55e" :height="28" />
</div>

                      </div>
                    </div>
                  </div>

                  <div
                    class="flex flex-col flex-grow flex-shrink [flex-basis: auto] justify-center items-start gap-4 min-w-0 min-h-0">
                    <div
                      class="flex items-center gap-6 w-full flex-grow flex-shrink [flex-basis: auto] min-w-0 min-h-0">
                      <div class="flex flex-col gap-2 flex-grow flex-shrink [flex-basis: auto] min-w-0 min-h-0">
                        <div class="relative">
                          <span
                            class="text-xs font-sans font-medium leading-[1.125rem] text-light-text-tertiary dark:text-dark-text-tertiary">{{ $t('dashboard.analytics.trends.recurringSubscribers').split(' ')[0].toUpperCase() }}</span>
                        </div>

                        <div class="flex justify-between items-end">
                          <span>
                            <span :data-value="dashboardAnalyticsStore.subscriberInsights?.daily?.recurring"
                              class="text-[2.25rem] font-sans font-semibold leading-[2.75rem] tracking-[-0.045rem] text-light-text-primary dark:text-dark-text-primary">{{ displayValue(dashboardAnalyticsStore.subscriberInsights?.daily?.recurring) }}</span>
                          </span>
                          <!-- right part only show when data are here -->
                          <DashboardStatIndicator v-if="dashboardAnalyticsStore.subscriberInsights?.daily?.recurringPercentage !== undefined && dashboardAnalyticsStore.subscriberInsights?.daily?.recurringPercentage !== null" :percentage="dashboardAnalyticsStore.subscriberInsights?.daily?.recurringPercentage" :period-label="$t('dashboard.analytics.trends.vsYesterday')" />
                        </div>
                        <div class="w-full" v-if="dashboardAnalyticsStore.subscriberInsights?.daily?.recurringSparkline?.length > 0">
<SparkLine :data="dashboardAnalyticsStore.subscriberInsights.daily.recurringSparkline" color="#22c55e" :width="70" :height="28" />
</div>

                      </div>
                    </div>
                  </div>
              </DashboardAnalyticsMetricCard>

              <!-- fans-->
              <DashboardAnalyticsMetricCard
                :title="$t('dashboard.analytics.trends.fans')"
                @openTrend="$emit('openFansTrendPopup')">

                  <!-- data-content (new followers - profile visit) -->
                  <div
                    class="flex flex-col flex-grow flex-shrink [flex-basis: auto] justify-center items-start gap-4 min-w-0 min-h-0">
                    <div
                      class="flex items-center gap-6 w-full flex-grow flex-shrink [flex-basis: auto] min-w-0 min-h-0">
                      <div class="flex flex-col gap-2 w-full flex-shrink items-start">
                        <span
                          class="text-xs font-medium font-sans leading-[1.125rem] whitespace-nowrap text-light-text-tertiary dark:text-dark-text-tertiary">{{ $t('dashboard.analytics.trends.newFollowers', 'NEW FOLLOWERS').toUpperCase() }}</span>

                        <div class="flex items-end justify-between w-full gap-1">
                          <span :data-value="dashboardAnalyticsStore.fans?.daily?.newFollowers"
                            class="text-[1.875rem] font-sans font-semibold leading-[2.375rem] text-light-text-primary dark:text-dark-text-primary">
                            {{ displayValue(dashboardAnalyticsStore.fans?.daily?.newFollowers) }}</span>
                          <DashboardStatIndicator v-if="dashboardAnalyticsStore.fans?.daily?.newFollowersPercentage !== undefined && dashboardAnalyticsStore.fans?.daily?.newFollowersPercentage !== null" :percentage="dashboardAnalyticsStore.fans?.daily?.newFollowersPercentage" :period-label="$t('dashboard.analytics.trends.vsYesterday')" />
                        </div>
                        <div class="w-full" v-if="dashboardAnalyticsStore.fans?.daily?.newFollowersSparkline?.length > 0">
<SparkLine :data="dashboardAnalyticsStore.fans.daily.newFollowersSparkline" color="#ef4444" :width="60" :height="24" />
</div>

                      </div>

                      <div class="flex flex-col gap-2 w-full flex-shrink items-start">
                        <span
                          class="text-xs font-medium font-sans leading-[1.125rem] whitespace-nowrap text-light-text-tertiary dark:text-dark-text-tertiary">{{ $t('dashboard.analytics.overview.profileVisit', 'PROFILE VISIT').toUpperCase() }}</span>

                        <div class="flex items-end justify-between w-full gap-1">
                          <span :data-value="dashboardAnalyticsStore.fans?.daily?.profileVisit"
                            class="text-[1.875rem] font-semibold font-sans leading-[2.375rem] text-light-text-primary dark:text-dark-text-primary">
                            {{ displayValue(dashboardAnalyticsStore.fans?.daily?.profileVisit) }}</span>
                          <div v-if="
                            dashboardAnalyticsStore.fans?.daily?.profileVisitPercentage !== undefined &&
                            dashboardAnalyticsStore.fans?.daily?.profileVisitPercentage !== null
                          " class="flex flex-col items-end gap-1">



                            <div>
                              <span class="flex gap-1 items-center">
                                <img :src="analyticsTrendDownUrl || ''" alt="trend-down"
                                  class="h-5 w-5" />
                                <span
                                  class="text-light-text-trendRed dark:text-light-text-trendRed leading-5 text-sm font-medium">{{
                                    Math.abs(dashboardAnalyticsStore.fans?.daily?.profileVisitPercentage) }}%</span>
                              </span>
                              <span
                                class="text-light-text-secondary dark:text-dark-text-secondary leading-[1.125rem] text-xs">{{ $t('dashboard.analytics.trends.vsYesterday') }}</span>
                            </div>

                          </div>
                        </div>
                        <div class="w-full" v-if="dashboardAnalyticsStore.fans?.daily?.profileVisitSparkline?.length > 0">
<SparkLine :data="dashboardAnalyticsStore.fans.daily.profileVisitSparkline" color="#ef4444" :width="60" :height="24" />
</div>

                      </div>
                    </div>
                  </div>
              </DashboardAnalyticsMetricCard>
            </div>

            <!-- middle-column -->
            <div class="flex flex-col gap-4">
              <!-- earnings-->
              <DashboardAnalyticsMetricCard
                :title="$t('dashboard.analytics.trends.earnings')"
                @openTrend="$emit('openEarningsTrendPopup')">

                  <div class="flex justify-between items-end">
                    <span>
                      <span
                        :data-value="dashboardAnalyticsStore.earningsInsights?.daily?.total"
                        class="text-[2.25rem] font-semibold leading-[2.75rem] font-sans tracking-[-0.045rem] text-light-text-primary dark:text-dark-text-primary">{{ displayCurrency(dashboardAnalyticsStore.earningsInsights?.daily?.total) }}</span>
                      <span v-if="dashboardAnalyticsStore.earningsInsights?.daily?.total != null"
                        class="text-base font-medium leading-6 font-sans text-light-text-secondary dark:text-dark-text-secondary ml-1">USD</span>
                    </span>
                    <div v-if="dashboardAnalyticsStore.earningsInsights?.daily?.percentage !== null"
                      class="flex flex-col items-end gap-1">

                      <div>
                        <span class="flex gap-1 items-center">
                          <img
                            :src="dashboardAnalyticsStore.earningsInsights.daily.percentage >= 0 ? (analyticsTrendUpUrl || '') : (analyticsTrendDownUrl || '')"
                            :alt="dashboardAnalyticsStore.earningsInsights.daily.percentage >= 0 ? 'trend-up' : 'trend-down'"
                            class="h-5 w-5" />
                          <span
                            :class="dashboardAnalyticsStore.earningsInsights.daily.percentage >= 0 ? 'text-light-text-trendGreen' : 'text-light-text-trendRed'"
                            class="leading-5 text-sm font-medium">{{ Math.abs(dashboardAnalyticsStore.earningsInsights.daily.percentage)
                            }}%</span>
                        </span>
                      </div>

                    </div>
                  </div>
                  <div class="w-full mt-auto" v-if="dashboardAnalyticsStore.earningsInsights?.daily?.sparklineData?.length > 0">
                    <SparkLine :data="dashboardAnalyticsStore.earningsInsights.daily.sparklineData" color="#22c55e" :height="28" />
                  </div>
              </DashboardAnalyticsMetricCard>

              <!-- likes -->
              <!-- likes -->
              <DashboardAnalyticsMetricCard
                :title="$t('dashboard.analytics.trends.likes')"
                @openTrend="$emit('openLikesTrendPopup')">

                  <!-- data-content (media-merch) -->
                  <div
                    class="flex flex-col flex-grow flex-shrink [flex-basis: auto] justify-center items-start gap-4 min-w-0 min-h-0">
                    <div
                      class="flex items-center gap-6 w-full flex-grow flex-shrink [flex-basis: auto] min-w-0 min-h-0">
                      <div class="flex flex-col gap-2 w-full flex-shrink items-start">
                        <span
                          class="text-xs font-medium font-sans leading-[1.125rem] whitespace-nowrap text-light-text-tertiary dark:text-dark-text-tertiary">{{ $t('dashboard.analytics.overview.media', 'MEDIA') }}</span>

                        <div class="flex items-end justify-between w-full gap-1">
                          <span :data-value="dashboardAnalyticsStore.likes?.media"
                            class="text-[1.875rem] font-sans font-semibold leading-[2.375rem] text-light-text-primary dark:text-dark-text-primary">
                            {{ displayCurrency(dashboardAnalyticsStore.likes?.media) }}</span>
                          <div v-if="
                            dashboardAnalyticsStore.likes?.mediaPercentage !== undefined &&
                            dashboardAnalyticsStore.likes?.mediaPercentage !== null
                          " class="flex flex-col items-end gap-1">

                            <div>
                              <span class="flex gap-1 items-center">
                                <img :src="analyticsTrendDownUrl || ''" alt="trend-down"
                                  class="h-5 w-5" />
                                <span
                                  class="text-light-text-trendRed dark:text-light-text-trendRed leading-5 text-sm font-medium">{{
                                    Math.abs(dashboardAnalyticsStore.likes?.mediaPercentage) }}%</span>
                              </span>
                              <span
                                class="text-light-text-secondary dark:text-dark-text-secondary leading-[1.125rem] text-xs">{{ $t('dashboard.analytics.trends.vsYesterday') }}</span>

                            </div>
                          </div>

                        </div>
                        <div class="w-full" v-if="dashboardAnalyticsStore.likes?.mediaSparkline?.length > 0">
<SparkLine :data="dashboardAnalyticsStore.likes.mediaSparkline" color="#ef4444" :width="55" :height="22" />
</div>

                      </div>

                      <div class="flex flex-col gap-2 w-full flex-shrink items-start">
                        <span
                          class="text-xs font-medium font-sans leading-[1.125rem] whitespace-nowrap text-light-text-tertiary dark:text-dark-text-tertiary">{{ $t('dashboard.analytics.overview.merch', 'MERCH') }}</span>

                        <div class="flex items-end justify-between w-full gap-1">
                          <span :data-value="dashboardAnalyticsStore.likes?.merch"
                            class="text-[1.875rem] font-sans font-semibold leading-[2.375rem] text-light-text-primary dark:text-dark-text-primary">{{ displayValue(dashboardAnalyticsStore.likes?.merch) }}</span>
                          <div v-if="
                            dashboardAnalyticsStore.likes?.merchPercentage !== undefined &&
                            dashboardAnalyticsStore.likes?.merchPercentage !== null
                          " class="flex flex-col items-end gap-1">



                            <div>
                              <span class="flex gap-1 items-center">
                                <img :src="analyticsTrendDownUrl || ''" alt="trend-down"
                                  class="h-5 w-5" />
                                <span
                                  class="text-light-text-trendRed dark:text-light-text-trendRed leading-5 text-sm font-medium">{{
                                    Math.abs(dashboardAnalyticsStore.likes?.merchPercentage) }}%</span>
                              </span>
                              <span
                                class="text-light-text-secondary dark:text-dark-text-secondary leading-[1.125rem] text-xs">{{ $t('dashboard.analytics.trends.vsYesterday') }}</span>
                            </div>
                          </div>
                        </div>
                        <div class="w-full" v-if="dashboardAnalyticsStore.likes?.merchSparkline?.length > 0">
<SparkLine :data="dashboardAnalyticsStore.likes.merchSparkline" color="#ef4444" :width="55" :height="22" />
</div>

                      </div>
                    </div>
                  </div>

                  <!-- data-content (profile-feed) -->
                  <div
                    class="flex flex-col flex-grow flex-shrink [flex-basis: auto] justify-center items-start gap-4 min-w-0 min-h-0">
                    <div
                      class="flex items-center gap-6 w-full flex-grow flex-shrink [flex-basis: auto] min-w-0 min-h-0">

                      <div class="flex flex-col gap-2 w-full flex-shrink items-start">
                        <span
                          class="text-xs font-medium font-sans leading-[1.125rem] whitespace-nowrap text-light-text-tertiary dark:text-dark-text-tertiary">{{ $t('dashboard.analytics.overview.profile', 'PROFILE') }}</span>

                        <div class="flex items-end justify-between w-full gap-1">
                          <span :data-value="dashboardAnalyticsStore.likes?.profile"
                            class="text-[1.875rem] font-semibold font-sans leading-[2.375rem] text-light-text-primary dark:text-dark-text-primary">{{ displayCurrency(dashboardAnalyticsStore.likes?.profile) }}</span>
                          <div v-if="
                            dashboardAnalyticsStore.likes?.profilePercentage !== undefined &&
                            dashboardAnalyticsStore.likes?.profilePercentage !== null
                          " class="flex flex-col items-end gap-1">

                            <div>
                              <span class="flex gap-1 items-center">
                                <img :src="analyticsTrendUpUrl || ''" alt="trend-up"
                                  class="h-5 w-5" />
                                <span
                                  class="text-light-text-trendGreen dark:text-light-text-trendGreen leading-5 text-sm font-medium">{{
                                    Math.abs(dashboardAnalyticsStore.likes?.profilePercentage) }}%</span>
                              </span>
                              <span
                                class="text-light-text-secondary dark:text-dark-text-secondary leading-[1.125rem] text-xs">{{ $t('dashboard.analytics.trends.vsYesterday') }}</span>
                            </div>

                          </div>
                        </div>
                        <div class="w-full" v-if="dashboardAnalyticsStore.likes?.profileSparkline?.length > 0">
<SparkLine :data="dashboardAnalyticsStore.likes.profileSparkline" color="#22c55e" :width="55" :height="22" />
</div>

                      </div>

                      <div class="flex flex-col gap-2 w-full flex-shrink items-start">
                        <span
                          class="text-xs font-medium leading-[1.125rem] font-sans whitespace-nowrap text-light-text-tertiary dark:text-dark-text-tertiary">{{ $t('dashboard.analytics.overview.feed', 'FEED') }}</span>

                        <div class="flex items-end justify-between w-full gap-1">
                          <span :data-value="dashboardAnalyticsStore.likes?.feed"
                            class="text-[1.875rem] font-semibold leading-[2.375rem] font-sans text-light-text-primary dark:text-dark-text-primary">{{ displayCurrency(dashboardAnalyticsStore.likes?.feed) }}</span>
                          <div v-if="
                            dashboardAnalyticsStore.likes?.feedPercentage !== undefined &&
                            dashboardAnalyticsStore.likes?.feedPercentage !== null
                          " class="flex flex-col items-end gap-1">

                            <div>
                              <span class="flex gap-1 items-center">
                                <img :src="analyticsTrendUpUrl || ''" alt="trend-up"
                                  class="h-5 w-5" />
                                <span
                                  class="text-light-text-trendGreen dark:text-light-text-trendGreen leading-5 text-sm font-medium">{{
                                    Math.abs(dashboardAnalyticsStore.likes?.feedPercentage) }}%</span>
                              </span>
                              <span
                                class="text-light-text-secondary dark:text-dark-text-secondary leading-[1.125rem] text-xs">{{ $t('dashboard.analytics.trends.vsYesterday') }}</span>
                            </div>
                          </div>
                        </div>
                        <div class="w-full" v-if="dashboardAnalyticsStore.likes?.feedSparkline?.length > 0">
<SparkLine :data="dashboardAnalyticsStore.likes.feedSparkline" color="#22c55e" :width="55" :height="22" />
</div>

                      </div>


                    </div>
                  </div>
              </DashboardAnalyticsMetricCard>
            </div>

            <!-- right-column -->
            <div class="flex flex-col gap-4 col-span-full xl:col-auto">
              <!-- top contributors -->
              <div class="group/container relative flex flex-col flex-grow flex-shrink [flex-basis:auto] gap-4 p-4 rounded-sm min-w-0 min-h-0 [backdrop-filter:blur(25px)] bg-light-bg-container dark:bg-dark-bg-container transition-all duration-300 hover:shadow-[0px_0px_20px_0px_rgba(0,0,0,0.10)] hover:backdrop-blur-xl overflow-hidden gap-4">
                <div class="flex flex-col gap-4">
                  <div class="flex flex-col gap-4 min-w-0">
                    <!-- hover-overlay -->
                    <div
                      class="absolute hidden group-hover/container:flex items-start justify-end w-full h-full top-0 left-0 z-[10000]">
                      <DashboardPrimaryButton 
                      variant="none"
                      @click="$emit('openContributorsTrendPopup')"
                      customClass="group/button flex items-center justify-center gap-1 pl-[0.9375rem] pr-2 py-1 bg-transparent [clip-path:polygon(0_0,100%_0,105%_105%,16%_105%)] rounded-none border-none outline-none hover:bg-light-primary/10 dark:hover:bg-dark-primary/10 transition-colors"
                      :text="$t('dashboard.analytics.page.trend', 'Trend')"
                      textClass="text-xs font-sans font-medium leading-[1.125rem] text-light-primary dark:text-dark-primary" :wrapperOverrides="[{target:'wrapper1', removeClass:true}, {target:'wrapper2', removeClass:true}]">
                      <template #rightIcon>
                        <span>
                          <img :src="analyticsTrendExpandUrl || ''" alt="expand"
                            class="w-[.875rem] h-[.875rem]" />
                        </span>
                      </template>
                    </DashboardPrimaryButton>
                    </div>

                    <!-- title -->
                    <div class="flex items-center gap-2">
                      <h3 class="m-0 font-medium font-sans text-base leading-6 text-light-text-secondary dark:text-dark-text-secondary">{{ $t('dashboard.analytics.trends.topContributors') }}</h3>
                    </div>
                  </div>

                  <!-- data-table -->
                  <div class="flex-grow flex-shrink [flex-basis:auto] min-w-0 min-h-0 -mx-4 -mb-4">
                    <DashboardAnalyticsContributorsPreviewTable :rows="dashboardAnalyticsStore.getContributorsViewModel('daily').topContributors.slice(0, 6)" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardSectionWrapper>
</template>

<script setup>
import DashboardSectionWrapper from '@/components/ui/card/dashboard/DashboardSectionWrapper.vue'
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue'
import DashboardAnalyticsMetricCard from '@/dev/components/ui/card/dashboard/DashboardAnalyticsMetricCard.vue'
import DashboardStatIndicator from '@/components/ui/badge/dashboard/DashboardStatIndicator.vue'
import DashboardAnalyticsContributorsPreviewTable from '@/dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsContributorsPreviewTable.vue'
import SparkLine from '@/components/ui/charts/SparkLine.vue'
import { useDashboardAnalyticsStore } from '@/stores/useDashboardAnalyticsStore.js'
import { useAssetUrl } from '@/composables/useAssetUrl.js'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const { t, n } = useI18n()

const displayValue = (val) => {
  if (!dashboardAnalyticsStore.bundleLoaded) return '--'
  return val == null ? 0 : val
}

const displayCurrency = (val) => {
  if (!dashboardAnalyticsStore.bundleLoaded) return '--'
  return val == null ? 0 : n(Number(val))
}

const dashboardAnalyticsStore = useDashboardAnalyticsStore()
const { lastUpdated } = storeToRefs(dashboardAnalyticsStore)

const { url: analyticsOverviewIconUrl } = useAssetUrl('dashboard.analytics.overviewIcon')
const { url: analyticsRefreshIconUrl } = useAssetUrl('dashboard.analytics.refreshIcon')
const { url: analyticsTrendExpandUrl } = useAssetUrl('dashboard.analytics.trendExpand')
const { url: analyticsTrendUpUrl } = useAssetUrl('dashboard.analytics.trendUp')
const { url: analyticsTrendDownUrl } = useAssetUrl('dashboard.analytics.trendDown')

defineEmits([
  'openSubscribersTrendPopup',
  'openEarningsTrendPopup',
  'openFansTrendPopup',
  'openLikesTrendPopup',
  'openContributorsTrendPopup',
  'refresh'
])

function formatAnalyticsLastUpdatedAt(dateString) {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

defineProps({
  isAnalyticsRefreshing: {
    type: Boolean,
    default: false
  }
})
</script>
