import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AssetHandler from '../../src/systems/assets/assetHandler.js';

const config = [
  { name: 'alpha-script', url: '/alpha.js', type: 'script', flags: ['alpha'] },
  { name: 'beta-style', url: '/beta.css', type: 'css', flags: ['beta'] },
];

function createHandler() {
  return new AssetHandler(config);
}

function installIntersectionObserverMock() {
  const instances = [];

  class MockIntersectionObserver {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.observe = vi.fn();
      this.unobserve = vi.fn();
      this.disconnect = vi.fn();
      instances.push(this);
    }

    trigger(entries) {
      this.callback(entries, this);
    }
  }

  globalThis.IntersectionObserver = MockIntersectionObserver;
  return instances;
}

describe('AssetHandler lazy loading helpers', () => {
  let observers;

  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    observers = installIntersectionObserverMock();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    globalThis.CSS = { escape: (value) => String(value) };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns an empty array when no selector matches', async () => {
    const handler = createHandler();

    await expect(handler.loadAssetsImmediatelyForSelector('.missing')).resolves.toEqual([]);
  });

  it('loads assets for matching selector elements', async () => {
    const handler = createHandler();
    const first = document.createElement('div');
    first.className = 'asset-node';
    first.setAttribute('data-asset-flag', 'alpha');
    const second = document.createElement('div');
    second.className = 'asset-node';
    second.setAttribute('data-asset-flag', 'beta');
    document.body.append(first, second);

    vi.spyOn(handler, '_loadAssetsWithPipeline').mockResolvedValue([{ name: 'alpha-script' }, { name: 'beta-style' }]);
    const callback = vi.fn();

    await expect(handler.loadAssetsImmediatelyForSelector('.asset-node', callback)).resolves.toEqual([
      { name: 'alpha-script' },
      { name: 'beta-style' },
    ]);

    expect(callback).toHaveBeenCalledWith([
      { name: 'alpha-script' },
      { name: 'beta-style' },
    ]);
  });

  it('ignores selector matches without a data-asset-flag', async () => {
    const handler = createHandler();
    const el = document.createElement('div');
    el.className = 'asset-node';
    document.body.appendChild(el);

    const pipelineSpy = vi.spyOn(handler, '_loadAssetsWithPipeline').mockResolvedValue([]);

    await expect(handler.loadAssetsImmediatelyForSelector('.asset-node')).resolves.toEqual([]);
    expect(pipelineSpy).toHaveBeenCalledWith([]);
  });

  it('observeLazyAssets attaches observers to flagged elements', () => {
    const handler = createHandler();
    const first = document.createElement('div');
    first.setAttribute('data-asset-flag', 'alpha');
    const second = document.createElement('div');
    second.setAttribute('data-asset-flag', 'beta');
    document.body.append(first, second);

    const observer = handler.observeLazyAssets(document.body);

    expect(observers).toHaveLength(1);
    expect(observer.observe).toHaveBeenCalledTimes(2);
    expect(observer.options).toEqual({ root: document.body });
  });

  it('observeLazyAssets loads an asset when it intersects', async () => {
    const handler = createHandler();
    const target = document.createElement('div');
    target.setAttribute('data-asset-flag', 'alpha');
    document.body.appendChild(target);
    const pipelineSpy = vi.spyOn(handler, '_loadAssetsWithPipeline').mockResolvedValue([{ name: 'alpha-script' }]);

    const observer = handler.observeLazyAssets(document.body);
    observer.trigger([{ isIntersecting: true, target }]);
    await vi.waitFor(() => expect(pipelineSpy).toHaveBeenCalled());

    expect(target).not.toBeNull();
    expect(pipelineSpy).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'alpha-script',
        url: '/alpha.js',
        type: 'script',
        flags: ['alpha'],
      }),
    ]);
    expect(observer.unobserve).toHaveBeenCalledWith(target);
  });

  it('observeLazyAssets ignores non-intersecting or unflagged entries', async () => {
    const handler = createHandler();
    const target = document.createElement('div');
    target.setAttribute('data-asset-flag', 'alpha');
    document.body.appendChild(target);
    const pipelineSpy = vi.spyOn(handler, '_loadAssetsWithPipeline').mockResolvedValue([]);

    const observer = handler.observeLazyAssets(document.body);
    observer.trigger([
      { isIntersecting: false, target },
      { isIntersecting: true, target: document.createElement('span') },
    ]);
    await Promise.resolve();

    expect(pipelineSpy).not.toHaveBeenCalled();
    expect(observer.unobserve).not.toHaveBeenCalled();
  });
});
