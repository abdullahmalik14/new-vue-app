import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { dashboardSidebarMenuItems } from "@/config/dashboardSidebarMenuItems.js";
import { resolveDashboardSidebarMenuItems } from "@/systems/dashboard/resolveDashboardSidebarMenuItems.js";
import { useAuthStore } from "@/stores/useAuthStore";

export function useDashboardMenuNavigation(closeAllSidebarPanels) {
  const router = useRouter();
  const route = useRoute();
  
  const dashboardMenuItems = ref([]);
  const isSubmenuOpen = ref(false);
  const currentSubmenuItems = ref([]);
  const currentSubmenuTitle = ref("");
  const currentSubmenuTranslationKey = ref("");
  const currentSubmenuIconUrl = ref("");
  const submenuHistory = ref([]);

  const loadDashboardMenuItems = async () => {
    try {
      const authStore = useAuthStore();
      const userRole = authStore.userRole;
      dashboardMenuItems.value = await resolveDashboardSidebarMenuItems(dashboardSidebarMenuItems, userRole);
    } catch (error) {
      dashboardMenuItems.value = dashboardSidebarMenuItems;
    }
  };

  const isMenuItemRouteActive = (item) => {
    if (!item.route || !route) return false;
    if (item.route === '/dashboard' || item.route === '/dashboard/') {
      return route.path === '/dashboard' || route.path === '/dashboard/';
    }
    return route.path.startsWith(item.route);
  };

  const handleMenuClick = (item) => {
    closeAllSidebarPanels();
    if (item.submenuItems && item.submenuItems.length > 0) {
      submenuHistory.value = [];
      currentSubmenuItems.value = item.submenuItems;
      currentSubmenuTitle.value = item.fallbackLabel;
      currentSubmenuTranslationKey.value = item.translationKey;
      currentSubmenuIconUrl.value = item.iconUrl;
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
        submenuIconUrl: currentSubmenuIconUrl.value
      });
      currentSubmenuItems.value = submenuItem.submenuItems;
      currentSubmenuTitle.value = submenuItem.fallbackLabel;
      currentSubmenuTranslationKey.value = submenuItem.translationKey;
      currentSubmenuIconUrl.value = submenuItem.iconUrl || currentSubmenuIconUrl.value;
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
      currentSubmenuIconUrl.value = previousSubmenuState.submenuIconUrl;
    } else {
      isSubmenuOpen.value = false;
    }
  };

  return {
    dashboardMenuItems,
    isSubmenuOpen,
    currentSubmenuItems,
    currentSubmenuTitle,
    currentSubmenuTranslationKey,
    currentSubmenuIconUrl,
    submenuHistory,
    loadDashboardMenuItems,
    isMenuItemRouteActive,
    handleMenuClick,
    handleSubmenuItemClick,
    navigateBackInSubmenu
  };
}
