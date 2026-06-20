import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const preloadSectionAssets = vi.fn(() => Promise.resolve());
const resolveCurrentSectionNameFromRouteConfig = vi.fn((route) => {
  if (typeof route.section === 'string') {
    return route.section;
  }
  return null;
});

vi.mock('../../src/systems/assets/assetPreloader.js', () => ({
  preloadSectionAssets,
}));

vi.mock('../../src/systems/sections/sectionPreloadOrchestrator.js', () => ({
  resolveCurrentSectionNameFromRouteConfig,
}));

vi.mock('../../src/systems/routing/routeComponentPreloader.js', () => ({
  normalizeTargetPath: (target) => {
    if (typeof target === 'string') {
      return target.split('?')[0].split('#')[0];
    }
    return null;
  },
  resolveRouteForPrefetch: (menuPath) => {
    const routes = {
      '/shop': { route: { slug: '/shop', section: 'shop', enabled: true }, resolvedSlug: '/shop' },
      '/disabled': null,
      '/no-section': { route: { slug: '/no-section', enabled: true }, resolvedSlug: '/no-section' },
    };
    return routes[menuPath] ?? null;
  },
}));

describe('routeAssetPrefetch (§47)', () => {
  beforeEach(async () => {
    vi.resetModules();
    setActivePinia(createPinia());
    preloadSectionAssets.mockClear();
    preloadSectionAssets.mockResolvedValue(undefined);
    resolveCurrentSectionNameFromRouteConfig.mockClear();

    const { resetRouteAssetPrefetchCache } = await import('../../src/systems/assets/routeAssetPrefetch.js');
    resetRouteAssetPrefetchCache();
  });

  it('prefetchSectionAssetsForRoute no-op when no assets', async () => {
    const { prefetchSectionAssetsForRoute } = await import('../../src/systems/assets/routeAssetPrefetch.js');

    await prefetchSectionAssetsForRoute('/');
    await prefetchSectionAssetsForRoute('/unknown');
    await prefetchSectionAssetsForRoute('/no-section');

    expect(preloadSectionAssets).not.toHaveBeenCalled();
  });

  it('prefetchSectionAssetsForRoute calls preloadSectionAssets', async () => {
    const { prefetchSectionAssetsForRoute } = await import('../../src/systems/assets/routeAssetPrefetch.js');

    await prefetchSectionAssetsForRoute('/shop');

    expect(preloadSectionAssets).toHaveBeenCalledTimes(1);
    expect(preloadSectionAssets).toHaveBeenCalledWith('shop');
  });

  it('prefetchSectionAssetsForRoute uses route section', async () => {
    resolveCurrentSectionNameFromRouteConfig.mockReturnValueOnce('shop-resolved');
    const { prefetchSectionAssetsForRoute } = await import('../../src/systems/assets/routeAssetPrefetch.js');

    await prefetchSectionAssetsForRoute('/shop', { userRole: 'creator' });

    expect(resolveCurrentSectionNameFromRouteConfig).toHaveBeenCalled();
    expect(preloadSectionAssets).toHaveBeenCalledWith('shop-resolved');
  });

  it('createSectionAssetPrefetchIntentHandler returns handler', async () => {
    const { createSectionAssetPrefetchIntentHandler } = await import('../../src/systems/assets/routeAssetPrefetch.js');
    const handler = createSectionAssetPrefetchIntentHandler('/shop');

    expect(typeof handler).toBe('function');
    handler();
    expect(preloadSectionAssets).toHaveBeenCalledWith('shop');
  });

  it('intent handler on hover triggers prefetch', async () => {
    const { createSectionAssetPrefetchIntentHandler } = await import('../../src/systems/assets/routeAssetPrefetch.js');

    createSectionAssetPrefetchIntentHandler('/shop')();

    expect(preloadSectionAssets).toHaveBeenCalledTimes(1);
  });

  it('intent handler skips disabled route', async () => {
    const { prefetchSectionAssetsForRoute } = await import('../../src/systems/assets/routeAssetPrefetch.js');

    await prefetchSectionAssetsForRoute('/disabled');

    expect(preloadSectionAssets).not.toHaveBeenCalled();
  });

  it('resetRouteAssetPrefetchCache clears internal cache', async () => {
    const { prefetchSectionAssetsForRoute, resetRouteAssetPrefetchCache } = await import(
      '../../src/systems/assets/routeAssetPrefetch.js'
    );

    await prefetchSectionAssetsForRoute('/shop');
    resetRouteAssetPrefetchCache();
    await prefetchSectionAssetsForRoute('/shop');

    expect(preloadSectionAssets).toHaveBeenCalledTimes(2);
  });

  it('handler catches errors without throw', async () => {
    preloadSectionAssets.mockRejectedValueOnce(new Error('preload failed'));
    const { prefetchSectionAssetsForRoute } = await import('../../src/systems/assets/routeAssetPrefetch.js');

    await expect(prefetchSectionAssetsForRoute('/shop')).resolves.toBeUndefined();
  });
});
