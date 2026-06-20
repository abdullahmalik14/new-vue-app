import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { loadProductionAssetLibrary } from '../helpers/assetFixtures.js';

describe('resetAssetLibrary (§50)', () => {
  beforeEach(() => {
    vi.resetModules();
    setActivePinia(createPinia());
    window.performanceTracker = { step: vi.fn() };
  });

  it('resetAssetLibrary clears initialized', async () => {
    const lib = await loadProductionAssetLibrary();
    await lib.initAssetLibrary();
    const { resetAssetLibrary } = await import('../../src/systems/assets/resetAssetLibrary.js');
    resetAssetLibrary();
    expect(lib.isAssetLibraryInitialized()).toBe(false);
  });

  it('resetAssetLibrary clears caches', async () => {
    const { setValueWithExpiration, getValueFromCache } = await import(
      '../../src/infrastructure/cache/cacheHandler.js',
    );
    const lib = await loadProductionAssetLibrary();
    setValueWithExpiration('asset_metadata_auth', { sectionName: 'auth', state: 'loaded' }, 60_000);
    lib.getAssetsForSection('auth');
    const { resetAssetLibrary } = await import('../../src/systems/assets/resetAssetLibrary.js');
    resetAssetLibrary();
    expect(getValueFromCache('asset_metadata_auth')).toBeNull();
    expect(lib.getAssetStatistics().loadedCount).toBe(0);
  });

  it('re-init works after reset', async () => {
    const lib = await loadProductionAssetLibrary();
    await lib.initAssetLibrary();
    const { resetAssetLibrary } = await import('../../src/systems/assets/resetAssetLibrary.js');
    resetAssetLibrary();
    const result = await lib.initAssetLibrary();
    expect(result.flagCount).toBeGreaterThan(0);
    expect(lib.isAssetLibraryInitialized()).toBe(true);
  });

  it('safe when never initialized', async () => {
    const { resetAssetLibrary } = await import('../../src/systems/assets/resetAssetLibrary.js');
    expect(() => resetAssetLibrary()).not.toThrow();
  });

  it('resetAssetSystem is alias for resetAssetLibrary', async () => {
    const { resetAssetLibrary, resetAssetSystem } = await import(
      '../../src/systems/assets/resetAssetLibrary.js',
    );
    expect(resetAssetSystem).toBe(resetAssetLibrary);
  });

  it('options partial reset if supported', async () => {
    const { resetAssetLibrary } = await import('../../src/systems/assets/resetAssetLibrary.js');
    expect(() => resetAssetLibrary({})).not.toThrow();
  });
});
