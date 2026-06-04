import { assertRegistryDestinationsSafe } from "@/services/flow-system/runtime/destinationRuntime.js";

const VALID_FLOW_KINDS = new Set(["read", "write", "query", "fetch", "mutation", "action"]);
const VALID_CONCURRENCY_POLICIES = new Set(["latestWins", "firstWins", "allowParallel"]);
const VALID_DESTINATION_TYPES = new Set([
  "return",
  "stateEngine",
  "stateEngineFlush",
  "piniaAction",
  "piniaPatch",
  "piniaFlush",
  "local",
  "localFlush",
  "object",
]);

function normalizeEntry(flowName, entry) {
  if (typeof entry === "function") {
    return { flow: entry };
  }
  return entry || null;
}

function pushIssue(issues, flowName, message) {
  issues.push({ flowName, message });
}

function validateRetryConfig(flowName, retry, issues) {
  if (retry == null) return;
  if (typeof retry !== "object" || Array.isArray(retry)) {
    pushIssue(issues, flowName, "pipeline.retry must be an object.");
    return;
  }
  if (retry.enabled !== undefined && typeof retry.enabled !== "boolean") {
    pushIssue(issues, flowName, "pipeline.retry.enabled must be a boolean.");
  }
  if (retry.maxAttempts !== undefined && !Number.isFinite(Number(retry.maxAttempts))) {
    pushIssue(issues, flowName, "pipeline.retry.maxAttempts must be a number.");
  }
}

function validateValidators(flowName, validators, issues) {
  if (validators == null) return;
  if (typeof validators !== "object" || Array.isArray(validators)) {
    pushIssue(issues, flowName, "validators must be an object.");
    return;
  }
  if (validators.payload != null && typeof validators.payload !== "function") {
    pushIssue(issues, flowName, "validators.payload must be a function.");
  }
  if (validators.response != null && typeof validators.response !== "function") {
    pushIssue(issues, flowName, "validators.response must be a function.");
  }
}

function validateConcurrency(flowName, concurrency, issues) {
  if (concurrency == null) return;
  if (typeof concurrency !== "object" || Array.isArray(concurrency)) {
    pushIssue(issues, flowName, "pipeline.concurrency must be an object.");
    return;
  }
  if (concurrency.policy != null && !VALID_CONCURRENCY_POLICIES.has(String(concurrency.policy))) {
    pushIssue(issues, flowName, `pipeline.concurrency.policy must be one of: ${[...VALID_CONCURRENCY_POLICIES].join(", ")}.`);
  }
  if (concurrency.dedupe !== undefined && typeof concurrency.dedupe !== "boolean") {
    pushIssue(issues, flowName, "pipeline.concurrency.dedupe must be a boolean.");
  }
}

function validateCircuitBreaker(flowName, circuitBreaker, issues) {
  if (circuitBreaker == null) return;
  if (typeof circuitBreaker !== "object" || Array.isArray(circuitBreaker)) {
    pushIssue(issues, flowName, "circuitBreaker must be an object.");
    return;
  }
  if (circuitBreaker.enabled !== undefined && typeof circuitBreaker.enabled !== "boolean") {
    pushIssue(issues, flowName, "circuitBreaker.enabled must be a boolean.");
  }
  if (circuitBreaker.failureThreshold !== undefined && !Number.isFinite(Number(circuitBreaker.failureThreshold))) {
    pushIssue(issues, flowName, "circuitBreaker.failureThreshold must be a number.");
  }
  if (circuitBreaker.cooldownMs !== undefined && !Number.isFinite(Number(circuitBreaker.cooldownMs))) {
    pushIssue(issues, flowName, "circuitBreaker.cooldownMs must be a number.");
  }
}

function validateDestination(flowName, dest, index, issues) {
  if (!dest || typeof dest !== "object") {
    pushIssue(issues, flowName, `destinations[${index}] must be an object.`);
    return;
  }
  if (!VALID_DESTINATION_TYPES.has(dest.type)) {
    pushIssue(issues, flowName, `destinations[${index}] has unknown type '${dest.type}'.`);
  }
}

function validateFlowEntry(flowName, rawEntry, issues) {
  const entry = normalizeEntry(flowName, rawEntry);
  if (!entry) {
    pushIssue(issues, flowName, "registry entry is missing.");
    return;
  }

  if (typeof entry.flow !== "function") {
    pushIssue(issues, flowName, "flow must be a function.");
  }

  if (!entry.flowKind || !VALID_FLOW_KINDS.has(String(entry.flowKind).toLowerCase())) {
    pushIssue(issues, flowName, "flowKind must be 'read' or 'write' (or alias).");
  }

  validateValidators(flowName, entry.validators, issues);
  validateCircuitBreaker(flowName, entry.circuitBreaker, issues);

  if (entry.pipeline != null) {
    if (typeof entry.pipeline !== "object" || Array.isArray(entry.pipeline)) {
      pushIssue(issues, flowName, "pipeline must be an object.");
    } else {
      validateRetryConfig(flowName, entry.pipeline.retry, issues);
      validateConcurrency(flowName, entry.pipeline.concurrency, issues);
      if (entry.pipeline.destinations != null) {
        if (!Array.isArray(entry.pipeline.destinations)) {
          pushIssue(issues, flowName, "pipeline.destinations must be an array.");
        } else {
          entry.pipeline.destinations.forEach((dest, index) => {
            validateDestination(flowName, dest, index, issues);
          });
        }
      }
    }
  }

  if (entry.refresh != null) {
    if (typeof entry.refresh !== "object") {
      pushIssue(issues, flowName, "refresh must be an object.");
    } else if (entry.refresh.enabled && !Number.isFinite(Number(entry.refresh.intervalMs))) {
      pushIssue(issues, flowName, "refresh.intervalMs must be a number when refresh.enabled=true.");
    }
  }
}

/**
 * Validates registry shape at boot/import. Throws on first batch of issues.
 * @returns {{ ok: true, flowCount: number }} when valid
 */
export function validateRegistry(registry = {}) {
  const issues = [];

  Object.entries(registry).forEach(([flowName, rawEntry]) => {
    validateFlowEntry(flowName, rawEntry, issues);
  });

  assertRegistryDestinationsSafe(registry);

  if (issues.length > 0) {
    const summary = issues
      .slice(0, 10)
      .map((issue) => `- ${issue.flowName}: ${issue.message}`)
      .join("\n");
    const suffix = issues.length > 10 ? `\n...and ${issues.length - 10} more.` : "";
    throw new Error(`Flow registry validation failed (${issues.length} issue(s)):\n${summary}${suffix}`);
  }

  return { ok: true, flowCount: Object.keys(registry).length };
}
