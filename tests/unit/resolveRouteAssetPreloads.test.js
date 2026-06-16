import { describe, it, expect } from 'vitest';
import { resolveRouteAssetPreloads } from '../../src/systems/assets/routeAssetPreloadResolver.js';
import sharedAssetPreloads from '../../src/config/sharedAssetPreloads.json';

describe('resolveRouteAssetPreloads (P4)', () => {
  it('expands assetPreloadRef into assetPreload and removes the ref field', () => {
    const routes = [
      {
        slug: '/dashboard',
        section: 'dashboard-global',
        assetPreloadRef: 'dashboardMenuIcons'
      }
    ];

    const resolved = resolveRouteAssetPreloads(routes, sharedAssetPreloads);
    const refCount = sharedAssetPreloads.dashboardMenuIcons.length;

    expect(resolved[0].assetPreloadRef).toBeUndefined();
    expect(resolved[0].assetPreload).toHaveLength(refCount);
    expect(resolved[0].assetPreload[0]).toEqual({
      flag: 'dashboard.logo',
      type: 'image',
      priority: 'high'
    });
  });

  it('appends inline assetPreload entries after shared ref entries', () => {
    const routes = [
      {
        slug: '/shop',
        section: 'shop',
        assetPreloadRef: 'dashboardMenuIcons',
        assetPreload: [
          { src: '/media/extra.png', type: 'image', priority: 'high' }
        ]
      }
    ];

    const resolved = resolveRouteAssetPreloads(routes, sharedAssetPreloads);
    const refCount = sharedAssetPreloads.dashboardMenuIcons.length;

    expect(resolved[0].assetPreload).toHaveLength(refCount + 1);
    expect(resolved[0].assetPreload[refCount]).toEqual({
      src: '/media/extra.png',
      type: 'image',
      priority: 'high'
    });
  });

  it('throws for unknown assetPreloadRef keys', () => {
    expect(() =>
      resolveRouteAssetPreloads(
        [{ slug: '/bad', assetPreloadRef: 'missing' }],
        sharedAssetPreloads
      )
    ).toThrow(/Unknown assetPreloadRef "missing"/);
  });
});
