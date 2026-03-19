import { fail, cancelled, isFlowResult } from "@/services/flow-system/flowTypes.js";

export function mergeMeta(result, extraMeta = {}) {
  if (!isFlowResult(result)) return result;
  return { ...result, meta: { ...(result.meta || {}), ...extraMeta } };
}

export function invalidFlowResult(flowName, details) {
  return fail({
    code: "INVALID_FLOW_RESULT",
    message: `Flow '${flowName}' did not return a valid flow result shape.`,
    details,
  });
}

export function blockedByConcurrency(flowName, key) {
  return cancelled("first_wins_blocked", {
    flow: flowName,
    code: "FLOW_IN_FLIGHT",
    message: `Flow '${flowName}' is already running for this key.`,
    key,
  });
}

export function normalizeExecutionError(error, fallbackCode = "PIPELINE_FAILED") {
  if (error && error.ok === false && error.error) return error;
  return fail({
    code: error?.code || fallbackCode,
    message: error?.message || "Flow execution failed",
    details: error?.details || error || null,
  });
}
