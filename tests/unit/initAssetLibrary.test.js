import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

describe('initAssetLibrary (P-01)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    setActivePinia(createPinia());
    window.performanceTracker = { step: vi.fn() };
  });

  it('loads map and warms URL cache before first getAssetUrl', async () => {
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('DEV', '');

    const {
      initAssetLibrary,
      getKnownGlobalFlags,
      getAssetUrl,
      isAssetLibraryInitialized,
      getAssetMapConfigSource,
    } = await import('../../src/utils/assets/assetLibrary.js');

    const initResult = await initAssetLibrary();

    expect(isAssetLibraryInitialized()).toBe(true);
    expect(getAssetMapConfigSource()).toBe('bundled-production');
    expect(initResult.flagCount).toBeGreaterThan(0);
    expect(initResult.warmedCount).toBeGreaterThan(0);
    expect(initResult.warmedCount).toBeLessThanOrEqual(initResult.flagCount);
    expect(getKnownGlobalFlags()).toContain('script.cognito');

    const url = await getAssetUrl('script.cognito');
    expect(url).toBe('/vendor/amazon-cognito-identity-6.3.15.min.js');
  });

  it('dedupes concurrent initAssetLibrary calls', async () => {
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('DEV', '');

    const { initAssetLibrary, clearAssetCaches } = await import(
      '../../src/utils/assets/assetLibrary.js',
    );

    clearAssetCaches();

    const [a, b] = await Promise.all([initAssetLibrary(), initAssetLibrary()]);

    expect(a).toEqual(b);
    expect(a.warmedCount).toBeGreaterThan(0);
  });
});
