import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

vi.mock("@/lib/mock-api-demo/apiWrapper.js", () => ({ default: {} }));
vi.mock("@/utils/common/performanceTracker.js", () => ({ default: {} }));

import { createPipelineContext } from "@/services/flow-system/pipeline/pipelineContext.js";
import { patchPipelineProgress, createFlowProgressRef } from "@/services/flow-system/utils/flowProgress.js";

const FLOW_HANDLER_PATH = join(process.cwd(), "src/services/flow-system/FlowHandler.js");

describe("FlowHandler progress (BP-03)", () => {
  it("uses finally and patchPipelineProgress in FlowHandler.js", () => {
    const source = readFileSync(FLOW_HANDLER_PATH, "utf8");
    expect(source).toMatch(/finally\s*\{/);
    expect(source).toMatch(/patchPipelineProgress\(context, \{ loading: true \}\)/);
    expect(source).toMatch(/patchPipelineProgress\(context, \{ loading: false \}\)/);
    expect(source).not.toMatch(/context\.progress\.loading = true/);
  });

  it("patchPipelineProgress replaces progress object immutably", () => {
    const context = createPipelineContext({
      flowName: "demo",
      flowEntry: { flowKind: "read" },
      flow: async () => ({}),
      payload: {},
      mappedPayload: {},
      flowKind: "read",
      rerunFlow: async () => ({}),
      executeFlow: async () => ({}),
    });
    const before = context.progress;
    patchPipelineProgress(context, { loading: true, step: "validate" });

    expect(context.progress).toEqual({ loading: true, step: "validate", attempt: 1 });
    expect(context.progress).not.toBe(before);
  });

  it("createFlowProgressRef exposes a Vue ref for call sites", () => {
    const loadingRef = createFlowProgressRef(false);
    loadingRef.value = true;
    expect(loadingRef.value).toBe(true);
  });
});
