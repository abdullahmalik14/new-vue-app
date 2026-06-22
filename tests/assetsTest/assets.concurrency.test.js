import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { ASSET_PRELOAD_MAX_CONCURRENCY, preloadImage, runInConcurrencyChunks } from '../../src/systems/assets/assetPreloader.js';
import { autoResolveLinkPreloads, setupAssetTestEnv } from '../helpers/assetFixtures.js';

describe('assets.concurrency (§96)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    autoResolveLinkPreloads();
  });

  it('runInConcurrencyChunks never exceeds configured max concurrency', async () => {
    const chunkSizes = [];
    const originalAllSettled = Promise.allSettled.bind(Promise);
    vi.spyOn(Promise, 'allSettled').mockImplementation((promises) => {
      chunkSizes.push(promises.length);
      return originalAllSettled(promises);
    });

    await runInConcurrencyChunks([1, 2, 3, 4, 5], async () => {}, 2);

    expect(Math.max(...chunkSizes)).toBeLessThanOrEqual(2);
    vi.restoreAllMocks();
  });

  it('ASSET_PRELOAD_MAX_CONCURRENCY default is 6', () => {
    expect(ASSET_PRELOAD_MAX_CONCURRENCY).toBe(6);
  });

  it('concurrent preloadImage calls share one in-flight promise', async () => {
    const { preloadImage: freshPreloadImage } = await import('../../src/systems/assets/assetPreloader.js');
    const url = '/assets/shared-concurrent.svg';

    const first = freshPreloadImage(url);
    const second = freshPreloadImage(url);

    await Promise.all([first, second]);

    expect(document.querySelectorAll(`link[href="${url}"]`).length).toBe(1);
  });

  it('concurrent initAssetLibrary calls share one initialization promise', async () => {
    vi.stubEnv('MODE', 'production');
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('DEV', '');

    const lib = await import('../../src/systems/assets/assetLibrary.js');
    lib.clearAssetMapConfigCache();
    lib.clearAssetCaches();

    const first = lib.initAssetLibrary();
    const second = lib.initAssetLibrary();

    await Promise.all([first, second]);
    expect(lib.isAssetLibraryInitialized()).toBe(true);
  });

  it('concurrent loadAssetsForSection shares the same promise', async () => {
    vi.stubEnv('MODE', 'production');
    vi.stubEnv('PROD', 'true');
    const lib = await import('../../src/systems/assets/assetLibrary.js');
    lib.clearAssetCaches();
    await lib.loadAssetMapConfig();

    const first = lib.loadAssetsForSection('auth');
    const second = lib.loadAssetsForSection('auth');

    expect(first).toBe(second);
    await first;
  });
});
