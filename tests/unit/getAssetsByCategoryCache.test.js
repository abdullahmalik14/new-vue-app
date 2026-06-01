import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const CATEGORY_CACHE_PREFIX = 'asset_category_';

describe('getAssetsByCategory category cache (P-07)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    setActivePinia(createPinia());
    window.performanceTracker = { step: vi.fn() };
  });

  it('stores category results in cacheHandler and reuses on second call', async () => {
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('DEV', '');

    const { getValueFromCache } = await import('../../src/utils/common/cacheHandler.js');
    const { clearAssetCaches, getAssetsByCategory, isAssetCategoryCached } = await import(
      '../../src/utils/assets/assetLibrary.js',
    );

    clearAssetCaches();

    const first = await getAssetsByCategory('icon', 'production');
    const cacheKey = `${CATEGORY_CACHE_PREFIX}production_icon`;

    expect(Object.keys(first).length).toBeGreaterThan(0);
    expect(getValueFromCache(cacheKey)).toEqual(first);
    expect(isAssetCategoryCached('icon', 'production')).toBe(true);

    const second = await getAssetsByCategory('icon', 'production');

    expect(second).toBe(first);
    expect(second).toEqual(first);
  });

  it('clears category cache when asset map cache is cleared', async () => {
    vi.stubEnv('PROD', 'true');

    const { getValueFromCache } = await import('../../src/utils/common/cacheHandler.js');
    const { clearAssetMapConfigCache, getAssetsByCategory, isAssetCategoryCached } = await import(
      '../../src/utils/assets/assetLibrary.js',
    );

    clearAssetMapConfigCache();
    await getAssetsByCategory('logo', 'production');

    const cacheKey = `${CATEGORY_CACHE_PREFIX}production_logo`;
    expect(getValueFromCache(cacheKey)).not.toBeNull();
    expect(isAssetCategoryCached('logo', 'production')).toBe(true);

    clearAssetMapConfigCache();

    expect(getValueFromCache(cacheKey)).toBeNull();
    expect(isAssetCategoryCached('logo', 'production')).toBe(false);
  });
});
