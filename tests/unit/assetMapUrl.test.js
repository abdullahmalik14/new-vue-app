import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('getAssetMapFetchCandidates (M-10 / L-10)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('prepends VITE_ASSET_MAP_URL when set', async () => {
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ASSET_MAP_URL', '/config/assetMap.staging.json');

    const { getAssetMapFetchCandidates } = await import('../../src/systems/assets/assetLibrary.js');

    expect(getAssetMapFetchCandidates()).toEqual([
      '/config/assetMap.staging.json',
      '/config/assetMap.json',
      '/src/config/assetMap.json',
    ]);
  });

  it('defaults to public and src paths in development', async () => {
    vi.stubEnv('DEV', 'true');

    const { getAssetMapFetchCandidates } = await import('../../src/systems/assets/assetLibrary.js');

    expect(getAssetMapFetchCandidates()).toEqual([
      '/config/assetMap.json',
      '/src/config/assetMap.json',
    ]);
  });
});
