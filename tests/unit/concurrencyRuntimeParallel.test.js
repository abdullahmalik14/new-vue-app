import { describe, expect, it } from "vitest";

import {
  acquireRunSlot,
  cancelInFlight,
  hasInFlight,
} from "@/services/flow-system/runtime/concurrencyRuntime.js";

describe("concurrencyRuntime allowParallel tracking (BUG-10)", () => {
  it("registers parallel runs under composite key for cancel/hasInFlight", async () => {
    const slot = acquireRunSlot({ key: "media.upload", policy: "allowParallel" });
    expect(slot.mode).toBe("run");
    expect(slot.key).toContain("media.upload:parallel:");

    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    slot.registerPromise(promise);
    expect(hasInFlight(slot.key)).toBe(true);

    const cancelled = cancelInFlight(slot.key);
    expect(cancelled).toBe(true);
    expect(hasInFlight(slot.key)).toBe(false);

    resolvePromise({ ok: true });
    slot.release();
    expect(hasInFlight(slot.key)).toBe(false);
  });
});
