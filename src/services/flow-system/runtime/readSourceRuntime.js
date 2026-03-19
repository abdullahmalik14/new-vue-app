import { deepGet, deepSet } from "@/services/flow-system/runtime/destinationRuntime.js";
import { resolveStorage, readCacheEntry, writeCacheEntry } from "@/services/flow-system/runtime/cacheRuntime.js";

const DEFAULT_READ_FROM_CONFIG = {
  enabled: false,
  ttlMs: 30000,
  mode: "staleWhileRevalidate",
  priority: ["pinia", "stateEngine", "local"],
  sources: [],
};

function isPlainObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function mergeConfig(baseConfig, overrideConfig) {
  if (!isPlainObject(baseConfig) || !isPlainObject(overrideConfig)) {
    return overrideConfig === undefined ? baseConfig : overrideConfig;
  }

  const merged = { ...baseConfig };
  Object.entries(overrideConfig).forEach(([key, value]) => {
    if (isPlainObject(value) && isPlainObject(baseConfig[key])) {
      merged[key] = mergeConfig(baseConfig[key], value);
      return;
    }
    merged[key] = value;
  });
  return merged;
}

function normalizeSourceType(type) {
  if (!type) return "";
  if (type === "state") return "stateEngine";
  return String(type);
}

function buildSourceSnapshot({ source, destinationType, data, etag = null, updatedAt = null, expiresAt = null, savedAt = null, staleHint = false }) {
  return {
    hit: true,
    source,
    destinationType,
    data,
    etag,
    updatedAt,
    expiresAt,
    savedAt,
    staleHint,
  };
}

function buildMissSnapshot(source, reason) {
  return {
    hit: false,
    source,
    destinationType: normalizeSourceType(source?.type),
    reason,
  };
}

export function resolveReadFromConfig(context) {
  const pipelineConfig = context?.pipeline?.readFrom || {};
  const overrideConfig = context?.runtimeOptions?.readFromOverride || {};
  const merged = mergeConfig(mergeConfig(DEFAULT_READ_FROM_CONFIG, pipelineConfig), overrideConfig);

  return {
    ...merged,
    enabled: !!merged.enabled,
    ttlMs: Number.isFinite(Number(merged.ttlMs)) ? Number(merged.ttlMs) : DEFAULT_READ_FROM_CONFIG.ttlMs,
    mode: merged.mode === "networkOnStale" ? "networkOnStale" : "staleWhileRevalidate",
    priority: Array.isArray(merged.priority) && merged.priority.length > 0
      ? merged.priority.map((item) => normalizeSourceType(item))
      : [...DEFAULT_READ_FROM_CONFIG.priority],
    sources: Array.isArray(merged.sources) ? merged.sources : [],
  };
}

export function readFromPiniaSource(source, context) {
  const stores = context?.piniaStores;
  if (!stores || !source?.storeId) {
    return buildMissSnapshot(source, "missing_store");
  }

  const store = stores[source.storeId];
  if (!store) {
    return buildMissSnapshot(source, "store_not_found");
  }

  const data = resolveValueByPath(store, source.select);
  if (data === undefined || data === null) {
    return buildMissSnapshot(source, "data_not_found");
  }

  return buildSourceSnapshot({
    source,
    destinationType: "pinia",
    data,
    etag: resolveValueByPath(store, source.etagSelect) ?? null,
    updatedAt: resolveValueByPath(store, source.updatedAtSelect) ?? null,
  });
}

export function readFromStateEngineSource(source, context) {
  const engine = context?.stateEngine;
  if (!engine || typeof engine.getState !== "function" || !source?.key) {
    return buildMissSnapshot(source, "missing_state_engine");
  }

  const data = engine.getState(source.key);
  if (data === undefined || data === null) {
    return buildMissSnapshot(source, "data_not_found");
  }

  return buildSourceSnapshot({
    source,
    destinationType: "stateEngine",
    data,
    etag: source.etagKey ? engine.getState(source.etagKey) ?? null : null,
    updatedAt: source.updatedAtKey ? engine.getState(source.updatedAtKey) ?? null : null,
  });
}

export function readFromLocalSource(source, context) {
  if (!source?.key) {
    return buildMissSnapshot(source, "missing_key");
  }

  const storage = resolveStorage(context?.storage);
  const cacheResult = readCacheEntry({
    storage,
    key: source.key,
    version: source.version,
  });

  if (cacheResult.reason === "version_mismatch") {
    return buildMissSnapshot(source, "version_mismatch");
  }

  if (!cacheResult.record) {
    return buildMissSnapshot(source, cacheResult.reason || "missing");
  }

  const record = cacheResult.record;
  const data = source.select ? deepGet(record.data, source.select) : record.data;

  if (data === undefined || data === null) {
    return buildMissSnapshot(source, "data_not_found");
  }

  return buildSourceSnapshot({
    source,
    destinationType: "local",
    data,
    etag: source.etagKey ? deepGet(record, source.etagKey) : (record.meta?.etag ?? null),
    updatedAt: source.updatedAtKey
      ? deepGet(record, source.updatedAtKey)
      : (record.meta?.updatedAt ?? record.savedAt ?? null),
    expiresAt: Number.isFinite(Number(record.expiresAt)) ? Number(record.expiresAt) : null,
    savedAt: Number.isFinite(Number(record.savedAt)) ? Number(record.savedAt) : null,
    staleHint: cacheResult.reason === "expired",
  });
}

function resolveValueByPath(target, path) {
  if (!path) return target;
  return deepGet(target, path);
}

export function readSourceSnapshot(source, context) {
  const sourceType = normalizeSourceType(source?.type);
  switch (sourceType) {
    case "pinia":
      return readFromPiniaSource(source, context);
    case "stateEngine":
      return readFromStateEngineSource(source, context);
    case "local":
      return readFromLocalSource(source, context);
    default:
      return buildMissSnapshot(source, "unsupported_source");
  }
}

export function readConfiguredSourceSnapshots(context, readFromConfig) {
  if (!readFromConfig?.enabled) return [];

  const snapshots = [];
  (readFromConfig.sources || []).forEach((source) => {
    const snapshot = readSourceSnapshot(source, context);
    if (snapshot?.hit) {
      snapshots.push(snapshot);
    }
  });
  return snapshots;
}

export function selectBestSourceSnapshot(snapshots = [], priority = []) {
  if (!Array.isArray(snapshots) || snapshots.length === 0) return null;

  const priorityIndex = new Map();
  (priority || []).forEach((type, index) => {
    priorityIndex.set(normalizeSourceType(type), index);
  });

  const sorted = [...snapshots].sort((a, b) => {
    const aIndex = priorityIndex.has(a.destinationType)
      ? priorityIndex.get(a.destinationType)
      : Number.MAX_SAFE_INTEGER;
    const bIndex = priorityIndex.has(b.destinationType)
      ? priorityIndex.get(b.destinationType)
      : Number.MAX_SAFE_INTEGER;

    if (aIndex !== bIndex) return aIndex - bIndex;
    return 0;
  });

  return sorted[0] || null;
}

export function isFreshSnapshot(snapshot, ttlMs, nowMs = Date.now()) {
  if (!snapshot?.hit) return false;

  const resolvedTtlMs = Number.isFinite(Number(ttlMs)) ? Number(ttlMs) : null;
  if (resolvedTtlMs === 0) {
    return true;
  }

  const updatedAt = Number(snapshot.updatedAt);
  if (Number.isFinite(updatedAt) && Number.isFinite(resolvedTtlMs) && resolvedTtlMs > 0) {
    return nowMs - updatedAt <= resolvedTtlMs;
  }

  const expiresAt = Number(snapshot.expiresAt);
  if (Number.isFinite(expiresAt)) {
    return nowMs <= expiresAt;
  }

  const savedAt = Number(snapshot.savedAt);
  if (Number.isFinite(savedAt) && Number.isFinite(resolvedTtlMs) && resolvedTtlMs > 0) {
    return nowMs - savedAt <= resolvedTtlMs;
  }

  return false;
}

function resolveTtlMsForRefresh(source, record) {
  if (Number.isFinite(Number(source?.ttlMs))) {
    return Number(source.ttlMs);
  }

  const expiresAt = Number(record?.expiresAt);
  const savedAt = Number(record?.savedAt);
  if (Number.isFinite(expiresAt) && Number.isFinite(savedAt)) {
    return Math.max(0, expiresAt - savedAt);
  }

  return 30000;
}

function writeFreshnessToPiniaSource(source, context, etag, updatedAt) {
  if (!source?.storeId) return;

  const stores = context?.piniaStores;
  if (!stores) return;

  const store = stores[source.storeId];
  if (!store) return;

  if (source.updatedAtSelect) {
    deepSet(store, source.updatedAtSelect, updatedAt);
  }
  if (etag != null && source.etagSelect) {
    deepSet(store, source.etagSelect, etag);
  }
}

function writeFreshnessToStateEngineSource(source, context, etag, updatedAt) {
  const engine = context?.stateEngine;
  if (!engine || typeof engine.setState !== "function") return;

  if (source.updatedAtKey) {
    engine.setState(source.updatedAtKey, updatedAt, { reason: "flow-read-freshness", silent: true });
  }
  if (etag != null && source.etagKey) {
    engine.setState(source.etagKey, etag, { reason: "flow-read-freshness", silent: true });
  }
}

function writeFreshnessToLocalSource(source, context, etag, updatedAt) {
  if (!source?.key) return;

  const storage = resolveStorage(context?.storage);
  const cacheResult = readCacheEntry({
    storage,
    key: source.key,
    version: source.version,
  });
  if (cacheResult.reason === "version_mismatch") return;

  const record = cacheResult.record;
  if (!record) return;

  const nextRecord = {
    ...record,
    meta: { ...(record.meta || {}) },
  };

  if (source.updatedAtKey) {
    deepSet(nextRecord, source.updatedAtKey, updatedAt);
  } else {
    nextRecord.meta.updatedAt = updatedAt;
  }

  if (etag != null) {
    if (source.etagKey) {
      deepSet(nextRecord, source.etagKey, etag);
    } else {
      nextRecord.meta.etag = etag;
    }
  }

  writeCacheEntry({
    storage,
    key: source.key,
    data: nextRecord.data,
    ttlMs: resolveTtlMsForRefresh(source, record),
    version: Number(source.version || nextRecord.version || 1),
    meta: nextRecord.meta,
  });
}

export function writeFreshnessMetaToDestinations(context, etag, updatedAt = Date.now()) {
  const readFromConfig = resolveReadFromConfig(context);
  if (!readFromConfig.enabled) return;

  (readFromConfig.sources || []).forEach((source) => {
    const sourceType = normalizeSourceType(source?.type);
    switch (sourceType) {
      case "pinia":
        writeFreshnessToPiniaSource(source, context, etag, updatedAt);
        break;
      case "stateEngine":
        writeFreshnessToStateEngineSource(source, context, etag, updatedAt);
        break;
      case "local":
        writeFreshnessToLocalSource(source, context, etag, updatedAt);
        break;
      default:
        break;
    }
  });
}
