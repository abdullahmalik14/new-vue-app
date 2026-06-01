import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('cacheHandler logging (P-03)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    window.performanceTracker = { step: vi.fn() };
  });

  it('emits one log per get on cache hit when dev logging is enabled', async () => {
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('PROD', '');
    vi.stubEnv('VITE_ENABLE_LOGGER', 'true');

    const logModule = await import('../../src/utils/common/logHandler.js');
    const logSpy = vi.spyOn(logModule, 'log');

    const { clearAllCache, setValueWithExpiration, getValueFromCache } = await import(
      '../../src/utils/common/cacheHandler.js',
    );

    clearAllCache();
    logSpy.mockClear();

    setValueWithExpiration('p03_key', { ok: true }, 60_000);
    const setLogs = logSpy.mock.calls.filter((call) => call[1] === 'setValueWithExpiration');
    expect(setLogs).toHaveLength(1);
    expect(setLogs[0][2]).toBe('success');

    logSpy.mockClear();
    expect(getValueFromCache('p03_key')).toEqual({ ok: true });

    const getLogs = logSpy.mock.calls.filter((call) => call[1] === 'getValueFromCache');
    expect(getLogs).toHaveLength(1);
    expect(getLogs[0][2]).toBe('cache-hit');
  });

  it('does not log cache reads/writes in production without VITE_ENABLE_LOGGER', async () => {
    vi.stubEnv('DEV', '');
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('VITE_ENABLE_LOGGER', '');

    const logModule = await import('../../src/utils/common/logHandler.js');
    const logSpy = vi.spyOn(logModule, 'log');

    const { clearAllCache, setValueWithExpiration, getValueFromCache } = await import(
      '../../src/utils/common/cacheHandler.js',
    );

    clearAllCache();
    logSpy.mockClear();

    setValueWithExpiration('p03_prod', 1);
    getValueFromCache('p03_prod');
    getValueFromCache('missing');

    const cacheLogs = logSpy.mock.calls.filter((call) => call[0] === 'cacheHandler.js');
    expect(cacheLogs).toHaveLength(0);
  });
});
