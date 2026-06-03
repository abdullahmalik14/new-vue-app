import { isFlowResult } from "../flowTypes.js";
import { normalizeUnknownError } from "../flowErrors.js";

export function withMetrics(next) {
  return async (args) => {
    const startedAt = Date.now();
    args.context.startedAt = startedAt;

    try {
      const result = await next(args);
      const durationMs = Date.now() - startedAt;

      if (isFlowResult(result)) {
        return {
          ...result,
          meta: { ...(result.meta || {}), durationMs, runId: args.context.runId },
        };
      }

      return result;
    } catch (error) {
      const normalized = normalizeUnknownError(error);
      return {
        ...normalized,
        meta: {
          ...(normalized.meta || {}),
          durationMs: Date.now() - startedAt,
          runId: args.context.runId,
        },
      };
    }
  };
}

