import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
  scheduleBackgroundRevalidateOnce,
  clearBackgroundRevalidateScheduleForTests,
  getPendingBackgroundRevalidateCountForTests,
} from "@/services/flow-system/utils/backgroundRevalidate.js";

describe("background revalidate dedupe (PERF-06)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearBackgroundRevalidateScheduleForTests();
  });

  afterEach(() => {
    vi.useRealTimers();
    clearBackgroundRevalidateScheduleForTests();
  });

  it("schedules only one rerun per concurrency key per burst", () => {
    const run = vi.fn();
    const key = "events.fetchCreatorEvents:abc123";

    expect(scheduleBackgroundRevalidateOnce(key, run)).toBe(true);
    expect(scheduleBackgroundRevalidateOnce(key, run)).toBe(true);
    expect(getPendingBackgroundRevalidateCountForTests()).toBe(1);

    vi.runAllTimers();
    expect(run).toHaveBeenCalledTimes(1);
    expect(getPendingBackgroundRevalidateCountForTests()).toBe(0);
  });
});
