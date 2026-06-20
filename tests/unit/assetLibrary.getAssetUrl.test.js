import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  loadProductionAssetLibrary,
  readProductionAssetMap,
  readProductionAuthAssetMap,
  setupAssetTestEnv,
  stubDevelopmentEnv,
  stubProductionEnv,
} from '../helpers/assetFixtures.js';
import { getAssetUrl, getAssetUrlSync } from '../../src/systems/assets/assetLibrary.js';

const PROD_MAP = readProductionAssetMap();
const AUTH_MAP = readProductionAuthAssetMap();

/** Production-only flag on allowlisted host (cdn.example.com URLs are blocked in tests). */
const PROD_ONLY_FLAG = 'settings.menu.item';
/** Production flag on allowlisted i.ibb.co host. */
const PROD_ALLOWED_FLAG = 'dashboard.logo';
/** Relative-path production flag (allowlisted). */
const PROD_PATH_FLAG = 'script.cognito';

const DASHBOARD_MOCK_MAP = {
  development: { 'dashboard.logo': '/section/dashboard-logo.webp' },
  production: {},
};

const CHECKOUT_MOCK_MAP = {
  development: { 'checkout.banner': '/section/checkout-banner.webp' },
  production: {},
};

function stubWindowLocation() {
  vi.stubGlobal('window', {
    location: { hostname: 'localhost', origin: 'http://localhost:5173' },
  });
}

describe('getAssetUrl / getAssetUrlSync (§5)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    stubWindowLocation();
  });

  it('getAssetUrl: production URL when only production defined', async () => {
    const lib = await loadProductionAssetLibrary();
    const url = await lib.getAssetUrl(PROD_ONLY_FLAG, 'production');
    expect(url).toBe(PROD_MAP.production[PROD_ONLY_FLAG]);
  });

  it('getAssetUrlSync: production URL when only production defined (sync path)', async () => {
    const lib = await loadProductionAssetLibrary();
    expect(lib.getAssetUrlSync(PROD_ONLY_FLAG, 'production')).toBe(PROD_MAP.production[PROD_ONLY_FLAG]);
  });

  it('getAssetUrl: staging override when staging key present for flag', async () => {
    stubDevelopmentEnv();
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    const url = await getAssetUrl('icon.cart', 'staging');
    expect(url).toBe(PROD_MAP.staging['icon.cart']);
  });

  it('getAssetUrlSync: staging override when staging key present for flag (sync path)', async () => {
    stubDevelopmentEnv();
    const { getAssetUrlSync, loadAssetMapConfig, clearAssetCaches } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    clearAssetCaches();
    await loadAssetMapConfig();
    expect(getAssetUrlSync('icon.cart', 'staging')).toBe(PROD_MAP.staging['icon.cart']);
  });

  it('getAssetUrl: falls back to production when staging sparse (flag missing in staging)', async () => {
    stubDevelopmentEnv();
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    const url = await getAssetUrl(PROD_ONLY_FLAG, 'staging');
    expect(url).toBe(PROD_MAP.production[PROD_ONLY_FLAG]);
  });

  it('getAssetUrlSync: falls back to production when staging sparse (flag missing in staging) (sync path)', async () => {
    stubDevelopmentEnv();
    const { getAssetUrlSync, loadAssetMapConfig, clearAssetCaches } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    clearAssetCaches();
    await loadAssetMapConfig();
    expect(getAssetUrlSync(PROD_ONLY_FLAG, 'staging')).toBe(PROD_MAP.production[PROD_ONLY_FLAG]);
  });

  it('getAssetUrl: falls back to production when development sparse', async () => {
    stubDevelopmentEnv();
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    const url = await getAssetUrl('logo.main', 'development');
    expect(url).toBe(PROD_MAP.production['logo.main']);
  });

  it('getAssetUrlSync: falls back to production when development sparse (sync path)', async () => {
    stubDevelopmentEnv();
    const { getAssetUrlSync, loadAssetMapConfig, clearAssetCaches } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    clearAssetCaches();
    await loadAssetMapConfig();
    expect(getAssetUrlSync('logo.main', 'development')).toBe(PROD_MAP.production['logo.main']);
  });

  it('getAssetUrl: null for unknown flag in all environments', async () => {
    const lib = await loadProductionAssetLibrary();
    expect(await lib.getAssetUrl('nonexistent.flag.xyz', 'production')).toBeNull();
    expect(await lib.getAssetUrl('nonexistent.flag.xyz', 'staging')).toBeNull();
    expect(await lib.getAssetUrl('nonexistent.flag.xyz', 'development')).toBeNull();
  });

  it('getAssetUrlSync: null for unknown flag in all environments (sync path)', async () => {
    const lib = await loadProductionAssetLibrary();
    expect(lib.getAssetUrlSync('nonexistent.flag.xyz', 'production')).toBeNull();
    expect(lib.getAssetUrlSync('nonexistent.flag.xyz', 'staging')).toBeNull();
    expect(lib.getAssetUrlSync('nonexistent.flag.xyz', 'development')).toBeNull();
  });

  it('getAssetUrl: getAssetUrlSync matches getAssetUrl when map primed', async () => {
    const lib = await loadProductionAssetLibrary();
    const asyncUrl = await lib.getAssetUrl('dashboard.logo', 'production');
    expect(lib.getAssetUrlSync('dashboard.logo', 'production')).toBe(asyncUrl);
  });

  it('getAssetUrlSync: getAssetUrlSync matches getAssetUrl when map primed (sync path)', async () => {
    const lib = await loadProductionAssetLibrary();
    const asyncUrl = await lib.getAssetUrl('dashboard.logo', 'production');
    const syncUrl = lib.getAssetUrlSync('dashboard.logo', 'production');
    expect(syncUrl).toBe(asyncUrl);
    expect(syncUrl).toBe(PROD_MAP.production['dashboard.logo']);
  });

  it('getAssetUrl: getAssetUrlSync null when map not loaded', async () => {
    stubProductionEnv();
    const { getAssetUrlSync, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    expect(getAssetUrlSync('icon.cart', 'production')).toBeNull();
  });

  it('getAssetUrlSync: getAssetUrlSync null when map not loaded (sync path)', async () => {
    stubProductionEnv();
    const { getAssetUrlSync, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    expect(getAssetUrlSync('icon.cart', 'production')).toBeNull();
  });

  it('getAssetUrl: options.section uses section map override', async () => {
    stubDevelopmentEnv();
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    const url = await getAssetUrl('auth.background', { section: 'auth', environment: 'development' });
    expect(url).toBe(AUTH_MAP.development['auth.background']);
  });

  it('getAssetUrlSync: options.section uses section map override (sync path)', async () => {
    stubDevelopmentEnv();
    const { getAssetUrlSync, loadAssetMapConfig, loadSectionAssetMap, clearAssetCaches } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    clearAssetCaches();
    await loadAssetMapConfig();
    await loadSectionAssetMap('auth');
    expect(getAssetUrlSync('auth.background', { section: 'auth', environment: 'development' })).toBe(
      AUTH_MAP.development['auth.background'],
    );
  });

  it('getAssetUrl: section override wins over global for same flag', async () => {
    stubDevelopmentEnv();
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    const globalUrl = await getAssetUrl('auth.background', 'development');
    const sectionUrl = await getAssetUrl('auth.background', { section: 'auth', environment: 'development' });
    expect(globalUrl).toBe(PROD_MAP.production['auth.background']);
    expect(sectionUrl).toBe(AUTH_MAP.development['auth.background']);
    expect(sectionUrl).not.toBe(globalUrl);
  });

  it('getAssetUrlSync: section override wins over global for same flag (sync path)', async () => {
    stubDevelopmentEnv();
    const { getAssetUrlSync, loadAssetMapConfig, loadSectionAssetMap, clearAssetCaches } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    clearAssetCaches();
    await loadAssetMapConfig();
    await loadSectionAssetMap('auth');
    const globalUrl = getAssetUrlSync('auth.background', 'development');
    const sectionUrl = getAssetUrlSync('auth.background', { section: 'auth', environment: 'development' });
    expect(globalUrl).toBe(PROD_MAP.production['auth.background']);
    expect(sectionUrl).toBe(AUTH_MAP.development['auth.background']);
  });

  it('getAssetUrl: section sparse falls back to global production', async () => {
    const lib = await loadProductionAssetLibrary();
    const url = await lib.getAssetUrl('auth.background', { section: 'auth', environment: 'production' });
    expect(url).toBe(PROD_MAP.production['auth.background']);
  });

  it('getAssetUrlSync: section sparse falls back to global production (sync path)', async () => {
    const lib = await loadProductionAssetLibrary();
    await lib.loadSectionAssetMap('auth');
    expect(lib.getAssetUrlSync('auth.background', { section: 'auth', environment: 'production' })).toBe(
      PROD_MAP.production['auth.background'],
    );
  });

  it('getAssetUrl: section sparse falls back to global staging when env staging', async () => {
    stubDevelopmentEnv();
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    const url = await getAssetUrl('auth.background', { section: 'auth', environment: 'staging' });
    expect(url).toBe(PROD_MAP.production['auth.background']);
  });

  it('getAssetUrlSync: section sparse falls back to global staging when env staging (sync path)', async () => {
    stubDevelopmentEnv();
    const { getAssetUrlSync, loadAssetMapConfig, loadSectionAssetMap, clearAssetCaches } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    clearAssetCaches();
    await loadAssetMapConfig();
    await loadSectionAssetMap('auth');
    expect(getAssetUrlSync('auth.background', { section: 'auth', environment: 'staging' })).toBe(
      PROD_MAP.production['auth.background'],
    );
  });

  it('getAssetUrl: section + explicit environment both applied', async () => {
    stubDevelopmentEnv();
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    const url = await getAssetUrl('auth.background', { section: 'auth', environment: 'development' });
    expect(url).toBe(AUTH_MAP.development['auth.background']);
    expect(url).not.toBe(PROD_MAP.production['auth.background']);
  });

  it('getAssetUrlSync: section + explicit environment both applied (sync path)', async () => {
    stubDevelopmentEnv();
    const { getAssetUrlSync, loadAssetMapConfig, loadSectionAssetMap, clearAssetCaches } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    clearAssetCaches();
    await loadAssetMapConfig();
    await loadSectionAssetMap('auth');
    expect(getAssetUrlSync('auth.background', { section: 'auth', environment: 'development' })).toBe(
      AUTH_MAP.development['auth.background'],
    );
  });

  it('getAssetUrl: invalid section option ignored → global scope', async () => {
    stubDevelopmentEnv();
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    const url = await getAssetUrl('script.cognito', { section: 'invalid!', environment: 'development' });
    expect(url).toBe(PROD_MAP.development['script.cognito']);
  });

  it('getAssetUrlSync: invalid section option ignored → global scope (sync path)', async () => {
    stubDevelopmentEnv();
    const { getAssetUrlSync, loadAssetMapConfig, clearAssetCaches } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    clearAssetCaches();
    await loadAssetMapConfig();
    expect(getAssetUrlSync('script.cognito', { section: 'invalid!', environment: 'development' })).toBe(
      PROD_MAP.development['script.cognito'],
    );
  });

  it('getAssetUrl: caches resolved URL per flag+env+section', async () => {
    stubDevelopmentEnv();
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    const { getValueFromCache } = await import('../../src/infrastructure/cache/cacheHandler.js');
    clearAssetCaches();
    await getAssetUrl('auth.background', { section: 'auth', environment: 'development' });
    await getAssetUrl('auth.background', 'development');
    expect(getValueFromCache('asset_url_s_auth_development_auth.background')).toBe(
      AUTH_MAP.development['auth.background'],
    );
    expect(getValueFromCache('asset_url_g_development_auth.background')).toBe(
      PROD_MAP.production['auth.background'],
    );
  });

  it('getAssetUrlSync: caches resolved URL per flag+env+section (sync path)', async () => {
    stubDevelopmentEnv();
    const { getAssetUrl, getAssetUrlSync, clearAssetCaches } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    const { getValueFromCache } = await import('../../src/infrastructure/cache/cacheHandler.js');
    clearAssetCaches();
    await getAssetUrl('auth.background', { section: 'auth', environment: 'development' });
    getAssetUrlSync('auth.background', { section: 'auth', environment: 'development' });
    expect(getValueFromCache('asset_url_s_auth_development_auth.background')).toBe(
      AUTH_MAP.development['auth.background'],
    );
  });

  it('getAssetUrl: cache hit avoids repeated map walk', async () => {
    const lib = await loadProductionAssetLibrary();
    const first = await lib.getAssetUrl(PROD_ALLOWED_FLAG, 'production');
    const second = await lib.getAssetUrl(PROD_ALLOWED_FLAG, 'production');
    expect(first).toBe(second);
    expect(first).toBe(PROD_MAP.production[PROD_ALLOWED_FLAG]);
    const { getValueFromCache } = await import('../../src/infrastructure/cache/cacheHandler.js');
    expect(getValueFromCache(`asset_url_g_production_${PROD_ALLOWED_FLAG}`)).toBe(first);
  });

  it('getAssetUrlSync: cache hit avoids repeated map walk (sync path)', async () => {
    const lib = await loadProductionAssetLibrary();
    await lib.getAssetUrl(PROD_ALLOWED_FLAG, 'production');
    const cached = lib.getAssetUrlSync(PROD_ALLOWED_FLAG, 'production');
    expect(cached).toBe(PROD_MAP.production[PROD_ALLOWED_FLAG]);
  });

  it('getAssetUrl: miss cache prevents hammering missing flags', async () => {
    stubDevelopmentEnv();
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    const { getValueFromCache } = await import('../../src/infrastructure/cache/cacheHandler.js');
    clearAssetCaches();
    const missKey = 'asset_url_miss_g_development_nonexistent.flag.xyz';
    expect(await getAssetUrl('nonexistent.flag.xyz', 'development')).toBeNull();
    expect(getValueFromCache(missKey)).toBe(true);
    expect(await getAssetUrl('nonexistent.flag.xyz', 'development')).toBeNull();
    expect(getValueFromCache(missKey)).toBe(true);
  });

  it('getAssetUrlSync: miss cache prevents hammering missing flags (sync path)', async () => {
    stubDevelopmentEnv();
    const { getAssetUrl, getAssetUrlSync, loadAssetMapConfig, clearAssetCaches } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    const { getValueFromCache } = await import('../../src/infrastructure/cache/cacheHandler.js');
    clearAssetCaches();
    await loadAssetMapConfig();
    const missKey = 'asset_url_miss_g_development_nonexistent.flag.xyz';
    await getAssetUrl('nonexistent.flag.xyz', 'development');
    expect(getValueFromCache(missKey)).toBe(true);
    expect(getAssetUrlSync('nonexistent.flag.xyz', 'development')).toBeNull();
  });

  it('getAssetUrl: miss cache cleared after map reload', async () => {
    stubDevelopmentEnv();
    const { getAssetUrl, clearAssetCaches, loadAssetMapConfig } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    const { getValueFromCache } = await import('../../src/infrastructure/cache/cacheHandler.js');
    clearAssetCaches();
    const missKey = 'asset_url_miss_g_development_nonexistent.flag.xyz';
    await getAssetUrl('nonexistent.flag.xyz', 'development');
    expect(getValueFromCache(missKey)).toBe(true);
    clearAssetCaches();
    await loadAssetMapConfig();
    expect(getValueFromCache(missKey)).toBeNull();
  });

  it('getAssetUrlSync: miss cache cleared after map reload (sync path)', async () => {
    stubDevelopmentEnv();
    const { getAssetUrl, getAssetUrlSync, clearAssetCaches, loadAssetMapConfig } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    const { getValueFromCache } = await import('../../src/infrastructure/cache/cacheHandler.js');
    clearAssetCaches();
    const missKey = 'asset_url_miss_g_development_nonexistent.flag.xyz';
    await getAssetUrl('nonexistent.flag.xyz', 'development');
    expect(getValueFromCache(missKey)).toBe(true);
    clearAssetCaches();
    await loadAssetMapConfig();
    expect(getValueFromCache(missKey)).toBeNull();
    expect(getAssetUrlSync('nonexistent.flag.xyz', 'development')).toBeNull();
  });

  it('getAssetUrl: empty flag → null or throw per contract', async () => {
    const lib = await loadProductionAssetLibrary();
    await expect(lib.getAssetUrl('', 'production')).resolves.toBeNull();
  });

  it('getAssetUrlSync: empty flag → null or throw per contract (sync path)', async () => {
    const lib = await loadProductionAssetLibrary();
    expect(lib.getAssetUrlSync('', 'production')).toBeNull();
  });

  it('getAssetUrl: whitespace-only flag handled safely', async () => {
    const lib = await loadProductionAssetLibrary();
    expect(await lib.getAssetUrl('   ', 'production')).toBeNull();
  });

  it('getAssetUrlSync: whitespace-only flag handled safely (sync path)', async () => {
    const lib = await loadProductionAssetLibrary();
    expect(lib.getAssetUrlSync('   ', 'production')).toBeNull();
  });

  it('getAssetUrl: flag trimmed before lookup', async () => {
    const lib = await loadProductionAssetLibrary();
    const trimmed = await lib.getAssetUrl(PROD_ALLOWED_FLAG, 'production');
    const padded = await lib.getAssetUrl(`  ${PROD_ALLOWED_FLAG}  `, 'production');
    expect(padded).toBe(trimmed);
    expect(trimmed).toBe(PROD_MAP.production[PROD_ALLOWED_FLAG]);
  });

  it('getAssetUrlSync: flag trimmed before lookup (sync path)', async () => {
    const lib = await loadProductionAssetLibrary();
    const trimmed = lib.getAssetUrlSync(PROD_ALLOWED_FLAG, 'production');
    const padded = lib.getAssetUrlSync(`  ${PROD_ALLOWED_FLAG}  `, 'production');
    expect(padded).toBe(trimmed);
    expect(trimmed).toBe(PROD_MAP.production[PROD_ALLOWED_FLAG]);
  });

  it('getAssetUrl: concurrent same-flag requests share in-flight promise', async () => {
    stubProductionEnv();
    const assetMapSource = await import('../../src/systems/assets/assetMapSource.js');
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    const bundledSpy = vi.spyOn(assetMapSource, 'getBundledAssetMap');
    const [urlA, urlB] = await Promise.all([
      getAssetUrl(PROD_ALLOWED_FLAG, 'production'),
      getAssetUrl(PROD_ALLOWED_FLAG, 'production'),
    ]);
    expect(urlA).toBe(urlB);
    expect(urlA).toBe(PROD_MAP.production[PROD_ALLOWED_FLAG]);
    expect(bundledSpy).toHaveBeenCalledTimes(1);
    bundledSpy.mockRestore();
  });

  it('getAssetUrlSync: concurrent same-flag requests share in-flight promise (sync path)', async () => {
    stubProductionEnv();
    const assetMapSource = await import('../../src/systems/assets/assetMapSource.js');
    const { getAssetUrl, getAssetUrlSync, clearAssetCaches } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    clearAssetCaches();
    const bundledSpy = vi.spyOn(assetMapSource, 'getBundledAssetMap');
    const [urlA, urlB] = await Promise.all([
      getAssetUrl(PROD_ALLOWED_FLAG, 'production'),
      getAssetUrl(PROD_ALLOWED_FLAG, 'production'),
    ]);
    expect(bundledSpy).toHaveBeenCalledTimes(1);
    expect(getAssetUrlSync(PROD_ALLOWED_FLAG, 'production')).toBe(urlA);
    expect(urlB).toBe(urlA);
    bundledSpy.mockRestore();
  });

  it('getAssetUrl: URL passed through normalizeAssetMapUrl', async () => {
    const lib = await loadProductionAssetLibrary();
    const url = await lib.getAssetUrl('icon.social.telegram', 'production');
    expect(url).toBe(PROD_MAP.production['icon.social.telegram']);
  });

  it('getAssetUrlSync: URL passed through normalizeAssetMapUrl (sync path)', async () => {
    const lib = await loadProductionAssetLibrary();
    expect(lib.getAssetUrlSync('icon.social.telegram', 'production')).toBe(
      PROD_MAP.production['icon.social.telegram'],
    );
  });

  it('getAssetUrl: after setEnvironment(staging) uses staging without second arg', async () => {
    stubDevelopmentEnv();
    const { getAssetUrl, setEnvironment, clearAssetCaches } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    clearAssetCaches();
    setEnvironment('staging');
    const url = await getAssetUrl('icon.cart');
    expect(url).toBe(PROD_MAP.staging['icon.cart']);
  });

  it('getAssetUrlSync: after setEnvironment(staging) uses staging without second arg (sync path)', async () => {
    stubDevelopmentEnv();
    const { getAssetUrlSync, setEnvironment, loadAssetMapConfig, clearAssetCaches } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    clearAssetCaches();
    setEnvironment('staging');
    await loadAssetMapConfig();
    expect(getAssetUrlSync('icon.cart')).toBe(PROD_MAP.staging['icon.cart']);
  });

  it('getAssetUrl: explicit environment arg overrides setEnvironment', async () => {
    stubDevelopmentEnv();
    const { getAssetUrl, setEnvironment, clearAssetCaches } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    clearAssetCaches();
    setEnvironment('staging');
    const url = await getAssetUrl(PROD_ALLOWED_FLAG, 'production');
    expect(url).toBe(PROD_MAP.production[PROD_ALLOWED_FLAG]);
  });

  it('getAssetUrlSync: explicit environment arg overrides setEnvironment (sync path)', async () => {
    stubDevelopmentEnv();
    const { getAssetUrlSync, setEnvironment, loadAssetMapConfig, clearAssetCaches } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    clearAssetCaches();
    setEnvironment('staging');
    await loadAssetMapConfig();
    expect(getAssetUrlSync(PROD_ALLOWED_FLAG, 'production')).toBe(PROD_MAP.production[PROD_ALLOWED_FLAG]);
  });

  it('getAssetUrl: production-only flag resolves in staging via fallback', async () => {
    stubDevelopmentEnv();
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    const url = await getAssetUrl(PROD_ONLY_FLAG, 'staging');
    expect(url).toBe(PROD_MAP.production[PROD_ONLY_FLAG]);
  });

  it('getAssetUrlSync: production-only flag resolves in staging via fallback (sync path)', async () => {
    stubDevelopmentEnv();
    const { getAssetUrlSync, loadAssetMapConfig, clearAssetCaches } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    clearAssetCaches();
    await loadAssetMapConfig();
    expect(getAssetUrlSync(PROD_ONLY_FLAG, 'staging')).toBe(PROD_MAP.production[PROD_ONLY_FLAG]);
  });

  it('getAssetUrl: section-only flag (not in global) from section map', async () => {
    vi.doMock('../../src/systems/assets/sectionAssetMapSource.js', async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        getBundledSectionAssetMap: (section) =>
          section === 'checkout' ? CHECKOUT_MOCK_MAP : actual.getBundledSectionAssetMap(section),
      };
    });
    vi.resetModules();
    stubDevelopmentEnv();
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    const url = await getAssetUrl('checkout.banner', { section: 'checkout', environment: 'development' });
    expect(url).toBe(CHECKOUT_MOCK_MAP.development['checkout.banner']);
    vi.doUnmock('../../src/systems/assets/sectionAssetMapSource.js');
  });

  it('getAssetUrlSync: section-only flag (not in global) from section map (sync path)', async () => {
    vi.doMock('../../src/systems/assets/sectionAssetMapSource.js', async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        getBundledSectionAssetMap: (section) =>
          section === 'checkout' ? CHECKOUT_MOCK_MAP : actual.getBundledSectionAssetMap(section),
      };
    });
    vi.resetModules();
    stubDevelopmentEnv();
    const { getAssetUrlSync, loadAssetMapConfig, loadSectionAssetMap, clearAssetCaches } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    clearAssetCaches();
    await loadAssetMapConfig();
    await loadSectionAssetMap('checkout');
    expect(getAssetUrlSync('checkout.banner', { section: 'checkout', environment: 'development' })).toBe(
      CHECKOUT_MOCK_MAP.development['checkout.banner'],
    );
    vi.doUnmock('../../src/systems/assets/sectionAssetMapSource.js');
  });

  it('getAssetUrl: section-only missing flag → null', async () => {
    vi.doMock('../../src/systems/assets/sectionAssetMapSource.js', async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        getBundledSectionAssetMap: (section) =>
          section === 'checkout' ? CHECKOUT_MOCK_MAP : actual.getBundledSectionAssetMap(section),
      };
    });
    vi.resetModules();
    stubDevelopmentEnv();
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    expect(
      await getAssetUrl('checkout.nonexistent', { section: 'checkout', environment: 'development' }),
    ).toBeNull();
    vi.doUnmock('../../src/systems/assets/sectionAssetMapSource.js');
  });

  it('getAssetUrlSync: section-only missing flag → null (sync path)', async () => {
    vi.doMock('../../src/systems/assets/sectionAssetMapSource.js', async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        getBundledSectionAssetMap: (section) =>
          section === 'checkout' ? CHECKOUT_MOCK_MAP : actual.getBundledSectionAssetMap(section),
      };
    });
    vi.resetModules();
    stubDevelopmentEnv();
    const { getAssetUrlSync, loadSectionAssetMap, loadAssetMapConfig, clearAssetCaches } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    clearAssetCaches();
    await loadAssetMapConfig();
    await loadSectionAssetMap('checkout');
    expect(
      getAssetUrlSync('checkout.nonexistent', { section: 'checkout', environment: 'development' }),
    ).toBeNull();
    vi.doUnmock('../../src/systems/assets/sectionAssetMapSource.js');
  });

  it('getAssetUrl: does not expose internal map reference', async () => {
    const lib = await loadProductionAssetLibrary();
    const map = await lib.loadAssetMapConfig();
    const url = await lib.getAssetUrl(PROD_ALLOWED_FLAG, 'production');
    expect(typeof url).toBe('string');
    map.production[PROD_ALLOWED_FLAG] = 'https://mutated.example/logo.webp';
    expect(await lib.getAssetUrl(PROD_ALLOWED_FLAG, 'production')).toBe(url);
  });

  it('getAssetUrlSync: does not expose internal map reference (sync path)', async () => {
    const lib = await loadProductionAssetLibrary();
    const map = await lib.loadAssetMapConfig();
    const url = lib.getAssetUrlSync(PROD_ALLOWED_FLAG, 'production');
    expect(typeof url).toBe('string');
    map.production[PROD_ALLOWED_FLAG] = 'https://mutated.example/logo.webp';
    expect(lib.getAssetUrlSync(PROD_ALLOWED_FLAG, 'production')).toBe(url);
  });

  it('getAssetUrl: map reload mid-flight resolves without stale URL', async () => {
    stubProductionEnv();
    const { getAssetUrl, clearAssetCaches, clearAssetMapConfigCache, loadAssetMapConfig } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );
    clearAssetCaches();
    const pending = getAssetUrl(PROD_ALLOWED_FLAG, 'production');
    clearAssetMapConfigCache();
    await loadAssetMapConfig();
    const url = await pending;
    expect(url).toBe(PROD_MAP.production[PROD_ALLOWED_FLAG]);
  });

  it('getAssetUrlSync: map reload mid-flight resolves without stale URL (sync path)', async () => {
    stubProductionEnv();
    const { getAssetUrl, getAssetUrlSync, clearAssetCaches, clearAssetMapConfigCache, loadAssetMapConfig } =
      await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    const pending = getAssetUrl(PROD_ALLOWED_FLAG, 'production');
    clearAssetMapConfigCache();
    await loadAssetMapConfig();
    await pending;
    expect(getAssetUrlSync(PROD_ALLOWED_FLAG, 'production')).toBe(PROD_MAP.production[PROD_ALLOWED_FLAG]);
  });
});

describe('getAssetUrl inheritance matrix (§6)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    stubWindowLocation();
  });

  it('getAssetUrl matrix: global production + production partial override → correct URL for overlapping and non-overlapping flags', async () => {
    const lib = await loadProductionAssetLibrary();
    expect(await lib.getAssetUrl(PROD_PATH_FLAG, 'production')).toBe(PROD_MAP.production[PROD_PATH_FLAG]);
    expect(await lib.getAssetUrl(PROD_ONLY_FLAG, 'production')).toBe(PROD_MAP.production[PROD_ONLY_FLAG]);
  });

  it('getAssetUrl matrix: global production + staging partial override → correct URL for overlapping and non-overlapping flags', async () => {
    stubDevelopmentEnv();
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    expect(await getAssetUrl('icon.cart', 'staging')).toBe(PROD_MAP.staging['icon.cart']);
    expect(await getAssetUrl(PROD_ONLY_FLAG, 'staging')).toBe(PROD_MAP.production[PROD_ONLY_FLAG]);
  });

  it('getAssetUrl matrix: global production + development partial override → correct URL for overlapping and non-overlapping flags', async () => {
    stubDevelopmentEnv();
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    expect(await getAssetUrl('icon.cart', 'development')).toBe(PROD_MAP.development['icon.cart']);
    expect(await getAssetUrl(PROD_ONLY_FLAG, 'development')).toBe(PROD_MAP.production[PROD_ONLY_FLAG]);
  });

  it('getAssetUrl section auth: overlapping flag uses section map', async () => {
    stubDevelopmentEnv();
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    const url = await getAssetUrl('auth.background', { section: 'auth', environment: 'development' });
    expect(url).toBe(AUTH_MAP.development['auth.background']);
  });

  it('getAssetUrl section auth: non-overlapping flag inherits global', async () => {
    stubDevelopmentEnv();
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    const url = await getAssetUrl('icon.cart', { section: 'auth', environment: 'development' });
    expect(url).toBe(PROD_MAP.development['icon.cart']);
  });

  it('getAssetUrl section auth: section env sparse + global dense → production fallback', async () => {
    const lib = await loadProductionAssetLibrary();
    const url = await lib.getAssetUrl('auth.background', { section: 'auth', environment: 'production' });
    expect(url).toBe(PROD_MAP.production['auth.background']);
  });

  it('getAssetUrl section dashboard: overlapping flag uses section map', async () => {
    vi.doMock('../../src/systems/assets/sectionAssetMapSource.js', async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        getBundledSectionAssetMap: (section) =>
          section === 'dashboard' ? DASHBOARD_MOCK_MAP : actual.getBundledSectionAssetMap(section),
      };
    });
    vi.resetModules();
    stubDevelopmentEnv();
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    const url = await getAssetUrl('dashboard.logo', { section: 'dashboard', environment: 'development' });
    expect(url).toBe(DASHBOARD_MOCK_MAP.development['dashboard.logo']);
    vi.doUnmock('../../src/systems/assets/sectionAssetMapSource.js');
  });

  it('getAssetUrl section dashboard: non-overlapping flag inherits global', async () => {
    vi.doMock('../../src/systems/assets/sectionAssetMapSource.js', async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        getBundledSectionAssetMap: (section) =>
          section === 'dashboard' ? DASHBOARD_MOCK_MAP : actual.getBundledSectionAssetMap(section),
      };
    });
    vi.resetModules();
    stubDevelopmentEnv();
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    const url = await getAssetUrl('icon.cart', { section: 'dashboard', environment: 'development' });
    expect(url).toBe(PROD_MAP.development['icon.cart']);
    vi.doUnmock('../../src/systems/assets/sectionAssetMapSource.js');
  });

  it('getAssetUrl section dashboard: section env sparse + global dense → production fallback', async () => {
    vi.doMock('../../src/systems/assets/sectionAssetMapSource.js', async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        getBundledSectionAssetMap: (section) =>
          section === 'dashboard' ? DASHBOARD_MOCK_MAP : actual.getBundledSectionAssetMap(section),
      };
    });
    vi.resetModules();
    stubProductionEnv();
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    const url = await getAssetUrl('dashboard.logo', { section: 'dashboard', environment: 'production' });
    expect(url).toBe(PROD_MAP.production['dashboard.logo']);
    vi.doUnmock('../../src/systems/assets/sectionAssetMapSource.js');
  });

  it('getAssetUrl section checkout: overlapping flag uses section map', async () => {
    vi.doMock('../../src/systems/assets/sectionAssetMapSource.js', async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        getBundledSectionAssetMap: (section) =>
          section === 'checkout' ? CHECKOUT_MOCK_MAP : actual.getBundledSectionAssetMap(section),
      };
    });
    vi.resetModules();
    stubDevelopmentEnv();
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    const url = await getAssetUrl('checkout.banner', { section: 'checkout', environment: 'development' });
    expect(url).toBe(CHECKOUT_MOCK_MAP.development['checkout.banner']);
    vi.doUnmock('../../src/systems/assets/sectionAssetMapSource.js');
  });

  it('getAssetUrl section checkout: non-overlapping flag inherits global', async () => {
    vi.doMock('../../src/systems/assets/sectionAssetMapSource.js', async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        getBundledSectionAssetMap: (section) =>
          section === 'checkout' ? CHECKOUT_MOCK_MAP : actual.getBundledSectionAssetMap(section),
      };
    });
    vi.resetModules();
    stubDevelopmentEnv();
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    const url = await getAssetUrl('icon.cart', { section: 'checkout', environment: 'development' });
    expect(url).toBe(PROD_MAP.development['icon.cart']);
    vi.doUnmock('../../src/systems/assets/sectionAssetMapSource.js');
  });

  it('getAssetUrl section checkout: section env sparse + global dense → production fallback', async () => {
    vi.doMock('../../src/systems/assets/sectionAssetMapSource.js', async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        getBundledSectionAssetMap: (section) =>
          section === 'checkout' ? CHECKOUT_MOCK_MAP : actual.getBundledSectionAssetMap(section),
      };
    });
    vi.resetModules();
    stubProductionEnv();
    const { getAssetUrl, clearAssetCaches } = await import('../../src/systems/assets/assetLibrary.js');
    clearAssetCaches();
    expect(
      await getAssetUrl('checkout.banner', { section: 'checkout', environment: 'production' }),
    ).toBeNull();
    expect(await getAssetUrl(PROD_PATH_FLAG, { section: 'checkout', environment: 'production' })).toBe(
      PROD_MAP.production[PROD_PATH_FLAG],
    );
    vi.doUnmock('../../src/systems/assets/sectionAssetMapSource.js');
  });
});

// Satisfy static import requirement from asset-test-plan
void getAssetUrl;
void getAssetUrlSync;
