<template>
  <BasePopup
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :popup-config="popupConfig"
  >
    <div
      class=" flex flex-col items-start overflow-hidden shadow-[4px_0_10px_0_rgba(0,0,0,0.08)]
       bg-panel-light/70 backdrop-blur-[25px] dark:bg-panel-dark/70
        md:w-[30rem] md:border-l md:border-panel-light-border
         dark:md:border-panel-dark-border
          overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-order-style:none] [scrollbar-width:none] h-full"
    >
      <div
        class="h-screen w-full overflow-y-auto scroll-smooth flex flex-col items-start self-stretch [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div class="relative flex flex-col items-start self-stretch">
          <!-- Back button -->
          <button
            type="button"
            @click="emit('update:modelValue', false)"
            class="absolute top-2 right-2 z-[5] flex items-center justify-center w-8 h-8 transition-all duration-200 ease-in-out rounded-md hover:bg-panel-light-buttonHover dark:hover:bg-panel-dark-buttonHover md:p-1.5 md:w-auto md:h-auto"
          >
            <img
              class="block w-6 h-6 pointer-events-none md:hidden"
              v-if="profileAssets.closeMobile" :src="profileAssets.closeMobile"
              alt="" aria-hidden="true"
            />
            <img
              class="hidden w-5 h-5 pointer-events-none md:block"
              v-if="profileAssets.closeDesktop" :src="profileAssets.closeDesktop"
              alt="" aria-hidden="true"
            />
          </button>

          <!-- Profile cover section -->
          <div
            class="relative z-[4] flex flex-col items-start self-stretch gap-4 bg-cover bg-no-repeat bg-center"
            :style="{ backgroundImage: profileAssets.profileBg ? `url(${profileAssets.profileBg})` : '' }"
          >
            <div
              class="flex flex-col items-start self-stretch gap-4 p-4 bg-profile-cover-overlay"
            >
              <!-- Profile info row -->
              <div class="flex items-start self-stretch gap-4 pr-6">
                <!-- Avatar with status dot -->
                <button type="button" class="relative flex w-14 h-14 rounded-[1.875rem] outline-none cursor-pointer">
                  <img
                    v-if="profileAssets.avatar" :src="profileAssets.avatar"
                    :alt="$t('dashboard.profile.alt.avatar', 'Profile photo')"
                    class="object-cover w-14 h-14 pointer-events-none rounded-[1.875rem] bg-avatar-bg-light"
                  />
                  <span
                    class="absolute bottom-0 right-0 flex w-3.5 h-3.5 rounded-[0.438rem] bg-profile-status-dot"
                    >&nbsp;</span
                  >
                </button>

                <!-- Name and status -->
                <div class="flex-1 flex flex-col items-start gap-1">
                  <!-- Name and verified badge -->
                  <div class="flex flex-wrap items-center gap-2 self-stretch">
                    <div class="flex items-center gap-2">
                      <span class="text-lg font-semibold leading-7 text-white"
                        >{{ navStore.profileSummary?.name || $t('dashboard.profile.name', 'lindenMay') }}</span
                      >
                      <img
                        v-if="profileAssets.verified" :src="profileAssets.verified"
                        alt="" aria-hidden="true"
                        class="w-4 h-4"
                      />
                    </div>
                    <span
                      class="text-xs font-normal leading-[1.125rem] text-user-handle"
                      >{{ navStore.profileSummary?.handle || $t('dashboard.profile.handle', '@linden') }}</span
                    >
                  </div>

                  <!-- Status dropdown -->
                  <div class="flex">
                    <div
                      class="overflow-hidden rounded-[0.938rem] z-[5] relative inline-flex"
                    >
                      <button
                        type="button"
                        class="inline-flex items-center gap-2 px-2 py-1 rounded-[0.938rem] shadow-[0_0_0_1px] shadow-status-trigger-light bg-status-trigger-light cursor-pointer"
                      >
                        <span
                          class="text-sm font-medium uppercase leading-5 text-black pointer-events-none"
                          >{{ $t('dashboard.profile.status.away', 'Away') }}</span
                        >
                        <img
                          v-if="profileAssets.arrowDown" :src="profileAssets.arrowDown"
                          alt="" aria-hidden="true"
                          class="w-3 h-3 pointer-events-none"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Status message section -->
              <div class="flex flex-col items-start self-stretch gap-4">
                <!-- Repost toggle -->
                <div class="flex items-center gap-2">
                  <label class="relative inline-block w-8 h-4 cursor-pointer">
                    <input
                      type="checkbox"
                      class="peer h-0 w-0 opacity-0"
                      id="dashboard-profile-popup-toggle-status-repost"
                      checked=""
                    />
                    <span
                      class="absolute inset-0 cursor-pointer rounded-[0.75rem] bg-[#98a2b380] transition-all duration-100 ease-in-out peer-checked:bg-[#0c111d]"
                    ></span>
                    <span
                      class="absolute left-[0.125rem] top-1/2 h-3 w-3 -translate-y-1/2 transform rounded-full bg-white shadow-[0_1px_3px_0_rgba(16,24,40,0.1),0_1px_2px_0_rgba(16,24,40,0.06)] transition-all duration-100 ease-in-out peer-checked:translate-x-[1rem]"
                    ></span>
                  </label>
                  <div class="flex items-center gap-1">
                    <span class="text-xs leading-[1.125rem] text-white"
                      >{{ $t('dashboard.profile.repostStatusX', 'Repost status message to X') }}</span
                    >
                    <img
                      v-if="profileAssets.info" :src="profileAssets.info"
                      alt="" aria-hidden="true"
                      class="w-4 h-4 cursor-pointer"
                    />
                  </div>
                </div>

                <!-- Editable status -->
                <div
                  class="relative flex items-center self-stretch gap-2 px-2 py-1 rounded-[0.625rem] bg-white/30 hover:bg-white/50 transition-all duration-150 ease-in-out"
                >
                  <input
                    type="text"
                    class="flex-1 text-sm font-medium dark:text-text leading-6 bg-transparent outline-none border-none placeholder-black dark:placeholder:text-text"
                    :placeholder="$t('dashboard.profile.writeStatus', 'Write status here...')"
                    value="Second update message....."
                  />
                  <button
                    type="button"
                    class="w-4 h-4 opacity-50 hover:opacity-100 transition-all duration-150 ease-in-out cursor-pointer"
                  >
                    <img
                      v-if="profileAssets.edit" :src="profileAssets.edit"
                      alt="" aria-hidden="true"
                      class="w-full h-full filter brightness-0 saturate-100 invert-0 sepia-4 saturate-17 hue-rotate-99 brightness-98 contrast-105 pointer-events-none"
                    />
                  </button>
                </div>
              </div>

              <!-- Button controls -->
              <div class="flex items-center self-stretch">
                <!-- Left buttons wrapper -->
                <div class="flex flex-1 items-center self-stretch">
                  <!-- Dot button -->
                  <button
                    class="outline-none border-none bg-black shadow-[4px_4px_0_0] shadow-accent-pink-light hover:bg-accent-green-light hover:shadow-black transition-all duration-150 ease-in-out relative flex justify-center items-center w-8 h-8 md:w-10 md:h-10"
                  >
                    <img
                      v-if="profileAssets.settings" :src="profileAssets.settings"
                      alt="" aria-hidden="true"
                      class="w-4 h-4 md:w-6 md:h-6 transition-all duration-150 ease-in-out pointer-events-none"
                    />
                  </button>

                  <!-- View profile button with group hover -->
                  <button
                    class="group flex flex-1 relative justify-center self-stretch items-center"
                  >
                    <!-- Main part -->
                    <div
                      class="flex-1 flex justify-center self-stretch items-center bg-black shadow-[4px_4px_0_0] shadow-accent-pink-light group-hover:bg-accent-green-light group-hover:shadow-black transition-all duration-150 ease-in-out h-8 md:h-10 px-2 py-1 gap-2.5"
                    >
                      <span
                        class="transition-all duration-150 ease-in-out leading-7 text-base md:text-lg font-medium text-text group-hover:text-black"
                      >
                        {{ $t('dashboard.profile.viewProfile', 'View profile') }}
                      </span>
                    </div>

                    <!-- Skewed part with explicit transform -->
                    <div
                      class="w-4 h-8 md:h-10 bg-black shadow-[4px_4px_0_0] shadow-accent-pink-light group-hover:bg-accent-green-light group-hover:shadow-black transition-all duration-150 ease-in-out flex justify-center items-center px-2 py-1 [transform:skew(-20deg)_translateX(-0.438rem)]"
                    ></div>
                  </button>
                </div>

                <!-- Right buttons wrapper -->
                <div class="flex-1 flex items-center self-stretch">
                  <!-- Go Live button with group -->
                  <button
                    class="group flex flex-1 relative justify-center self-stretch items-center cursor-default h-8 md:h-10"
                  >
                    <!-- Skewed part -->
                    <div
                      class="w-4 h-8 md:h-10 filter grayscale bg-disabled-light-bg shadow-[4px_4px_0_0] shadow-disabled-light-shadow transition-all duration-150 ease-in-out flex justify-center items-center px-2 py-1 [transform:skew(-20deg)_translateX(0.563rem)]"
                    ></div>

                    <!-- Main part -->
                    <div
                      class="flex-1 flex justify-center items-center self-stretch filter grayscale bg-disabled-light-bg shadow-[4px_4px_0_0] shadow-disabled-light-shadow transition-all duration-150 ease-in-out h-8 md:h-10 px-2 py-1 gap-2.5"
                    >
                      <span
                        class="transition-all duration-150 ease-in-out leading-6 text-base md:leading-7 md:text-lg font-medium text-disabled-light-text"
                      >
                        {{ $t('dashboard.profile.goLive', 'Go Live') }}
                      </span>
                      <img
                        v-if="profileAssets.menuStats" :src="profileAssets.menuStats"
                        alt="" aria-hidden="true"
                        class="h-5 w-5 md:h-6 md:w-6 transition-all duration-150 ease-in-out [filter:brightness(0)_saturate(100%)_invert(55%)_sepia(10%)_saturate(5098%)_hue-rotate(296deg)_brightness(98%)_contrast(101%)]"
                      />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick settings panel -->
          <div
            class="relative z-[3] flex flex-col items-start self-stretch bg-background-light dark:bg-background-dark"
          >
            <!-- Control block -->
            <div
              class="pointer-events-none relative z-[3] flex flex-col items-start self-stretch gap-4 p-4 opacity-50 border-b border-border-light dark:border-border-dark"
            >
              <!-- Block header -->
              <div
                class="relative z-[3] flex items-center justify-between self-stretch"
              >
                <div class="flex items-center gap-1">
                  <span
                    class="flex items-center justify-center w-[2.625rem] h-[2.625rem] mr-1"
                  >
                    <img
                      v-if="profileAssets.menuDesign" :src="profileAssets.menuDesign"
                      alt="" aria-hidden="true"
                      class="w-[2.625rem] h-[2.625rem]"
                    />
                  </span>
                  <span
                    class="text-sm font-medium uppercase leading-5 text-text-muted-light dark:text-text-muted-dark"
                  >{{ $t('dashboard.profile.videoCallStatus', 'Video call status') }}</span>
                  <img
                    v-if="profileAssets.info" :src="profileAssets.info"
                    alt="" aria-hidden="true"
                    class="w-4 h-4 cursor-pointer"
                  />
                </div>

                <!-- Block status -->
                <div class="flex">
                  <div
                    class="overflow-hidden rounded-[0.938rem] z-[5] relative inline-flex"
                  >
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 px-2 py-1 rounded-[0.938rem] cursor-pointer"
                    >
                      <span
                        class="text-sm font-medium uppercase leading-5 text-black pointer-events-none dark:text-text-dark"
                      >
                        {{ $t('dashboard.profile.status.offline', 'Offline') }}
                      </span>
                      <img
                        v-if="profileAssets.arrowDown" :src="profileAssets.arrowDown"
                        alt="" aria-hidden="true"
                        class="w-3 h-3 pointer-events-none dark:[filter:brightness(0)_invert(100%)]"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Status text input -->
              <div
                class="relative flex items-center self-stretch gap-2 px-2 py-1 rounded-[0.625rem] bg-background-light-input hover:bg-background-light-inputHover dark:bg-background-dark-input dark:hover:bg-background-dark-inputHover transition-all duration-150 ease-in-out"
              >
                <input
                  type="text"
                  class="flex-1 text-xs font-medium leading-6 bg-transparent outline-none border-none text-text-muted-light placeholder:text-text-muted-light dark:text-text-muted-dark dark:placeholder:text-text-muted-dark"
                  :placeholder="$t('dashboard.profile.writeStatus', 'Write status here...')"
                  value="I am all dressed up ready to eat some chicken 💋"
                />
                <button
                  type="button"
                  class="w-4 h-4 opacity-50 hover:opacity-100 transition-all duration-150 ease-in-out cursor-pointer"
                >
                  <img
                    v-if="profileAssets.edit" :src="profileAssets.edit"
                    alt="" aria-hidden="true"
                    class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(0)_sepia(4%)_saturate(17%)_hue-rotate(99deg)_brightness(98%)_contrast(105%)] pointer-events-none"
                  />
                </button>
              </div>

              <!-- Repost toggle -->
              <div class="flex items-center gap-2">
                <label class="relative inline-block w-8 h-4 cursor-pointer">
                  <input
                    type="checkbox"
                    class="peer h-0 w-0 opacity-0"
                    id="dashboard-profile-popup-toggle-video-repost"
                  />
                  <span
                    class="absolute inset-0 cursor-pointer rounded-[0.75rem] bg-[#98a2b380] transition-all duration-100 ease-in-out peer-checked:bg-[#0c111d] dark:bg-[#434c5b80] dark:peer-checked:bg-[#0a0e17]"
                  ></span>
                  <span
                    class="absolute left-[0.125rem] top-1/2 h-3 w-3 -translate-y-1/2 transform rounded-full bg-white shadow-[0_1px_3px_0_rgba(16,24,40,0.1),0_1px_2px_0_rgba(16,24,40,0.06)] transition-all duration-100 ease-in-out peer-checked:translate-x-[1rem] dark:bg-[#181a1b]"
                  ></span>
                </label>
                <div class="flex items-center gap-1">
                  <span
                    class="text-xs leading-[1.125rem] text-text-secondary-light dark:text-text-secondary-dark"
                  >{{ $t('dashboard.profile.repostStatusX', 'Repost status message to X') }}</span>
                  <img
                    v-if="profileAssets.info" :src="profileAssets.info"
                    alt="" aria-hidden="true"
                    class="w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <!-- Control block -->
            <div
              class="pointer-events-none relative z-[3] flex flex-col items-start self-stretch gap-4 p-4 opacity-50 border-b border-border-light dark:border-border-dark"
            >
              <!-- Block header -->
              <div
                class="relative z-[3] flex items-center justify-between self-stretch"
              >
                <div class="flex items-center gap-1">
                  <span
                    class="flex items-center justify-center w-[2.625rem] h-[2.625rem] mr-1"
                  >
                    <img
                      v-if="profileAssets.menuCopy" :src="profileAssets.menuCopy"
                      alt="" aria-hidden="true"
                      class="w-[2.625rem] h-[2.625rem]"
                    />
                  </span>
                  <span
                    class="text-sm font-medium uppercase leading-5 text-text-muted-light dark:text-text-muted-dark"
                  >{{ $t('dashboard.profile.audioCallStatus', 'Audio call status') }}</span>
                  <img
                    v-if="profileAssets.info" :src="profileAssets.info"
                    alt="" aria-hidden="true"
                    class="w-4 h-4 cursor-pointer"
                  />
                </div>

                <!-- Block status -->
                <div class="flex">
                  <div
                    class="overflow-hidden rounded-[0.938rem] z-[5] relative inline-flex"
                  >
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 px-2 py-1 rounded-[0.938rem] cursor-pointer"
                    >
                      <span
                        class="text-sm font-medium uppercase leading-5 text-black pointer-events-none dark:text-text-dark"
                      >
                        {{ $t('dashboard.profile.status.offline', 'Offline') }}
                      </span>
                      <img
                        v-if="profileAssets.arrowDown" :src="profileAssets.arrowDown"
                        alt="" aria-hidden="true"
                        class="w-3 h-3 pointer-events-none dark:[filter:brightness(0)_invert(100%)]"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Status text input -->
              <div
                class="relative flex items-center self-stretch gap-2 px-2 py-1 rounded-[0.625rem] bg-background-light-input hover:bg-background-light-inputHover dark:bg-background-dark-input dark:hover:bg-background-dark-inputHover transition-all duration-150 ease-in-out"
              >
                <input
                  type="text"
                  class="flex-1 text-xs font-medium leading-6 bg-transparent outline-none border-none text-text-muted-light placeholder:text-text-muted-light dark:text-text-muted-dark dark:placeholder:text-text-muted-dark"
                  :placeholder="$t('dashboard.profile.awayMessage', 'Away Message...')"
                />
                <button
                  type="button"
                  class="w-4 h-4 opacity-50 hover:opacity-100 transition-all duration-150 ease-in-out cursor-pointer"
                >
                  <img
                    v-if="profileAssets.edit" :src="profileAssets.edit"
                    alt="" aria-hidden="true"
                    class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(0)_sepia(4%)_saturate(17%)_hue-rotate(99deg)_brightness(98%)_contrast(105%)] pointer-events-none"
                  />
                </button>
              </div>

              <!-- Repost toggle -->
              <div class="flex items-center gap-2">
                <label class="relative inline-block w-8 h-4 cursor-pointer">
                  <input
                    type="checkbox"
                    class="peer h-0 w-0 opacity-0"
                    id="dashboard-profile-popup-toggle-audio-repost"
                  />
                  <span
                    class="absolute inset-0 cursor-pointer rounded-[0.75rem] bg-[#98a2b380] transition-all duration-100 ease-in-out peer-checked:bg-[#0c111d] dark:bg-[#434c5b80] dark:peer-checked:bg-[#0a0e17]"
                  ></span>
                  <span
                    class="absolute left-[0.125rem] top-1/2 h-3 w-3 -translate-y-1/2 transform rounded-full bg-white shadow-[0_1px_3px_0_rgba(16,24,40,0.1),0_1px_2px_0_rgba(16,24,40,0.06)] transition-all duration-100 ease-in-out peer-checked:translate-x-[1rem] dark:bg-[#181a1b]"
                  ></span>
                </label>
                <div class="flex items-center gap-1">
                  <span
                    class="text-xs leading-[1.125rem] text-text-secondary-light dark:text-text-secondary-dark"
                  >{{ $t('dashboard.profile.repostStatusX', 'Repost status message to X') }}</span>
                  <img
                    v-if="profileAssets.info" :src="profileAssets.info"
                    alt="" aria-hidden="true"
                    class="w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <!-- Control block -->
            <div
              class="pointer-events-none relative z-[3] flex flex-col items-start self-stretch gap-4 p-4 opacity-50 border-b border-border-light dark:border-border-dark"
            >
              <!-- Block header -->
              <div
                class="relative z-[3] flex items-center justify-between self-stretch"
              >
                <div class="flex items-center gap-1">
                  <span
                    class="flex items-center justify-center w-[2.625rem] h-[2.625rem] mr-1"
                  >
                    <img
                      v-if="profileAssets.menuView" :src="profileAssets.menuView"
                      alt="" aria-hidden="true"
                      class="w-[2.625rem] h-[2.625rem]"
                    />
                  </span>
                  <span
                    class="text-sm font-medium uppercase leading-5 text-text-muted-light dark:text-text-muted-dark"
                  >
                    {{ $t('dashboard.profile.chatStatus', 'Chat status') }}
                  </span>
                  <img
                    v-if="profileAssets.info" :src="profileAssets.info"
                    alt="" aria-hidden="true"
                    class="w-4 h-4 cursor-pointer"
                  />
                </div>

                <!-- Block status -->
                <div class="flex">
                  <div
                    class="overflow-hidden rounded-[0.938rem] z-[5] relative inline-flex"
                  >
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 px-2 py-1 rounded-[0.938rem] cursor-pointer"
                    >
                      <span
                        class="text-sm font-medium uppercase leading-5 text-black pointer-events-none dark:text-text-dark"
                      >
                        {{ $t('dashboard.profile.status.offline', 'Offline') }}
                      </span>
                      <img
                        v-if="profileAssets.arrowDown" :src="profileAssets.arrowDown"
                        alt="" aria-hidden="true"
                        class="w-3 h-3 pointer-events-none dark:[filter:brightness(0)_invert(100%)]"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Status text input -->
              <div
                class="relative flex items-center self-stretch gap-2 px-2 py-1 rounded-[0.625rem] bg-background-light-input hover:bg-background-light-inputHover dark:bg-background-dark-input dark:hover:bg-background-dark-inputHover transition-all duration-150 ease-in-out"
              >
                <input
                  type="text"
                  class="flex-1 text-xs font-medium leading-6 bg-transparent outline-none border-none text-text-muted-light placeholder:text-text-muted-light dark:text-text-muted-dark dark:placeholder:text-text-muted-dark"
                  :placeholder="$t('dashboard.profile.writeStatus', 'Write status here...')"
                  value="Can't type with my greasy fingers, call me instead 💋"
                />
                <button
                  type="button"
                  class="w-4 h-4 opacity-50 hover:opacity-100 transition-all duration-150 ease-in-out cursor-pointer"
                >
                  <img
                    v-if="profileAssets.edit" :src="profileAssets.edit"
                    alt="" aria-hidden="true"
                    class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(0)_sepia(4%)_saturate(17%)_hue-rotate(99deg)_brightness(98%)_contrast(105%)] pointer-events-none"
                  />
                </button>
              </div>

              <!-- Repost toggle -->
              <div class="flex items-center gap-2">
                <label class="relative inline-block w-8 h-4 cursor-pointer">
                  <input
                    type="checkbox"
                    class="peer h-0 w-0 opacity-0"
                    id="dashboard-profile-popup-toggle-chat-repost"
                  />
                  <span
                    class="absolute inset-0 cursor-pointer rounded-[0.75rem] bg-[#98a2b380] transition-all duration-100 ease-in-out peer-checked:bg-[#0c111d] dark:bg-[#434c5b80] dark:peer-checked:bg-[#0a0e17]"
                  ></span>
                  <span
                    class="absolute left-[0.125rem] top-1/2 h-3 w-3 -translate-y-1/2 transform rounded-full bg-white shadow-[0_1px_3px_0_rgba(16,24,40,0.1),0_1px_2px_0_rgba(16,24,40,0.06)] transition-all duration-100 ease-in-out peer-checked:translate-x-[1rem] dark:bg-[#181a1b]"
                  ></span>
                </label>
                <div class="flex items-center gap-1">
                  <span
                    class="text-xs leading-[1.125rem] text-text-secondary-light dark:text-text-secondary-dark"
                  >{{ $t('dashboard.profile.repostStatusX', 'Repost status message to X') }}</span>
                  <img
                    v-if="profileAssets.info" :src="profileAssets.info"
                    alt="" aria-hidden="true"
                    class="w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Auto repost settings -->
           <div
            class="relative z-[2] flex flex-col items-start self-stretch gap-4 p-4"
          >
            <!-- Heading -->
            <div
              class="flex items-center gap-2 [filter:brightness(0)_saturate(100%)_invert(37%)_sepia(57%)_saturate(6169%)_hue-rotate(214deg)_brightness(91%)_contrast(106%)]"
            >
              <span
                class="text-xs font-medium leading-[1.125rem] text-text-muted-light dark:text-text-muted-dark pointer-events-none"
              >
                {{ $t('dashboard.profile.advancedRepostSettings', 'Advanced Repost Settings') }}
              </span>
              <img
                v-if="profileAssets.liveArrow" :src="profileAssets.liveArrow"
                alt="" aria-hidden="true"
                class="w-4 h-4 pointer-events-none"
              />
            </div>

            <!-- Settings block -->
            <div class="flex flex-col items-start self-stretch gap-4">
              <p
                class="text-xs leading-[1.125rem] text-text-darker-light dark:text-text-darker-dark self-stretch"
              >
                {{ $t('dashboard.profile.repostStatusPrompt', 'Repost your status and custom message automatically when you:') }}
              </p>

              <!-- toggle -->
              <div class="flex items-center gap-2">
                <label class="relative inline-block w-8 h-4 cursor-pointer">
                  <input
                    type="checkbox"
                    class="peer h-0 w-0 opacity-0"
                    id="dashboard-profile-popup-toggle-auto-signin"
                    checked
                  />
                  <span
                    class="absolute inset-0 cursor-pointer rounded-[0.75rem] bg-[#98a2b380] transition-all duration-100 ease-in-out peer-checked:bg-[#0c111d] dark:bg-[#434c5b80] dark:peer-checked:bg-[#0a0e17]"
                  ></span>
                  <span
                    class="absolute left-[0.125rem] top-1/2 h-3 w-3 -translate-y-1/2 transform rounded-full bg-white shadow-[0_1px_3px_0_rgba(16,24,40,0.1),0_1px_2px_0_rgba(16,24,40,0.06)] transition-all duration-100 ease-in-out peer-checked:translate-x-[1rem] dark:bg-[#181a1b]"
                  ></span>
                </label>
                <div class="flex items-center gap-1">
                  <span
                    class="text-xs leading-[1.125rem] text-text-secondary-light dark:text-text-secondary-dark"
                  >
                    {{ $t('dashboard.profile.signIn', 'Sign In') }}
                  </span>
                </div>
              </div>

              <!-- toggle -->
              <div class="flex items-center gap-2">
                <label class="relative inline-block w-8 h-4 cursor-pointer">
                  <input
                    type="checkbox"
                    class="peer h-0 w-0 opacity-0"
                    id="dashboard-profile-popup-toggle-auto-logout"
                    checked
                  />
                  <span
                    class="absolute inset-0 cursor-pointer rounded-[0.75rem] bg-[#98a2b380] transition-all duration-100 ease-in-out peer-checked:bg-[#0c111d] dark:bg-[#434c5b80] dark:peer-checked:bg-[#0a0e17]"
                  ></span>
                  <span
                    class="absolute left-[0.125rem] top-1/2 h-3 w-3 -translate-y-1/2 transform rounded-full bg-white shadow-[0_1px_3px_0_rgba(16,24,40,0.1),0_1px_2px_0_rgba(16,24,40,0.06)] transition-all duration-100 ease-in-out peer-checked:translate-x-[1rem] dark:bg-[#181a1b]"
                  ></span>
                </label>
                <div class="flex items-center gap-1">
                  <span
                    class="text-xs leading-[1.125rem] text-text-secondary-light dark:text-text-secondary-dark"
                  >
                    {{ $t('dashboard.profile.logOut', 'Log Out') }}
                  </span>
                </div>
              </div>

              <!-- toggle -->
              <div class="flex items-center gap-2">
                <label class="relative inline-block w-8 h-4 cursor-pointer">
                  <input
                    type="checkbox"
                    class="peer h-0 w-0 opacity-0"
                    id="dashboard-profile-popup-toggle-auto-statuses"
                    checked
                  />
                  <span
                    class="absolute inset-0 cursor-pointer rounded-[0.75rem] bg-[#98a2b380] transition-all duration-100 ease-in-out peer-checked:bg-[#0c111d] dark:bg-[#434c5b80] dark:peer-checked:bg-[#0a0e17]"
                  ></span>
                  <span
                    class="absolute left-[0.125rem] top-1/2 h-3 w-3 -translate-y-1/2 transform rounded-full bg-white shadow-[0_1px_3px_0_rgba(16,24,40,0.1),0_1px_2px_0_rgba(16,24,40,0.06)] transition-all duration-100 ease-in-out peer-checked:translate-x-[1rem] dark:bg-[#181a1b]"
                  ></span>
                </label>
                <div class="flex items-center gap-1">
                  <span
                    class="text-xs leading-[1.125rem] text-text-secondary-light dark:text-text-secondary-dark"
                  >
                    {{ $t('dashboard.profile.changeStatuses', 'Changes Statuses') }}
                  </span>
                </div>
              </div>

              <!-- toggle -->
              <div class="flex items-center gap-2">
                <label class="relative inline-block w-8 h-4 cursor-pointer">
                  <input
                    type="checkbox"
                    class="peer h-0 w-0 opacity-0"
                    id="dashboard-profile-popup-toggle-auto-messages"
                  />
                  <span
                    class="absolute inset-0 cursor-pointer rounded-[0.75rem] bg-[#98a2b380] transition-all duration-100 ease-in-out peer-checked:bg-[#0c111d] dark:bg-[#434c5b80] dark:peer-checked:bg-[#0a0e17]"
                  ></span>
                  <span
                    class="absolute left-[0.125rem] top-1/2 h-3 w-3 -translate-y-1/2 transform rounded-full bg-white shadow-[0_1px_3px_0_rgba(16,24,40,0.1),0_1px_2px_0_rgba(16,24,40,0.06)] transition-all duration-100 ease-in-out peer-checked:translate-x-[1rem] dark:bg-[#181a1b]"
                  ></span>
                </label>
                <div class="flex items-center gap-1">
                  <span
                    class="text-xs leading-[1.125rem] text-text-secondary-light dark:text-text-secondary-dark"
                  >{{ $t('dashboard.profile.changeCustomMessages', 'Change Custom Messages') }}</span>
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

defineOptions({ name: 'DashboardProfilePopup' });
import BasePopup from "./BasePopup.vue";
import { ref, onBeforeMount } from 'vue';
import { resolveSharedComponentAssets } from '@/systems/assets/resolveSharedComponentAssets.js';
import { useDashboardNavStore } from '@/stores/useDashboardNavStore';

const navStore = useDashboardNavStore();

const profileAssets = ref({
  closeMobile: null,
  closeDesktop: null,
  profileBg: null,
  avatar: null,
  verified: null,
  arrowDown: null,
  info: null,
  edit: null,
  settings: null,
  menuStats: null,
  menuDesign: null,
  menuCopy: null,
  menuView: null,
  liveArrow: null
});

onBeforeMount(async () => {
  try {
    const resolved = await resolveSharedComponentAssets('dashboardProfilePopup');
    Object.assign(profileAssets.value, resolved);
  } catch (error) {
    console.error('[DashboardProfilePopup] Failed to load assets:', error);
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


</script>
