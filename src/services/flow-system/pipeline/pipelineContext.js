import { isPlainObject, mergeConfig } from "@/services/flow-system/utils/mergeConfig.js";
import {
  applyBackendJwtToRequestHeaders,
  applyCsrfToRequestHeaders,
  resolveBackendJwtToken,
  resolveCsrfToken,
} from "@/services/flow-system/utils/flowAuthSecrets.js";
import {
  pickExtraContext,
  resolveValidatorsDeclared,
} from "@/services/flow-system/utils/pipelineExtraContext.js";

function makeRunId() {
  return `flow_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function defaultPipelineConfigFor(flowKind) {
  if (flowKind === "read") {
    return {
      timeoutMs: 15000,
      retry: { enabled: true, maxAttempts: 2, baseDelayMs: 250, maxDelayMs: 2000, jitterRatio: 0.15 },
      etag: { enabled: false, varyByPayload: true },
      localCache: { enabled: false, ttlMs: 60000, version: 1 },
      readFrom: {
        enabled: false,
        ttlMs: 30000,
        mode: "staleWhileRevalidate",
        priority: ["pinia", "stateEngine", "local"],
        sources: [],
      },
      concurrency: { policy: "latestWins", dedupe: true, keyByPayload: true },
      destinations: [],
      onNotModified: [],
    };
  }

  return {
    timeoutMs: 15000,
    retry: { enabled: false, maxAttempts: 1, baseDelayMs: 0, maxDelayMs: 0, jitterRatio: 0 },
    concurrency: { policy: "firstWins", dedupe: false, keyByPayload: true },
    idempotency: { enabled: false, headerName: "Idempotency-Key" },
    destinations: [],
  };
}

function mergeCallerRequestHeaders(...headerSets) {
  const merged = {};
  headerSets.forEach((set) => {
    if (isPlainObject(set)) {
      Object.assign(merged, set);
    }
  });
  return merged;
}

export function createPipelineContext({
  flowName,
  flowEntry,
  flow,
  payload,
  mappedPayload,
  flowKind,
  mapper,
  validators,
  options = {},
  rerunFlow,
  executeFlow,
}) {
  const defaultPipeline = defaultPipelineConfigFor(flowKind);
  const registryPipeline = flowEntry.pipeline || {};
  const optionPipeline = options.pipeline || {};
  const pipeline = mergeConfig(mergeConfig(defaultPipeline, registryPipeline), optionPipeline);

  const backendJwtToken = resolveBackendJwtToken(options);
  const csrfToken = resolveCsrfToken(options);
  const contextBag = {
    ...(isPlainObject(options.extraContext) ? options.extraContext : {}),
    ...(isPlainObject(options.context) ? options.context : {}),
  };
  const { extra: extraContext, requestHeaders: extraRequestHeaders } = pickExtraContext(contextBag);

  let requestHeaders = mergeCallerRequestHeaders(
    extraRequestHeaders,
    options.requestHeaders,
  );
  requestHeaders = applyBackendJwtToRequestHeaders(requestHeaders, backendJwtToken);
  requestHeaders = applyCsrfToRequestHeaders(requestHeaders, csrfToken, { flowKind });

  const validatorsDeclared = resolveValidatorsDeclared(flowEntry);

  return {
    ...extraContext,
    runId: makeRunId(),
    flowName,
    flow,
    flowKind,
    mapper,
    validators: validators || {},
    validatorsDeclared,
    originalPayload: payload,
    payload: mappedPayload,
    executeFlow,
    rerunFlow,
    progress: { loading: false, step: "start", attempt: 1 },
    requestHeaders,
    runtimeOptions: {
      forceRefresh: !!options.forceRefresh,
      bypassEtag: !!options.bypassEtag,
      skipDestinations: !!options.skipDestinations,
      skipDestinationRead: !!options.skipDestinationRead,
      backgroundRevalidate: !!options.backgroundRevalidate,
      readFromOverride: options.readFromOverride || null,
      revalidateSignal: options.revalidateSignal || null,
    },
    revalidateAbortController: null,
    pipeline,
    uiErrorMap: pipeline.uiErrorMap || flowEntry.uiErrorMap || null,
    requireAuth: options.requireAuth === true,
    timeoutMs: options.timeoutMs || pipeline.timeoutMs || 15000,
    requestTimeoutMs: options.requestTimeoutMs || pipeline.timeouts?.requestMs || pipeline.timeoutMs || 15000,
    totalFlowTimeoutMs: options.totalFlowTimeoutMs || pipeline.timeouts?.totalFlowMs || pipeline.timeoutMs || 15000,
    retryAttempts: options.retryAttempts,
    userId: options.userId,
    apiBaseUrl: options.apiBaseUrl,
    storage: options.storage,
    stateEngine: options.stateEngine || options.context?.stateEngine,
    piniaStores: options.piniaStores || options.context?.piniaStores,
    debug: !!options.debug,
    flowSecurity: csrfToken ? { csrfToken } : null,
    onStaleRevalidateFailed: options.onStaleRevalidateFailed || null,
    staleRevalidateFailures: 0,
    lastStaleRevalidateError: null,
  };
}
