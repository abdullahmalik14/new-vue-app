import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAssetTestEnv } from '../helpers/assetFixtures.js';

describe('sectionAssetMapSource — parseSectionNameFromAssetMapPath (§2)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('extracts auth from /assets/maps/assetMap.auth.json', async () => {
    const { parseSectionNameFromAssetMapPath } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    expect(parseSectionNameFromAssetMapPath('/assets/maps/assetMap.auth.json')).toBe('auth');
  });

  it('extracts section from nested public path', async () => {
    const { parseSectionNameFromAssetMapPath } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    expect(parseSectionNameFromAssetMapPath('public/config/assetMap.dashboard-creator.json')).toBe(
      'dashboard-creator',
    );
  });

  it('returns null for global assetMap path without section suffix', async () => {
    const { parseSectionNameFromAssetMapPath } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    expect(parseSectionNameFromAssetMapPath('/config/assetMap.json')).toBeNull();
  });

  it('returns null for malformed path', async () => {
    const { parseSectionNameFromAssetMapPath } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    expect(parseSectionNameFromAssetMapPath('not-a-map.txt')).toBeNull();
  });

  it('handles Windows-style backslashes normalized', async () => {
    const { parseSectionNameFromAssetMapPath } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    expect(parseSectionNameFromAssetMapPath('config\\assetMap.auth.json')).toBe('auth');
  });
});

describe('sectionAssetMapSource — isValidSectionAssetMapName (§2b)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns true for auth', async () => {
    const { isValidSectionAssetMapName } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    expect(isValidSectionAssetMapName('auth')).toBe(true);
  });

  it('returns true for dashboard', async () => {
    const { isValidSectionAssetMapName } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    expect(isValidSectionAssetMapName('dashboard')).toBe(true);
  });

  it('returns false for empty string', async () => {
    const { isValidSectionAssetMapName } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    expect(isValidSectionAssetMapName('')).toBe(false);
  });

  it('returns false for non-string input', async () => {
    const { isValidSectionAssetMapName } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    expect(isValidSectionAssetMapName(null)).toBe(false);
  });

  it('returns false for ../auth path traversal', async () => {
    const { isValidSectionAssetMapName } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    expect(isValidSectionAssetMapName('../auth')).toBe(false);
  });

  it('returns false for auth/extra with slash', async () => {
    const { isValidSectionAssetMapName } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    expect(isValidSectionAssetMapName('auth/extra')).toBe(false);
  });

  it('returns false for auth..', async () => {
    const { isValidSectionAssetMapName } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    expect(isValidSectionAssetMapName('auth..')).toBe(false);
  });

  it('trims whitespace before validation', async () => {
    const { isValidSectionAssetMapName } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    expect(isValidSectionAssetMapName(' auth ')).toBe(true);
  });
});

describe('sectionAssetMapSource — bundled + network (§2c)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
  });

  it('getBundledSectionAssetMap returns map for known bundled section', async () => {
    const { getBundledSectionAssetMap } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    const map = getBundledSectionAssetMap('auth');
    expect(map?.development?.['auth.background']).toBe(
      '/assets/images/auth-section-override-dev.webp',
    );
  });

  it('getBundledSectionAssetMap returns null for unknown section', async () => {
    const { getBundledSectionAssetMap } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    expect(getBundledSectionAssetMap('unknown-section-xyz')).toBeNull();
  });

  it('getKnownBundledSectionNames returns string array', async () => {
    const { getKnownBundledSectionNames } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    const names = getKnownBundledSectionNames();
    expect(Array.isArray(names)).toBe(true);
    expect(names.every((name) => typeof name === 'string')).toBe(true);
  });

  it('getKnownBundledSectionNames has no duplicates', async () => {
    const { getKnownBundledSectionNames } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    const names = getKnownBundledSectionNames();
    expect(new Set(names).size).toBe(names.length);
  });

  it('getSectionAssetMapFetchCandidates returns ordered URL list', async () => {
    vi.stubEnv('DEV', 'true');
    const { getSectionAssetMapFetchCandidates } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    expect(getSectionAssetMapFetchCandidates('auth')).toEqual([
      '/config/assetMap.auth.json',
      '/src/config/assetMap.auth.json',
    ]);
  });

  it('getSectionAssetMapFetchCandidates returns path for unvalidated section name input', async () => {
    const { getSectionAssetMapFetchCandidates } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    expect(getSectionAssetMapFetchCandidates('../auth')).toEqual([
      '/config/assetMap.../auth.json',
      '/src/config/assetMap.../auth.json',
    ]);
  });

  it('fetchSectionAssetMapFromNetwork resolves map on 200', async () => {
    vi.stubEnv('PROD', '');
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ASSET_MAP_RUNTIME_OVERRIDE', 'true');

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          production: {},
          development: { 'auth.background': '/network/auth.webp' },
        }),
    });

    const { fetchSectionAssetMapFromNetwork } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    const map = await fetchSectionAssetMapFromNetwork('auth');
    expect(map?.development?.['auth.background']).toBe('/network/auth.webp');
    fetchSpy.mockRestore();
  });

  it('fetchSectionAssetMapFromNetwork returns null on 404', async () => {
    vi.stubEnv('PROD', '');
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ASSET_MAP_RUNTIME_OVERRIDE', 'true');

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => '',
    });

    const { fetchSectionAssetMapFromNetwork } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    expect(await fetchSectionAssetMapFromNetwork('auth')).toBeNull();
    fetchSpy.mockRestore();
  });

  it('fetchSectionAssetMapFromNetwork rejects invalid JSON', async () => {
    vi.stubEnv('PROD', '');
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ASSET_MAP_RUNTIME_OVERRIDE', 'true');

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => 'not-json',
    });

    const { fetchSectionAssetMapFromNetwork } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    expect(await fetchSectionAssetMapFromNetwork('auth')).toBeNull();
    fetchSpy.mockRestore();
  });

  it('fetchSectionAssetMapFromNetwork rejects non-object root', async () => {
    vi.stubEnv('PROD', '');
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ASSET_MAP_RUNTIME_OVERRIDE', 'true');

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '[]',
    });

    const { fetchSectionAssetMapFromNetwork } = await import(
      '../../src/systems/assets/sectionAssetMapSource.js',
    );
    expect(await fetchSectionAssetMapFromNetwork('auth')).toBeNull();
    fetchSpy.mockRestore();
  });
});
