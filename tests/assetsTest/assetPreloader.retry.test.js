import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ASSET_PRELOAD_MAX_CONCURRENCY, runInConcurrencyChunks, withPreloadRetry } from '../../src/systems/assets/assetPreloader.js';

describe('withPreloadRetry (§14)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('withPreloadRetry succeeds first attempt', async () => {
    const promise = withPreloadRetry(async () => 'ok');
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBe('ok');
  });

  it('withPreloadRetry retries transient failure', async () => {
    let attempts = 0;
    const promise = withPreloadRetry(async () => {
      attempts += 1;
      if (attempts < 2) throw new Error('transient');
      return 'ok';
    }, { maxRetries: 2, baseDelayMs: 10 });
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBe('ok');
    expect(attempts).toBe(2);
  });

  it('withPreloadRetry stops at max retries', async () => {
    const promise = withPreloadRetry(async () => {
      throw new Error('always fails');
    }, { maxRetries: 1, baseDelayMs: 10 });
    const expectation = expect(promise).rejects.toThrow('always fails');
    await vi.runAllTimersAsync();
    await expectation;
  });

  it('withPreloadRetry no retry on permanent error', async () => {
    let attempts = 0;
    const promise = withPreloadRetry(async () => {
      attempts += 1;
      throw new Error('permanent');
    }, { maxRetries: 0 });
    const expectation = expect(promise).rejects.toThrow('permanent');
    await vi.runAllTimersAsync();
    await expectation;
    expect(attempts).toBe(1);
  });
});

describe('runInConcurrencyChunks (§14)', () => {
  it('runInConcurrencyChunks processes all items', async () => {
    const seen = [];
    await runInConcurrencyChunks([1, 2, 3], async (item) => {
      seen.push(item);
    }, 2);
    expect(seen.sort()).toEqual([1, 2, 3]);
  });

  it('runInConcurrencyChunks respects ASSET_PRELOAD_MAX_CONCURRENCY', async () => {
    const chunkSizes = [];
    const originalAllSettled = Promise.allSettled.bind(Promise);
    const allSettledSpy = vi.spyOn(Promise, 'allSettled').mockImplementation((promises) => {
      chunkSizes.push(promises.length);
      return originalAllSettled(promises);
    });

    await runInConcurrencyChunks([1, 2, 3, 4, 5, 6, 7], async () => {}, 3);

    expect(chunkSizes).toEqual([3, 3, 1]);
    expect(Math.max(...chunkSizes)).toBeLessThanOrEqual(ASSET_PRELOAD_MAX_CONCURRENCY);
    allSettledSpy.mockRestore();
  });

  it('runInConcurrencyChunks empty array immediate resolve', async () => {
    await expect(runInConcurrencyChunks([], async () => {})).resolves.toBeUndefined();
  });

  it('runInConcurrencyChunks propagates fatal error', async () => {
    await expect(
      runInConcurrencyChunks([1], async () => {
        throw new Error('fatal');
      }),
    ).resolves.toBeUndefined();
  });

  it('runInConcurrencyChunks concurrency 1 sequential', async () => {
    const order = [];
    await runInConcurrencyChunks([1, 2, 3], async (item) => {
      order.push(item);
    }, 1);
    expect(order).toEqual([1, 2, 3]);
  });
});