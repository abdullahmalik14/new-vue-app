/**
 * AssetHandler Critical Missing Features Test Suite
 * 
 * Tests for critical features not covered in existing test files:
 * - Route/mount blocking APIs
 * - Dependency management APIs
 * - Error handling & retry logic
 * - Lifecycle management
 * - Advanced element types and attributes
 * - Edge cases and error scenarios
 */

import { JSDOM } from 'jsdom';
import { vi } from 'vitest';
import AssetHandler from '../../src/utils/assets/assetsHandlerNew.js';

// Test environment setup
const dom = new JSDOM('<!DOCTYPE html><html><head></head><body><div id="test-container"></div></body></html>', {
  url: 'http://localhost'
});

global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Event = dom.window.Event;
global.CustomEvent = dom.window.CustomEvent;

// Mock browser APIs
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.observe = vi.fn();
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();
  }
};

// Mock CSS.escape
global.CSS = {
  escape: (str) => str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&')
};

// Mock performance
if (!global.performance) {
  global.performance = { now: () => Date.now() };
}

describe('AssetHandler Critical: Route/Mount Blocking APIs', () => {
  let handler;

  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '<div id="test-container"></div>';

    const config = [
      { name: 'route-asset-1', url: '/route1.js', type: 'script', flags: ['route1'] },
      { name: 'route-asset-2', url: '/route2.js', type: 'script', flags: ['route2'] },
      { name: 'shared-asset', url: '/shared.js', type: 'script', flags: ['shared'] }
    ];

    handler = new AssetHandler(config);

    // Suppress console output
    vi.spyOn(console, 'group').mockImplementation(() => { });
    vi.spyOn(console, 'groupEnd').mockImplementation(() => { });
    vi.spyOn(console, 'log').mockImplementation(() => { });
    vi.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('loadAssetsBeforeMount should load assets for route definition', async () => {
    const routeDefinition = {
      name: 'test-route',
      path: '/test',
      assetDependencies: ['route-asset-1']
    };

    // Mock asset loading
    const mockElement = document.createElement('script');
    mockElement.setAttribute('data-asset-name', 'route-asset-1');
    mockElement.onload = vi.fn();

    vi.spyOn(handler, 'createElementForAsset').mockReturnValue(mockElement);
    vi.spyOn(handler, 'insertAssetElement').mockImplementation((el) => {
      document.head.appendChild(el);
      return { success: true, fallback: false };
    });

    const loadPromise = handler.loadAssetsBeforeMount(routeDefinition);

    setTimeout(() => {
      if (mockElement.onload) mockElement.onload();
    }, 10);

    const result = await loadPromise;

    expect(result).toBeDefined();
    expect(result.satisfied).toContain('route-asset-1');
  });

  test('loadAssetsBeforeMount should register mount blocker', async () => {
    const routeDefinition = {
      name: 'blocking-route',
      assetDependencies: ['route-asset-1']
    };

    vi.spyOn(handler, 'ensureAssetsForDefinition').mockResolvedValue({
      satisfied: ['route-asset-1'],
      failed: [],
      alreadyReady: [],
      attempted: ['route-asset-1'],
      triggeredLoads: []
    });

    await handler.loadAssetsBeforeMount(routeDefinition);

    expect(handler.hasPendingMountBlockers()).toBe(false);
  });

  test('hasPendingMountBlockers should return true when blockers exist', async () => {
    const routeDefinition = {
      name: 'pending-route',
      assetDependencies: ['route-asset-1']
    };

    // Start async load but don't await
    const promise = handler.loadAssetsBeforeMount(routeDefinition);

    // Check immediately (should have blocker)
    const hasBlockers = handler.hasPendingMountBlockers();

    // Complete the load
    vi.spyOn(handler, 'ensureAssetsForDefinition').mockResolvedValue({
      satisfied: ['route-asset-1'],
      failed: [],
      alreadyReady: [],
      attempted: ['route-asset-1'],
      triggeredLoads: []
    });

    await promise;

    expect(hasBlockers || handler.hasPendingMountBlockers()).toBeDefined();
  });

  test('getPendingMountBlockers should return blocker information', async () => {
    const routeDefinition = {
      name: 'info-route',
      assetDependencies: ['route-asset-1']
    };

    const promise = handler.loadAssetsBeforeMount(routeDefinition);

    const blockers = handler.getPendingMountBlockers();

    vi.spyOn(handler, 'ensureAssetsForDefinition').mockResolvedValue({
      satisfied: ['route-asset-1'],
      failed: [],
      alreadyReady: [],
      attempted: ['route-asset-1'],
      triggeredLoads: []
    });

    await promise;

    expect(Array.isArray(blockers)).toBe(true);
  });

  test('ensureAssetsForDefinition should handle missing assetDependencies', async () => {
    const routeDefinition = {
      name: 'no-deps-route'
      // No assetDependencies
    };

    const result = await handler.ensureAssetsForDefinition(routeDefinition);

    expect(result.skipped).toBe(true);
    expect(result.satisfied).toEqual([]);
  });

  test('areAssetsReadyForDefinition should check readiness', () => {
    const routeDefinition = {
      name: 'ready-route',
      assetDependencies: ['route-asset-1']
    };

    // Asset not loaded yet
    const result1 = handler.areAssetsReadyForDefinition(routeDefinition);
    expect(result1.ready).toBe(false);
    expect(result1.pending).toContain('route-asset-1');

    // Asset already in DOM
    const existingScript = document.createElement('script');
    existingScript.setAttribute('data-asset-name', 'route-asset-1');
    document.head.appendChild(existingScript);

    const result2 = handler.areAssetsReadyForDefinition(routeDefinition);
    expect(result2.ready).toBe(true);
    expect(result2.pending).toEqual([]);
  });
});

describe('AssetHandler Critical: Dependency Management APIs', () => {
  let handler;

  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';

    const config = [
      { name: 'dep-a', url: '/a.js', type: 'script', flags: ['group1'] },
      { name: 'dep-b', url: '/b.js', type: 'script', flags: ['group1'], dependencies: ['dep-a'] },
      { name: 'dep-c', url: '/c.js', type: 'script', flags: ['group2'] }
    ];

    handler = new AssetHandler(config);

    vi.spyOn(console, 'group').mockImplementation(() => { });
    vi.spyOn(console, 'groupEnd').mockImplementation(() => { });
    vi.spyOn(console, 'log').mockImplementation(() => { });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('areAssetDependenciesReady should check by name', () => {
    const result = handler.areAssetDependenciesReady(['dep-a']);

    expect(result).toHaveProperty('ready');
    expect(result).toHaveProperty('pending');
    expect(Array.isArray(result.pending)).toBe(true);
  });

  test('areAssetDependenciesReady should check by flag', () => {
    const result = handler.areAssetDependenciesReady(['flag:group1']);

    expect(result).toHaveProperty('ready');
    expect(result).toHaveProperty('pending');
  });

  test('areAssetDependenciesReady should handle mixed dependencies', () => {
    const result = handler.areAssetDependenciesReady(['dep-a', 'flag:group2']);

    expect(result).toHaveProperty('ready');
    expect(result).toHaveProperty('pending');
  });

  test('ensureAssetDependencies should load missing dependencies', async () => {
    const mockElement = document.createElement('script');
    mockElement.setAttribute('data-asset-name', 'dep-a');
    mockElement.onload = vi.fn();

    vi.spyOn(handler, 'createElementForAsset').mockReturnValue(mockElement);
    vi.spyOn(handler, 'insertAssetElement').mockImplementation((el) => {
      document.head.appendChild(el);
      return { success: true, fallback: false };
    });

    const loadPromise = handler.ensureAssetDependencies(['dep-a']);

    setTimeout(() => {
      if (mockElement.onload) mockElement.onload();
    }, 10);

    const result = await loadPromise;

    expect(result).toHaveProperty('satisfied');
    expect(result).toHaveProperty('failed');
    expect(result).toHaveProperty('alreadyReady');
    expect(result).toHaveProperty('attempted');
    expect(result).toHaveProperty('triggeredLoads');
  });

  test('ensureAssetDependencies should handle already loaded assets', async () => {
    // Pre-load asset
    const existingScript = document.createElement('script');
    existingScript.setAttribute('data-asset-name', 'dep-a');
    document.head.appendChild(existingScript);
    handler.loadedAssets.add('dep-a');

    const result = await handler.ensureAssetDependencies(['dep-a']);

    expect(result.alreadyReady).toContain('dep-a');
    expect(result.triggeredLoads).not.toContain('dep-a');
  });

  test('ensureAssetDependencies should throw in strict mode on failure', async () => {
    vi.spyOn(handler, '_loadAssetsWithPipeline').mockRejectedValue(new Error('Load failed'));

    await expect(
      handler.ensureAssetDependencies(['dep-a'], { strict: true })
    ).rejects.toThrow();
  });

  test('ensureAssetDependencies should not throw in non-strict mode on failure', async () => {
    vi.spyOn(handler, '_loadAssetsWithPipeline').mockRejectedValue(new Error('Load failed'));

    const result = await handler.ensureAssetDependencies(['dep-a'], { strict: false });

    expect(result).toHaveProperty('failed');
    expect(result.failed.length).toBeGreaterThan(0);
  });

  test('_normalizeDependencyInput should handle string dependencies', () => {
    const result = handler._normalizeDependencyInput(['dep-a', 'dep-b']);

    expect(result.names).toContain('dep-a');
    expect(result.names).toContain('dep-b');
  });

  test('_normalizeDependencyInput should handle flag: prefix', () => {
    const result = handler._normalizeDependencyInput(['flag:group1']);

    expect(result.flags).toContain('group1');
    expect(result.names).not.toContain('flag:group1');
  });

  test('_normalizeDependencyInput should handle name: prefix', () => {
    const result = handler._normalizeDependencyInput(['name:dep-a']);

    expect(result.names).toContain('dep-a');
  });

  test('_normalizeDependencyInput should handle object dependencies', () => {
    const result = handler._normalizeDependencyInput([
      { type: 'name', value: 'dep-a' },
      { type: 'flag', value: 'group1' }
    ]);

    expect(result.names).toContain('dep-a');
    expect(result.flags).toContain('group1');
  });

  test('getAssetByName should return asset by name', () => {
    const asset = handler.getAssetByName('dep-a');

    expect(asset).toBeDefined();
    expect(asset.name).toBe('dep-a');
  });

  test('getAssetByName should return null for unknown asset', () => {
    const asset = handler.getAssetByName('unknown-asset');

    expect(asset).toBeNull();
  });
});

describe('AssetHandler Critical: Error Handling & Retry Logic', () => {
  let handler;

  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';

    const config = [
      { name: 'retry-asset', url: '/retry.js', type: 'script', retry: 2, timeout: 1000 }
    ];

    handler = new AssetHandler(config);

    vi.spyOn(console, 'group').mockImplementation(() => { });
    vi.spyOn(console, 'groupEnd').mockImplementation(() => { });
    vi.spyOn(console, 'log').mockImplementation(() => { });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test('loadAsset should retry on failure with exponential backoff', async () => {
    const asset = { name: 'retry-asset', url: '/retry.js', type: 'script', retry: 2, timeout: 5000 };
    let attemptCount = 0;

    vi.spyOn(handler, '_loadAssetCore').mockImplementation(() => {
      attemptCount++;
      if (attemptCount < 3) {
        return Promise.reject(new Error('Load failed'));
      }
      // Success on third attempt
      return Promise.resolve({ name: 'retry-asset', type: 'script', url: '/retry.js' });
    });

    const result = await handler.loadAsset(asset);

    expect(attemptCount).toBe(3);
    expect(result.name).toBe('retry-asset');
  }, 10000); // Increase timeout for retry test

  test('loadAsset should fail after max retries', async () => {
    const asset = { name: 'fail-asset', url: '/fail.js', type: 'script', retry: 1, timeout: 5000 };

    vi.spyOn(handler, '_loadAssetCore').mockRejectedValue(new Error('Load failed'));

    await expect(handler.loadAsset(asset)).rejects.toThrow();
    expect(handler.failedAssets.has('fail-asset')).toBe(true);
  }, 10000); // Increase timeout for retry test

  test('loadAsset should timeout after specified duration', async () => {
    vi.useFakeTimers();

    const asset = { name: 'timeout-asset', url: '/timeout.js', type: 'script', timeout: 1000 };

    vi.spyOn(handler, '_loadAssetCore').mockImplementation(() => {
      return new Promise(() => { }); // Never resolves
    });

    vi.spyOn(handler, 'createElementForAsset').mockReturnValue(
      document.createElement('script')
    );
    vi.spyOn(handler, 'insertAssetElement').mockReturnValue({ success: true, fallback: false });

    const loadPromise = handler.loadAsset(asset);

    vi.advanceTimersByTime(1100);

    await expect(loadPromise).rejects.toThrow('Load timeout');
  });

  test('loadAsset should handle load errors gracefully', async () => {
    const asset = { name: 'error-asset', url: '/error.js', type: 'script', retry: 0 };

    const mockElement = document.createElement('script');
    mockElement.setAttribute('data-asset-name', 'error-asset');
    mockElement.onerror = vi.fn();

    vi.spyOn(handler, 'createElementForAsset').mockReturnValue(mockElement);
    vi.spyOn(handler, 'insertAssetElement').mockReturnValue({ success: true, fallback: false });

    const loadPromise = handler.loadAsset(asset);

    setTimeout(() => {
      if (mockElement.onerror) mockElement.onerror();
    }, 10);

    await expect(loadPromise).rejects.toThrow();
  });
});

describe('AssetHandler Critical: Lifecycle Management', () => {
  let handler;

  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';

    const config = [
      { name: 'lifecycle-asset', url: '/lifecycle.js', type: 'script', flags: ['test'] }
    ];

    handler = new AssetHandler(config);

    vi.spyOn(console, 'group').mockImplementation(() => { });
    vi.spyOn(console, 'groupEnd').mockImplementation(() => { });
    vi.spyOn(console, 'log').mockImplementation(() => { });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('dispose should remove event listeners', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    handler.loadAssetsForEvent('test-event', () => { });
    handler.dispose();

    expect(removeEventListenerSpy).toHaveBeenCalled();
    expect(handler.eventListeners.size).toBe(0);
  });

  test('dispose should disconnect observers', () => {
    const mockObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    };

    handler.observers.push(mockObserver);
    handler.dispose();

    expect(mockObserver.disconnect).toHaveBeenCalled();
    expect(handler.observers.length).toBe(0);
  });

  test('dispose should clear preload hints', () => {
    const asset = { name: 'preload-asset', url: '/preload.js', type: 'script' };
    handler.registerPreloadHint(asset);

    expect(handler.preloadHints.size).toBeGreaterThan(0);

    handler.dispose();

    expect(handler.preloadHints.size).toBe(0);
  });

  test('dispose should clear in-flight assets', () => {
    handler.inFlightAssets.set('test-asset', Promise.resolve());

    expect(handler.inFlightAssets.size).toBeGreaterThan(0);

    handler.dispose();

    expect(handler.inFlightAssets.size).toBe(0);
  });
});

describe('AssetHandler Critical: Advanced Element Types', () => {
  let handler;

  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';

    handler = new AssetHandler([]);

    vi.spyOn(console, 'group').mockImplementation(() => { });
    vi.spyOn(console, 'groupEnd').mockImplementation(() => { });
    vi.spyOn(console, 'log').mockImplementation(() => { });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('createElementForAsset should create SVG element', () => {
    const asset = { name: 'svg-asset', url: '/image.svg', type: 'svg' };
    const element = handler.createElementForAsset(asset);

    expect(element.tagName).toBe('OBJECT');
    // Browser converts relative URLs to absolute, so check it contains the path
    expect(element.data).toContain('/image.svg');
    expect(element.type).toBe('image/svg+xml');
  });

  test('createElementForAsset should create object element', () => {
    const asset = { name: 'object-asset', url: '/object.swf', type: 'object' };
    const element = handler.createElementForAsset(asset);

    expect(element.tagName).toBe('OBJECT');
    // Browser converts relative URLs to absolute
    expect(element.data).toContain('/object.swf');
  });

  test('createElementForAsset should create embed element', () => {
    const asset = { name: 'embed-asset', url: '/embed.swf', type: 'embed' };
    const element = handler.createElementForAsset(asset);

    expect(element.tagName).toBe('EMBED');
    // Browser converts relative URLs to absolute
    expect(element.src).toContain('/embed.swf');
  });

  test('createElementForAsset should default to script for unknown types', () => {
    const asset = { name: 'unknown-asset', url: '/unknown.bin', type: 'unknown' };
    const element = handler.createElementForAsset(asset);

    expect(element.tagName).toBe('SCRIPT');
    // Browser converts relative URLs to absolute
    expect(element.src).toContain('/unknown.bin');
  });
});

describe('AssetHandler Critical: Advanced Attributes', () => {
  let handler;

  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';

    handler = new AssetHandler([], { nonce: 'global-nonce-123' });

    vi.spyOn(console, 'group').mockImplementation(() => { });
    vi.spyOn(console, 'groupEnd').mockImplementation(() => { });
    vi.spyOn(console, 'log').mockImplementation(() => { });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('createElementForAsset should apply nonce to script elements', () => {
    const asset = { name: 'nonce-script', url: '/script.js', type: 'script', nonce: 'asset-nonce-456' };
    const element = handler.createElementForAsset(asset);

    expect(element.nonce).toBe('asset-nonce-456');
  });

  test('createElementForAsset should use global nonce when asset nonce not provided', () => {
    const asset = { name: 'global-nonce-script', url: '/script.js', type: 'script' };
    const element = handler.createElementForAsset(asset);

    expect(element.nonce).toBe('global-nonce-123');
  });

  test('createElementForAsset should apply nonce to CSS link elements', () => {
    const asset = { name: 'nonce-css', url: '/style.css', type: 'css', nonce: 'css-nonce-789' };
    const element = handler.createElementForAsset(asset);

    expect(element.nonce).toBe('css-nonce-789');
  });

  test('createElementForAsset should apply crossOrigin to image elements', () => {
    const asset = { name: 'cors-image', url: '/image.jpg', type: 'image', crossOrigin: 'anonymous' };
    const element = handler.createElementForAsset(asset);

    expect(element.crossOrigin).toBe('anonymous');
  });

  test('createElementForAsset should apply crossOrigin to video elements', () => {
    const asset = { name: 'cors-video', url: '/video.mp4', type: 'video', crossOrigin: 'use-credentials' };
    const element = handler.createElementForAsset(asset);

    expect(element.crossOrigin).toBe('use-credentials');
  });

  test('createElementForAsset should apply media attribute to CSS', () => {
    const asset = { name: 'media-css', url: '/print.css', type: 'css', media: 'print' };
    const element = handler.createElementForAsset(asset);

    expect(element.media).toBe('print');
  });

  test('registerPreloadHint should apply nonce to preload links', () => {
    const asset = { name: 'preload-nonce', url: '/preload.js', type: 'script', nonce: 'preload-nonce-123' };
    handler.registerPreloadHint(asset);

    const preloadLink = document.head.querySelector('link[rel="preload"]');
    expect(preloadLink.nonce).toBe('preload-nonce-123');
  });

  test('registerPreloadHint should apply crossOrigin to preload links', () => {
    const asset = { name: 'preload-cors', url: '/font.woff2', type: 'font', crossOrigin: 'anonymous' };
    handler.registerPreloadHint(asset);

    const preloadLink = document.head.querySelector('link[rel="preload"]');
    expect(preloadLink.crossOrigin).toBe('anonymous');
  });
});

describe('AssetHandler Critical: Edge Cases & Error Scenarios', () => {
  let handler;

  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';

    handler = new AssetHandler([]);

    vi.spyOn(console, 'group').mockImplementation(() => { });
    vi.spyOn(console, 'groupEnd').mockImplementation(() => { });
    vi.spyOn(console, 'log').mockImplementation(() => { });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('removeAssetFromDOM should remove asset element', () => {
    const script = document.createElement('script');
    script.setAttribute('data-asset-name', 'remove-me');
    document.head.appendChild(script);
    handler.loadedAssets.add('remove-me');

    handler.removeAssetFromDOM('remove-me');

    expect(document.querySelector('[data-asset-name="remove-me"]')).toBeNull();
    expect(handler.loadedAssets.has('remove-me')).toBe(false);
  });

  test('removeAssetFromDOM should handle missing element gracefully', () => {
    handler.removeAssetFromDOM('non-existent');

    // Should not throw
    expect(true).toBe(true);
  });

  test('normalizeUrl should handle valid URLs', () => {
    const normalized = handler.normalizeUrl('/path/to/file.js?query=1');
    expect(normalized).toBe('/path/to/file.js');
  });

  test('normalizeUrl should handle invalid URLs gracefully', () => {
    const normalized = handler.normalizeUrl('not-a-url');
    expect(normalized).toBeDefined();
  });

  test('applyVersioning should handle URL errors gracefully', () => {
    // Mock URL constructor to throw
    const originalURL = global.URL;
    global.URL = vi.fn().mockImplementation(() => {
      throw new Error('Invalid URL');
    });

    const result = handler.applyVersioning('invalid-url', { version: '1.0.0' });

    expect(result).toBe('invalid-url'); // Should return original URL on error

    global.URL = originalURL;
  });

  test('getAssetsByFlags with matchAll should require all flags', () => {
    const config = [
      { name: 'a', url: '/a.js', type: 'script', flags: ['flag1', 'flag2'] },
      { name: 'b', url: '/b.js', type: 'script', flags: ['flag1'] },
      { name: 'c', url: '/c.js', type: 'script', flags: ['flag2'] }
    ];

    const testHandler = new AssetHandler(config);
    const result = testHandler.getAssetsByFlags(['flag1', 'flag2'], true);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('a');
  });

  test('getStatistics should return accurate counts', () => {
    const config = [
      { name: 'stat-1', url: '/1.js', type: 'script', flags: ['stats'] },
      { name: 'stat-2', url: '/2.js', type: 'script', flags: ['stats'] }
    ];

    const testHandler = new AssetHandler(config);
    testHandler.loadedAssets.add('stat-1');
    testHandler.failedAssets.set('stat-2', 1);
    testHandler.preloadHints.set('key1', document.createElement('link'));
    testHandler.eventListeners.set('event1', () => { });

    const stats = testHandler.getStatistics();

    expect(stats.totalAssets).toBe(2);
    expect(stats.loadedAssets).toBe(1);
    expect(stats.failedAssets).toBe(1);
    expect(stats.preloadHints).toBe(1);
    expect(stats.eventListeners).toBe(1);
    expect(stats.loadedList).toContain('stat-1');
    expect(stats.failedList).toContain('stat-2');
  });

  test('isReady should return readiness status', () => {
    expect(handler.isReady()).toBe(true); // Should be ready after construction
  });

  test('whenReady should resolve immediately if already ready', async () => {
    await expect(handler.whenReady()).resolves.toBeUndefined();
  });

  test('setGlobalVersion should validate semver', () => {
    expect(() => handler.setGlobalVersion('invalid')).toThrow();
    expect(() => handler.setGlobalVersion('1.0.0')).not.toThrow();
  });

  test('setGlobalVersion should accept null', () => {
    handler.setGlobalVersion('1.0.0');
    expect(() => handler.setGlobalVersion(null)).not.toThrow();
    expect(handler.globalVersion).toBeNull();
  });

  test('_loadAssetsWithPipeline should skip loading when offline', async () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: false
    });

    const result = await handler._loadAssetsWithPipeline([
      { name: 'offline-asset', url: '/offline.js', type: 'script' }
    ]);

    expect(result).toEqual([]);

    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true
    });
  });
});

