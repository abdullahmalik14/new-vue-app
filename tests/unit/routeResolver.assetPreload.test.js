import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveRouteAssetPreloads } from '../../src/systems/assets/resolveRouteAssetPreloads.js';

const getRouteConfiguration = vi.fn();

vi.mock('../../src/systems/routing/routeConfigLoader.js', () => ({
  getRouteConfiguration,
}));

beforeEach(() => {
  delete window.performanceTracker;
  getRouteConfiguration.mockReset();
});

describe('resolveEffectiveAssetPreloadForRoute (§49)', () => {
  async function loadResolver() {
    return import('../../src/systems/routing/routeResolver.js');
  }

  it('flat route inline assets returned', async () => {
    getRouteConfiguration.mockReturnValue([]);
    const { resolveEffectiveAssetPreloadForRoute } = await loadResolver();
    const assets = [{ flag: 'icon.cart', type: 'image', priority: 'high' }];

    expect(
      resolveEffectiveAssetPreloadForRoute({
        slug: '/shop',
        inheritConfigFromParent: false,
        assetPreload: assets,
      }),
    ).toEqual(assets);
  });

  it('child inherits parent when no child assets', async () => {
    getRouteConfiguration.mockReturnValue([
      {
        slug: '/dashboard',
        assetPreload: [{ flag: 'dashboard.logo', type: 'image', priority: 'high' }],
      },
    ]);
    const { resolveEffectiveAssetPreloadForRoute } = await loadResolver();

    const result = resolveEffectiveAssetPreloadForRoute({
      slug: '/dashboard/payout',
      inheritConfigFromParent: true,
    });

    expect(result.some((entry) => entry.flag === 'dashboard.logo')).toBe(true);
  });

  it('child assets concatenated after parent', async () => {
    getRouteConfiguration.mockReturnValue([
      {
        slug: '/dashboard',
        assetPreload: [{ flag: 'dashboard.logo', type: 'image', priority: 'high' }],
      },
    ]);
    const { resolveEffectiveAssetPreloadForRoute } = await loadResolver();
    const childAsset = { src: '/scripts/dashboard-metrics.js', type: 'script', priority: 'high' };

    const result = resolveEffectiveAssetPreloadForRoute({
      slug: '/dashboard/overview',
      inheritConfigFromParent: true,
      assetPreload: [childAsset],
    });

    expect(result[0].flag).toBe('dashboard.logo');
    expect(result.at(-1)).toEqual(childAsset);
  });

  it('grandchild inherits full chain', async () => {
    getRouteConfiguration.mockReturnValue([
      {
        slug: '/dashboard',
        assetPreload: [{ flag: 'dashboard.logo', type: 'image' }],
      },
      {
        slug: '/dashboard/settings',
        inheritConfigFromParent: true,
        assetPreload: [{ flag: 'dashboard.menu.settings', type: 'image' }],
      },
    ]);
    const { resolveEffectiveAssetPreloadForRoute } = await loadResolver();

    const result = resolveEffectiveAssetPreloadForRoute({
      slug: '/dashboard/settings/privacy-security',
      inheritConfigFromParent: true,
      assetPreload: [{ flag: 'dashboard.profile.settings', type: 'image' }],
    });

    expect(result.map((entry) => entry.flag)).toEqual(
      expect.arrayContaining(['dashboard.logo', 'dashboard.menu.settings', 'dashboard.profile.settings']),
    );
  });

  it('siblings do not cross-inherit', async () => {
    getRouteConfiguration.mockReturnValue([
      {
        slug: '/dashboard',
        assetPreload: [{ flag: 'dashboard.logo', type: 'image' }],
      },
      {
        slug: '/dashboard/payout',
        inheritConfigFromParent: true,
        assetPreload: [{ flag: 'dashboard.menu.payout', type: 'image' }],
      },
    ]);
    const { resolveEffectiveAssetPreloadForRoute } = await loadResolver();

    const sibling = resolveEffectiveAssetPreloadForRoute({
      slug: '/dashboard/overview',
      inheritConfigFromParent: true,
      assetPreload: [{ flag: 'dashboard.menu.analytics', type: 'image' }],
    });

    expect(sibling.some((entry) => entry.flag === 'dashboard.menu.payout')).toBe(false);
    expect(sibling.some((entry) => entry.flag === 'dashboard.logo')).toBe(true);
  });

  it('inheritedAssetPreloadCount matches length', async () => {
    getRouteConfiguration.mockReturnValue([
      {
        slug: '/dashboard',
        assetPreload: [{ flag: 'dashboard.logo', type: 'image' }],
      },
    ]);

    const { inheritConfigurationFromParentRoute } = await loadResolver();
    const merged = inheritConfigurationFromParentRoute({
      slug: '/dashboard/overview',
      inheritConfigFromParent: true,
      assetPreload: [{ src: '/scripts/dashboard-metrics.js', type: 'script' }],
    });

    expect(merged.assetPreload).toHaveLength(2);
  });

  it('empty parent array does not block child', async () => {
    getRouteConfiguration.mockReturnValue([
      { slug: '/dashboard', assetPreload: [] },
    ]);
    const { resolveEffectiveAssetPreloadForRoute } = await loadResolver();
    const childAssets = [{ flag: 'dashboard.menu.analytics', type: 'image' }];

    expect(
      resolveEffectiveAssetPreloadForRoute({
        slug: '/dashboard/overview',
        inheritConfigFromParent: true,
        assetPreload: childAssets,
      }),
    ).toEqual(childAssets);
  });

  it('null treated as absent', async () => {
    const { resolveEffectiveAssetPreloadForRoute } = await loadResolver();

    expect(resolveEffectiveAssetPreloadForRoute(null)).toEqual([]);
    expect(
      resolveEffectiveAssetPreloadForRoute({
        slug: '/shop',
        assetPreload: null,
      }),
    ).toEqual([]);
  });

  it('does not mutate parent input', async () => {
    const parent = {
      slug: '/dashboard',
      assetPreload: [{ flag: 'dashboard.logo', type: 'image' }],
    };
    getRouteConfiguration.mockReturnValue([parent]);
    const parentBefore = structuredClone(parent);
    const { inheritConfigurationFromParentRoute } = await loadResolver();

    inheritConfigurationFromParentRoute({
      slug: '/dashboard/payout',
      inheritConfigFromParent: true,
    });

    expect(parent).toEqual(parentBefore);
  });

  it('does not mutate child input', async () => {
    getRouteConfiguration.mockReturnValue([
      { slug: '/dashboard', assetPreload: [{ flag: 'dashboard.logo', type: 'image' }] },
    ]);
    const child = {
      slug: '/dashboard/payout',
      inheritConfigFromParent: true,
      assetPreload: [{ flag: 'dashboard.menu.payout', type: 'image' }],
    };
    const childBefore = structuredClone(child);
    const { inheritConfigurationFromParentRoute } = await loadResolver();

    inheritConfigurationFromParentRoute(child);

    expect(child).toEqual(childBefore);
  });

  it('disabled route behavior per contract', async () => {
    const { resolveEffectiveAssetPreloadForRoute } = await loadResolver();
    const assets = [{ flag: 'dashboard.logo', type: 'image' }];

    expect(
      resolveEffectiveAssetPreloadForRoute({
        slug: '/dashboard/payout',
        enabled: false,
        assetPreload: assets,
      }),
    ).toEqual(assets);
  });

  it('works with resolveRouteAssetPreloads composition', async () => {
    const catalog = {
      dashboardMenuIcons: [{ flag: 'dashboard.logo', type: 'image', priority: 'high' }],
    };
    const [resolvedRoute] = resolveRouteAssetPreloads(
      [{ slug: '/dashboard', assetPreloadRef: 'dashboardMenuIcons' }],
      catalog,
    );
    const { resolveEffectiveAssetPreloadForRoute } = await loadResolver();

    expect(resolveEffectiveAssetPreloadForRoute(resolvedRoute)).toEqual(catalog.dashboardMenuIcons);
  });
});
