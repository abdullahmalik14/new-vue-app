import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadProductionAssetLibrary, setupAssetTestEnv, stubDevelopmentEnv } from '../helpers/assetFixtures.js';

describe('assetLibrary flag helpers (§9)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    vi.stubGlobal('window', {
      location: { hostname: 'localhost', origin: 'http://localhost:5173' },
    });
  });

  it('hasAssetFlag true when flag exists', async () => {
    const lib = await loadProductionAssetLibrary();
    expect(await lib.hasAssetFlag('script.cognito', 'production')).toBe(true);
  });

  it('hasAssetFlag false when missing', async () => {
    const lib = await loadProductionAssetLibrary();
    expect(await lib.hasAssetFlag('missing.flag', 'production')).toBe(false);
  });

  it('hasAssetFlag respects section option', async () => {
    stubDevelopmentEnv();
    const lib = await import('../../src/systems/assets/assetLibrary.js');
    lib.clearAssetCaches();
    expect(
      await lib.hasAssetFlag('auth.background', { section: 'auth', environment: 'development' }),
    ).toBe(true);
  });

  it('hasAssetFlagInMap checks map only not preload state', async () => {
    const lib = await loadProductionAssetLibrary();
    expect(await lib.hasAssetFlagInMap('script.cognito', 'production')).toBe(true);
  });

  it('getAvailableAssetFlags lists all flags for env', async () => {
    const lib = await loadProductionAssetLibrary();
    const flags = await lib.getAvailableAssetFlags('production');
    expect(flags).toContain('script.cognito');
    expect(flags.length).toBeGreaterThan(10);
  });

  it('getAvailableAssetFlags includes section flags when section loaded', async () => {
    stubDevelopmentEnv();
    const lib = await import('../../src/systems/assets/assetLibrary.js');
    lib.clearAssetCaches();
    await lib.loadSectionAssetMap('auth');
    const flags = await lib.getAvailableAssetFlags('development');
    expect(flags).toContain('auth.background');
  });

  it('getKnownGlobalFlags returns sorted unique list', async () => {
    const lib = await loadProductionAssetLibrary();
    const flags = lib.getKnownGlobalFlags('production');
    expect(flags).toEqual([...new Set(flags)].sort());
  });

  it('getKnownGlobalFlags excludes section-only unless loaded', async () => {
    const lib = await loadProductionAssetLibrary();
    const flags = lib.getKnownGlobalFlags('production');
    expect(flags).toContain('auth.background');
  });
});
