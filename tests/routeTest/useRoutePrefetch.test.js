/**
 * useRoutePrefetch.js — Phase D (route test plan §19).
 */

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
  createSectionAssetPrefetchIntentHandler: (targetPath, options = {}) => () => {
    prefetchSectionAssetsForRoute(targetPath, options);
  },
}));

describe('useRoutePrefetch (Phase D §19)', () => {
  beforeEach(async () => {
    vi.resetModules();
    setActivePinia(createPinia());
    prefetchRouteComponent.mockClear();
    prefetchSectionAssetsForRoute.mockClear();
  });

  it('createCombinedRoutePrefetchIntentHandler prefetches component and section assets', async () => {
    const { createCombinedRoutePrefetchIntentHandler } = await import('../../src/composables/useRoutePrefetch.js');

    createCombinedRoutePrefetchIntentHandler('/shop')();

    expect(prefetchRouteComponent).toHaveBeenCalledWith('/shop', {});
    expect(prefetchSectionAssetsForRoute).toHaveBeenCalledWith('/shop', {});
  });

  it('prefetchRouteOnIntent from composable matches combined handler', async () => {
    const { useRoutePrefetch } = await import('../../src/composables/useRoutePrefetch.js');

    useRoutePrefetch().prefetchRouteOnIntent('/dashboard')();

    expect(prefetchRouteComponent).toHaveBeenCalledWith('/dashboard', {});
    expect(prefetchSectionAssetsForRoute).toHaveBeenCalledWith('/dashboard', {});
  });

  it('prefetchComponentOnIntent only prefetches component module', async () => {
    const { useRoutePrefetch } = await import('../../src/composables/useRoutePrefetch.js');

    useRoutePrefetch().prefetchComponentOnIntent('/shop')();

    expect(prefetchRouteComponent).toHaveBeenCalledWith('/shop', {});
    expect(prefetchSectionAssetsForRoute).not.toHaveBeenCalled();
  });

  it('prefetchAssetsOnIntent only prefetches section assets', async () => {
    const { useRoutePrefetch } = await import('../../src/composables/useRoutePrefetch.js');

    useRoutePrefetch().prefetchAssetsOnIntent('/shop')();

    expect(prefetchSectionAssetsForRoute).toHaveBeenCalledWith('/shop', {});
    expect(prefetchRouteComponent).not.toHaveBeenCalled();
  });
});
