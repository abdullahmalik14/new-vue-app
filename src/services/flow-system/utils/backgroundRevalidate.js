const pendingKeys = new Set();

/**
 * Schedule a background revalidate at most once per key per tick burst.
 * @returns {boolean} true if scheduled, false if already pending for this key
 */
export function scheduleBackgroundRevalidateOnce(key, run) {
  if (!key) return false;
  if (pendingKeys.has(key)) return true;

  pendingKeys.add(key);
  setTimeout(() => {
    pendingKeys.delete(key);
    run();
  }, 0);

  return true;
}

export function clearBackgroundRevalidateScheduleForTests() {
  pendingKeys.clear();
}

export function getPendingBackgroundRevalidateCountForTests() {
  return pendingKeys.size;
}
