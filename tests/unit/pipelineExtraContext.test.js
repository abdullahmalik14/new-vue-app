import { describe, expect, it } from "vitest";

import { createPipelineContext } from "@/services/flow-system/pipeline/pipelineContext.js";
import { pickExtraContext } from "@/services/flow-system/utils/pipelineExtraContext.js";

describe("pipeline extra context (BUG-11, BP-11, SEC-08)", () => {
  it("pickExtraContext strips reserved keys", () => {
    const picked = pickExtraContext({
      flowName: "hijacked",
      runId: "fake",
      locale: "en",
      metadata: { a: 1 },
    });
    expect(picked.extra).toEqual({ locale: "en", metadata: { a: 1 } });
    expect(picked.extra.flowName).toBeUndefined();
  });

  it("createPipelineContext keeps trusted fields when context tries to override", () => {
    const context = createPipelineContext({
      flowName: "events.fetchEvent",
      flowEntry: { flowKind: "read" },
      flow: async () => ({}),
      payload: {},
      mappedPayload: {},
      flowKind: "read",
      options: {
        context: {
          flowName: "evil.flow",
          runId: "evil-run",
          requestHeaders: { Authorization: "Bearer evil" },
          locale: "fr",
        },
        backendJwtToken: "trusted-jwt",
      },
      rerunFlow: async () => ({}),
      executeFlow: async () => ({}),
    });

    expect(context.flowName).toBe("events.fetchEvent");
    expect(context.runId).not.toBe("evil-run");
    expect(context.requestHeaders.Authorization).toBe("Bearer trusted-jwt");
    expect(context.locale).toBe("fr");
  });
});
