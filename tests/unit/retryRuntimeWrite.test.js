import { describe, expect, it, vi } from "vitest";

import { executeWithRetry } from "@/services/flow-system/runtime/retryRuntime.js";

describe("retryRuntime write safety (BUG-20)", () => {
  it("does not retry NETWORK_ERROR for write flows", async () => {
    const operation = vi.fn()
      .mockResolvedValueOnce({ ok: false, error: { code: "NETWORK_ERROR" } });

    const result = await executeWithRetry({
      operation,
      retry: { enabled: true, maxAttempts: 3 },
      flowKind: "write",
    });

    expect(operation).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(false);
  });

  it("retries NETWORK_ERROR for read flows", async () => {
    vi.useFakeTimers();
    const operation = vi.fn()
      .mockResolvedValueOnce({ ok: false, error: { code: "NETWORK_ERROR" } })
      .mockResolvedValueOnce({ ok: true, data: {} });

    const promise = executeWithRetry({
      operation,
      retry: { enabled: true, maxAttempts: 3, baseDelayMs: 10, maxDelayMs: 10 },
      flowKind: "read",
    });

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(operation).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
    vi.useRealTimers();
  });

  it("retries HTTP_429 for write flows", async () => {
    vi.useFakeTimers();
    const operation = vi.fn()
      .mockResolvedValueOnce({ ok: false, error: { code: "HTTP_429" } })
      .mockResolvedValueOnce({ ok: true, data: {} });

    const promise = executeWithRetry({
      operation,
      retry: { enabled: true, maxAttempts: 3, baseDelayMs: 10, maxDelayMs: 10 },
      flowKind: "write",
    });

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(operation).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
    vi.useRealTimers();
  });
});
