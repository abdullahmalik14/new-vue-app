import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  loadProductionAssetLibrary,
  setupAssetTestEnv,
  stubDevelopmentEnv,
  stubProductionEnv,
} from '../helpers/assetFixtures.js';

describe('setEnvironment / getEnvironment (§4)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    vi.stubGlobal('window', {
      location: { hostname: 'localhost', origin: 'http://localhost:5173' },
    });
  });

  it('getEnvironment defaults to production in unit test MODE', async () => {
    stubProductionEnv();
    const { getEnvironment } = await import('../../src/systems/assets/assetLibrary.js');
    expect(getEnvironment()).toBe('production');
  });

  it('setEnvironment(staging) updates getEnvironment', async () => {
    stubDevelopmentEnv();
    const { setEnvironment, getEnvironment } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    setEnvironment('staging');
    expect(getEnvironment()).toBe('staging');
  });

  it('setEnvironment rejects unknown environment', async () => {
    const { setEnvironment, getEnvironment } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    stubDevelopmentEnv();
    setEnvironment('qa');
    expect(getEnvironment()).toBe('development');
  });

  it('setEnvironment idempotent when same value twice', async () => {
    const { setEnvironment, getEnvironment } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    setEnvironment('production');
    setEnvironment('production');
    expect(getEnvironment()).toBe('production');
  });

  it('setEnvironment clears URL cache when env changes', async () => {
    const { setValueWithExpiration, getValueFromCache } = await import(
      '../../src/infrastructure/cache/cacheHandler.js',
    );
    const { setEnvironment } = await import('../../src/systems/assets/assetLibrary.js');
    setValueWithExpiration('asset_url_g_production_icon.cart', 'https://stale.example/a.svg', 60_000);
    setEnvironment('staging');
    expect(getValueFromCache('asset_url_g_production_icon.cart')).toBeNull();
  });

  it('concurrent setEnvironment last-write-wins', async () => {
    const { setEnvironment, getEnvironment } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    setEnvironment('staging');
    setEnvironment('production');
    expect(getEnvironment()).toBe('production');
  });
});

describe('getAssetMapFetchCandidates / config source / cache (§4b)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
  });

  it('getAssetMapFetchCandidates returns non-empty URL list', async () => {
    stubDevelopmentEnv();
    const { getAssetMapFetchCandidates } = await import('../../src/systems/assets/assetLibrary.js');
    expect(getAssetMapFetchCandidates().length).toBeGreaterThan(0);
  });

  it('getAssetMapFetchCandidates respects env base URL', async () => {
    stubDevelopmentEnv();
    vi.stubEnv('VITE_ASSET_MAP_URL', '/config/assetMap.staging.json');
    const { getAssetMapFetchCandidates } = await import('../../src/systems/assets/assetLibrary.js');
    expect(getAssetMapFetchCandidates()[0]).toBe('/config/assetMap.staging.json');
  });

  it('getAssetMapConfigSource returns bundled vs network source label', async () => {
    const lib = await loadProductionAssetLibrary();
    expect(lib.getAssetMapConfigSource()).toBe('bundled-production');
  });

  it('clearAssetMapConfigCache forces reload on next loadAssetMapConfig', async () => {
    const lib = await loadProductionAssetLibrary();
    const first = await lib.loadAssetMapConfig();
    lib.clearAssetMapConfigCache();
    const second = await lib.loadAssetMapConfig();
    expect(second).toEqual(first);
    expect(second).not.toBe(first);
  });

  it('clearAssetMapConfigCache clears URL resolution cache', async () => {
    const lib = await loadProductionAssetLibrary();
    await lib.getAssetUrl('script.cognito', 'production');
    const { getValueFromCache } = await import('../../src/infrastructure/cache/cacheHandler.js');
    expect(getValueFromCache('asset_url_g_production_script.cognito')).toBeTruthy();
    lib.clearAssetMapConfigCache();
    expect(getValueFromCache('asset_url_g_production_script.cognito')).toBeNull();
  });
});
