import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createPipelineContext } from "@/services/flow-system/pipeline/pipelineContext.js";

const REGISTRY_SOURCE = readFileSync(
  join(process.cwd(), "src/services/flow-system/flowRegistry.js"),
  "utf8",
);

function parseRegistryRequireAuth() {
  const entries = {};
  const blockPattern = /"([^"]+)":\s*\{([\s\S]*?)\n  \},/g;
  for (const match of REGISTRY_SOURCE.matchAll(blockPattern)) {
    const flowName = match[1];
    const body = match[2];
    if (!/flowKind:\s*"write"/.test(body)) continue;
    entries[flowName] = /requireAuth:\s*true/.test(body);
  }
  return entries;
}

const GUEST_WRITE_FLOWS = new Set([
  "bookings.createTemporaryHold",
  "bookings.releaseTemporaryHold",
  "rental.flushClientCache",
  "cart.addItem",
  "cart.removeItem",
  "cart.updateQuantity",
  "cart.rename",
  "cart.applyCoupon",
  "cart.removeCoupon",
  "cart.applyFees",
  "cart.setAsDefault",
  "cart.mergeGuest",
  "cart.attachLiveData",
  "cart.remind",
]);

describe("flow registry requireAuth", () => {
  it("write flows require auth except guest/public cart and guest holds", () => {
    const missing = [];

    const requireAuthByFlow = parseRegistryRequireAuth();

    for (const [flowName, hasRequireAuth] of Object.entries(requireAuthByFlow)) {
      if (GUEST_WRITE_FLOWS.has(flowName)) {
        expect(hasRequireAuth).toBe(false);
        continue;
      }
      if (!hasRequireAuth) {
        missing.push(flowName);
      }
    }

    expect(missing).toEqual([]);
  });

  it("createPipelineContext reads requireAuth from registry entry", () => {
    const context = createPipelineContext({
      flowName: "bookings.createBooking",
      flowEntry: { flowKind: "write", requireAuth: true, pipeline: {} },
      flow: async () => ({}),
      payload: {},
      mappedPayload: {},
      flowKind: "write",
      mapper: {},
      validators: {},
      options: {},
      rerunFlow: async () => ({}),
      executeFlow: async () => ({}),
    });

    expect(context.requireAuth).toBe(true);
  });
});
