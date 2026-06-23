<template>
  <BasePopup :modelValue="modelValue" @update:modelValue="(val) => emit('update:modelValue', val)" :popup-config="popupConfig">
    <div
      class="w-full flex flex-col items-start overflow-hidden 
      shadow-[4px_0_10px_0_rgba(0,0,0,0.08)] bg-panel-light/70 
      backdrop-blur-[25px] dark:bg-panel-dark/70 md:w-[30rem] 
      md:border-l md:border-panel-light-border
       dark:md:border-panel-dark-border
        overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] h-full">
      <!-- header -->
      <div
        class="flex items-center self-stretch gap-2 p-2 pb-0 md:bg-transparent bg-background-header-light dark:bg-background-header-dark md:dark:bg-transparent">
        <div class="flex-1 flex items-center gap-2">
          <span class="flex items-center justify-start">
            <img v-if="notificationAssets.bell" :src="notificationAssets.bell" alt="" aria-hidden="true"
              class="w-5 h-5 pointer-events-none" />
          </span>
          <span class="text-sm font-semibold leading-5 text-text-secondary-light dark:text-text-secondary-dark">{{ $t('dashboard.notifications.title', 'Notifications') }}</span>
          <div class="flex">
            <span class="flex items-center justify-center w-6 h-6 p-1 rounded-[0.313rem] cursor-pointer">
              <img v-if="notificationAssets.settings" :src="notificationAssets.settings" alt="" aria-hidden="true"
                class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(22%)_sepia(31%)_saturate(534%)_hue-rotate(179deg)_brightness(93%)_contrast(90%)]" />
            </span>
          </div>
        </div>

        <div class="flex">
          <button type="button" @click="emit('update:modelValue', false)"
            class="flex items-center justify-center w-6 h-6 md:w-auto md:h-auto p-0 md:p-2 rounded-md transition-all duration-200 ease-in-out hover:bg-panel-light-buttonHover dark:hover:bg-panel-dark-buttonHover cursor-pointer">
            <img
              class="w-6 h-6 pointer-events-none hidden md:block [filter:brightness(0)_saturate(100%)_invert(45%)_sepia(13%)_saturate(594%)_hue-rotate(183deg)_brightness(92%)_contrast(92%)]"
              v-if="notificationAssets.closeDesktop" :src="notificationAssets.closeDesktop" alt="" aria-hidden="true" />
            <img
              class="block w-6 h-6 pointer-events-none md:hidden [filter:brightness(0)_saturate(100%)_invert(45%)_sepia(13%)_saturate(594%)_hue-rotate(183deg)_brightness(92%)_contrast(92%)]"
              v-if="notificationAssets.closeMobile" :src="notificationAssets.closeMobile" alt="" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- body -->
      <div
        class="flex-1 z-[1] overflow-y-auto self-stretch flex flex-col [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <!-- dashboard-notifications-tab-wrapper -->
        <div class="flex-1 self-stretch flex flex-col">
          <!-- dashboard-notifications-tab-list -->
          <div
            class="md: flex flex-col self-stretch items-start gap-2 p-2 pb-0 md:p-2 md:pb-0 md:pr-0 md:pl-0 md:bg-transparent bg-background-header-light dark:bg-background-header-dark md:dark:bg-transparent fixed md:static w-full z-[99]">
            <ul
              class="flex flex-row justify-between items-center self-stretch overflow-x-auto whitespace-nowrap scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <li class="flex-1 flex" v-for="tab in notificationTabs" :key="tab.tabId">
                <button type="button" @click.prevent="activeNotificationTab = tab.tabId" :class="[
                  'w-full flex flex-col items-center gap-2.5 whitespace-nowrap px-4 py-2 transition-all duration-200 ease-in-out',
                  activeNotificationTab === tab.tabId
                    ? 'opacity-100 shadow-[0_-1.5px_0_0_inset] shadow-border-tab-active-light dark:shadow-border-tab-active-dark'
                    : 'opacity-70 hover:opacity-100'
                ]">
                  <span class="flex items-center gap-0.5 h-8 pointer-events-none">
                    <span :class="[
                      'text-sm uppercase leading-5',
                      activeNotificationTab === tab.tabId
                        ? 'font-semibold text-text-tab-active-light dark:text-text-tab-active-dark'
                        : 'font-medium text-text-tab-light dark:text-text-tab-dark'
                    ]">{{ $t(tab.translationKey, tab.fallback) }}</span>
                    <span class="flex flex-col items-center self-stretch gap-2.5">
                      <small v-if="tab.badgeCount && tab.badgeCount !== '0' && tab.badgeCount !== 0"
                        class="text-[0.625rem] font-medium leading-none tracking-[0.016rem] text-text-badge-light dark:text-text-badge-dark">{{
                          tab.badgeCount }}</small>
                    </span>
                  </span>
                </button>
              </li>
            </ul>
          </div>

          <!-- dashboard-notifications-tab-panels -->
          <div class="flex flex-col items-stretch h-full self-stretch mt-14 md:mt-0">
            <div class="flex flex-1 justify-center self-stretch flex-col">
              <div
                class="h-[calc(100vh-6.5rem)] bg-background-notification-light/50 dark:bg-background-notification-dark/50 backdrop-blur-[50px] overflow-y-auto self-stretch flex flex-col [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div
                  class="opacity-100 visible pointer-events-auto translate-x-0 pb-1 self-stretch flex flex-col items-start">
                  <!-- notification warning -->
                  <div
                    class="relative flex justify-center items-center self-stretch border-b border-border-notification-light dark:border-border-notification-dark border-l-3 border-l-border-notification-warning-light dark:border-l-border-notification-warning-dark">
                    <div
                      class="flex-1 gap-4 pt-3 pb-3 pl-2 pr-2 z-[2] relative self-stretch flex flex-col items-start transition-all duration-150 ease-in-out [background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(253,176,34,0.15)_0,rgba(253,176,34,0.15)_100%),rgba(255,255,255,0.9)] dark:[background:linear-gradient(90deg,rgba(24,26,27,0)_0px,rgba(24,26,27,0.9)_100%),linear-gradient(0deg,rgba(183,119,2,0.15)_0px,rgba(183,119,2,0.15)_100%)] dark:bg-background-notification-panel-dark">
                      <div class="relative flex justify-start items-start self-stretch gap-5">
                        <!-- Warning Notification Icon -->
                        <div
                          class="relative flex justify-center items-center w-10 h-10 rounded-lg bg-[rgba(253,176,34,0.1)] dark:bg-[rgba(183,119,2,0.1)]">
                          <img v-if="notificationAssets.film" :src="notificationAssets.film" alt="" aria-hidden="true"
                            class="w-6 h-6 min-w-[1.5rem] [filter:brightness(0)_saturate(100%)_invert(81%)_sepia(13%)_saturate(5746%)_hue-rotate(341deg)_brightness(102%)_contrast(98%)]" />
                          <div
                            class="absolute -bottom-[0.563rem] -right-[0.563rem] flex justify-center items-center w-[1.375rem] h-[1.375rem] rounded-lg bg-[#fdb022] dark:bg-[#b77702]">
                            <img v-if="notificationAssets.upload" :src="notificationAssets.upload" alt="" aria-hidden="true"
                              class="w-4 h-4 opacity-90 [filter:brightness(0)_saturate(100%)_invert(99%)_sepia(99%)_saturate(0)_hue-rotate(176deg)_brightness(107%)_contrast(100%)]" />
                          </div>
                        </div>

                        <!-- dashboard-notifications-item-content -->
                        <div class="flex-1 self-stretch flex flex-col items-start">
                          <!-- dashboard-notifications-item-body -->
                          <div class="self-stretch flex flex-col items-start">
                            <!-- text -->
                            <div class="self-stretch flex justify-start items-start pr-6 pt-2">
                              <p
                                class="text-sm leading-5 font-normal text-text-notification-light dark:text-text-notification-dark">
                                {{ $t('dashboard.notifications.mock.mediaRequired', 'Media Content Required: Your profile currently has no media. Enhance your profile\'s visibility by adding at least 5 media items.') }}
                              </p>
                            </div>

                            <!-- dashboard-notifications-item-footer -->
                            <div class="self-stretch flex justify-between items-end pt-2 gap-2">
                              <!-- time -->
                              <div class="flex justify-start items-end">
                                <span
                                  class="text-xs leading-[1.125rem] text-text-time-light dark:text-text-time-dark">{{ $t('dashboard.notifications.time.oneWeek', '1w') }}</span>
                              </div>

                              <!-- actions -->
                              <div class="flex items-end gap-2">
                                <!-- cta-dismiss -->
                                <button type="button" 
                                  class="group flex items-center gap-0.5 transition-all duration-200 ease-in-out md:flex hidden">
                                  <span
                                    class="text-xs leading-[1.125rem] font-medium transition-all duration-200 ease-in-out text-cta-dismiss-light dark:text-cta-dismiss-dark group-hover:text-cta-dismiss-hover dark:group-hover:text-cta-dismiss-hover">{{ $t('dashboard.notification.action.dismiss', 'Dismiss') }}</span>
                                  <span>
                                    <img v-if="notificationAssets.dismiss" :src="notificationAssets.dismiss" alt="" aria-hidden="true"
                                      class="h-4 w-4 transition-all duration-200 ease-in-out [filter:brightness(0)_saturate(100%)_invert(22%)_sepia(31%)_saturate(534%)_hue-rotate(179deg)_brightness(93%)_contrast(90%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(37%)_sepia(57%)_saturate(6169%)_hue-rotate(214deg)_brightness(91%)_contrast(106%)]" />
                                  </span>
                                </button>

                                <!-- cta-->
                                <button type="button" 
                                  class="group flex items-center gap-0.5 transition-all duration-200 ease-in-out">
                                  <span
                                    class="text-xs leading-[1.125rem] font-medium transition-all duration-200 ease-in-out text-cta-warning-light dark:text-cta-warning-dark group-hover:text-cta-dismiss-hover dark:group-hover:text-cta-dismiss-hover">{{ $t('dashboard.notification.action.takeAction', 'Take Action') }}</span>
                                  <span>
                                    <img v-if="notificationAssets.dismiss" :src="notificationAssets.dismiss" alt="" aria-hidden="true"
                                      class="h-4 w-4 transition-all duration-200 ease-in-out [filter:brightness(0)_saturate(100%)_invert(24%)_sepia(100%)_saturate(1622%)_hue-rotate(10deg)_brightness(98%)_contrast(94%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(37%)_sepia(57%)_saturate(6169%)_hue-rotate(214deg)_brightness(91%)_contrast(106%)]" />
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- notification success -->
                  <div
                    class="relative flex justify-center items-center self-stretch border-b border-border-notification-light dark:border-border-notification-dark border-l-3 border-l-border-notification-success-light dark:border-l-border-notification-success-dark">
                    <div
                      class="flex-1 gap-4 pt-3 pb-3 pl-2 pr-2 z-[2] relative self-stretch flex flex-col items-start transition-all duration-150 ease-in-out [background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(46,211,183,0.15)_0,rgba(46,211,183,0.15)_100%),rgba(255,255,255,0.9)] dark:[background:linear-gradient(90deg,rgba(24,26,27,0)_0px,rgba(24,26,27,0.9)_100%),linear-gradient(0deg,rgba(35,168,151,0.15)_0px,rgba(35,168,151,0.15)_100%)] dark:bg-background-notification-panel-dark">
                      <div class="relative flex justify-start items-start self-stretch gap-5">
                        <!-- notification-close -->
                        <button type="button" 
                          class="absolute right-0 top-0 flex justify-center items-center w-6 h-6 hidden md:block">
                          <img v-if="notificationAssets.closeSmall" :src="notificationAssets.closeSmall" alt="" aria-hidden="true"
                            class="w-4 h-4 pointer-events-none" />
                        </button>

                        <!-- Success Notification Icon -->
                        <div
                          class="relative flex justify-center items-center w-10 h-10 rounded-lg bg-[rgba(46,211,183,0.1)] dark:bg-[rgba(35,168,151,0.1)]">
                          <img v-if="notificationAssets.placeholder" :src="notificationAssets.placeholder" alt="" aria-hidden="true"
                            class="w-full h-full" />
                          <div
                            class="absolute -bottom-[0.563rem] -right-[0.563rem] flex justify-center items-center w-[1.375rem] h-[1.375rem] rounded-lg bg-[#2ed3b7] dark:bg-[#23a897]">
                            <img v-if="notificationAssets.upload" :src="notificationAssets.upload" alt="" aria-hidden="true"
                              class="w-4 h-4 opacity-90 [filter:brightness(0)_saturate(100%)_invert(99%)_sepia(99%)_saturate(0)_hue-rotate(176deg)_brightness(107%)_contrast(100%)]" />
                          </div>
                        </div>

                        <!-- dashboard-notifications-item-content -->
                        <div class="flex-1 self-stretch flex flex-col items-start">
                          <!-- dashboard-notifications-item-body -->
                          <div class="self-stretch flex flex-col items-start">
                            <!-- text -->
                            <div class="self-stretch flex justify-start items-start pr-6 pt-2">
                              <p
                                class="text-sm leading-5 font-normal text-text-notification-light dark:text-text-notification-dark">
                                {{ $t('dashboard.notifications.mock.mediaApproved', 'Congratulations: Your media \'Audio with placeholder and no preview\' has been approved.') }}
                              </p>
                            </div>

                            <!-- dashboard-notifications-item-footer -->
                            <div class="self-stretch flex justify-between items-end pt-2 gap-2">
                              <!-- time -->
                              <div class="flex justify-start items-end">
                                <span
                                  class="text-xs leading-[1.125rem] text-text-time-light dark:text-text-time-dark">{{ $t('dashboard.notifications.time.oneMinute', '1m') }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- notification info -->
                  <div
                    class="relative flex justify-center items-center self-stretch border-b border-border-notification-light dark:border-border-notification-dark border-l-3 border-l-border-notification-info-light dark:border-l-border-notification-info-dark">
                    <div
                      class="flex-1 gap-4 pt-3 pb-3 pl-2 pr-2 z-[2] relative self-stretch flex flex-col items-start transition-all duration-150 ease-in-out [background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(34,204,238,0.15)_0,rgba(34,204,238,0.15)_100%),rgba(255,255,255,0.9)] dark:[background:linear-gradient(90deg,rgba(24,26,27,0)_0px,rgba(24,26,27,0.9)_100%),linear-gradient(0deg,rgba(14,152,180,0.15)_0px,rgba(14,152,180,0.15)_100%)] dark:bg-background-notification-panel-dark">
                      <div class="relative flex justify-start items-start self-stretch gap-5">
                        <!-- notification-close -->
                        <button type="button" 
                          class="absolute right-0 top-0 flex justify-center items-center w-6 h-6 hidden md:block">
                          <img v-if="notificationAssets.closeSmall" :src="notificationAssets.closeSmall" alt="" aria-hidden="true"
                            class="w-4 h-4 pointer-events-none" />
                        </button>

                        <!-- Info Notification Icon -->
                        <div
                          class="relative flex justify-center items-center w-10 h-10 rounded-lg bg-[rgba(34,204,238,0.1)] dark:bg-[rgba(14,152,180,0.1)]">
                          <img v-if="notificationAssets.userPlaceholder" :src="notificationAssets.userPlaceholder" alt="" aria-hidden="true"
                            class="w-6 h-6 min-w-[1.5rem] [filter:brightness(0)_saturate(100%)_invert(67%)_sepia(37%)_saturate(913%)_hue-rotate(145deg)_brightness(95%)_contrast(97%)]" />
                          <div
                            class="absolute -bottom-[0.563rem] -right-[0.563rem] flex justify-center items-center w-[1.375rem] h-[1.375rem] rounded-lg bg-[#2ce] dark:bg-[#0e98b4]">
                            <img v-if="notificationAssets.comment" :src="notificationAssets.comment" alt="" aria-hidden="true"
                              class="w-4 h-4 opacity-90 [filter:brightness(0)_saturate(100%)_invert(99%)_sepia(99%)_saturate(0)_hue-rotate(176deg)_brightness(107%)_contrast(100%)]" />
                          </div>
                        </div>

                        <!-- dashboard-notifications-item-content -->
                        <div class="flex-1 self-stretch flex flex-col items-start">
                          <!-- dashboard-notifications-item-body -->
                          <div class="self-stretch flex flex-col items-start">
                            <!-- text -->
                            <div class="self-stretch flex justify-start items-start pr-6 pt-2">
                              
                              <p
                                class="text-sm leading-5 font-normal text-text-notification-light dark:text-text-notification-dark">
                                {{ $t('dashboard.notifications.mock.bankRequired', 'Bank Details Required: To ensure seamless transactions, please complete your bank information.') }}
                              </p>
                            </div>

                            <!-- dashboard-notifications-item-footer -->
                            <div class="self-stretch flex justify-between items-end pt-2 gap-2">
                              <!-- time -->
                              <div class="flex justify-start items-end">
                                <span
                                  class="text-xs leading-[1.125rem] text-text-time-light dark:text-text-time-dark">{{ $t('dashboard.notifications.time.threeMinutes', '3m') }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- notification destructive -->
                  <div
                    class="relative flex justify-center items-center self-stretch border-b border-border-notification-light dark:border-border-notification-dark border-l-3 border-l-border-notification-destructive-light dark:border-l-border-notification-destructive-dark">
                    <div
                      class="flex-1 gap-4 pt-3 pb-3 pl-2 pr-2 z-[2] relative self-stretch flex flex-col items-start transition-all duration-150 ease-in-out [background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(255,68,5,0.1)_0,rgba(255,68,5,0.1)_100%),rgba(255,255,255,0.9)] dark:[background:linear-gradient(90deg,rgba(24,26,27,0)_0px,rgba(24,26,27,0.9)_100%),linear-gradient(0deg,rgba(201,51,0,0.1)_0px,rgba(201,51,0,0.1)_100%)] dark:bg-background-notification-panel-dark">
                      <div class="relative flex justify-start items-start self-stretch gap-5">
                        <!-- notification-close -->
                        <button type="button" 
                          class="absolute right-0 top-0 flex justify-center items-center w-6 h-6 hidden md:block">
                          <img v-if="notificationAssets.closeSmall" :src="notificationAssets.closeSmall" alt="" aria-hidden="true"
                            class="w-4 h-4 pointer-events-none" />
                        </button>

                        <!-- Destructive Notification Icon -->
                        <div
                          class="relative flex justify-center items-center w-10 h-10 rounded-lg bg-[rgba(255,68,5,0.1)] dark:bg-[rgba(201,51,0,0.1)]">
                          <img v-if="notificationAssets.heart" :src="notificationAssets.heart" alt="" aria-hidden="true"
                            class="w-6 h-6 min-w-[1.5rem] [filter:brightness(0)_saturate(100%)_invert(42%)_sepia(53%)_saturate(6174%)_hue-rotate(356deg)_brightness(98%)_contrast(105%)]" />
                          <div
                            class="absolute -bottom-[0.563rem] -right-[0.563rem] flex justify-center items-center w-[1.375rem] h-[1.375rem] rounded-lg bg-[#ff4405] dark:bg-[#c93300]">
                            <img v-if="notificationAssets.tip" :src="notificationAssets.tip" alt="" aria-hidden="true"
                              class="w-4 h-4 opacity-90 [filter:brightness(0)_saturate(100%)_invert(99%)_sepia(99%)_saturate(0)_hue-rotate(176deg)_brightness(107%)_contrast(100%)]" />
                          </div>
                        </div>

                        <!-- dashboard-notifications-item-content -->
                        <div class="flex-1 self-stretch flex flex-col items-start">
                          <!-- dashboard-notifications-item-body -->
                          <div class="self-stretch flex flex-col items-start">
                            <!-- text -->
                            <div class="self-stretch flex justify-start items-start pr-6 pt-2">
                              <p
                                class="text-sm leading-5 font-normal text-text-notification-light dark:text-text-notification-dark">
                                {{ $t('dashboard.notifications.mock.bankRequired', 'Bank Details Required: To ensure seamless transactions, please complete your bank information.') }}
                              </p>
                            </div>

                            <!-- dashboard-notifications-item-footer -->
                            <div class="self-stretch flex justify-between items-end pt-2 gap-2">
                              <!-- time -->
                              <div class="flex justify-start items-end">
                                <span
                                  class="text-xs leading-[1.125rem] text-text-time-light dark:text-text-time-dark">{{ $t('dashboard.notifications.time.threeMinutes', '3m') }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- notification warning -->
                  <div
                    class="relative flex justify-center items-center self-stretch border-b border-border-notification-light dark:border-border-notification-dark border-l-3 border-l-border-notification-warning-light dark:border-l-border-notification-warning-dark">
                    <div
                      class="flex-1 gap-4 pt-3 pb-3 pl-2 pr-2 z-[2] relative self-stretch flex flex-col items-start transition-all duration-150 ease-in-out [background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(253,176,34,0.15)_0,rgba(253,176,34,0.15)_100%),rgba(255,255,255,0.9)] dark:[background:linear-gradient(90deg,rgba(24,26,27,0)_0px,rgba(24,26,27,0.9)_100%),linear-gradient(0deg,rgba(183,119,2,0.15)_0px,rgba(183,119,2,0.15)_100%)] dark:bg-background-notification-panel-dark">
                      <div class="relative flex justify-start items-start self-stretch gap-5">
                        <!-- Warning Notification Icon -->
                        <div
                          class="relative flex justify-center items-center w-10 h-10 rounded-lg bg-[rgba(253,176,34,0.1)] dark:bg-[rgba(183,119,2,0.1)]">
                          <img v-if="notificationAssets.film" :src="notificationAssets.film" alt="" aria-hidden="true"
                            class="w-6 h-6 min-w-[1.5rem] [filter:brightness(0)_saturate(100%)_invert(81%)_sepia(13%)_saturate(5746%)_hue-rotate(341deg)_brightness(102%)_contrast(98%)]" />
                          <div
                            class="absolute -bottom-[0.563rem] -right-[0.563rem] flex justify-center items-center w-[1.375rem] h-[1.375rem] rounded-lg bg-[#fdb022] dark:bg-[#b77702]">
                            <img v-if="notificationAssets.upload" :src="notificationAssets.upload" alt="" aria-hidden="true"
                              class="w-4 h-4 opacity-90 [filter:brightness(0)_saturate(100%)_invert(99%)_sepia(99%)_saturate(0)_hue-rotate(176deg)_brightness(107%)_contrast(100%)]" />
                          </div>
                        </div>

                        <!-- dashboard-notifications-item-content -->
                        <div class="flex-1 self-stretch flex flex-col items-start">
                          <!-- dashboard-notifications-item-body -->
                          <div class="self-stretch flex flex-col items-start">
                            <!-- text -->
                            <div class="self-stretch flex justify-start items-start pr-6 pt-2">
                              <p
                                class="text-sm leading-5 font-normal text-text-notification-light dark:text-text-notification-dark">
                                {{ $t('dashboard.notifications.mock.mediaRequired', 'Media Content Required: Your profile currently has no media. Enhance your profile\'s visibility by adding at least 5 media items.') }}
                              </p>
                            </div>

                            <!-- dashboard-notifications-item-footer -->
                            <div class="self-stretch flex justify-between items-end pt-2 gap-2">
                              <!-- time -->
                              <div class="flex justify-start items-end">
                                <span
                                  class="text-xs leading-[1.125rem] text-text-time-light dark:text-text-time-dark">{{ $t('dashboard.notifications.time.oneWeek', '1w') }}</span>
                              </div>

                              <!-- actions -->
                              <div class="flex items-end gap-2">
                                <!-- cta-dismiss -->
                                <button type="button" 
                                  class="group flex items-center gap-0.5 transition-all duration-200 ease-in-out md:flex hidden">
                                  <span
                                    class="text-xs leading-[1.125rem] font-medium transition-all duration-200 ease-in-out text-cta-dismiss-light dark:text-cta-dismiss-dark group-hover:text-cta-dismiss-hover dark:group-hover:text-cta-dismiss-hover">{{ $t('dashboard.notification.action.dismiss', 'Dismiss') }}</span>
                                  <span>
                                    <img v-if="notificationAssets.dismiss" :src="notificationAssets.dismiss" alt="" aria-hidden="true"
                                      class="h-4 w-4 transition-all duration-200 ease-in-out [filter:brightness(0)_saturate(100%)_invert(22%)_sepia(31%)_saturate(534%)_hue-rotate(179deg)_brightness(93%)_contrast(90%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(37%)_sepia(57%)_saturate(6169%)_hue-rotate(214deg)_brightness(91%)_contrast(106%)]" />
                                  </span>
                                </button>

                                <!-- cta-->
                                <button type="button" 
                                  class="group flex items-center gap-0.5 transition-all duration-200 ease-in-out">
                                  <span
                                    class="text-xs leading-[1.125rem] font-medium transition-all duration-200 ease-in-out text-cta-warning-light dark:text-cta-warning-dark group-hover:text-cta-dismiss-hover dark:group-hover:text-cta-dismiss-hover">{{ $t('dashboard.notification.action.takeAction', 'Take Action') }}</span>
                                  <span>
                                    <img v-if="notificationAssets.dismiss" :src="notificationAssets.dismiss" alt="" aria-hidden="true"
                                      class="h-4 w-4 transition-all duration-200 ease-in-out [filter:brightness(0)_saturate(100%)_invert(24%)_sepia(100%)_saturate(1622%)_hue-rotate(10deg)_brightness(98%)_contrast(94%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(37%)_sepia(57%)_saturate(6169%)_hue-rotate(214deg)_brightness(91%)_contrast(106%)]" />
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- notification success -->
                  <div
                    class="relative flex justify-center items-center self-stretch border-b border-border-notification-light dark:border-border-notification-dark border-l-3 border-l-border-notification-success-light dark:border-l-border-notification-success-dark">
                    <div
                      class="flex-1 gap-4 pt-3 pb-3 pl-2 pr-2 z-[2] relative self-stretch flex flex-col items-start transition-all duration-150 ease-in-out [background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(46,211,183,0.15)_0,rgba(46,211,183,0.15)_100%),rgba(255,255,255,0.9)] dark:[background:linear-gradient(90deg,rgba(24,26,27,0)_0px,rgba(24,26,27,0.9)_100%),linear-gradient(0deg,rgba(35,168,151,0.15)_0px,rgba(35,168,151,0.15)_100%)] dark:bg-background-notification-panel-dark">
                      <div class="relative flex justify-start items-start self-stretch gap-5">
                        <!-- Success Notification Icon -->
                        <div
                          class="relative flex justify-center items-center w-10 h-10 rounded-lg bg-[rgba(46,211,183,0.1)] dark:bg-[rgba(35,168,151,0.1)]">
                          <img v-if="notificationAssets.placeholder" :src="notificationAssets.placeholder" alt="" aria-hidden="true"
                            class="w-full h-full" />
                          <div
                            class="absolute -bottom-[0.563rem] -right-[0.563rem] flex justify-center items-center w-[1.375rem] h-[1.375rem] rounded-lg bg-[#2ed3b7] dark:bg-[#23a897]">
                            <img v-if="notificationAssets.upload" :src="notificationAssets.upload" alt="" aria-hidden="true"
                              class="w-4 h-4 opacity-90 [filter:brightness(0)_saturate(100%)_invert(99%)_sepia(99%)_saturate(0)_hue-rotate(176deg)_brightness(107%)_contrast(100%)]" />
                          </div>
                        </div>

                        <!-- dashboard-notifications-item-content -->
                        <div class="flex-1 self-stretch flex flex-col items-start">
                          <!-- dashboard-notifications-item-body -->
                          <div class="self-stretch flex flex-col items-start">
                            <!-- text -->
                            <div class="self-stretch flex justify-start items-start pr-6 pt-2">
                              <p
                                class="text-sm leading-5 font-normal text-text-notification-light dark:text-text-notification-dark">
                                {{ $t('dashboard.notifications.mock.mediaApproved', 'Congratulations: Your media \'Audio with placeholder and no preview\' has been approved.') }}
                              </p>
                            </div>

                            <!-- dashboard-notifications-item-footer -->
                            <div class="self-stretch flex justify-between items-end pt-2 gap-2">
                              <!-- time -->
                              <div class="flex justify-start items-end">
                                <span
                                  class="text-xs leading-[1.125rem] text-text-time-light dark:text-text-time-dark">{{ $t('dashboard.notifications.time.oneMinute', '1m') }}</span>
                              </div>

                              <!-- actions -->
                              <div class="flex items-end gap-2">
                                <!-- cta-dismiss -->
                                <button type="button" 
                                  class="group flex items-center gap-0.5 transition-all duration-200 ease-in-out md:flex hidden">
                                  <span
                                    class="text-xs leading-[1.125rem] font-medium transition-all duration-200 ease-in-out text-cta-dismiss-light dark:text-cta-dismiss-dark group-hover:text-cta-dismiss-hover dark:group-hover:text-cta-dismiss-hover">{{ $t('dashboard.notification.action.dismiss', 'Dismiss') }}</span>
                                  <span>
                                    <img v-if="notificationAssets.dismiss" :src="notificationAssets.dismiss" alt="" aria-hidden="true"
                                      class="h-4 w-4 transition-all duration-200 ease-in-out [filter:brightness(0)_saturate(100%)_invert(22%)_sepia(31%)_saturate(534%)_hue-rotate(179deg)_brightness(93%)_contrast(90%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(37%)_sepia(57%)_saturate(6169%)_hue-rotate(214deg)_brightness(91%)_contrast(106%)]" />
                                  </span>
                                </button>

                                <!-- cta-->
                                <button type="button" 
                                  class="group flex items-center gap-0.5 transition-all duration-200 ease-in-out">
                                  <span
                                    class="text-xs leading-[1.125rem] font-medium transition-all duration-200 ease-in-out text-cta-success-light dark:text-cta-success-dark group-hover:text-cta-dismiss-hover dark:group-hover:text-cta-dismiss-hover">{{ $t('dashboard.notification.action.takeAction', 'Take Action') }}</span>
                                  <span>
                                    <img v-if="notificationAssets.dismiss" :src="notificationAssets.dismiss" alt="" aria-hidden="true"
                                      class="h-4 w-4 transition-all duration-200 ease-in-out [filter:brightness(0)_saturate(100%)_invert(34%)_sepia(63%)_saturate(508%)_hue-rotate(123deg)_brightness(94%)_contrast(97%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(37%)_sepia(57%)_saturate(6169%)_hue-rotate(214deg)_brightness(91%)_contrast(106%)]" />
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- notification info -->
                  <div
                    class="relative flex justify-center items-center self-stretch border-b border-border-notification-light dark:border-border-notification-dark border-l-3 border-l-border-notification-info-light dark:border-l-border-notification-info-dark">
                    <div
                      class="flex-1 gap-4 pt-3 pb-3 pl-2 pr-2 z-[2] relative self-stretch flex flex-col items-start transition-all duration-150 ease-in-out [background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(34,204,238,0.15)_0,rgba(34,204,238,0.15)_100%),rgba(255,255,255,0.9)] dark:[background:linear-gradient(90deg,rgba(24,26,27,0)_0px,rgba(24,26,27,0.9)_100%),linear-gradient(0deg,rgba(14,152,180,0.15)_0px,rgba(14,152,180,0.15)_100%)] dark:bg-background-notification-panel-dark">
                      <div class="relative flex justify-start items-start self-stretch gap-5">
                        <!-- Info Notification Icon -->
                        <div
                          class="relative flex justify-center items-center w-10 h-10 rounded-lg bg-[rgba(34,204,238,0.1)] dark:bg-[rgba(14,152,180,0.1)]">
                          <img v-if="notificationAssets.userPlaceholder" :src="notificationAssets.userPlaceholder" alt="" aria-hidden="true"
                            class="w-6 h-6 min-w-[1.5rem] [filter:brightness(0)_saturate(100%)_invert(67%)_sepia(37%)_saturate(913%)_hue-rotate(145deg)_brightness(95%)_contrast(97%)]" />
                          <div
                            class="absolute -bottom-[0.563rem] -right-[0.563rem] flex justify-center items-center w-[1.375rem] h-[1.375rem] rounded-lg bg-[#2ce] dark:bg-[#0e98b4]">
                            <img v-if="notificationAssets.comment" :src="notificationAssets.comment" alt="" aria-hidden="true"
                              class="w-4 h-4 opacity-90 [filter:brightness(0)_saturate(100%)_invert(99%)_sepia(99%)_saturate(0)_hue-rotate(176deg)_brightness(107%)_contrast(100%)]" />
                          </div>
                        </div>

                        <!-- dashboard-notifications-item-content -->
                        <div class="flex-1 self-stretch flex flex-col items-start">
                          <!-- dashboard-notifications-item-body -->
                          <div class="self-stretch flex flex-col items-start">
                            <!-- text -->
                            <div class="self-stretch flex justify-start items-start pr-6 pt-2">
                              <p
                                class="text-sm leading-5 font-normal text-text-notification-light dark:text-text-notification-dark">
                                {{ $t('dashboard.notifications.mock.bankRequired', 'Bank Details Required: To ensure seamless transactions, please complete your bank information.') }}
                              </p>
                            </div>

                            <!-- dashboard-notifications-item-footer -->
                            <div class="self-stretch flex justify-between items-end pt-2 gap-2">
                              <!-- time -->
                              <div class="flex justify-start items-end">
                                <span
                                  class="text-xs leading-[1.125rem] text-text-time-light dark:text-text-time-dark">{{ $t('dashboard.notifications.time.threeMinutes', '3m') }}</span>
                              </div>

                              <!-- actions -->
                              <div class="flex items-end gap-2">
                                <!-- cta-dismiss -->
                                <button type="button" 
                                  class="group flex items-center gap-0.5 transition-all duration-200 ease-in-out md:flex hidden">
                                  <span
                                    class="text-xs leading-[1.125rem] font-medium transition-all duration-200 ease-in-out text-cta-dismiss-light dark:text-cta-dismiss-dark group-hover:text-cta-dismiss-hover dark:group-hover:text-cta-dismiss-hover">{{ $t('dashboard.notification.action.dismiss', 'Dismiss') }}</span>
                                  <span>
                                    <img v-if="notificationAssets.dismiss" :src="notificationAssets.dismiss" alt="" aria-hidden="true"
                                      class="h-4 w-4 transition-all duration-200 ease-in-out [filter:brightness(0)_saturate(100%)_invert(22%)_sepia(31%)_saturate(534%)_hue-rotate(179deg)_brightness(93%)_contrast(90%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(37%)_sepia(57%)_saturate(6169%)_hue-rotate(214deg)_brightness(91%)_contrast(106%)]" />
                                  </span>
                                </button>

                                <!-- cta-->
                                <button type="button" 
                                  class="group flex items-center gap-0.5 transition-all duration-200 ease-in-out">
                                  <span
                                    class="text-xs leading-[1.125rem] font-medium transition-all duration-200 ease-in-out text-cta-info-light dark:text-cta-info-dark group-hover:text-cta-dismiss-hover dark:group-hover:text-cta-dismiss-hover">{{ $t('dashboard.notification.action.takeAction', 'Take Action') }}</span>
                                  <span>
                                    <img v-if="notificationAssets.dismiss" :src="notificationAssets.dismiss" alt="" aria-hidden="true"
                                      class="h-4 w-4 transition-all duration-200 ease-in-out [filter:brightness(0)_saturate(100%)_invert(39%)_sepia(96%)_saturate(762%)_hue-rotate(157deg)_brightness(88%)_contrast(94%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(37%)_sepia(57%)_saturate(6169%)_hue-rotate(214deg)_brightness(91%)_contrast(106%)]" />
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- notification destructive -->
                  <div
                    class="relative flex justify-center items-center self-stretch border-b border-border-notification-light dark:border-border-notification-dark border-l-3 border-l-border-notification-destructive-light dark:border-l-border-notification-destructive-dark">
                    <div
                      class="flex-1 gap-4 pt-3 pb-3 pl-2 pr-2 z-[2] relative self-stretch flex flex-col items-start transition-all duration-150 ease-in-out [background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(255,68,5,0.1)_0,rgba(255,68,5,0.1)_100%),rgba(255,255,255,0.9)] dark:[background:linear-gradient(90deg,rgba(24,26,27,0)_0px,rgba(24,26,27,0.9)_100%),linear-gradient(0deg,rgba(201,51,0,0.1)_0px,rgba(201,51,0,0.1)_100%)] dark:bg-background-notification-panel-dark">
                      <div class="relative flex justify-start items-start self-stretch gap-5">
                        <!-- Destructive Notification Icon -->
                        <div
                          class="relative flex justify-center items-center w-10 h-10 rounded-lg bg-[rgba(255,68,5,0.1)] dark:bg-[rgba(201,51,0,0.1)]">
                          <img v-if="notificationAssets.heart" :src="notificationAssets.heart" alt="" aria-hidden="true"
                            class="w-6 h-6 min-w-[1.5rem] [filter:brightness(0)_saturate(100%)_invert(42%)_sepia(53%)_saturate(6174%)_hue-rotate(356deg)_brightness(98%)_contrast(105%)]" />
                          <div
                            class="absolute -bottom-[0.563rem] -right-[0.563rem] flex justify-center items-center w-[1.375rem] h-[1.375rem] rounded-lg bg-[#ff4405] dark:bg-[#c93300]">
                            <img v-if="notificationAssets.tip" :src="notificationAssets.tip" alt="" aria-hidden="true"
                              class="w-4 h-4 opacity-90 [filter:brightness(0)_saturate(100%)_invert(99%)_sepia(99%)_saturate(0)_hue-rotate(176deg)_brightness(107%)_contrast(100%)]" />
                          </div>
                        </div>

                        <!-- dashboard-notifications-item-content -->
                        <div class="flex-1 self-stretch flex flex-col items-start">
                          <!-- dashboard-notifications-item-body -->
                          <div class="self-stretch flex flex-col items-start">
                            <!-- text -->
                            <div class="self-stretch flex justify-start items-start pr-6 pt-2">
                              <p
                                class="text-sm leading-5 font-normal text-text-notification-light dark:text-text-notification-dark">
                                {{ $t('dashboard.notifications.mock.bankRequired', 'Bank Details Required: To ensure seamless transactions, please complete your bank information.') }}
                              </p>
                            </div>

                            <!-- dashboard-notifications-item-footer -->
                            <div class="self-stretch flex justify-between items-end pt-2 gap-2">
                              <!-- time -->
                              <div class="flex justify-start items-end">
                                <span
                                  class="text-xs leading-[1.125rem] text-text-time-light dark:text-text-time-dark">{{ $t('dashboard.notifications.time.threeMinutes', '3m') }}</span>
                              </div>

                              <!-- actions -->
                              <div class="flex items-end gap-2">
                                <!-- cta-dismiss -->
                                <button type="button" 
                                  class="group flex items-center gap-0.5 transition-all duration-200 ease-in-out md:flex hidden">
                                  <span
                                    class="text-xs leading-[1.125rem] font-medium transition-all duration-200 ease-in-out text-cta-dismiss-light dark:text-cta-dismiss-dark group-hover:text-cta-dismiss-hover dark:group-hover:text-cta-dismiss-hover">{{ $t('dashboard.notification.action.dismiss', 'Dismiss') }}</span>
                                  <span>
                                    <img v-if="notificationAssets.dismiss" :src="notificationAssets.dismiss" alt="" aria-hidden="true"
                                      class="h-4 w-4 transition-all duration-200 ease-in-out [filter:brightness(0)_saturate(100%)_invert(22%)_sepia(31%)_saturate(534%)_hue-rotate(179deg)_brightness(93%)_contrast(90%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(37%)_sepia(57%)_saturate(6169%)_hue-rotate(214deg)_brightness(91%)_contrast(106%)]" />
                                  </span>
                                </button>

                                <!-- cta-->
                                <button type="button" 
                                  class="group flex items-center gap-0.5 transition-all duration-200 ease-in-out">
                                  <span
                                    class="text-xs leading-[1.125rem] font-medium transition-all duration-200 ease-in-out text-cta-destructive-light dark:text-cta-destructive-dark group-hover:text-cta-dismiss-hover dark:group-hover:text-cta-dismiss-hover">{{ $t('dashboard.notification.action.takeAction', 'Take Action') }}</span>
                                  <span>
                                    <img v-if="notificationAssets.dismiss" :src="notificationAssets.dismiss" alt="" aria-hidden="true"
                                      class="h-4 w-4 transition-all duration-200 ease-in-out [filter:brightness(0)_saturate(100%)_invert(12%)_sepia(50%)_saturate(4284%)_hue-rotate(351deg)_brightness(115%)_contrast(102%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(37%)_sepia(57%)_saturate(6169%)_hue-rotate(214deg)_brightness(91%)_contrast(106%)]" />
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BasePopup>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

defineOptions({ name: 'DashboardNotificationPopup' });
import { ref, computed, onBeforeMount } from "vue";
import BasePopup from "./BasePopup.vue";
import { resolveSharedComponentAssets } from '@/systems/assets/resolveSharedComponentAssets.js';

const notificationAssets = ref({
  closeMobile: null,
  closeDesktop: null,
  bell: null,
  settings: null,
  film: null,
  upload: null,
  dismiss: null,
  closeSmall: null,
  placeholder: null,
  userPlaceholder: null,
  comment: null,
  heart: null,
  tip: null
});

onBeforeMount(async () => {
  try {
    const resolved = await resolveSharedComponentAssets('dashboardNotificationPopup');
    Object.assign(notificationAssets.value, resolved);
  } catch (error) {
    console.error('[DashboardNotificationPopup] Failed to load assets:', error);
  }
});

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  popupConfig: Object,
});

const emit = defineEmits(["update:modelValue"]);

import { useDashboardNavStore } from '@/stores/useDashboardNavStore';

const navStore = useDashboardNavStore();

const NOTIFICATION_TAB_ID_ALL = 'all';
const NOTIFICATION_TAB_ID_UNREAD = 'unread';
const NOTIFICATION_TAB_ID_CUSTOM_REQUESTS = 'custom-requests';
const NOTIFICATION_TAB_ID_ACCOUNT = 'account';

const notificationTabs = computed(() => [
  { tabId: NOTIFICATION_TAB_ID_ALL, translationKey: 'dashboard.notifications.tabs.all', fallback: 'All', badgeCount: navStore.getTabBadgeCount(NOTIFICATION_TAB_ID_ALL) },
  { tabId: NOTIFICATION_TAB_ID_UNREAD, translationKey: 'dashboard.notifications.tabs.unread', fallback: 'Unread', badgeCount: navStore.getTabBadgeCount(NOTIFICATION_TAB_ID_UNREAD) },
  { tabId: NOTIFICATION_TAB_ID_CUSTOM_REQUESTS, translationKey: 'dashboard.notifications.tabs.customRequests', fallback: 'Custom Requests', badgeCount: navStore.getTabBadgeCount(NOTIFICATION_TAB_ID_CUSTOM_REQUESTS) },
  { tabId: NOTIFICATION_TAB_ID_ACCOUNT, translationKey: 'dashboard.notifications.tabs.account', fallback: 'Account', badgeCount: navStore.getTabBadgeCount(NOTIFICATION_TAB_ID_ACCOUNT) }
]);

const activeNotificationTab = ref('all');
</script>
