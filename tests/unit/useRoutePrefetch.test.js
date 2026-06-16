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

vi.mock('../../src/systems/assets/routeAssetPreloader.js', () => ({
  prefetchSectionAssetsForRoute,
  createSectionAssetPrefetchIntentHandler: (targetPath, options) => () => {
    prefetchSectionAssetsForRoute(targetPath, options);
  },
}));

describe('useRoutePrefetch (M-08)', () => {
  beforeEach(async () => {
    vi.resetModules();
    setActivePinia(createPinia());
    prefetchRouteComponent.mockClear();
    prefetchSectionAssetsForRoute.mockClear();
  });

  it('createRoutePrefetchIntentHandler prefetches component and section assets', async () => {
    const { createRoutePrefetchIntentHandler } = await import('../../src/composables/useRoutePrefetch.js');

    createRoutePrefetchIntentHandler('/shop')();

    expect(prefetchRouteComponent).toHaveBeenCalledWith('/shop', {});
    expect(prefetchSectionAssetsForRoute).toHaveBeenCalledWith('/shop', {});
  });

  it('prefetchOnIntent from composable matches combined handler', async () => {
    const { useRoutePrefetch } = await import('../../src/composables/useRoutePrefetch.js');

    useRoutePrefetch().prefetchOnIntent('/dashboard')();

    expect(prefetchRouteComponent).toHaveBeenCalledWith('/dashboard', {});
    expect(prefetchSectionAssetsForRoute).toHaveBeenCalledWith('/dashboard', {});
  });
});
