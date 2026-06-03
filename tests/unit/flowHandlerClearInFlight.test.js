import { describe, expect, it, beforeEach } from "vitest";

import {
  acquireRunSlot,
  clearInFlight,
  hasInFlight,
} from "@/services/flow-system/runtime/concurrencyRuntime.js";

describe("clearInFlight (BP-12)", () => {
  beforeEach(() => {
    clearInFlight();
  });

  it("removes dedupe entries so tests do not leak inFlight state", () => {
    const key = "test.flow:abc";
    const slot = acquireRunSlot({ key, policy: "latestWins", dedupe: true });
    slot.registerPromise(Promise.resolve());
    expect(hasInFlight(key)).toBe(true);

    clearInFlight();
    expect(hasInFlight(key)).toBe(false);
  });
});
