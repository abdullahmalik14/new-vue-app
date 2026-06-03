import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildPersistKey,
  createPersistedStateSerializer,
  migrateLegacyPersistedState,
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
    it('namespaces keys with mode and optional build hash', () => {
      vi.stubEnv('VITE_BUILD_HASH', 'abc123');

      const key = buildPersistKey('cart');

      expect(key).toContain('cart:');
      expect(key).toContain('abc123');

      vi.unstubAllEnvs();
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

  describe('resolvePersistTtlMs', () => {
    it('falls back to the default TTL for invalid env values', () => {
      vi.stubEnv('VITE_PERSIST_TTL_MS', 'not-a-number');

      expect(resolvePersistTtlMs()).toBe(90 * 24 * 60 * 60 * 1000);

      vi.unstubAllEnvs();
    });
  });
});
