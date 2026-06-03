import { resolveStorage, writeCacheEntry, flushCacheEntry } from "@/services/flow-system/runtime/cacheRuntime.js";

const FORBIDDEN_OBJECT_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function sanitizeDestinationShape(value, { expandNow } = {}) {
  if (value === "@now") {
    return expandNow ? Date.now() : "@now";
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeDestinationShape(item, { expandNow }));
  }
  if (value && typeof value === "object") {
    const safe = Object.create(null);
    Object.entries(value).forEach(([key, nested]) => {
      if (FORBIDDEN_OBJECT_KEYS.has(key)) return;
      safe[key] = sanitizeDestinationShape(nested, { expandNow });
    });
    if (!expandNow) return safe;
    try {
      return structuredClone(safe);
    } catch {
      return safe;
    }
  }
  return value;
}

export function sanitizeDestinationValue(value) {
  return sanitizeDestinationShape(value, { expandNow: false });
}

export function assertDestinationConfigSafe(dest) {
  if (!dest || typeof dest !== "object") return;
  if (dest.value !== undefined) {
    sanitizeDestinationValue(dest.value);
  }
  if (typeof dest.select === "string") {
    const invalidSegment = dest.select.split(".").find((segment) => FORBIDDEN_OBJECT_KEYS.has(segment));
    if (invalidSegment) {
      throw new Error(`destination select path contains forbidden segment '${invalidSegment}'`);
    }
  }
}

export function assertRegistryDestinationsSafe(registry = {}) {
  Object.entries(registry).forEach(([flowName, entry]) => {
    const destinations = entry?.pipeline?.destinations;
    if (!Array.isArray(destinations)) return;
    destinations.forEach((dest, index) => {
      try {
        assertDestinationConfigSafe(dest);
      } catch (error) {
        throw new Error(`Invalid destination[${index}] in flow '${flowName}': ${error.message}`);
      }
    });
  });
}

export function deepGet(value, path) {
  if (!path) return value;
  if (typeof path !== "string") return value;

  const keys = path.split(".");
  let current = value;
  for (let i = 0; i < keys.length; i += 1) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[keys[i]];
  }
  return current;
}

export function deepSet(target, path, value) {
  const keys = path.split(".");
  let current = target;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== "object") current[key] = {};
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

function resolveSelectedData(sourceData, select) {
  return select ? deepGet(sourceData, select) : sourceData;
}

function resolveRuntimeValue(value) {
  return sanitizeDestinationShape(value, { expandNow: true });
}

function applyStateEngineDestination(dest, selectedData, context) {
  const engine = context.stateEngine;
  if (!engine || typeof dest.key !== "string") return;

  const mode = dest.mode || "set";
  if (mode === "set" && typeof engine.setState === "function") {
    engine.setState(dest.key, selectedData, { reason: "flow-destination", silent: !!dest.silent });
    return;
  }

  if (mode === "merge" && typeof engine.getState === "function" && typeof engine.setState === "function") {
    const prev = engine.getState(dest.key) || {};
    const patch = sanitizeDestinationValue(selectedData || {});
    const merged = { ...prev, ...(patch || {}) };
    engine.setState(dest.key, merged, { reason: "flow-destination", silent: !!dest.silent });
    return;
  }

  if (mode === "push" && typeof engine.getState === "function" && typeof engine.setState === "function") {
    const prev = engine.getState(dest.key);
    const next = Array.isArray(prev) ? [...prev, selectedData] : [selectedData];
    engine.setState(dest.key, next, { reason: "flow-destination", silent: !!dest.silent });
    return;
  }

  if (mode === "flush" && typeof engine.setState === "function") {
    engine.setState(dest.key, dest.flushValue ?? null, { reason: "flow-destination", silent: !!dest.silent });
  }
}

function applyPiniaDestination(dest, selectedData, context, flowResult) {
  const stores = context.piniaStores;
  if (!stores || !dest.storeId) return;
  const store = stores[dest.storeId];
  if (!store) return;

  if (dest.type === "piniaAction" && typeof store[dest.action] === "function") {
    const actionInput = typeof dest.map === "function"
      ? dest.map(selectedData, context, flowResult)
      : selectedData;
    if (Array.isArray(actionInput)) {
      store[dest.action](...actionInput);
    } else {
      store[dest.action](actionInput);
    }
    return;
  }

  if (dest.type === "piniaPatch" && typeof store.$patch === "function") {
    const rawPatch = typeof dest.patch === "function" ? dest.patch(selectedData, context) : dest.patch || {};
    store.$patch(sanitizeDestinationValue(rawPatch));
    return;
  }

  if (dest.type === "piniaFlush" && typeof store.$reset === "function") {
    store.$reset();
  }
}

function applyLocalDestination(dest, selectedData, context) {
  const storage = resolveStorage(context.storage);
  if (!dest.key) return;

  if (dest.type === "localFlush") {
    flushCacheEntry({ storage, key: dest.key });
    return;
  }

  writeCacheEntry({
    storage,
    key: dest.key,
    data: selectedData,
    ttlMs: Number(dest.ttlMs || 60000),
    version: Number(dest.version || 1),
    meta: { source: "destination.local", runId: context.runId },
  });
}

function applyObjectDestination(dest, selectedData, context) {
  const target = context.destinationState;
  if (!target || typeof dest.key !== "string") return;
  deepSet(target, dest.key, selectedData);
}

export function applyDestinations({ context, flowResult, destinations = [] }) {
  if (!Array.isArray(destinations) || destinations.length === 0) {
    return { returnData: undefined };
  }

  let returnData;
  destinations.forEach((dest) => {
    const selectedData = dest.value !== undefined
      ? resolveRuntimeValue(dest.value)
      : resolveSelectedData(flowResult.data, dest.select);
    switch (dest.type) {
      case "return":
        returnData = selectedData;
        break;
      case "stateEngine":
      case "stateEngineFlush":
        applyStateEngineDestination(dest, selectedData, context);
        break;
      case "piniaAction":
      case "piniaPatch":
      case "piniaFlush":
        applyPiniaDestination(dest, selectedData, context, flowResult);
        break;
      case "local":
      case "localFlush":
        applyLocalDestination(dest, selectedData, context);
        break;
      case "object":
        applyObjectDestination(dest, selectedData, context);
        break;
      default:
        break;
    }
  });

  return { returnData };
}
