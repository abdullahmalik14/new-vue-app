/**
 * routeSectionAssetPreloadEntries.js — Phase F (route test plan §34, §70).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const getRouteConfiguration = vi.fn();

vi.mock('../../src/systems/routing/routeConfigLoader.js', () => ({
  getRouteConfiguration,
}));

describe('getAssetPreloadEntriesForSection.route (Phase F §34)', () => {
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
      '../../src/systems/assets/routeSectionAssetPreloadEntries.js'
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

    const mod = await import('../../src/systems/assets/routeSectionAssetPreloadEntries.js');

    mod.getAssetPreloadEntriesForSection('auth');
    mod.getAssetPreloadEntriesForSection('auth');

    expect(getRouteConfiguration).toHaveBeenCalledTimes(1);
  });

  it('deduplicates assetPreload entries by flag within a section', async () => {
    getRouteConfiguration.mockReturnValue([
      {
        slug: '/dashboard',
        section: 'dashboard-global',
        assetPreload: [
          { flag: 'dashboard.logo', type: 'image', priority: 'high' },
          { flag: 'dashboard.avatar', type: 'image' },
        ],
      },
      {
        slug: '/dashboard/overview',
        section: 'dashboard-global',
        assetPreload: [
          { flag: 'dashboard.logo', type: 'image', priority: 'low' },
          { flag: 'dashboard.hamburger', type: 'image' },
        ],
      },
    ]);

    const { getAssetPreloadEntriesForSection } = await import(
      '../../src/systems/assets/routeSectionAssetPreloadEntries.js'
    );

    const result = getAssetPreloadEntriesForSection('dashboard-global');

    expect(result.routeCount).toBe(2);
    expect(result.rawAssetCount).toBe(4);
    expect(result.assets).toHaveLength(3);
    expect(result.assets.find((entry) => entry.flag === 'dashboard.logo')?.priority).toBe('high');
  });

  it('excludes enabled: false routes from section assetPreload rollups', async () => {
    getRouteConfiguration.mockReturnValue([
      {
        slug: '/dashboard',
        section: 'dashboard-global',
        enabled: true,
        assetPreload: [{ flag: 'dashboard.logo', type: 'image' }],
      },
      {
        slug: '/dashboard/social-linking',
        section: 'dashboard-global',
        enabled: false,
        assetPreload: [{ flag: 'dashboard.disabled-only', type: 'image' }],
      },
      {
        slug: '/dashboard/overview',
        section: 'dashboard-global',
        enabled: true,
        assetPreload: [{ flag: 'dashboard.hamburger', type: 'image' }],
      },
    ]);

    const { getAssetPreloadEntriesForSection } = await import(
      '../../src/systems/assets/routeSectionAssetPreloadEntries.js'
    );

    const result = getAssetPreloadEntriesForSection('dashboard-global');

    expect(result.routeCount).toBe(2);
    expect(result.assets).toHaveLength(2);
    expect(result.assets.some((entry) => entry.flag === 'dashboard.disabled-only')).toBe(false);
  });

  it('doesRouteBelongToSection matches role-variant section names', async () => {
    const { doesRouteBelongToSection } = await import(
      '../../src/systems/assets/routeSectionAssetPreloadEntries.js'
    );

    expect(
      doesRouteBelongToSection(
        { section: { creator: 'dashboard-creator', fan: 'dashboard-fan' } },
        'dashboard-creator',
      ),
    ).toBe(true);
    expect(
      doesRouteBelongToSection(
        { section: { creator: 'dashboard-creator', fan: 'dashboard-fan' } },
        'shop',
      ),
    ).toBe(false);
  });

  it('clearAssetPreloadSectionCache forces a rebuild on next call', async () => {
    getRouteConfiguration.mockReturnValue([
      {
        slug: '/log-in',
        section: 'auth',
        assetPreload: [{ flag: 'auth.background', type: 'image' }],
      },
    ]);

    const mod = await import('../../src/systems/assets/routeSectionAssetPreloadEntries.js');

    mod.getAssetPreloadEntriesForSection('auth');
    mod.clearAssetPreloadSectionCache();
    mod.getAssetPreloadEntriesForSection('auth');

    expect(getRouteConfiguration).toHaveBeenCalledTimes(2);
  });
});
