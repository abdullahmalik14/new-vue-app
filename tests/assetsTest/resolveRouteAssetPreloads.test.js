import { describe, expect, it } from 'vitest';
import { resolveRouteAssetPreloads } from '../../src/systems/assets/resolveRouteAssetPreloads.js';

describe('resolveRouteAssetPreloads (P4)', () => {
  it('leaves an empty route unchanged', () => {
    const route = { slug: '/dashboard', section: 'dashboard-global' };

    const resolved = resolveRouteAssetPreloads([route], {});

    expect(resolved[0]).toBe(route);
  });

  it('keeps multiple assetPreloadRef entries in order', () => {
    const routes = [
      {
        slug: '/dashboard',
        section: 'dashboard-global',
        assetPreloadRef: ['menuIcons', 'headerIcons'],
      },
    ];
    const sharedCatalog = {
      menuIcons: [{ flag: 'dashboard.logo', type: 'image', priority: 'high' }],
      headerIcons: [{ flag: 'dashboard.avatar', type: 'image', priority: 'normal' }],
    };

    const resolved = resolveRouteAssetPreloads(routes, sharedCatalog);

    expect(resolved[0].assetPreload).toEqual([
      { flag: 'dashboard.logo', type: 'image', priority: 'high' },
      { flag: 'dashboard.avatar', type: 'image', priority: 'normal' },
    ]);
  });

  it('ignores a null assetPreloadRef', () => {
    const route = {
      slug: '/shop',
      section: 'shop',
      assetPreloadRef: null,
      assetPreload: [{ src: '/media/extra.png', type: 'image', priority: 'high' }],
    };

    const resolved = resolveRouteAssetPreloads([route], {});

    expect(resolved[0]).toBe(route);
    expect(resolved[0].assetPreload).toEqual([
      { src: '/media/extra.png', type: 'image', priority: 'high' },
    ]);
  });

  it('preserves type and priority on every resolved entry', () => {
    const routes = [
      {
        slug: '/dashboard',
        section: 'dashboard-global',
        assetPreloadRef: 'menuIcons',
        assetPreload: [{ src: '/media/extra.png', type: 'image', priority: 'critical' }],
      },
    ];
    const sharedCatalog = {
      menuIcons: [
        { flag: 'dashboard.logo', type: 'font', priority: 'high' },
        { flag: 'dashboard.avatar', type: 'image', priority: 'normal' },
      ],
    };

    const resolved = resolveRouteAssetPreloads(routes, sharedCatalog);

    expect(resolved[0].assetPreload).toEqual([
      { flag: 'dashboard.logo', type: 'font', priority: 'high' },
      { flag: 'dashboard.avatar', type: 'image', priority: 'normal' },
      { src: '/media/extra.png', type: 'image', priority: 'critical' },
    ]);
  });
});
