import { describe, expect, it } from 'vitest';
import { runInConcurrencyChunks, ASSET_PRELOAD_MAX_CONCURRENCY } from '../../src/systems/assets/assetPreloader.js';

describe('runInConcurrencyChunks (M-07)', () => {
  it('exports a default max concurrency of 6', () => {
    expect(ASSET_PRELOAD_MAX_CONCURRENCY).toBe(6);
  });

  it('never runs more than maxConcurrency workers at once', async () => {
    const items = Array.from({ length: 10 }, (_, index) => index);
    let inFlight = 0;
    let maxInFlight = 0;

    await runInConcurrencyChunks(
      items,
      async () => {
        inFlight += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await new Promise((resolve) => setTimeout(resolve, 5));
        inFlight -= 1;
      },
      3,
    );

    expect(maxInFlight).toBeLessThanOrEqual(3);
    expect(maxInFlight).toBe(3);
  });
});
