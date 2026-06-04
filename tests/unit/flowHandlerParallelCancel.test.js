import { describe, expect, it } from "vitest";

import {
  acquireRunSlot,
  buildConcurrencyKey,
  cancelInFlightForKey,
  hasInFlightForKey,
} from "@/services/flow-system/runtime/concurrencyRuntime.js";

describe("FlowHandler parallel cancel (BUG-10)", () => {
  it("cancelInFlightForKey aborts allowParallel runs registered under composite keys", async () => {
    const baseKey = buildConcurrencyKey("media.upload", { fileId: "f1" });
    const slot = acquireRunSlot({ key: baseKey, policy: "allowParallel" });

    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    slot.registerPromise(promise);
    expect(hasInFlightForKey(baseKey)).toBe(true);
    expect(hasInFlightForKey(slot.key)).toBe(true);

    const cancelled = cancelInFlightForKey(baseKey);
    expect(cancelled).toBe(true);
    expect(hasInFlightForKey(baseKey)).toBe(false);

    resolvePromise({ ok: true });
    slot.release();
  });
});
