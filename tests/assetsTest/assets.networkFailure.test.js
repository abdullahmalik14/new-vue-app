import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { setupAssetTestEnv } from '../helpers/assetFixtures.js';

describe('assets.networkFailure', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('preloadImage rejects when link onerror fires', async () => {
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag, options) => {
      const element = originalCreateElement(tag, options);
      if (tag === 'link') {
        queueMicrotask(() => element.onerror?.(new Event('error')));
      }
      return element;
    });

    const { preloadImage } = await import('../../src/systems/assets/assetPreloader.js');
    await expect(preloadImage('/assets/broken.svg')).rejects.toThrow('Failed to preload image');
  });

  it('blocked preload URL resolves without throwing', async () => {
    const { preloadImage } = await import('../../src/systems/assets/assetPreloader.js');
    await expect(preloadImage('javascript:alert(1)')).resolves.toBeUndefined();
    expect(document.querySelectorAll('link').length).toBe(0);
  });

  it('preloadJSON fetch failure rejects with context', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));
    const { preloadJSON } = await import('../../src/systems/assets/assetPreloader.js');
    await expect(preloadJSON('/src/config/countries.json')).rejects.toThrow('Failed to preload JSON');
  });

  it('loadSectionAssetMap returns null on network 404', async () => {
    vi.stubEnv('MODE', 'production');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 404 });
    const lib = await import('../../src/systems/assets/assetLibrary.js');
    lib.clearAssetCaches();
    await expect(lib.loadSectionAssetMap('missing-section')).resolves.toBeNull();
  });

  it('prefetchSectionAssetsForRoute resolves when preloadSectionAssets rejects', async () => {
    vi.doMock('../../src/systems/assets/assetPreloader.js', () => ({
      preloadSectionAssets: vi.fn(() => Promise.reject(new Error('asset preload failed'))),
    }));
    vi.doMock('../../src/systems/routing/routeComponentPreloader.js', () => ({
      normalizeTargetPath: (path) => path,
      resolveRouteForPrefetch: () => ({
        route: { slug: '/shop', section: 'shop', enabled: true },
        resolvedSlug: '/shop',
      }),
    }));
    vi.doMock('../../src/systems/sections/sectionPreloadOrchestrator.js', () => ({
      resolveCurrentSectionNameFromRouteConfig: () => 'shop',
    }));

    const { prefetchSectionAssetsForRoute, resetRouteAssetPrefetchCache } = await import(
      '../../src/systems/assets/routeAssetPrefetch.js'
    );
    resetRouteAssetPrefetchCache();
    await expect(prefetchSectionAssetsForRoute('/shop')).resolves.toBeUndefined();
  });
});
