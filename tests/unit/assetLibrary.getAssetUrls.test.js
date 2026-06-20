import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadProductionAssetLibrary, setupAssetTestEnv } from '../helpers/assetFixtures.js';

describe('getAssetUrls / preloadAssetUrls (§8)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    vi.stubGlobal('window', {
      location: { hostname: 'localhost', origin: 'http://localhost:5173' },
    });
  });

  it('getAssetUrls [] → {}', async () => {
    const lib = await loadProductionAssetLibrary();
    expect(await lib.getAssetUrls([], 'production')).toEqual({});
  });

  it('getAssetUrls single flag → one key', async () => {
    const lib = await loadProductionAssetLibrary();
    const urls = await lib.getAssetUrls(['script.cognito'], 'production');
    expect(Object.keys(urls)).toEqual(['script.cognito']);
  });

  it('getAssetUrls multiple flags → all keys', async () => {
    const lib = await loadProductionAssetLibrary();
    const urls = await lib.getAssetUrls(['script.cognito', 'icon.cart'], 'production');
    expect(Object.keys(urls).sort()).toEqual(['icon.cart', 'script.cognito']);
  });

  it('getAssetUrls null for missing flags', async () => {
    const lib = await loadProductionAssetLibrary();
    const urls = await lib.getAssetUrls(['missing.flag.xyz'], 'production');
    expect(urls['missing.flag.xyz']).toBeNull();
  });

  it('getAssetUrls dedupes input flags', async () => {
    const lib = await loadProductionAssetLibrary();
    const urls = await lib.getAssetUrls(['icon.cart', 'icon.cart'], 'production');
    expect(Object.keys(urls)).toEqual(['icon.cart']);
  });

  it('getAssetUrls accepts section options', async () => {
    const lib = await loadProductionAssetLibrary();
    const urls = await lib.getAssetUrls(['script.cognito'], { section: 'auth', environment: 'production' });
    expect(urls['script.cognito']).toBe('/vendor/amazon-cognito-identity-6.3.15.min.js');
  });

  it('getAssetUrls single map load for batch', async () => {
    const lib = await loadProductionAssetLibrary();
    const loadSpy = vi.spyOn(lib, 'loadAssetMapConfig');
    await lib.getAssetUrls(['icon.cart', 'icon.user'], 'production');
    expect(loadSpy.mock.calls.length).toBeLessThanOrEqual(1);
    loadSpy.mockRestore();
  });

  it('getAssetUrls 100+ flags completes under threshold', async () => {
    const lib = await loadProductionAssetLibrary();
    const flags = Array.from({ length: 120 }, (_, index) => `icon.cart.${index}`);
    flags.push('script.cognito');
    const start = performance.now();
    await lib.getAssetUrls(flags, 'production');
    expect(performance.now() - start).toBeLessThan(5000);
  });

  it('preloadAssetUrls preloads resolved URLs', async () => {
    const lib = await loadProductionAssetLibrary();
    const count = await lib.preloadAssetUrls(['script.cognito'], 'production');
    expect(count).toBeGreaterThan(0);
  });

  it('preloadAssetUrls skips already preloaded', async () => {
    const lib = await loadProductionAssetLibrary();
    await lib.preloadAssetUrls(['script.cognito'], 'production');
    const second = await lib.preloadAssetUrls(['script.cognito'], 'production');
    expect(second).toBeGreaterThanOrEqual(0);
  });

  it('preloadAssetUrls empty array no-op', async () => {
    const lib = await loadProductionAssetLibrary();
    expect(await lib.preloadAssetUrls([], 'production')).toBe(0);
  });
});
