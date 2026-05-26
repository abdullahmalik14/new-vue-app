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
