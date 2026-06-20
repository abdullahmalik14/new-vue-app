import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

describe('resetAssetLibrary (B-03 / M-06)', () => {
  beforeEach(() => {
    vi.resetModules();
    setActivePinia(createPinia());
    window.performanceTracker = { step: vi.fn() };
  });

  it('clears assetLibrary, cacheHandler, and preload store URL cache', async () => {
    const { setValueWithExpiration, getValueFromCache } = await import(
      '../../src/utils/common/cacheHandler.js',
    );
    const { loadAssetsForSection } = await import('../../src/systems/assets/assetLibrary.js');
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');
    const { resetAssetLibrary } = await import('../../src/systems/assets/resetAssetLibrary.js');

    setValueWithExpiration('b03_probe', { ok: true }, 60_000);
    await loadAssetsForSection('auth');

    const store = usePreloadStore();
    store.addPreloadedAsset('https://example.com/preloaded.png');

    expect(getValueFromCache('b03_probe')).not.toBeNull();
    expect(store.preloadedAssetCount).toBe(1);

    const summary = resetAssetLibrary();

    expect(summary.before.cacheHandlerEntries).toBeGreaterThan(0);
    expect(summary.before.preloadedUrls).toBe(1);
    expect(summary.after.loadedAssets).toBe(0);
    expect(summary.after.cacheHandlerEntries).toBe(0);
    expect(summary.after.preloadedUrls).toBe(0);
    expect(getValueFromCache('b03_probe')).toBeNull();
    expect(summary.sectionRollupCacheCleared).toBe(true);
  });

  it('resetAssetSystem is an alias for resetAssetLibrary', async () => {
    const { resetAssetLibrary, resetAssetSystem } = await import(
      '../../src/systems/assets/resetAssetLibrary.js',
    );
    expect(resetAssetSystem).toBe(resetAssetLibrary);
  });
});
