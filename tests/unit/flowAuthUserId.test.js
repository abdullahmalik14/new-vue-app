import { describe, expect, it, beforeEach } from "vitest";

import {
  configureFlowAuth,
  resetFlowAuthContext,
  resolveFlowUserId,
} from "@/services/flow-system/utils/flowAuthContext.js";

describe("resolveFlowUserId (BUG-19)", () => {
  beforeEach(() => {
    resetFlowAuthContext();
  });

  it("prefers explicit options.userId over auth getter", () => {
    configureFlowAuth({ getUserId: () => "from-auth" });
    expect(resolveFlowUserId({ userId: "explicit" })).toBe("explicit");
  });

  it("uses configured getUserId when options omit userId", () => {
    configureFlowAuth({ getUserId: () => "user-123" });
    expect(resolveFlowUserId({})).toBe("user-123");
  });

  it("returns undefined when auth is not configured", () => {
    expect(resolveFlowUserId({})).toBeUndefined();
  });
});
