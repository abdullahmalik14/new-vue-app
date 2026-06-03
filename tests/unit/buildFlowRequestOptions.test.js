import { describe, expect, it } from "vitest";

import { buildFlowRequestOptions } from "@/services/flow-system/utils/buildFlowRequestOptions.js";

describe("buildFlowRequestOptions (FEAT-11)", () => {
  it("includes headers, signal, and timeoutMs from context", () => {
    const controller = new AbortController();
    const options = buildFlowRequestOptions({
      requestHeaders: { "X-Test": "1" },
      signal: controller.signal,
      requestTimeoutMs: 9000,
    });

    expect(options.headers["X-Test"]).toBe("1");
    expect(options.signal).toBe(controller.signal);
    expect(options.timeoutMs).toBe(9000);
  });
});
