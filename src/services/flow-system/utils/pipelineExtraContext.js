import { isPlainObject } from "@/services/flow-system/utils/mergeConfig.js";

export const RESERVED_PIPELINE_CONTEXT_KEYS = new Set([
  "runId",
  "flowName",
  "flow",
  "flowKind",
  "mapper",
  "validators",
  "validatorsDeclared",
  "originalPayload",
  "payload",
  "executeFlow",
  "rerunFlow",
  "progress",
  "requestHeaders",
  "runtimeOptions",
  "revalidateAbortController",
  "pipeline",
  "uiErrorMap",
  "requireAuth",
  "timeoutMs",
  "requestTimeoutMs",
  "totalFlowTimeoutMs",
  "retryAttempts",
  "userId",
  "apiBaseUrl",
  "storage",
  "stateEngine",
  "piniaStores",
  "debug",
  "flowSecurity",
  "signal",
  "attempt",
  "middlewares",
  "destinationState",
  "_stages",
  "_timings",
  "startedAt",
  "backendJwtToken",
  "csrfToken",
  "onStaleRevalidateFailed",
  "staleRevalidateFailures",
  "lastStaleRevalidateError",
]);

/** Keys call sites may pass via options.context / options.extraContext. */
export const ALLOWED_EXTRA_CONTEXT_KEYS = new Set([
  "locale",
  "section",
  "routeName",
  "componentId",
  "traceId",
  "featureFlags",
  "metadata",
  "uiState",
]);

export function pickExtraContext(contextOverrides = {}) {
  if (!isPlainObject(contextOverrides)) {
    return { extra: {}, requestHeaders: {} };
  }

  const extra = {};
  let requestHeaders = {};

  Object.entries(contextOverrides).forEach(([key, value]) => {
    if (RESERVED_PIPELINE_CONTEXT_KEYS.has(key)) {
      return;
    }
    if (key === "requestHeaders" && isPlainObject(value)) {
      requestHeaders = { ...value };
      return;
    }
    if (ALLOWED_EXTRA_CONTEXT_KEYS.has(key)) {
      extra[key] = value;
      return;
    }
    if (import.meta.env?.DEV) {
      console.warn(
        `[flow-system] Dropped unknown context key "${key}" (not in ALLOWED_EXTRA_CONTEXT_KEYS). Use options.extraContext or an allowlisted key.`,
      );
    }
  });

  return { extra, requestHeaders };
}

export function resolveValidatorsDeclared(flowEntry = {}) {
  const validators = flowEntry?.validators;
  if (!validators || typeof validators !== "object") {
    return { payload: false, response: false };
  }
  return {
    payload: Object.prototype.hasOwnProperty.call(validators, "payload"),
    response: Object.prototype.hasOwnProperty.call(validators, "response"),
  };
}
