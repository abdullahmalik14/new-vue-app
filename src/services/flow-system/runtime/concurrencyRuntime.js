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
    return {
      mode: "run",
      key: `${key}:parallel:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
      abortController,
      registerPromise() {},
      release() {},
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

export function cancelInFlight(key, reason = "Cancelled") {
  const current = inFlight.get(key);
  if (!current?.abortController) return false;
  current.abortController.abort(reason);
  inFlight.delete(key);
  return true;
}

export function hasInFlight(key) {
  return inFlight.has(key);
}
