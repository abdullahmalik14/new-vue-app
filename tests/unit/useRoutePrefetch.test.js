import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const prefetchRouteComponent = vi.fn(() => Promise.resolve());
const prefetchSectionAssetsForRoute = vi.fn(() => Promise.resolve());

vi.mock('../../src/systems/routing/routeComponentPreloader.js', () => ({
  prefetchRouteComponent,
  createRoutePrefetchIntentHandler: (targetPath, options) => () => {
    prefetchRouteComponent(targetPath, options);
  },
}));

vi.mock('../../src/systems/assets/routeAssetPrefetch.js', () => ({
  prefetchSectionAssetsForRoute,
  createSectionAssetPrefetchIntentHandler: (targetPath, options) => () => {
    prefetchSectionAssetsForRoute(targetPath, options);
  },
}));

describe('useRoutePrefetch (§48)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    prefetchRouteComponent.mockClear();
    prefetchSectionAssetsForRoute.mockClear();
  });

  it('createRoutePrefetchIntentHandler combines component + asset', async () => {
    const { createCombinedRoutePrefetchIntentHandler } = await import('../../src/composables/useRoutePrefetch.js');

    createCombinedRoutePrefetchIntentHandler('/shop')();

    expect(prefetchRouteComponent).toHaveBeenCalledWith('/shop', {});
    expect(prefetchSectionAssetsForRoute).toHaveBeenCalledWith('/shop', {});
  });

  it('useRoutePrefetch returns prefetch helpers', async () => {
    const { useRoutePrefetch } = await import('../../src/composables/useRoutePrefetch.js');
    const helpers = useRoutePrefetch();

    expect(helpers).toMatchObject({
      prefetchRouteComponent: expect.any(Function),
      prefetchSectionAssets: expect.any(Function),
      prefetchComponentOnIntent: expect.any(Function),
      prefetchAssetsOnIntent: expect.any(Function),
      prefetchRouteOnIntent: expect.any(Function),
      createCombinedRoutePrefetchIntentHandler: expect.any(Function),
      createRoutePrefetchIntentHandler: expect.any(Function),
    });
  });

  it('prefetchRoute triggers component prefetch', async () => {
    const { useRoutePrefetch } = await import('../../src/composables/useRoutePrefetch.js');
    const helpers = useRoutePrefetch();

    await helpers.prefetchRouteComponent('/dashboard');

    expect(helpers.prefetchRouteComponent).toBe(prefetchRouteComponent);
    expect(prefetchRouteComponent).toHaveBeenCalledTimes(1);
    expect(prefetchRouteComponent.mock.calls[0][0]).toBe('/dashboard');
  });

  it('prefetchSectionAssets delegates to routeAssetPrefetch', async () => {
    const { useRoutePrefetch } = await import('../../src/composables/useRoutePrefetch.js');

    await useRoutePrefetch().prefetchSectionAssets('/shop', { userRole: 'creator' });

    expect(prefetchSectionAssetsForRoute).toHaveBeenCalledWith('/shop', { userRole: 'creator' });
  });

  it('deprecated createRoutePrefetchIntentHandler alias matches combined handler', async () => {
    const { createRoutePrefetchIntentHandler } = await import('../../src/composables/useRoutePrefetch.js');

    createRoutePrefetchIntentHandler('/shop')();

    expect(prefetchRouteComponent).toHaveBeenCalledWith('/shop', {});
    expect(prefetchSectionAssetsForRoute).toHaveBeenCalledWith('/shop', {});
  });

  it('prefetchRouteOnIntent from composable matches combined handler', async () => {
    const { useRoutePrefetch } = await import('../../src/composables/useRoutePrefetch.js');

    useRoutePrefetch().prefetchRouteOnIntent('/dashboard')();

    expect(prefetchRouteComponent).toHaveBeenCalledWith('/dashboard', {});
    expect(prefetchSectionAssetsForRoute).toHaveBeenCalledWith('/dashboard', {});
  });
});
