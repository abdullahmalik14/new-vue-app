import { fail, cancelled } from "@/services/flow-system/flowTypes.js";
import { normalizeUnknownError } from "@/services/flow-system/flowErrors.js";
import { mergeMeta } from "@/services/flow-system/pipeline/pipelineResult.js";
import { runReadPipeline } from "@/services/flow-system/pipeline/readPipeline.js";
import { runWritePipeline } from "@/services/flow-system/pipeline/writePipeline.js";

function nowMs() {
  return Date.now();
}

function asValidationResult(rawResult) {
  if (rawResult === true || rawResult == null) return { ok: true, errors: [] };
  if (rawResult === false) return { ok: false, errors: ["Validation failed"] };
  if (typeof rawResult === "string") return { ok: false, errors: [rawResult] };
  if (Array.isArray(rawResult)) return { ok: rawResult.length === 0, errors: rawResult };
  if (typeof rawResult === "object") {
    if (typeof rawResult.ok === "boolean") return { ok: rawResult.ok, errors: rawResult.errors || [] };
    if (Array.isArray(rawResult.errors)) return { ok: rawResult.errors.length === 0, errors: rawResult.errors };
  }
  return { ok: true, errors: [] };
}

function mapUiError(code, uiErrorMap) {
  if (!uiErrorMap) return null;
  if (typeof uiErrorMap === "function") return uiErrorMap(code);
  if (typeof uiErrorMap !== "object") return null;
  return uiErrorMap[code] || null;
}

async function validateBy(validator, value, context, stage) {
  if (typeof validator !== "function") {
    return { ok: true, errors: [] };
  }

  try {
    const raw = await validator(value, context);
    return asValidationResult(raw);
  } catch (error) {
    return {
      ok: false,
      errors: [error?.message || `${stage} validator threw an error`],
      details: error,
    };
  }
}

export function markStage(context, stageName) {
  const timestamp = nowMs();
  if (!Array.isArray(context._stages)) {
    context._stages = [];
  }
  context._stages.push({ stage: stageName, at: timestamp });
  context.progress.step = stageName;
  return timestamp;
}

export function recordTiming(context, stageName, startedAt) {
  const durationMs = Math.max(0, nowMs() - startedAt);
  if (!Array.isArray(context._timings)) {
    context._timings = [];
  }
  context._timings.push({ stage: stageName, durationMs });
  return durationMs;
}

export function debugLog(context, ...args) {
  if (!context.debug) return;
  // eslint-disable-next-line no-console
  console.log("[flowDataPipeline]", context.flowName, ...args);
}

export async function validatePayload(context) {
  const startedAt = markStage(context, "validate:payload");
  const result = await validateBy(context.validators?.payload, context.originalPayload, context, "payload");
  recordTiming(context, "validate:payload", startedAt);
  return result;
}

export async function validateResponse(context, flowResult) {
  if (!flowResult?.ok || flowResult?.meta?.notModified) {
    return { ok: true, errors: [] };
  }
  const startedAt = markStage(context, "validate:response");
  const result = await validateBy(context.validators?.response, flowResult.data, context, "response");
  recordTiming(context, "validate:response", startedAt);
  return result;
}

export function formatUiErrors(context, normalizedError) {
  const code = normalizedError?.error?.code;
  const mapped = mapUiError(code, context.uiErrorMap);
  if (!mapped) return [];
  if (Array.isArray(mapped)) return mapped;
  return [String(mapped)];
}

export function normalizeError(context, error, stage = "unknown") {
  const normalized = normalizeUnknownError(error);
  return mergeMeta(normalized, {
    flow: context.flowName,
    runId: context.runId,
    stage,
    timings: context._timings || [],
  });
}

export function finalizeSuccess(context, flowResult) {
  return mergeMeta(flowResult, {
    flow: context.flowName,
    runId: context.runId,
    timings: context._timings || [],
    stages: context._stages || [],
  });
}

export function finalizeError(context, flowResult, stage = "unknown") {
  const normalized = normalizeError(context, flowResult, stage);
  const uiErrors = formatUiErrors(context, normalized);
  if (uiErrors.length > 0) {
    normalized.meta = { ...(normalized.meta || {}), uiErrors };
  }
  return normalized;
}

export function finalizeCancelled(context, reason = "cancelled") {
  return mergeMeta(cancelled(reason), {
    flow: context.flowName,
    runId: context.runId,
    timings: context._timings || [],
    stages: context._stages || [],
  });
}

export async function executeWithTimeout(promise, timeoutMs, onTimeout) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return promise;
  }

  let timerId = null;
  const timeoutPromise = new Promise((resolve) => {
    timerId = setTimeout(() => {
      resolve(typeof onTimeout === "function" ? onTimeout() : fail({
        code: "FLOW_TOTAL_TIMEOUT",
        message: `Flow timed out after ${timeoutMs}ms`,
      }));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timerId);
  }
}

export async function runFlowDataPipeline(context) {
  const startAt = markStage(context, "prepare");
  recordTiming(context, "prepare", startAt);

  const payloadValidation = await validatePayload(context);
  if (!payloadValidation.ok) {
    return finalizeError(context, fail({
      code: "PAYLOAD_VALIDATION_FAILED",
      message: "Payload validation failed.",
      details: payloadValidation.errors,
    }), "validate:payload");
  }

  markStage(context, "execute");
  const executionPromise = context.flowKind === "read"
    ? runReadPipeline(context)
    : runWritePipeline(context);

  const flowResult = await executeWithTimeout(
    executionPromise,
    context.totalFlowTimeoutMs,
    () => fail({
      code: "FLOW_TOTAL_TIMEOUT",
      message: `Flow timed out after ${context.totalFlowTimeoutMs}ms`,
    }, { cancelled: true, reason: "total_timeout" })
  );

  if (!flowResult?.ok) {
    if (flowResult?.status === "cancelled" || flowResult?.meta?.cancelled) {
      return finalizeCancelled(context, flowResult?.meta?.reason || "cancelled");
    }
    return finalizeError(context, flowResult, "execute");
  }

  const responseValidation = await validateResponse(context, flowResult);
  if (!responseValidation.ok) {
    return finalizeError(context, fail({
      code: "RESPONSE_VALIDATION_FAILED",
      message: "Response validation failed.",
      details: responseValidation.errors,
    }), "validate:response");
  }

  debugLog(context, "success", { flow: context.flowName });
  return finalizeSuccess(context, flowResult);
}

