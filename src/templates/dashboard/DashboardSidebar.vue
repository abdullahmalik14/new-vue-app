<template>
  <div
    class="sidebar-wrapper flex sticky top-0 z-[3] h-screen w-max shadow-custom bg-[rgba(249,250,251,0.7)] backdrop-blur-xs [-ms-overflow-style:none] [scrollbar-width:none]">
    <div
      class="sidebar-container transition-all duration-150 ease-in-out w-[5.625rem] gap-1.5 pt-3 pb-3 z-[5] relative flex flex-col items-center justify-start">
      <!-- site-logo -->
      <div @click="$router.push('/dashboard')"
        class="flex items-center gap-2.5 rounded-xl cursor-pointer transition-opacity duration-200 ease-in-out bg-fce40d opacity-80">
        <img v-if="assets.logo" :src="assets.logo" alt="logo" class="w-9 h-9 pointer-events-none" />
      </div>

      <!-- profile & controls -->
      <div class="flex flex-col items-center self-stretch gap-2 pt-2 pb-2 pl-1 pr-1 border-b border-d0d5dd">
        <!-- avatar -->
        <div class="flex w-10 h-10 rounded-[1.25rem]">
          <div @click="isProfileOpen = true" class="flex relative w-10 h-10 rounded-[1.25rem] cursor-pointer">
            <img v-if="assets.avatar" :src="assets.avatar" alt="user"
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
            class="log-out-icon-container flex cursor-pointer items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ease-in-out hover:bg-notification-hover group">
            <img v-if="assets.logout" :src="assets.logout" alt="logout"
              class="w-5 h-5 pointer-events-none transition-all duration-200 [filter:brightness(0)_saturate(100%)_invert(45%)_sepia(13%)_saturate(594%)_hue-rotate(183deg)_brightness(92%)_contrast(92%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(29%)_sepia(98%)_saturate(5809%)_hue-rotate(325deg)_brightness(92%)_contrast(121%)]" />
          </div>

          <!-- notification -->
          <div @click="isNotificationOpen = true"
            class="notification-icon-container cursor-pointer flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ease-in-out hover:bg-notification-hover relative group">
            <img v-if="assets.notification" :src="assets.notification" alt="notification"
              class="w-6 h-6 pointer-events-none transition-all duration-200 group-hover:[filter:brightness(0)_saturate(100%)_invert(29%)_sepia(98%)_saturate(5809%)_hue-rotate(325deg)_brightness(92%)_contrast(121%)]" />
            <!-- status-indicator -->
            <div
              class="absolute top-[0.188rem] right-[0.188rem] flex w-[0.438rem] h-[0.438rem] rounded-[0.625rem] bg-ff00a6">
              &nbsp;
            </div>
          </div>
        </div>
      </div>

      <!-- main-navigation -->
      <div class="flex flex-col items-center self-stretch flex-1 gap-1 pt-1 pb-1 pl-2 pr-2 overflow-hidden" ref="menuContainer">
        <div class="flex flex-col items-center self-stretch gap-1 w-full">
          <div class="flex flex-col relative z-[5] self-stretch w-full">
            <div class="flex flex-col items-center self-stretch gap-1">
              <!-- Render visible menu items -->
              <div v-for="item in visibleItems" :key="item.id || item.title"
                class="sidebar-menu-item block transition-all duration-200 ease-in-out rounded-md flex-col items-center justify-center self-stretch w-full"
                :class="{ 'opacity-50 pointer-events-none grayscale': !item.enabled }"
                :title="item.title">
                <a href="#" @click.prevent="handleMenuClick(item)"
                  class="main-menu-item group flex flex-col items-center justify-center self-stretch gap-0.5 p-2 rounded-md transition-all duration-200 ease-in-out hover:bg-sidebar-active"
                  :style="!item.enabled ? { pointerEvents: 'none', opacity: '0.5' } : {}">
                  <img :src="item.image" :alt="item.title"
                    class="w-6 h-6 pointer-events-none transition-all duration-200 group-hover:[filter:brightness(0)_saturate(100%)_invert(29%)_sepia(98%)_saturate(5809%)_hue-rotate(325deg)_brightness(92%)_contrast(121%)]" />
                  <span class="pointer-events-none text-sidebar-text text-[0.625rem] font-medium leading-[1.125rem] text-center transition-all duration-200 group-hover:text-sidebar-active-text">
                    {{ item.title }}
                  </span>
                </a>
              </div>
            </div>
          </div>

          <!-- More button -->
          <div v-if="overflowItems.length > 0"
            class="flex flex-col items-center justify-center self-stretch rounded-md transition-all duration-200 ease-in-out w-full"
            ref="moreButtonWrapper"
            @mouseenter="onMoreEnter"
            @mouseleave="onMoreLeave">
            <a data-menu-item=""
              class="main-menu-item group flex flex-col items-center justify-center self-stretch gap-0.5 p-2 rounded-md transition-all duration-200 ease-in-out hover:bg-sidebar-active cursor-pointer">
              <img :src="assets.more || ''" :alt="moreText"
                class="w-6 h-6 pointer-events-none transition-all duration-200 group-hover:[filter:brightness(0)_saturate(100%)_invert(29%)_sepia(98%)_saturate(5809%)_hue-rotate(325deg)_brightness(92%)_contrast(121%)]" />
              <span class="pointer-events-none text-sidebar-text text-[0.625rem] font-medium leading-[1.125rem] text-center transition-all duration-200 group-hover:text-sidebar-active-text">
                {{ moreText }}
              </span>
            </a>
          </div>
        </div>
      </div>

      <!-- sidebar-bottom-controls -->
      <div class="flex flex-col items-center self-stretch gap-2 pt-2 pb-2">
        <!-- cta-controls -->
        <div class="flex items-center justify-center self-stretch gap-2 pl-1 pr-1">
          <!-- language -->
          <div
            class="language-icon-container flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ease-in-out hover:bg-notification-hover group cursor-pointer">
            <img v-if="assets.language" :src="assets.language" alt="language"
              class="w-5 h-5 pointer-events-none transition-all duration-200 group-hover:[filter:brightness(0)_saturate(100%)_invert(29%)_sepia(98%)_saturate(5809%)_hue-rotate(325deg)_brightness(92%)_contrast(121%)]" />
          </div>

          <!-- help -->
          <div
            class="help-icon-container opacity-50 pointer-events-none flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ease-in-out hover:bg-notification-hover group">
            <img v-if="assets.help" :src="assets.help" alt="help"
              class="w-5 h-5 pointer-events-none transition-all duration-200 group-hover:[filter:brightness(0)_saturate(100%)_invert(29%)_sepia(98%)_saturate(5809%)_hue-rotate(325deg)_brightness(92%)_contrast(121%)]" />
          </div>
        </div>
      </div>
    </div>

    <!-- More Flyout (replaces manual data-floating-panel) -->
    <div v-if="isMoreVisible" class="fixed z-[100]" :style="flyoutWrapperStyle">
      <div class="hover-bridge absolute" :style="bridgeStyle" @mouseenter="onMoreEnter" @mouseleave="onMoreLeave"></div>
      <div class="sidebar-flyout bg-white rounded-2xl shadow-custom p-4 flex flex-col min-w-[200px]" 
           ref="flyoutInner"
           @mouseenter="onMoreEnter" @mouseleave="onMoreLeave">
        <div class="grid grid-cols-2 gap-x-6 gap-y-6">
          <div v-for="item in overflowItems" :key="item.id || item.title"
            class="flex flex-col items-center justify-center cursor-pointer group"
            @click="handleMenuClick(item)">
            <div class="w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 group-hover:bg-sidebar-active">
              <img :src="item.image" :alt="item.title"
                class="w-6 h-6 pointer-events-none transition-all duration-200 group-hover:[filter:brightness(0)_saturate(100%)_invert(29%)_sepia(98%)_saturate(5809%)_hue-rotate(325deg)_brightness(92%)_contrast(121%)]" />
            </div>
            <span class="mt-1 text-sidebar-text text-[0.625rem] font-medium leading-[1.125rem] transition-all duration-200 group-hover:text-sidebar-active-text">
              {{ item.title }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden measurement container -->
    <div class="fixed top-[-9999px] left-[-9999px] invisible flex flex-col items-center w-[5.625rem] pl-2 pr-2" ref="measureContainer">
      <div class="sidebar-menu-item block p-2 rounded-md flex-col items-center justify-center self-stretch" ref="measureItem">
        <div class="flex flex-col items-center h-[52px]"></div>
      </div>
      <div class="sidebar-menu-item block p-2 rounded-md flex-col items-center justify-center self-stretch" ref="measureMore">
        <div class="flex flex-col items-center h-[52px]"></div>
      </div>
    </div>

    <!-- PopupHandler for submenu -->
    <PopupHandler v-model="showSubmenuPopup" :config="submenuPopupConfig" :is-loading="false">
      <div class="w-full h-[100vh] flex flex-col items-start gap-4 overflow-hidden bg-submenu-bg px-4 py-2 shadow-md backdrop-blur-lg">
        <!-- submenu-header -->
        <div class="flex justify-between gap-4 w-full mt-8">
          <!-- title -->
          <div class="flex items-center gap-2 w-full">
            <img :src="currentSubmenuImage" :alt="currentSubmenuTitle" class="w-5 h-5" />
            <span class="text-sm font-semibold text-submenu-title-text">{{ currentSubmenuTitle }}</span>
          </div>

          <!-- back-button -->
          <div class="flex w-full justify-end">
            <a @click="showSubmenuPopup = false"
              class="flex items-center justify-center w-6 h-6 md:w-auto md:h-auto p-0 md:p-2 rounded-md transition-all duration-200 ease-in-out hover:bg-panel-light-buttonHover cursor-pointer">
              <img v-if="assets.closeDesktop"
                class="w-6 h-6 pointer-events-none hidden md:block [filter:brightness(0)_saturate(100%)_invert(45%)_sepia(13%)_saturate(594%)_hue-rotate(183deg)_brightness(92%)_contrast(92%)]"
                :src="assets.closeDesktop" alt="close" />
              <img v-if="assets.closeMobile"
                class="block w-6 h-6 pointer-events-none md:hidden [filter:brightness(0)_saturate(100%)_invert(45%)_sepia(13%)_saturate(594%)_hue-rotate(183deg)_brightness(92%)_contrast(92%)]"
                :src="assets.closeMobile" alt="close" />
            </a>
          </div>
        </div>

        <!-- Submenu items -->
        <div class="flex flex-col overflow-auto w-full gap-2 py-2">
          <button v-for="child in currentSubmenuItems" :key="child.id" :disabled="!child.enabled"
            @click="child.enabled && handleChildClick(child)" :class="[
              'relative flex w-full gap-3 rounded-md px-4 py-2 group transition-all duration-200 outline-none',
              child.enabled
                ? 'hover:bg-transparent cursor-pointer'
                : 'cursor-not-allowed opacity-50',
            ]">
            <span :class="[
              'relative z-10 text-sm font-medium transition',
              child.enabled
                ? 'text-submenu-item-text group-hover:text-submenu-item-hover-shadow'
                : 'text-gray-400',
            ]">
              {{ child.title }}
              <span v-if="child.count" class="text-[0.625rem] font-medium" :class="child.enabled ? 'group-hover:text-submenu-item-hover-shadow' : ''">
                {{ child.count }}
              </span>
            </span>

            <!-- Left hover effect -->
            <div v-if="child.enabled"
              class="absolute top-0 left-0 z-0 h-full w-[calc(100%-1.25rem)] opacity-0 group-hover:opacity-100 group-hover:visible invisible bg-black shadow-green transition">
            </div>

            <!-- Skewed side -->
            <div v-if="child.enabled"
              class="absolute top-0 left-[calc(100%-1.25rem)] z-0 h-full w-4 -translate-x-[0.438rem] -skew-x-[20deg] bg-black shadow-green opacity-0 group-hover:opacity-100 group-hover:visible invisible transition">
            </div>
          </button>
        </div>
      </div>
    </PopupHandler>

    <AvatarProfilePopup :config="avatarPopupconfig" v-model="isProfileOpen" @update:modelValue="(val) => { closeAllPopups(); isProfileOpen = val; }" />
    <NotificationPopup :config="notificationPopupConfig" v-model="isNotificationOpen" @update:modelValue="(val) => { closeAllPopups(); isNotificationOpen = val; }" />
  </div>
</template>
<script>
import { menuItems, resolveMenuItemsWithAssets } from "../../assets/data/menuItems.js";
import PopupHandler from "@/components/ui/popup/PopupHandler.vue";
import AvatarProfilePopup from "@/components/ui/popup/AvatarProfilePopup.vue";
import NotificationPopup from "@/components/ui/popup/NotificationPopup.vue";
import { loadTranslationsForSection } from "@/utils/translation/translationLoader.js";
import { getActiveLocale } from "@/utils/translation/localeManager.js";
import { getI18nInstance } from "@/utils/translation/i18nInstance.js";

export default {
  name: "Sidebar",
  components: {
    PopupHandler,
    AvatarProfilePopup,
    NotificationPopup,
  },
  data() {
    return {
      isProfileOpen: false,
      isNotificationOpen: false,
      showSubmenuPopup: false,
      currentSubmenuItems: [],
      currentSubmenuTitle: "",
      currentSubmenuImage: "",
      resolvedMenuItems: [],
      visibleItems: [],
      overflowItems: [],
      isMoreVisible: false,
      moreHovered: false,
      moreButtonHovered: false,
      hideTimeout: null,
      resizeObserver: null,
      assets: {
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
        actionType: "slidein",
        from: "left",
        offset: "5.625rem",
        speed: "250ms",
        effect: "ease-in-out",
        showOverlay: false,
        closeOnOutside: true,
        lockScroll: false,
        escToClose: true,
        width: { default: "400px", "<640": "100%" },
        height: "100%",
        scrollable: true,
        closeSpeed: "250ms",
        closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      notificationPopupConfig: {
        actionType: "slidein",
        from: "left",
        offset: "5.625rem",
        speed: "250ms",
        effect: "ease-in-out",
        showOverlay: false,
        closeOnOutside: true,
        lockScroll: false,
        escToClose: true,
        width: { default: "auto" },
        height: "100%",
        scrollable: true,
        closeSpeed: "250ms",
        closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      avatarPopupconfig: {
        actionType: "slidein",
        from: "left",
        offset: "5.625rem",
        speed: "250ms",
        effect: "ease-in-out",
        showOverlay: false,
        closeOnOutside: true,
        lockScroll: false,
        escToClose: true,
        width: { default: "auto" },
        height: "100%",
        scrollable: true,
        closeSpeed: "250ms",
        closeEffect: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    };
  },
  computed: {
    moreText() {
      return this.$t ? this.$t('dashboard.more') : 'More';
    },
    flyoutClasses() {
      return {
        'opacity-0 invisible pointer-events-none scale-0 translate-y-16': !this.isMoreVisible,
        'opacity-100 visible pointer-events-auto scale-100 translate-y-0': this.isMoreVisible,
      };
    },
    flyoutWrapperStyle() {
      if (!this.isMoreVisible || !this.$refs.moreButtonWrapper) return { top: '-9999px', left: '-9999px' };
      const btnRect = this.$refs.moreButtonWrapper.getBoundingClientRect();
      
      // Calculate flyout height dynamically if possible, or use a reasonable estimate
      let flyoutHeight = 0;
      if (this.$refs.flyoutInner) {
        flyoutHeight = this.$refs.flyoutInner.offsetHeight;
      } else {
        // Fallback estimate: 2 rows of items (2*52px) + padding (2*16px) + gap (1*24px) = 104 + 32 + 24 = 160px
        // This is a rough estimate, actual height depends on content and number of items
        const numRows = Math.ceil(this.overflowItems.length / 2);
        flyoutHeight = (numRows * 52) + ((numRows - 1) * 24) + (2 * 16); // item height + gap + padding
        if (this.overflowItems.length === 0) flyoutHeight = 0; // No items, no flyout
        if (flyoutHeight < 100) flyoutHeight = 100; // Minimum height
      }

      // Align bottom of flyout with bottom of button and offset it "thora upper"
      let top = btnRect.bottom - flyoutHeight - 10;
      
      // Ensure it doesn't go off screen
      const windowHeight = window.innerHeight;
      if (top < 10) top = 10;
      if (top + flyoutHeight > windowHeight - 10) {
        top = windowHeight - flyoutHeight - 10;
      }
      
      return {
        top: `${top}px`,
        left: `${btnRect.right + 10}px`,
        pointerEvents: 'auto'
      };
    },
    bridgeStyle() {
      if (!this.isMoreVisible || !this.$refs.moreButtonWrapper) return { top: '-9999px', left: '-9999px' };
      // Simplified bridge style - basically covers the gap between button and flyout
      const btnRect = this.$refs.moreButtonWrapper.getBoundingClientRect();
      return {
        top: `${btnRect.top - 10}px`,
        left: `${btnRect.right - 10}px`,
        width: '30px',
        height: `${btnRect.height + 20}px`
      };
    }
  },
  watch: {
    '$i18n.locale': {
      handler: 'handleLocaleChange',
      immediate: false
    },
    isMoreVisible(val) {
      if (val) {
        // Force a re-render/re-evaluation of computed styles on next tick
        this.$nextTick(() => {
          this.$forceUpdate();
        });
      }
    }
  },
  async beforeMount() {
    await this.loadAllAssets();
  },
  async mounted() {
    await this.loadTranslations();
    await this.resolveMenuItems();
    
    // Initial calculation
    this.$nextTick(() => {
      this.calculateOverflow();
    });

    // Setup ResizeObserver for the container
    if (this.$refs.menuContainer) {
      this.resizeObserver = new ResizeObserver(() => {
        this.calculateOverflow();
      });
      this.resizeObserver.observe(this.$el); // Observe the whole sidebar for height changes
    }
  },
  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
  },
  methods: {
    async loadAssetWithRetry(flag, maxRetries = 2) {
      const { getAssetUrl } = await import("@/utils/assets/assetLibrary.js");
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const url = await getAssetUrl(flag);
          if (url) return url;
          if (attempt < maxRetries) await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 100));
        } catch (e) {
          if (attempt === maxRetries) throw e;
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 100));
        }
      }
      return null;
    },
    async loadTranslations() {
      try {
        const locale = getActiveLocale() || 'en';
        await loadTranslationsForSection('dashboard-global', locale);
      } catch (e) {
        console.warn('[DashboardSidebar] Translation load failed', e);
      }
    },
    async resolveMenuItems() {
      try {
        this.resolvedMenuItems = await resolveMenuItemsWithAssets(menuItems);
      } catch (e) {
        this.resolvedMenuItems = menuItems;
      }
    },
    async handleLocaleChange() {
      await this.loadTranslations();
      await this.resolveMenuItems();
      this.calculateOverflow();
    },
    async loadAllAssets() {
      try {
        const { preloadAsset } = await import("@/utils/assets/assetPreloader.js");
        const flags = ['dashboard.logo', 'dashboard.avatar', 'dashboard.notification', 'dashboard.logout', 'dashboard.language', 'dashboard.help', 'dashboard.close.desktop', 'dashboard.close.mobile', 'dashboard.more'];
        await Promise.allSettled(flags.map(flag => preloadAsset({ flag, type: 'image', priority: 'normal' })));
        const urls = await Promise.all(flags.map(flag => this.loadAssetWithRetry(flag)));
        this.assets = {
          logo: urls[0], avatar: urls[1], notification: urls[2], logout: urls[3],
          language: urls[4], help: urls[5], closeDesktop: urls[6], closeMobile: urls[7], more: urls[8]
        };
      } catch (e) {
        console.error('[DashboardSidebar] Asset load failed', e);
      }
    },
    calculateOverflow() {
      if (!this.$refs.menuContainer || !this.$refs.measureItem) return;
      
      const sidebarHeight = this.$el.offsetHeight;
      // Replicating original margin/padding awareness
      const header = this.$el.querySelector(".flex.flex-col.items-center.self-stretch.gap-2.pt-2.pb-2");
      const footer = this.$el.querySelector(".flex.flex-col.items-center.self-stretch.gap-2.pt-2.pb-2:last-child");
      const logo = this.$el.querySelector("div.flex.items-center.gap-2\\.5");
      
      const headerH = header ? header.offsetHeight : 0;
      const footerH = footer ? footer.offsetHeight : 0;
      const logoH = logo ? logo.offsetHeight : 0;
      
      const availableHeight = sidebarHeight - headerH - footerH - logoH - 48;
      const itemH = 56; // 52px height + 4px gap as per manual measurement
      const moreBtnH = 56;

      let usedHeight = 0;
      const visible = [];
      const overflow = [];

      this.resolvedMenuItems.forEach((item) => {
        if (usedHeight + itemH + moreBtnH <= availableHeight) {
          usedHeight += itemH;
          visible.push(item);
        } else {
          overflow.push(item);
        }
      });

      // If everything fits without More button, use extra space
      if (overflow.length === 0 && usedHeight + itemH <= availableHeight + moreBtnH) {
        // Already handled by the logic above essentially
      }

      this.visibleItems = visible;
      this.overflowItems = overflow;
    },
    handleMenuClick(item) {
      this.closeAllPopups();
      if (item.children && item.children.length > 0) {
        this.currentSubmenuItems = item.children;
        this.currentSubmenuTitle = item.title;
        this.currentSubmenuImage = item.image;
        this.showSubmenuPopup = true;
      } else if (item.enabled && item.route) {
        this.$router.push(item.route);
      }
    },
    handleChildClick(child) {
      if (child.enabled && child.route) {
        this.showSubmenuPopup = false;
        this.$router.push(child.route);
      }
    },
    closeAllPopups() {
      this.showSubmenuPopup = false;
      this.isProfileOpen = false;
      this.isNotificationOpen = false;
    },
    onMoreEnter() {
      this.moreButtonHovered = true;
      this.showFlyout();
    },
    onMoreLeave() {
      this.moreButtonHovered = false;
      this.hideFlyout();
    },
    onFlyoutEnter() {
      this.moreHovered = true;
      this.showFlyout();
    },
    onFlyoutLeave() {
      this.moreHovered = false;
      this.hideFlyout();
    },
    onBridgeEnter() {
      this.moreHovered = true;
      this.showFlyout();
    },
    onBridgeLeave() {
      this.moreHovered = false;
      this.hideFlyout();
    },
    showFlyout() {
      if (this.hideTimeout) clearTimeout(this.hideTimeout);
      this.isMoreVisible = true;
    },
    hideFlyout() {
      if (this.hideTimeout) clearTimeout(this.hideTimeout);
      this.hideTimeout = setTimeout(() => {
        if (!this.moreButtonHovered && !this.moreHovered) {
          this.isMoreVisible = false;
        }
      }, 150);
    }
  }
};
</script>
