import { describe, expect, it } from "vitest";

import {
  assertDestinationConfigSafe,
  assertRegistryDestinationsSafe,
  sanitizeDestinationValue,
} from "@/services/flow-system/runtime/destinationRuntime.js";

describe("destinationRuntime sanitization (SEC-06)", () => {
  it("strips prototype pollution keys from destination values", () => {
    const polluted = JSON.parse('{"__proto__":{"polluted":true},"safe":1}');
    const sanitized = sanitizeDestinationValue(polluted);

    expect(sanitized).toEqual({ safe: 1 });
    expect({}.polluted).toBeUndefined();
  });

  it("keeps @now sentinel for config validation and expands at runtime", async () => {
    const { applyDestinations } = await import("@/services/flow-system/runtime/destinationRuntime.js");
    const value = { ts: "@now", nested: { __proto__: { x: 1 }, ok: true } };
    const configShape = sanitizeDestinationValue(value);

    expect(configShape.ts).toBe("@now");
    expect(configShape.nested).toEqual({ ok: true });

    const { returnData } = applyDestinations({
      context: {},
      flowResult: { data: {} },
      destinations: [{ type: "return", value }],
    });
    expect(typeof returnData.ts).toBe("number");
    expect(returnData.nested).toEqual({ ok: true });
  });

  it("rejects forbidden select path segments at registry validation", () => {
    expect(() => assertDestinationConfigSafe({ select: "data.__proto__.x" }))
      .toThrow(/forbidden segment/);
  });

  it("assertRegistryDestinationsSafe passes for clean registry snippet", () => {
    expect(() => assertRegistryDestinationsSafe({
      "demo.read": {
        pipeline: {
          destinations: [{ type: "return", select: "items" }],
        },
      },
    })).not.toThrow();
  });
});
