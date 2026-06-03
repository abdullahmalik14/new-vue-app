import { describe, expect, it } from "vitest";

import { validatePayload } from "@/services/flow-system/flowDataPipeline.js";
import { createPipelineContext } from "@/services/flow-system/pipeline/pipelineContext.js";

describe("validatePayload mapped contract (BUG-18)", () => {
  it("validates both original and mapped payloads when mapper exists", async () => {
    const context = createPipelineContext({
      flowName: "demo.write",
      flowEntry: {
        flowKind: "write",
        validators: {
          payload: (value) => (value?.id ? { ok: true } : { ok: false, errors: ["id required"] }),
        },
      },
      flow: async () => ({}),
      payload: { id: "mapped-id" },
      mappedPayload: { id: "mapped-id" },
      flowKind: "write",
      mapper: {
        toRequest: (input) => ({ id: input.legacyId }),
      },
      validators: {
        payload: (value) => (
          value?.legacyId || value?.id
            ? { ok: true }
            : { ok: false, errors: ["id required"] }
        ),
      },
      rerunFlow: async () => ({}),
      executeFlow: async () => ({}),
    });

    context.originalPayload = { legacyId: "mapped-id" };

    const result = await validatePayload(context);
    expect(result.ok).toBe(true);
  });

  it("fails when mapped payload breaks validator", async () => {
    const context = createPipelineContext({
      flowName: "demo.write",
      flowEntry: {
        flowKind: "write",
        validators: { payload: (value) => (value?.id ? { ok: true } : { ok: false, errors: ["id required"] }) },
      },
      flow: async () => ({}),
      payload: {},
      mappedPayload: {},
      flowKind: "write",
      mapper: { toRequest: () => ({}) },
      validators: { payload: (value) => (value?.id ? { ok: true } : { ok: false, errors: ["id required"] }) },
      rerunFlow: async () => ({}),
      executeFlow: async () => ({}),
    });

    context.originalPayload = { legacyId: "ok" };
    const result = await validatePayload(context);
    expect(result.ok).toBe(false);
  });
});
