import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

describe('section asset map merge (B-01)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    setActivePinia(createPinia());
    window.performanceTracker = { step: vi.fn() };
    vi.stubGlobal('window', {
      location: { origin: 'http://localhost:5173', hostname: 'localhost' },
    });
  });

  it('section map overrides global flag for getAssetUrl', async () => {
    vi.stubEnv('DEV', 'true');

    const {
      clearAssetMapConfigCache,
      clearAssetCaches,
      getAssetUrl,
      loadSectionAssetMap,
      getKnownBundledSectionNames,
    } = await import('../../src/systems/assets/assetLibrary.js');

    clearAssetCaches();
    expect(getKnownBundledSectionNames()).toContain('auth');

    const sectionMap = await loadSectionAssetMap('auth');
    expect(sectionMap?.development?.['auth.background']).toBe(
      '/assets/images/auth-section-override-dev.webp',
    );

    const globalOnly = await getAssetUrl('auth.background', 'development');
    const withSection = await getAssetUrl('auth.background', {
      section: 'auth',
      environment: 'development',
    });

    expect(globalOnly).toBe('https://i.ibb.co/jPw7ChWb/auth-bg.webp');
    expect(withSection).toBe('/assets/images/auth-section-override-dev.webp');
    expect(withSection).not.toBe(globalOnly);
  });

  it('unknown section falls back to global only', async () => {
    vi.stubEnv('DEV', 'true');

    const { clearAssetCaches, getAssetUrl, loadSectionAssetMap } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );

    clearAssetCaches();
    const missing = await loadSectionAssetMap('nonexistent-section-xyz');
    expect(missing).toBeNull();

    const url = await getAssetUrl('script.cognito', {
      section: 'nonexistent-section-xyz',
      environment: 'development',
    });

    expect(url).toBe('/vendor/amazon-cognito-identity-6.3.15.min.js');
  });

  it('caches resolved URLs per section scope', async () => {
    vi.stubEnv('DEV', 'true');

    const { clearAssetCaches, getAssetUrl } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    const { getValueFromCache } = await import('../../src/utils/common/cacheHandler.js');

    clearAssetCaches();

    await getAssetUrl('auth.background', { section: 'auth', environment: 'development' });
    await getAssetUrl('auth.background', 'development');

    const sectionCached = getValueFromCache('asset_url_s_auth_development_auth.background');
    const globalCached = getValueFromCache('asset_url_g_development_auth.background');

    expect(sectionCached).toBe('/assets/images/auth-section-override-dev.webp');
    expect(globalCached).toBe('https://i.ibb.co/jPw7ChWb/auth-bg.webp');
    expect(sectionCached).not.toBe(globalCached);
  });
});
