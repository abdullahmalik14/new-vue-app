import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('assertAllowedPreloadUrl (S-03 / S-04)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubGlobal('window', {
      location: { origin: 'http://localhost:5173', hostname: 'localhost' },
    });
  });

  it('allows same-origin relative paths', async () => {
    const { assertAllowedPreloadUrl } = await import(
      '../../src/systems/assets/assertAllowedPreloadUrl.js'
    );
    expect(assertAllowedPreloadUrl('/vendor/foo.js', { assetType: 'script' })).toEqual({
      ok: true,
      url: '/vendor/foo.js',
      requiresIntegrity: false,
    });
  });

  it('blocks javascript: scheme', async () => {
    const { assertAllowedPreloadUrl } = await import(
      '../../src/systems/assets/assertAllowedPreloadUrl.js'
    );
    expect(assertAllowedPreloadUrl('javascript:alert(1)', { assetType: 'script' })).toEqual({
      ok: false,
      reason: 'blocked-scheme',
    });
  });

  it('blocks hosts not on allowlist in production', async () => {
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('DEV', '');
    const { assertAllowedPreloadUrl } = await import(
      '../../src/systems/assets/assertAllowedPreloadUrl.js'
    );
    expect(
      assertAllowedPreloadUrl('https://evil.example.com/payload.js', { assetType: 'script' }),
    ).toEqual({ ok: false, reason: 'host-not-allowed' });
  });

  it('requires integrity for external https scripts in production', async () => {
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('DEV', '');
    vi.stubEnv('VITE_ASSET_ALLOWED_HOSTS', 'cdn.example.com');
    const { assertAllowedPreloadUrl } = await import(
      '../../src/systems/assets/assertAllowedPreloadUrl.js'
    );
    expect(
      assertAllowedPreloadUrl('https://cdn.example.com/pkg.js', { assetType: 'script' }),
    ).toEqual({
      ok: true,
      url: 'https://cdn.example.com/pkg.js',
      requiresIntegrity: true,
    });
  });
});
