<template>
  <div
    class="sidebar-wrapper flex sticky top-0 z-[3] h-screen flex w-max shadow-custom bg-[rgba(249,250,251,0.7)] backdrop-blur-xs [-ms-overflow-style:none] [scrollbar-width:none]">
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
      <div class="flex flex-col items-center self-stretch flex-1 gap-1 pt-1 pb-1 pl-2 pr-2" ref="menuContainer">
        <div class="flex flex-col items-center self-stretch gap-1">
          <div class="flex flex-col relative z-[5] self-stretch">
            <div class="flex flex-col items-center self-stretch gap-1">
              <!-- Main menu items will be rendered here by JavaScript -->
            </div>
          </div>

          <!-- More button will be rendered here by JavaScript -->
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

    <!-- PopupHandler for submenu -->
    <PopupHandler v-model="showSubmenuPopup" :config="submenuPopupConfig" :is-loading="false">
      <div
        class="w-full h-[100vh] flex flex-col items-start gap-4 overflow-hidden bg-submenu-bg px-4 py-2 shadow-md backdrop-blur-lg">
        <!-- submenu-header -->
        <div class="flex jusify-between gap-4 w-full mt-8">
          <!-- title -->
          <div class="flex items-center gap-2 w-full">
            <img :src="currentSubmenuImage" :alt="currentSubmenuTitle" class="w-5 h-5" />
            <span class="text-sm font-semibold text-submenu-title-text">{{
              currentSubmenuTitle
            }}</span>
          </div>

          <!-- back-button -->
          <div class="flex w-full justify-end">
            <a data-slidein-close
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

              <span v-if="child.count" :class="[
                `text-[0.625rem] font-medium text-submenu-item-text`,
                child.enabled
                  ? `group-hover:text-submenu-item-hover-shadow`
                  : ``,
              ]">
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

    <AvatarProfilePopup :config="avatarPopupconfig" v-model="isProfileOpen" @update:modelValue="
      (val) => {
        closeAllPopups();
        isProfileOpen = val;
      }
    " />
    <NotificationPopup :config="notificationPopupConfig" v-model="isNotificationOpen" @update:modelValue="
      (val) => {
        closeAllPopups();
        isNotificationOpen = val;
      }
    " />
  </div>
</template>

<script>
import { ref } from "vue";
import { menuItems, resolveMenuItemsWithAssets } from "../../assets/data/menuItems.js";
import PopupHandler from "@/components/ui/popup/PopupHandler.vue";
import AvatarProfilePopup from "@/components/ui/popup/AvatarProfilePopup.vue";
import NotificationPopup from "@/components/ui/popup/NotificationPopup.vue";
import { useRouter } from "vue-router";
import { loadTranslationsForSection } from "@/utils/translation/translationLoader.js";
import { getActiveLocale } from "@/utils/translation/localeManager.js";
import { getI18nInstance } from "@/utils/translation/i18nInstance.js";
// Assets will be loaded dynamically with retry logic
const router = useRouter();

export default {
  name: "Sidebar",
  components: {
    PopupHandler,
    AvatarProfilePopup,
    NotificationPopup,
  },
  data() {
    return {
      flyoutHovered: false,
      hideTimeout: null,
      isSidebarAttached: true,
      showSubmenuPopup: false,
      isProfileOpen: false,
      isNotificationOpen: false,
      currentSubmenuItems: [],
      currentSubmenuTitle: "",
      currentSubmenuImage: "",
      resolvedMenuItems: [], // Menu items with resolved asset URLs
      localeWatchInterval: null, // Store interval for cleanup
      // Asset URLs loaded from assetLibrary
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
        offset: "5.625rem", // Sidebar ki actual width (5.625rem = sidebar width, scales with zoom)
        speed: "250ms",
        effect: "ease-in-out",
        showOverlay: false, // Overlay nahi chahiye taaki sidebar dikhe
        closeOnOutside: true,
        lockScroll: false, // Scroll lock nahi, kyunki sidebar bhi visible rahna hai
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
  async beforeMount() {
    // Load all asset URLs BEFORE component renders to eliminate time gap
    // This ensures images are ready when component mounts, matching navbar/footer timing
    // All assets are loaded equally with no priority distinction
    await this.loadAllAssets();
  },
  async mounted() {
    // Load translations for dashboard section
    await this.loadTranslations();
    // Resolve menu items with asset URLs
    await this.resolveMenuItems();
    this.renderSidebarMenu();

    // Watch for locale changes and update menu items
    this.startLocaleWatching();

    // Handle sidebar visibility and menu recalculation on resize
    this.handleSidebarVisibility();
    window.addEventListener("resize", this.handleSidebarVisibility);
  },
  beforeUnmount() {
    // Clean up locale watch interval
    if (this.localeWatchInterval) {
      clearInterval(this.localeWatchInterval);
      this.localeWatchInterval = null;
    }
    // Clean up resize event listener
    window.removeEventListener("resize", this.handleSidebarVisibility);
  },
  methods: {
    /**
     * Retry logic for asset loading with exponential backoff
     */
    async loadAssetWithRetry(flag, maxRetries = 2) {
      const { getAssetUrl } = await import("@/utils/assets/assetLibrary.js");

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
            console.warn(`[DashboardSidebar] Failed to load asset after ${maxRetries + 1} attempts:`, flag, error);
            throw error;
          }
          const backoff = Math.pow(2, attempt) * 100;
          await new Promise(resolve => setTimeout(resolve, backoff));
        }
      }
      return null;
    },

    /**
     * Load translations for dashboard section
     */
    async loadTranslations() {
      try {
        const locale = getActiveLocale() || 'en';
        await loadTranslationsForSection('dashboard-global', locale);
      } catch (error) {
        console.warn('[DashboardSidebar] Failed to load translations', error);
        // Continue without translations - will use fallback
      }
    },

    /**
     * Resolve menu items with asset URLs from assetLibrary
     */
    async resolveMenuItems() {
      try {
        this.resolvedMenuItems = await resolveMenuItemsWithAssets(menuItems);
      } catch (error) {
        console.warn('[DashboardSidebar] Failed to resolve menu items with assets, using original menuItems', error);
        // Fallback to original menuItems if resolution fails
        this.resolvedMenuItems = menuItems;
      }
    },

    /**
     * Start watching for locale changes and update menu items
     */
    startLocaleWatching() {
      const i18nInstance = getI18nInstance();
      if (!i18nInstance) {
        console.warn('[DashboardSidebar] i18n instance not available for locale watching');
        return;
      }

      // Get initial locale
      let previousLocale = i18nInstance.global.locale.value;

      // Watch for locale changes using polling
      const checkInterval = setInterval(async () => {
        try {
          const currentLocale = i18nInstance.global.locale.value;
          if (currentLocale !== previousLocale) {
            console.log(`[DashboardSidebar] Locale changed from '${previousLocale}' to '${currentLocale}'`);
            previousLocale = currentLocale;

            // Reload translations and re-resolve menu items
            await this.loadTranslations();
            await this.resolveMenuItems();

            // Re-render the sidebar menu with updated translations
            this.renderSidebarMenu();
          }
        } catch (error) {
          console.warn('[DashboardSidebar] Error checking locale change', error);
        }
      }, 300); // Check every 300ms for responsive updates

      // Store interval ID for cleanup
      this.localeWatchInterval = checkInterval;
    },

    /**
     * Load all asset URLs BEFORE component renders to eliminate time gap
     * All assets are loaded equally with no priority distinction
     * This ensures images are ready when component mounts, matching navbar/footer timing
     */
    async loadAllAssets() {
      try {
        const { getAssetUrl } = await import("@/utils/assets/assetLibrary.js");
        const { preloadAsset } = await import("@/utils/assets/assetPreloader.js");

        // Define all assets - loaded equally with no priority distinction
        const ALL_ASSETS = [
          'dashboard.logo',
          'dashboard.avatar',
          'dashboard.notification',
          'dashboard.logout',
          'dashboard.language',
          'dashboard.help',
          'dashboard.close.desktop',
          'dashboard.close.mobile',
          'dashboard.more'
        ];

        // Preload all images equally (using flags, images will be cached)
        const preloadPromises = ALL_ASSETS.map(flag =>
          preloadAsset({ flag, type: 'image', priority: 'normal' }).catch(() => null)
        );
        await Promise.allSettled(preloadPromises);

        // Load all asset URLs in parallel (images are already preloaded, so this is fast)
        const assetPromises = ALL_ASSETS.map(flag =>
          this.loadAssetWithRetry(flag, 2).catch(err => {
            console.error(`[DashboardSidebar] Asset failed: ${flag}`, err);
            return null;
          })
        );

        const assetResults = await Promise.all(assetPromises);
        this.assets.logo = assetResults[0];
        this.assets.avatar = assetResults[1];
        this.assets.notification = assetResults[2];
        this.assets.logout = assetResults[3];
        this.assets.language = assetResults[4];
        this.assets.help = assetResults[5];
        this.assets.closeDesktop = assetResults[6];
        this.assets.closeMobile = assetResults[7];
        this.assets.more = assetResults[8];
      } catch (error) {
        console.error('[DashboardSidebar] Failed to load assets', error);
        // Continue rendering even if assets fail - graceful degradation
      }
    },

    closeAllPopups() {
      this.showSubmenuPopup = false;
      this.isProfileOpen = false;
      this.isNotificationOpen = false;
    },

    createMenuItem(item) {
      const wrapper = document.createElement("div");
      wrapper.setAttribute("data-menu-item", "");
      if (!item.enabled) wrapper.setAttribute("data-disabled", "true");
      wrapper.title = item.title;

      const content = document.createElement("a");
      content.innerHTML = `
        <img
          src="${item.image}"
          alt="${item.title}"
          class="w-6 h-6 pointer-events-none transition-all duration-200 group-hover:[filter:brightness(0)_saturate(100%)_invert(29%)_sepia(98%)_saturate(5809%)_hue-rotate(325deg)_brightness(92%)_contrast(121%)]"
        />
        <span class="pointer-events-none text-sidebar-text text-[0.625rem] font-medium leading-[1.125rem] text-center transition-all duration-200 group-hover:text-sidebar-active-text">${item.title}</span>
      `;
      content.className =
        "main-menu-item group flex flex-col items-center justify-center self-stretch gap-0.5 p-2 rounded-md transition-all duration-200 ease-in-out hover:bg-sidebar-active";
      content.setAttribute("href", "#");

      content.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleMenuClick(item);
      });

      if (!item.enabled) {
        content.style.pointerEvents = "none";
        content.style.opacity = "0.5";
      }

      wrapper.className =
        "sidebar-menu-item block transition-all duration-200 ease-in-out rounded-md flex-col items-center justify-center self-stretch";
      if (!item.enabled) {
        wrapper.className += " opacity-50 pointer-events-none grayscale";
      }

      wrapper.appendChild(content);
      return wrapper;
    },

    handleMenuClick(item) {
      this.closeAllPopups(); // ✅ added
      if (item.children && item.children.length > 0) {
        this.currentSubmenuItems = item.children;
        this.currentSubmenuTitle = item.title;
        this.currentSubmenuImage = item.image;
        this.showSubmenuPopup = true;
      } else if (item.enabled && item.route) {
        console.log("Navigate to:", item.route);
        this.$router.push(item.route);
      }
    },

    handleChildClick(child) {
      if (child.enabled && child.route) {
        console.log("Navigate to child route:", child.route);
        this.showSubmenuPopup = false;
        this.$router.push(child.route);
      }
    },

    renderSidebarMenu() {
      // Clear any old flyouts before rerendering
      document
        .querySelectorAll("[data-floating-panel-wrapper], .hover-bridge")
        .forEach((el) => el.remove());

      const menuEl = this.$refs.menuContainer;
      if (!menuEl) return;

      // Clear existing menu items
      const existingItems = menuEl.querySelectorAll(
        ".sidebar-menu-item, [data-more-wrapper]"
      );
      existingItems.forEach((item) => item.remove());

      const sidebarHeight = this.$el.offsetHeight;
      const headerHeight = this.$el.querySelector(
        ".flex.flex-col.items-center.self-stretch.gap-2.pt-2.pb-2"
      ).offsetHeight;
      const footerHeight = this.$el.querySelector(
        ".flex.flex-col.items-center.self-stretch.gap-2.pt-2.pb-2:last-child"
      ).offsetHeight;
      const logoEl = this.$el.querySelector("div.flex.items-center.gap-2\\.5");
      const logoHeight = logoEl ? logoEl.offsetHeight : 0;
      const availableHeight =
        sidebarHeight - headerHeight - footerHeight - logoHeight - 48;

      const testContainer = document.createElement("div");
      testContainer.style.visibility = "hidden";
      testContainer.style.position = "absolute";
      testContainer.style.top = "-9999px";
      document.body.appendChild(testContainer);

      let usedHeight = 0;
      let visibleItems = [];
      let overflowItems = [];

      const tempMore = document.createElement("div");
      tempMore.setAttribute("data-menu-item", "");
      const moreText = this.$t ? this.$t('dashboard.more', 'More') : 'More';
      tempMore.innerHTML = `
        <img
          src="${this.assets.more || ''}"
          alt="${moreText}"
          class="w-6 h-6 pointer-events-none transition-all duration-200 group-hover:[filter:brightness(0)_saturate(100%)_invert(29%)_sepia(98%)_saturate(5809%)_hue-rotate(325deg)_brightness(92%)_contrast(121%)]"
        />
        <span class="pointer-events-none text-sidebar-text text-[0.625rem] font-medium leading-[1.125rem] text-center transition-all duration-200 group-hover:text-sidebar-active-text ">${moreText}</span>
      `;
      tempMore.className =
        "main-menu-item group flex flex-col items-center justify-center self-stretch gap-0.5 p-2 rounded-md transition-all duration-200 ease-in-out hover:bg-sidebar-active ";
      const moreWrapper = document.createElement("div");
      moreWrapper.className =
        "sidebar-menu-item block transition-all duration-200 ease-in-out rounded-md flex-col items-center justify-center self-stretch";
      moreWrapper.appendChild(tempMore);
      testContainer.appendChild(moreWrapper);
      const moreBtnHeight = moreWrapper.offsetHeight + 4;

      // Use resolved menu items (with asset URLs) or fallback to original
      const itemsToUse = this.resolvedMenuItems.length > 0 ? this.resolvedMenuItems : menuItems;

      for (let item of itemsToUse) {
        const tempItem = this.createMenuItem(item);
        testContainer.appendChild(tempItem);
        const h = tempItem.offsetHeight + 4;

        if (usedHeight + h + moreBtnHeight <= availableHeight) {
          usedHeight += h;
          visibleItems.push(item);
        } else {
          overflowItems.push(item);
        }
      }

      document.body.removeChild(testContainer);

      const menuItemsContainer = menuEl.querySelector(
        ".flex.flex-col.items-center.self-stretch.gap-1"
      );
      visibleItems.forEach((item) => {
        menuItemsContainer.appendChild(this.createMenuItem(item));
      });

      if (overflowItems.length > 0) {
        this.createOverflowMenu(menuItemsContainer, overflowItems);
      }
    },

    createOverflowMenu(menuEl, overflowItems) {
      const moreWrapper = document.createElement("div");
      moreWrapper.setAttribute("data-more-wrapper", "");
      moreWrapper.className =
        "flex flex-col items-center justify-center self-stretch rounded-md transition-all duration-200 ease-in-out";

      const moreBtn = document.createElement("a");
      moreBtn.setAttribute("data-menu-item", "");
      const moreText = this.$t ? this.$t('dashboard.more', 'More') : 'More';
      moreBtn.innerHTML = `
        <img
          src="${this.assets.more || ''}"
          alt="${moreText}"
          class="w-6 h-6 pointer-events-none transition-all duration-200 group-hover:[filter:brightness(0)_saturate(100%)_invert(29%)_sepia(98%)_saturate(5809%)_hue-rotate(325deg)_brightness(92%)_contrast(121%)]"
        />
        <span class="pointer-events-none text-sidebar-text text-[0.625rem] font-medium leading-[1.125rem] text-center transition-all duration-200 group-hover:text-sidebar-active-text">${moreText}</span>
      `;
      moreBtn.className =
        "main-menu-item group flex flex-col items-center justify-center self-stretch gap-0.5 p-2 rounded-md transition-all duration-200 ease-in-out hover:bg-sidebar-active";
      // moreBtn.setAttribute("href", "/");
      moreWrapper.appendChild(moreBtn);
      menuEl.appendChild(moreWrapper);

      const flyoutWrapper = document.createElement("div");
      flyoutWrapper.setAttribute("data-floating-panel-wrapper", "");
      flyoutWrapper.className =
        "fixed top-[-9999px] left-[-11000] pointer-events-none z-[9999]";

      const flyout = document.createElement("div");
      flyout.setAttribute("data-floating-panel", "");
      flyout.className = `
        fixed bg-white shadow-lg rounded-md p-3 min-w-[200px] grid grid-cols-2 gap-4 z-[9999] border border-gray-200 backdrop-blur-lg bg-[hsla(0,0%,100%,0.5)]
        opacity-0 invisible pointer-events-none
        scale-0 translate-y-16
        transition-all duration-150 ease-in-out
        origin-bottom-left
      `;

      overflowItems.forEach((item) => {
        const o = document.createElement("div");
        o.setAttribute("data-flyout-item", "");
        if (!item.enabled) o.setAttribute("data-disabled", "true");
        o.innerHTML = `
          <img
            src="${item.image}"
            alt="${item.title}"
            class="w-6 h-6 transition-all duration-200 group-hover:[filter:brightness(0)_saturate(100%)_invert(29%)_sepia(98%)_saturate(5809%)_hue-rotate(325deg)_brightness(92%)_contrast(121%)]"
          />
          <span class=" text-sidebar-text text-[0.625rem] font-medium leading-[1.125rem] text-center transition-all duration-200 group-hover:text-sidebar-active-text">${item.title}</span>
        `;
        o.className =
          "sidebar-menu-item block group transition-all duration-200 ease-in-out rounded-md flex-col items-center justify-center self-stretch w-[4.625rem] h-14 cursor-pointer p-2 whitespace-nowrap text-sm hover:bg-sidebar-active rounded transition-colors flex items-center";
        if (!item.enabled) {
          o.className += " opacity-50 grayscale";
        }
        o.addEventListener("click", () => this.handleMenuClick(item));
        flyout.appendChild(o);
      });

      flyoutWrapper.appendChild(flyout);
      document.body.appendChild(flyoutWrapper);

      const hoverBridge = document.createElement("div");
      hoverBridge.className =
        "fixed bg-transparent pointer-events-none top-[-9999px] left-[-9999px] h-0 w-0 z-[9998] transition-all duration-100 ease-in-out";
      document.body.appendChild(hoverBridge);

      const showFlyout = () => {
        this.flyoutHovered = true;
        if (this.hideTimeout) clearTimeout(this.hideTimeout);

        requestAnimationFrame(() => {
          const btnRect = moreBtn.getBoundingClientRect();
          const align = overflowItems.length <= 2 ? "center" : "bottom";

          let top = btnRect.top;
          if (align === "center") {
            top = btnRect.top + btnRect.height / 2 - flyout.offsetHeight / 2;
          } else if (align === "bottom") {
            top = btnRect.bottom - flyout.offsetHeight;
          }

          flyoutWrapper.style.top = `${Math.max(0, top)}px`;
          flyoutWrapper.style.left = `${btnRect.right + 10}px`;
          flyoutWrapper.style.pointerEvents = "auto";

          flyout.className = `
            fixed bg-white shadow-lg rounded-md p-3 ml-2 min-w-[200px] grid grid-cols-2 gap-4 z-[9999] border border-gray-200 backdrop-blur-lg bg-[hsla(0,0%,100%,0.5)]
            opacity-100 visible pointer-events-auto
            scale-100 translate-y-0
            transition-all duration-150 ease-in-out
            origin-bottom-left
          `;

          const newFlyoutRect = flyout.getBoundingClientRect();
          const buffer = 16;

          const bridgeTop =
            Math.min(btnRect.top, newFlyoutRect.top) - buffer / 2;
          const bridgeBottom =
            Math.max(btnRect.bottom, newFlyoutRect.bottom) + buffer / 2;
          const bridgeHeight = bridgeBottom - bridgeTop;

          const bridgeLeft = btnRect.right - buffer;
          const bridgeRight = newFlyoutRect.left + buffer;
          const bridgeWidth = bridgeRight - bridgeLeft;

          hoverBridge.style.top = `${bridgeTop}px`;
          hoverBridge.style.left = `${bridgeLeft}px`;
          hoverBridge.style.height = `${bridgeHeight}px`;
          hoverBridge.style.width = `${bridgeWidth}px`;
          hoverBridge.style.pointerEvents = "auto";
        });
      };

      const hideFlyout = () => {
        this.hideTimeout = setTimeout(() => {
          if (!this.flyoutHovered) {
            flyoutWrapper.style.top = "-9999px";
            flyoutWrapper.style.left = "-9999px";
            flyoutWrapper.style.pointerEvents = "none";

            flyout.className = `
              fixed bg-white shadow-lg rounded-md p-3 min-w-[200px] grid grid-cols-2 gap-4 z-[9999] border border-gray-200 backdrop-blur-lg bg-[hsla(0,0%,100%,0.5)]
              opacity-0 invisible pointer-events-none
              scale-0 translate-y-16
              transition-all duration-150 ease-in-out
              origin-bottom-left
            `;

            hoverBridge.style.top = "-9999px";
            hoverBridge.style.left = "-9999px";
            hoverBridge.style.height = "0";
            hoverBridge.style.width = "0";
            hoverBridge.style.pointerEvents = "none";
          }
        }, 150);
      };

      const onEnter = () => {
        this.flyoutHovered = true;
        showFlyout();
      };

      const onLeave = () => {
        this.flyoutHovered = false;
        hideFlyout();
      };

      moreBtn.addEventListener("mouseenter", onEnter);
      moreBtn.addEventListener("mouseleave", onLeave);
      flyout.addEventListener("mouseenter", onEnter);
      flyout.addEventListener("mouseleave", onLeave);
      hoverBridge.addEventListener("mouseenter", onEnter);
      hoverBridge.addEventListener("mouseleave", onLeave);
    },

    handleSidebarVisibility() {
      const shouldBeVisible = window.innerWidth > 768;

      if (shouldBeVisible && !this.isSidebarAttached) {
        document.body.insertBefore(this.$el, document.body.firstChild);
        this.renderSidebarMenu();
        this.isSidebarAttached = true;
      } else if (!shouldBeVisible && this.isSidebarAttached) {
        this.$el.remove();
        this.isSidebarAttached = false;

        document
          .querySelectorAll("[data-floating-panel-wrapper], .hover-bridge")
          .forEach((el) => el.remove());
      } else if (shouldBeVisible && this.isSidebarAttached) {
        this.renderSidebarMenu();
      }
    },
  },
};
</script>
