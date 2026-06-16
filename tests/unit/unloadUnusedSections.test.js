import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const ASSET_CACHE_KEY_PREFIX = 'asset_metadata_';

describe('unloadUnusedSections (L-05)', () => {
  beforeEach(() => {
    vi.resetModules();
    setActivePinia(createPinia());
    window.performanceTracker = { step: vi.fn() };
  });

  it('removes evicted section from cacheHandler, not only loadedAssets', async () => {
    const { setValueWithExpiration, getValueFromCache } = await import(
      '../../src/utils/common/cacheHandler.js',
    );
    const {
      clearAssetCaches,
      getAssetsForSection,
      unloadUnusedSections,
      areAssetsLoadedForSection,
    } = await import('../../src/systems/assets/assetLibrary.js');

    clearAssetCaches();

    const authAssets = { sectionName: 'auth', state: 'loaded', bundlePaths: {}, assetPreloadConfigs: [] };
    const shopAssets = { sectionName: 'shop', state: 'loaded', bundlePaths: {}, assetPreloadConfigs: [] };

    setValueWithExpiration(ASSET_CACHE_KEY_PREFIX + 'auth', authAssets, 3600000);
    setValueWithExpiration(ASSET_CACHE_KEY_PREFIX + 'shop', shopAssets, 3600000);

    getAssetsForSection('auth');
    getAssetsForSection('shop');

    expect(areAssetsLoadedForSection('shop')).toBe(true);
    expect(getValueFromCache(ASSET_CACHE_KEY_PREFIX + 'shop')).not.toBeNull();

    const unloaded = unloadUnusedSections(['auth']);

    expect(unloaded).toBe(1);
    expect(areAssetsLoadedForSection('auth')).toBe(true);
    expect(areAssetsLoadedForSection('shop')).toBe(false);
    expect(getValueFromCache(ASSET_CACHE_KEY_PREFIX + 'shop')).toBeNull();
    expect(getValueFromCache(ASSET_CACHE_KEY_PREFIX + 'auth')).not.toBeNull();
  });
});
