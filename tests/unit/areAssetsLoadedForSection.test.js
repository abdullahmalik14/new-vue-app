import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const ASSET_CACHE_KEY_PREFIX = 'asset_metadata_';

describe('areAssetsLoadedForSection (L-04)', () => {
  beforeEach(() => {
    vi.resetModules();
    setActivePinia(createPinia());
    window.performanceTracker = { step: vi.fn() };
  });

  it('returns true when section metadata exists only in cacheHandler', async () => {
    const { setValueWithExpiration } = await import('../../src/utils/common/cacheHandler.js');
    const { clearAssetCaches, areAssetsLoadedForSection, getAssetStatistics } = await import(
      '../../src/utils/assets/assetLibrary.js',
    );

    clearAssetCaches();

    const sectionName = 'auth';
    const cachedAssets = {
      sectionName,
      bundlePaths: { js: '/assets/section-auth.js', css: '/assets/section-auth.css' },
      assetPreloadConfigs: [],
      manifestEntry: null,
      state: 'loaded',
    };

    setValueWithExpiration(ASSET_CACHE_KEY_PREFIX + sectionName, cachedAssets, 3600000);

    expect(getAssetStatistics().loadedSections).not.toContain(sectionName);
    expect(areAssetsLoadedForSection(sectionName)).toBe(true);
    expect(getAssetStatistics().loadedSections).toContain(sectionName);
  });

  it('returns false when section is not in memory or cache', async () => {
    const { clearAssetCaches, areAssetsLoadedForSection } = await import(
      '../../src/utils/assets/assetLibrary.js',
    );

    clearAssetCaches();

    expect(areAssetsLoadedForSection('missing-section')).toBe(false);
  });
});
