import FlowHandler from "@/services/flow-system/FlowHandler.js";
import { flowRegistry } from "@/services/flow-system/flowRegistry.js";
import { log } from "@/infrastructure/logging/logHandler.js";
import {
  assessCircuit,
  resolveCircuitConfig,
} from "@/services/flow-system/utils/flowCircuitBreaker.js";

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

function resolveBackoffDelayMs(baseIntervalMs, consecutiveFailures, maxBackoffMs) {
  if (consecutiveFailures <= 0) return baseIntervalMs;
  const exponent = Math.min(consecutiveFailures, 6);
  return Math.min(baseIntervalMs * (2 ** exponent), maxBackoffMs);
}

function createIntervalStats() {
  return {
    lastRunAt: null,
    lastSuccessAt: null,
    lastError: null,
    nextRunAt: null,
    consecutiveFailures: 0,
  };
}

function snapshotIntervalEntry(scopeKey, entry) {
  return {
    scopeKey,
    flowName: entry.flowName,
    intervalMs: entry.intervalMs,
    consecutiveFailures: entry.stats.consecutiveFailures,
    lastRunAt: entry.stats.lastRunAt,
    lastSuccessAt: entry.stats.lastSuccessAt,
    lastError: entry.stats.lastError,
    nextRunAt: entry.stats.nextRunAt,
  };
}

function createFlowRefreshManager() {
  const intervals = new Map();

  return {
    start({ scopeKey, flowName, flowKey, payload = {}, intervalMs = 30000, options = {}, runImmediately = false }) {
      const resolvedFlowName = flowName || flowKey;
      if (!scopeKey || !resolvedFlowName) {
        throw new Error("flowRefreshManager.start requires scopeKey and flowName");
      }

      if (intervals.has(scopeKey)) {
        clearTimeout(intervals.get(scopeKey).timer);
        intervals.delete(scopeKey);
      }

      const baseIntervalMs = intervalMs;
      const maxBackoffMs = Number.isFinite(Number(options.maxBackoffMs))
        ? Number(options.maxBackoffMs)
        : baseIntervalMs * 8;
      const stats = createIntervalStats();

      const executeRun = async () => {
        stats.lastRunAt = Date.now();
        const flowEntry = flowRegistry[resolvedFlowName];
        const circuitConfig = resolveCircuitConfig(flowEntry || {}, options);
        const circuitAssessment = assessCircuit(resolvedFlowName, circuitConfig);
        if (!circuitAssessment.allowed) {
          stats.lastError = {
            code: "CIRCUIT_OPEN",
            message: "Refresh skipped while circuit is open.",
            details: circuitAssessment,
          };
          log({
            file: "flowRefreshManager.js",
            method: "executeRun",
            flag: "flow_refresh",
            purpose: "Skipped refresh while circuit is open",
            flowName: resolvedFlowName,
            scopeKey,
            circuit: circuitAssessment,
          });
          return;
        }

        try {
          const result = await FlowHandler.run(resolvedFlowName, payload, { ...options, forceRefresh: true });
          if (!result?.ok) {
            stats.consecutiveFailures += 1;
            stats.lastError = result.error || { code: "FLOW_REFRESH_FAILED", message: "Refresh failed" };
            log({
              file: "flowRefreshManager.js",
              method: "executeRun",
              flag: "flow_refresh",
              purpose: "Flow refresh returned error result",
              flowName: resolvedFlowName,
              scopeKey,
              consecutiveFailures: stats.consecutiveFailures,
              error: result?.error,
            });
          } else {
            stats.consecutiveFailures = 0;
            stats.lastSuccessAt = Date.now();
            stats.lastError = null;
          }
        } catch (error) {
          stats.consecutiveFailures += 1;
          stats.lastError = {
            code: "FLOW_REFRESH_EXCEPTION",
            message: error?.message || "Refresh threw",
          };
          log({
            file: "flowRefreshManager.js",
            method: "executeRun",
            flag: "flow_refresh",
            purpose: "Flow refresh threw",
            flowName: resolvedFlowName,
            scopeKey,
            consecutiveFailures: stats.consecutiveFailures,
            error: error?.message || error,
          });
        }
      };

      const scheduleNext = () => {
        const delayMs = resolveBackoffDelayMs(baseIntervalMs, stats.consecutiveFailures, maxBackoffMs);
        stats.nextRunAt = Date.now() + delayMs;
        const timer = setTimeout(async () => {
          await executeRun();
          if (intervals.has(scopeKey)) {
            scheduleNext();
          }
        }, delayMs);
        intervals.set(scopeKey, {
          timer,
          flowName: resolvedFlowName,
          payload,
          intervalMs: baseIntervalMs,
          options,
          stats,
        });
      };

      intervals.set(scopeKey, {
        timer: null,
        flowName: resolvedFlowName,
        payload,
        intervalMs: baseIntervalMs,
        options,
        stats,
      });

      const kickoff = async () => {
        await executeRun();
        if (intervals.has(scopeKey)) {
          scheduleNext();
        }
      };

      if (runImmediately) {
        void kickoff();
      } else {
        scheduleNext();
      }

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
        runImmediately: options.runImmediately === true,
      });
    },

    stop(scopeKey) {
      const entry = intervals.get(scopeKey);
      if (!entry) return false;
      clearTimeout(entry.timer);
      intervals.delete(scopeKey);
      return true;
    },

    stopAll() {
      intervals.forEach((entry) => clearTimeout(entry.timer));
      intervals.clear();
    },

    isRunning(scopeKey) {
      return intervals.has(scopeKey);
    },

    list() {
      return Array.from(intervals.entries()).map(([scopeKey, entry]) => snapshotIntervalEntry(scopeKey, entry));
    },

    get(scopeKey) {
      const entry = intervals.get(scopeKey);
      if (!entry) return null;
      return snapshotIntervalEntry(scopeKey, entry);
    },
  };
}

const flowRefreshManager = createFlowRefreshManager();

export { createFlowRefreshManager };
export default flowRefreshManager;
