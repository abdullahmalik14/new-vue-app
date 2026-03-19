const CACHE_PREFIX = "__flow_cache__:";
const memoryCache = new Map();

function stableStringify(value) {
  if (value === null || value === undefined) return String(value);
  if (typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

export function buildPayloadHash(payload) {
  const raw = stableStringify(payload);
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  return String(hash >>> 0);
}

export function resolveStorage(explicitStorage) {
  if (explicitStorage) return explicitStorage;
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }
  } catch (error) {
    return null;
  }
  return null;
}

export function buildCacheKey(flowName, payload, config = {}) {
  const varyByPayload = config.varyByPayload !== false;
  const payloadPart = varyByPayload ? buildPayloadHash(payload) : "shared";
  return `${CACHE_PREFIX}${flowName}:${payloadPart}`;
}

function readFromStorage(storage, key) {
  if (!storage) {
    return memoryCache.has(key) ? memoryCache.get(key) : null;
  }
  const raw = storage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function writeToStorage(storage, key, value) {
  if (!storage) {
    memoryCache.set(key, value);
    return;
  }
  storage.setItem(key, JSON.stringify(value));
}

function removeFromStorage(storage, key) {
  if (!storage) {
    memoryCache.delete(key);
    return;
  }
  storage.removeItem(key);
}

export function readCacheEntry({ storage, key, version }) {
  const record = readFromStorage(storage, key);
  if (!record) return { hit: false, reason: "missing", record: null };

  if (version != null && record.version != null && version !== record.version) {
    return { hit: false, reason: "version_mismatch", record };
  }

  if (record.expiresAt != null && Date.now() > record.expiresAt) {
    return { hit: false, reason: "expired", record };
  }

  return { hit: true, reason: "fresh", record };
}

export function migrateCacheEntry({ storage, key, record, version, migrate }) {
  if (typeof migrate !== "function" || !record) {
    return { migrated: false, record };
  }

  try {
    const nextRecord = migrate(record, version);
    if (nextRecord && typeof nextRecord === "object") {
      writeToStorage(storage, key, nextRecord);
      return { migrated: true, record: nextRecord };
    }
    return { migrated: false, record };
  } catch (error) {
    return { migrated: false, record, error };
  }
}

export function writeCacheEntry({ storage, key, data, ttlMs = 60000, version = 1, meta = {} }) {
  const record = {
    data,
    version,
    meta,
    savedAt: Date.now(),
    expiresAt: ttlMs > 0 ? Date.now() + ttlMs : null,
  };
  writeToStorage(storage, key, record);
  return record;
}

export function flushCacheEntry({ storage, key }) {
  removeFromStorage(storage, key);
}
