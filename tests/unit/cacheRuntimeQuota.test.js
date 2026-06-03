import { describe, expect, it } from "vitest";

import {
  readCacheEntry,
  writeCacheEntry,
} from "@/services/flow-system/runtime/cacheRuntime.js";

describe("cacheRuntime localStorage quota fallback (PERF-04)", () => {
  it("falls back to memory cache when setItem throws QuotaExceededError", () => {
    const key = "__flow_cache__:quota:test";
    const quotaStorage = {
      getItem: () => null,
      setItem: () => {
        throw new DOMException("quota", "QuotaExceededError");
      },
      removeItem: () => {},
    };

    writeCacheEntry({ storage: quotaStorage, key, data: { ok: true }, ttlMs: 60000 });
    const result = readCacheEntry({ storage: quotaStorage, key });

    expect(result.hit).toBe(true);
    expect(result.record?.data).toEqual({ ok: true });
  });
});
