import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/mock-api-demo/apiWrapper.js", () => ({ default: {} }));
vi.mock("@/utils/common/performanceTracker.js", () => ({ default: {} }));

import { FlowHandler } from "@/services/flow-system/FlowHandler.js";
import {
  acquireRunSlot,
  buildConcurrencyKey,
  cancelInFlightForKey,
} from "@/services/flow-system/runtime/concurrencyRuntime.js";
import { clearInFlight } from "@/services/flow-system/runtime/concurrencyRuntime.js";

describe("FlowHandler cancel abort (FEAT-03)", () => {
  beforeEach(() => {
    FlowHandler.reset();
    clearInFlight();
  });

  it("cancelInFlightForKey aborts the slot AbortSignal", async () => {
    const baseKey = buildConcurrencyKey("demo.slow", { id: 1 });
    const slot = acquireRunSlot({ key: baseKey, policy: "latestWins" });

    let aborted = false;
    slot.abortController.signal.addEventListener("abort", () => {
      aborted = true;
    });

    slot.registerPromise(new Promise(() => {}));
    expect(cancelInFlightForKey(baseKey)).toBe(true);
    expect(aborted).toBe(true);
    slot.release();
  });

  it("FlowHandler.cancel returns true when a latestWins run is in flight", async () => {
    const flowName = "events.fetchEvent";
    const payload = { eventId: "cancel-test" };

    const slot = acquireRunSlot({
      key: buildConcurrencyKey(flowName, payload, { policy: "latestWins", keyByPayload: true }),
      policy: "latestWins",
    });
    slot.registerPromise(new Promise(() => {}));

    const cancelled = FlowHandler.cancel(flowName, payload);
    expect(cancelled).toBe(true);
    expect(FlowHandler.hasInFlight(flowName, payload)).toBe(false);

    slot.release();
  });
});
