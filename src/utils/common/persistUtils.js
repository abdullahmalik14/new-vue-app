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

export function buildPersistKey(baseKey) {
  const env = import.meta.env.MODE || 'production';
  const buildHash = getAppBuildHash();
  if (buildHash) {
    return `${baseKey}:${env}:${buildHash}`;
  }

  return `${baseKey}:${env}`;
}

export function migrateLegacyPersistedState({ storage, newKey, legacyKeys }) {
  if (!storage || !newKey || !Array.isArray(legacyKeys) || legacyKeys.length === 0) {
    return;
  }

  if (storage.getItem(newKey)) {
    return;
  }

  for (const legacyKey of legacyKeys) {
    const legacyValue = storage.getItem(legacyKey);
    if (legacyValue) {
      storage.setItem(newKey, legacyValue);
      break;
    }
  }
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

export function attachStorageQuotaMonitor(store, { key, warnRatio, label } = {}) {
  if (typeof window === 'undefined' || !store?.$subscribe) {
    return;
  }

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
