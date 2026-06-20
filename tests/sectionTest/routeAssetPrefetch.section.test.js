/**
 * routeAssetPrefetch.js — prefetchSectionAssetsForRoute (section test plan §51, §120).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const preloadSectionAssets = vi.fn(() => Promise.resolve());

vi.mock('../../src/systems/assets/assetPreloader.js', () => ({
  preloadSectionAssets,
}));

vi.mock('../../src/systems/routing/routeComponentPreloader.js', () => ({
  normalizeTargetPath: (target) => {
    if (typeof target === 'string') {
      return target.split('?')[0].split('#')[0];
    }
    return null;
  },
  resolveRouteForPrefetch: (menuPath) => {
    if (menuPath === '/shop' || menuPath === '/vi/shop') {
      return {
        route: { slug: '/shop', section: 'shop', enabled: true },
        resolvedSlug: '/shop',
      };
    }
    return null;
  },
}));

describe('prefetchSectionAssetsForRoute (Phase F §51, §120)', () => {
  beforeEach(async () => {
    vi.resetModules();
    setActivePinia(createPinia());
    preloadSectionAssets.mockClear();

    const { resetRouteAssetPrefetchCache } = await import(
      '../../src/systems/assets/routeAssetPrefetch.js'
    );
    resetRouteAssetPrefetchCache();
  });

  it('prefetches section assets for a hover target path', async () => {
    const { prefetchSectionAssetsForRoute } = await import(
      '../../src/systems/assets/routeAssetPrefetch.js'
    );

    await prefetchSectionAssetsForRoute('/shop');

    expect(preloadSectionAssets).toHaveBeenCalledTimes(1);
    expect(preloadSectionAssets).toHaveBeenCalledWith('shop');
  });

  it('dedupes section asset prefetch for the same section', async () => {
    const { prefetchSectionAssetsForRoute } = await import(
      '../../src/systems/assets/routeAssetPrefetch.js'
    );

    await prefetchSectionAssetsForRoute('/shop');
    await prefetchSectionAssetsForRoute('/shop');

    expect(preloadSectionAssets).toHaveBeenCalledTimes(1);
  });

  it('createSectionAssetPrefetchIntentHandler invokes prefetch on call', async () => {
    const { createSectionAssetPrefetchIntentHandler } = await import(
      '../../src/systems/assets/routeAssetPrefetch.js'
    );

    createSectionAssetPrefetchIntentHandler('/shop')();

    expect(preloadSectionAssets).toHaveBeenCalledWith('shop');
  });
});
