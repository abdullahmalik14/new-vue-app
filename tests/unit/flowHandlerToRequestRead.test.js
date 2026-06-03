import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { mapOrderToRequest } from "@/services/orders/mappers/ordersMapper.js";

const FLOW_HANDLER_PATH = join(process.cwd(), "src/services/flow-system/FlowHandler.js");

describe("FlowHandler toRequest on read flows (BUG-03)", () => {
  it("runs toRequest for read flows when mapper provides it", () => {
    const source = readFileSync(FLOW_HANDLER_PATH, "utf8");
    expect(source).toMatch(/if \(typeof mapper\.toRequest === "function"\)/);
    expect(source).not.toMatch(/flowKind === "write" && typeof mapper\.toRequest/);
  });

  it("mapOrderToRequest maps perPage and ownerId to API query shape", () => {
    const mapped = mapOrderToRequest({ perPage: 25, ownerId: "creator-1", page: 2 });
    expect(mapped).toEqual({
      status: undefined,
      type: undefined,
      search: undefined,
      page: 2,
      per_page: 25,
      owner_id: "creator-1",
      customer_id: undefined,
    });
  });
});
