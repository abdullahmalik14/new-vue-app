import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

describe('getAssetUrl resolution logging (B-04)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ENABLE_LOGGER', 'true');
    setActivePinia(createPinia());
    window.performanceTracker = { step: vi.fn() };
    vi.stubGlobal('window', {
      location: { origin: 'http://localhost:5173', hostname: 'localhost' },
    });
  });

  function getAssetUrlLogs(logSpy) {
    return logSpy.mock.calls.filter(
      (call) => call[0] === 'assetLibrary.js' && call[1] === 'getAssetUrl',
    );
  }

  it('emits one resolved log with global-map source on first lookup', async () => {
    const logModule = await import('../../src/utils/common/logHandler.js');
    const logSpy = vi.spyOn(logModule, 'log');

    const { clearAssetCaches, getAssetUrl } = await import('../../src/systems/assets/assetLibrary.js');

    clearAssetCaches();
    logSpy.mockClear();

    const url = await getAssetUrl('script.cognito', 'development');

    const getUrlLogs = getAssetUrlLogs(logSpy);
    const resolved = getUrlLogs.filter((call) => call[2] === 'resolved');
    const starts = getUrlLogs.filter((call) => call[2] === 'start');

    expect(url).toBe('/vendor/amazon-cognito-identity-6.3.15.min.js');
    expect(starts).toHaveLength(0);
    expect(resolved).toHaveLength(1);
    expect(resolved[0][4]).toMatchObject({
      flag: 'script.cognito',
      url,
      source: 'global-map',
      environment: 'development',
      section: null,
      cacheHit: false,
    });
  });

  it('emits resolved with section-map and cacheHit false for section override', async () => {
    const logModule = await import('../../src/utils/common/logHandler.js');
    const logSpy = vi.spyOn(logModule, 'log');

    const { clearAssetCaches, getAssetUrl } = await import('../../src/systems/assets/assetLibrary.js');

    clearAssetCaches();
    logSpy.mockClear();

    const url = await getAssetUrl('auth.background', {
      section: 'auth',
      environment: 'development',
    });

    const resolved = getAssetUrlLogs(logSpy).filter((call) => call[2] === 'resolved');

    expect(url).toBe('/assets/images/auth-section-override-dev.webp');
    expect(resolved).toHaveLength(1);
    expect(resolved[0][4]).toMatchObject({
      flag: 'auth.background',
      source: 'section-map',
      cacheHit: false,
      section: 'auth',
    });
  });

  it('emits resolved with cacheHit true on second lookup', async () => {
    const logModule = await import('../../src/utils/common/logHandler.js');
    const logSpy = vi.spyOn(logModule, 'log');

    const { clearAssetCaches, getAssetUrl } = await import('../../src/systems/assets/assetLibrary.js');

    clearAssetCaches();
    await getAssetUrl('logo.main', 'development');

    logSpy.mockClear();
    const url = await getAssetUrl('logo.main', 'development');

    const resolved = getAssetUrlLogs(logSpy).filter((call) => call[2] === 'resolved');

    expect(url).toBeTruthy();
    expect(resolved).toHaveLength(1);
    expect(resolved[0][4]).toMatchObject({
      flag: 'logo.main',
      url,
      source: 'global-cache',
      cacheHit: true,
    });
  });

  it('emits not-found for missing flag', async () => {
    const logModule = await import('../../src/utils/common/logHandler.js');
    const logSpy = vi.spyOn(logModule, 'log');

    const { clearAssetCaches, getAssetUrl } = await import('../../src/systems/assets/assetLibrary.js');

    clearAssetCaches();
    logSpy.mockClear();

    const url = await getAssetUrl('flag.that.does.not.exist', 'development');

    const misses = getAssetUrlLogs(logSpy).filter((call) => call[2] === 'not-found');

    expect(url).toBeNull();
    expect(misses).toHaveLength(1);
    expect(misses[0][4]).toMatchObject({
      flag: 'flag.that.does.not.exist',
      environment: 'development',
      section: null,
    });
  });
});
