import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  attachStorageQuotaMonitor,
  buildPersistKey,
  createPersistedStateSerializer,
  migrateLegacyPersistedState,
  persistStorageAdapter,
  resolvePersistTtlMs,
} from '../../src/utils/common/persistUtils.js';

describe('persistUtils', () => {
  describe('createPersistedStateSerializer', () => {
    it('serializes version and TTL metadata', () => {
      const serializer = createPersistedStateSerializer({
        version: 1,
        ttlMs: 60_000,
        fallback: { items: [] },
      });

      const payload = JSON.parse(serializer.serialize({ items: ['x'] }));

      expect(payload.version).toBe(1);
      expect(payload.data).toEqual({ items: ['x'] });
      expect(typeof payload.expiresAt).toBe('number');
    });

    it('returns fallback when TTL is expired', () => {
      const serializer = createPersistedStateSerializer({
        version: 1,
        ttlMs: 1000,
        fallback: { items: [] },
      });

      const payload = serializer.serialize({ items: ['x'] });
      const expired = serializer.deserialize(
        JSON.stringify({ ...JSON.parse(payload), expiresAt: Date.now() - 1000 }),
      );

      expect(expired.items).toEqual([]);
    });

    it('returns fallback on corrupt JSON', () => {
      const serializer = createPersistedStateSerializer({
        version: 1,
        fallback: { items: [] },
      });

      expect(serializer.deserialize('{bad json').items).toEqual([]);
    });

    it('migrates v0 payloads via migrate hook', () => {
      const serializer = createPersistedStateSerializer({
        version: 1,
        fallback: { locale: null },
        migrate: (state, fromVersion) => {
          if (fromVersion === 0) {
            return { locale: state.locale ?? null };
          }
          return state;
        },
      });

      const restored = serializer.deserialize(JSON.stringify({ locale: 'vi' }));

      expect(restored).toEqual({ locale: 'vi' });
    });
  });

  describe('buildPersistKey', () => {
    it('namespaces keys with mode only by default (survives deploys)', () => {
      vi.stubEnv('VITE_BUILD_HASH', 'abc123');

      const key = buildPersistKey('cart');

      expect(key).toMatch(/^cart:/);
      expect(key).not.toContain('abc123');

      vi.unstubAllEnvs();
    });

    it('can optionally include build hash in the key', () => {
      vi.stubEnv('VITE_BUILD_HASH', 'abc123');

      const key = buildPersistKey('cart', { includeBuildHash: true });

      expect(key).toContain('abc123');

      vi.unstubAllEnvs();
    });
  });

  describe('migrateBuildHashPersistKey', () => {
    /** @type {Storage} */
    let storage;

    beforeEach(() => {
      vi.stubEnv('MODE', 'test');
      const hashKey = 'cart:test:old-hash';
      storage = {
        data: new Map([[hashKey, '{"items":["migrated"]}']]),
        get length() {
          return this.data.size;
        },
        key(index) {
          return [...this.data.keys()][index] ?? null;
        },
        getItem(key) {
          return this.data.get(key) ?? null;
        },
        setItem(key, value) {
          this.data.set(key, value);
        },
        removeItem(key) {
          this.data.delete(key);
        },
      };
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('copies state from a prior build-hash key into the env-only key', async () => {
      const { migrateBuildHashPersistKey } = await import('../../src/utils/common/persistUtils.js');

      const migrated = migrateBuildHashPersistKey({
        storage,
        newKey: 'cart:test',
        baseKey: 'cart',
      });

      expect(migrated).toBe(true);
      expect(storage.getItem('cart:test')).toBe('{"items":["migrated"]}');
    });
  });

  describe('migrateLegacyPersistedState', () => {
    /** @type {Storage} */
    let storage;

    beforeEach(() => {
      storage = {
        data: new Map(),
        getItem(key) {
          return this.data.get(key) ?? null;
        },
        setItem(key, value) {
          this.data.set(key, value);
        },
        removeItem(key) {
          this.data.delete(key);
        },
      };
    });

    it('copies the first legacy value into the new key', () => {
      storage.setItem('cart', '{"items":[]}');

      const migrated = migrateLegacyPersistedState({
        storage,
        newKey: 'cart:production',
        legacyKeys: ['cart'],
      });

      expect(migrated).toBe(true);
      expect(storage.getItem('cart:production')).toBe('{"items":[]}');
    });

    it('removes legacy keys after migration by default', () => {
      storage.setItem('locale_preference', '{"data":{"locale":"vi"}}');

      migrateLegacyPersistedState({
        storage,
        newKey: 'locale_preference:production',
        legacyKeys: ['locale_preference'],
      });

      expect(storage.getItem('locale_preference')).toBeNull();
      expect(storage.getItem('locale_preference:production')).not.toBeNull();
    });

    it('skips migration when the new key already exists', () => {
      storage.setItem('cart:production', '{"items":["kept"]}');
      storage.setItem('cart', '{"items":["legacy"]}');

      const migrated = migrateLegacyPersistedState({
        storage,
        newKey: 'cart:production',
        legacyKeys: ['cart'],
      });

      expect(migrated).toBe(false);
      expect(storage.getItem('cart')).toBe('{"items":["legacy"]}');
    });
  });

  describe('persistStorageAdapter', () => {
    it('forwards removeItem to localStorage', () => {
      const removeItem = vi.fn();
      vi.stubGlobal('localStorage', { removeItem });

      persistStorageAdapter.removeItem('demo-key');

      expect(removeItem).toHaveBeenCalledWith('demo-key');
      vi.unstubAllGlobals();
    });
  });

  describe('attachStorageQuotaMonitor', () => {
    it('registers at most one subscription per store', () => {
      const subscribe = vi.fn();
      const store = { $subscribe: subscribe };

      attachStorageQuotaMonitor(store, { key: 'cart:test', label: 'cart' });
      attachStorageQuotaMonitor(store, { key: 'cart:test', label: 'cart' });

      expect(subscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('resolvePersistTtlMs', () => {
    it('falls back to the default TTL for invalid env values', () => {
      vi.stubEnv('VITE_PERSIST_TTL_MS', 'not-a-number');

      expect(resolvePersistTtlMs()).toBe(90 * 24 * 60 * 60 * 1000);

      vi.unstubAllEnvs();
    });
  });
});
