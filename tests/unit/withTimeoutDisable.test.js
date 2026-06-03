import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { withTimeout } from "@/services/flow-system/middleware/withTimeout.js";

const WITH_TIMEOUT_PATH = join(process.cwd(), "src/services/flow-system/middleware/withTimeout.js");

describe("withTimeout disable via timeoutMs 0 (BUG-09)", () => {
  it("uses nullish coalescing and skips timeout when timeoutMs <= 0", () => {
    const source = readFileSync(WITH_TIMEOUT_PATH, "utf8");
    expect(source).toMatch(/timeoutMs \?\? 15000/);
    expect(source).toMatch(/timeoutMs <= 0/);
    expect(source).toMatch(/finally/);
  });

  it("passes through without racing when timeoutMs is 0", async () => {
    const next = vi.fn(async () => ({ ok: true, data: { done: true } }));
    const wrapped = withTimeout(next);
    const result = await wrapped({ context: { timeoutMs: 0 }, payload: {} });
    expect(result.ok).toBe(true);
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0].context.signal).toBeUndefined();
  });
});
