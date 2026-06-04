import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { withAuth } from "@/services/flow-system/middleware/withAuth.js";

const FLOW_HANDLER_PATH = join(process.cwd(), "src/services/flow-system/FlowHandler.js");

describe("FlowHandler default middlewares (BUG-02)", () => {
  it("restores default middleware stack in FlowHandler.js", () => {
    const source = readFileSync(FLOW_HANDLER_PATH, "utf8");
    expect(source).toMatch(
      /const defaultMiddlewares = \[withMetrics, withTimeout, withRetry, withAuth, withCsrf\]/,
    );
  });

  it("withAuth returns AUTH_REQUIRED when requireAuth is true and userId is missing", async () => {
    const next = vi.fn();
    const wrapped = withAuth(next);
    const result = await wrapped({
      context: { requireAuth: true },
      payload: {},
    });
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("AUTH_REQUIRED");
    expect(next).not.toHaveBeenCalled();
  });

  it("withAuth passes through when requireAuth is not set", async () => {
    const next = vi.fn(async () => ({ ok: true, data: {} }));
    const wrapped = withAuth(next);
    await wrapped({ context: {}, payload: {} });
    expect(next).toHaveBeenCalled();
  });
});
