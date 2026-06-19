import { ref } from 'vue';

export function useDashboardSidebarAssets() {
  const sidebarChromeAssetUrls = ref({
    logo: null,
    avatar: null,
    logout: null,
    notification: null,
    language: null,
    help: null,
    closeDesktop: null,
    closeMobile: null,
    more: null,
  });

  const loadSidebarChromeAssets = async () => {
    try {
      const { resolveSharedComponentAssets } = await import('@/systems/assets/resolveSharedComponentAssets.js');
      sidebarChromeAssetUrls.value = {
        ...sidebarChromeAssetUrls.value,
        ...(await resolveSharedComponentAssets('dashboardSidebarChrome'))
      };
    } catch (error) {
      console.error('[DashboardSharedSidebar] Asset load failed', error);
    }
  };

  return {
    sidebarChromeAssetUrls,
    loadSidebarChromeAssets,
  };
}
