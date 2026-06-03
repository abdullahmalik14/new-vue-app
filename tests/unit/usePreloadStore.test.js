import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createApp } from 'vue';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { normalizeStringSet, usePreloadStore } from '../../src/stores/usePreloadStore.js';
import { buildPersistKey, createPersistedStateSerializer, resolvePersistTtlMs } from '../../src/utils/common/persistUtils.js';

function createMemoryLocalStorage() {
  const data = new Map();
  return {
    getItem(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    clear() {
      data.clear();
    },
  };
}

function mountPersistPinia() {
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  const app = createApp({ template: '<div />' });
  app.use(pinia);
  setActivePinia(pinia);
  return pinia;
}

function mapPreloadPersistedState(state) {
  const source = state && typeof state === 'object' ? state : {};
  return {
    ...source,
    preloadedSections: normalizeStringSet(source.preloadedSections),
    preloadedAssets: normalizeStringSet(source.preloadedAssets),
  };
}

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

  it('normalizes array patches before mutations', () => {
    const store = usePreloadStore();

    store.$patch({
      preloadedSections: ['dashboard-global'],
      preloadedAssets: ['/legacy.png'],
    });

    store.addSection('auth');

    expect(store.hasSection('dashboard-global')).toBe(true);
    expect(store.hasSection('auth')).toBe(true);
    expect(store.hasAsset('/legacy.png')).toBe(true);
    expect(store.preloadedSections instanceof Set).toBe(true);
  });

  it('ignores empty section and asset keys', () => {
    const store = usePreloadStore();

    store.addSection('');
    store.addAsset('');
    store.markSectionInProgress('');

    expect(store.preloadedSections.size).toBe(0);
    expect(store.preloadedAssets.size).toBe(0);
    expect(store.sectionsInProgress.size).toBe(0);
  });

  it('persist serializer round-trip restores Sets', () => {
    const serializer = createPersistedStateSerializer({
      version: 1,
      ttlMs: resolvePersistTtlMs(),
      fallback: {},
      mapBeforeSerialize: (state) => {
        const mapped = mapPreloadPersistedState(state);
        return {
          ...mapped,
          preloadedSections: [...mapped.preloadedSections],
          preloadedAssets: [...mapped.preloadedAssets],
        };
      },
      mapAfterDeserialize: mapPreloadPersistedState,
    });

    const restored = serializer.deserialize(
      serializer.serialize({
        preloadedSections: new Set(['auth']),
        preloadedAssets: new Set(['/cached.png']),
        buildHash: 'abc',
      }),
    );

    expect(restored.preloadedSections instanceof Set).toBe(true);
    expect(restored.preloadedAssets instanceof Set).toBe(true);
    expect(restored.preloadedSections.has('auth')).toBe(true);
    expect(restored.preloadedAssets.has('/cached.png')).toBe(true);
  });
});

describe('usePreloadStore — pinia persist plugin', () => {
  /** @type {ReturnType<typeof createMemoryLocalStorage>} */
  let memoryStorage;

  beforeEach(() => {
    memoryStorage = createMemoryLocalStorage();
    vi.stubGlobal('localStorage', memoryStorage);
    mountPersistPinia();
  });

  it('writes preloadedSections to localStorage when addSection runs', () => {
    const store = usePreloadStore();
    store.addSection('auth');

    const key = buildPersistKey('app-preload-state');
    const raw = memoryStorage.getItem(key);

    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw);
    expect(parsed.data.preloadedSections).toContain('auth');
    expect(parsed.data).not.toHaveProperty('sectionsInProgress');
  });

  it('rehydrates Sets from localStorage on a fresh store instance', () => {
    const key = buildPersistKey('app-preload-state');

    const writer = usePreloadStore();
    writer.addSection('dashboard-global');
    writer.addAsset('/cached.png');

    expect(memoryStorage.getItem(key)).not.toBeNull();

    mountPersistPinia();
    const restored = usePreloadStore();

    expect(restored.hasSection('dashboard-global')).toBe(true);
    expect(restored.hasAsset('/cached.png')).toBe(true);
    expect(restored.preloadedSections instanceof Set).toBe(true);
  });
});

describe('normalizeStringSet', () => {
  it('filters invalid array entries', () => {
    expect([...normalizeStringSet(['auth', '', 42, '  '])]).toEqual(['auth']);
  });
});
