import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/utils/common/logHandler.js", () => ({ log: vi.fn() }));

import { log } from "@/utils/common/logHandler.js";
import { recordStaleRevalidateFailure } from "@/services/flow-system/pipeline/readPipeline.js";

describe("recordStaleRevalidateFailure (BUG-21)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("increments failure counter and stores last error", () => {
    const context = {
      flowName: "orders.fetch",
      runId: "run-1",
      staleRevalidateFailures: 1,
    };

    recordStaleRevalidateFailure(context, { error: "network down" });

    expect(context.staleRevalidateFailures).toBe(2);
    expect(context.lastStaleRevalidateError).toBe("network down");
    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "recordStaleRevalidateFailure",
        flowName: "orders.fetch",
        failures: 2,
      }),
    );
  });

  it("invokes onStaleRevalidateFailed when provided", () => {
    const onStaleRevalidateFailed = vi.fn();
    const context = {
      flowName: "events.fetchCreatorEvents",
      runId: "run-2",
      onStaleRevalidateFailed,
    };

    recordStaleRevalidateFailure(context, new Error("timeout"));

    expect(onStaleRevalidateFailed).toHaveBeenCalledWith({
      flowName: "events.fetchCreatorEvents",
      runId: "run-2",
      error: "timeout",
      failures: 1,
    });
  });
});
