import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAssetTestEnv } from '../helpers/assetFixtures.js';

describe('preloadJSON (§21)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
  });

  it('preloadJSON: fetch parse', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ countries: [] }),
    });
    const { preloadJSON } = await import('../../src/systems/assets/assetPreloader.js');
    await expect(preloadJSON('/src/config/countries.json')).resolves.toEqual({ countries: [] });
  });

  it('preloadJSON: invalid JSON rejects', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error('invalid json');
      },
    });
    const { preloadJSON } = await import('../../src/systems/assets/assetPreloader.js');
    await expect(preloadJSON('/src/config/bad.json')).rejects.toThrow();
  });

  it('preloadJSON: cached', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    const { preloadJSON } = await import('../../src/systems/assets/assetPreloader.js');
    const url = '/src/config/countries.json';
    await preloadJSON(url);
    await preloadJSON(url);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
