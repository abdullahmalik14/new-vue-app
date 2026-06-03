import { getAppBuildHash } from '../build/appBuildHash.js';

const DEFAULT_PERSIST_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const DEFAULT_STORAGE_WARN_RATIO = 0.8;
const STORAGE_MONITOR_DEBOUNCE_MS = 1500;

export function resolvePersistTtlMs() {
  const raw = import.meta.env.VITE_PERSIST_TTL_MS;
  if (raw === undefined || raw === '') {
    return DEFAULT_PERSIST_TTL_MS;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PERSIST_TTL_MS;
}

export function resolvePersistStorage() {
  if (typeof localStorage === 'undefined') {
    return undefined;
  }

  return localStorage;
}

/**
 * SSR-safe StorageLike adapter for pinia-plugin-persistedstate v4.
 * The plugin expects getItem/setItem on the storage object itself — not a factory.
 */
export const persistStorageAdapter = {
  getItem(key) {
    return resolvePersistStorage()?.getItem(key) ?? null;
  },
  setItem(key, value) {
    resolvePersistStorage()?.setItem(key, value);
  },
  removeItem(key) {
    resolvePersistStorage()?.removeItem(key);
  },
};

/**
 * Build a namespaced persist key.
 * Default: `{baseKey}:{env}` — survives deploys within the same environment.
 * Preload invalidation on deploy is handled by `syncPreloadStoreBuildHash`, not the key.
 *
 * @param {string} baseKey
 * @param {{ includeBuildHash?: boolean }} [options]
 * @returns {string}
 */
export function buildPersistKey(baseKey, { includeBuildHash = false } = {}) {
  const env = import.meta.env.MODE || 'production';

  if (includeBuildHash) {
    const buildHash = getAppBuildHash();
    if (buildHash) {
      return `${baseKey}:${env}:${buildHash}`;
    }
  }

  return `${baseKey}:${env}`;
}

/**
 * Copy persisted state from a prior build-hash key (`{baseKey}:{env}:{hash}`) into the env-only key.
 *
 * @param {{ storage?: Storage, newKey: string, baseKey: string }} options
 * @returns {boolean}
 */
export function migrateBuildHashPersistKey({ storage, newKey, baseKey } = {}) {
  if (!storage || !newKey || !baseKey || storage.getItem(newKey)) {
    return false;
  }

  if (typeof storage.length !== 'number' || typeof storage.key !== 'function') {
    return false;
  }

  const env = import.meta.env.MODE || 'production';
  const prefix = `${baseKey}:${env}:`;

  for (let i = 0; i < storage.length; i++) {
    const candidateKey = storage.key(i);
    if (!candidateKey || !candidateKey.startsWith(prefix) || candidateKey === newKey) {
      continue;
    }

    const legacyValue = storage.getItem(candidateKey);
    if (legacyValue) {
      storage.setItem(newKey, legacyValue);
      return true;
    }
  }

  return false;
}

export function migrateLegacyPersistedState({
  storage,
  newKey,
  legacyKeys,
  removeLegacy = true,
  baseKey,
} = {}) {
  if (!storage || !newKey || !Array.isArray(legacyKeys) || legacyKeys.length === 0) {
    if (baseKey) {
      return migrateBuildHashPersistKey({ storage, newKey, baseKey });
    }
    return false;
  }

  if (storage.getItem(newKey)) {
    return false;
  }

  for (const legacyKey of legacyKeys) {
    const legacyValue = storage.getItem(legacyKey);
    if (legacyValue) {
      storage.setItem(newKey, legacyValue);
      if (removeLegacy) {
        for (const key of legacyKeys) {
          storage.removeItem(key);
        }
      }
      return true;
    }
  }

  if (baseKey) {
    return migrateBuildHashPersistKey({ storage, newKey, baseKey });
  }

  return false;
}

export function createPersistedStateSerializer({
  version = 1,
  ttlMs,
  fallback = {},
  migrate,
  mapBeforeSerialize,
  mapAfterDeserialize,
} = {}) {
  const resolvedTtlMs = typeof ttlMs === 'number' && ttlMs > 0 ? ttlMs : null;
  const resolveFallback = typeof fallback === 'function' ? fallback : () => fallback;

  return {
    serialize(value) {
      const data = mapBeforeSerialize ? mapBeforeSerialize(value) : value;
      const payload = { version, data };

      if (resolvedTtlMs) {
        payload.expiresAt = Date.now() + resolvedTtlMs;
      }

      return JSON.stringify(payload);
    },
    deserialize(raw) {
      try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') {
          return resolveFallback();
        }

        if (typeof parsed.expiresAt === 'number' && Date.now() > parsed.expiresAt) {
          return resolveFallback();
        }

        const rawData = Object.prototype.hasOwnProperty.call(parsed, 'data') ? parsed.data : parsed;
        const fromVersion = typeof parsed.version === 'number' ? parsed.version : 0;
        const migrated = migrate ? migrate(rawData, fromVersion) : rawData;
        const mapped = mapAfterDeserialize ? mapAfterDeserialize(migrated) : migrated;

        return mapped ?? resolveFallback();
      } catch (error) {
        console.warn('[persist] Failed to deserialize state:', error);
        return resolveFallback();
      }
    },
  };
}

export async function checkStorageQuota({ key, label, warnRatio = DEFAULT_STORAGE_WARN_RATIO } = {}) {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) {
    return null;
  }

  const estimate = await navigator.storage.estimate();
  const usage = typeof estimate.usage === 'number' ? estimate.usage : null;
  const quota = typeof estimate.quota === 'number' ? estimate.quota : null;

  if (!usage || !quota) {
    return estimate;
  }

  const ratio = usage / quota;
  if (ratio >= warnRatio) {
    const percent = Math.round(ratio * 100);
    console.warn(
      `[persist] Storage usage at ${percent}% after ${label || key || 'persist'} update`,
      { key, usage, quota },
    );
  }

  return estimate;
}

const storageQuotaMonitoredStores = new WeakSet();

export function attachStorageQuotaMonitor(store, { key, warnRatio, label } = {}) {
  if (typeof window === 'undefined' || !store?.$subscribe) {
    return;
  }

  if (storageQuotaMonitoredStores.has(store)) {
    return;
  }

  storageQuotaMonitoredStores.add(store);

  let timeoutId = null;
  const runCheck = () => {
    void checkStorageQuota({ key, warnRatio, label });
  };

  runCheck();

  store.$subscribe(
    () => {
      if (timeoutId) {
        return;
      }

      timeoutId = window.setTimeout(() => {
        timeoutId = null;
        runCheck();
      }, STORAGE_MONITOR_DEBOUNCE_MS);
    },
    { detached: true },
  );
}
