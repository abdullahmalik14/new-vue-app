import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadProductionAssetLibrary, setupAssetTestEnv } from '../helpers/assetFixtures.js';

describe('getAssetsByCategory (§13 category)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    vi.stubGlobal('window', {
      location: { hostname: 'localhost', origin: 'http://localhost:5173' },
    });
  });

  it('getAssetsByCategory filters by prefix', async () => {
    const lib = await loadProductionAssetLibrary();
    const icons = await lib.getAssetsByCategory('icon', 'staging');
    expect(Object.keys(icons).every((flag) => flag.startsWith('icon.'))).toBe(true);
    expect(icons['icon.cart']).toBe('/assets/icons/cart-staging.svg');
  });

  it('getAssetsByCategory [] for unknown category', async () => {
    const lib = await loadProductionAssetLibrary();
    const result = await lib.getAssetsByCategory('unknown-category-xyz', 'production');
    expect(result).toEqual({});
  });
});
