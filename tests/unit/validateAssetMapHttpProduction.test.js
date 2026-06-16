import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

describe('validateAssetMap production HTTP (S-06)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    setActivePinia(createPinia());
    window.performanceTracker = { step: vi.fn() };
  });

  it('treats non-localhost http:// in production as errors', async () => {
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
          production: {
            ...bundled.production,
            'audit.s06.http': 'http://cdn.example.com/insecure.png',
          },
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
    expect(
      result.errors.some(
        (e) => e.includes('audit.s06.http') && e.includes('Production') && e.includes('HTTP'),
      ),
    ).toBe(true);

    vi.doUnmock('../../src/systems/assets/assetMapSource.js');
  });

  it('allows localhost http:// in production without errors', async () => {
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
          production: {
            ...bundled.production,
            'audit.s06.local': 'http://localhost:8080/dev-only.png',
          },
        }),
      };
    });
    vi.resetModules();

    const { clearAssetMapConfigCache, validateAssetMap } = await import(
      '../../src/systems/assets/assetLibrary.js',
    );

    clearAssetMapConfigCache();
    const result = await validateAssetMap();

    const httpErrors = result.errors.filter((e) => e.includes('audit.s06.local'));
    const httpWarnings = result.warnings.filter((e) => e.includes('audit.s06.local'));
    expect(httpErrors).toEqual([]);
    expect(httpWarnings).toEqual([]);

    vi.doUnmock('../../src/systems/assets/assetMapSource.js');
  });
});
