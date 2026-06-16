import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const BAD_GLOBE_URL = 'https://i.ibb.co.com/mF9x2JG0/svgviewer-png-output-85.webp';
const GOOD_GLOBE_URL = 'https://i.ibb.co/mF9x2JG0/svgviewer-png-output-85.webp';

describe('validateAssetMap hostname checks (L-08)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    setActivePinia(createPinia());
    window.performanceTracker = { step: vi.fn() };
  });

  it('flags i.ibb.co.com typo in asset map', async () => {
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('DEV', '');

    vi.doMock('../../src/systems/assets/assetMapSource.js', async (importOriginal) => {
      const actual = await importOriginal();
      const bundled = actual.getBundledAssetMap();
      return {
        ...actual,
        shouldAllowRuntimeAssetMapFetch: () => false,
        getBundledAssetMap: () => ({
          ...bundled,
          development: { ...bundled.development, 'icon.globe': BAD_GLOBE_URL },
          production: { ...bundled.production, 'icon.globe': BAD_GLOBE_URL },
        }),
      };
    });
    vi.resetModules();

    const { clearAssetMapConfigCache, validateAssetMap } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );

    clearAssetMapConfigCache();
    const result = await validateAssetMap();

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('icon.globe'))).toBe(true);
    expect(result.errors.some((e) => e.includes('i.ibb.co.com') || e.includes('double TLD'))).toBe(
      true,
    );

    vi.doUnmock('../../src/systems/assets/assetMapSource.js');
  });

  it('passes validation when icon.globe uses i.ibb.co', async () => {
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('DEV', '');

    const { clearAssetMapConfigCache, validateAssetMap } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );

    clearAssetMapConfigCache();
    const result = await validateAssetMap();

    const globeErrors = result.errors.filter((e) => e.includes('icon.globe'));
    expect(globeErrors).toEqual([]);

    const { getBundledAssetMap } = await import('../../src/systems/assets/assetMapSource.js');
    const bundled = getBundledAssetMap();
    expect(bundled.development['icon.globe']).toBe(GOOD_GLOBE_URL);
    expect(bundled.production['icon.globe']).toBe(GOOD_GLOBE_URL);
  });
});
