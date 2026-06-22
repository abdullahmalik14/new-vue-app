import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AssetHandler from '../../src/systems/assets/assetHandler.js';

const config = [
  { name: 'route-asset-1', url: '/route1.js', type: 'script', flags: ['route1'] },
  { name: 'route-asset-2', url: '/route2.js', type: 'script', flags: ['route2'] },
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

describe('AssetHandler mount helpers', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    globalThis.CSS = { escape: (value) => String(value) };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with no pending mount blockers', () => {
    const handler = createHandler();

    expect(handler.hasPendingMountBlockers()).toBe(false);
    expect(handler.getPendingMountBlockers()).toEqual([]);
  });

  it('loadAssetsForEvent registers a listener for the event name', () => {
    const handler = createHandler();
    const addSpy = vi.spyOn(window, 'addEventListener');

    handler.loadAssetsForEvent('route1', vi.fn());

    expect(addSpy).toHaveBeenCalledWith('route1', expect.any(Function));
  });

  it('loadAssetsForEvent loads assets and calls the callback', async () => {
    const handler = createHandler();
    const pipelineSpy = vi.spyOn(handler, '_loadAssetsWithPipeline').mockResolvedValue([{ name: 'route-asset-1' }]);
    const callback = vi.fn();

    handler.loadAssetsForEvent('route1', callback);
    window.dispatchEvent(new Event('route1'));
    await vi.waitFor(() => expect(callback).toHaveBeenCalled());

    expect(pipelineSpy).toHaveBeenCalledWith([expect.objectContaining({ name: 'route-asset-1' })]);
    expect(callback).toHaveBeenCalledWith([{ name: 'route-asset-1' }]);
  });

  it('loadAssetsForEvent passes an error object to the callback on failure', async () => {
    const handler = createHandler();
    const callback = vi.fn();
    vi.spyOn(handler, '_loadAssetsWithPipeline').mockRejectedValue(new Error('load failed'));

    handler.loadAssetsForEvent('route1', callback);
    window.dispatchEvent(new Event('route1'));
    await Promise.resolve();

    expect(callback).toHaveBeenCalledWith({ error: 'load failed' });
  });

  it('loadAssetsBeforeMount adds a blocker before the promise resolves', async () => {
    const handler = createHandler();
    const deferred = createDeferred();
    vi.spyOn(handler, 'ensureAssetsForDefinition').mockReturnValue(deferred.promise);

    const promise = handler.loadAssetsBeforeMount({ name: 'test-route', assetDependencies: ['route-asset-1'] });
    await vi.waitFor(() => expect(handler.hasPendingMountBlockers()).toBe(true));

    deferred.resolve({
      satisfied: ['route-asset-1'],
      failed: [],
      alreadyReady: [],
      attempted: ['route-asset-1'],
      triggeredLoads: [],
    });
    await expect(promise).resolves.toMatchObject({ satisfied: ['route-asset-1'] });
  });

  it('getPendingMountBlockers includes route information while pending', async () => {
    const handler = createHandler();
    const deferred = createDeferred();
    vi.spyOn(handler, 'ensureAssetsForDefinition').mockReturnValue(deferred.promise);

    const promise = handler.loadAssetsBeforeMount({ path: '/test', assetDependencies: ['route-asset-1'] });
    await vi.waitFor(() => expect(handler.getPendingMountBlockers()).toHaveLength(1));

    const blockers = handler.getPendingMountBlockers();

    deferred.resolve({
      satisfied: ['route-asset-1'],
      failed: [],
      alreadyReady: [],
      attempted: ['route-asset-1'],
      triggeredLoads: [],
    });
    await promise;

    expect(blockers).toHaveLength(1);
    expect(blockers[0]).toMatchObject({ route: '/test' });
  });

  it('hasPendingMountBlockers is true while a mount load is pending', async () => {
    const handler = createHandler();
    const deferred = createDeferred();
    vi.spyOn(handler, 'ensureAssetsForDefinition').mockReturnValue(deferred.promise);

    const promise = handler.loadAssetsBeforeMount({ name: 'pending-route', assetDependencies: ['route-asset-1'] });
    await vi.waitFor(() => expect(handler.hasPendingMountBlockers()).toBe(true));

    deferred.resolve({
      satisfied: ['route-asset-1'],
      failed: [],
      alreadyReady: [],
      attempted: ['route-asset-1'],
      triggeredLoads: [],
    });
    await promise;

    expect(handler.hasPendingMountBlockers()).toBe(false);
  });

  it('loadAssetsBeforeMount clears the blocker after success', async () => {
    const handler = createHandler();
    vi.spyOn(handler, 'ensureAssetsForDefinition').mockResolvedValue({
      satisfied: ['route-asset-1'],
      failed: [],
      alreadyReady: [],
      attempted: ['route-asset-1'],
      triggeredLoads: [],
    });

    await handler.loadAssetsBeforeMount({ name: 'success-route', assetDependencies: ['route-asset-1'] });

    expect(handler.hasPendingMountBlockers()).toBe(false);
    expect(handler.getPendingMountBlockers()).toEqual([]);
  });

  it('loadAssetsBeforeMount clears the blocker after failure', async () => {
    const handler = createHandler();
    vi.spyOn(handler, 'ensureAssetsForDefinition').mockRejectedValue(new Error('mount failed'));

    await expect(
      handler.loadAssetsBeforeMount({ name: 'failure-route', assetDependencies: ['route-asset-1'] }),
    ).rejects.toThrow('mount failed');

    expect(handler.hasPendingMountBlockers()).toBe(false);
  });

  it('dispatchAssetLoadEvent emits a bare Event when no detail is provided', () => {
    const handler = createHandler();
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    handler.dispatchAssetLoadEvent('asset-loaded');

    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
    expect(dispatchSpy.mock.calls[0][0]).not.toBeInstanceOf(CustomEvent);
  });

  it('dispatchAssetLoadEvent emits a CustomEvent when detail is provided', () => {
    const handler = createHandler();
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    handler.dispatchAssetLoadEvent('asset-loaded', { name: 'route-asset-1' });

    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(CustomEvent));
    expect(dispatchSpy.mock.calls[0][0].detail).toEqual({ name: 'route-asset-1' });
  });

  it('loadAssetsBeforeMount forwards strict mode by default', async () => {
    const handler = createHandler();
    const ensureSpy = vi.spyOn(handler, 'ensureAssetsForDefinition').mockResolvedValue({
      satisfied: [],
      failed: [],
      alreadyReady: [],
      attempted: [],
      triggeredLoads: [],
    });

    await handler.loadAssetsBeforeMount({ name: 'strict-route', assetDependencies: [] });

    expect(ensureSpy).toHaveBeenCalledWith(
      { name: 'strict-route', assetDependencies: [] },
      expect.objectContaining({ strict: true }),
    );
  });
});
