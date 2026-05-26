import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const getRouteConfiguration = vi.fn();

vi.mock('../../src/utils/route/routeConfigLoader.js', () => ({
  getRouteConfiguration,
}));

describe('getAssetPreloadEntriesForSection (P-06)', () => {
  beforeEach(() => {
    vi.resetModules();
    setActivePinia(createPinia());
    getRouteConfiguration.mockReset();
  });

  it('merges assetPreload from routes in the same section', async () => {
    getRouteConfiguration.mockReturnValue([
      {
        slug: '/dashboard',
        section: 'dashboard-global',
        assetPreload: [{ flag: 'dashboard.logo', type: 'image' }],
      },
      {
        slug: '/shop',
        section: 'shop',
        assetPreload: [{ flag: 'shop.cart', type: 'image' }],
      },
      {
        slug: '/dashboard/overview',
        section: 'dashboard-global',
        assetPreload: [{ flag: 'dashboard.hamburger', type: 'image' }],
      },
    ]);

    const { getAssetPreloadEntriesForSection } = await import(
      '../../src/utils/assets/getAssetPreloadEntriesForSection.js'
    );

    const result = getAssetPreloadEntriesForSection('dashboard-global');

    expect(result.routeCount).toBe(2);
    expect(result.assets).toHaveLength(2);
    expect(getRouteConfiguration).toHaveBeenCalledTimes(1);
  });

  it('returns memoized rollup without re-scanning routes', async () => {
    getRouteConfiguration.mockReturnValue([
      {
        slug: '/log-in',
        section: 'auth',
        assetPreload: [{ flag: 'auth.background', type: 'image' }],
      },
    ]);

    const mod = await import('../../src/utils/assets/getAssetPreloadEntriesForSection.js');

    mod.getAssetPreloadEntriesForSection('auth');
    mod.getAssetPreloadEntriesForSection('auth');

    expect(getRouteConfiguration).toHaveBeenCalledTimes(1);
  });

  it('clearAssetPreloadSectionCache forces a rebuild on next call', async () => {
    getRouteConfiguration.mockReturnValue([
      {
        slug: '/log-in',
        section: 'auth',
        assetPreload: [{ flag: 'auth.background', type: 'image' }],
      },
    ]);

    const mod = await import('../../src/utils/assets/getAssetPreloadEntriesForSection.js');

    mod.getAssetPreloadEntriesForSection('auth');
    mod.clearAssetPreloadSectionCache();
    mod.getAssetPreloadEntriesForSection('auth');

    expect(getRouteConfiguration).toHaveBeenCalledTimes(2);
  });
});
