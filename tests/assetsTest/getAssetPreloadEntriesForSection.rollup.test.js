import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const getRouteConfiguration = vi.fn();

vi.mock('../../src/systems/routing/routeConfigLoader.js', () => ({
  getRouteConfiguration,
}));

vi.mock('../../src/infrastructure/logging/logHandler.js', () => ({
  log: vi.fn(),
}));

describe('getAssetPreloadEntriesForSection rollup (§37)', () => {
  async function loadModule() {
    return import('../../src/systems/assets/routeSectionAssetPreloadEntries.js');
  }

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    setActivePinia(createPinia());
    getRouteConfiguration.mockReset();
    getRouteConfiguration.mockReturnValue([]);

    const { clearAssetPreloadSectionCache } = await loadModule();
    clearAssetPreloadSectionCache();
  });

  it('returns an empty rollup when there are no routes', async () => {
    const { getAssetPreloadEntriesForSection } = await loadModule();

    expect(getAssetPreloadEntriesForSection('auth')).toEqual({
      assets: [],
      routeCount: 0,
      rawAssetCount: 0,
    });
  });

  it('collects inline assetPreload entries from a matching enabled route', async () => {
    getRouteConfiguration.mockReturnValue([
      {
        slug: '/auth',
        section: 'auth',
        enabled: true,
        assetPreload: [{ flag: 'auth.logo', type: 'image', priority: 'high' }],
      },
    ]);
    const { getAssetPreloadEntriesForSection } = await loadModule();

    expect(getAssetPreloadEntriesForSection('auth')).toEqual({
      assets: [{ flag: 'auth.logo', type: 'image', priority: 'high' }],
      routeCount: 1,
      rawAssetCount: 1,
    });
  });

  it('treats null assetPreload as empty input', async () => {
    getRouteConfiguration.mockReturnValue([
      {
        slug: '/auth',
        section: 'auth',
        enabled: true,
        assetPreload: null,
      },
    ]);
    const { getAssetPreloadEntriesForSection } = await loadModule();

    expect(getAssetPreloadEntriesForSection('auth')).toEqual({
      assets: [],
      routeCount: 1,
      rawAssetCount: 0,
    });
  });

  it('excludes disabled routes from the section rollup', async () => {
    getRouteConfiguration.mockReturnValue([
      {
        slug: '/auth',
        section: 'auth',
        enabled: true,
        assetPreload: [{ flag: 'auth.logo', type: 'image', priority: 'high' }],
      },
      {
        slug: '/auth/disabled',
        section: 'auth',
        enabled: false,
        assetPreload: [{ flag: 'auth.disabled', type: 'image', priority: 'critical' }],
      },
    ]);
    const { getAssetPreloadEntriesForSection } = await loadModule();

    expect(getAssetPreloadEntriesForSection('auth')).toEqual({
      assets: [{ flag: 'auth.logo', type: 'image', priority: 'high' }],
      routeCount: 1,
      rawAssetCount: 1,
    });
  });

  it('excludes routes that belong to a different section', async () => {
    getRouteConfiguration.mockReturnValue([
      {
        slug: '/auth',
        section: 'auth',
        enabled: true,
        assetPreload: [{ flag: 'auth.logo', type: 'image', priority: 'high' }],
      },
      {
        slug: '/shop',
        section: 'shop',
        enabled: true,
        assetPreload: [{ flag: 'shop.cart', type: 'image', priority: 'critical' }],
      },
    ]);
    const { getAssetPreloadEntriesForSection } = await loadModule();

    expect(getAssetPreloadEntriesForSection('auth')).toEqual({
      assets: [{ flag: 'auth.logo', type: 'image', priority: 'high' }],
      routeCount: 1,
      rawAssetCount: 1,
    });
  });

  it('includes inherited parent assets for a child route', async () => {
    getRouteConfiguration.mockReturnValue([
      {
        slug: '/dashboard',
        section: 'dashboard-global',
        enabled: true,
        assetPreload: [{ flag: 'dashboard.logo', type: 'image', priority: 'high' }],
      },
      {
        slug: '/dashboard/overview',
        section: { creator: 'dashboard-creator' },
        enabled: true,
        inheritConfigFromParent: true,
      },
    ]);
    const { getAssetPreloadEntriesForSection } = await loadModule();

    expect(getAssetPreloadEntriesForSection('dashboard-creator')).toEqual({
      assets: [{ flag: 'dashboard.logo', type: 'image', priority: 'high' }],
      routeCount: 1,
      rawAssetCount: 1,
    });
  });

  it('accumulates nested parent assets through the inheritance chain', async () => {
    getRouteConfiguration.mockReturnValue([
      {
        slug: '/dashboard',
        section: 'dashboard-global',
        enabled: true,
        assetPreload: [{ flag: 'dashboard.logo', type: 'image', priority: 'high' }],
      },
      {
        slug: '/dashboard/settings',
        section: { creator: 'dashboard-settings' },
        enabled: true,
        inheritConfigFromParent: true,
        assetPreload: [{ flag: 'dashboard.settings', type: 'image', priority: 'normal' }],
      },
      {
        slug: '/dashboard/settings/privacy',
        section: { privacy: 'dashboard-privacy' },
        enabled: true,
        inheritConfigFromParent: true,
        assetPreload: [{ flag: 'dashboard.privacy', type: 'image', priority: 'critical' }],
      },
    ]);
    const { getAssetPreloadEntriesForSection } = await loadModule();

    expect(getAssetPreloadEntriesForSection('dashboard-privacy')).toEqual({
      assets: [
        { flag: 'dashboard.logo', type: 'image', priority: 'high' },
        { flag: 'dashboard.settings', type: 'image', priority: 'normal' },
        { flag: 'dashboard.privacy', type: 'image', priority: 'critical' },
      ],
      routeCount: 1,
      rawAssetCount: 3,
    });
  });

  it('keeps the highest-priority duplicate entry across routes', async () => {
    getRouteConfiguration.mockReturnValue([
      {
        slug: '/auth',
        section: 'auth',
        enabled: true,
        assetPreload: [{ flag: 'auth.logo', type: 'image', priority: 'normal' }],
      },
      {
        slug: '/auth/overview',
        section: 'auth',
        enabled: true,
        assetPreload: [{ flag: 'auth.logo', type: 'image', priority: 'critical' }],
      },
    ]);
    const { getAssetPreloadEntriesForSection } = await loadModule();

    expect(getAssetPreloadEntriesForSection('auth')).toEqual({
      assets: [{ flag: 'auth.logo', type: 'image', priority: 'critical' }],
      routeCount: 2,
      rawAssetCount: 2,
    });
  });

  it('returns the cached rollup on a second call for the same section', async () => {
    getRouteConfiguration.mockReturnValue([
      {
        slug: '/auth',
        section: 'auth',
        enabled: true,
        assetPreload: [{ flag: 'auth.logo', type: 'image', priority: 'high' }],
      },
    ]);
    const { getAssetPreloadEntriesForSection } = await loadModule();

    const first = getAssetPreloadEntriesForSection('auth');
    const second = getAssetPreloadEntriesForSection('auth');

    expect(second).toBe(first);
    expect(getRouteConfiguration).toHaveBeenCalledTimes(1);
  });

  it('clearAssetPreloadSectionCache forces a fresh recompute', async () => {
    getRouteConfiguration.mockReturnValueOnce([
      {
        slug: '/auth',
        section: 'auth',
        enabled: true,
        assetPreload: [{ flag: 'auth.logo', type: 'image', priority: 'high' }],
      },
    ]);
    const { clearAssetPreloadSectionCache, getAssetPreloadEntriesForSection } = await loadModule();

    const first = getAssetPreloadEntriesForSection('auth');

    clearAssetPreloadSectionCache();
    getRouteConfiguration.mockReturnValueOnce([
      {
        slug: '/auth',
        section: 'auth',
        enabled: true,
        assetPreload: [{ flag: 'auth.banner', type: 'image', priority: 'critical' }],
      },
    ]);

    const second = getAssetPreloadEntriesForSection('auth');

    expect(first.assets[0].flag).toBe('auth.logo');
    expect(second.assets[0].flag).toBe('auth.banner');
    expect(getRouteConfiguration).toHaveBeenCalledTimes(2);
  });

  it('handles 100 routes in under 500ms', async () => {
    getRouteConfiguration.mockReturnValue(
      Array.from({ length: 100 }, (_, index) => ({
        slug: `/bulk-${index}`,
        section: 'bulk',
        enabled: true,
        assetPreload: [
          {
            flag: `bulk.${index}`,
            type: 'image',
            priority: index % 2 === 0 ? 'high' : 'normal',
          },
        ],
      })),
    );
    const { getAssetPreloadEntriesForSection } = await loadModule();

    const startedAt = Date.now();
    const result = getAssetPreloadEntriesForSection('bulk');
    const elapsedMs = Date.now() - startedAt;

    expect(result.assets).toHaveLength(100);
    expect(elapsedMs).toBeLessThan(500);
  });
});
