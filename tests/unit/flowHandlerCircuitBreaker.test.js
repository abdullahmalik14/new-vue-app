import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/mock-api-demo/apiWrapper.js", () => ({ default: {} }));
vi.mock("@/utils/common/performanceTracker.js", () => ({ default: {} }));

import { FlowHandler } from "@/services/flow-system/FlowHandler.js";
import {
  recordCircuitOutcome,
  resetCircuit,
  resolveCircuitConfig,
} from "@/services/flow-system/utils/flowCircuitBreaker.js";

describe("FlowHandler circuit breaker integration (FEAT-01)", () => {
  beforeEach(() => {
    FlowHandler.reset();
    resetCircuit();
  });

  it("returns CIRCUIT_OPEN when circuit is already open", async () => {
    const config = resolveCircuitConfig(
      { flowKind: "read" },
      { circuitBreaker: { failureThreshold: 2, cooldownMs: 60000 } },
    );
    const fail = { ok: false, error: { code: "NETWORK_ERROR", message: "down" } };
    recordCircuitOutcome("events.fetchEvent", config, fail);
    recordCircuitOutcome("events.fetchEvent", config, fail);

    const blocked = await FlowHandler.run("events.fetchEvent", { eventId: "cb3" }, {
      circuitBreaker: { failureThreshold: 2, cooldownMs: 60000 },
    });

    expect(blocked.ok).toBe(false);
    expect(blocked.error?.code).toBe("CIRCUIT_OPEN");
    expect(FlowHandler.getCircuitState("events.fetchEvent").state).toBe("open");
  });
});
