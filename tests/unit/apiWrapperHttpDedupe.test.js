import { describe, expect, it, vi } from "vitest";

const handleRequest = vi.fn(async () => ({ ok: true, items: [] }));

vi.mock("@/lib/mock-api-demo/apiHandler.js", () => ({
  APIHandler: class {
    constructor() {}

    handleRequest(...args) {
      return handleRequest(...args);
    }
  },
}));

vi.mock("@/lib/mock-api-demo/apiConfig.js", () => ({
  apiConfig: { mode: "offline", debug: false, apiHandler: { defaultBaseUrl: "http://test" } },
}));

vi.mock("@/lib/mock-api-demo/MockApi.js", () => ({
  default: class {},
}));

vi.mock("@/lib/mock-api-demo/mockApi.config.js", () => ({ default: {} }));
vi.mock("@/utils/common/performanceTracker.js", () => ({
  default: class {
    start() {}

    step() {}
  },
}));

describe("apiWrapper HTTP dedupe (FEAT-07)", () => {
  it("deduplicates identical concurrent requests", async () => {
    handleRequest.mockClear();
    let resolveFirst;
    handleRequest.mockImplementation(() => new Promise((resolve) => {
      resolveFirst = () => resolve({ ok: true });
    }));

    const { default: apiWrapper } = await import("@/lib/mock-api-demo/apiWrapper.js");
    const p1 = apiWrapper.get("/orders/purchased", { page: 1 });
    const p2 = apiWrapper.get("/orders/purchased", { page: 1 });
    resolveFirst();
    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1).toEqual(r2);
    expect(handleRequest).toHaveBeenCalledTimes(1);
  });
});
