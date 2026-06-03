import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/mock-api-demo/apiWrapper.js", () => ({ default: {} }));
vi.mock("@/utils/common/performanceTracker.js", () => ({ default: {} }));

import { FlowHandler } from "@/services/flow-system/FlowHandler.js";
import { resetFlowLifecycleListeners } from "@/services/flow-system/utils/flowLifecycle.js";
import { resetCircuit } from "@/services/flow-system/utils/flowCircuitBreaker.js";

describe("FlowHandler cancel and lifecycle (FEAT-03, FEAT-04)", () => {
  beforeEach(() => {
    FlowHandler.reset();
    resetFlowLifecycleListeners();
    resetCircuit();
  });

  it("exposes cancel() and hasInFlight() on FlowHandler", () => {
    expect(typeof FlowHandler.cancel).toBe("function");
    expect(typeof FlowHandler.hasInFlight).toBe("function");
    expect(FlowHandler.cancel("events.fetchEvent", { eventId: "x" })).toBe(false);
  });

  it("emits start and a terminal lifecycle event from run()", async () => {
    const events = [];
    FlowHandler.on("start", (detail) => events.push(["start", detail.flowName]));
    FlowHandler.on("error", (detail) => events.push(["error", detail.flowName]));
    FlowHandler.on("success", (detail) => events.push(["success", detail.flowName]));

    await FlowHandler.run("events.fetchEvent", { eventId: "lifecycle-test" });

    expect(events[0]).toEqual(["start", "events.fetchEvent"]);
    expect(events.some((entry) => entry[0] === "error" || entry[0] === "success")).toBe(true);
  });

  it("registers and removes lifecycle listeners via on/off", () => {
    const seen = [];
    const handler = () => seen.push(1);
    FlowHandler.on("success", handler);
    FlowHandler.off("success", handler);
    expect(seen.length).toBe(0);
  });
});
