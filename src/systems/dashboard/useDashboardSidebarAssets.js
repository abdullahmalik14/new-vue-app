import { ref, computed } from 'vue';
import { getAssetUrl, getAssetUrlSync } from '@/systems/assets/assetLibrary.js';
import {
  getSharedComponentAssetMapping,
  groupComponentSlotsByPreloadTier,
} from '@/systems/assets/resolveSharedComponentAssets.js';

import { usePreloadStore } from '@/stores/usePreloadStore.js';

const DASHBOARD_SECTION = 'dashboard-global';

export function useDashboardSidebarAssets() {
  const preloadStore = usePreloadStore();
  const sidebarAssetSlots = getSharedComponentAssetMapping('dashboardSidebarChrome');

  // Reactive tick bumped after each warm pass so the cache-backed computed re-resolves.
  // (The asset cache itself is not a Vue reactive source.)
  const chromeAssetsVersion = ref(0);

  // Reactive, cache-backed slot -> URL map. URLs are NEVER copied into component
  // state imperatively; they are read from the canonical asset cache (single source
  // of truth) on each render, keyed on the slot's flag.
  const sidebarChromeAssetUrls = computed(() => {
    // Establish a reactive dependency so re-warming triggers re-resolution.
    void chromeAssetsVersion.value;
    const resolvedUrls = {};
    for (const [slot, flag] of Object.entries(sidebarAssetSlots)) {
      resolvedUrls[slot] = getAssetUrlSync(flag, { section: DASHBOARD_SECTION });
    }
    return resolvedUrls;
  });

  // Warm a single flag into the asset cache (with bounded retry/backoff).
  async function warmChromeAssetFlag(flag, maxRetries = 2) {
    if (getAssetUrlSync(flag, { section: DASHBOARD_SECTION })) {
      return;
    }

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const url = await getAssetUrl(flag, { section: DASHBOARD_SECTION });
        if (url) {
          return;
        }
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 100));
        }
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }
  }

  const warmTier = async (tierSlots, maxRetries) => {
    await Promise.all(
      tierSlots.map(({ flag }) => warmChromeAssetFlag(flag, maxRetries).catch(() => {}))
    );
    // Notify the computed that more URLs may now be resolvable from cache.
    chromeAssetsVersion.value += 1;
  };

  const loadSidebarChromeAssets = async () => {
    try {
      // Fast path: the section preloader already warmed these URLs; only fill misses.
      if (preloadStore.hasSection(DASHBOARD_SECTION)) {
        await warmTier(
          Object.entries(sidebarAssetSlots).map(([slot, flag]) => ({ slot, flag })),
          2
        );
        return;
      }

      // Otherwise warm in preload-tier order (critical -> high -> normal) to mirror
      // the header pattern and avoid blocking on low-priority chrome.
      const tierGroups = groupComponentSlotsByPreloadTier(
        'dashboardSidebarChrome',
        'dashboardMenuIcons'
      );

      await warmTier(tierGroups.critical, 2);
      await warmTier(tierGroups.high, 2);
      await warmTier(tierGroups.normal, 1);
    } catch (error) {
      console.error('[DashboardSharedSidebar] Asset load failed', error);
    }
  };

  return {
    sidebarChromeAssetUrls,
    loadSidebarChromeAssets,
  };
}
