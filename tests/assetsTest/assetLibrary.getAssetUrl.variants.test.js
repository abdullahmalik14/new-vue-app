import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadProductionAssetLibrary, setupAssetTestEnv, stubDevelopmentEnv } from '../helpers/assetFixtures.js';

describe('getAssetUrlForCss / getAssetUrlForAttr (§7)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    vi.stubGlobal('window', {
      location: { hostname: 'localhost', origin: 'http://localhost:5173' },
    });
  });

  it('getAssetUrlForCss wraps URL in url(...) when needed', async () => {
    const lib = await loadProductionAssetLibrary();
    const css = await lib.getAssetUrlForCss('script.cognito', 'production');
    expect(css).toMatch(/^url\("/);
    expect(css).toContain('/vendor/amazon-cognito-identity-6.3.15.min.js');
  });

  it('getAssetUrlForCss leaves already-wrapped value unchanged', async () => {
    const lib = await loadProductionAssetLibrary();
    const css = await lib.getAssetUrlForCss('script.cognito', 'production');
    expect(css).not.toMatch(/^url\(url\(/);
  });

  it('getAssetUrlForCss null flag → null', async () => {
    const lib = await loadProductionAssetLibrary();
    expect(await lib.getAssetUrlForCss('', 'production')).toBeNull();
  });

  it('getAssetUrlForCss respects section options', async () => {
    stubDevelopmentEnv();
    const lib = await import('../../src/systems/assets/assetLibrary.js');
    lib.clearAssetCaches();
    const css = await lib.getAssetUrlForCss('auth.background', {
      section: 'auth',
      environment: 'development',
    });
    expect(css).toContain('/assets/images/auth-section-override-dev.webp');
  });

  it('getAssetUrlForAttr returns bare URL for attribute binding', async () => {
    const lib = await loadProductionAssetLibrary();
    const attr = await lib.getAssetUrlForAttr('script.cognito', 'production');
    expect(attr).toBe('/vendor/amazon-cognito-identity-6.3.15.min.js');
    expect(attr).not.toMatch(/^url\(/);
  });

  it('getAssetUrlForAttr null for missing flag', async () => {
    const lib = await loadProductionAssetLibrary();
    expect(await lib.getAssetUrlForAttr('flag.does.not.exist', 'production')).toBeNull();
  });

  it('getAssetUrlForAttr respects environment option', async () => {
    const lib = await loadProductionAssetLibrary();
    const staging = await lib.getAssetUrlForAttr('icon.cart', 'staging');
    expect(staging).toBe('/assets/icons/cart-staging.svg');
  });

  it('getAssetUrlForCss and getAssetUrlForAttr same underlying resolution', async () => {
    const lib = await loadProductionAssetLibrary();
    const attr = await lib.getAssetUrlForAttr('script.cognito', 'production');
    const css = await lib.getAssetUrlForCss('script.cognito', 'production');
    expect(css).toContain(attr);
  });
});
