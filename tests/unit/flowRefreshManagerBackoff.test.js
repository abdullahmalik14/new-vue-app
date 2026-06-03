import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const runMock = vi.fn(async () => ({ ok: false, error: { code: "ERR", message: "fail" } }));

vi.mock("@/utils/common/performanceTracker.js", () => ({ default: {} }));
vi.mock("@/services/flow-system/FlowHandler.js", () => ({
  default: { run: (...args) => runMock(...args) },
}));
vi.mock("@/utils/common/logHandler.js", () => ({
  log: vi.fn(),
}));

import { createFlowRefreshManager } from "@/services/flow-system/flowRefreshManager.js";

const FLOW_REFRESH_PATH = join(process.cwd(), "src/services/flow-system/flowRefreshManager.js");

describe("flowRefreshManager backoff and errors (BP-08)", () => {
  it("awaits FlowHandler.run, logs failures, and uses backoff scheduling", () => {
    const source = readFileSync(FLOW_REFRESH_PATH, "utf8");
    expect(source).toMatch(/await FlowHandler\.run\(/);
    expect(source).toMatch(/resolveBackoffDelayMs/);
    expect(source).toMatch(/flag:\s*"flow_refresh"/);
    expect(source).not.toMatch(/setInterval\(/);
    expect(source).toMatch(/clearTimeout\(/);
  });

  beforeEach(() => {
    vi.useFakeTimers();
    runMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("backs off polling interval after consecutive failures", async () => {
    const manager = createFlowRefreshManager();
    manager.start({
      scopeKey: "bp08",
      flowName: "analytics.fetch",
      intervalMs: 1000,
      runImmediately: true,
    });

    await vi.waitFor(() => expect(runMock).toHaveBeenCalledTimes(1));
    runMock.mockClear();

    await vi.advanceTimersByTimeAsync(1999);
    expect(runMock).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(runMock).toHaveBeenCalledTimes(1);

    manager.stopAll();
  });
});
