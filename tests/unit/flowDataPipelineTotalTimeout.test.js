import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  executeWithTimeout,
  finalizeCancelled,
} from "@/services/flow-system/flowDataPipeline.js";

const PIPELINE_PATH = join(process.cwd(), "src/services/flow-system/flowDataPipeline.js");

describe("flowDataPipeline total timeout (BUG-08)", () => {
  it("uses cancelled() for total flow timeout handler", () => {
    const source = readFileSync(PIPELINE_PATH, "utf8");
    const callSite = source.slice(
      source.indexOf("const flowResult = await executeWithTimeout"),
      source.indexOf("if (!flowResult?.ok)"),
    );
    expect(callSite).toContain('() => cancelled("total_timeout")');
    expect(callSite).not.toContain("fail({");
  });

  it("finalizeCancelled preserves FLOW_TOTAL_TIMEOUT for total_timeout reason", () => {
    const context = { flowName: "test.flow", runId: "r1", totalFlowTimeoutMs: 5000 };
    const sourceResult = {
      ok: false,
      status: "cancelled",
      error: { code: "FLOW_CANCELLED", message: "Flow was cancelled", details: { reason: "total_timeout" } },
      meta: { cancelled: true, reason: "total_timeout" },
    };
    const result = finalizeCancelled(context, "total_timeout", sourceResult);
    expect(result.status).toBe("cancelled");
    expect(result.error?.code).toBe("FLOW_TOTAL_TIMEOUT");
  });

  it("executeWithTimeout returns cancelled shape from onTimeout", async () => {
    const { cancelled } = await import("@/services/flow-system/flowTypes.js");
    const result = await executeWithTimeout(
      new Promise(() => {}),
      20,
      () => cancelled("total_timeout"),
    );
    expect(result.status).toBe("cancelled");
    expect(result.meta?.reason).toBe("total_timeout");
  });
});
