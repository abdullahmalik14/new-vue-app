import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

describe('resolveAssetMapForEnvironment (L-07)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    setActivePinia(createPinia());
    window.performanceTracker = { step: vi.fn() };
  });

  it('getAssetsByCategory uses staging overrides and production inheritance', async () => {
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('DEV', '');

    const { clearAssetMapConfigCache, getAssetsByCategory } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );

    clearAssetMapConfigCache();
    const icons = await getAssetsByCategory('icon', 'staging');

    expect(icons['icon.cart']).toBe('/assets/icons/cart-staging.svg');
    expect(icons['icon.user']).toBe('https://cdn.example.com/assets/icons/user.svg');
  });

  it('getAvailableAssetFlags matches resolved category flag keys for staging', async () => {
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('DEV', '');

    const { clearAssetMapConfigCache, getAvailableAssetFlags, getAssetsByCategory } =
      await import('../../src/systems/assets/assetLibrary.js');

    clearAssetMapConfigCache();
    const flags = await getAvailableAssetFlags('staging');
    const icons = await getAssetsByCategory('icon', 'staging');

    expect(flags).toContain('icon.cart');
    expect(flags).toContain('icon.user');
    expect(flags).toContain('logo.main');
    expect(Object.keys(icons).sort()).toEqual(
      flags.filter((f) => f.startsWith('icon.')).sort(),
    );
  });

  it('development overrides production for the same flag', async () => {
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('DEV', '');

    const { clearAssetMapConfigCache, getAssetsByCategory } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );

    clearAssetMapConfigCache();
    const icons = await getAssetsByCategory('icon', 'development');

    expect(icons['icon.cart']).toBe('/assets/icons/cart-dev.svg');
  });
});
