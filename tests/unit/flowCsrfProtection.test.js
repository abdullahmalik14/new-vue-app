import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createPipelineContext } from "@/services/flow-system/pipeline/pipelineContext.js";
import { withCsrf } from "@/services/flow-system/middleware/withCsrf.js";

const FLOW_HANDLER_PATH = join(process.cwd(), "src/services/flow-system/FlowHandler.js");

describe("flow CSRF protection (SEC-05)", () => {
  it("SEC-05: default middleware stack includes withCsrf", () => {
    const source = readFileSync(FLOW_HANDLER_PATH, "utf8");
    expect(source).toMatch(
      /const defaultMiddlewares = \[withMetrics, withTimeout, withRetry, withAuth, withCsrf\]/,
    );
  });

  it("adds X-CSRF-Token on write flows when csrfToken is provided", () => {
    const context = createPipelineContext({
      flowName: "bookings.create",
      flowEntry: { flowKind: "write" },
      flow: async () => ({ ok: true }),
      payload: {},
      mappedPayload: {},
      flowKind: "write",
      options: { csrfToken: "csrf-secret" },
      rerunFlow: async () => ({}),
      executeFlow: async () => ({}),
    });

    expect(context.csrfToken).toBeUndefined();
    expect(context.requestHeaders["X-CSRF-Token"]).toBe("csrf-secret");
  });

  it("does not add CSRF header on read flows", () => {
    const context = createPipelineContext({
      flowName: "events.fetch",
      flowEntry: { flowKind: "read" },
      flow: async () => ({ ok: true }),
      payload: {},
      mappedPayload: {},
      flowKind: "read",
      options: { csrfToken: "csrf-secret" },
      rerunFlow: async () => ({}),
      executeFlow: async () => ({}),
    });

    expect(context.requestHeaders["X-CSRF-Token"]).toBeUndefined();
  });

  it("withCsrf middleware re-applies header for write executeFlow", async () => {
    const context = createPipelineContext({
      flowName: "bookings.create",
      flowEntry: { flowKind: "write" },
      flow: async () => ({ ok: true }),
      payload: {},
      mappedPayload: {},
      flowKind: "write",
      options: { csrfToken: "csrf-from-options" },
      rerunFlow: async () => ({}),
      executeFlow: async () => ({}),
    });
    context.requestHeaders = {};

    const wrapped = withCsrf(async () => ({ ok: true }));
    await wrapped({ context });

    expect(context.requestHeaders["X-CSRF-Token"]).toBe("csrf-from-options");
  });
});
