import { describe, expect, it, beforeEach } from "vitest";

import {
  assessCircuit,
  recordCircuitOutcome,
  resetCircuit,
  resolveCircuitConfig,
} from "@/services/flow-system/utils/flowCircuitBreaker.js";

describe("flow circuit breaker (FEAT-01)", () => {
  beforeEach(() => {
    resetCircuit();
  });

  it("opens circuit after consecutive failures and blocks until cooldown", () => {
    const config = resolveCircuitConfig({}, { circuitBreaker: { failureThreshold: 2, cooldownMs: 5000 } });
    const failResult = { ok: false, error: { code: "NETWORK_ERROR" } };

    recordCircuitOutcome("demo.flow", config, failResult);
    expect(assessCircuit("demo.flow", config).allowed).toBe(true);

    recordCircuitOutcome("demo.flow", config, failResult);
    const blocked = assessCircuit("demo.flow", config);
    expect(blocked.allowed).toBe(false);
    expect(blocked.state).toBe("open");
  });

  it("closes circuit after a successful run", () => {
    const config = resolveCircuitConfig({}, { circuitBreaker: { failureThreshold: 1, cooldownMs: 1000 } });
    recordCircuitOutcome("demo.flow", config, { ok: false, error: { code: "HTTP_500" } });
    expect(assessCircuit("demo.flow", config).allowed).toBe(false);

    resetCircuit();
    recordCircuitOutcome("demo.flow", config, { ok: true, data: {} });
    expect(assessCircuit("demo.flow", config).allowed).toBe(true);
  });
});
