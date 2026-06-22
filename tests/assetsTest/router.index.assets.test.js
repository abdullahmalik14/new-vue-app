import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { setupAssetTestEnv } from '../helpers/assetFixtures.js';
import { usePreloadStore } from '../../src/stores/usePreloadStore.js';

const preloadSectionCriticalImages = vi.hoisted(() => vi.fn(() => Promise.resolve()));
const preloadSection = vi.hoisted(() => vi.fn(() => Promise.resolve(true)));

vi.mock('../../src/systems/assets/assetPreloader.js', () => ({
  preloadSectionCriticalImages,
}));

vi.mock('../../src/systems/sections/sectionPreloader.js', () => ({
  preloadSection,
}));

describe('router.index.assets (§91)', () => {
  beforeEach(() => {
    vi.resetModules();
    setupAssetTestEnv();
    setActivePinia(createPinia());
    preloadSectionCriticalImages.mockClear();
    preloadSection.mockClear();
  });

  it('preloadSectionCriticalImages on navigation', async () => {
    const { loadRouteComponentWithSectionPreload } = await import(
      '../../src/systems/sections/sectionNavigationHooks.js'
    );

    await loadRouteComponentWithSectionPreload(
      { slug: '/auth', section: 'auth' },
      vi.fn(async () => ({ default: {} })),
    );

    expect(preloadSectionCriticalImages).toHaveBeenCalledWith('auth');
  });

  it('preloadSection includes asset phase', async () => {
    const { loadRouteComponentWithSectionPreload } = await import(
      '../../src/systems/sections/sectionNavigationHooks.js'
    );

    await loadRouteComponentWithSectionPreload(
      { slug: '/auth', section: 'auth' },
      vi.fn(async () => ({ default: {} })),
    );

    expect(preloadSection).toHaveBeenCalledWith('auth');
  });

  it('createRoutePrefetchIntentHandler wired', async () => {
    const routerEntry = await import('../../src/router/index.js');
    const routingEntry = await import('../../src/systems/routing/index.js');

    expect(routerEntry.createRoutePrefetchIntentHandler).toBe(
      routingEntry.createRoutePrefetchIntentHandler,
    );
    expect(routerEntry.prefetchSectionAssetsForRoute).toBe(routingEntry.prefetchSectionAssetsForRoute);
  });

  it('usePreloadStore imported for guard coordination', async () => {
    const { loadRouteComponentWithSectionPreload } = await import(
      '../../src/systems/sections/sectionNavigationHooks.js'
    );

    usePreloadStore().addSection('auth');

    await loadRouteComponentWithSectionPreload(
      { slug: '/auth', section: 'auth' },
      vi.fn(async () => ({ default: {} })),
    );

    expect(preloadSection).not.toHaveBeenCalled();
  });
});
