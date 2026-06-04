import { runBackgroundRevalidate } from "@/services/flow-system/utils/backgroundRevalidateRunner.js";

/** @type {Map<string, { pending: boolean, timerId: ReturnType<typeof setTimeout> | null, abortController: AbortController }>} */
const scheduledByKey = new Map();

function linkParentAbort(abortController, parentSignal) {
  if (!parentSignal) return;
  if (parentSignal.aborted) {
    abortController.abort(parentSignal.reason || "Parent revalidate signal aborted");
    return;
  }
  parentSignal.addEventListener("abort", () => {
    abortController.abort(parentSignal.reason || "Parent revalidate signal aborted");
  }, { once: true });
}

/**
 * Schedule a background revalidate at most once per key per tick burst.
 * @returns {boolean} true if scheduled (or already pending for this key)
 */
export function scheduleBackgroundRevalidateOnce(key, run, options = {}) {
  if (!key) return false;

  const existing = scheduledByKey.get(key);
  if (existing?.pending) {
    return true;
  }

  const abortController = options.abortController || new AbortController();
  if (options.abortController) {
    if (options.signal && options.signal !== abortController.signal) {
      linkParentAbort(abortController, options.signal);
    }
  } else {
    linkParentAbort(abortController, options.signal);
  }

  const entry = {
    pending: true,
    timerId: null,
    abortController,
  };
  scheduledByKey.set(key, entry);

  entry.timerId = setTimeout(() => {
    entry.pending = false;
    entry.timerId = null;

    if (abortController.signal.aborted) {
      scheduledByKey.delete(key);
      return;
    }

    const task = runBackgroundRevalidate({
      key,
      run,
      signal: abortController.signal,
      timeoutMs: options.timeoutMs,
      onError: options.onError,
    });

    Promise.resolve(task).finally(() => {
      if (scheduledByKey.get(key) === entry) {
        scheduledByKey.delete(key);
      }
    });
  }, 0);

  return true;
}

/**
 * Cancel a scheduled or in-flight background revalidate for the given key.
 * Clears the schedule timer and aborts the linked AbortController.
 */
export function abortBackgroundRevalidate(key, reason = "Cancelled") {
  const entry = scheduledByKey.get(key);
  if (!entry) return false;

  if (entry.timerId != null) {
    clearTimeout(entry.timerId);
    entry.timerId = null;
  }

  if (!entry.abortController.signal.aborted) {
    entry.abortController.abort(reason);
  }

  scheduledByKey.delete(key);
  return true;
}

export function clearBackgroundRevalidateScheduleForTests() {
  scheduledByKey.forEach((entry) => {
    if (entry.timerId != null) {
      clearTimeout(entry.timerId);
    }
    if (!entry.abortController.signal.aborted) {
      try {
        entry.abortController.abort("test_cleanup");
      } catch {
        // Ignore double-abort in tests.
      }
    }
  });
  scheduledByKey.clear();
}

export function getPendingBackgroundRevalidateCountForTests() {
  let count = 0;
  scheduledByKey.forEach((entry) => {
    if (entry.pending) count += 1;
  });
  return count;
}

export function hasScheduledBackgroundRevalidate(key) {
  return scheduledByKey.has(key);
}
