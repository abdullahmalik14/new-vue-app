import { describe, expect, it } from "vitest";

import { asValidationResult, validatePayload } from "@/services/flow-system/flowDataPipeline.js";
import { createPipelineContext } from "@/services/flow-system/pipeline/pipelineContext.js";

describe("flow validation strictness (BUG-15, BUG-16)", () => {
  it("asValidationResult fails closed on unknown shapes", () => {
    const result = asValidationResult({ unexpected: true });
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/Unexpected validator result shape/i);
  });

  it("asValidationResult accepts legacy { valid: true } shape", () => {
    expect(asValidationResult({ valid: true }).ok).toBe(true);
  });

  it("asValidationResult accepts explicit ok boolean", () => {
    expect(asValidationResult({ ok: true }).ok).toBe(true);
    expect(asValidationResult({ ok: false, errors: ["x"] }).ok).toBe(false);
  });

  it("validatePayload fails when registry declares a non-function payload validator", async () => {
    const context = createPipelineContext({
      flowName: "demo.flow",
      flowEntry: { flowKind: "read", validators: { payload: "not-a-function" } },
      flow: async () => ({}),
      payload: {},
      mappedPayload: {},
      flowKind: "read",
      validators: { payload: null, response: null },
      rerunFlow: async () => ({}),
      executeFlow: async () => ({}),
    });

    const result = await validatePayload(context);
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/not a function/i);
  });
});
