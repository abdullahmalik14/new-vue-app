import { log } from "@/infrastructure/logging/logHandler.js";

export function runWithAbortAndTimeout(promiseFactory, { signal, timeoutMs } = {}) {
  if (signal?.aborted) {
    return Promise.reject(new DOMException("Background revalidate aborted", "AbortError"));
  }

  let timeoutId = null;
  const tasks = [Promise.resolve().then(promiseFactory)];

  if (Number.isFinite(timeoutMs) && timeoutMs > 0) {
    tasks.push(new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Background revalidate timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    }));
  }

  if (signal) {
    tasks.push(new Promise((_, reject) => {
      const onAbort = () => reject(new DOMException("Background revalidate aborted", "AbortError"));
      if (signal.aborted) {
        onAbort();
        return;
      }
      signal.addEventListener("abort", onAbort, { once: true });
    }));
  }

  return Promise.race(tasks).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
}

export function runBackgroundRevalidate({
  key,
  run,
  signal,
  timeoutMs,
  onError,
}) {
  return runWithAbortAndTimeout(run, { signal, timeoutMs }).catch((error) => {
    if (typeof onError === "function") {
      onError(error);
      return;
    }
    log({
      file: "backgroundRevalidateRunner.js",
      method: "runBackgroundRevalidate",
      flag: "flow_revalidate",
      purpose: "Background revalidate failed",
      key,
      error: error?.message || error,
    });
  });
}
