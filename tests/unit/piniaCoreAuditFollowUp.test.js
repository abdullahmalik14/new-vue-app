import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, createApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { syncPreloadStoreBuildHash } from '../../src/utils/build/appBuildHash.js';
import { useCartStore } from '../../src/stores/useCartStore.js';
import { useLocaleStore } from '../../src/stores/useLocaleStore.js';
import { usePreloadStore } from '../../src/stores/usePreloadStore.js';
import {
  buildPersistKey,
  createPersistedStateSerializer,
  migrateBuildHashPersistKey,
} from '../../src/utils/common/persistUtils.js';

function createMemoryLocalStorage() {
  const data = new Map();
  return {
    data,
    get length() {
      return data.size;
    },
    key(index) {
      return [...data.keys()][index] ?? null;
    },
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

describe('PINIA_CORE_AUDIT follow-up review scenarios', () => {
  /** @type {ReturnType<typeof createMemoryLocalStorage>} */
  let memoryStorage;
  /** @type {ReturnType<typeof vi.spyOn>} */
  let consoleErrorSpy;

  beforeEach(() => {
    memoryStorage = createMemoryLocalStorage();
    vi.stubGlobal('localStorage', memoryStorage);
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    consoleErrorSpy.mockRestore();
  });

  it('$reset on cart, locale, and preload stores throws no console errors', () => {
    mountPersistPinia();

    useCartStore().$reset();
    useLocaleStore().$reset();
    usePreloadStore().$reset();

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('double $hydrate on usePreloadStore does not double quota-monitor subscriptions', async () => {
    const persistUtils = await import('../../src/utils/common/persistUtils.js');
    let quotaSubscribeCalls = 0;
    const realAttach = persistUtils.attachStorageQuotaMonitor;
    const attachSpy = vi.spyOn(persistUtils, 'attachStorageQuotaMonitor').mockImplementation((store, opts) => {
      const originalSubscribe = store.$subscribe.bind(store);
      store.$subscribe = (...args) => {
        quotaSubscribeCalls += 1;
        return originalSubscribe(...args);
      };
      realAttach(store, opts);
      store.$subscribe = originalSubscribe;
    });

    mountPersistPinia();
    const store = usePreloadStore();

    expect(attachSpy).toHaveBeenCalledTimes(1);
    expect(quotaSubscribeCalls).toBe(1);

    store.$hydrate({ runHooks: true });
    store.$hydrate({ runHooks: true });

    expect(attachSpy).toHaveBeenCalledTimes(3);
    expect(quotaSubscribeCalls).toBe(1);
  });

  it('rapid setLocale calls leave one consistent localStorage value', () => {
    mountPersistPinia();
    const store = useLocaleStore();
    const key = buildPersistKey('locale_preference');

    store.setLocale('en');
    store.setLocale('vi');

    const raw = memoryStorage.getItem(key);
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw);
    const locale = parsed.data?.locale ?? parsed.locale;

    expect(locale).toBe('vi');

    const matchingKeys = [...memoryStorage.data.keys()].filter((k) => k.startsWith('locale_preference'));
    expect(matchingKeys).toHaveLength(1);
    expect(matchingKeys[0]).toBe(key);
  });

  it('markSectionInProgress updates a reactive computed reading sectionsInProgress', () => {
    mountPersistPinia();
    const store = usePreloadStore();

    const inProgressCount = computed(() => store.sectionsInProgress.size);
    const authInProgress = computed(() => store.isSectionInProgress('auth'));

    expect(inProgressCount.value).toBe(0);
    expect(authInProgress.value).toBe(false);

    store.markSectionInProgress('auth');

    expect(inProgressCount.value).toBe(1);
    expect(authInProgress.value).toBe(true);

    store.unmarkSectionInProgress('auth');

    expect(inProgressCount.value).toBe(0);
    expect(authInProgress.value).toBe(false);
  });

  it('TTL is not falsely bypassed when the system clock moves backward', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));

    const serializer = createPersistedStateSerializer({
      version: 1,
      ttlMs: 60_000,
      fallback: { locale: null },
    });

    const payload = serializer.serialize({ locale: 'vi' });
    const parsed = JSON.parse(payload);
    expect(parsed.expiresAt).toBeGreaterThan(Date.now());

    vi.setSystemTime(new Date('2026-06-01T11:00:00Z'));

    const restored = serializer.deserialize(payload);
    expect(restored.locale).toBe('vi');

    vi.setSystemTime(new Date('2026-06-01T12:05:00Z'));

    const expired = serializer.deserialize(payload);
    expect(expired.locale).toBeNull();
  });

  it('new build hash clears preload cache but migrates other persisted stores from old hash keys', () => {
    vi.stubEnv('MODE', 'test');
    vi.stubEnv('VITE_BUILD_HASH', 'build-v2');

    const cartKey = buildPersistKey('cart');
    memoryStorage.setItem(
      `${cartKey}:build-v1`,
      JSON.stringify({ version: 1, data: { items: [{ id: 1 }] } }),
    );

    const migrated = migrateBuildHashPersistKey({
      storage: memoryStorage,
      newKey: cartKey,
      baseKey: 'cart',
    });

    expect(migrated).toBe(true);
    expect(JSON.parse(memoryStorage.getItem(cartKey)).data.items).toHaveLength(1);

    mountPersistPinia();
    const preloadStore = usePreloadStore();

    preloadStore.$patch({
      preloadedSections: new Set(['auth']),
      buildHash: 'build-v1',
    });
    preloadStore.addAsset('/assets/stale.png');

    const sync = syncPreloadStoreBuildHash(preloadStore);

    expect(sync.invalidated).toBe(true);
    expect(preloadStore.buildHash).toBe('build-v2');
    expect(preloadStore.preloadedSections.size).toBe(0);
    expect(preloadStore.preloadedAssetCount).toBe(0);
  });
});
