import { ref } from 'vue';
import { getAssetUrl, getAssetUrlSync } from '@/systems/assets/assetLibrary.js';
import {
  getSharedComponentAssetMapping,
  groupComponentSlotsByPreloadTier,
} from '@/systems/assets/resolveSharedComponentAssets.js';

import { usePreloadStore } from '@/stores/usePreloadStore.js';

export function useDashboardSidebarAssets() {
  const preloadStore = usePreloadStore();
  const sidebarAssetSlots = getSharedComponentAssetMapping('dashboardSidebarChrome');
  const sidebarAssetSlotNames = Object.keys(sidebarAssetSlots);

  const sidebarChromeAssetUrls = ref(
    Object.fromEntries(sidebarAssetSlotNames.map((slot) => [slot, null]))
  );

  async function loadAssetWithRetry(flag, maxRetries = 2) {
    const cachedUrl = getAssetUrlSync(flag, { section: 'dashboard-global' });
    if (cachedUrl) return cachedUrl;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const url = await getAssetUrl(flag, 'dashboard-global');
        if (url) return url;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        }
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }
    return null;
  }

  const loadSidebarChromeAssets = async () => {
    if (preloadStore.hasSection('dashboard-global')) {
       // Fast path if section is already preloaded
       const slots = getSharedComponentAssetMapping('dashboardSidebarChrome');
       for (const [slot, flag] of Object.entries(slots)) {
          sidebarChromeAssetUrls.value[slot] = getAssetUrlSync(flag, { section: 'dashboard-global' }) || await loadAssetWithRetry(flag, 2);
       }
       return;
    }

    try {
      const tierGroups = groupComponentSlotsByPreloadTier(
        'dashboardSidebarChrome',
        'dashboardMenuIcons'
      );

      const criticalResults = await Promise.all(
        tierGroups.critical.map(({ slot, flag }) =>
          loadAssetWithRetry(flag, 2)
            .then((url) => [slot, url])
            .catch(() => [slot, null])
        )
      );
      criticalResults.forEach(([slot, url]) => {
        sidebarChromeAssetUrls.value[slot] = url;
      });

      const highResults = await Promise.all(
        tierGroups.high.map(({ slot, flag }) =>
          loadAssetWithRetry(flag, 2)
            .then((url) => [slot, url])
            .catch(() => [slot, null])
        )
      );
      highResults.forEach(([slot, url]) => {
        sidebarChromeAssetUrls.value[slot] = url;
      });

      const normalResults = await Promise.all(
        tierGroups.normal.map(({ slot, flag }) =>
          loadAssetWithRetry(flag, 1)
            .then((url) => [slot, url])
            .catch(() => [slot, null])
        )
      );
      normalResults.forEach(([slot, url]) => {
        sidebarChromeAssetUrls.value[slot] = url;
      });

    } catch (error) {
      console.error('[DashboardSharedSidebar] Asset load failed', error);
    }
  };

  return {
    sidebarChromeAssetUrls,
    loadSidebarChromeAssets,
  };
}
