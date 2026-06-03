import { describe, expect, it, vi, afterEach } from "vitest";

import {
  buildPayloadHash,
  readCacheEntry,
  writeCacheEntry,
} from "@/services/flow-system/runtime/cacheRuntime.js";

describe("cacheRuntime performance fixes (PERF-02, PERF-03)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("removes expired entries from memory cache on read (PERF-02)", () => {
    vi.useFakeTimers();
    const key = "__flow_cache__:test:shared";
    writeCacheEntry({ storage: null, key, data: { x: 1 }, ttlMs: 1000, version: 1 });
    vi.advanceTimersByTime(1001);
    const expired = readCacheEntry({ storage: null, key, version: 1 });
    expect(expired.hit).toBe(false);
    expect(expired.reason).toBe("expired");
    const missing = readCacheEntry({ storage: null, key, version: 1 });
    expect(missing.reason).toBe("missing");
  });

  it("memoizes payload hash for the same object reference (PERF-03)", () => {
    const payload = { ownerId: "1", page: 2, filters: { status: "open" } };
    const first = buildPayloadHash(payload);
    const second = buildPayloadHash(payload);
    expect(second).toBe(first);
  });
});
