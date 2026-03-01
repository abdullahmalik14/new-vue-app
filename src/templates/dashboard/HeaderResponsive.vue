<template>
  <header v-show="$breakpoints.mobile" class="mb-[50px]">
    <div
      class="flex flex-col gap-4 px-2 py-2 flex-1 z-10 backdrop-blur-lg fixed inset-x-0 top-0 bg-gradient-to-t from-white/90 to-white/0 bg-[rgba(234,236,240,0.9)]">
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
              class="flex items-center justify-center p-1.5 gap-3 rounded hover:bg-[rgba(12,17,29,0.1)] cursor-pointer">
              <div class="pointer-events-none h-5 w-5">
                <img v-show="languageLoaded" :src="assets.language" @load="languageLoaded = true"
                  @error="languageLoaded = false" alt="language" class="brightness-0 pointer-events-none h-5 w-5" />
                <div v-show="!languageLoaded" class="h-5 w-5 rounded bg-gray-200 animate-pulse"></div>
              </div>
            </div>

            <!-- notification-item -->
            <div class="relative">
              <span
                class="absolute top-[.125rem] right-[.188rem] h-[.438rem] w-[.438rem] bg-[#F40793] rounded-full block"></span>

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
                    <div class="bg-[#FDB022] w-1.5 h-1.5 absolute block bottom-0 right-0 rounded-full"></div>
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
import NavDropdown from "@/components/ui/popup/dropdown/dashboard/NavDropDown.vue";
import { ref, onMounted } from "vue";
import NotificationPopup from "@/components/ui/popup/NotificationPopup.vue";
import AvatarProfilePopup from "@/components/ui/popup/AvatarProfilePopup.vue";
import { getAssetUrl } from "@/utils/assets/assetLibrary.js";
import { preloadAssets } from "@/utils/assets/assetPreloader.js";
import { loadTranslationsForSection } from "@/utils/translation/translationLoader.js";
import { getActiveLocale } from "@/utils/translation/localeManager.js";

const isNavOpen = ref(false);
const isNotificationOpen = ref(false);
const isProfileOpen = ref(false);

// Asset flags for this component with priority levels
const ASSET_FLAGS = {
  logo: 'dashboard.logo',           // CRITICAL - must load first
  avatar: 'dashboard.avatar',      // HIGH - important for UX
  notification: 'dashboard.notification', // HIGH - important for UX
  language: 'dashboard.language',  // NORMAL - less critical
  hamburger: 'dashboard.hamburger' // NORMAL - less critical
};

// Critical assets that must load before component renders
const CRITICAL_ASSETS = [ASSET_FLAGS.logo];

// Asset URLs loaded from assetLibrary
const assets = ref({
  logo: null,
  language: null,
  notification: null,
  avatar: null,
  hamburger: null
});

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
        console.warn(`[HeaderResponsive] Failed to load asset after ${maxRetries + 1} attempts:`, flag, error);
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
    // Step 1: Load critical assets first (blocking - component waits)
    const logoUrl = await loadAssetWithRetry(ASSET_FLAGS.logo, 2).catch(err => {
      console.error(`[HeaderResponsive] Critical asset failed: ${ASSET_FLAGS.logo}`, err);
      return null;
    });
    assets.value.logo = logoUrl;

    // Step 2: Load high priority assets (avatar, notification)
    const highPriorityFlags = [ASSET_FLAGS.avatar, ASSET_FLAGS.notification];
    const highPriorityPromises = highPriorityFlags.map(flag =>
      loadAssetWithRetry(flag, 2).catch(() => null)
    );
    const highPriorityResults = await Promise.all(highPriorityPromises);
    assets.value.avatar = highPriorityResults[0];
    assets.value.notification = highPriorityResults[1];

    // Step 3: Load normal priority assets (non-blocking)
    const normalPriorityFlags = [ASSET_FLAGS.language, ASSET_FLAGS.hamburger];
    const normalPriorityPromises = normalPriorityFlags.map(flag =>
      loadAssetWithRetry(flag, 1).catch(() => null)
    );
    const normalPriorityResults = await Promise.all(normalPriorityPromises);
    assets.value.language = normalPriorityResults[0];
    assets.value.hamburger = normalPriorityResults[1];

    // Step 4: Preload all loaded images with priority
    const imageAssets = [];

    // Critical priority
    if (assets.value.logo) {
      imageAssets.push({ src: assets.value.logo, type: 'image', priority: 'high' });
    }

    // High priority
    if (assets.value.avatar) {
      imageAssets.push({ src: assets.value.avatar, type: 'image', priority: 'high' });
    }
    if (assets.value.notification) {
      imageAssets.push({ src: assets.value.notification, type: 'image', priority: 'high' });
    }

    // Normal priority
    if (assets.value.language) {
      imageAssets.push({ src: assets.value.language, type: 'image', priority: 'normal' });
    }
    if (assets.value.hamburger) {
      imageAssets.push({ src: assets.value.hamburger, type: 'image', priority: 'normal' });
    }

    if (imageAssets.length > 0) {
      // Preload in background (don't await - non-blocking)
      preloadAssets(imageAssets).catch(() => {
        // Silently fail - images will still load normally when needed
      });
    }

    isAssetsLoading.value = false;
  } catch (error) {
    assetsLoadError.value = error;
    isAssetsLoading.value = false;
    console.error('[HeaderResponsive] Failed to load assets from assetLibrary', error);
  }
}

// Load all assets from assetLibrary with priority and retry logic
onMounted(async () => {
  // Load translations for dashboard section
  try {
    const locale = getActiveLocale() || 'en';
    await loadTranslationsForSection('dashboard-global', locale);
  } catch (error) {
    console.warn('[HeaderResponsive] Failed to load translations', error);
    // Continue without translations - will use fallback
  }

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
