import FlowHandler from "@/services/flow-system/FlowHandler.js";
import { flowRegistry } from "@/services/flow-system/flowRegistry.js";

function mergeRunOptions(registryOptions = {}, runtimeOptions = {}) {
  const merged = { ...(registryOptions || {}), ...(runtimeOptions || {}) };

  if (registryOptions?.context || runtimeOptions?.context) {
    merged.context = { ...(registryOptions?.context || {}), ...(runtimeOptions?.context || {}) };
  }

  if (registryOptions?.pipeline || runtimeOptions?.pipeline) {
    merged.pipeline = { ...(registryOptions?.pipeline || {}), ...(runtimeOptions?.pipeline || {}) };
  }

  return merged;
}

function createFlowRefreshManager() {
  const intervals = new Map();

  return {
    start({ scopeKey, flowName, flowKey, payload = {}, intervalMs = 30000, options = {}, runImmediately = true }) {
      const resolvedFlowName = flowName || flowKey;
      if (!scopeKey || !resolvedFlowName) {
        throw new Error("flowRefreshManager.start requires scopeKey and flowName");
      }

      if (intervals.has(scopeKey)) {
        clearInterval(intervals.get(scopeKey).timer);
        intervals.delete(scopeKey);
      }

      const run = () => FlowHandler.run(resolvedFlowName, payload, { ...options, forceRefresh: true });

      if (runImmediately) {
        run();
      }

      const timer = setInterval(run, intervalMs);
      intervals.set(scopeKey, { timer, flowName: resolvedFlowName, payload, intervalMs, options });
      return () => this.stop(scopeKey);
    },

    startFromRegistry(flowName, payload = {}, options = {}) {
      const flow = flowRegistry[flowName];
      const refreshConfig = flow?.refresh;
      if (!refreshConfig?.enabled) {
        throw new Error(`Flow '${flowName}' does not have refresh.enabled=true`);
      }

      const scopeKey = options.scopeKey || refreshConfig.scopeKey || flowName;
      const intervalMs = options.intervalMs || refreshConfig.intervalMs || 30000;
      const runOptions = mergeRunOptions(refreshConfig.options, options.runOptions);
      return this.start({
        scopeKey,
        flowName,
        payload,
        intervalMs,
        options: runOptions,
        runImmediately: options.runImmediately !== false,
      });
    },

    stop(scopeKey) {
      const entry = intervals.get(scopeKey);
      if (!entry) return false;
      clearInterval(entry.timer);
      intervals.delete(scopeKey);
      return true;
    },

    stopAll() {
      intervals.forEach((entry) => clearInterval(entry.timer));
      intervals.clear();
    },

    isRunning(scopeKey) {
      return intervals.has(scopeKey);
    },

    list() {
      return Array.from(intervals.entries()).map(([scopeKey, entry]) => ({
        scopeKey,
        flowName: entry.flowName,
        intervalMs: entry.intervalMs,
      }));
    },
  };
}

const flowRefreshManager = createFlowRefreshManager();

export { createFlowRefreshManager };
export default flowRefreshManager;
