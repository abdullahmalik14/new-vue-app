import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('assertAllowedPreloadUrl (S-03 / S-04)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubGlobal('window', {
      location: { origin: 'http://localhost:5173', hostname: 'localhost' },
    });
  });

  async function loadModule() {
    return import('../../src/systems/assets/assertAllowedPreloadUrl.js');
  }

  it('allows same-origin absolute URLs', async () => {
    const { assertAllowedPreloadUrl } = await loadModule();

    expect(
      assertAllowedPreloadUrl('http://localhost:5173/assets/app.js', { assetType: 'script' }),
    ).toEqual({
      ok: true,
      url: 'http://localhost:5173/assets/app.js',
      requiresIntegrity: false,
    });
  });

  it('allows relative /path URLs', async () => {
    const { assertAllowedPreloadUrl } = await loadModule();

    expect(assertAllowedPreloadUrl('/vendor/foo.js', { assetType: 'script' })).toEqual({
      ok: true,
      url: '/vendor/foo.js',
      requiresIntegrity: false,
    });
  });

  it('allows configured CDN origins', async () => {
    vi.stubEnv('VITE_ASSET_ALLOWED_HOSTS', 'cdn.example.com');
    const { assertAllowedPreloadUrl } = await loadModule();

    expect(assertAllowedPreloadUrl('https://cdn.example.com/pkg.js', { assetType: 'script' })).toEqual({
      ok: true,
      url: 'https://cdn.example.com/pkg.js',
      requiresIntegrity: false,
    });
  });

  it('allows trusted CDN URLs that include userinfo', async () => {
    vi.stubEnv('VITE_ASSET_ALLOWED_HOSTS', 'cdn.example.com');
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('DEV', '');
    const { assertAllowedPreloadUrl } = await loadModule();

    expect(
      assertAllowedPreloadUrl('https://user:pass@cdn.example.com/pkg.js', { assetType: 'script' }),
    ).toEqual({
      ok: true,
      url: 'https://user:pass@cdn.example.com/pkg.js',
      requiresIntegrity: true,
    });
  });

  it('rejects javascript: URLs', async () => {
    const { assertAllowedPreloadUrl } = await loadModule();

    expect(assertAllowedPreloadUrl('javascript:alert(1)', { assetType: 'script' })).toEqual({
      ok: false,
      reason: 'blocked-scheme',
    });
  });

  it('rejects unknown external origins without throwing', async () => {
    const { assertAllowedPreloadUrl } = await loadModule();

    expect(() => assertAllowedPreloadUrl('https://evil.example.com/payload.js', { assetType: 'script' })).not.toThrow();
    expect(assertAllowedPreloadUrl('https://evil.example.com/payload.js', { assetType: 'script' })).toEqual({
      ok: false,
      reason: 'host-not-allowed',
    });
  });

  it('rejects empty string URLs', async () => {
    const { assertAllowedPreloadUrl } = await loadModule();

    expect(assertAllowedPreloadUrl('', { assetType: 'script' })).toEqual({
      ok: false,
      reason: 'empty-url',
    });
  });

  it('rejects null and undefined URLs', async () => {
    const { assertAllowedPreloadUrl } = await loadModule();

    expect(assertAllowedPreloadUrl(null, { assetType: 'script' })).toEqual({
      ok: false,
      reason: 'empty-url',
    });
    expect(assertAllowedPreloadUrl(undefined, { assetType: 'script' })).toEqual({
      ok: false,
      reason: 'empty-url',
    });
  });

  it('trims whitespace around URLs', async () => {
    const { assertAllowedPreloadUrl } = await loadModule();

    expect(assertAllowedPreloadUrl('  /vendor/foo.js  ', { assetType: 'script' })).toEqual({
      ok: true,
      url: '/vendor/foo.js',
      requiresIntegrity: false,
    });
  });

  it('rejects subdomains of trusted CDNs', async () => {
    vi.stubEnv('VITE_ASSET_ALLOWED_HOSTS', 'cdn.example.com');
    const { assertAllowedPreloadUrl } = await loadModule();

    expect(
      assertAllowedPreloadUrl('https://sub.cdn.example.com/pkg.js', { assetType: 'script' }),
    ).toEqual({
      ok: false,
      reason: 'host-not-allowed',
    });
  });

  it('rejects external IP literals in production', async () => {
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('DEV', '');
    const { assertAllowedPreloadUrl } = await loadModule();

    expect(assertAllowedPreloadUrl('https://203.0.113.10/pkg.js', { assetType: 'script' })).toEqual({
      ok: false,
      reason: 'host-not-allowed',
    });
  });
});
