import apiWrapper from "@/lib/mock-api-demo/apiWrapper.js";
import { flowRegistry } from "@/services/flow-system/flowRegistry.js";
import { fail, isFlowResult } from "@/services/flow-system/flowTypes.js";
import { normalizeUnknownError } from "@/services/flow-system/flowErrors.js";
import { createPipelineContext } from "@/services/flow-system/pipeline/pipelineContext.js";
import { invalidFlowResult } from "@/services/flow-system/pipeline/pipelineResult.js";
import { runFlowDataPipeline } from "@/services/flow-system/flowDataPipeline.js";
import { withAuth } from "@/services/flow-system/middleware/withAuth.js";
import { withCsrf } from "@/services/flow-system/middleware/withCsrf.js";
import { withRetry } from "@/services/flow-system/middleware/withRetry.js";
import { withTimeout } from "@/services/flow-system/middleware/withTimeout.js";
import { withMetrics } from "@/services/flow-system/middleware/withMetrics.js";
import { patchPipelineProgress } from "@/services/flow-system/utils/flowProgress.js";

function composeMiddlewares(handler, middlewares) {
  return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
}

export const flowMiddlewares = {
  withAuth,
  withCsrf,
  withRetry,
  withTimeout,
  withMetrics,
};

const defaultMiddlewares = [withMetrics, withTimeout, withRetry, withAuth, withCsrf];

function normalizeFlowEntry(flowEntry) {
  if (typeof flowEntry === "function") {
    return { flow: flowEntry };
  }
  return flowEntry || null;
}

function resolveFlowKind(kind, flowName) {
  const raw = String(kind ?? "").toLowerCase().trim();
  if (!raw) {
    return fail({
      code: "INVALID_FLOW_KIND",
      message: `Flow '${flowName}' is missing flowKind.`,
    });
  }
  if (raw === "read" || raw === "query" || raw === "fetch") {
    return "read";
  }
  if (raw === "write" || raw === "mutation" || raw === "action") {
    return "write";
  }
  return fail({
    code: "INVALID_FLOW_KIND",
    message: `Unrecognized flowKind '${kind}' for flow '${flowName}'.`,
  });
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

const _emptyGlobalContext = () => ({
  piniaStores: {},
  stateEngine: null,
});

let _globalContext = _emptyGlobalContext();

export const FlowHandler = {
  /**
   * Replaces global flow context fields (does not merge/accumulate pinia store keys).
   * Call again with the same values for idempotent setup; pass only the fields you intend to set.
   */
  configure({ piniaStores, stateEngine } = {}) {
    if (piniaStores !== undefined) {
      _globalContext.piniaStores = { ...piniaStores };
    }
    if (stateEngine !== undefined) {
      _globalContext.stateEngine = stateEngine;
    }
  },

  /** Clears module-level global context (tests, logout, hot reload). */
  reset() {
    _globalContext = _emptyGlobalContext();
  },

  /** Read-only snapshot for tests and diagnostics (store keys only). */
  getContextSnapshot() {
    return {
      piniaStoreKeys: Object.keys(_globalContext.piniaStores),
      hasStateEngine: _globalContext.stateEngine != null,
    };
  },

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
    const registryFlowKindOrError = resolveFlowKind(flowEntry?.flowKind, flowName);
    if (typeof registryFlowKindOrError === "object" && registryFlowKindOrError?.ok === false) {
      return registryFlowKindOrError;
    }
    if (options.flowKind !== undefined) {
      const optionFlowKindOrError = resolveFlowKind(options.flowKind, flowName);
      if (typeof optionFlowKindOrError === "object" && optionFlowKindOrError?.ok === false) {
        return optionFlowKindOrError;
      }
      if (optionFlowKindOrError !== registryFlowKindOrError) {
        return fail({
          code: "FLOW_KIND_OVERRIDE_NOT_ALLOWED",
          message: `options.flowKind cannot override registry flowKind for '${flowName}'.`,
          details: {
            registryFlowKind: flowEntry?.flowKind,
            requestedFlowKind: options.flowKind,
          },
        });
      }
    }
    const flowKind = registryFlowKindOrError;
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
    if (typeof mapper.toRequest === "function") {
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
    const { flowKind: _ignoredFlowKind, ...runtimeOptions } = options;
    const mergedOptions = {
      ..._globalContext,
      ...runtimeOptions,
      piniaStores: { ..._globalContext.piniaStores, ...(options.piniaStores || {}) },
    };

    const context = createPipelineContext({
      flowName,
      flowEntry,
      flow,
      payload,
      mappedPayload,
      flowKind,
      mapper,
      validators,
      options: mergedOptions,
      rerunFlow: (overrideOptions = {}) => FlowHandler.run(flowName, payload, {
        ...mergedOptions,
        ...overrideOptions,
      }),
      executeFlow: async ({ payload: nextPayload }) => runWithMiddleware({
        payload: nextPayload === undefined ? mappedPayload : nextPayload,
        context,
        api: apiWrapper,
      }),
    });
    context.middlewares = middlewares;

    const progressRef = options.progressRef;
    try {
      patchPipelineProgress(context, { loading: true });
      if (progressRef) progressRef.value = true;
      return await runFlowDataPipeline(context);
    } catch (error) {
      return normalizeUnknownError(error);
    } finally {
      patchPipelineProgress(context, { loading: false });
      if (progressRef) progressRef.value = false;
    }
  },
};

export default FlowHandler;
