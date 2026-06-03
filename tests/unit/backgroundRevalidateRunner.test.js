import { describe, expect, it, vi } from "vitest";

import { runWithAbortAndTimeout } from "@/services/flow-system/utils/backgroundRevalidateRunner.js";

vi.mock("@/utils/common/logHandler.js", () => ({ log: vi.fn() }));
vi.mock("@/utils/common/performanceTracker.js", () => ({ default: {} }));

describe("background revalidate runner (FEAT-08)", () => {
  it("rejects when signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(runWithAbortAndTimeout(async () => "ok", { signal: controller.signal }))
      .rejects.toThrow(/aborted/i);
  });

  it("rejects when timeout elapses first", async () => {
    await expect(runWithAbortAndTimeout(
      () => new Promise(() => {}),
      { timeoutMs: 20 },
    )).rejects.toThrow(/timed out/i);
  });
});
