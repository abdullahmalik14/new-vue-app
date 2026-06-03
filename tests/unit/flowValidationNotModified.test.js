import { describe, expect, it } from "vitest";

import { validateResponse } from "@/services/flow-system/flowDataPipeline.js";

describe("validateResponse notModified (BUG-17)", () => {
  it("validates response data even when notModified when data is present", async () => {
    const context = {
      validators: {
        response: (data) => (data?.items?.length ? { ok: true } : { ok: false, errors: ["no items"] }),
      },
      validatorsDeclared: { response: true },
    };

    const result = await validateResponse(context, {
      ok: true,
      data: { items: ["a"] },
      meta: { notModified: true },
    });

    expect(result.ok).toBe(true);
  });

  it("skips validation when notModified and data is empty", async () => {
    const context = {
      validators: {
        response: () => ({ ok: false, errors: ["should not run"] }),
      },
      validatorsDeclared: { response: true },
    };

    const result = await validateResponse(context, {
      ok: true,
      data: {},
      meta: { notModified: true },
    });

    expect(result.ok).toBe(true);
  });

  it("fails when notModified data fails validator", async () => {
    const context = {
      validators: {
        response: (data) => (data?.items?.length ? { ok: true } : { ok: false, errors: ["no items"] }),
      },
      validatorsDeclared: { response: true },
    };

    const result = await validateResponse(context, {
      ok: true,
      data: { items: [] },
      meta: { notModified: true },
    });

    expect(result.ok).toBe(false);
  });
});
