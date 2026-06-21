<template>
  <div ref="sidebarEl"
    class="dashboard-sidebar-wrapper flex sticky top-0 z-[3] h-screen w-max shadow-custom bg-gray-50/70 backdrop-blur-xs [-ms-overflow-style:none] [scrollbar-width:none]">
    <div
      class="dashboard-sidebar-container transition-all duration-150 ease-in-out w-[5.625rem] gap-1.5 pt-3 pb-3 z-[5] relative flex flex-col items-center justify-start">
      <!-- site-logo -->
      <div ref="sidebarLogoContainer" @click="$router.push('/dashboard')"
        class="flex items-center gap-2.5 rounded-xl cursor-pointer transition-opacity duration-200 ease-in-out bg-yellow-400 opacity-80">
        <img v-if="sidebarChromeAssetUrls.logo" :src="sidebarChromeAssetUrls.logo" alt="logo" class="w-9 h-9 pointer-events-none" />
      </div>

      <!-- profile & controls -->
      <div ref="sidebarHeaderContainer" class="flex flex-col items-center self-stretch gap-2 pt-2 pb-2 pl-1 pr-1 border-b border-d0d5dd">
        <!-- avatar -->
        <div class="flex w-10 h-10 rounded-[1.25rem]">
          <div @click="isProfileOpen = true" class="flex relative w-10 h-10 rounded-[1.25rem] cursor-pointer">
            <img v-if="sidebarChromeAssetUrls.avatar" :src="sidebarChromeAssetUrls.avatar" alt="user"
              class="w-full h-full rounded-[1.25rem] object-cover pointer-events-none" />
            <!-- status-indicator -->
            <div class="absolute bottom-0 right-0 flex w-2.5 h-2.5 rounded-[0.438rem] bg-status">
              &nbsp;
            </div>
          </div>
        </div>

        <!-- cta-controls -->
        <div class="flex items-center justify-center self-stretch gap-2 pl-1 pr-1">
          <!-- log-out -->
          <div
            @click="handleLogout"
            class="logout-icon-container flex cursor-pointer items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ease-in-out hover:bg-notification-hover group">
            <img v-if="sidebarChromeAssetUrls.logout" :src="sidebarChromeAssetUrls.logout" alt="logout"
              class="w-5 h-5 pointer-events-none [filter:brightness(0)_saturate(100%)_invert(45%)_sepia(13%)_saturate(594%)_hue-rotate(183deg)_brightness(92%)_contrast(92%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(29%)_sepia(98%)_saturate(5809%)_hue-rotate(325deg)_brightness(92%)_contrast(121%)]" />
          </div>

          <!-- notification -->
          <div @click="isNotificationOpen = true"
            class="notification-icon-container cursor-pointer flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ease-in-out hover:bg-notification-hover relative group">
            <img v-if="sidebarChromeAssetUrls.notification" :src="sidebarChromeAssetUrls.notification" alt="notification"
              class="w-6 h-6 pointer-events-none group-hover:[filter:brightness(0)_saturate(100%)_invert(29%)_sepia(98%)_saturate(5809%)_hue-rotate(325deg)_brightness(92%)_contrast(121%)]" />
            <!-- status-indicator -->
            <DashboardMenuCounter badgeId="notifications" class="absolute -top-1 -right-1" />
          </div>
        </div>
      </div>

      <!-- main-navigation -->
      <div class="flex flex-col items-center self-stretch flex-1 gap-1 pt-1 pb-1 pl-2 pr-2 overflow-hidden min-h-0" ref="sidebarMenuContainer">
        <div class="flex flex-col items-center self-stretch gap-1 w-full">
          <div class="flex flex-col relative z-[5] self-stretch w-full">
            <div class="flex flex-col items-center self-stretch gap-1">
              <!-- Render visibleMenuItemsBuffer menu items -->
              <div v-for="item in visibleMenuItems" :key="item.menuItemId"
                class="sidebar-menu-item block transition-all duration-200 ease-in-out rounded-md flex-col items-center justify-center self-stretch w-full"
                :class="{ 'opacity-50 pointer-events-none grayscale': !item.isEnabled }"
                :title="$t(item.translationKey, item.fallbackLabel)">
                <a :href="item.route || '#'" @click.prevent="handleMenuClick(item)"
                  class="main-menu-item group flex flex-col items-center justify-center self-stretch gap-0.5 p-2 rounded-md transition-all duration-200 ease-in-out hover:bg-sidebar-active"
                  :class="{ 'bg-sidebar-active': isMenuItemRouteActive(item) }"
                  :style="!item.isEnabled ? { pointerEvents: 'none', opacity: '0.5' } : {}">
                  <img :src="getAssetUrlSync(item.iconAssetFlag, { section: 'dashboard-global' })" :alt="$t(item.translationKey, item.fallbackLabel)"
                    class="w-6 h-6 pointer-events-none group-hover:[filter:brightness(0)_saturate(100%)_invert(29%)_sepia(98%)_saturate(5809%)_hue-rotate(325deg)_brightness(92%)_contrast(121%)]"
                    :class="{ '[filter:brightness(0)_saturate(100%)_invert(29%)_sepia(98%)_saturate(5809%)_hue-rotate(325deg)_brightness(92%)_contrast(121%)]': isMenuItemRouteActive(item) }" />
                  <span class="pointer-events-none text-sidebar-text text-[0.625rem] font-medium leading-[1.125rem] text-center transition-all duration-200 group-hover:text-sidebar-active-text"
                        :class="{ 'text-sidebar-active-text': isMenuItemRouteActive(item) }">
                    {{ $t(item.translationKey, item.fallbackLabel) }}
                  </span>
                </a>
              </div>
            </div>
          </div>

          <!-- More button -->
          <div v-if="overflowMenuItems.length > 0"
            class="flex flex-col items-center justify-center self-stretch rounded-md transition-all duration-200 ease-in-out w-full"
            ref="moreMenuButtonWrapper"
            @mouseenter="handleMoreButtonMouseEnter"
            @mouseleave="handleMoreButtonMouseLeave">
            <a data-dashboard-menu-item="more"
              class="main-menu-item group flex flex-col items-center justify-center self-stretch gap-0.5 p-2 rounded-md transition-all duration-200 ease-in-out hover:bg-sidebar-active cursor-pointer">
              <img :src="sidebarChromeAssetUrls.more || ''" :alt="$t ? $t('dashboard.more') : 'More'"
                class="w-6 h-6 pointer-events-none group-hover:[filter:brightness(0)_saturate(100%)_invert(29%)_sepia(98%)_saturate(5809%)_hue-rotate(325deg)_brightness(92%)_contrast(121%)]" />
              <span class="pointer-events-none text-sidebar-text text-[0.625rem] font-medium leading-[1.125rem] text-center transition-all duration-200 group-hover:text-sidebar-active-text">
                {{ $t ? $t('dashboard.more') : 'More' }}
              </span>
            </a>
          </div>
        </div>
      </div>

      <!-- sidebar-bottom-controls -->
      <div ref="sidebarFooterContainer" class="flex flex-col items-center self-stretch gap-2 pt-2 pb-2">
        <!-- cta-controls -->
        <div class="flex items-center justify-center self-stretch gap-2 pl-1 pr-1">
          <!-- language -->
          <div
            class="language-icon-container relative flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ease-in-out hover:bg-notification-hover group">
            <img v-if="sidebarChromeAssetUrls.language" :src="sidebarChromeAssetUrls.language" alt="language"
              class="w-5 h-5 pointer-events-none group-hover:[filter:brightness(0)_saturate(100%)_invert(29%)_sepia(98%)_saturate(5809%)_hue-rotate(325deg)_brightness(92%)_contrast(121%)]" />
            <LanguageSwitcher variant="invisible" class="!m-0 !p-0 border-none" />
          </div>

          <!-- help -->
          <div
            class="help-icon-container opacity-50 pointer-events-none flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ease-in-out hover:bg-notification-hover group">
            <img v-if="sidebarChromeAssetUrls.help" :src="sidebarChromeAssetUrls.help" alt="help"
              class="w-5 h-5 pointer-events-none group-hover:[filter:brightness(0)_saturate(100%)_invert(29%)_sepia(98%)_saturate(5809%)_hue-rotate(325deg)_brightness(92%)_contrast(121%)]" />
          </div>
        </div>
      </div>
    </div>

    <!-- More Flyout (replaces manual data-floating-panel) -->
    <div v-show="isMoreVisible" class="fixed z-[100]" :style="flyoutWrapperStyle">
      <div class="more-menu-flyout-hover-bridge absolute" :style="bridgeStyle" @mouseenter="handleFlyoutMouseEnter" @mouseleave="handleFlyoutMouseLeave"></div>
      <div class="more-menu-flyout bg-white rounded-2xl shadow-custom p-4 flex flex-col min-w-[200px]" 
           ref="moreMenuFlyoutPanel"
           @mouseenter="handleFlyoutMouseEnter" @mouseleave="handleFlyoutMouseLeave">
        <div class="grid grid-cols-2 gap-x-6 gap-y-6">
          <a v-for="item in overflowMenuItems" :key="item.menuItemId"
            :href="item.route || '#'"
            class="flex flex-col items-center justify-center cursor-pointer group"
            :style="!item.isEnabled ? { pointerEvents: 'none', opacity: '0.5' } : {}"
            @click.prevent="handleMenuClick(item)">
            <div class="w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 group-hover:bg-sidebar-active"
                 :class="{ 'bg-sidebar-active': isMenuItemRouteActive(item) }">
              <img :src="getAssetUrlSync(item.iconAssetFlag, { section: 'dashboard-global' })" :alt="$t(item.translationKey, item.fallbackLabel)"
                class="w-6 h-6 pointer-events-none group-hover:[filter:brightness(0)_saturate(100%)_invert(29%)_sepia(98%)_saturate(5809%)_hue-rotate(325deg)_brightness(92%)_contrast(121%)]"
                :class="{ '[filter:brightness(0)_saturate(100%)_invert(29%)_sepia(98%)_saturate(5809%)_hue-rotate(325deg)_brightness(92%)_contrast(121%)]': isMenuItemRouteActive(item) }" />
            </div>
            <span class="mt-1 text-sidebar-text text-[0.625rem] font-medium leading-[1.125rem] transition-all duration-200 group-hover:text-sidebar-active-text"
                  :class="{ 'text-sidebar-active-text': isMenuItemRouteActive(item) }">
              {{ $t(item.translationKey, item.fallbackLabel) }}
            </span>
          </a>
        </div>
      </div>
    </div>

    <!-- Hidden measurement container -->
    <div class="fixed top-[-9999px] left-[-9999px] invisibleMenuItemsBuffer flex flex-col items-center w-[5.625rem] pl-2 pr-2" ref="menuItemMeasureContainer">
      <div class="sidebar-menu-item block transition-all duration-200 ease-in-out rounded-md flex-col items-center justify-center self-stretch w-full" ref="menuItemMeasureElement">
        <a class="main-menu-item group flex flex-col items-center justify-center self-stretch gap-0.5 p-2 rounded-md transition-all duration-200 ease-in-out">
          <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" class="w-6 h-6 pointer-events-none" />
          <span class="pointer-events-none text-[0.625rem] font-medium leading-[1.125rem] text-center">Test</span>
        </a>
      </div>
    </div>

    <!-- DashboardSubmenuPanel for submenu -->
    <DashboardSubmenuPanel
      :isSubmenuOpen="isSubmenuOpen"
      @update:isSubmenuOpen="isSubmenuOpen = $event"
      :submenuPopupConfig="submenuPopupConfig"
      :currentSubmenuIconAssetFlag="currentSubmenuIconAssetFlag"
      :currentSubmenuTitle="currentSubmenuTitle"
      :currentSubmenuTranslationKey="currentSubmenuTranslationKey"
      :sidebarChromeAssetUrls="sidebarChromeAssetUrls"
      :currentSubmenuItems="currentSubmenuItems"
      @navigate-back="navigateBackInSubmenu"
      @item-click="handleSubmenuItemClick"
    />

    <DashboardProfilePopup v-if="isProfileOpen" :config="avatarPopupConfig" v-model="isProfileOpen" @update:modelValue="handleProfilePopupVisibilityChange" />
    <DashboardNotificationPopup v-if="isNotificationOpen" :config="notificationPopupConfig" v-model="isNotificationOpen" @update:modelValue="handleNotificationPopupVisibilityChange" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { useAuthStore } from "@/stores/useAuthStore";
import { useDashboardNavStore } from "@/stores/useDashboardNavStore";
import { createRoutePrefetchIntentHandler } from "@/systems/routing/useRoutePrefetch.js";
import { createDashboardSidebarSlideInConfig } from "@/systems/dashboard/createDashboardSidebarSlideInConfig.js";
import { getAssetUrlSync } from "@/systems/assets/assetLibrary.js";

import DashboardSubmenuPanel from "@/dev/templates/dashboard/shared/DashboardSubmenuPanel.vue";
import DashboardProfilePopup from "@/components/ui/popup/DashboardProfilePopup.vue";
import DashboardNotificationPopup from "@/components/ui/popup/DashboardNotificationPopup.vue";
import DashboardMenuCounter from "@/components/ui/nav/dashboard/DashboardMenuCounter.vue";
import LanguageSwitcher from "@/components/ui/nav/language/LanguageSwitcher.vue";

import { useDashboardSidebarAssets } from "@/systems/dashboard/useDashboardSidebarAssets.js";
import { useDashboardMenuNavigation } from "@/systems/dashboard/useDashboardMenuNavigation.js";
import { useSidebarOverflow } from "@/systems/dashboard/useSidebarOverflow.js";

const router = useRouter();
const route = useRoute();


const isProfileOpen = ref(false);
const isNotificationOpen = ref(false);

const submenuPopupConfig = createDashboardSidebarSlideInConfig({
  width: { default: "400px", "<640": "100%" }
});
const notificationPopupConfig = createDashboardSidebarSlideInConfig();
const avatarPopupConfig = createDashboardSidebarSlideInConfig();

const sidebarMenuContainer = ref(null);
const sidebarHeaderContainer = ref(null);
const sidebarFooterContainer = ref(null);
const sidebarLogoContainer = ref(null);
const menuItemMeasureElement = ref(null);
const moreMenuButtonWrapper = ref(null);
const moreMenuFlyoutPanel = ref(null);
const sidebarEl = ref(null);

const closeAllSidebarPanels = () => {
  isSubmenuOpen.value = false;
  isProfileOpen.value = false;
  isNotificationOpen.value = false;
};

const handleProfilePopupVisibilityChange = (isOpen) => {
  closeAllSidebarPanels();
  isProfileOpen.value = isOpen;
};

const handleNotificationPopupVisibilityChange = (isOpen) => {
  closeAllSidebarPanels();
  isNotificationOpen.value = isOpen;
};

const handleLogout = async () => {
  const authStore = useAuthStore();
  await authStore.logout();
  if (router) {
    router.push('/login');
  }
};

const prefetchMenuItemRoute = (item) => {
  if (item?.isEnabled && item?.route) {
    createRoutePrefetchIntentHandler(item.route)();
  }
};

const {
  sidebarChromeAssetUrls,
  loadSidebarChromeAssets,
} = useDashboardSidebarAssets();

const {
  dashboardMenuItems,
  isSubmenuOpen,
  currentSubmenuItems,
  currentSubmenuTitle,
  currentSubmenuTranslationKey,
  currentSubmenuIconAssetFlag,
  submenuHistory,
  loadDashboardMenuItems,
  isMenuItemRouteActive,
  handleMenuClick,
  handleSubmenuItemClick,
  navigateBackInSubmenu
} = useDashboardMenuNavigation(closeAllSidebarPanels);

const {
  visibleMenuItems,
  overflowMenuItems,
  isMoreVisible,
  updateVisibleMenuItems,
  handleMoreButtonMouseEnter,
  handleMoreButtonMouseLeave,
  handleFlyoutMouseEnter,
  handleFlyoutMouseLeave,
  flyoutWrapperStyle,
  bridgeStyle
} = useSidebarOverflow(dashboardMenuItems, sidebarEl, sidebarMenuContainer, menuItemMeasureElement, moreMenuButtonWrapper);

let resizeObserver = null;

onMounted(async () => {
  const navStore = useDashboardNavStore();
  await navStore.hydrateFromDashboardNavApi();
  
  await loadSidebarChromeAssets();
  await loadDashboardMenuItems();

  if (sidebarMenuContainer.value && sidebarEl.value) {
    updateVisibleMenuItems(sidebarHeaderContainer, sidebarFooterContainer, sidebarLogoContainer);
    resizeObserver = new ResizeObserver(() => {
      updateVisibleMenuItems(sidebarHeaderContainer, sidebarFooterContainer, sidebarLogoContainer);
    });
    resizeObserver.observe(sidebarEl.value);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>
