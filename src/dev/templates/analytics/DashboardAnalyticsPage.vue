<template>
  <DashboardSharedTwoColLayout>
    <div class="relative flex flex-col mt-6 gap-6 md:p-[40px]">

      <DashboardHeader />

      <!-- overview/insight section -->
      <DashboardSectionWrapper>
        <div>
          <!-- section-header -->
          <div class="flex flex-col items-start justify-between sm:flex-row sm:items-center p-4">
            <!-- title -->
            <div class="flex items-center gap-2 flex-grow flex-shrink [flex-basis: auto] min-w-0 min-h-0">
              <span>
                <img src="/dev/cdn/analytics/icons/icon-1.webp" alt="overview/insight"
                  class="w-6 h-6" />
              </span>
              <h2 class="m-0 font-medium text-xl font-sans leading-[1.875rem] text-light-text-quaternary dark:text-dark-text-quaternary">{{ $t('dashboard.analytics.page.overviewTitle') }}</h2>
            </div>
            <!-- last-date -->
            <div class="flex items-center gap-4 w-full justify-between sm:justify-end sm:w-auto">
              <span class="text-sm font-sans leading-5 text-light-text-quaternary dark:text-dark-text-quaternary">{{ $t('dashboard.analytics.page.lastUpdated') }}
                <span :data-value="lastUpdated"
                  class="text-sm font-sans leading-5 text-light-text-quaternary dark:text-dark-text-quaternary">{{
                    formatTime(lastUpdated) }}</span></span>
              <DashboardPrimaryButton 
                variant="none"
                @click="handleRefresh" 
                data-label="Refresh" 
                :disabled="isRefreshing"
                customClass="group flex items-center justify-center gap-1 pl-[0.9375rem] pr-2 py-1 bg-white border border-gray-200 shadow-sm dark:bg-dark-bg-container dark:border-gray-700 [clip-path:polygon(0_0,100%_0,105%_105%,16%_105%)] rounded-none hover:bg-gray-50 dark:hover:bg-dark-primaryHover [outline:none] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                textClass="text-xs font-sans font-medium leading-[1.125rem] text-light-primary dark:text-dark-primary  dark:group-hover:text-[#e8e6e3]"
                :text="isRefreshing ? $t('dashboard.analytics.page.refreshing') : $t('dashboard.analytics.page.refresh')" :wrapperOverrides="[{target:'wrapper1', removeClass:true}, {target:'wrapper2', removeClass:true}]">
                <template #leftIcon>
                  <span :class="{ 'animate-spin': isRefreshing }">
                    <img src="/dev/cdn/analytics/icons/icon-2.webp" alt="refresh"
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
              <DashboardOrderCard>
                <div class="flex flex-col flex-grow flex-shrink [flex-basis: auto] gap-4 min-w-0 min-h-0">
                  <!-- hover-overlay -->
                  <div
                    class="absolute hidden group-hover/container:flex items-start justify-end w-full h-full top-0 left-0 z-[10000]">
                    <DashboardPrimaryButton 
                      variant="none"
                      @click="openSubscribers"
                      customClass="group/button flex items-center justify-center gap-1 pl-[0.9375rem] pr-2 py-1 bg-transparent [clip-path:polygon(0_0,100%_0,105%_105%,16%_105%)] rounded-none border-none outline-none hover:bg-light-primary/10 dark:hover:bg-dark-primary/10 transition-colors"
                      text="Trend"
                      textClass="text-xs font-sans font-medium leading-[1.125rem] text-light-primary dark:text-dark-primary" :wrapperOverrides="[{target:'wrapper1', removeClass:true}, {target:'wrapper2', removeClass:true}]">
                      <template #rightIcon>
                        <span>
                          <img src="/dev/cdn/analytics/icons/icon-3.webp" alt="expand"
                            class="w-[.875rem] h-[.875rem]" />
                        </span>
                      </template>
                    </DashboardPrimaryButton>
                  </div>

                  <!-- title -->
                  <div class="flex items-center gap-2">
                    <h3 class="m-0 font-sans font-medium text-base leading-6 text-light-text-secondary dark:text-dark-text-secondary">Subscribers</h3>
                  </div>

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
                            <span :data-value="analyticsStore.subscriberInsights?.daily?.new"
                              class="text-[2.25rem] font-sans font-semibold leading-[2.75rem] tracking-[-0.045rem] text-light-text-primary dark:text-dark-text-primary">{{
                                analyticsStore.subscriberInsights?.daily?.new ?? '--' }}</span>
                          </span>

                          <!-- right part only show when data are here -->
                          <DashboardStatIndicator v-if="analyticsStore.subscriberInsights?.daily?.newPercentage !== undefined && analyticsStore.subscriberInsights?.daily?.newPercentage !== null" :percentage="analyticsStore.subscriberInsights?.daily?.newPercentage" period-label="vs yesterday" />
                        </div>
                        <div class="w-full" v-if="analyticsStore.subscriberInsights?.daily?.new != null">
                          <SparkLine :data="[3, 4, 3, 5, 4, 6, 5, 7, 6, 8]" color="#22c55e" :height="28" />
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
                            <span :data-value="analyticsStore.subscriberInsights?.daily?.recurring"
                              class="text-[2.25rem] font-sans font-semibold leading-[2.75rem] tracking-[-0.045rem] text-light-text-primary dark:text-dark-text-primary">{{
                                analyticsStore.subscriberInsights?.daily?.recurring ?? '--' }}</span>
                          </span>
                          <!-- right part only show when data are here -->
                          <DashboardStatIndicator v-if="analyticsStore.subscriberInsights?.daily?.recurringPercentage !== undefined && analyticsStore.subscriberInsights?.daily?.recurringPercentage !== null" :percentage="analyticsStore.subscriberInsights?.daily?.recurringPercentage" period-label="vs yesterday" />
                        </div>
                        <div v-if="analyticsStore.subscriberInsights?.daily?.recurring != null" class="w-full">
                          <SparkLine :data="[5, 6, 5, 4, 5, 6, 7, 6, 5, 6]" color="#22c55e" :width="70" :height="28" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DashboardOrderCard>

              <!-- fans-->
              <DashboardOrderCard>
                <div class="flex flex-col flex-grow flex-shrink [flex-basis: auto] gap-4 min-w-0 min-h-0">
                  <!-- hover-overlay -->
                  <div
                    class="absolute hidden group-hover/container:flex items-start justify-end w-full h-full top-0 left-0 z-[10000]">
                    <DashboardPrimaryButton 
                      variant="none"
                      @click="openFans"
                      customClass="group/button flex items-center justify-center gap-1 pl-[0.9375rem] pr-2 py-1 bg-transparent [clip-path:polygon(0_0,100%_0,105%_105%,16%_105%)] rounded-none border-none outline-none hover:bg-light-primary/10 dark:hover:bg-dark-primary/10 transition-colors"
                      text="Trend"
                      textClass="text-xs font-sans font-medium leading-[1.125rem] text-light-primary dark:text-dark-primary" :wrapperOverrides="[{target:'wrapper1', removeClass:true}, {target:'wrapper2', removeClass:true}]">
                      <template #rightIcon>
                        <span>
                          <img src="/dev/cdn/analytics/icons/icon-3.webp" alt="expand"
                            class="w-[.875rem] h-[.875rem]" />
                        </span>
                      </template>
                    </DashboardPrimaryButton>
                  </div>

                  <!-- title -->
                  <div class="flex items-center gap-2">
                    <h3 class="m-0 font-medium font-sans text-base leading-6 text-light-text-secondary dark:text-dark-text-secondary">Fans</h3>
                  </div>

                  <!-- data-content (new followers - profile visit) -->
                  <div
                    class="flex flex-col flex-grow flex-shrink [flex-basis: auto] justify-center items-start gap-4 min-w-0 min-h-0">
                    <div
                      class="flex items-center gap-6 w-full flex-grow flex-shrink [flex-basis: auto] min-w-0 min-h-0">
                      <div class="flex flex-col gap-2 w-full flex-shrink items-start">
                        <span
                          class="text-xs font-medium font-sans leading-[1.125rem] whitespace-nowrap text-light-text-tertiary dark:text-dark-text-tertiary">NEW
                          FOLLOWERS</span>

                        <div class="flex items-end justify-between w-full gap-1">
                          <span :data-value="analyticsStore.fans?.daily?.newFollowers"
                            class="text-[1.875rem] font-sans font-semibold leading-[2.375rem] text-light-text-primary dark:text-dark-text-primary">
                            {{ analyticsStore.fans?.daily?.newFollowers ?? '--' }}</span>
                          <DashboardStatIndicator v-if="analyticsStore.fans?.daily?.newFollowersPercentage !== undefined && analyticsStore.fans?.daily?.newFollowersPercentage !== null" :percentage="analyticsStore.fans?.daily?.newFollowersPercentage" period-label="vs yesterday" />
                        </div>
                        <div v-if="analyticsStore.fans?.daily?.newFollowers != null" class="w-full">
                          <SparkLine :data="[8, 7, 6, 7, 5, 6, 4, 5, 4, 3]" color="#ef4444" :width="60" :height="24" />
                        </div>
                      </div>

                      <div class="flex flex-col gap-2 w-full flex-shrink items-start">
                        <span
                          class="text-xs font-medium font-sans leading-[1.125rem] whitespace-nowrap text-light-text-tertiary dark:text-dark-text-tertiary">PROFILE
                          VISIT</span>

                        <div class="flex items-end justify-between w-full gap-1">
                          <span :data-value="analyticsStore.fans?.daily?.profileVisit"
                            class="text-[1.875rem] font-semibold font-sans leading-[2.375rem] text-light-text-primary dark:text-dark-text-primary">
                            {{ analyticsStore.fans?.daily?.profileVisit ?? '--' }}</span>
                          <div v-if="
                            analyticsStore.fans?.daily?.profileVisitPercentage !== undefined &&
                            analyticsStore.fans?.daily?.profileVisitPercentage !== null
                          " class="flex flex-col items-end gap-1">



                            <div>
                              <span class="flex gap-1 items-center">
                                <img src="/dev/cdn/analytics/icons/icon-5.webp" alt="trend-down"
                                  class="h-5 w-5" />
                                <span
                                  class="text-light-text-trendRed dark:text-light-text-trendRed leading-5 text-sm font-medium">{{
                                    Math.abs(analyticsStore.fans?.daily?.profileVisitPercentage) }}%</span>
                              </span>
                              <span
                                class="text-light-text-secondary dark:text-dark-text-secondary leading-[1.125rem] text-xs">vs
                                yesterday</span>
                            </div>

                          </div>
                        </div>
                        <div v-if="analyticsStore.fans?.daily?.profileVisit != null" class="w-full">
                          <SparkLine :data="[20, 22, 21, 24, 23, 26, 25, 28, 27, 31]" color="#ef4444" :width="60"
                            :height="24" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DashboardOrderCard>
            </div>

            <!-- middle-column -->
            <div class="flex flex-col gap-4">
              <!-- earnings-->
              <DashboardOrderCard>
                <div class="flex flex-col flex-grow flex-shrink [flex-basis: auto] gap-4 min-w-0 min-h-0">
                  <!-- hover-overlay -->
                  <div
                    class="absolute hidden group-hover/container:flex items-start justify-end w-full h-full top-0 left-0 z-[10000]">
                    <DashboardPrimaryButton 
                      variant="none"
                      @click="openEarnings"
                      customClass="group/button flex items-center justify-center gap-1 pl-[0.9375rem] pr-2 py-1 bg-transparent [clip-path:polygon(0_0,100%_0,105%_105%,16%_105%)] rounded-none border-none outline-none hover:bg-light-primary/10 dark:hover:bg-dark-primary/10 transition-colors"
                      text="Trend"
                      textClass="text-xs font-sans font-medium leading-[1.125rem] text-light-primary dark:text-dark-primary" :wrapperOverrides="[{target:'wrapper1', removeClass:true}, {target:'wrapper2', removeClass:true}]">
                      <template #rightIcon>
                        <span>
                          <img src="/dev/cdn/analytics/icons/icon-3.webp" alt="expand"
                            class="w-[.875rem] h-[.875rem]" />
                        </span>
                      </template>
                    </DashboardPrimaryButton>
                  </div>

                  <!-- title -->
                  <div class="flex items-center gap-2">
                    <h3 class="m-0 font-medium text-base leading-6 font-sans text-light-text-secondary dark:text-dark-text-secondary">Earnings</h3>
                  </div>

                  <div class="flex justify-between items-end">
                    <span>
                      <span
                        :data-value="analyticsStore.earningsInsights?.daily?.total"
                        class="text-[2.25rem] font-semibold leading-[2.75rem] font-sans tracking-[-0.045rem] text-light-text-primary dark:text-dark-text-primary">{{
                          analyticsStore.earningsInsights?.daily?.total != null ?
                            Number(analyticsStore.earningsInsights.daily.total).toLocaleString('en-US') :
                            '--'
                        }}</span>
                      <span v-if="analyticsStore.earningsInsights?.daily?.total != null"
                        class="text-base font-medium leading-6 font-sans text-light-text-secondary dark:text-dark-text-secondary ml-1">USD</span>
                    </span>
                    <div v-if="analyticsStore.earningsInsights?.daily?.percentage !== null"
                      class="flex flex-col items-end gap-1">

                      <div>
                        <span class="flex gap-1 items-center">
                          <img
                            :src="analyticsStore.earningsInsights.daily.percentage >= 0 ? '/dev/cdn/analytics/icons/icon-4.webp' : '/dev/cdn/analytics/icons/icon-5.webp'"
                            :alt="analyticsStore.earningsInsights.daily.percentage >= 0 ? 'trend-up' : 'trend-down'"
                            class="h-5 w-5" />
                          <span
                            :class="analyticsStore.earningsInsights.daily.percentage >= 0 ? 'text-light-text-trendGreen' : 'text-light-text-trendRed'"
                            class="leading-5 text-sm font-medium">{{ Math.abs(analyticsStore.earningsInsights.daily.percentage)
                            }}%</span>
                        </span>
                      </div>

                    </div>
                  </div>
                  <div v-if="analyticsStore.earningsInsights?.daily?.total != null" class="w-full mt-auto">
                    <SparkLine :data="analyticsStore.earningsInsights.daily.sparklineData" color="#22c55e" :height="28" />
                  </div>
                </div>
              </DashboardOrderCard>

              <!-- likes -->
              <DashboardOrderCard
                class="group relative flex flex-col flex-grow flex-shrink [flex-basis: auto] gap-4 p-4 rounded-sm min-w-0 min-h-0 [backdrop-filter:blur(25px)] bg-light-bg-container dark:bg-dark-bg-container">
                <div class="flex flex-col flex-grow flex-shrink [flex-basis: auto] gap-4 min-w-0 min-h-0">
                  <!-- hover-overlay -->
                  <div
                    class="absolute hidden group-hover/container:flex items-start justify-end w-full h-full top-0 left-0 z-[10000]">
                    <DashboardPrimaryButton 
                      variant="none"
                      @click="openLikes"
                      customClass="group/button flex items-center justify-center gap-1 pl-[0.9375rem] pr-2 py-1 bg-transparent [clip-path:polygon(0_0,100%_0,105%_105%,16%_105%)] rounded-none border-none outline-none hover:bg-light-primary/10 dark:hover:bg-dark-primary/10 transition-colors"
                      text="Trend"
                      textClass="text-xs font-sans font-medium leading-[1.125rem] text-light-primary dark:text-dark-primary" :wrapperOverrides="[{target:'wrapper1', removeClass:true}, {target:'wrapper2', removeClass:true}]">
                      <template #rightIcon>
                        <span>
                          <img src="/dev/cdn/analytics/icons/icon-3.webp" alt="expand"
                            class="w-[.875rem] h-[.875rem]" />
                        </span>
                      </template>
                    </DashboardPrimaryButton>
                  </div>
                  <!-- title -->
                  <div class="flex items-center gap-2">
                    <h3 class="m-0 font-medium font-sans text-base leading-6 text-light-text-secondary dark:text-dark-text-secondary">Likes</h3>
                  </div>

                  <!-- data-content (media-merch) -->
                  <div
                    class="flex flex-col flex-grow flex-shrink [flex-basis: auto] justify-center items-start gap-4 min-w-0 min-h-0">
                    <div
                      class="flex items-center gap-6 w-full flex-grow flex-shrink [flex-basis: auto] min-w-0 min-h-0">
                      <div class="flex flex-col gap-2 w-full flex-shrink items-start">
                        <span
                          class="text-xs font-medium font-sans leading-[1.125rem] whitespace-nowrap text-light-text-tertiary dark:text-dark-text-tertiary">MEDIA</span>

                        <div class="flex items-end justify-between w-full gap-1">
                          <span :data-value="analyticsStore.likes?.media"
                            class="text-[1.875rem] font-sans font-semibold leading-[2.375rem] text-light-text-primary dark:text-dark-text-primary">
                            {{ analyticsStore.likes?.media != null ? Number(analyticsStore.likes.media).toLocaleString('en-US') : '--'
                            }}</span>
                          <div v-if="
                            analyticsStore.likes?.mediaPercentage !== undefined &&
                            analyticsStore.likes?.mediaPercentage !== null
                          " class="flex flex-col items-end gap-1">

                            <div>
                              <span class="flex gap-1 items-center">
                                <img src="/dev/cdn/analytics/icons/icon-5.webp" alt="trend-down"
                                  class="h-5 w-5" />
                                <span
                                  class="text-light-text-trendRed dark:text-light-text-trendRed leading-5 text-sm font-medium">{{
                                    Math.abs(analyticsStore.likes?.mediaPercentage) }}%</span>
                              </span>
                              <span
                                class="text-light-text-secondary dark:text-dark-text-secondary leading-[1.125rem] text-xs">vs
                                yesterday</span>

                            </div>
                          </div>

                        </div>
                        <div v-if="analyticsStore.likes?.media != null" class="w-full">
                          <SparkLine :data="[95, 90, 88, 85, 82, 80, 78, 76]" color="#ef4444" :width="55"
                            :height="22" />
                        </div>
                      </div>

                      <div class="flex flex-col gap-2 w-full flex-shrink items-start">
                        <span
                          class="text-xs font-medium font-sans leading-[1.125rem] whitespace-nowrap text-light-text-tertiary dark:text-dark-text-tertiary">MERCH</span>

                        <div class="flex items-end justify-between w-full gap-1">
                          <span :data-value="analyticsStore.likes?.merch"
                            class="text-[1.875rem] font-sans font-semibold leading-[2.375rem] text-light-text-primary dark:text-dark-text-primary">{{
                              analyticsStore.likes?.merch ?? '--' }}</span>
                          <div v-if="
                            analyticsStore.likes?.merchPercentage !== undefined &&
                            analyticsStore.likes?.merchPercentage !== null
                          " class="flex flex-col items-end gap-1">



                            <div>
                              <span class="flex gap-1 items-center">
                                <img src="/dev/cdn/analytics/icons/icon-5.webp" alt="trend-down"
                                  class="h-5 w-5" />
                                <span
                                  class="text-light-text-trendRed dark:text-light-text-trendRed leading-5 text-sm font-medium">{{
                                    Math.abs(analyticsStore.likes?.merchPercentage) }}%</span>
                              </span>
                              <span
                                class="text-light-text-secondary dark:text-dark-text-secondary leading-[1.125rem] text-xs">vs
                                yesterday</span>
                            </div>
                          </div>
                        </div>
                        <div v-if="analyticsStore.likes?.merch != null" class="w-full">
                          <SparkLine :data="[5, 4, 4, 3, 3, 3, 2, 2]" color="#ef4444" :width="55" :height="22" />
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
                          class="text-xs font-medium font-sans leading-[1.125rem] whitespace-nowrap text-light-text-tertiary dark:text-dark-text-tertiary">PROFILE</span>

                        <div class="flex items-end justify-between w-full gap-1">
                          <span :data-value="analyticsStore.likes?.profile"
                            class="text-[1.875rem] font-semibold font-sans leading-[2.375rem] text-light-text-primary dark:text-dark-text-primary">{{
                              analyticsStore.likes?.profile != null ? Number(analyticsStore.likes.profile).toLocaleString('en-US') : '--'
                            }}</span>
                          <div v-if="
                            analyticsStore.likes?.profilePercentage !== undefined &&
                            analyticsStore.likes?.profilePercentage !== null
                          " class="flex flex-col items-end gap-1">

                            <div>
                              <span class="flex gap-1 items-center">
                                <img src="/dev/cdn/analytics/icons/icon-4.webp" alt="trend-up"
                                  class="h-5 w-5" />
                                <span
                                  class="text-light-text-trendGreen dark:text-light-text-trendGreen leading-5 text-sm font-medium">{{
                                    Math.abs(analyticsStore.likes?.profilePercentage) }}%</span>
                              </span>
                              <span
                                class="text-light-text-secondary dark:text-dark-text-secondary leading-[1.125rem] text-xs">vs
                                yesterday</span>
                            </div>

                          </div>
                        </div>
                        <div v-if="analyticsStore.likes?.profile != null" class="w-full">
                          <SparkLine :data="[8000, 8500, 9000, 9500, 10000, 10500, 11000, 12000]" color="#22c55e"
                            :width="55" :height="22" />
                        </div>
                      </div>

                      <div class="flex flex-col gap-2 w-full flex-shrink items-start">
                        <span
                          class="text-xs font-medium leading-[1.125rem] font-sans whitespace-nowrap text-light-text-tertiary dark:text-dark-text-tertiary">FEED</span>

                        <div class="flex items-end justify-between w-full gap-1">
                          <span :data-value="analyticsStore.likes?.feed"
                            class="text-[1.875rem] font-semibold leading-[2.375rem] font-sans text-light-text-primary dark:text-dark-text-primary">{{
                              analyticsStore.likes?.feed != null ? Number(analyticsStore.likes.feed).toLocaleString('en-US') : '--'
                            }}</span>
                          <div v-if="
                            analyticsStore.likes?.feedPercentage !== undefined &&
                            analyticsStore.likes?.feedPercentage !== null
                          " class="flex flex-col items-end gap-1">

                            <div>
                              <span class="flex gap-1 items-center">
                                <img src="/dev/cdn/analytics/icons/icon-4.webp" alt="trend-up"
                                  class="h-5 w-5" />
                                <span
                                  class="text-light-text-trendGreen dark:text-light-text-trendGreen leading-5 text-sm font-medium">{{
                                    Math.abs(analyticsStore.likes?.feedPercentage) }}%</span>
                              </span>
                              <span
                                class="text-light-text-secondary dark:text-dark-text-secondary leading-[1.125rem] text-xs">vs
                                yesterday</span>
                            </div>
                          </div>
                        </div>
                        <div v-if="analyticsStore.likes?.feed != null" class="w-full">
                          <SparkLine :data="[2800, 3000, 3200, 3500, 3700, 3900, 4200, 4500]" color="#22c55e"
                            :width="55" :height="22" />
                        </div>
                      </div>


                    </div>
                  </div>
                </div>
              </DashboardOrderCard>
            </div>

            <!-- right-column -->
            <div class="flex flex-col gap-4 col-span-full xl:col-auto">
              <!-- top contributors -->
              <DashboardOrderCard class="gap-4">
                <div class="flex flex-col gap-4">
                  <div class="flex flex-col gap-4 min-w-0">
                    <!-- hover-overlay -->
                    <div
                      class="absolute hidden group-hover/container:flex items-start justify-end w-full h-full top-0 left-0 z-[10000]">
                      <DashboardPrimaryButton 
                      variant="none"
                      @click="openContributors"
                      customClass="group/button flex items-center justify-center gap-1 pl-[0.9375rem] pr-2 py-1 bg-transparent [clip-path:polygon(0_0,100%_0,105%_105%,16%_105%)] rounded-none border-none outline-none hover:bg-light-primary/10 dark:hover:bg-dark-primary/10 transition-colors"
                      text="Trend"
                      textClass="text-xs font-sans font-medium leading-[1.125rem] text-light-primary dark:text-dark-primary" :wrapperOverrides="[{target:'wrapper1', removeClass:true}, {target:'wrapper2', removeClass:true}]">
                      <template #rightIcon>
                        <span>
                          <img src="/dev/cdn/analytics/icons/icon-3.webp" alt="expand"
                            class="w-[.875rem] h-[.875rem]" />
                        </span>
                      </template>
                    </DashboardPrimaryButton>
                    </div>

                    <!-- title -->
                    <div class="flex items-center gap-2">
                      <h3 class="m-0 font-medium font-sans text-base leading-6 text-light-text-secondary dark:text-dark-text-secondary">Top Contributors</h3>
                    </div>
                  </div>

                  <!-- data-table -->
                  <div class="flex-grow flex-shrink [flex-basis:auto] min-w-0 min-h-0 -mx-4 -mb-4">
                    <FlexTable :columns="contributorsColumns"
                      :rows="currentContributorsInsightData.topContributors.slice(0, 6)" :theme="contributorsTheme">
                      <!-- Custom Fan Cell (Rank + Avatar + Info) -->
                      <template #cell.fan="{ row }">
                        <div class="flex items-center gap-2.5 px-3 w-full">
                          <!-- Rank -->
                          <div class="w-5 h-5 bg-black flex items-center justify-center shrink-0">
                            <span class="text-white text-sm font-bold leading-5">{{ row.rank }}</span>
                          </div>
                          <!-- User Info -->
                          <div class="flex flex-col justify-center items-start gap-0.5 overflow-hidden">
                            <div :data-value="row.name" class="truncate text-gray-900 text-xs font-semibold leading-4">
                              {{
                                row.name }}</div>
                            <div class="flex items-center gap-1">
                              <div
                                class="w-5 h-5 relative rounded-full overflow-hidden shrink-0 border border-black/10">
                                <img :src="row.avatar" class="w-full h-full object-cover" />
                              </div>
                              <span :data-value="row.handle"
                                class="truncate text-slate-700 text-xs font-normal leading-4">{{ row.handle }}</span>
                            </div>
                          </div>
                        </div>
                      </template>

                      <!-- Custom Total Cell -->
                      <template #cell.total="{ row }">
                        <div class="px-4 w-full text-right">
                          <span :data-value="row.total"
                            class="text-gray-900 text-xs font-semibold leading-4 whitespace-nowrap">{{ row.total
                            }}</span>
                        </div>
                      </template>
                      <template #empty>
                        <div class="flex flex-col items-center justify-center w-full gap-4 py-8">
                          <img src="/dev/cdn/analytics/icons/icon-6.webp" alt="No contributors"
                            class="w-24 h-24" />
                          <span class="text-base font-medium text-light-text-secondary dark:text-dark-text-secondary">No
                            top
                            contributors yet</span>
                          <a href="#" class="text-sm text-primary-600 underline">Learn how to earn</a>
                        </div>
                      </template>
                    </FlexTable>
                  </div>
                </div>
              </DashboardOrderCard>
            </div>
          </div>
        </div>
      </DashboardSectionWrapper>

      <!-- Orders Received section -->
      <DashboardAnalyticsOrdersReceivedTable />

      <!-- Trends Section -->
      <DashboardSectionWrapper>
        <div class="relative gap-6 flex flex-col">
          <!-- section-header -->
          <div class="flex flex-col gap-4 sm:flex-row px-4 pt-4 pb-0 justify-between items-start md:items-center">
            <!-- title -->
            <div class="title flex items-center gap-2 flex-grow flex-shrink basis-auto min-w-0 min-h-0">
              <span>
                <img src="/dev/cdn/analytics/icons/icon-7.webp" alt="trends" class="w-6 h-6" />
              </span>
              <h2 data-label="Trends"
                class="m-0 text-light-text-quaternary font-sans dark:text-dark-text-quaternary text-xl leading-[1.875rem] font-medium">
                Trends
              </h2>
            </div>

            <!-- tabs-button-group -->
            <div class="flex flex-col md:flex-row md:items-center gap-4 w-full sm:w-auto">
              <!-- last-date -->
              <!-- <div class="flex items-center gap-4 w-full justify-between sm:justify-end sm:w-auto">
              <span class="text-sm leading-5 font-sans text-light-text-quaternary dark:text-dark-text-quaternary">{{ $t('dashboard.analytics.page.lastUpdated') }}
                <span class="text-sm leading-5 font-sans text-light-text-quaternary dark:text-dark-text-quaternary">7:14
                  PM</span></span>
              <DashboardPrimaryButton variant="none" text="Refresh" / :wrapperOverrides="[{target:'wrapper1', removeClass:true}, {target:'wrapper2', removeClass:true}]">
            </div> -->

              <!-- tabs -->
              <DashboardTabs v-model="selectedTrendTab" :tabs="trendsTabs" />
            </div>
          </div>

          <!-- all-analytics-data -->
          <div class="analytics-container px-4 pt-0 pb-4 flex flex-col gap-4">
            <!-- row -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3">
              <DashboardAnalyticsTopMediaTable :period="selectedTrendTab.toLowerCase()" />
              <DashboardAnalyticsTopTagsTable :period="selectedTrendTab.toLowerCase()" />
              <DashboardAnalyticsTopMerchTable :period="selectedTrendTab.toLowerCase()" />
              <DashboardAnalyticsTopCountriesTable :period="selectedTrendTab.toLowerCase()" />
            </div>
          </div>


        </div>
      </DashboardSectionWrapper>

      <!-- Subscribers popup -->
      <DashboardAnalyticsSubscribersTrendPopup v-model="isSubscribersOpen" v-model:period="subscribersPeriod"
        :insight-data="currentSubscribersInsightData" />



      <!-- Earnings popup -->
      <DashboardAnalyticsEarningsTrendPopup v-model="isEarningsOpen" v-model:period="earningsPeriod"
        :insight-data="currentEarningsInsightData" />


      <!-- fans popup -->
      <DashboardAnalyticsFansTrendPopup v-model="isFansOpen" v-model:period="fansPeriod" :insight-data="currentFansInsightData" />


      <!-- likes popup -->
      <DashboardAnalyticsLikesTrendPopup v-model="isLikesOpen" v-model:period="likesPeriod" :insight-data="currentLikesInsightData" />

      <!-- contributors popup -->
      <DashboardAnalyticsContributorsTrendPopup v-model="isContributorsOpen" v-model:period="contributorsPeriod"
        :insight-data="currentContributorsInsightData" />

    </div>
  </DashboardSharedTwoColLayout>
</template>

<script setup>
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue'
import DashboardSharedTwoColLayout from '@/dev/templates/dashboard/shared/DashboardSharedTwoColLayout.vue'
import DashboardHeader from '@/components/ui/nav/AnalyticsDashboardDesktopHeaderPart.vue'
import DashboardOrderCard from '@/components/ui/card/dashboard/DashboardOrderCard.vue'
import DashboardSectionWrapper from '@/components/ui/card/dashboard/DashboardSectionWrapper.vue'
import DashboardTrendCard from '@/components/ui/card/dashboard/DashboardTrendCard.vue'
import DashboardTrendContent from '@/components/ui/card/dashboard/DashboardTrendContent.vue'
import { useDashboardAnalyticsStore } from '@/stores/useDashboardAnalyticsStore.js'
import { FlowHandler } from '@/services/flow-system/FlowHandler'
import flowRefreshManager from '@/services/flow-system/flowRefreshManager'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import DashboardAnalyticsTrendPopup from '@/components/ui/popup/DashboardAnalyticsTrendPopup.vue'
import DashboardAnalyticsEarningsTrendPopup from '@/components/ui/popup/DashboardAnalyticsEarningsTrendPopup.vue'
import DashboardAnalyticsSubscribersTrendPopup from '@/components/ui/popup/DashboardAnalyticsSubscribersTrendPopup.vue'
import DashboardAnalyticsFansTrendPopup from '@/components/ui/popup/DashboardAnalyticsFansTrendPopup.vue'
import DashboardAnalyticsLikesTrendPopup from '@/components/ui/popup/DashboardAnalyticsLikesTrendPopup.vue'
import DashboardAnalyticsContributorsTrendPopup from '@/components/ui/popup/DashboardAnalyticsContributorsTrendPopup.vue'
import FlexTable from '@/dev/components/ui/table/FlexTable.vue'
import DashboardAnalyticsOrdersReceivedTable from '@/dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsOrdersReceivedTable.vue'
import DashboardAnalyticsTopMediaTable from '@/dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsTopMediaTable.vue'
import DashboardAnalyticsTopTagsTable from '@/dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsTopTagsTable.vue'
import DashboardAnalyticsTopMerchTable from '@/dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsTopMerchTable.vue'
import DashboardAnalyticsTopCountriesTable from '@/dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsTopCountriesTable.vue'
import SparkLine from '@/components/ui/charts/SparkLine.vue'
import DashboardTabs from '@/components/ui/nav/dashboard/DashboardTabs.vue'
import DashboardStatIndicator from '@/components/ui/badge/dashboard/DashboardStatIndicator.vue'

const analyticsStore = useDashboardAnalyticsStore()
const { lastUpdated } = storeToRefs(analyticsStore)

// --- Contributors Table Data ---
const contributorsColumns = [
  { key: 'fan', label: 'Fan', grow: true, align: 'left' },
  { key: 'total', label: 'Total (USD)', basis: 'basis-32', align: 'right' }
]

const currentContributorsInsightData = computed(() => {
  const cData = analyticsStore.contributors || {};
  let p = contributorsPeriod.value.toLowerCase()
  if (p === 'all-time') p = 'alltime'

  const getPeriodArr = (source) => {
    if (!source) return []
    if (Array.isArray(source)) return source // fallback for old format
    return source[p] || [] // period format
  }

  const mapAnalyticsData = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((c, index) => {
      if (!c) return null;
      return {
        ...c,
        id: index + 1,
        rank: index + 1,
        name: c.name || 'Unknown',
        handle: c.handle || `@${(c.name || '').replace(/\s+/g, '').toLowerCase()}`,
        avatar: c.avatar || '/dev/cdn/analytics/icons/icon-8.png',
        total: `USD$ ${Number(c.usdSpent || c.totalSpent || c.totalUSD || c.tokens || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        rawTotal: c.usdSpent || c.totalSpent || c.totalUSD || c.tokens || 0
      };
    }).filter(Boolean);
  };

  return {
    topContributors: mapAnalyticsData(getPeriodArr(cData.topContributors)),
    topFans: mapAnalyticsData(getPeriodArr(cData.topFans || cData.topFirms)),
    topOrderSpenders: mapAnalyticsData(getPeriodArr(cData.topOrderSpenders))
  };
});

const contributorsTheme = {
  container: 'relative bg-transparent border-none w-full min-w-72 ',
  header: 'bg-transparent text-gray-500',
  headerRow: 'flex items-center',
  headerCell: 'px-4 py-2.5 text-sm font-normal border-b border-gray-500',
  row: 'flex items-center min-h-16 odd:bg-transparent even:bg-[#F2F4F780]  hover:bg-gray-100/30',
  cell: 'py-2 flex items-center h-full',
  footer: 'hidden'
}

// --- Earnings Top Countries Table ---
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

// --- Fans Top Countries Table ---
const fansTopCountriesColumns = [
  { key: 'media', label: 'Countries', grow: true, align: 'left' },
  { key: 'visits', label: 'Profile Visits', basis: 'basis-32', align: 'right' }
]


const trendsTabs = ['Yearly', 'Monthly', 'Weekly', 'Daily']
const selectedTrendTab = ref('Daily')
const isTrendDropdownOpen = ref(false)

// Linden: 'on open should be default bar chart for week'
const subscribersPeriod = ref('weekly')
const earningsPeriod = ref('weekly')
const fansPeriod = ref('weekly')
const likesPeriod = ref('weekly')
const contributorsPeriod = ref('weekly')

function formatComparisonLabel(period) {
  switch (period.toLowerCase()) {
    case 'daily': return 'vs last 24 hour'
    case 'weekly': return 'vs last week'
    case 'monthly': return 'vs last 30 days'
    case 'yearly': return 'vs last year'
    default: return 'vs yesterday'
  }
}

const countryCodeMap = {
  'Country 36': 'Australia',
  'Country 840': 'United States of America',
  'Country 826': 'United Kingdom',
  'Country 276': 'Germany',
  'Country 392': 'Japan',
  'Country 344': 'Hong Kong',
  'Country 702': 'Singapore',
  'Country 158': 'Taiwan',
  'Country 250': 'France',
  'Country 124': 'Canada',
  'Country 380': 'Italy',
  'Country 724': 'Spain'
}

const isoMap = {
  'Country 36': 'AU',
  'Country 840': 'US',
  'Country 826': 'GB',
  'Country 276': 'DE',
  'Country 392': 'JP',
  'Country 344': 'HK',
  'Country 702': 'SG',
  'Country 158': 'TW',
  'Country 250': 'FR',
  'Country 124': 'CA',
  'Country 380': 'IT',
  'Country 724': 'ES'
}

const currentEarningsInsightData = computed(() => {
  let tab = earningsPeriod.value.toLowerCase()
  if (tab === 'all-time') tab = 'alltime'
  const arr = analyticsStore.earnings[tab]
  const latest = arr && arr.length ? { ...arr[arr.length - 1] } : null
  if (latest) {
    const countries = analyticsStore.countries?.[tab] || []
    latest.topCountries = countries.map((c, i) => ({
      rank: c.rank || i + 1,
      country: countryCodeMap[c.country] || c.country,
      iso: isoMap[c.country] || c.iso || null,
      salesRaw: c.salesUSD || 0,
      salesUSD: c.salesUSD || 0,
      earningsUSD: c.earningsUSD || c.salesUSD || 0,
      sales: (c.salesUSD || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }))
    // FIX: Use the summary object if available, otherwise calculate the sum
    const summary = analyticsStore.earnings.summaries?.[tab]
    if (summary && summary.totalEarningsUSD != null) {
      latest.total = summary.totalEarningsUSD
      latest.totalTokens = summary.tokensReceived
    } else {
      latest.total = arr.reduce((sum, item) => sum + (item.total || 0), 0)
      latest.totalTokens = arr.reduce((sum, item) => sum + (item.totalTokens || 0), 0)
    }
  }
  return latest
})

const currentSubscribersInsightData = computed(() => {
  let p = subscribersPeriod.value.toLowerCase()
  if (p === 'all-time') p = 'yearly'
  return analyticsStore.subscriberInsights[p] || { new: null, recurring: null }
})

const currentFansInsightData = computed(() => {
  let p = fansPeriod.value.toLowerCase()
  if (p === 'all-time') p = 'alltime'
  // analyticsStore.fans[p] is an OBJECT (not an array) with: newFollowers, profileVisit, topCountries, etc.
  const fansData = analyticsStore.fans[p] || analyticsStore.fans['yearly']
  if (!fansData || fansData.newFollowers == null) {
    return { newFollowers: null, profileVisit: null, topCountries: [], sources: [] }
  }

  // Get traffic sources from bundle (fans_traffic or fanInsights.sources)
  const bundleSources = analyticsStore.fanInsights?.sources || {}
  const periodSources = bundleSources[p] || []

  // Map country names for display
  const mappedCountries = (fansData.topCountries || []).map(c => ({
    ...c,
    country: countryCodeMap[c.country] || c.country,
    visits: (c.visits || 0).toLocaleString('en-US')
  }))

  return {
    newFollowers: fansData.newFollowers,
    profileVisit: fansData.profileVisit,
    newFollowersPercentage: fansData.newFollowersPercentage,
    profileVisitPercentage: fansData.profileVisitPercentage,
    topCountries: mappedCountries,
    sources: periodSources
  }
})

const currentLikesInsightData = computed(() => {
  return analyticsStore.likes || {}
})

const trendComparisonLabel = computed(() => {
  switch (selectedTrendTab.value) {
    case 'Daily': return 'vs last 24 hour'
    case 'Weekly': return 'vs last week'
    case 'Monthly': return 'vs last 30 days'
    case 'Yearly': return 'vs last year'
    default: return 'vs yesterday'
  }
})


// --- Subscribers popup state/config ---
const isSubscribersOpen = ref(false)
function openSubscribers() {
  isSubscribersOpen.value = true
}

const isEarningsOpen = ref(false)
function openEarnings() {
  isEarningsOpen.value = true
}

const isFansOpen = ref(false)
function openFans() {
  isFansOpen.value = true
}

const isLikesOpen = ref(false)
function openLikes() {
  isLikesOpen.value = true
}

const isContributorsOpen = ref(false)
function openContributors() {
  isContributorsOpen.value = true
}

// --- Popups State ---

function formatTime(dateString) {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}



const isRefreshing = ref(false)

async function handleRefresh() {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    console.log('🔄 Refreshing analytics data...')
    const result = await FlowHandler.run('analytics.fetch', { source: 'full' })
    if (result?.meta?.notModified) {
      console.log('✅ Analytics Data Up-to-date (304 Not Modified). No changes detected on the server.')
    } else if (result?.ok) {
      console.log('✅ Analytics Data Updated from server.')
    } else {
      console.warn('❌ Refresh failed:', result?.error)
    }
  } finally {
    // Add a small artificial delay so the user can see the loading state
    setTimeout(() => {
      isRefreshing.value = false
    }, 500)
  }
}

// when component load so data will be here
onMounted(() => {
  if (window.performanceTracker) {
    window.performanceTracker.step({
      flowName: 'AnalyticsRender',
      stepName: 'DashboardAnalyticsPage Mounted',
      status: 'success'
    });
  }

  flowRefreshManager.startFromRegistry('analytics.fetch', { source: 'full' })
})

onUnmounted(() => {
  flowRefreshManager.stop('analytics.fetch')
})

</script>
