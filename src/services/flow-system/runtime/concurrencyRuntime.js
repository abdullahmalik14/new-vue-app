import { buildPayloadHash } from "@/services/flow-system/runtime/cacheRuntime.js";

const inFlight = new Map();

export function buildConcurrencyKey(flowName, payload, config = {}) {
  if (config.key) return String(config.key);
  const keyByPayload = config.keyByPayload !== false;
  const payloadPart = keyByPayload ? buildPayloadHash(payload) : "shared";
  return `${flowName}:${payloadPart}`;
}

export function acquireRunSlot({ key, policy = "latestWins", dedupe = false }) {
  const existing = inFlight.get(key);

  if (dedupe && existing?.promise) {
    return { mode: "deduped", promise: existing.promise, key };
  }

  if (policy === "allowParallel") {
    const abortController = new AbortController();
    const parallelKey = `${key}:parallel:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    return {
      mode: "run",
      key: parallelKey,
      abortController,
      registerPromise(promise) {
        inFlight.set(parallelKey, { promise, abortController });
      },
      release() {
        const current = inFlight.get(parallelKey);
        if (current?.abortController === abortController) {
          inFlight.delete(parallelKey);
        }
      },
    };
  }

  if (policy === "firstWins" && existing) {
    return { mode: "blocked", key };
  }

  if (policy === "latestWins" && existing?.abortController) {
    existing.abortController.abort("Superseded by latest run");
  }

  const abortController = new AbortController();

  return {
    mode: "run",
    key,
    abortController,
    registerPromise(promise) {
      inFlight.set(key, { promise, abortController });
    },
    release() {
      const current = inFlight.get(key);
      if (current?.abortController === abortController) {
        inFlight.delete(key);
      }
    },
  };
}

const PARALLEL_KEY_MARKER = ":parallel:";

function isParallelChildKey(key, baseKey) {
  return key.startsWith(`${baseKey}${PARALLEL_KEY_MARKER}`);
}

export function cancelInFlight(key, reason = "Cancelled") {
  const current = inFlight.get(key);
  if (!current?.abortController) return false;
  current.abortController.abort(reason);
  inFlight.delete(key);
  return true;
}

/** Cancels exact key and any allowParallel child keys under the same base concurrency key. */
export function cancelInFlightForKey(baseKey, reason = "Cancelled") {
  let cancelled = cancelInFlight(baseKey, reason);
  for (const key of [...inFlight.keys()]) {
    if (isParallelChildKey(key, baseKey)) {
      cancelled = cancelInFlight(key, reason) || cancelled;
    }
  }
  return cancelled;
}

export function hasInFlight(key) {
  return inFlight.has(key);
}

/** True when base key or any allowParallel child slot is in flight. */
export function hasInFlightForKey(baseKey) {
  if (inFlight.has(baseKey)) return true;
  for (const key of inFlight.keys()) {
    if (isParallelChildKey(key, baseKey)) return true;
  }
  return false;
}

export function clearInFlight() {
  inFlight.clear();
}
