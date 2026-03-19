import { mergeMeta, blockedByConcurrency, normalizeExecutionError } from "@/services/flow-system/pipeline/pipelineResult.js";
import { executeWithRetry } from "@/services/flow-system/runtime/retryRuntime.js";
import { buildConcurrencyKey, acquireRunSlot } from "@/services/flow-system/runtime/concurrencyRuntime.js";
import { applyDestinations } from "@/services/flow-system/runtime/destinationRuntime.js";

function resolveIdempotencyKey(context) {
  const config = context.pipeline?.idempotency || {};
  if (!config.enabled) return null;

  if (typeof config.resolve === "function") {
    return config.resolve(context.payload, context);
  }

  if (typeof config.keyFrom === "string") {
    if (!config.keyFrom.includes(".")) {
      return context.payload?.[config.keyFrom] || null;
    }
    const path = config.keyFrom.split(".");
    let current = { payload: context.payload, context };
    for (let i = 0; i < path.length; i += 1) {
      if (current == null || typeof current !== "object") return null;
      current = current[path[i]];
    }
    return current || null;
  }

  return context.runId;
}

async function runWriteOnce(context) {
  return context.executeFlow({ payload: context.payload, context });
}

export async function runWritePipeline(context) {
  const pipeline = context.pipeline || {};
  const concurrencyConfig = pipeline.concurrency || {};
  const concurrencyKey = buildConcurrencyKey(context.flowName, context.payload, concurrencyConfig);
  const slot = acquireRunSlot({
    key: concurrencyKey,
    policy: concurrencyConfig.policy || "firstWins",
    dedupe: !!concurrencyConfig.dedupe,
  });

  if (slot.mode === "deduped") {
    return slot.promise;
  }
  if (slot.mode === "blocked") {
    return blockedByConcurrency(context.flowName, concurrencyKey);
  }

  context.signal = slot.abortController.signal;

  const idempotencyConfig = pipeline.idempotency || {};
  const idempotencyKey = resolveIdempotencyKey(context);
  if (idempotencyConfig.enabled && idempotencyKey) {
    const headerName = idempotencyConfig.headerName || "Idempotency-Key";
    context.requestHeaders = { ...(context.requestHeaders || {}), [headerName]: String(idempotencyKey) };
  }

  const runPromise = (async () => {
    try {
      const result = await executeWithRetry({
        operation: () => runWriteOnce(context),
        retry: pipeline.retry,
        fallbackAttempts: context.retryAttempts,
      });

      if (!result?.ok) {
        return mergeMeta(result, { flow: context.flowName, runId: context.runId, concurrencyKey });
      }

      if (!context.runtimeOptions.skipDestinations) {
        const destinationResult = applyDestinations({
          context,
          flowResult: result,
          destinations: pipeline.destinations || [],
        });
        if (destinationResult.returnData !== undefined) {
          result.data = destinationResult.returnData;
        }
      }

      return mergeMeta(result, {
        flow: context.flowName,
        runId: context.runId,
        concurrencyKey,
        idempotencyKey: idempotencyKey || undefined,
      });
    } catch (error) {
      return mergeMeta(normalizeExecutionError(error, "WRITE_PIPELINE_FAILED"), {
        flow: context.flowName,
        runId: context.runId,
      });
    }
  })();

  slot.registerPromise(runPromise);
  return runPromise.finally(() => slot.release());
}
