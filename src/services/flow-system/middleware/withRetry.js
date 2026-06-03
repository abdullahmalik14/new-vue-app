import { normalizeUnknownError } from "../flowErrors.js";
import { emitFlowLifecycle } from "@/services/flow-system/utils/flowLifecycle.js";

function shouldRetry(flowError) {
  const code = flowError?.error?.code || "";
  if (code === "NETWORK_ERROR") return true;
  if (code.startsWith("HTTP_5")) return true;
  return false;
}

export function withRetry(next) {
  return async (args) => {
    const maxAttempts = Number(args?.context?.retryAttempts || 1);
    let attempt = 0;
    let lastResult = null;

    while (attempt < maxAttempts) {
      attempt += 1;
      args.context.attempt = attempt;

      const result = await next(args);
      if (result?.ok) return result;

      lastResult = result;
      if (!shouldRetry(result)) return result;

      emitFlowLifecycle("retry", {
        flowName: args.context?.flowName,
        runId: args.context?.runId,
        attempt: attempt + 1,
        maxAttempts,
        error: result?.error,
      });
    }

    return normalizeUnknownError(lastResult);
  };
}

