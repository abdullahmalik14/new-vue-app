<template>
  <div
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
                  <img :src="item.iconUrl" :alt="$t(item.translationKey, item.fallbackLabel)"
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
              <img :src="sidebarChromeAssetUrls.more || ''" :alt="moreMenuButtonLabel"
                class="w-6 h-6 pointer-events-none group-hover:[filter:brightness(0)_saturate(100%)_invert(29%)_sepia(98%)_saturate(5809%)_hue-rotate(325deg)_brightness(92%)_contrast(121%)]" />
              <span class="pointer-events-none text-sidebar-text text-[0.625rem] font-medium leading-[1.125rem] text-center transition-all duration-200 group-hover:text-sidebar-active-text">
                {{ moreMenuButtonLabel }}
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
            class="language-icon-container flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ease-in-out hover:bg-notification-hover group cursor-pointer">
            <img v-if="sidebarChromeAssetUrls.language" :src="sidebarChromeAssetUrls.language" alt="language"
              class="w-5 h-5 pointer-events-none group-hover:[filter:brightness(0)_saturate(100%)_invert(29%)_sepia(98%)_saturate(5809%)_hue-rotate(325deg)_brightness(92%)_contrast(121%)]" />
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
      <div class="more-menu-flyout-hover-bridge absolute" :style="bridgeStyle" @mouseenter="handleMoreButtonMouseEnter" @mouseleave="handleMoreButtonMouseLeave"></div>
      <div class="more-menu-flyout bg-white rounded-2xl shadow-custom p-4 flex flex-col min-w-[200px]" 
           ref="moreMenuFlyoutPanel"
           @mouseenter="handleMoreButtonMouseEnter" @mouseleave="handleMoreButtonMouseLeave">
        <div class="grid grid-cols-2 gap-x-6 gap-y-6">
          <a v-for="item in overflowMenuItems" :key="item.menuItemId"
            :href="item.route || '#'"
            class="flex flex-col items-center justify-center cursor-pointer group"
            :style="!item.isEnabled ? { pointerEvents: 'none', opacity: '0.5' } : {}"
            @click.prevent="handleMenuClick(item)">
            <div class="w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 group-hover:bg-sidebar-active"
                 :class="{ 'bg-sidebar-active': isMenuItemRouteActive(item) }">
              <img :src="item.iconUrl" :alt="$t(item.translationKey, item.fallbackLabel)"
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

    <!-- BasePopupShell for submenu -->
    <BasePopup v-model="isSubmenuOpen" :config="submenuPopupConfig" :is-loading="false">
      <div v-if="isSubmenuOpen" class="w-full h-[100vh] flex flex-col items-start gap-4 overflow-hidden bg-submenu-bg px-4 py-2 shadow-md backdrop-blur-lg">
        <!-- submenu-header -->
        <div class="flex justify-between gap-4 w-full mt-8">
          <!-- title -->
          <div class="flex items-center gap-2 w-full">
            <img :src="currentSubmenuIconUrl" :alt="$t(currentSubmenuTranslationKey, currentSubmenuTitle)" class="w-5 h-5" />
            <span class="text-sm font-semibold text-submenu-title-text">{{ $t(currentSubmenuTranslationKey, currentSubmenuTitle) }}</span>
          </div>

          <!-- back-button -->
          <div class="flex w-full justify-end">
            <a @click="navigateBackInSubmenu"
              class="flex items-center justify-center w-6 h-6 md:w-auto md:h-auto p-0 md:p-2 rounded-md transition-all duration-200 ease-in-out hover:bg-panel-light-buttonHover cursor-pointer">
              <img v-if="sidebarChromeAssetUrls.closeDesktop"
                class="w-6 h-6 pointer-events-none hidden md:block [filter:brightness(0)_saturate(100%)_invert(45%)_sepia(13%)_saturate(594%)_hue-rotate(183deg)_brightness(92%)_contrast(92%)]"
                :src="sidebarChromeAssetUrls.closeDesktop" alt="close" />
              <img v-if="sidebarChromeAssetUrls.closeMobile"
                class="block w-6 h-6 pointer-events-none md:hidden [filter:brightness(0)_saturate(100%)_invert(45%)_sepia(13%)_saturate(594%)_hue-rotate(183deg)_brightness(92%)_contrast(92%)]"
                :src="sidebarChromeAssetUrls.closeMobile" alt="close" />
            </a>
          </div>
        </div>

        <!-- Submenu items -->
        <div class="flex flex-col overflow-auto w-full gap-2 py-2">
          <template v-for="(child, index) in currentSubmenuItems" :key="child.menuItemId || index">
            <!-- Spacer block -->
            <div v-if="child.type === 'spacer'" :class="child.class || 'h-4'"></div>
            
            <!-- Divider block -->
            <div v-else-if="child.type === 'divider'" class="w-full h-px bg-sidebar-active my-1"></div>
            
            <!-- Default Menu Item -->
            <button v-else :disabled="!child.isEnabled"
              @click="child.isEnabled && handleSubmenuItemClick(child)"
              @mouseenter="child.isEnabled && prefetchMenuItemRoute(child)"
              @focus="child.isEnabled && prefetchMenuItemRoute(child)" :class="[
                'relative flex w-full gap-3 rounded-md px-4 py-2 group transition-all duration-200 outline-none',
                child.isEnabled
                  ? 'hover:bg-transparent cursor-pointer'
                  : 'cursor-not-allowed opacity-50',
              ]">
              <span :class="[
                'relative z-10 text-sm font-medium transition flex items-center justify-between w-full gap-2',
                child.isEnabled
                  ? 'text-submenu-item-text group-hover:text-submenu-item-hover-shadow'
                  : 'text-gray-400',
              ]">
                <span class="truncate">{{ $t(child.translationKey, child.fallbackLabel) }}</span>
                <!-- DS-01: Global Counter Badge -->
                <DashboardMenuCounter v-if="child.badgeId || child.count" :badgeId="child.badgeId || child.translationKey" :staticCount="child.count" />
              </span>

              <!-- Left hover effect -->
              <div v-if="child.isEnabled"
                class="absolute top-0 left-0 z-0 h-full w-[calc(100%-1.25rem)] opacity-0 group-hover:opacity-100 group-hover:visibleMenuItemsBuffer invisibleMenuItemsBuffer bg-black shadow-green transition">
              </div>

              <!-- Skewed side -->
              <div v-if="child.isEnabled"
                class="absolute top-0 left-[calc(100%-1.25rem)] z-0 h-full w-4 -translate-x-[0.438rem] -skew-x-[20deg] bg-black shadow-green opacity-0 group-hover:opacity-100 group-hover:visibleMenuItemsBuffer invisibleMenuItemsBuffer transition">
              </div>
            </button>
          </template>
        </div>
      </div>
    </BasePopup>

    <DashboardProfilePopup v-if="isProfileOpen" :config="avatarPopupConfig" v-model="isProfileOpen" @update:modelValue="handleProfilePopupVisibilityChange" />
    <DashboardNotificationPopup v-if="isNotificationOpen" :config="notificationPopupConfig" v-model="isNotificationOpen" @update:modelValue="handleNotificationPopupVisibilityChange" />
  </div>
</template>
<script>
import { dashboardSidebarMenuItems, resolveDashboardSidebarMenuItems } from "@/config/dashboardSidebarMenuItems.js";
import BasePopup from "@/components/ui/popup/BasePopup.vue";
import DashboardProfilePopup from "@/components/ui/popup/DashboardProfilePopup.vue";
import DashboardNotificationPopup from "@/components/ui/popup/DashboardNotificationPopup.vue";
import DashboardMenuCounter from "@/components/ui/nav/dashboard/DashboardMenuCounter.vue";
import { createCombinedRoutePrefetchIntentHandler } from "@/composables/useRoutePrefetch.js";

import { useAuthStore } from "@/stores/useAuthStore";
export default {
  name: "DashboardSharedSidebar",
  components: {
    BasePopup,
    DashboardProfilePopup,
    DashboardNotificationPopup,
    DashboardMenuCounter,
  },
  data() {
    return {
      isProfileOpen: false,
      isNotificationOpen: false,
      isSubmenuOpen: false,
      currentSubmenuItems: [],
      currentSubmenuTitle: "",
      currentSubmenuTranslationKey: "",
      currentSubmenuIconUrl: "",
      submenuHistory: [],
      dashboardMenuItems: [],
      visibleMenuItems: [],
      overflowMenuItems: [],
      isMoreVisible: false,
      isMoreFlyoutHovered: false,
      isMoreButtonHovered: false,
      moreFlyoutHideTimeoutId: null,
      resizeObserver: null,
      sidebarChromeAssetUrls: {
        logo: null,
        avatar: null,
        logout: null,
        notification: null,
        language: null,
        help: null,
        closeDesktop: null,
        closeMobile: null,
        more: null,
      },
      submenuPopupConfig: {
        actionType: "slideIn",
        from: "left",
        offset: "5.625rem",
        speed: "250ms",
        effect: "ease-in-out",
        shouldShowOverlay: false,
        shouldCloseOnOutsideClick: true,
        shouldLockBodyScroll: false,
        shouldCloseOnEscape: true,
        width: { default: "400px", "<640": "100%" },
        height: "100%",
        scrollable: true,
        closeSpeed: "250ms",
        closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      notificationPopupConfig: {
        actionType: "slideIn",
        from: "left",
        offset: "5.625rem",
        speed: "250ms",
        effect: "ease-in-out",
        shouldShowOverlay: false,
        shouldCloseOnOutsideClick: true,
        shouldLockBodyScroll: false,
        shouldCloseOnEscape: true,
        width: { default: "auto" },
        height: "100%",
        scrollable: true,
        closeSpeed: "250ms",
        closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      avatarPopupConfig: {
        actionType: "slideIn",
        from: "left",
        offset: "5.625rem",
        speed: "250ms",
        effect: "ease-in-out",
        shouldShowOverlay: false,
        shouldCloseOnOutsideClick: true,
        shouldLockBodyScroll: false,
        shouldCloseOnEscape: true,
        width: { default: "auto" },
        height: "100%",
        scrollable: true,
        closeSpeed: "250ms",
        closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    };
  },
  computed: {
    moreMenuButtonLabel() {
      return this.$t ? this.$t('dashboard.more') : 'More';
    },
    flyoutClasses() {
      return {
        'opacity-0 invisibleMenuItemsBuffer pointer-events-none scale-0 translate-y-16': !this.isMoreVisible,
        'opacity-100 visibleMenuItemsBuffer pointer-events-auto scale-100 translate-y-0': this.isMoreVisible,
      };
    },
    flyoutWrapperStyle() {
      if (!this.isMoreVisible || !this.$refs.moreMenuButtonWrapper) return { top: '-9999px', left: '-9999px' };
      const moreButtonBoundingRect = this.$refs.moreMenuButtonWrapper.getBoundingClientRect();
      
      // Calculate flyout height dynamically if possible, or use a reasonable estimate
      let moreFlyoutHeight = 0;
      if (this.$refs.flyoutInner && this.$refs.flyoutInner.offsetHeight > 0) {
        moreFlyoutHeight = this.$refs.flyoutInner.offsetHeight;
      } else {
        // Fallback estimate: 2 rows of items (2*52px) + padding (2*16px) + gap (1*24px)
        const overflowMenuRowCount = Math.ceil(this.overflowMenuItems.length / 2);
        moreFlyoutHeight = (overflowMenuRowCount * 52) + ((overflowMenuRowCount - 1) * 24) + (2 * 16); 
        if (this.overflowMenuItems.length === 0) moreFlyoutHeight = 0; 
        if (moreFlyoutHeight < 100) moreFlyoutHeight = 100;
      }

      // Default: Align top of flyout with top of button so it's directly across
      let top = moreButtonBoundingRect.top;
      
      // Ensure it doesn't go off screen at the bottom
      const windowHeight = window.innerHeight;
      if (top + moreFlyoutHeight > windowHeight - 10) {
        top = windowHeight - moreFlyoutHeight - 10;
      }
      
      // Ensure it doesn't go off screen at the top
      if (top < 10) top = 10;
      
      return {
        top: `${top}px`,
        left: `${moreButtonBoundingRect.right + 4}px`, // 4px gap to the button
        pointerEvents: 'auto'
      };
    },
    bridgeStyle() {
      if (!this.isMoreVisible || !this.$refs.moreMenuButtonWrapper) return { top: '-9999px', left: '-9999px' };
      // Simplified bridge style - basically covers the gap between button and flyout
      const moreButtonBoundingRect = this.$refs.moreMenuButtonWrapper.getBoundingClientRect();
      return {
        top: `${moreButtonBoundingRect.top - 10}px`,
        left: `${moreButtonBoundingRect.right - 10}px`,
        width: '30px',
        height: `${moreButtonBoundingRect.height + 20}px`
      };
    }
  },
  watch: {
    '$i18n.locale': {
      handler: 'handleLocaleChange',
      immediate: false
    },
    isMoreVisible(isMoreMenuFlyoutVisible) {
      if (isMoreMenuFlyoutVisible) {
        // Force a re-render/re-evaluation of computed styles on next tick
        this.$nextTick(() => {
          this.$forceUpdate();
        });
      }
    },
    isSubmenuOpen(isSubmenuPanelOpen) {
      if (!isSubmenuPanelOpen) {
        this.submenuHistory = []; // Reset on close
      }
      // Dispatch custom event for menu open/close and active menu state
      const event = new CustomEvent('dashboard-menu-state', {
        detail: {
          isOpen: isSubmenuPanelOpen,
          activePage: this.currentSubmenuTitle || null
        }
      });
      window.dispatchEvent(event);
    }
  },
  async beforeMount() {
    await this.loadSidebarChromeAssets();
  },
  async mounted() {
    await this.loadDashboardMenuItems();
    
    // Initial calculation
    this.$nextTick(() => {
      this.updateVisibleMenuItems();
    });

    // Setup ResizeObserver for the container
    if (this.$refs.sidebarMenuContainer) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateVisibleMenuItems();
      });
      this.resizeObserver.observe(this.$el); // Observe the whole sidebar for height changes
    }
  },
  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.moreFlyoutHideTimeoutId) {
      clearTimeout(this.moreFlyoutHideTimeoutId);
    }
  },
  methods: {
    handleProfilePopupVisibilityChange(isOpen) {
      this.closeAllSidebarPanels();
      this.isProfileOpen = isOpen;
    },
    handleNotificationPopupVisibilityChange(isOpen) {
      this.closeAllSidebarPanels();
      this.isNotificationOpen = isOpen;
    },
    async handleLogout() {
      const authStore = useAuthStore();
      await authStore.logout();
      if (this.$router) {
        this.$router.push('/login');
      }
    },
    isMenuItemRouteActive(item) {
      if (!item.route || !this.$route) return false;
      // Handle exact match for dashboard home
      if (item.route === '/dashboard' || item.route === '/dashboard/') {
        return this.$route.path === '/dashboard' || this.$route.path === '/dashboard/';
      }
      // For other routes, check if the current path starts with the item's route
      return this.$route.path.startsWith(item.route);
    },
    async loadDashboardMenuItems() {
      try {
        const authStore = useAuthStore();
        const userRole = authStore.userRole;
        this.dashboardMenuItems = await resolveDashboardSidebarMenuItems(dashboardSidebarMenuItems, userRole);
      } catch (error) {
        this.dashboardMenuItems = dashboardSidebarMenuItems;
      }
    },
    async handleLocaleChange() {
      await this.loadDashboardMenuItems();
      this.updateVisibleMenuItems();
    },
    async loadSidebarChromeAssets() {
      try {
        const { resolveSharedComponentAssets } = await import('@/systems/assets/resolveSharedComponentAssets.js');
        this.sidebarChromeAssetUrls = {
          logo: null,
          avatar: null,
          logout: null,
          notification: null,
          language: null,
          help: null,
          closeDesktop: null,
          closeMobile: null,
          more: null,
          ...await resolveSharedComponentAssets('dashboardSidebarChrome'),
        };
      } catch (error) {
        console.error('[DashboardSharedSidebar] Asset load failed', error);
      }
    },
    updateVisibleMenuItems() {
      if (!this.$refs.sidebarMenuContainer || !this.$refs.menuItemMeasureElement) return;
      
      const sidebarHeight = this.$el.offsetHeight;
      const headerHeight = this.$refs.sidebarHeaderContainer ? this.$refs.sidebarHeaderContainer.offsetHeight : 0;
      const footerHeight = this.$refs.sidebarFooterContainer ? this.$refs.sidebarFooterContainer.offsetHeight : 0;
      const logoHeight = this.$refs.sidebarLogoContainer ? this.$refs.sidebarLogoContainer.offsetHeight : 0;
      
      const layoutFixedSpacingPx = 50; // padding and gaps from the layout structure
      const availableHeightForMenuItemsPx = sidebarHeight - headerHeight - footerHeight - logoHeight - layoutFixedSpacingPx;
      
      const measuredMenuItemHeightPx = this.$refs.menuItemMeasureElement ? this.$refs.menuItemMeasureElement.offsetHeight : 52;
      const menuItemHeight = measuredMenuItemHeightPx + 4; // Add 4px for the gap-1
      const moreButtonHeight = menuItemHeight;

      let usedMenuHeightPx = 0;
      const visibleMenuItemsBuffer = [];
      const overflowMenuItemsBuffer = [];

      // Check if EVERYTHING fits perfectly
      const totalRequiredMenuHeightPx = this.dashboardMenuItems.length * menuItemHeight;
      if (totalRequiredMenuHeightPx <= availableHeightForMenuItemsPx) {
        this.visibleMenuItems = [...this.dashboardMenuItems];
        this.overflowMenuItems = [];
        return;
      }

      // If it doesn't fit, we MUST have a More button. Reserve its space.
      const availableHeightPxWithMore = availableHeightForMenuItemsPx - moreButtonHeight;

      this.dashboardMenuItems.forEach((item) => {
        if (usedMenuHeightPx + menuItemHeight <= availableHeightPxWithMore) {
          usedMenuHeightPx += menuItemHeight;
          visibleMenuItemsBuffer.push(item);
        } else {
          overflowMenuItemsBuffer.push(item);
        }
      });

      this.visibleMenuItems = visibleMenuItemsBuffer;
      this.overflowMenuItems = overflowMenuItemsBuffer;
    },
    handleMenuClick(item) {
      this.closeAllSidebarPanels();
      if (item.submenuItems && item.submenuItems.length > 0) {
        this.submenuHistory = [];
        this.currentSubmenuItems = item.submenuItems;
        this.currentSubmenuTitle = item.fallbackLabel;
        this.currentSubmenuTranslationKey = item.translationKey;
        this.currentSubmenuIconUrl = item.iconUrl;
        this.isSubmenuOpen = true;
      } else if (item.isEnabled && item.route) {
        this.$router.push(item.route);
      }
    },
    prefetchMenuItemRoute(item) {
      if (item?.enabled && item?.route) {
        createCombinedRoutePrefetchIntentHandler(item.route)();
      }
    },
    handleSubmenuItemClick(submenuItem) {
      if (submenuItem.submenuItems && submenuItem.submenuItems.length > 0) {
        this.submenuHistory.push({
          submenuItems: this.currentSubmenuItems,
          submenuTitle: this.currentSubmenuTitle,
          submenuTranslationKey: this.currentSubmenuTranslationKey,
          submenuIconUrl: this.currentSubmenuIconUrl
        });
        this.currentSubmenuItems = submenuItem.submenuItems;
        this.currentSubmenuTitle = submenuItem.fallbackLabel;
        this.currentSubmenuTranslationKey = submenuItem.translationKey;
        this.currentSubmenuIconUrl = submenuItem.iconUrl || this.currentSubmenuIconUrl;
      } else if (submenuItem.isEnabled && submenuItem.route) {
        this.isSubmenuOpen = false;
        this.$router.push(submenuItem.route);
      }
    },
    navigateBackInSubmenu() {
      if (this.submenuHistory.length > 0) {
        const previousSubmenuState = this.submenuHistory.pop();
        this.currentSubmenuItems = previousSubmenuState.submenuItems;
        this.currentSubmenuTitle = previousSubmenuState.submenuTitle;
        this.currentSubmenuTranslationKey = previousSubmenuState.submenuTranslationKey;
        this.currentSubmenuIconUrl = previousSubmenuState.submenuIconUrl;
      } else {
        this.isSubmenuOpen = false;
      }
    },
    closeAllSidebarPanels() {
      this.isSubmenuOpen = false;
      this.isProfileOpen = false;
      this.isNotificationOpen = false;
    },
    handleMoreButtonMouseEnter() {
      this.isMoreButtonHovered = true;
      this.showMoreMenuFlyout();
    },
    handleMoreButtonMouseLeave() {
      this.isMoreButtonHovered = false;
      this.hideMoreMenuFlyout();
    },
    handleFlyoutEnter() {
      this.isMoreFlyoutHovered = true;
      this.showMoreMenuFlyout();
    },
    handleFlyoutLeave() {
      this.isMoreFlyoutHovered = false;
      this.hideMoreMenuFlyout();
    },
    handleBridgeEnter() {
      this.isMoreFlyoutHovered = true;
      this.showMoreMenuFlyout();
    },
    handleBridgeLeave() {
      this.isMoreFlyoutHovered = false;
      this.hideMoreMenuFlyout();
    },
    showMoreMenuFlyout() {
      if (this.moreFlyoutHideTimeoutId) clearTimeout(this.moreFlyoutHideTimeoutId);
      this.isMoreVisible = true;
    },
    hideMoreMenuFlyout() {
      if (this.moreFlyoutHideTimeoutId) clearTimeout(this.moreFlyoutHideTimeoutId);
      this.moreFlyoutHideTimeoutId = setTimeout(() => {
        if (!this.isMoreButtonHovered && !this.isMoreFlyoutHovered) {
          this.isMoreVisible = false;
        }
      }, 150);
    }
  }
};
</script>
