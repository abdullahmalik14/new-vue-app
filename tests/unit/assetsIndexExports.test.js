import { describe, expect, it, vi } from 'vitest';

describe('assets index barrel (L-09)', () => {
  it('imports without missing assetInjector module', async () => {
    vi.resetModules();

    const assets = await import('../../src/systems/assets/index.js');

    expect(typeof assets.getAssetUrl).toBe('function');
    expect(typeof assets.loadAssetMapConfig).toBe('function');
    expect('AssetInjector' in assets).toBe(false);
  });
});
