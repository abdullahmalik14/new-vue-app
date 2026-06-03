import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { executeWithRetry } from "@/services/flow-system/runtime/retryRuntime.js";

const RETRY_RUNTIME_PATH = join(process.cwd(), "src/services/flow-system/runtime/retryRuntime.js");

describe("retryRuntime exponential backoff (BUG-06)", () => {
  it("uses attempt - 1 for the delay exponent (no Math.max(1, ...))", () => {
    const source = readFileSync(RETRY_RUNTIME_PATH, "utf8");
    expect(source).toMatch(/const exp = attempt - 1;/);
    expect(source).not.toMatch(/Math\.max\(1,\s*attempt - 1\)/);
  });

  it("first retry delay uses baseDelayMs, second uses 2x baseDelayMs", async () => {
    const delays = [];
    await executeWithRetry({
      retry: {
        enabled: true,
        maxAttempts: 3,
        baseDelayMs: 250,
        maxDelayMs: 5000,
        jitterRatio: 0,
      },
      onRetry: ({ delayMs }) => delays.push(delayMs),
      operation: async () => ({
        ok: false,
        error: { code: "HTTP_503", message: "retry" },
      }),
    });

    expect(delays[0]).toBe(250);
    expect(delays[1]).toBe(500);
  });
});
