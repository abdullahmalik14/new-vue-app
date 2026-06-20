import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AssetHandler from '../../src/systems/assets/assetHandler.js';

const config = [
  { name: 'alpha-script', url: '/alpha.js', type: 'script' },
];

function createHandler() {
  return new AssetHandler(config);
}

describe('AssetHandler lifecycle', () => {
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

  it('reports ready after construction', () => {
    const handler = createHandler();

    expect(handler.isReady()).toBe(true);
  });

  it('stays ready after dispose', () => {
    const handler = createHandler();

    handler.dispose();

    expect(handler.isReady()).toBe(true);
  });

  it('whenReady resolves immediately once ready', async () => {
    const handler = createHandler();

    await expect(handler.whenReady()).resolves.toBeUndefined();
  });

  it('whenReady reuses the same pending promise', () => {
    const handler = createHandler();
    handler._isReady = false;
    handler._readyPromise = null;
    handler._readyCallbacks = [];

    handler.whenReady();
    const pending = handler._readyPromise;
    handler.whenReady();

    expect(pending).toBeTruthy();
    expect(handler._readyPromise).toBe(pending);
  });

  it('whenReady resolves after _markAsReady runs', async () => {
    const handler = createHandler();
    handler._isReady = false;
    handler._readyPromise = null;
    handler._readyCallbacks = [];

    const promise = handler.whenReady();
    handler._markAsReady();

    await expect(promise).resolves.toBeUndefined();
    expect(handler.isReady()).toBe(true);
  });

  it('dispose removes registered event listeners', () => {
    const handler = createHandler();
    const listener = vi.fn();
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    handler.eventListeners.set('asset-ready', listener);
    handler.dispose();

    expect(removeSpy).toHaveBeenCalledWith('asset-ready', listener);
    expect(handler.eventListeners.size).toBe(0);
  });

  it('dispose disconnects observers and clears the observer list', () => {
    const handler = createHandler();
    const observer = { disconnect: vi.fn() };

    handler.observers.push(observer);
    handler.dispose();

    expect(observer.disconnect).toHaveBeenCalledTimes(1);
    expect(handler.observers).toEqual([]);
  });

  it('dispose clears preload hints and in-flight assets', () => {
    const handler = createHandler();
    handler.preloadHints.set('script:/alpha.js', document.createElement('link'));
    handler.inFlightAssets.set('alpha-script', Promise.resolve());

    handler.dispose();

    expect(handler.preloadHints.size).toBe(0);
    expect(handler.inFlightAssets.size).toBe(0);
  });

  it('getStatistics reports zero transient counts for a fresh handler', () => {
    const handler = createHandler();

    expect(handler.getStatistics()).toMatchObject({
      totalAssets: 1,
      loadedAssets: 0,
      failedAssets: 0,
      inFlightAssets: 0,
      preloadHints: 0,
      eventListeners: 0,
      observers: 0,
      loadedList: [],
      failedList: [],
    });
  });

  it('getStatistics lists loaded and failed assets', () => {
    const handler = createHandler();
    handler.loadedAssets.add('alpha-script');
    handler.failedAssets.set('broken-script', 2);
    handler.inFlightAssets.set('loading-script', Promise.resolve());
    handler.preloadHints.set('script:/alpha.js', document.createElement('link'));
    handler.eventListeners.set('asset-ready', vi.fn());
    handler.observers.push({ disconnect: vi.fn() });

    expect(handler.getStatistics()).toMatchObject({
      loadedAssets: 1,
      failedAssets: 1,
      inFlightAssets: 1,
      preloadHints: 1,
      eventListeners: 1,
      observers: 1,
      loadedList: ['alpha-script'],
      failedList: ['broken-script'],
    });
  });

  it('getStatistics keeps loaded counts after dispose but clears transient collections', () => {
    const handler = createHandler();
    handler.loadedAssets.add('alpha-script');
    handler.failedAssets.set('broken-script', 1);
    handler.inFlightAssets.set('loading-script', Promise.resolve());
    handler.preloadHints.set('script:/alpha.js', document.createElement('link'));
    handler.eventListeners.set('asset-ready', vi.fn());
    handler.observers.push({ disconnect: vi.fn() });

    handler.dispose();

    expect(handler.getStatistics()).toMatchObject({
      loadedAssets: 1,
      failedAssets: 1,
      inFlightAssets: 0,
      preloadHints: 0,
      eventListeners: 0,
      observers: 0,
    });
  });
});
