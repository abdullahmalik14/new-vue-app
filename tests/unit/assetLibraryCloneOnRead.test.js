import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

describe('assetLibrary clone-on-read (A-L06)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    setActivePinia(createPinia());
    window.performanceTracker = { step: vi.fn() };
  });

  it('loadAssetMapConfig and getAssetsForSection return independent copies', async () => {
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('DEV', '');

    const {
      clearAssetCaches,
      loadAssetMapConfig,
      loadAssetsForSection,
      getAssetsForSection,
    } = await import('../../src/utils/assets/assetLibrary.js');

    clearAssetCaches();

    const mapA = await loadAssetMapConfig();
    mapA.production.__mutation = 'x';
    const mapB = await loadAssetMapConfig();
    expect(mapB.production.__mutation).toBeUndefined();

    await loadAssetsForSection('auth');
    const assetsA = getAssetsForSection('auth');
    assetsA.__mutation = true;
    const assetsB = getAssetsForSection('auth');
    expect(assetsB.__mutation).toBeUndefined();
  });
});
