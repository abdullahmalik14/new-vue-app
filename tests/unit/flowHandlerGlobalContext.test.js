import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

vi.mock("@/lib/mock-api-demo/apiWrapper.js", () => ({ default: {} }));
vi.mock("@/utils/common/performanceTracker.js", () => ({ default: {} }));

import { FlowHandler } from "@/services/flow-system/FlowHandler.js";

const FLOW_HANDLER_PATH = join(process.cwd(), "src/services/flow-system/FlowHandler.js");

describe("FlowHandler global context (BP-02)", () => {
  it("exposes reset, replace-style configure, and getContextSnapshot in FlowHandler.js", () => {
    const source = readFileSync(FLOW_HANDLER_PATH, "utf8");
    expect(source).toMatch(/reset\(\)\s*\{/);
    expect(source).toMatch(/_globalContext\.piniaStores = \{ \.\.\.piniaStores \}/);
    expect(source).toMatch(/getContextSnapshot\(\)/);
  });

  afterEach(() => {
    FlowHandler.reset();
  });

  it("configure replaces piniaStores instead of accumulating stale keys", () => {
    FlowHandler.configure({
      piniaStores: { a: { id: 1 }, stale: { id: 99 } },
    });
    FlowHandler.configure({
      piniaStores: { a: { id: 2 } },
    });

    expect(FlowHandler.getContextSnapshot().piniaStoreKeys).toEqual(["a"]);
  });

  it("reset clears configured pinia stores and stateEngine", () => {
    FlowHandler.configure({
      piniaStores: { chat: {} },
      stateEngine: { merge: () => {} },
    });
    FlowHandler.reset();

    expect(FlowHandler.getContextSnapshot()).toEqual({
      piniaStoreKeys: [],
      hasStateEngine: false,
    });
  });

  it("configure is idempotent when called twice with the same piniaStores", () => {
    const stores = { cart: { items: [] } };
    FlowHandler.configure({ piniaStores: stores });
    FlowHandler.configure({ piniaStores: stores });

    expect(FlowHandler.getContextSnapshot().piniaStoreKeys).toEqual(["cart"]);
  });
});
