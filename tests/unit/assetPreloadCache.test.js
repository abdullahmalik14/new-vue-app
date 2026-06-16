import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { usePreloadStore } from '../../src/stores/usePreloadStore.js';

describe('asset preload cache SSOT (P-03)', () => {
  beforeEach(() => {
    vi.resetModules();
    setActivePinia(createPinia());
    window.performanceTracker = { step: vi.fn() };
    vi.stubGlobal('fetch', vi.fn());
  });

  it('clearPreloadCache clears asset URLs but preserves section preload state', async () => {
    const store = usePreloadStore();
    store.addSection('dashboard-global');
    store.addAsset('https://example.com/icon.svg');
    store.buildHash = 'test-hash';

    const { clearPreloadCache } = await import('../../src/systems/assets/assetPreloader.js');
    clearPreloadCache();

    expect(store.preloadedAssetCount).toBe(0);
    expect(store.hasSection('dashboard-global')).toBe(true);
    expect(store.buildHash).toBe('test-hash');
  });

  it('preloadJSON uses hasAsset as completion SSOT with jsonDataCache for content', async () => {
    const store = usePreloadStore();
    const path = '/src/config/countries.json';
    const payload = { US: { name: 'United States' } };

    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });

    const { preloadJSON } = await import('../../src/systems/assets/assetPreloader.js');

    const first = await preloadJSON(path);
    expect(first).toEqual(payload);
    expect(store.hasAsset(path)).toBe(true);

    fetch.mockClear();
    const second = await preloadJSON(path);
    expect(second).toEqual(payload);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('clearPreloadCache clears jsonDataCache so JSON is re-fetched', async () => {
    const path = '/src/config/countries.json';
    const payload = { US: { name: 'United States' } };

    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });

    const { preloadJSON, clearPreloadCache } = await import('../../src/systems/assets/assetPreloader.js');

    await preloadJSON(path);
    fetch.mockClear();
    clearPreloadCache();
    await preloadJSON(path);

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
