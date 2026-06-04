import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { validateRegistry } from "@/services/flow-system/registry/validateRegistry.js";

const FLOW_REGISTRY_PATH = join(process.cwd(), "src/services/flow-system/flowRegistry.js");

describe("validateRegistry (FEAT-06)", () => {
  it("is invoked at flowRegistry module load", () => {
    const source = readFileSync(FLOW_REGISTRY_PATH, "utf8");
    expect(source).toMatch(/validateRegistry\(flowRegistry\)/);
  });

  it("accepts a minimal valid registry entry", () => {
    const result = validateRegistry({
      "demo.read": {
        flowKind: "read",
        flow: async () => ({ ok: true }),
        pipeline: {
          retry: { enabled: true, maxAttempts: 2 },
          destinations: [{ type: "return", select: "data" }],
        },
      },
    });
    expect(result.flowCount).toBe(1);
  });

  it("throws for invalid registry entries", () => {
    expect(() => validateRegistry({
      "bad.flow": { flowKind: "read", pipeline: { retry: "nope" } },
    })).toThrow(/registry validation failed/i);
  });

  it("throws when validators.response is not a function", () => {
    expect(() => validateRegistry({
      "bad.validators": {
        flowKind: "read",
        flow: async () => ({ ok: true }),
        validators: { response: "not-fn" },
      },
    })).toThrow(/validators\.response must be a function/i);
  });

  it("throws for unknown concurrency policy", () => {
    expect(() => validateRegistry({
      "bad.concurrency": {
        flowKind: "read",
        flow: async () => ({ ok: true }),
        pipeline: { concurrency: { policy: "invalidPolicy" } },
      },
    })).toThrow(/concurrency\.policy/i);
  });

  it("throws for invalid circuitBreaker.failureThreshold", () => {
    expect(() => validateRegistry({
      "bad.circuit": {
        flowKind: "read",
        flow: async () => ({ ok: true }),
        circuitBreaker: { failureThreshold: "many" },
      },
    })).toThrow(/circuitBreaker\.failureThreshold/i);
  });
});
