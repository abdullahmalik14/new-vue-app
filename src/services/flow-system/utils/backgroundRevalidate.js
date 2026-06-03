import { runBackgroundRevalidate } from "@/services/flow-system/utils/backgroundRevalidateRunner.js";

const pendingKeys = new Set();
const activeTasks = new Map();

/**
 * Schedule a background revalidate at most once per key per tick burst.
 * @returns {boolean} true if scheduled, false if already pending for this key
 */
export function scheduleBackgroundRevalidateOnce(key, run, options = {}) {
  if (!key) return false;
  if (pendingKeys.has(key)) return true;

  pendingKeys.add(key);
  setTimeout(() => {
    pendingKeys.delete(key);
    const task = runBackgroundRevalidate({ key, run, ...options });
    activeTasks.set(key, task);
    Promise.resolve(task).finally(() => {
      if (activeTasks.get(key) === task) {
        activeTasks.delete(key);
      }
    });
  }, 0);

  return true;
}

export function abortBackgroundRevalidate(key, reason = "Cancelled") {
  const task = activeTasks.get(key);
  pendingKeys.delete(key);
  activeTasks.delete(key);
  return !!task;
}

export function clearBackgroundRevalidateScheduleForTests() {
  pendingKeys.clear();
  activeTasks.clear();
}

export function getPendingBackgroundRevalidateCountForTests() {
  return pendingKeys.size;
}
