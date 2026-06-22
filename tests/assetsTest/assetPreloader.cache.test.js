import { beforeEach, describe, expect, it } from 'vitest';
import { usePreloadStore } from '../../src/stores/usePreloadStore.js';
import { autoResolveLinkPreloads, setupAssetTestEnv } from '../helpers/assetFixtures.js';

describe('clearPreloadCache / getPreloadedAssetsCount (§23 cache)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    autoResolveLinkPreloads();
  });

  it('clearPreloadCache clears tracked assets', async () => {
    const { preloadImage, clearPreloadCache } = await import('../../src/systems/assets/assetPreloader.js');
    const url = '/assets/cache-clear.svg';
    await preloadImage(url);
    expect(usePreloadStore().hasAsset(url)).toBe(true);
    clearPreloadCache();
    expect(usePreloadStore().preloadedAssetCount).toBe(0);
  });

  it('getPreloadedAssetsCount accurate', async () => {
    const { preloadImage, getPreloadedAssetsCount } = await import('../../src/systems/assets/assetPreloader.js');
    await preloadImage('/assets/count-a.svg');
    await preloadImage('/assets/count-b.svg');
    expect(getPreloadedAssetsCount()).toBe(2);
  });

  it('getPreloadedAssetsCount zero after clear', async () => {
    const { preloadImage, clearPreloadCache, getPreloadedAssetsCount } = await import(
      '../../src/systems/assets/assetPreloader.js',
    );
    await preloadImage('/assets/count-clear.svg');
    clearPreloadCache();
    expect(getPreloadedAssetsCount()).toBe(0);
  });
});
