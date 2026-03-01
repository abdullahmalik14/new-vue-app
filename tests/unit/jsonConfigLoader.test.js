import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const LOADER_PATH = '../../src/utils/common/jsonConfigLoader.js';

function createFetchResponse(data, { ok = true, status = 200, statusText = 'OK', headers } = {}) {
  return {
    ok,
    status,
    statusText,
    headers: {
      get: vi.fn().mockImplementation((key) => {
        if (headers && headers[key]) {
          return headers[key];
        }
        return 'application/json';
      })
    },
    json: vi.fn().mockResolvedValue(data)
  };
}

async function importLoader() {
  return await import(LOADER_PATH);
}

beforeEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  window.performanceTracker = undefined;
});

afterEach(() => {
  vi.useRealTimers();
  delete global.fetch;
});

describe('jsonConfigLoader (browser)', () => {
  it('loads and caches config data on first request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createFetchResponse({ featureFlag: true }));
    global.fetch = fetchMock;

    const { loadJsonConfig, getConfigStatistics } = await importLoader();

    const result = await loadJsonConfig('./configs/feature.json', { configName: 'feature-config' });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ featureFlag: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(`${window.location.origin}/configs/feature.json`, expect.objectContaining({
      method: 'GET',
      cache: 'no-cache'
    }));

    const stats = getConfigStatistics();
    expect(stats.loadedConfigs).toContain('feature-config_./configs/feature.json');
  });

  it('returns cached data on subsequent calls without refetching', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createFetchResponse({ featureFlag: true }));
    global.fetch = fetchMock;

    const { loadJsonConfig } = await importLoader();

    const firstResult = await loadJsonConfig('./configs/feature.json', { configName: 'feature-config' });
    expect(firstResult.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fetchMock.mockClear();

    const secondResult = await loadJsonConfig('./configs/feature.json', { configName: 'feature-config' });
    expect(secondResult.success).toBe(true);
    expect(secondResult.data).toEqual(firstResult.data);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('handles invalid JSON data gracefully', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createFetchResponse('not-an-object'));
    global.fetch = fetchMock;
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    const { loadJsonConfig } = await importLoader();

    const result = await loadJsonConfig('./configs/invalid.json', { configName: 'invalid-config' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Validation failed');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('deduplicates concurrent loads for the same config', async () => {
    vi.useFakeTimers();

    let resolveJson;
    const jsonPromise = new Promise((resolve) => {
      resolveJson = resolve;
    });

    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: {
          get: vi.fn().mockReturnValue('application/json')
        },
        json: vi.fn().mockReturnValue(jsonPromise)
      })
    );

    global.fetch = fetchMock;

    const { loadJsonConfig } = await importLoader();

    const loadPromiseA = loadJsonConfig('./configs/preloaded.json', { configName: 'preloaded-config' });
    const loadPromiseB = loadJsonConfig('./configs/preloaded.json', { configName: 'preloaded-config' });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveJson({ preload: true });

    await vi.advanceTimersByTimeAsync(200);

    const [resultA, resultB] = await Promise.all([loadPromiseA, loadPromiseB]);
    expect(resultA.success).toBe(true);
    expect(resultB.success).toBe(true);
    expect(resultA.data).toEqual({ preload: true });
    expect(resultB.data).toEqual(resultA.data);
  });

  it('supports absolute config URLs without modification', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createFetchResponse({ absolute: true }));
    global.fetch = fetchMock;

    const { loadJsonConfig } = await importLoader();

    const result = await loadJsonConfig('https://cdn.example.com/configs/absolute.json', {
      configName: 'absolute-config'
    });

    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://cdn.example.com/configs/absolute.json',
      expect.any(Object)
    );
  });

  it('loads configuration data from static imports with validation', async () => {
    const { loadJsonConfigFromImport } = await importLoader();
    const mockData = { locale: 'en-US' };

    const result = loadJsonConfigFromImport(mockData, { configName: 'imported-config' });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockData);
  });
});

