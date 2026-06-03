import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

vi.mock("@/lib/mock-api-demo/apiWrapper.js", () => ({ default: {} }));
vi.mock("@/utils/common/performanceTracker.js", () => ({ default: {} }));

import { FlowHandler } from "@/services/flow-system/FlowHandler.js";

const FLOW_HANDLER_PATH = join(process.cwd(), "src/services/flow-system/FlowHandler.js");

describe("FlowHandler flowKind validation (BP-05)", () => {
  it("rejects unrecognized flowKind instead of defaulting to write", async () => {
    const source = readFileSync(FLOW_HANDLER_PATH, "utf8");
    expect(source).toMatch(/INVALID_FLOW_KIND/);
    expect(source).not.toMatch(/return "write";\s*\/\/ ← any typo/);

    const result = await FlowHandler.run("events.fetchEvent", {}, { flowKind: "reed" });
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("INVALID_FLOW_KIND");
    expect(result.error?.message).toContain("reed");
  });

  it("accepts read aliases that match registry kind", async () => {
    const readResult = await FlowHandler.run("events.fetchEvent", {}, { flowKind: "query" });
    expect(readResult.error?.code).not.toBe("INVALID_FLOW_KIND");
    expect(readResult.error?.code).not.toBe("FLOW_KIND_OVERRIDE_NOT_ALLOWED");
  });
});
