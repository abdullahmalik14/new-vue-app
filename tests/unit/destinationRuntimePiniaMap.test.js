import { describe, expect, it, vi } from "vitest";

import { applyDestinations } from "@/services/flow-system/runtime/destinationRuntime.js";

describe("destinationRuntime piniaAction map (BUG-04)", () => {
  it("applies dest.map and spreads array args into the pinia action", () => {
    const setOrders = vi.fn();
    const context = {
      runId: "run-1",
      piniaStores: {
        orders: { setOrders },
      },
    };
    const flowResult = {
      ok: true,
      data: {
        items: [{ id: 1 }],
        etag: "etag-1",
        totalCount: 1,
        pagination: { currentPage: 1 },
      },
    };

    applyDestinations({
      context,
      flowResult,
      destinations: [
        {
          type: "piniaAction",
          storeId: "orders",
          action: "setOrders",
          map: (data) => [
            data.items,
            { etag: data.etag, totalCount: data.totalCount, pagination: data.pagination },
          ],
        },
      ],
    });

    expect(setOrders).toHaveBeenCalledWith(
      [{ id: 1 }],
      { etag: "etag-1", totalCount: 1, pagination: { currentPage: 1 } },
    );
  });
});
