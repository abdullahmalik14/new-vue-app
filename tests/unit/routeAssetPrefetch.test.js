import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const preloadSectionAssets = vi.fn(() => Promise.resolve());

vi.mock('../../src/utils/assets/assetPreloader.js', () => ({
  preloadSectionAssets,
}));

vi.mock('../../src/utils/route/routeComponentPrefetch.js', () => ({
  normalizeTargetPath: (target) => {
    if (typeof target === 'string') {
      return target.split('?')[0].split('#')[0];
    }
    return null;
  },
  resolveRouteForPrefetch: (menuPath) => {
    if (menuPath === '/shop') {
      return {
        route: { slug: '/shop', section: 'shop', enabled: true },
        resolvedSlug: '/shop',
      };
    }
    return null;
  },
}));

describe('routeAssetPrefetch (M-08)', () => {
  beforeEach(async () => {
    vi.resetModules();
    setActivePinia(createPinia());
    preloadSectionAssets.mockClear();

    const { resetRouteAssetPrefetchCache } = await import('../../src/utils/route/routeAssetPrefetch.js');
    resetRouteAssetPrefetchCache();
  });

  it('prefetches section assets for a hover target path', async () => {
    const { prefetchSectionAssetsForRoute } = await import('../../src/utils/route/routeAssetPrefetch.js');

    await prefetchSectionAssetsForRoute('/shop');

    expect(preloadSectionAssets).toHaveBeenCalledTimes(1);
    expect(preloadSectionAssets).toHaveBeenCalledWith('shop');
  });

  it('dedupes section asset prefetch for the same section', async () => {
    const { prefetchSectionAssetsForRoute } = await import('../../src/utils/route/routeAssetPrefetch.js');

    await prefetchSectionAssetsForRoute('/shop');
    await prefetchSectionAssetsForRoute('/shop');

    expect(preloadSectionAssets).toHaveBeenCalledTimes(1);
  });
});
