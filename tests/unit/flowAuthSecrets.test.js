import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createPipelineContext } from "@/services/flow-system/pipeline/pipelineContext.js";
import { normalizeUnknownError } from "@/services/flow-system/flowErrors.js";
import { redactFlowSensitiveValue } from "@/services/flow-system/utils/flowAuthSecrets.js";

const FLOW_HANDLER_PATH = join(process.cwd(), "src/services/flow-system/FlowHandler.js");

describe("flow auth security (SEC-01, SEC-02)", () => {
  it("SEC-01: default middleware stack includes withAuth", () => {
    const source = readFileSync(FLOW_HANDLER_PATH, "utf8");
    expect(source).toMatch(
      /const defaultMiddlewares = \[withMetrics, withTimeout, withRetry, withAuth, withCsrf\]/,
    );
  });

  it("SEC-02: JWT is applied to headers but not exposed on context", () => {
    const context = createPipelineContext({
      flowName: "demo.flow",
      flowEntry: { flowKind: "read" },
      flow: async () => ({ ok: true }),
      payload: {},
      mappedPayload: {},
      flowKind: "read",
      options: {
        backendJwtToken: "super-secret-jwt",
        context: { backendJwtToken: "should-not-appear" },
      },
      rerunFlow: async () => ({}),
      executeFlow: async () => ({}),
    });

    expect(context.backendJwtToken).toBeUndefined();
    expect(context.requestHeaders.Authorization).toBe("Bearer super-secret-jwt");
  });

  it("SEC-02: normalizeUnknownError redacts JWT and Authorization from details", () => {
    const normalized = normalizeUnknownError({
      code: "ERR",
      message: "boom",
      details: {
        backendJwtToken: "secret",
        requestHeaders: { Authorization: "Bearer secret" },
      },
    });

    expect(normalized.error.details.backendJwtToken).toBe("[REDACTED]");
    expect(normalized.error.details.requestHeaders.Authorization).toBe("[REDACTED]");
  });

  it("SEC-02: redactFlowSensitiveValue redacts Bearer strings", () => {
    expect(redactFlowSensitiveValue("Bearer abc.def.ghi")).toBe("[REDACTED]");
  });
});
