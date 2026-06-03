const circuits = new Map();

const DEFAULT_CIRCUIT_CONFIG = {
  enabled: true,
  failureThreshold: 5,
  cooldownMs: 30000,
};

const NON_FAILURE_CODES = new Set([
  "CIRCUIT_OPEN",
  "FLOW_NOT_FOUND",
  "INVALID_FLOW_KIND",
  "FLOW_KIND_OVERRIDE_NOT_ALLOWED",
  "INVALID_FLOW_ENTRY",
  "MAPPER_TO_REQUEST_FAILED",
  "VALIDATION_FAILED",
]);

function getEntry(flowName) {
  return circuits.get(flowName) || {
    state: "closed",
    consecutiveFailures: 0,
    openedAt: 0,
  };
}

function setEntry(flowName, entry) {
  circuits.set(flowName, entry);
}

export function resolveCircuitConfig(flowEntry = {}, options = {}) {
  const merged = {
    ...DEFAULT_CIRCUIT_CONFIG,
    ...(flowEntry.circuitBreaker || {}),
    ...(options.circuitBreaker || {}),
  };
  return {
    enabled: merged.enabled !== false,
    failureThreshold: Math.max(1, Number(merged.failureThreshold) || DEFAULT_CIRCUIT_CONFIG.failureThreshold),
    cooldownMs: Math.max(1000, Number(merged.cooldownMs) || DEFAULT_CIRCUIT_CONFIG.cooldownMs),
  };
}

export function shouldCountCircuitFailure(result) {
  if (!result || result.ok) return false;
  const code = result.error?.code || "";
  return !NON_FAILURE_CODES.has(code);
}

export function assessCircuit(flowName, config) {
  if (!config?.enabled) {
    return { allowed: true, state: "closed" };
  }

  const entry = getEntry(flowName);
  const now = Date.now();

  if (entry.state === "open") {
    if (now - entry.openedAt >= config.cooldownMs) {
      entry.state = "half-open";
      setEntry(flowName, entry);
      return { allowed: true, state: "half-open" };
    }
    return {
      allowed: false,
      state: "open",
      retryAfterMs: Math.max(0, config.cooldownMs - (now - entry.openedAt)),
    };
  }

  return { allowed: true, state: entry.state };
}

export function recordCircuitOutcome(flowName, config, result) {
  if (!config?.enabled) return getCircuitSnapshot(flowName);

  const entry = getEntry(flowName);

  if (result?.ok) {
    setEntry(flowName, { state: "closed", consecutiveFailures: 0, openedAt: 0 });
    return getCircuitSnapshot(flowName);
  }

  if (!shouldCountCircuitFailure(result)) {
    return getCircuitSnapshot(flowName);
  }

  if (entry.state === "half-open") {
    setEntry(flowName, {
      state: "open",
      consecutiveFailures: config.failureThreshold,
      openedAt: Date.now(),
    });
    return getCircuitSnapshot(flowName);
  }

  const consecutiveFailures = entry.consecutiveFailures + 1;
  if (consecutiveFailures >= config.failureThreshold) {
    setEntry(flowName, {
      state: "open",
      consecutiveFailures,
      openedAt: Date.now(),
    });
  } else {
    setEntry(flowName, {
      state: "closed",
      consecutiveFailures,
      openedAt: 0,
    });
  }

  return getCircuitSnapshot(flowName);
}

export function getCircuitSnapshot(flowName) {
  const entry = getEntry(flowName);
  return {
    flowName,
    state: entry.state,
    consecutiveFailures: entry.consecutiveFailures,
    openedAt: entry.openedAt,
  };
}

export function resetCircuit(flowName) {
  if (flowName) {
    circuits.delete(flowName);
    return;
  }
  circuits.clear();
}
