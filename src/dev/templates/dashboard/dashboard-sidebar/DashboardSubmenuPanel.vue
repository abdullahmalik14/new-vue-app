<template>
  <BasePopup :modelValue="isSubmenuOpen" @update:modelValue="$emit('update:isSubmenuOpen', $event)" :popup-config="submenuPopupConfig" :is-loading="false">
    <div v-if="isSubmenuOpen" class="w-full h-[100vh] flex flex-col items-start gap-4 overflow-hidden bg-submenu-bg px-4 py-2 shadow-md backdrop-blur-lg">
      <!-- submenu-header -->
      <div class="flex justify-between gap-4 w-full mt-8">
        <!-- title -->
        <div class="flex items-center gap-2 w-full">
          <img :src="getAssetUrlSync(currentSubmenuIconAssetFlag, { section: 'dashboard-global' })" :alt="$t(currentSubmenuTranslationKey, currentSubmenuTitle)" class="w-5 h-5" />
          <span class="text-sm font-semibold text-submenu-title-text">{{ $t(currentSubmenuTranslationKey, currentSubmenuTitle) }}</span>
        </div>

        <!-- back-button -->
        <div class="flex w-full justify-end">
          <button type="button" @click="$emit('navigate-back')"
            class="flex items-center justify-center w-6 h-6 md:w-auto md:h-auto p-0 md:p-2 rounded-md transition-all duration-200 ease-in-out hover:bg-panel-light-buttonHover cursor-pointer">
            <img v-if="sidebarChromeAssetUrls.closeDesktop"
              class="w-6 h-6 pointer-events-none hidden md:block [filter:brightness(0)_saturate(100%)_invert(45%)_sepia(13%)_saturate(594%)_hue-rotate(183deg)_brightness(92%)_contrast(92%)]"
              :src="sidebarChromeAssetUrls.closeDesktop" alt="close" />
            <img v-if="sidebarChromeAssetUrls.closeMobile"
              class="block w-6 h-6 pointer-events-none md:hidden [filter:brightness(0)_saturate(100%)_invert(45%)_sepia(13%)_saturate(594%)_hue-rotate(183deg)_brightness(92%)_contrast(92%)]"
              :src="sidebarChromeAssetUrls.closeMobile" alt="close" />
          </button>
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
            @click="child.isEnabled && $emit('item-click', child)"
            @mouseenter="child.isEnabled && $emit('prefetch-item', child)"
            @focus="child.isEnabled && $emit('prefetch-item', child)" :class="[
              'relative flex w-full gap-3 rounded-md px-4 py-2 group transition-all duration-200 outline-none',
              child.isEnabled
                ? 'hover:bg-transparent cursor-pointer'
                : 'cursor-not-allowed opacity-50',
            ]">
            <span :class="[
              'relative z-10 text-sm font-medium transition flex items-center justify-between w-full gap-2',
              child.isEnabled
                ? isItemActive(child) ? 'text-submenu-item-hover-shadow font-semibold' : 'text-submenu-item-text group-hover:text-submenu-item-hover-shadow'
                : 'text-gray-400',
            ]">
              <span class="truncate">{{ $t(child.translationKey, child.fallbackLabel) }}</span>
              <!-- DS-01: Global Counter Badge -->
              <DashboardMenuCounter v-if="child.badgeId" :badgeId="child.badgeId"  />
            </span>

            <!-- Left hover effect -->
            <div v-if="child.isEnabled"
              class="absolute top-0 left-0 z-0 h-full w-[calc(100%-1.25rem)] opacity-0 group-hover:opacity-100 group-hover:visible invisible bg-black shadow-green transition">
            </div>

            <!-- Skewed side -->
            <div v-if="child.isEnabled"
              class="absolute top-0 left-[calc(100%-1.25rem)] z-0 h-full w-4 -translate-x-[0.438rem] -skew-x-[20deg] bg-black shadow-green opacity-0 group-hover:opacity-100 group-hover:visible invisible transition">
            </div>
          </button>
        </template>
      </div>
    </div>
  </BasePopup>
</template>

<script>
import BasePopup from "@/components/ui/popups/BasePopup.vue";
import DashboardMenuCounter from "@/components/ui/nav/dashboard/DashboardMenuCounter.vue";
import { createRoutePrefetchIntentHandler } from "@/systems/routing/useRoutePrefetch.js";
import { isDashboardMenuItemActive } from "@/systems/routing/isDashboardMenuItemActive.js";
import { useRoute } from "vue-router";
import { getAssetUrlSync } from "@/systems/assets/assetLibrary.js";

export default {
  name: "DashboardSubmenuPanel",
  components: {
    BasePopup,
    DashboardMenuCounter
  },
  props: {
    isSubmenuOpen: { type: Boolean, required: true },
    submenuPopupConfig: { type: Object, required: true },
    currentSubmenuIconAssetFlag: { type: String, default: "" },
    currentSubmenuTitle: { type: String, default: "" },
    currentSubmenuTranslationKey: { type: String, default: "" },
    sidebarChromeAssetUrls: { type: Object, required: true },
    currentSubmenuItems: { type: Array, required: true }
  },
  emits: ["update:isSubmenuOpen", "navigate-back", "item-click"],
  setup() {
    const route = useRoute();
    return { route, getAssetUrlSync };
  },
  methods: {
    prefetchMenuItemRoute(item) {
      if (item?.isEnabled && item?.route) {
        createRoutePrefetchIntentHandler(item.route)();
      }
    },
    isItemActive(item) {
      return isDashboardMenuItemActive(item, this.route);
    }
  }
};
</script>
