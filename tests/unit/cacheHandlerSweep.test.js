import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('sweepExpiredCacheEntries (P-06)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    window.performanceTracker = { step: vi.fn() };
  });

  it('removes expired entries but keeps valid TTL entries', async () => {
    const {
      clearAllCache,
      setValueWithExpiration,
      getValueFromCache,
      sweepExpiredCacheEntries,
      getCacheStatistics,
    } = await import('../../src/utils/common/cacheHandler.js');

    clearAllCache();

    setValueWithExpiration('p06_valid', { ok: true }, 60_000);
    setValueWithExpiration('p06_expired', { stale: true }, 1);

    await new Promise((resolve) => setTimeout(resolve, 10));

    const removed = sweepExpiredCacheEntries();

    expect(removed).toBe(1);
    expect(getValueFromCache('p06_valid')).toEqual({ ok: true });
    expect(getValueFromCache('p06_expired')).toBeNull();
    expect(getCacheStatistics().totalEntries).toBe(1);
  });
});
