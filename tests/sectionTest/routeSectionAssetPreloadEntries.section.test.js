/**
 * routeSectionAssetPreloadEntries.js — section asset rollups (section test plan §45, §119).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const getRouteConfiguration = vi.fn();

vi.mock('../../src/systems/routing/routeConfigLoader.js', () => ({
  getRouteConfiguration,
}));

beforeEach(() => {
  vi.resetModules();
  setActivePinia(createPinia());
  getRouteConfiguration.mockReset();
});

describe('doesRouteBelongToSection (Phase F §45)', () => {
  async function loadModule() {
    return import('../../src/systems/assets/routeSectionAssetPreloadEntries.js');
  }

  it('matches string section routes exactly', async () => {
    const { doesRouteBelongToSection } = await loadModule();
    expect(doesRouteBelongToSection({ section: 'auth' }, 'auth')).toBe(true);
    expect(doesRouteBelongToSection({ section: 'shop' }, 'auth')).toBe(false);
  });

  it('matches role-based section objects by variant values', async () => {
    const { doesRouteBelongToSection } = await loadModule();
    const route = {
      section: { creator: 'dashboard-creator', fan: 'dashboard-fan' },
    };

    expect(doesRouteBelongToSection(route, 'dashboard-creator')).toBe(true);
    expect(doesRouteBelongToSection(route, 'dashboard-global')).toBe(false);
  });
});

describe('getAssetPreloadEntriesForSection (Phase F §45, §119)', () => {
  async function loadModule() {
    return import('../../src/systems/assets/routeSectionAssetPreloadEntries.js');
  }

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

    const { getAssetPreloadEntriesForSection } = await loadModule();
    const result = getAssetPreloadEntriesForSection('dashboard-global');

    expect(result.routeCount).toBe(2);
    expect(result.assets).toHaveLength(2);
  });

  it('deduplicates assetPreload entries by flag within a section', async () => {
    getRouteConfiguration.mockReturnValue([
      {
        slug: '/dashboard',
        section: 'dashboard-global',
        assetPreload: [{ flag: 'dashboard.logo', type: 'image', priority: 'high' }],
      },
      {
        slug: '/dashboard/overview',
        section: 'dashboard-global',
        assetPreload: [{ flag: 'dashboard.logo', type: 'image', priority: 'low' }],
      },
    ]);

    const { dedupeAssetPreloadEntries, getAssetPreloadEntriesForSection } = await loadModule();

    expect(dedupeAssetPreloadEntries([
      { flag: 'dashboard.logo', priority: 'high' },
      { flag: 'dashboard.logo', priority: 'low' },
    ])).toEqual([{ flag: 'dashboard.logo', priority: 'high' }]);

    const result = getAssetPreloadEntriesForSection('dashboard-global');
    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].priority).toBe('high');
  });

  it('inherits parent assetPreload for child routes with inheritConfigFromParent', async () => {
    getRouteConfiguration.mockReturnValue([
      {
        slug: '/dashboard',
        section: 'dashboard-global',
        enabled: true,
        assetPreload: [{ flag: 'dashboard.logo', type: 'image', priority: 'high' }],
      },
      {
        slug: '/dashboard/payout',
        section: { creator: 'dashboard-creator' },
        inheritConfigFromParent: true,
        enabled: true,
        supportedRoles: ['creator'],
      },
    ]);

    const { getAssetPreloadEntriesForSection } = await loadModule();
    const result = getAssetPreloadEntriesForSection('dashboard-creator');

    expect(result.routeCount).toBe(1);
    expect(result.assets.some((entry) => entry.flag === 'dashboard.logo')).toBe(true);
  });
});
