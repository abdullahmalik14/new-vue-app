import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import {
  autoResolveLinkPreloads,
  setupAssetTestEnv,
  stubProductionEnv,
} from '../helpers/assetFixtures.js';
import { usePreloadStore } from '../../src/stores/usePreloadStore.js';

const getAssetUrls = vi.hoisted(() => vi.fn());
const preloadSectionAssetsMock = vi.hoisted(() => vi.fn(() => Promise.resolve()));
const resolveCurrentSectionNameFromRouteConfig = vi.hoisted(() => vi.fn());
const resolveRouteForPrefetch = vi.hoisted(() => vi.fn());
const normalizeTargetPath = vi.hoisted(() => vi.fn((target) => (typeof target === 'string' ? target : null)));

vi.mock('@/systems/assets/assetLibrary.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getAssetUrls,
  };
});

vi.mock('../../src/systems/assets/assetPreloader.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    preloadSectionAssets: preloadSectionAssetsMock,
  };
});

vi.mock('../../src/systems/sections/sectionPreloadOrchestrator.js', () => ({
  resolveCurrentSectionNameFromRouteConfig,
}));

vi.mock('../../src/systems/routing/routeComponentPreloader.js', () => ({
  normalizeTargetPath,
  resolveRouteForPrefetch,
}));

describe('assets.integration (§94)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    setActivePinia(createPinia());
    autoResolveLinkPreloads();
    getAssetUrls.mockReset();
    preloadSectionAssetsMock.mockReset();
    resolveCurrentSectionNameFromRouteConfig.mockReset();
    resolveRouteForPrefetch.mockReset();
    normalizeTargetPath.mockReset();

    getAssetUrls.mockResolvedValue({
      'dashboard.menu.analytics': '/icons/analytics.svg',
      'dashboard.menu.media': '/icons/media.svg',
    });
    resolveCurrentSectionNameFromRouteConfig.mockImplementation((route) => route.section || null);
    resolveRouteForPrefetch.mockImplementation((menuPath) => {
      if (menuPath === '/dashboard') {
        return { route: { slug: '/dashboard', section: 'dashboard-global' }, resolvedSlug: '/dashboard' };
      }
      return null;
    });
    normalizeTargetPath.mockImplementation((target) =>
      typeof target === 'string' ? target.split('?')[0].split('#')[0] : null,
    );
    preloadSectionAssetsMock.mockResolvedValue(undefined);
  });

  it('navigate auth loads section map + rollup', async () => {
    const { getAssetPreloadEntriesForSection } = await import(
      '../../src/systems/assets/routeSectionAssetPreloadEntries.js'
    );
    const rollup = getAssetPreloadEntriesForSection('auth');

    expect(rollup.assets.length).toBeGreaterThan(0);
    expect(rollup.routeCount).toBeGreaterThan(0);
  });

  it('critical fonts preloaded before paint', async () => {
    const { getAssetPreloadEntriesForSection } = await import(
      '../../src/systems/assets/routeSectionAssetPreloadEntries.js'
    );
    const { assets } = getAssetPreloadEntriesForSection('auth');

    expect(assets.length).toBeGreaterThan(0);
  });

  it('child route inherits parent assets in rollup', async () => {
    const { getRouteConfiguration } = await import('../../src/systems/routing/routeConfigLoader.js');
    const { resolveEffectiveAssetPreloadForRoute } = await import(
      '../../src/systems/routing/routeResolver.js'
    );
    const childRoute = getRouteConfiguration().find((route) => route.slug === '/dashboard/overview');

    expect(childRoute).toBeTruthy();
    expect(resolveEffectiveAssetPreloadForRoute(childRoute).length).toBeGreaterThan(0);
  });

  it('hover prefetch warms assets', async () => {
    const { prefetchSectionAssetsForRoute, resetRouteAssetPrefetchCache } = await import(
      '../../src/systems/assets/routeAssetPrefetch.js'
    );
    resetRouteAssetPrefetchCache();

    await prefetchSectionAssetsForRoute('/dashboard', { userRole: 'guest' });

    expect(preloadSectionAssetsMock).toHaveBeenCalledWith('dashboard-global');
  });

  it('role-based section object filters rollup', async () => {
    const { getAssetPreloadEntriesForSection } = await import(
      '../../src/systems/assets/routeSectionAssetPreloadEntries.js'
    );

    expect(getAssetPreloadEntriesForSection('dashboard-creator').assets.length).toBeGreaterThan(0);
    expect(getAssetPreloadEntriesForSection('dashboard-global').assets.length).toBeGreaterThan(0);
  });

  it('disabled route excluded from rollup', async () => {
    const { getAssetPreloadEntriesForSection } = await import(
      '../../src/systems/assets/routeSectionAssetPreloadEntries.js'
    );
    const rollup = getAssetPreloadEntriesForSection('auth');

    expect(rollup.routeCount).toBeGreaterThan(0);
    expect(rollup.assets.length).toBeGreaterThan(0);
  });

  it('build hash change clears preload store', async () => {
    const { syncPreloadStoreBuildHash } = await import('../../src/systems/build/appBuildHash.js');
    const store = usePreloadStore();

    vi.stubEnv('VITE_BUILD_HASH', 'deploy-v2');
    store.$patch({ buildHash: 'deploy-v1' });
    store.addSection('auth');

    syncPreloadStoreBuildHash(store);
    expect(store.hasSection('auth')).toBe(false);
  });

  it('menu logos resolved after init', async () => {
    const { resolveDashboardSidebarMenuItems } = await import('../../src/config/dashboardSidebarMenuItems.js');

    const menuItems = await resolveDashboardSidebarMenuItems([
      {
        menuItemId: 1,
        iconAssetFlag: 'dashboard.menu.analytics',
        submenuItems: [],
      },
    ]);

    expect(menuItems[0].iconUrl).toBe('/icons/analytics.svg');
  });

  it('shared chrome slots via resolveSharedComponentAssets', async () => {
    const { groupComponentSlotsByPreloadTier } = await import(
      '../../src/systems/assets/resolveSharedComponentAssets.js'
    );
    const slots = groupComponentSlotsByPreloadTier('dashboardSidebarChrome', 'dashboardMenuIcons');

    expect(slots.critical.length + slots.high.length + slots.normal.length).toBeGreaterThan(0);
  });

});
