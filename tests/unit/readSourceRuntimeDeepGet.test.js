import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { readFromPiniaSource } from "@/services/flow-system/runtime/readSourceRuntime.js";

const READ_SOURCE_PATH = join(process.cwd(), "src/services/flow-system/runtime/readSourceRuntime.js");

describe("readSourceRuntime deepGet usage (BP-07)", () => {
  it("does not define resolveValueByPath wrapper", () => {
    const source = readFileSync(READ_SOURCE_PATH, "utf8");
    expect(source).not.toMatch(/resolveValueByPath/);
    expect(source).toMatch(/deepGet\(store, source\.select\)/);
  });

  it("readFromPiniaSource uses deepGet for select paths", () => {
    const store = { nested: { items: [1, 2] }, meta: { etag: "e1", updatedAt: 99 } };
    const snapshot = readFromPiniaSource(
      { type: "pinia", storeId: "demo", select: "nested.items", etagSelect: "meta.etag", updatedAtSelect: "meta.updatedAt" },
      { piniaStores: { demo: store } },
    );
    expect(snapshot.hit).toBe(true);
    expect(snapshot.data).toEqual([1, 2]);
    expect(snapshot.etag).toBe("e1");
    expect(snapshot.updatedAt).toBe(99);
  });
});
