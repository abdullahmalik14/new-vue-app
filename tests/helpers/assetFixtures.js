/**
 * Shared asset test fixtures — mock maps, route preload entries, environment stubs.
 *
 * @see developer_tasks/Assets/asset-test-plan.md
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { getProjectRoot, loadSharedAssetPreloads, makeRoute } from './routeFixtures.js';

export { getProjectRoot, loadSharedAssetPreloads, makeRoute } from './routeFixtures.js';

/** @see developer_tasks/Assets/asset-test-plan.md */
export function stubProductionEnv() {
  vi.stubEnv('PROD', 'true');
  vi.stubEnv('DEV', '');
  vi.stubEnv('MODE', 'production');
}

/** @see developer_tasks/Assets/asset-test-plan.md */
export function stubDevelopmentEnv() {
  vi.stubEnv('PROD', '');
  vi.stubEnv('DEV', 'true');
  vi.stubEnv('MODE', 'development');
}

/**
 * @returns {Promise<typeof import('../../src/systems/assets/assetLibrary.js')>}
 */
export async function importFreshAssetLibrary() {
  return import('../../src/systems/assets/assetLibrary.js');
}

/**
 * Load bundled map in production mode with caches cleared.
 * @returns {Promise<typeof import('../../src/systems/assets/assetLibrary.js')>}
 */
export async function loadProductionAssetLibrary() {
  stubProductionEnv();
  const lib = await importFreshAssetLibrary();
  lib.clearAssetMapConfigCache();
  lib.clearAssetCaches();
  await lib.loadAssetMapConfig();
  return lib;
}

/** Minimal asset map for unit tests (sparse staging/dev overrides). */
export const MOCK_ASSET_MAP = {
  production: {
    'icon.cart': 'https://cdn.example.com/cart.svg',
    'icon.user': 'https://cdn.example.com/user.svg',
    'auth.background': 'https://cdn.example.com/auth-bg.webp',
    'script.cognito': '/vendor/amazon-cognito-identity-6.3.15.min.js',
    'font.primary': 'https://cdn.example.com/fonts/primary.woff2',
  },
  staging: {
    'icon.cart': '/assets/icons/cart-staging.svg',
  },
  development: {
    'icon.cart': '/assets/icons/cart-dev.svg',
  },
};

/** Section-scoped override map (auth). */
export const MOCK_SECTION_ASSET_MAP = {
  production: {},
  staging: {},
  development: {
    'auth.background': '/assets/images/auth-section-override-dev.webp',
  },
};

/** Minimal shared preload catalog. */
export const MOCK_SHARED_PRELOADS = {
  testCatalog: [
    { flag: 'icon.cart', type: 'image', priority: 'high' },
    { flag: 'font.primary', type: 'font', priority: 'normal' },
  ],
  testChrome: {
    logo: 'icon.cart',
  },
};

const ENV_KEYS = new Set(['production', 'staging', 'development']);

/**
 * @param {string} relativePath
 * @returns {object}
 */
export function readProductionJson(relativePath) {
  const absolutePath = join(getProjectRoot(), relativePath);
  return JSON.parse(readFileSync(absolutePath, 'utf8'));
}

/** @returns {object} */
export function readProductionAssetMap() {
  return readProductionJson('src/config/assetMap.json');
}

/** @returns {object} */
export function readProductionSharedPreloads() {
  return readProductionJson('src/config/sharedAssetPreloads.json');
}

/** @returns {object} */
export function readProductionAuthAssetMap() {
  return readProductionJson('src/config/assetMap.auth.json');
}

/**
 * @param {object} [overrides]
 * @returns {{ flag: string, type?: string, priority?: string }}
 */
export function makeAssetPreloadEntry(overrides = {}) {
  return {
    flag: 'icon.cart',
    type: 'image',
    priority: 'normal',
    ...overrides,
  };
}

/**
 * @param {object} [overrides]
 * @returns {object}
 */
export function makeRouteWithAssets(overrides = {}) {
  return makeRoute({
    assetPreload: [makeAssetPreloadEntry()],
    ...overrides,
  });
}

function applyLinkPreloadMock(element, mode = 'load') {
  let loadHandler;
  let errorHandler;

  Object.defineProperty(element, 'onload', {
    configurable: true,
    enumerable: true,
    get() {
      return loadHandler;
    },
    set(fn) {
      loadHandler = fn;
      if (mode === 'load' && typeof fn === 'function') {
        queueMicrotask(() => fn(new Event('load')));
      }
    },
  });

  Object.defineProperty(element, 'onerror', {
    configurable: true,
    enumerable: true,
    get() {
      return errorHandler;
    },
    set(fn) {
      errorHandler = fn;
      if (mode === 'error' && typeof fn === 'function') {
        queueMicrotask(() => fn(new Event('error')));
      }
    },
  });
}

function applyScriptLoadMock(element) {
  let loadHandler;

  Object.defineProperty(element, 'onload', {
    configurable: true,
    enumerable: true,
    get() {
      return loadHandler;
    },
    set(fn) {
      loadHandler = fn;
      if (typeof fn === 'function') {
        queueMicrotask(() => fn(new Event('load')));
      }
    },
  });
}

/**
 * Mock link preloads by firing load/error when handlers are assigned.
 * @param {'load' | 'error'} mode
 */
export function mockLinkPreloads(mode = 'load') {
  const originalCreateElement = document.createElement.bind(document);
  return vi.spyOn(document, 'createElement').mockImplementation((tag, options) => {
    const element = originalCreateElement(tag, options);

    if (tag === 'link') {
      applyLinkPreloadMock(element, mode);
    }

    return element;
  });
}

/** @returns {import('vitest').MockInstance} */
export function autoResolveLinkPreloads() {
  return mockLinkPreloads('load');
}

/** @returns {import('vitest').MockInstance} */
export function autoRejectLinkPreloads() {
  return mockLinkPreloads('error');
}

/** Mock executable script and link preloads. */
export function autoResolveScriptLoads() {
  const originalCreateElement = document.createElement.bind(document);
  return vi.spyOn(document, 'createElement').mockImplementation((tag, options) => {
    const element = originalCreateElement(tag, options);

    if (tag === 'script') {
      applyScriptLoadMock(element);
    }

    if (tag === 'link') {
      applyLinkPreloadMock(element, 'load');
    }

    return element;
  });
}

/**
 * Standard Vitest setup for asset module tests.
 */
export function setupAssetTestEnv() {
  vi.restoreAllMocks();
  vi.resetModules();
  vi.unstubAllEnvs();
  setActivePinia(createPinia());
  document.head.innerHTML = '';
  window.performanceTracker = { step: vi.fn() };
}

/**
 * @param {'development'|'staging'|'production'} mode
 */
export function stubAssetEnvironment(mode) {
  vi.stubEnv('MODE', mode);

  if (mode === 'production') {
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('DEV', '');
    return;
  }

  vi.stubEnv('PROD', '');
  vi.stubEnv('DEV', 'true');
}

/**
 * Reset asset library, caches, and preload store between tests.
 */
export async function resetAssetSystemState() {
  const { resetAssetLibrary } = await import('../../src/systems/assets/resetAssetLibrary.js');
  resetAssetLibrary();
}

/**
 * Collect all flag keys from every environment block in an asset map.
 * @param {Record<string, Record<string, string>>} assetMap
 * @returns {Set<string>}
 */
export function collectAllAssetMapFlags(assetMap) {
  const flags = new Set();

  for (const [envKey, entries] of Object.entries(assetMap || {})) {
    if (!ENV_KEYS.has(envKey) || !entries || typeof entries !== 'object') {
      continue;
    }

    for (const flag of Object.keys(entries)) {
      flags.add(flag);
    }
  }

  return flags;
}

/**
 * Load every src/config/assetMap.<section>.json section map.
 * @returns {Record<string, object>}
 */
export function loadSectionAssetMaps() {
  const configDir = join(getProjectRoot(), 'src/config');
  const maps = {};

  for (const fileName of readdirSync(configDir)) {
    const match = fileName.match(/^assetMap\.([^.]+)\.json$/);

    if (match) {
      maps[match[1]] = JSON.parse(readFileSync(join(configDir, fileName), 'utf8'));
    }
  }

  return maps;
}

/**
 * Returns true when value looks like a raw URL, not an asset flag.
 * @param {unknown} value
 * @returns {boolean}
 */
export function looksLikeRawUrl(value) {
  return (
    typeof value === 'string'
    && (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/'))
  );
}
