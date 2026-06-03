import { describe, expect, it, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { withTimeout } from "@/services/flow-system/middleware/withTimeout.js";

const WITH_TIMEOUT_PATH = join(process.cwd(), "src/services/flow-system/middleware/withTimeout.js");

describe("withTimeout timer cleanup (BUG-12)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("clears timer in finally when flow rejects", async () => {
    const source = readFileSync(WITH_TIMEOUT_PATH, "utf8");
    expect(source).toMatch(/finally\s*\{[\s\S]*clearTimeout\(timer\)/);

    vi.useFakeTimers();
    const clearSpy = vi.spyOn(globalThis, "clearTimeout");
    const wrapped = withTimeout(async () => {
      throw new Error("boom");
    });

    await expect(wrapped({ context: { timeoutMs: 5000 } })).rejects.toThrow("boom");
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});
