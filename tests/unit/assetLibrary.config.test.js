import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  loadProductionAssetLibrary,
  setupAssetTestEnv,
  stubDevelopmentEnv,
  stubProductionEnv,
} from '../helpers/assetFixtures.js';

describe('loadAssetMapConfig / loadSectionAssetMap (§5)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    vi.stubGlobal('window', {
      location: { hostname: 'localhost', origin: 'http://localhost:5173' },
    });
  });

  it('loadAssetMapConfig loads global map', async () => {
    const lib = await loadProductionAssetLibrary();
    const map = await lib.loadAssetMapConfig();
    expect(map.production?.['script.cognito']).toBe('/vendor/amazon-cognito-identity-6.3.15.min.js');
  });

  it('loadAssetMapConfig second call uses cache', async () => {
    const lib = await loadProductionAssetLibrary();
    const first = await lib.loadAssetMapConfig();
    const second = await lib.loadAssetMapConfig();
    expect(second).toStrictEqual(first);
    expect(second).not.toBe(first);
  });

  it('loadSectionAssetMap null for invalid section', async () => {
    const lib = await loadProductionAssetLibrary();
    expect(await lib.loadSectionAssetMap('invalid!')).toBeNull();
  });

  it('loadSectionAssetMap null on 404', async () => {
    stubDevelopmentEnv();
    vi.stubEnv('VITE_ASSET_MAP_RUNTIME_OVERRIDE', 'true');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => '',
    });
    vi.doMock('../../src/systems/assets/sectionAssetMapSource.js', async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        getBundledSectionAssetMap: () => null,
      };
    });
    vi.resetModules();
    const { loadSectionAssetMap } = await import('../../src/systems/assets/assetLibrary.js');
    expect(await loadSectionAssetMap('checkout')).toBeNull();
    fetchSpy.mockRestore();
    vi.doUnmock('../../src/systems/assets/sectionAssetMapSource.js');
  });

  it('loadSectionAssetMap caches in memory', async () => {
    stubDevelopmentEnv();
    const lib = await import('../../src/systems/assets/assetLibrary.js');
    lib.clearAssetCaches();
    const first = await lib.loadSectionAssetMap('auth');
    const second = await lib.loadSectionAssetMap('auth');
    expect(second).toBe(first);
  });

  it('loadSectionAssetMap second call skips fetch', async () => {
    stubDevelopmentEnv();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const lib = await import('../../src/systems/assets/assetLibrary.js');
    lib.clearAssetCaches();
    await lib.loadSectionAssetMap('auth');
    await lib.loadSectionAssetMap('auth');
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('loadSectionAssetMap trims section name', async () => {
    stubDevelopmentEnv();
    const lib = await import('../../src/systems/assets/assetLibrary.js');
    lib.clearAssetCaches();
    const map = await lib.loadSectionAssetMap(' auth ');
    expect(map?.development?.['auth.background']).toBe('/assets/images/auth-section-override-dev.webp');
  });

  it('global and section maps do not cross-contaminate', async () => {
    stubDevelopmentEnv();
    const lib = await import('../../src/systems/assets/assetLibrary.js');
    lib.clearAssetCaches();
    const globalMap = await lib.loadAssetMapConfig();
    const sectionMap = await lib.loadSectionAssetMap('auth');
    expect(globalMap.production['auth.background']).toBe('https://i.ibb.co/jPw7ChWb/auth-bg.webp');
    expect(sectionMap.development['auth.background']).toBe('/assets/images/auth-section-override-dev.webp');
  });
});
