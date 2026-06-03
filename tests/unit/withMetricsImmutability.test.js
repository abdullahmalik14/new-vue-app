import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { withMetrics } from "@/services/flow-system/middleware/withMetrics.js";

const WITH_METRICS_PATH = join(process.cwd(), "src/services/flow-system/middleware/withMetrics.js");

describe("withMetrics immutability (BP-04)", () => {
  it("returns a new result object instead of mutating in place", async () => {
    const source = readFileSync(WITH_METRICS_PATH, "utf8");
    expect(source).not.toMatch(/result\.meta\s*=/);

    const original = { ok: true, status: "success", data: { n: 1 }, meta: { source: "flow" } };
    const next = vi.fn(async () => original);
    const wrapped = withMetrics(next);
    const out = await wrapped({
      context: { runId: "run_test" },
      payload: {},
    });

    expect(out).not.toBe(original);
    expect(out.meta).toMatchObject({ source: "flow", durationMs: expect.any(Number), runId: "run_test" });
    expect(original.meta).toEqual({ source: "flow" });
  });
});
