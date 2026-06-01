import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

describe('loadAssetMapConfig (S-06)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    setActivePinia(createPinia());
    window.performanceTracker = { step: vi.fn() };
  });

  it('uses bundled map in production without network fetch', async () => {
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('DEV', '');

    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const { clearAssetMapConfigCache, loadAssetMapConfig, getAssetMapConfigSource } =
      await import('../../src/utils/assets/assetLibrary.js');

    clearAssetMapConfigCache();
    const map = await loadAssetMapConfig();

    expect(map.production?.['script.cognito']).toBe(
      '/vendor/amazon-cognito-identity-6.3.15.min.js',
    );
    expect(getAssetMapConfigSource()).toBe('bundled-production');
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });

  it('restores mapSource when asset map is loaded from TTL cache (P-01)', async () => {
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('DEV', '');

    const {
      clearAssetMapConfigCache,
      loadAssetMapConfig,
      getAssetMapConfigSource,
    } = await import('../../src/utils/assets/assetLibrary.js');

    clearAssetMapConfigCache();
    await loadAssetMapConfig();
    expect(getAssetMapConfigSource()).toBe('bundled-production');

    clearAssetMapConfigCache();
    const mapFromCache = await loadAssetMapConfig();

    expect(mapFromCache.production?.['script.cognito']).toBe(
      '/vendor/amazon-cognito-identity-6.3.15.min.js',
    );
    expect(getAssetMapConfigSource()).toBe('bundled-production');
  });

  it('clearAssetCaches drops stale in-memory asset map (L-01)', async () => {
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('DEV', '');

    const { clearAssetMapConfigCache, loadAssetMapConfig, clearAssetCaches } = await import(
      '../../src/utils/assets/assetLibrary.js',
    );

    clearAssetMapConfigCache();
    const map1 = await loadAssetMapConfig();
    map1.development['audit.l01.stale'] = 'https://example.com/stale';

    clearAssetCaches();

    const map2 = await loadAssetMapConfig();
    expect(map2.development['audit.l01.stale']).toBeUndefined();
    expect(map1).not.toBe(map2);
  });

  it('shares the same promise for concurrent map loads (L-03)', async () => {
    vi.stubEnv('PROD', '');
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ASSET_MAP_RUNTIME_OVERRIDE', 'true');
    vi.stubEnv('VITE_ASSET_MAP_URL', '/config/assetMap.json');

    vi.doMock('../../src/utils/assets/assetMapSource.js', async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        shouldAllowRuntimeAssetMapFetch: () => true,
        verifyFetchedAssetMapText: async () => true,
      };
    });
    vi.resetModules();

    let fetchResolve;
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(
      () =>
        new Promise((resolve) => {
          fetchResolve = () =>
            resolve({
              ok: true,
              text: async () =>
                JSON.stringify({
                  production: { 'script.cognito': '/vendor/amazon-cognito-identity-6.3.15.min.js' },
                  development: {},
                  staging: {},
                }),
            });
        }),
    );

    const { clearAssetMapConfigCache, loadAssetMapConfig } = await import(
      '../../src/utils/assets/assetLibrary.js',
    );

    clearAssetMapConfigCache();

    const p1 = loadAssetMapConfig();
    const p2 = loadAssetMapConfig();

    expect(p1).toBe(p2);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    fetchResolve();
    const [m1, m2] = await Promise.all([p1, p2]);

    expect(m1).toBe(m2);
    expect(m1.production?.['script.cognito']).toBe(
      '/vendor/amazon-cognito-identity-6.3.15.min.js',
    );

    fetchSpy.mockRestore();
    vi.doUnmock('../../src/utils/assets/assetMapSource.js');
  });

  it('getAssetUrl blocks javascript: flags resolved from tampered values', async () => {
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('DEV', '');

    const { clearAssetMapConfigCache, loadAssetMapConfig, getAssetUrl } = await import(
      '../../src/utils/assets/assetLibrary.js'
    );

    clearAssetMapConfigCache();
    const map = await loadAssetMapConfig();
    map.development['icon.test'] = 'javascript:alert(1)';

    const url = await getAssetUrl('icon.test', 'development');
    expect(url).toBeNull();
  });
});
