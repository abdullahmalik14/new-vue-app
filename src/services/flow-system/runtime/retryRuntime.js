import { normalizeUnknownError } from "@/services/flow-system/flowErrors.js";
import { mergeMeta } from "@/services/flow-system/pipeline/pipelineResult.js";

function resolveRetryConfig(config = {}, fallbackAttempts) {
  if (config === false) {
    return { enabled: false, maxAttempts: 1, baseDelayMs: 0, maxDelayMs: 0, jitterRatio: 0 };
  }

  if (config === true) {
    return { enabled: true, maxAttempts: fallbackAttempts || 2, baseDelayMs: 250, maxDelayMs: 2000, jitterRatio: 0.15 };
  }

  const enabled = config.enabled !== false;
  return {
    enabled,
    maxAttempts: Number(config.maxAttempts || fallbackAttempts || (enabled ? 2 : 1)),
    baseDelayMs: Number(config.baseDelayMs || 250),
    maxDelayMs: Number(config.maxDelayMs || 5000),
    jitterRatio: Number(config.jitterRatio || 0.15),
  };
}

function shouldRetryResult(result, attempt, retryConfig) {
  if (!retryConfig.enabled) return false;
  if (!result || result.ok) return false;
  if (attempt >= retryConfig.maxAttempts) return false;

  const code = String(result?.error?.code || "");
  if (code === "NETWORK_ERROR" || code === "FLOW_TIMEOUT") return true;
  if (code === "HTTP_429") return true;
  if (code.startsWith("HTTP_5")) return true;
  return false;
}

function computeDelayMs(attempt, retryConfig) {
  const exp = Math.max(1, attempt - 1);
  const base = retryConfig.baseDelayMs * (2 ** exp);
  const capped = Math.min(base, retryConfig.maxDelayMs);
  const jitter = capped * retryConfig.jitterRatio * Math.random();
  return Math.round(capped + jitter);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function executeWithRetry({ operation, retry, fallbackAttempts, onRetry }) {
  const retryConfig = resolveRetryConfig(retry, fallbackAttempts);
  let attempt = 0;
  let lastResult = null;

  while (attempt < retryConfig.maxAttempts) {
    attempt += 1;
    try {
      const result = await operation(attempt);
      lastResult = mergeMeta(result, { attempt });

      if (!shouldRetryResult(lastResult, attempt, retryConfig)) {
        return lastResult;
      }

      const delayMs = computeDelayMs(attempt, retryConfig);
      if (typeof onRetry === "function") {
        onRetry({ attempt, delayMs, result: lastResult });
      }
      await sleep(delayMs);
    } catch (error) {
      lastResult = mergeMeta(normalizeUnknownError(error), { attempt });
      if (!shouldRetryResult(lastResult, attempt, retryConfig)) {
        return lastResult;
      }

      const delayMs = computeDelayMs(attempt, retryConfig);
      if (typeof onRetry === "function") {
        onRetry({ attempt, delayMs, result: lastResult });
      }
      await sleep(delayMs);
    }
  }

  return lastResult || normalizeUnknownError(new Error("Retry exhausted"));
}

