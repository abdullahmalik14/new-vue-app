import { beforeEach, describe, expect, it } from 'vitest';

describe('C-04 — /shop does not duplicate dashboard icons in shop section bucket', () => {
  beforeEach(() => {
    delete window.performanceTracker;
  });

  it('shop route has no assetPreloadRef; dashboard-global owns dashboardMenuIcons', async () => {
    const { getRouteConfiguration } = await import('../../src/systems/routing/routeConfigLoader.js');
    const {
      getAssetPreloadEntriesForSection,
      clearAssetPreloadSectionCache,
    } = await import('../../src/utils/assets/getAssetPreloadEntriesForSection.js');

    const routes = getRouteConfiguration();
    const shopRoute = routes.find((route) => route.slug === '/shop');
    const dashboardRoute = routes.find((route) => route.slug === '/dashboard');

    expect(shopRoute?.assetPreloadRef).toBeUndefined();
    expect(shopRoute?.assetPreload).toBeUndefined();
    expect(shopRoute?.preLoadSections).toContain('dashboard');
    expect(dashboardRoute?.assetPreload?.some((entry) => entry.flag === 'dashboard.logo')).toBe(true);

    clearAssetPreloadSectionCache();
    const shopRollup = getAssetPreloadEntriesForSection('shop');
    const dashboardRollup = getAssetPreloadEntriesForSection('dashboard-global');

    expect(shopRollup.assets.some((entry) => entry.flag?.startsWith('dashboard.'))).toBe(false);
    expect(dashboardRollup.assets.some((entry) => entry.flag === 'dashboard.logo')).toBe(true);
  });
});
