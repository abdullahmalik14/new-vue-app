import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const ASSET_CACHE_KEY_PREFIX = 'asset_metadata_';
const LIBRARY_PATH = '../../src/systems/assets/assetLibrary.js';

const loadSectionManifest = vi.fn();
const getSectionBundlePaths = vi.fn();

vi.mock('../../src/systems/build/manifestLoader.js', () => ({
  loadSectionManifest,
  getSectionBundlePaths,
}));

vi.mock('../../src/systems/assets/routeSectionAssetPreloadEntries.js', () => ({
  getAssetPreloadEntriesForSection: vi.fn(() => ({ assets: [], routeCount: 0 })),
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  setActivePinia(createPinia());
  window.performanceTracker = { step: vi.fn() };

  loadSectionManifest.mockResolvedValue({
    auth: { js: '/a.js' },
    shop: { js: '/s.js' },
  });
  getSectionBundlePaths.mockResolvedValue({
    js: '/assets/section.js',
    css: '/assets/section.css',
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('preloadAssetsForSections (P-05)', () => {
  it('skips sections already in cache and loads only missing ones', async () => {
    const { setValueWithExpiration } = await import('../../src/utils/common/cacheHandler.js');
    const { clearAssetCaches, preloadAssetsForSections } = await import(LIBRARY_PATH);

    clearAssetCaches();

    const authAssets = {
      sectionName: 'auth',
      state: 'loaded',
      bundlePaths: { js: '/auth.js', css: null },
      assetPreloadConfigs: [],
    };
    setValueWithExpiration(ASSET_CACHE_KEY_PREFIX + 'auth', authAssets, 3600000);

    const assetsMap = await preloadAssetsForSections(['auth', 'shop']);

    expect(loadSectionManifest).toHaveBeenCalledTimes(1);
    expect(assetsMap.auth).toEqual(authAssets);
    expect(assetsMap.shop?.sectionName).toBe('shop');
    expect(assetsMap.shop?.state).toBe('loaded');
  });

  it('returns {} when sectionNames is not an array (A-B05)', async () => {
    const { preloadAssetsForSections } = await import(LIBRARY_PATH);
    const result = await preloadAssetsForSections(null);
    expect(result).toEqual({});
  });
});
