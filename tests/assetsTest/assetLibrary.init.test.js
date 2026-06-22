import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  loadProductionAssetLibrary,
  setupAssetTestEnv,
  stubDevelopmentEnv,
} from '../helpers/assetFixtures.js';

async function loadLibraryWithBundledMap(map) {
  vi.doMock('../../src/systems/assets/assetMapSource.js', async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      getBundledAssetMap: () => structuredClone(map),
      shouldAllowRuntimeAssetMapFetch: () => false,
    };
  });
  vi.resetModules();
  stubProductionFromFixtures();
  const lib = await import('../../src/systems/assets/assetLibrary.js');
  lib.clearAssetMapConfigCache();
  lib.clearAssetCaches();
  return lib;
}

function stubProductionFromFixtures() {
  vi.stubEnv('PROD', 'true');
  vi.stubEnv('DEV', '');
  vi.stubEnv('MODE', 'production');
}

describe('initAssetLibrary / primeAssetIndex / validateAssetMap (§13)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    vi.stubGlobal('window', {
      location: { hostname: 'localhost', origin: 'http://localhost:5173' },
    });
    vi.doUnmock('../../src/systems/assets/assetMapSource.js');
  });

  it('initAssetLibrary sets initialized flag', async () => {
    const lib = await loadProductionAssetLibrary();
    await lib.initAssetLibrary();
    expect(lib.isAssetLibraryInitialized()).toBe(true);
  });

  it('initAssetLibrary idempotent', async () => {
    const lib = await loadProductionAssetLibrary();
    const first = await lib.initAssetLibrary();
    const second = await lib.initAssetLibrary();
    expect(second).toEqual(first);
  });

  it('initAssetLibrary rejects invalid map', async () => {
    const lib = await loadLibraryWithBundledMap({ production: {}, staging: {}, development: {} });
    const result = await lib.validateAssetMap();
    expect(result.valid).toBe(false);
  });

  it('isAssetLibraryInitialized false before init', async () => {
    const lib = await loadProductionAssetLibrary();
    const { resetAssetLibrary } = await import('../../src/systems/assets/resetAssetLibrary.js');
    resetAssetLibrary();
    expect(lib.isAssetLibraryInitialized()).toBe(false);
  });

  it('isAssetLibraryInitialized true after init', async () => {
    const lib = await loadProductionAssetLibrary();
    await lib.initAssetLibrary();
    expect(lib.isAssetLibraryInitialized()).toBe(true);
  });

  it('primeAssetIndex builds production index', async () => {
    const lib = await loadProductionAssetLibrary();
    const index = await lib.primeAssetIndex({ environment: 'production' });
    expect(index.flagCount).toBeGreaterThan(0);
  });

  it('primeAssetIndex builds section-scoped index', async () => {
    stubDevelopmentEnv();
    const lib = await import('../../src/systems/assets/assetLibrary.js');
    lib.clearAssetCaches();
    const index = await lib.primeAssetIndex({ environment: 'development', section: 'auth' });
    expect(index.flagCount).toBeGreaterThan(0);
  });

  it('primeAssetIndex cached on second call', async () => {
    const lib = await loadProductionAssetLibrary();
    const first = await lib.primeAssetIndex({ environment: 'production' });
    const second = await lib.primeAssetIndex({ environment: 'production' });
    expect(second).toEqual(first);
  });

  it('validateAssetMap accepts valid production map', async () => {
    const lib = await loadProductionAssetLibrary();
    const result = await lib.validateAssetMap();
    expect(result.valid).toBe(true);
  });

  it('validateAssetMap rejects non-object root', async () => {
    const lib = await loadLibraryWithBundledMap('invalid-root');
    const result = await lib.validateAssetMap();
    expect(result.valid).toBe(false);
  });

  it('validateAssetMap rejects missing production', async () => {
    const lib = await loadLibraryWithBundledMap({ staging: {}, development: {} });
    const result = await lib.validateAssetMap();
    expect(result.valid).toBe(false);
  });

  it('validateAssetMap rejects non-string URL leaf', async () => {
    const lib = await loadLibraryWithBundledMap({
      production: { 'audit.bad': 123 },
      staging: {},
      development: {},
    });
    const result = await lib.validateAssetMap();
    expect(result.valid).toBe(false);
  });

  it('validateAssetMap aggregates all errors', async () => {
    const lib = await loadLibraryWithBundledMap({
      production: { 'audit.bad1': 1, 'audit.bad2': 2 },
      staging: {},
      development: {},
    });
    const result = await lib.validateAssetMap();
    expect(result.errors.length).toBeGreaterThan(1);
  });

  it('validateAssetMap allows sparse staging', async () => {
    const lib = await loadProductionAssetLibrary();
    const result = await lib.validateAssetMap();
    expect(result.errors.some((error) => error.includes('staging'))).toBe(false);
  });
});
