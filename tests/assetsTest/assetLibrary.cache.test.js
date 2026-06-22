import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadProductionAssetLibrary, setupAssetTestEnv } from '../helpers/assetFixtures.js';

describe('unloadUnusedSections / getKnownBundledSectionNames (§11)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    vi.stubGlobal('window', {
      location: { hostname: 'localhost', origin: 'http://localhost:5173' },
    });
  });

  it('unloadUnusedSections evicts section not in keep list', async () => {
    const { setValueWithExpiration } = await import('../../src/infrastructure/cache/cacheHandler.js');
    const lib = await loadProductionAssetLibrary();
    setValueWithExpiration('asset_metadata_shop', { sectionName: 'shop', state: 'loaded' }, 60_000);
    setValueWithExpiration('asset_metadata_auth', { sectionName: 'auth', state: 'loaded' }, 60_000);
    lib.getAssetsForSection('auth');
    lib.getAssetsForSection('shop');
    expect(lib.unloadUnusedSections(['auth'])).toBe(1);
    expect(lib.areAssetsLoadedForSection('shop')).toBe(false);
  });

  it('unloadUnusedSections retains all sections in keep list', async () => {
    const { setValueWithExpiration } = await import('../../src/infrastructure/cache/cacheHandler.js');
    const lib = await loadProductionAssetLibrary();
    setValueWithExpiration('asset_metadata_auth', { sectionName: 'auth', state: 'loaded' }, 60_000);
    lib.getAssetsForSection('auth');
    expect(lib.unloadUnusedSections(['auth'])).toBe(0);
    expect(lib.areAssetsLoadedForSection('auth')).toBe(true);
  });

  it('unloadUnusedSections clears section URL caches for evicted', async () => {
    const { setValueWithExpiration, getValueFromCache } = await import(
      '../../src/infrastructure/cache/cacheHandler.js',
    );
    const lib = await loadProductionAssetLibrary();
    setValueWithExpiration('asset_metadata_shop', { sectionName: 'shop', state: 'loaded' }, 60_000);
    setValueWithExpiration('asset_url_s_shop_production_icon.cart', 'https://example.com/x.svg', 60_000);
    lib.getAssetsForSection('shop');
    lib.unloadUnusedSections(['auth']);
    expect(getValueFromCache('asset_url_s_shop_production_icon.cart')).toBeNull();
  });

  it('unloadUnusedSections no-op when all loaded are kept', async () => {
    const { setValueWithExpiration } = await import('../../src/infrastructure/cache/cacheHandler.js');
    const lib = await loadProductionAssetLibrary();
    setValueWithExpiration('asset_metadata_auth', { sectionName: 'auth', state: 'loaded' }, 60_000);
    lib.getAssetsForSection('auth');
    expect(lib.unloadUnusedSections(['auth'])).toBe(0);
  });

  it('getKnownBundledSectionNames matches sectionAssetMapSource list', async () => {
    const lib = await loadProductionAssetLibrary();
    const { getKnownBundledSectionNames: fromSource } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    expect(lib.getKnownBundledSectionNames()).toEqual(fromSource());
  });
});

describe('assetLibrary caches and statistics (§12)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    vi.stubGlobal('window', {
      location: { hostname: 'localhost', origin: 'http://localhost:5173' },
    });
  });

  it('clearAssetCaches clears URL hit cache', async () => {
    const { getValueFromCache } = await import('../../src/infrastructure/cache/cacheHandler.js');
    const lib = await loadProductionAssetLibrary();
    await lib.getAssetUrl('script.cognito', 'production');
    lib.clearAssetCaches();
    expect(getValueFromCache('asset_url_g_production_script.cognito')).toBeNull();
  });

  it('clearAssetCaches clears URL miss cache', async () => {
    const { getValueFromCache } = await import('../../src/infrastructure/cache/cacheHandler.js');
    const lib = await loadProductionAssetLibrary();
    await lib.getAssetUrl('missing.flag.xyz', 'production');
    lib.clearAssetCaches();
    expect(getValueFromCache('asset_url_miss_g_production_missing.flag.xyz')).toBeNull();
  });

  it('clearAssetCaches clears asset index cache', async () => {
    const lib = await loadProductionAssetLibrary();
    await lib.primeAssetIndex({ environment: 'production' });
    lib.clearAssetCaches();
    expect(lib.isAssetCategoryCached('icon', 'production')).toBe(false);
  });

  it('clearAssetCaches clears section memory maps', async () => {
    const lib = await loadProductionAssetLibrary();
    await lib.loadSectionAssetMap('auth');
    lib.clearAssetCaches();
    expect(lib.isSectionAssetMetadataInMemory('auth')).toBe(false);
  });

  it('clearAssetCaches clears manual environment override', async () => {
    const lib = await loadProductionAssetLibrary();
    lib.setEnvironment('staging');
    lib.clearAssetCaches();
    expect(lib.getEnvironment()).toBe('production');
  });

  it('getAssetStatistics returns counts after loads', async () => {
    const lib = await loadProductionAssetLibrary();
    const { setValueWithExpiration } = await import('../../src/infrastructure/cache/cacheHandler.js');
    setValueWithExpiration('asset_metadata_auth', { sectionName: 'auth', state: 'loaded' }, 60_000);
    lib.getAssetsForSection('auth');
    const stats = lib.getAssetStatistics();
    expect(stats.loadedCount).toBeGreaterThan(0);
  });

  it('getAssetStatistics zeroed after reset', async () => {
    const { resetAssetLibrary } = await import('../../src/systems/assets/resetAssetLibrary.js');
    const lib = await loadProductionAssetLibrary();
    const { setValueWithExpiration } = await import('../../src/infrastructure/cache/cacheHandler.js');
    setValueWithExpiration('asset_metadata_auth', { sectionName: 'auth', state: 'loaded' }, 60_000);
    lib.getAssetsForSection('auth');
    resetAssetLibrary();
    expect(lib.getAssetStatistics().loadedCount).toBe(0);
  });

  it('isAssetCategoryCached true after category fetch', async () => {
    const lib = await loadProductionAssetLibrary();
    await lib.getAssetsByCategory('icon', 'production');
    expect(lib.isAssetCategoryCached('icon', 'production')).toBe(true);
  });

  it('isAssetCategoryCached false for unknown category', async () => {
    const lib = await loadProductionAssetLibrary();
    expect(lib.isAssetCategoryCached('unknown-category-xyz', 'production')).toBe(false);
  });
});
