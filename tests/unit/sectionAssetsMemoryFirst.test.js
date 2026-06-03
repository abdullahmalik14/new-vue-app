import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const ASSET_CACHE_KEY_PREFIX = 'asset_metadata_';

describe('section assets memory-first cache (B-06)', () => {
  beforeEach(() => {
    vi.resetModules();
    setActivePinia(createPinia());
    window.performanceTracker = { step: vi.fn() };
  });

  it('loadAssetsForSection writes memory only until getAssetsForSection rehydrates cache', async () => {
    const {
      clearAssetCaches,
      loadAssetsForSection,
      getAssetsForSection,
      isSectionAssetMetadataInMemory,
      isSectionAssetMetadataCached,
    } = await import('../../src/utils/assets/assetLibrary.js');

    clearAssetCaches();

    await loadAssetsForSection('auth');

    expect(isSectionAssetMetadataInMemory('auth')).toBe(true);
    expect(isSectionAssetMetadataCached('auth')).toBe(false);

    const fromMemory = getAssetsForSection('auth');

    expect(fromMemory?.sectionName).toBe('auth');
    expect(isSectionAssetMetadataCached('auth')).toBe(true);
  });

  it('cache-hit on load rehydrates memory without duplicate write on load path', async () => {
    const { setValueWithExpiration, getValueFromCache } = await import(
      '../../src/utils/common/cacheHandler.js',
    );
    const { clearAssetCaches, loadAssetsForSection } = await import(
      '../../src/utils/assets/assetLibrary.js',
    );

    clearAssetCaches();

    const cached = {
      sectionName: 'auth',
      bundlePaths: { js: null, css: null },
      assetPreloadConfigs: [],
      manifestEntry: null,
      loadedAt: new Date().toISOString(),
      state: 'loaded',
    };

    setValueWithExpiration(`${ASSET_CACHE_KEY_PREFIX}auth`, cached, 3600000);

    const result = await loadAssetsForSection('auth');

    expect(result).toEqual(cached);
    expect(result).not.toBe(cached);
    expect(getValueFromCache(`${ASSET_CACHE_KEY_PREFIX}auth`)).toBe(cached);
  });
});
