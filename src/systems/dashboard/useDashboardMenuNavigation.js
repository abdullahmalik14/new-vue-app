import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter, useRoute } from 'vue-router';
import { dashboardSidebarMenuItems } from "@/config/dashboard-sidebar-menu-items.js";
import { resolveDashboardSidebarMenuItems } from "@/systems/dashboard/resolve-dashboard-sidebar-menu-items.js";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDashboardNavStore } from "@/stores/useDashboardNavStore";
import { isDashboardMenuItemActive } from "@/systems/routing/isDashboardMenuItemActive.js";
import { createRoutePrefetchIntentHandler } from "@/systems/routing/useRoutePrefetch.js";
export function useDashboardMenuNavigation(closeAllSidebarPanels) {
  const router = useRouter();
  const route = useRoute();
  
  const dashboardMenuItems = ref([]);
  const dashboardNavStore = useDashboardNavStore();
  const { isSubmenuOpen, activeSubmenuTitle: currentSubmenuTitle } = storeToRefs(dashboardNavStore);
  const currentSubmenuItems = ref([]);
  const currentSubmenuTranslationKey = ref("");
  const currentSubmenuIconAssetFlag = ref("");
  const submenuHistory = ref([]);

  watch(isSubmenuOpen, (isOpen) => {
    if (!isOpen) {
      submenuHistory.value = [];
    }
  });

  const authStore = useAuthStore();

  const loadDashboardMenuItems = async () => {
    try {
      const userRole = authStore.userRole;
      dashboardMenuItems.value = await resolveDashboardSidebarMenuItems(dashboardSidebarMenuItems, userRole);
    } catch (error) {
      dashboardMenuItems.value = dashboardSidebarMenuItems;
    }
  };

  // Re-resolve role-aware menu whenever the authenticated role changes
  // (e.g. role becomes known after auth bootstrap).
  watch(() => authStore.userRole, () => {
    loadDashboardMenuItems();
  });

  const isMenuItemRouteActive = (item) => {
    return isDashboardMenuItemActive(item, route);
  };

  const handleMenuClick = (item) => {
    closeAllSidebarPanels();
    if (item.submenuItems && item.submenuItems.length > 0) {
      submenuHistory.value = [];
      currentSubmenuItems.value = item.submenuItems;
      currentSubmenuTitle.value = item.fallbackLabel;
      currentSubmenuTranslationKey.value = item.translationKey;
      currentSubmenuIconAssetFlag.value = item.iconAssetFlag;
      isSubmenuOpen.value = true;
    } else if (item.isEnabled && item.route) {
      router.push(item.route);
    }
  };

  const handleSubmenuItemClick = (submenuItem) => {
    if (submenuItem.submenuItems && submenuItem.submenuItems.length > 0) {
      submenuHistory.value.push({
        submenuItems: currentSubmenuItems.value,
        submenuTitle: currentSubmenuTitle.value,
        submenuTranslationKey: currentSubmenuTranslationKey.value,
        submenuIconAssetFlag: currentSubmenuIconAssetFlag.value
      });
      currentSubmenuItems.value = submenuItem.submenuItems;
      currentSubmenuTitle.value = submenuItem.fallbackLabel;
      currentSubmenuTranslationKey.value = submenuItem.translationKey;
      currentSubmenuIconAssetFlag.value = submenuItem.iconAssetFlag || currentSubmenuIconAssetFlag.value;
    } else if (submenuItem.isEnabled && submenuItem.route) {
      isSubmenuOpen.value = false;
      router.push(submenuItem.route);
    }
  };

  const navigateBackInSubmenu = () => {
    if (submenuHistory.value.length > 0) {
      const previousSubmenuState = submenuHistory.value.pop();
      currentSubmenuItems.value = previousSubmenuState.submenuItems;
      currentSubmenuTitle.value = previousSubmenuState.submenuTitle;
      currentSubmenuTranslationKey.value = previousSubmenuState.submenuTranslationKey;
      currentSubmenuIconAssetFlag.value = previousSubmenuState.submenuIconAssetFlag;
    } else {
      isSubmenuOpen.value = false;
    }
  };

  
  const prefetchMenuItemRoute = (item) => {
    if (item?.isEnabled && item?.route) {
      createRoutePrefetchIntentHandler(item.route)();
    }
  };

  return {
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
  };
}
