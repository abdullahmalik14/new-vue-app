import { describe, expect, it, vi } from "vitest";

import {
  runPaginatedFlow,
  runOrdersFetchPaginated,
} from "@/services/flow-system/utils/flowPagination.js";

describe("flow pagination (FEAT-09)", () => {
  it("merges pages until hasMore returns false", async () => {
    const runOnce = vi.fn(async (payload) => {
      if (payload.page === 1) {
        return {
          ok: true,
          data: { items: [{ id: 1 }], pagination: { totalPages: 2 } },
        };
      }
      return {
        ok: true,
        data: { items: [{ id: 2 }], pagination: { totalPages: 2 } },
      };
    });

    const result = await runPaginatedFlow(runOnce, {
      flowName: "orders.fetch",
      payload: {},
      options: {
        paginate: { startPage: 1, maxPages: 5, perPage: 1 },
      },
    });

    expect(result.ok).toBe(true);
    expect(result.data.items).toHaveLength(2);
    expect(runOnce).toHaveBeenCalledTimes(2);
  });

  it("runOrdersFetchPaginated passes page and per_page fields", async () => {
    const run = vi.fn(async () => ({ ok: true, data: { items: [], pagination: { totalPages: 1 } } }));
    const FlowHandler = { run };

    await runOrdersFetchPaginated(FlowHandler, { ownerId: "o1" }, { forceRefresh: true });

    expect(run).toHaveBeenCalledWith(
      "orders.fetchOrders",
      { ownerId: "o1" },
      expect.objectContaining({
        forceRefresh: true,
        paginate: expect.objectContaining({
          pageField: "page",
          perPageField: "per_page",
        }),
      }),
    );
  });
});
