import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AssetHandler from '../../src/systems/assets/assetHandler.js';

const config = [
  { name: 'alpha-script', url: '/alpha.js', type: 'script', flags: ['alpha'] },
  { name: 'beta-style', url: '/beta.css', type: 'css', flags: ['beta'] },
  { name: 'shared-font', url: '/font.woff2', type: 'font', flags: ['alpha', 'beta'] },
];

function createHandler() {
  return new AssetHandler(config);
}

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('AssetHandler load helpers', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    globalThis.CSS = { escape: (value) => String(value) };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('getAssetsByFlags matches any asset with a shared flag', () => {
    const handler = createHandler();

    expect(handler.getAssetsByFlags(['alpha']).map((asset) => asset.name)).toEqual([
      'alpha-script',
      'shared-font',
    ]);
  });

  it('getAssetsByFlags can require all flags', () => {
    const handler = createHandler();

    expect(handler.getAssetsByFlags(['alpha', 'beta'], true).map((asset) => asset.name)).toEqual([
      'shared-font',
    ]);
  });

  it('getAssetsByFlags returns an empty array when nothing matches', () => {
    const handler = createHandler();

    expect(handler.getAssetsByFlags(['missing'])).toEqual([]);
  });

  it('preloadAssetsByFlag loads the assets returned by the flag lookup', async () => {
    const handler = createHandler();
    const assets = [config[0], config[2]];
    const pipelineSpy = vi.spyOn(handler, '_loadAssetsWithPipeline').mockResolvedValue([{ name: 'alpha-script' }]);
    const flagSpy = vi.spyOn(handler, 'getAssetsByFlags').mockReturnValue(assets);

    await expect(handler.preloadAssetsByFlag('alpha')).resolves.toEqual([{ name: 'alpha-script' }]);

    expect(flagSpy).toHaveBeenCalledWith(['alpha']);
    expect(pipelineSpy).toHaveBeenCalledWith(assets);
  });

  it('preloadAssetsByFlag waits for readiness before loading', async () => {
    const handler = createHandler();
    const whenReadySpy = vi.spyOn(handler, 'whenReady');
    vi.spyOn(handler, 'getAssetsByFlags').mockReturnValue([]);
    vi.spyOn(handler, '_loadAssetsWithPipeline').mockResolvedValue([]);

    await handler.preloadAssetsByFlag('alpha');

    expect(whenReadySpy).toHaveBeenCalledTimes(1);
  });

  it('loadAsset marks successful loads as loaded', async () => {
    const handler = createHandler();
    vi.spyOn(handler, '_loadAssetCore').mockResolvedValue({ name: 'alpha-script', type: 'script', url: '/alpha.js' });

    await expect(handler.loadAsset(config[0])).resolves.toMatchObject({
      name: 'alpha-script',
      url: '/alpha.js',
    });
    expect(handler.loadedAssets.has('alpha-script')).toBe(true);
    expect(handler.failedAssets.has('alpha-script')).toBe(false);
  });

  it('loadAsset skips assets that are already in the DOM', async () => {
    const handler = createHandler();
    const script = document.createElement('script');
    script.setAttribute('data-asset-name', 'alpha-script');
    document.head.appendChild(script);

    await expect(handler.loadAsset(config[0])).resolves.toMatchObject({
      name: 'alpha-script',
      skipped: true,
    });
  });

  it('loadAsset retries once before succeeding', async () => {
    vi.useFakeTimers();
    const handler = createHandler();
    const firstError = new Error('first failure');
    const loadCore = vi.spyOn(handler, '_loadAssetCore');
    loadCore.mockRejectedValueOnce(firstError);
    loadCore.mockResolvedValueOnce({ name: 'alpha-script', type: 'script', url: '/alpha.js' });

    const promise = handler.loadAsset({ ...config[0], retry: 1 });
    await vi.advanceTimersByTimeAsync(1000);

    await expect(promise).resolves.toMatchObject({ name: 'alpha-script' });
    expect(loadCore).toHaveBeenCalledTimes(2);
  });

  it('loadAsset records a failure after exhausting retries', async () => {
    vi.useFakeTimers();
    const handler = createHandler();
    vi.spyOn(handler, '_loadAssetCore').mockRejectedValue(new Error('load failed'));

    const promise = handler.loadAsset({ ...config[0], retry: 1 });
    const expectation = expect(promise).rejects.toThrow('load failed');
    await vi.advanceTimersByTimeAsync(1000);

    await expectation;
    expect(handler.failedAssets.has('alpha-script')).toBe(true);
  });

  it('loadAssetsInParallelWithThrottle limits the active load count', async () => {
    const handler = createHandler();
    const started = [];
    const deferreds = [];
    vi.spyOn(handler, 'loadAsset').mockImplementation((asset) => {
      started.push(asset.name);
      const deferred = createDeferred();
      deferreds.push(deferred);
      return deferred.promise;
    });

    const promise = handler.loadAssetsInParallelWithThrottle([config[0], config[1], config[2]], 2);

    expect(started).toEqual(['alpha-script', 'beta-style']);
    expect(handler.loadAsset).toHaveBeenCalledTimes(2);

    deferreds[0].resolve({ name: 'alpha-script' });
    await vi.waitFor(() => expect(handler.loadAsset).toHaveBeenCalledTimes(3));

    deferreds[1].resolve({ name: 'beta-style' });
    deferreds[2].resolve({ name: 'shared-font' });

    await expect(promise).resolves.toHaveLength(3);
  });

  it('loadAssetsInParallelWithThrottle converts load failures into result objects', async () => {
    const handler = createHandler();
    vi.spyOn(handler, 'loadAsset').mockImplementation((asset) =>
      asset.name === 'beta-style'
        ? Promise.reject(new Error('broken style'))
        : Promise.resolve({ name: asset.name }),
    );

    await expect(handler.loadAssetsInParallelWithThrottle([config[0], config[1]], 2)).resolves.toEqual([
      { name: 'alpha-script' },
      { error: 'broken style', asset: 'beta-style' },
    ]);
  });

  it('loadAssetsInParallelWithThrottle resolves all loaded assets', async () => {
    const handler = createHandler();
    vi.spyOn(handler, 'loadAsset').mockImplementation((asset) => Promise.resolve({ name: asset.name, loaded: true }));

    await expect(handler.loadAssetsInParallelWithThrottle([config[0], config[1]], 2)).resolves.toEqual([
      { name: 'alpha-script', loaded: true },
      { name: 'beta-style', loaded: true },
    ]);
  });

  it('registerPreloadHint injects a preload link once per asset url', () => {
    const handler = createHandler();

    handler.registerPreloadHint(config[0]);
    handler.registerPreloadHint(config[0]);

    expect(document.head.querySelectorAll('link[rel="preload"]').length).toBe(1);
    expect(handler.preloadHints.size).toBe(1);
  });

  it('registerPreloadHint uses style preloads for css assets', () => {
    const handler = createHandler();

    handler.registerPreloadHint(config[1]);

    const link = document.head.querySelector('link[rel="preload"]');
    expect(link).toBeTruthy();
    expect(link.as).toBe('style');
    expect(link.href).toContain('/beta.css');
  });

  it('registerPreloadHint stores the injected link element', () => {
    const handler = createHandler();

    handler.registerPreloadHint(config[2]);

    expect(handler.preloadHints.has('font:/font.woff2')).toBe(true);
  });

  it('warmCacheForAssets is a no-op for known flags', () => {
    const handler = createHandler();
    const before = document.head.childElementCount;

    expect(handler.warmCacheForAssets('alpha')).toBeUndefined();
    expect(document.head.childElementCount).toBe(before);
  });

  it('warmCacheForAssets ignores unknown flags without mutating the DOM', () => {
    const handler = createHandler();
    const before = document.head.childElementCount;

    handler.warmCacheForAssets('missing-flag');

    expect(document.head.childElementCount).toBe(before);
  });
});
