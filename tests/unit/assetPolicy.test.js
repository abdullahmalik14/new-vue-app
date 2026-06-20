import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('assetPolicy.js (§96)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubGlobal('window', {
      location: { origin: 'http://localhost:5173', hostname: 'localhost' },
    });
  });

  it('assertAllowedAssetUrl allows legacy i.ibb.co host', async () => {
    const { assertAllowedAssetUrl } = await import('../../src/systems/assets/assetPolicy.js');
    expect(assertAllowedAssetUrl('https://i.ibb.co/example.webp', { assetType: 'image' }).ok).toBe(true);
  });

  it('assertAllowedAssetUrl rejects mistyped i.ibb.co.com host', async () => {
    const { assertAllowedAssetUrl } = await import('../../src/systems/assets/assetPolicy.js');
    expect(assertAllowedAssetUrl('https://i.ibb.co.com/example.webp', { assetType: 'image' })).toEqual({
      ok: false,
      reason: 'host-not-allowed',
    });
  });

  it('assertAllowedPreloadUrl is a deprecated alias of assertAllowedAssetUrl', async () => {
    const policy = await import('../../src/systems/assets/assetPolicy.js');
    expect(policy.assertAllowedPreloadUrl).toBe(policy.assertAllowedAssetUrl);
  });

  it('VITE_ASSET_ALLOWED_HOSTS merges into allowlist', async () => {
    vi.stubEnv('VITE_ASSET_ALLOWED_HOSTS', 'cdn.example.com');
    const { assertAllowedAssetUrl } = await import('../../src/systems/assets/assetPolicy.js');
    expect(assertAllowedAssetUrl('https://cdn.example.com/pkg.js', { assetType: 'script' }).ok).toBe(true);
  });

  it('re-exports validation helpers from policy barrel', async () => {
    const policy = await import('../../src/systems/assets/assetPolicy.js');
    expect(typeof policy.validateRouteAssetPreloadFlags).toBe('function');
    expect(typeof policy.validateAssetPreloadEntryShape).toBe('function');
    expect(policy.ALLOWED_ASSET_PRELOAD_TYPES.has('image')).toBe(true);
    expect(policy.ALLOWED_ASSET_PRELOAD_PRIORITIES.has('critical')).toBe(true);
  });
});
