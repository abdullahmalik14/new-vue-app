import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const runMock = vi.fn(async () => ({ ok: true }));

vi.mock("@/services/flow-system/FlowHandler.js", () => ({
  default: { run: (...args) => runMock(...args) },
}));

vi.mock("@/services/flow-system/flowRegistry.js", () => ({
  flowRegistry: {
    "analytics.fetch": {
      refresh: { enabled: true, intervalMs: 30000, scopeKey: "analytics.fetch" },
    },
  },
}));

import { createFlowRefreshManager } from "@/services/flow-system/flowRefreshManager.js";

describe("flowRefreshManager runImmediately (PERF-01)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    runMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("startFromRegistry does not run immediately by default", () => {
    const manager = createFlowRefreshManager();
    manager.startFromRegistry("analytics.fetch", { source: "full" });
    expect(runMock).not.toHaveBeenCalled();
    manager.stopAll();
  });

  it("startFromRegistry runs immediately when runImmediately is true", () => {
    const manager = createFlowRefreshManager();
    manager.startFromRegistry("analytics.fetch", { source: "full" }, { runImmediately: true });
    expect(runMock).toHaveBeenCalledTimes(1);
    manager.stopAll();
  });
});
