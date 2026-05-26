import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { usePreloadStore } from '../../src/stores/usePreloadStore.js';

describe('usePreloadStore — preloadedAssets Set', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('tracks asset URLs with O(1) Set membership', () => {
    const store = usePreloadStore();
    const url = 'https://example.com/icon.svg';

    expect(store.hasAsset(url)).toBe(false);
    store.addAsset(url);
    expect(store.hasAsset(url)).toBe(true);
    expect(store.preloadedAssetCount).toBe(1);
    expect(store.preloadedAssets instanceof Set).toBe(true);

    store.addAsset(url);
    expect(store.preloadedAssetCount).toBe(1);
  });

  it('removeAsset and clearAssets reset URL cache only', () => {
    const store = usePreloadStore();
    store.addSection('auth');
    store.addAsset('/a.png');
    store.addAsset('/b.png');

    store.removeAsset('/a.png');
    expect(store.hasAsset('/a.png')).toBe(false);
    expect(store.hasAsset('/b.png')).toBe(true);

    store.clearAssets();
    expect(store.preloadedAssetCount).toBe(0);
    expect(store.hasSection('auth')).toBe(true);
  });

  it('deserialize persisted array into Set', () => {
    const parsed = JSON.parse(
      JSON.stringify({
        preloadedSections: ['auth'],
        preloadedAssets: ['/cached.png'],
        buildHash: 'abc',
      })
    );

    expect(Array.isArray(parsed.preloadedAssets)).toBe(true);

    const store = usePreloadStore();
    store.$patch(parsed);
    store.preloadedAssets = new Set(parsed.preloadedAssets);

    expect(store.preloadedAssets instanceof Set).toBe(true);
    expect(store.hasAsset('/cached.png')).toBe(true);
  });
});
