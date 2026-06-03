import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const runMock = vi.fn(async () => ({ ok: true, data: {} }));

vi.mock("@/utils/common/performanceTracker.js", () => ({ default: {} }));
vi.mock("@/utils/common/logHandler.js", () => ({ log: vi.fn() }));
vi.mock("@/services/flow-system/FlowHandler.js", () => ({
  default: { run: (...args) => runMock(...args) },
}));

vi.mock("@/services/flow-system/flowRegistry.js", () => ({
  flowRegistry: {
    "analytics.fetch": { flowKind: "read", refresh: { enabled: true, intervalMs: 5000 } },
  },
}));

import { createFlowRefreshManager } from "@/services/flow-system/flowRefreshManager.js";

describe("flowRefreshManager introspection (FEAT-10)", () => {
  beforeEach(() => {
    runMock.mockClear();
    runMock.mockResolvedValue({ ok: true, data: {} });
  });

  it("exposes lastRunAt, lastSuccessAt, lastError, and nextRunAt via list/get", async () => {
    const manager = createFlowRefreshManager();
    manager.start({
      scopeKey: "feat10",
      flowName: "analytics.fetch",
      intervalMs: 5000,
      runImmediately: true,
    });

    await vi.waitFor(() => expect(runMock).toHaveBeenCalled(), { timeout: 2000 });
    await vi.waitFor(() => {
      const entry = manager.get("feat10");
      expect(entry?.lastRunAt).toBeTypeOf("number");
    }, { timeout: 2000 });
    const entry = manager.get("feat10");
    expect(entry.lastRunAt).toBeTypeOf("number");
    expect(entry.lastSuccessAt).toBeTypeOf("number");
    expect(entry.lastError).toBeNull();
    expect(entry.nextRunAt).toBeTypeOf("number");
    expect(manager.list()[0].scopeKey).toBe("feat10");
    manager.stopAll();
  });
});
