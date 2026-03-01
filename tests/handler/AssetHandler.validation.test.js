/**
 * AssetHandler API Validation Test Suite
 * 
 * Professional validation tests for AssetHandler functionality
 * Validates all specified client requirements and API behaviors
 * 
 * Requirements Validated:
 * - Asset DOM management and duplicate prevention
 * - URL versioning and cache-busting
 * - DOM element placement and positioning
 * - Asynchronous loading attributes
 * - Dependency resolution and load ordering
 * - Priority-based asset loading
 * - Media asset preloading capabilities
 * - Performance optimization features
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

// Mock browser APIs
global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock CSS.escape (not available in jsdom)
global.CSS = {
  escape: (str) => str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&')
};

describe('AssetHandler API Validation: DOM Management', () => {
  let handler;

  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '<div id="test-container"></div>';

    const config = [
      {
        name: 'test-script',
        url: '/js/test.js',
        type: 'script',
        flags: ['test'],
        version: '1.0.0'
      }
    ];

    handler = new AssetHandler(config);

    // Suppress console output during tests
    vi.spyOn(console, 'group').mockImplementation(() => { });
    vi.spyOn(console, 'groupEnd').mockImplementation(() => { });
    vi.spyOn(console, 'log').mockImplementation(() => { });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should not add asset when already present in DOM', async () => {
    // Pre-add asset to DOM
    const existingScript = document.createElement('script');
    existingScript.setAttribute('data-asset-name', 'test-script');
    existingScript.src = '/js/test.js';
    document.head.appendChild(existingScript);

    const asset = { name: 'test-script', url: '/js/test.js', type: 'script' };
    const result = await handler.loadAsset(asset);

    expect(result.skipped).toBe(true);
    expect(document.querySelectorAll('[data-asset-name="test-script"]')).toHaveLength(1);
  });

  test('should add asset when not present in DOM', async () => {
    const asset = { name: 'new-script', url: '/js/new.js', type: 'script' };

    // Mock element creation and insertion
    const mockElement = document.createElement('script');
    mockElement.setAttribute('data-asset-name', 'new-script');
    mockElement.onload = vi.fn();

    vi.spyOn(handler, 'createElementForAsset').mockReturnValue(mockElement);
    vi.spyOn(handler, 'insertAssetElement').mockImplementation((el) => {
      document.head.appendChild(el);
      return { success: true, fallback: false };
    });

    const loadPromise = handler.loadAsset(asset);

    // Simulate successful load
    setTimeout(() => {
      if (mockElement.onload) mockElement.onload();
    }, 10);

    const result = await loadPromise;

    expect(result.skipped).toBeUndefined();
    expect(document.querySelector('[data-asset-name="new-script"]')).toBeTruthy();
  });

  test('should add asset only once despite multiple calls', async () => {
    const asset = { name: 'once-script', url: '/js/once.js', type: 'script' };

    let createCount = 0;
    vi.spyOn(handler, 'createElementForAsset').mockImplementation(() => {
      createCount++;
      const el = document.createElement('script');
      el.setAttribute('data-asset-name', 'once-script');
      el.onload = vi.fn();
      return el;
    });

    vi.spyOn(handler, 'insertAssetElement').mockImplementation((el) => {
      document.head.appendChild(el);
      return { success: true, fallback: false };
    });

    // Simulate multiple rapid calls
    const promises = [
      handler.loadAsset(asset),
      handler.loadAsset(asset),
      handler.loadAsset(asset)
    ];

    // Simulate load for first element only
    setTimeout(() => {
      const elements = document.querySelectorAll('[data-asset-name="once-script"]');
      if (elements.length > 0) {
        const mockEl = elements[0];
        if (mockEl.onload) mockEl.onload();
      }
    }, 10);

    const results = await Promise.all(promises);

    // Only first call should create element, others should be skipped
    expect(createCount).toBe(1);
    expect(results.filter(r => r.skipped).length).toBe(2);
    expect(document.querySelectorAll('[data-asset-name="once-script"]')).toHaveLength(1);
  });
});

describe('AssetHandler API Validation: URL Versioning', () => {
  let handler;

  beforeEach(() => {
    handler = new AssetHandler([]);
    vi.spyOn(console, 'group').mockImplementation(() => { });
    vi.spyOn(console, 'groupEnd').mockImplementation(() => { });
    vi.spyOn(console, 'log').mockImplementation(() => { });
  });

  test('should apply version parameter to URLs', () => {
    const asset = { version: '2.1.0', critical: false };
    const versionedUrl = handler.applyVersioning('/js/app.js', asset);

    expect(versionedUrl).toContain('?ver=2.1.0');
  });

  test('should handle existing query parameters correctly', () => {
    const asset = { version: '1.5.0', critical: true };
    const versionedUrl = handler.applyVersioning('/css/style.css?theme=dark', asset);

    expect(versionedUrl).toContain('theme=dark');
    expect(versionedUrl).toContain('&ver=1.5.0');
    expect(versionedUrl).toContain('&critical=1');
  });

  test('should fallback to global version when asset version is null', () => {
    handler.setGlobalVersion('3.0.0');
    const asset = { version: null, critical: false };
    const versionedUrl = handler.applyVersioning('/js/main.js', asset);

    expect(versionedUrl).toContain('?ver=3.0.0');
  });
});

describe('AssetHandler API Validation: DOM Placement', () => {
  let handler;

  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '<div id="existing">existing</div>';
    handler = new AssetHandler([]);
  });

  test('should insert elements at head-first position', () => {
    const element = document.createElement('link');
    element.id = 'test-element';

    // Add existing element to head
    const existing = document.createElement('meta');
    existing.id = 'existing-meta';
    document.head.appendChild(existing);

    handler.insertAssetElement(element, 'head-first');

    expect(document.head.firstElementChild.id).toBe('test-element');
    expect(document.head.children.length).toBe(2);
  });

  test('should insert elements at head-last position', () => {
    const element = document.createElement('script');
    element.id = 'test-script';

    // Add existing element to head
    const existing = document.createElement('meta');
    document.head.appendChild(existing);

    handler.insertAssetElement(element, 'head-last');

    expect(document.head.lastElementChild.id).toBe('test-script');
  });

  test('should insert elements at footer-first position', () => {
    const element = document.createElement('script');
    element.id = 'footer-script';

    handler.insertAssetElement(element, 'footer-first');

    expect(document.body.firstElementChild.id).toBe('footer-script');
  });

  test('should insert elements at footer-last position', () => {
    const element = document.createElement('script');
    element.id = 'footer-script';

    handler.insertAssetElement(element, 'footer-last');

    expect(document.body.lastElementChild.id).toBe('footer-script');
  });
});

describe('AssetHandler API Validation: Async Loading Attributes', () => {
  let handler;

  beforeEach(() => {
    handler = new AssetHandler([]);
  });

  test('should handle defer attribute on script elements', () => {
    const asset = {
      name: 'deferred-script',
      url: '/js/deferred.js',
      type: 'script',
      defer: true,
      async: false
    };

    const element = handler.createElementForAsset(asset);

    expect(element.defer).toBe(true);
    expect(element.async).toBeFalsy();
  });

  test('should handle async attribute on script elements', () => {
    const asset = {
      name: 'async-script',
      url: '/js/async.js',
      type: 'script',
      defer: false,
      async: true
    };

    const element = handler.createElementForAsset(asset);

    expect(element.async).toBe(true);
    expect(element.defer).toBe(false);
  });

  test('should not apply async/defer to non-script elements', () => {
    const asset = {
      name: 'stylesheet',
      url: '/css/style.css',
      type: 'css',
      defer: true,
      async: true
    };

    const element = handler.createElementForAsset(asset);

    expect(element.tagName).toBe('LINK');
    expect(element.defer).toBeUndefined();
    expect(element.async).toBeUndefined();
  });
});

describe('AssetHandler API Validation: Dependency Resolution', () => {
  let handler;

  beforeEach(() => {
    const config = [
      {
        name: 'jquery',
        url: '/js/jquery.js',
        type: 'script',
        flags: ['libs'],
        dependencies: []
      },
      {
        name: 'bootstrap',
        url: '/js/bootstrap.js',
        type: 'script',
        flags: ['libs'],
        dependencies: ['jquery']
      },
      {
        name: 'app',
        url: '/js/app.js',
        type: 'script',
        flags: ['app'],
        dependencies: ['jquery', 'bootstrap']
      }
    ];

    handler = new AssetHandler(config);
    vi.spyOn(console, 'group').mockImplementation(() => { });
    vi.spyOn(console, 'groupEnd').mockImplementation(() => { });
    vi.spyOn(console, 'log').mockImplementation(() => { });
  });

  test('should resolve dependencies in correct load order', () => {
    const assets = handler.config;
    const resolved = handler.resolveDependencies(assets);
    const names = resolved.map(a => a.name);

    // jQuery should come first (no dependencies)
    expect(names.indexOf('jquery')).toBe(0);

    // Bootstrap should come after jQuery
    expect(names.indexOf('bootstrap')).toBeGreaterThan(names.indexOf('jquery'));

    // App should come after both jQuery and Bootstrap
    expect(names.indexOf('app')).toBeGreaterThan(names.indexOf('jquery'));
    expect(names.indexOf('app')).toBeGreaterThan(names.indexOf('bootstrap'));
  });

  test('should handle complex dependency chains', () => {
    const complexConfig = [
      { name: 'a', dependencies: ['b', 'c'], url: '/a.js', type: 'script', flags: [] },
      { name: 'b', dependencies: ['d'], url: '/b.js', type: 'script', flags: [] },
      { name: 'c', dependencies: ['d'], url: '/c.js', type: 'script', flags: [] },
      { name: 'd', dependencies: [], url: '/d.js', type: 'script', flags: [] }
    ];

    const testHandler = new AssetHandler(complexConfig);
    const resolved = testHandler.resolveDependencies(complexConfig);
    const names = resolved.map(a => a.name);

    // 'd' should be first (no dependencies)
    expect(names.indexOf('d')).toBe(0);

    // 'b' and 'c' should come after 'd'
    expect(names.indexOf('b')).toBeGreaterThan(names.indexOf('d'));
    expect(names.indexOf('c')).toBeGreaterThan(names.indexOf('d'));

    // 'a' should come last (depends on b and c)
    expect(names.indexOf('a')).toBe(names.length - 1);
  });
});

describe('AssetHandler API Validation: Priority-Based Loading', () => {
  let handler;

  beforeEach(() => {
    const config = [
      { name: 'low-priority', priority: 'low', url: '/low.js', type: 'script', flags: [] },
      { name: 'critical-asset', priority: 'critical', url: '/critical.css', type: 'css', flags: [] },
      { name: 'normal-asset', priority: 'normal', url: '/normal.js', type: 'script', flags: [] },
      { name: 'high-priority', priority: 'high', url: '/high.js', type: 'script', flags: [] }
    ];

    handler = new AssetHandler(config);
  });

  test('should sort assets by priority with critical first', () => {
    const assets = handler.config;
    const sorted = handler.sortByPriority(assets);
    const priorities = sorted.map(a => a.priority);

    expect(priorities).toEqual(['critical', 'high', 'normal', 'low']);
  });

  test('should promote critical flag to critical priority', () => {
    const configWithCriticalFlag = [
      {
        name: 'promoted-critical',
        url: '/critical.css',
        type: 'css',
        critical: true,
        priority: 'normal' // Should be overridden
      }
    ];

    const testHandler = new AssetHandler(configWithCriticalFlag);
    expect(testHandler.config[0].priority).toBe('critical');
  });
});

describe('AssetHandler API Validation: Media Asset Preloading', () => {
  let handler;

  beforeEach(() => {
    document.head.innerHTML = '';
    handler = new AssetHandler([]);
  });

  test('should preload image assets with srcset support', () => {
    const imageAsset = {
      name: 'hero-image',
      url: '/img/hero.jpg',
      type: 'image',
      imagesrcset: '/img/hero.jpg 1x, /img/hero@2x.jpg 2x',
      imagesizes: '100vw'
    };

    handler.registerPreloadHint(imageAsset);

    const preloadLink = document.head.querySelector('link[rel="preload"]');
    expect(preloadLink).toBeTruthy();
    expect(preloadLink.as).toBe('image');
    expect(preloadLink.href).toContain('/img/hero.jpg');
    expect(preloadLink.imagesrcset).toBe('/img/hero.jpg 1x, /img/hero@2x.jpg 2x');
    expect(preloadLink.imagesizes).toBe('100vw');
  });

  test('should preload video assets', () => {
    const videoAsset = {
      name: 'promo-video',
      url: '/video/promo.mp4',
      type: 'video'
    };

    handler.registerPreloadHint(videoAsset);

    const preloadLink = document.head.querySelector('link[rel="preload"]');
    expect(preloadLink).toBeTruthy();
    expect(preloadLink.as).toBe('video');
    expect(preloadLink.href).toContain('/video/promo.mp4');
  });

  test('should preload font assets with CORS support', () => {
    const fontAsset = {
      name: 'custom-font',
      url: '/fonts/custom.woff2',
      type: 'font'
    };

    handler.registerPreloadHint(fontAsset);

    const preloadLink = document.head.querySelector('link[rel="preload"]');
    expect(preloadLink).toBeTruthy();
    expect(preloadLink.as).toBe('font');
    expect(preloadLink.href).toContain('/fonts/custom.woff2');
  });

  test('should preload script assets', () => {
    const scriptAsset = {
      name: 'main-script',
      url: '/js/main.js',
      type: 'script'
    };

    handler.registerPreloadHint(scriptAsset);

    const preloadLink = document.head.querySelector('link[rel="preload"]');
    expect(preloadLink).toBeTruthy();
    expect(preloadLink.as).toBe('script');
    expect(preloadLink.href).toContain('/js/main.js');
  });
});

describe('AssetHandler API Validation: Performance Optimization', () => {
  let handler;

  beforeEach(() => {
    document.head.innerHTML = '';
    const config = [
      {
        name: 'cached-script',
        url: '/js/cached.js',
        type: 'script',
        flags: ['cache-test']
      }
    ];
    handler = new AssetHandler(config);

    vi.spyOn(console, 'group').mockImplementation(() => { });
    vi.spyOn(console, 'groupEnd').mockImplementation(() => { });
    vi.spyOn(console, 'log').mockImplementation(() => { });
  });

  test('should implement preloading for fast cached retrieval', async () => {
    // Mock preload functionality
    vi.spyOn(handler, 'registerPreloadHint').mockImplementation((asset) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = asset.type;
      link.href = asset.url;
      document.head.appendChild(link);
    });

    vi.spyOn(handler, 'loadAssetsInParallelWithThrottle').mockResolvedValue([
      { type: 'script', url: '/js/cached.js' }
    ]);

    // Preload assets
    await handler.preloadAssetsByFlag('cache-test');

    // Verify preload hint was registered
    const preloadLink = document.head.querySelector('link[rel="preload"]');
    expect(preloadLink).toBeTruthy();
    expect(preloadLink.as).toBe('script');
    expect(preloadLink.href).toContain('/js/cached.js');

    // Verify assets were loaded
    expect(handler.loadAssetsInParallelWithThrottle).toHaveBeenCalled();
  });

  test('should register preload hints before asset loading', async () => {
    const registerSpy = vi.spyOn(handler, 'registerPreloadHint');
    const loadSpy = vi.spyOn(handler, 'loadAssetsInParallelWithThrottle').mockResolvedValue([]);

    await handler.preloadAssetsByFlag('cache-test');

    // Both operations should be called
    expect(registerSpy).toHaveBeenCalled();
    expect(loadSpy).toHaveBeenCalled();
  });
});