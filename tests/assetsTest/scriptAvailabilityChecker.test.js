import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const assetHandlerInstances = vi.hoisted(() => []);
const getAssetUrl = vi.hoisted(() => vi.fn());

vi.mock('../../src/infrastructure/logging/logHandler.js', () => ({
  log: vi.fn(),
}));

vi.mock('../../src/systems/assets/assetLibrary.js', () => ({
  getAssetUrl,
}));

vi.mock('@/systems/assets/assetHandler.js', () => ({
  default: class MockAssetHandler {
    constructor(config) {
      this.config = Array.isArray(config) ? [...config] : [];
      this.assetMap = new Map(config.map((asset) => [asset.name, asset]));
      this.loadedAssets = new Set();
      this.failedAssets = new Map();
      this.inFlightAssets = new Map();
      this.whenReady = vi.fn().mockResolvedValue();
      this.isAssetAlreadyInDOM = vi.fn((name, type) => {
        const selector = `[data-asset-name="${name}"]`;
        const element = document.querySelector(selector);
        if (!element) {
          return false;
        }
        const asset = this.assetMap.get(name);
        return type ? !asset || asset.type === type : true;
      });
      this.loadAsset = vi.fn(async (asset) => ({ name: asset.name, type: asset.type, url: asset.url }));
      this.getAssetByName = vi.fn((name) => this.assetMap.get(name) ?? null);
      assetHandlerInstances.push(this);
    }
  },
}));

async function loadModule() {
  return import('../../src/systems/interactions/scriptAvailabilityChecker.js');
}

describe('scriptAvailabilityChecker', () => {
  beforeEach(() => {
    vi.resetModules();
    delete window.assetHandler;
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    getAssetUrl.mockReset();
    assetHandlerInstances.length = 0;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('returns false before a script is injected', async () => {
    const { isScriptInDOM } = await loadModule();

    expect(isScriptInDOM('cognito')).toBe(false);
  });

  it('returns true once a matching script is in the DOM', async () => {
    const { isScriptInDOM } = await loadModule();
    const script = document.createElement('script');
    script.setAttribute('data-asset-name', 'cognito');
    document.head.appendChild(script);

    expect(isScriptInDOM('cognito')).toBe(true);
  });

  it('requires globals when requested', async () => {
    const { isScriptReady } = await loadModule();
    const script = document.createElement('script');
    script.setAttribute('data-asset-name', 'cognito');
    document.head.appendChild(script);

    expect(isScriptReady('cognito', 'AmazonCognitoIdentity')).toBe(false);
    window.AmazonCognitoIdentity = {};
    expect(isScriptReady('cognito', 'AmazonCognitoIdentity')).toBe(true);
  });

  it('throws when loading an unregistered asset', async () => {
    const { loadScript } = await loadModule();

    await expect(loadScript('missing-script')).rejects.toThrow('Asset "missing-script" not registered');
  });

  it('throws when loading a non-script asset', async () => {
    const { addAssetToHandler, loadScript } = await loadModule();

    addAssetToHandler({ name: 'style-asset', url: '/style.css', type: 'css' });

    await expect(loadScript('style-asset')).rejects.toThrow('is not a script type');
  });

  it('returns skipped when a script is already in the DOM', async () => {
    const { loadScript } = await loadModule();
    const script = document.createElement('script');
    script.setAttribute('data-asset-name', 'cognito');
    document.head.appendChild(script);

    await expect(loadScript('cognito')).resolves.toMatchObject({
      name: 'cognito',
      skipped: true,
    });
  });

  it('delegates script loading to the handler when the script is missing', async () => {
    const mod = await loadModule();
    mod.isScriptInDOM('cognito');
    const handler = assetHandlerInstances[0];
    handler.loadAsset.mockResolvedValueOnce({ name: 'cognito', type: 'script', url: '/vendor/test.js' });

    await expect(mod.loadScript('cognito')).resolves.toMatchObject({
      name: 'cognito',
      type: 'script',
      url: '/vendor/test.js',
    });
    expect(handler.loadAsset).toHaveBeenCalledWith(handler.assetMap.get('cognito'));
  });

  it('resolves waitForScriptAvailability once the script becomes available', async () => {
    vi.useFakeTimers();
    const mod = await loadModule();
    mod.isScriptInDOM('cognito');
    const handler = assetHandlerInstances[0];
    handler.loadAsset.mockImplementation(async (asset) => {
      const script = document.createElement('script');
      script.setAttribute('data-asset-name', asset.name);
      document.head.appendChild(script);
      handler.loadedAssets.add(asset.name);
      return { name: asset.name, type: asset.type, url: asset.url };
    });

    const promise = mod.waitForScriptAvailability('cognito', { autoLoad: true, pollInterval: 10, maxWaitTime: 100 });
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBe(true);
  });

  it('resolves waitForScriptAvailability immediately for an already ready script', async () => {
    const { waitForScriptAvailability } = await loadModule();
    const script = document.createElement('script');
    script.setAttribute('data-asset-name', 'cognito');
    document.head.appendChild(script);
    window.AmazonCognitoIdentity = {};

    await expect(waitForScriptAvailability('cognito', { checkGlobal: 'AmazonCognitoIdentity', autoLoad: false })).resolves.toBe(true);
  });

  it('reports script loading state across not-loaded, loaded, failed, and in-flight cases', async () => {
    const mod = await loadModule();
    mod.isScriptInDOM('cognito');
    const handler = assetHandlerInstances[0];

    expect(mod.getScriptLoadingState('cognito')).toEqual({
      state: 'not-loaded',
      inDOM: false,
      loaded: false,
      failed: false,
      inFlight: false,
    });

    handler.loadedAssets.add('cognito');
    expect(mod.getScriptLoadingState('cognito').state).toBe('loaded');

    handler.loadedAssets.delete('cognito');
    handler.failedAssets.set('cognito', 1);
    expect(mod.getScriptLoadingState('cognito').state).toBe('failed');

    handler.failedAssets.delete('cognito');
    handler.inFlightAssets.set('cognito', Promise.resolve());
    expect(mod.getScriptLoadingState('cognito').state).toBe('loading');
  });

  it('adds assets to the singleton handler', async () => {
    const mod = await loadModule();
    mod.isScriptInDOM('cognito');
    const handler = assetHandlerInstances[0];

    expect(mod.addAssetToHandler({ name: 'extra-script', url: '/extra.js', type: 'script' })).toBe(true);
    expect(handler.assetMap.get('extra-script')).toMatchObject({ url: '/extra.js' });
  });

  it('updates asset URLs from the asset map lookup', async () => {
    const mod = await loadModule();
    mod.isScriptInDOM('cognito');
    const handler = assetHandlerInstances[0];
    mod.addAssetToHandler({ name: 'mapped-script', url: '/old.js', type: 'script' });
    getAssetUrl.mockResolvedValueOnce('/new.js');

    await expect(mod.updateAssetUrlFromAssetMap('mapped-script', 'script.mapped')).resolves.toBe(true);
    expect(handler.assetMap.get('mapped-script').url).toBe('/new.js');
  });

});
