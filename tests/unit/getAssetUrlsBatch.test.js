import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

describe('getAssetUrls single-pass batch (P-04)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    setActivePinia(createPinia());
    window.performanceTracker = { step: vi.fn() };
  });

  it('resolves multiple flags without delegating to getAssetUrl per flag', async () => {
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('DEV', '');

    const lib = await import('../../src/utils/assets/assetLibrary.js');
    const { clearAssetCaches, getAssetUrls, getAssetUrl } = lib;

    clearAssetCaches();

    const getAssetUrlSpy = vi.spyOn(lib, 'getAssetUrl');

    const urlMap = await getAssetUrls(['script.cognito', 'logo.main', 'nonexistent.flag']);

    expect(getAssetUrlSpy).not.toHaveBeenCalled();
    expect(urlMap['script.cognito']).toBe('/vendor/amazon-cognito-identity-6.3.15.min.js');
    expect(urlMap['logo.main']).toBe('https://i.ibb.co/jZQNHC2t/svgviewer-png-output-4.webp');
    expect(urlMap['nonexistent.flag']).toBeNull();

    getAssetUrlSpy.mockRestore();

    const single = await getAssetUrl('script.cognito');
    expect(single).toBe(urlMap['script.cognito']);
  });

  it('returns {} without throwing when flags is not an array (A-L02)', async () => {
    vi.stubEnv('PROD', 'true');

    const lib = await import('../../src/utils/assets/assetLibrary.js');
    const getAssetUrlSpy = vi.spyOn(lib, 'getAssetUrl');

    const result = await lib.getAssetUrls(undefined);

    expect(result).toEqual({});
    expect(getAssetUrlSpy).not.toHaveBeenCalled();

    getAssetUrlSpy.mockRestore();
  });
});
