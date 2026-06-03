import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/mock-api-demo/apiWrapper.js", () => ({ default: {} }));
vi.mock("@/utils/common/performanceTracker.js", () => ({ default: {} }));

import { FlowHandler } from "@/services/flow-system/FlowHandler.js";

describe("FlowHandler flowKind override guard (BP-06)", () => {
  it("rejects options.flowKind that overrides registry kind", async () => {
    const result = await FlowHandler.run("events.fetchEvent", {}, { flowKind: "write" });
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("FLOW_KIND_OVERRIDE_NOT_ALLOWED");
  });

  it("allows options.flowKind that normalizes to the same registry kind", async () => {
    const result = await FlowHandler.run("events.fetchEvent", {}, { flowKind: "query" });
    expect(result.error?.code).not.toBe("FLOW_KIND_OVERRIDE_NOT_ALLOWED");
  });
});
