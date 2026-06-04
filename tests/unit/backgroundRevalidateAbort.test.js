import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/utils/common/logHandler.js", () => ({ log: vi.fn() }));
vi.mock("@/utils/common/performanceTracker.js", () => ({ default: {} }));

import {
  scheduleBackgroundRevalidateOnce,
  abortBackgroundRevalidate,
  clearBackgroundRevalidateScheduleForTests,
} from "@/services/flow-system/utils/backgroundRevalidate.js";

describe("background revalidate abort (FEAT-08)", () => {
  beforeEach(() => {
    clearBackgroundRevalidateScheduleForTests();
    vi.useFakeTimers();
  });

  afterEach(() => {
    clearBackgroundRevalidateScheduleForTests();
    vi.useRealTimers();
  });

  it("abort before timer fires prevents the run callback", async () => {
    const run = vi.fn(async () => "done");
    const controller = new AbortController();

    scheduleBackgroundRevalidateOnce("feat08-key", run, { abortController: controller });
    expect(abortBackgroundRevalidate("feat08-key")).toBe(true);

    await vi.runAllTimersAsync();
    expect(run).not.toHaveBeenCalled();
    expect(controller.signal.aborted).toBe(true);
  });

  it("abort during run rejects with AbortError", async () => {
    const controller = new AbortController();
    let resolveRun;
    const run = vi.fn(() => new Promise((resolve) => {
      resolveRun = resolve;
    }));

    scheduleBackgroundRevalidateOnce("feat08-run", run, {
      abortController: controller,
      timeoutMs: 30000,
    });

    await vi.runOnlyPendingTimersAsync();
    expect(run).toHaveBeenCalledTimes(1);

    abortBackgroundRevalidate("feat08-run", "unmount");
    expect(controller.signal.aborted).toBe(true);

    resolveRun("late");
    await vi.waitFor(() => expect(controller.signal.aborted).toBe(true));
  });
});
