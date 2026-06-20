import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { syncPreloadStoreBuildHash } from '../../src/systems/build/appBuildHash.js';
import { usePreloadStore } from '../../src/stores/usePreloadStore.js';

describe('appBuildHash / preload invalidation (M-05)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.unstubAllEnvs();
  });

  it('starts with an empty preload store', () => {
    const store = usePreloadStore();

    expect(store.preloadedSections.size).toBe(0);
    expect(store.preloadedAssets.size).toBe(0);
    expect(store.buildHash).toBe(null);
  });

  it('clears preload state when VITE_BUILD_HASH changes', () => {
    vi.stubEnv('VITE_BUILD_HASH', 'build-v2');
    const store = usePreloadStore();

    store.$patch({
      preloadedSections: ['dashboard-global'],
      buildHash: 'build-v1',
    });
    store.addPreloadedAsset('/assets/old-icon.png');

    const result = syncPreloadStoreBuildHash(store);

    expect(result.invalidated).toBe(true);
    expect(result.previousHash).toBe('build-v1');
    expect(result.currentBuildHash).toBe('build-v2');
    expect(store.buildHash).toBe('build-v2');
    expect(store.preloadedSections.size).toBe(0);
    expect(store.preloadedAssetCount).toBe(0);
  });

  it('does not clear state when build hash is unchanged', () => {
    vi.stubEnv('VITE_BUILD_HASH', 'build-v1');
    const store = usePreloadStore();

    store.$patch({ buildHash: 'build-v1' });
    store.addSection('auth');
    store.addPreloadedAsset('/assets/icon.png');

    const result = syncPreloadStoreBuildHash(store);

    expect(result.invalidated).toBe(false);
    expect(store.hasSection('auth')).toBe(true);
    expect(store.hasAsset('/assets/icon.png')).toBe(true);
  });
});
