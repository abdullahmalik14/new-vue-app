<template>
  <header v-show="$breakpoints.mobile" class="mb-[50px]">
    <div
      class="flex flex-col gap-4 px-2 py-2 flex-1 z-10 backdrop-blur-lg fixed inset-x-0 top-0 bg-gradient-to-t from-white/90 to-white/0 bg-slate-100/90">
      <div class="flex justify-between items-center">
        <!-- logo -->
        <div class="flex items-center gap-1.5 relative">
          <div @click="$router.push('/dashboard')" class="w-6 h-6 cursor-pointer">
            <img v-show="logoLoaded" :src="assets.logo" @load="logoLoaded = true" @error="logoLoaded = false" alt="logo"
              class="w-6 h-6 pointer-events-none opacity-80" />
            <div v-show="!logoLoaded" class="w-6 h-6 rounded bg-gray-200 animate-pulse"></div>
          </div>
        </div>

        <!-- nav right-item -->
        <div class="flex items-center gap-2">
          <div class="flex items-center justify-end gap-2">
            <!-- choose-language -->
            <div
              class="flex items-center justify-center p-1.5 gap-3 rounded hover:bg-slate-900/10 cursor-pointer">
              <div class="pointer-events-none h-5 w-5">
                <img v-show="languageLoaded" :src="assets.language" @load="languageLoaded = true"
                  @error="languageLoaded = false" alt="language" class="brightness-0 pointer-events-none h-5 w-5" />
                <div v-show="!languageLoaded" class="h-5 w-5 rounded bg-gray-200 animate-pulse"></div>
              </div>
            </div>

            <!-- notification-item -->
            <div class="relative">
              <span
                class="absolute top-[.125rem] right-[.188rem] h-[.438rem] w-[.438rem] bg-pink-500 rounded-full block"></span>

              <a @click="isNotificationOpen = true"
                class="notifications-panel-trigger group cursor-pointer rounded flex items-center justify-center p-1.5 gap-3 hover:bg-notification-hover">
                <div class="w-5 h-5 pointer-events-none">
                  <img v-show="notificationLoaded" :src="assets.notification" @load="notificationLoaded = true"
                    @error="notificationLoaded = false" alt="notification"
                    class="h-5 w-5 brightness-0 saturate-100 group-hover:[filter:brightness(0)_saturate(100%)_invert(29%)_sepia(98%)_saturate(5809%)_hue-rotate(325deg)_brightness(92%)_contrast(121%)]" />
                  <div v-show="!notificationLoaded" class="h-5 w-5 rounded bg-gray-200 animate-pulse"></div>
                </div>
              </a>
            </div>

            <!-- user-profile-item -->
            <div class="flex justify-end items-center relative cursor-pointer">
              <a @click="isProfileOpen = true" class="flex flex-col items-center justify-center gap-0.5 rounded">
                <div class="pointer-events-none h-8 w-8 flex justify-center items-center">
                  <div class="relative w-6 h-6">
                    <div class="rounded-full w-6 h-6">
                      <img v-show="avatarLoaded" :src="assets.avatar" @load="avatarLoaded = true"
                        @error="avatarLoaded = false" alt="user avatar"
                        class="bg-avatar object-cover w-full h-full rounded-full" />
                      <div v-show="!avatarLoaded" class="w-full h-full rounded-full bg-gray-200 animate-pulse"></div>
                    </div>
                    <div class="bg-amber-400 w-1.5 h-1.5 absolute block bottom-0 right-0 rounded-full"></div>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <!-- Hamburger-menu -->
          <div class="py-1 rounded gap-0.5 px-2 flex flex-col justify-center items-center cursor-pointer"
            @click="isNavOpen = true">
            <div class="w-6 h-6 pointer-events-none">
              <img v-show="hamburgerLoaded" :src="assets.hamburger" @load="hamburgerLoaded = true"
                @error="hamburgerLoaded = false" alt="menu" class="w-6 h-6 pointer-events-none brightness-0" />
              <div v-show="!hamburgerLoaded" class="w-6 h-6 rounded bg-gray-200 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <NavDropdown v-model="isNavOpen" title="Menu" logo="your-logo-url" />
    <NotificationPopup :config="notificationPopupConfig" v-model="isNotificationOpen" @update:modelValue="
      (val) => {
        isNotificationOpen = val;
      }
    " />

    <AvatarProfilePopup :config="avatarPopupconfig" v-model="isProfileOpen" @update:modelValue="
      (val) => {
        isProfileOpen = val;
      }
    " />
  </header>
</template>

<script setup>
import NavDropdown from '@/components/ui/nav/dashboard/NavDropdown.vue';
import { ref, onMounted } from "vue";
import NotificationPopup from "@/components/ui/popup/NotificationPopup.vue";
import AvatarProfilePopup from "@/components/ui/popup/AvatarProfilePopup.vue";
import { getAssetUrl } from "@/utils/assets/assetLibrary.js";
import {
  getSharedComponentAssetMapping,
  groupComponentSlotsByPreloadTier,
} from "@/utils/assets/resolveSharedComponentAssets.js";

const isNavOpen = ref(false);
const isNotificationOpen = ref(false);
const isProfileOpen = ref(false);

const headerAssetSlots = getSharedComponentAssetMapping('dashboardHeaderChrome');
const headerAssetSlotNames = Object.keys(headerAssetSlots);

// Asset URLs loaded from sharedAssetPreloads.json via assetLibrary
const assets = ref(
  Object.fromEntries(headerAssetSlotNames.map((slot) => [slot, null])),
);

// Loading states for images
const logoLoaded = ref(false);
const languageLoaded = ref(false);
const notificationLoaded = ref(false);
const avatarLoaded = ref(false);
const hamburgerLoaded = ref(false);

// Loading state
const isAssetsLoading = ref(true);
const assetsLoadError = ref(null);

/**
 * Retry logic for asset loading with exponential backoff
 */
async function loadAssetWithRetry(flag, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const url = await getAssetUrl(flag);
      if (url) return url;

      if (attempt < maxRetries) {
        const backoff = Math.pow(2, attempt) * 100; // 100ms, 200ms, 400ms
        await new Promise(resolve => setTimeout(resolve, backoff));
      }
    } catch (error) {
      if (attempt === maxRetries) {
        console.warn(`[DashboardSharedHeader] Failed to load asset after ${maxRetries + 1} attempts:`, flag, error);
        throw error;
      }
      const backoff = Math.pow(2, attempt) * 100;
      await new Promise(resolve => setTimeout(resolve, backoff));
    }
  }
  return null;
}

/**
 * Load critical assets first, then non-critical
 */
async function loadAssetsWithPriority() {
  try {
    const tierGroups = groupComponentSlotsByPreloadTier(
      'dashboardHeaderChrome',
      'dashboardMenuIcons',
    );

    const logoEntry = tierGroups.high.find(({ slot }) => slot === 'logo')
      || tierGroups.critical[0];

    if (logoEntry) {
      assets.value.logo = await loadAssetWithRetry(logoEntry.flag, 2).catch((err) => {
        console.error(`[DashboardSharedHeader] Critical asset failed: ${logoEntry.flag}`, err);
        return null;
      });
    }

    const otherHighPriority = tierGroups.high.filter(({ slot }) => slot !== 'logo');
    const highPriorityResults = await Promise.all(
      otherHighPriority.map(({ slot, flag }) =>
        loadAssetWithRetry(flag, 2)
          .then((url) => [slot, url])
          .catch(() => [slot, null]),
      ),
    );
    highPriorityResults.forEach(([slot, url]) => {
      assets.value[slot] = url;
    });

    const normalPriorityResults = await Promise.all(
      tierGroups.normal.map(({ slot, flag }) =>
        loadAssetWithRetry(flag, 1)
          .then((url) => [slot, url])
          .catch(() => [slot, null]),
      ),
    );
    normalPriorityResults.forEach(([slot, url]) => {
      assets.value[slot] = url;
    });

    isAssetsLoading.value = false;
  } catch (error) {
    assetsLoadError.value = error;
    isAssetsLoading.value = false;
    console.error('[DashboardSharedHeader] Failed to load assets from assetLibrary', error);
  }
}

// Load all assets from assetLibrary with priority and retry logic
onMounted(async () => {
  await loadAssetsWithPriority();
});

const notificationPopupConfig = {
  actionType: "slidein",
  from: "right",
  offset: "0px",
  speed: "250ms",
  effect: "ease-in-out",
  showOverlay: false,
  closeOnOutside: true,
  lockScroll: false,
  escToClose: true,
  width: { default: "100%", "<640": "100%" },
  height: "100%",
  scrollable: true,
  closeSpeed: "250ms",
  closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
};

const avatarPopupconfig = {
  actionType: "slidein",
  from: "right",
  offset: "0px",
  speed: "250ms",
  effect: "ease-in-out",
  showOverlay: false,
  closeOnOutside: true,
  lockScroll: false,
  escToClose: true,
  width: { default: "100%", "<640": "100%" },
  height: "100%",
  scrollable: true,
  closeSpeed: "250ms",
  closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
};
</script>
