import apiWrapper from "@/lib/mock-api-demo/apiWrapper.js";
import { flowRegistry } from "@/services/flow-system/flowRegistry.js";
import { fail, isFlowResult } from "@/services/flow-system/flowTypes.js";
import { normalizeUnknownError } from "@/services/flow-system/flowErrors.js";
import { createPipelineContext } from "@/services/flow-system/pipeline/pipelineContext.js";
import { invalidFlowResult } from "@/services/flow-system/pipeline/pipelineResult.js";
import { runFlowDataPipeline } from "@/services/flow-system/flowDataPipeline.js";
import { withAuth } from "@/services/flow-system/middleware/withAuth.js";
import { withRetry } from "@/services/flow-system/middleware/withRetry.js";
import { withTimeout } from "@/services/flow-system/middleware/withTimeout.js";
import { withMetrics } from "@/services/flow-system/middleware/withMetrics.js";

function composeMiddlewares(handler, middlewares) {
  return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
}

export const flowMiddlewares = {
  withAuth,
  withRetry,
  withTimeout,
  withMetrics,
};

const defaultMiddlewares = []; // [withMetrics, withTimeout, withRetry, withAuth];

function normalizeFlowEntry(flowEntry) {
  if (typeof flowEntry === "function") {
    return { flow: flowEntry };
  }
  return flowEntry || null;
}

function normalizeFlowKind(kind) {
  const raw = String(kind || "").toLowerCase();
  if (raw === "read" || raw === "query" || raw === "fetch") return "read";
  if (raw === "write" || raw === "mutation" || raw === "action") return "write";
  return "write";
}

function normalizeMapper(mapper) {
  if (!mapper) return { toRequest: null, fromResponse: null };
  if (typeof mapper === "function") {
    return { toRequest: mapper, fromResponse: null };
  }

  if (typeof mapper === "object") {
    return {
      toRequest: typeof mapper.toRequest === "function" ? mapper.toRequest : null,
      fromResponse: typeof mapper.fromResponse === "function" ? mapper.fromResponse : null,
    };
  }

  return { toRequest: null, fromResponse: null };
}

function normalizeValidators(validators) {
  if (!validators || typeof validators !== "object") {
    return { payload: null, response: null };
  }

  return {
    payload: typeof validators.payload === "function" ? validators.payload : null,
    response: typeof validators.response === "function" ? validators.response : null,
  };
}

export const FlowHandler = {
  async run(flowName, payload = {}, options = {}) {
    const rawFlowEntry = flowRegistry[flowName];
    if (!rawFlowEntry) {
      return fail({
        code: "FLOW_NOT_FOUND",
        message: `Flow '${flowName}' is not registered.`,
      });
    }

    const flowEntry = normalizeFlowEntry(rawFlowEntry);
    const flow = flowEntry?.flow;
    const flowKind = normalizeFlowKind(options.flowKind || flowEntry?.flowKind);
    const mapper = normalizeMapper(flowEntry?.mapper);
    const validators = normalizeValidators(flowEntry?.validators);
    if (typeof flow !== "function") {
      return fail({
        code: "INVALID_FLOW_ENTRY",
        message: `Flow '${flowName}' is not configured correctly.`,
        details: flowEntry,
      });
    }

    let mappedPayload = payload;
    if (flowKind === "write" && typeof mapper.toRequest === "function") {
      try {
        mappedPayload = mapper.toRequest(payload, options.context || {});
      } catch (error) {
        return fail({
          code: "MAPPER_TO_REQUEST_FAILED",
          message: `toRequest mapper failed for flow '${flowName}'.`,
          details: error,
        });
      }
    }

    const baseHandler = async (args) => {
      const result = await flow(args);
      return isFlowResult(result) ? result : invalidFlowResult(flowName, result);
    };

    const middlewares = options.middlewares || flowEntry.middlewares || defaultMiddlewares;
    const runWithMiddleware = composeMiddlewares(baseHandler, middlewares);
    const context = createPipelineContext({
      flowName,
      flowEntry,
      flow,
      payload,
      mappedPayload,
      flowKind,
      mapper,
      validators,
      options,
      rerunFlow: (overrideOptions = {}) => FlowHandler.run(flowName, payload, {
        ...options,
        ...overrideOptions,
      }),
      executeFlow: async ({ payload: nextPayload }) => runWithMiddleware({
        payload: nextPayload === undefined ? mappedPayload : nextPayload,
        context,
        api: apiWrapper,
      }),
    });
    context.middlewares = middlewares;

    try {
      context.progress.loading = true;
      const result = await runFlowDataPipeline(context);
      context.progress.loading = false;
      return result;
    } catch (error) {
      context.progress.loading = false;
      return normalizeUnknownError(error);
    }
  },
};

export default FlowHandler;
