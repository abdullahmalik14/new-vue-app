/**
 * Shared utilities for sectionCssLoader Vitest suites.
 */

import { vi } from 'vitest';

export const CSS_LOADER_PATH = '../../src/systems/sections/sectionCssLoader.js';

export const DEFAULT_CSS_BUNDLE = {
  js: '/assets/section-auth-abc123.js',
  css: '/assets/section-auth-abc123.css',
  integrity: {
    js: 'sha384-test-js-integrity',
    css: 'sha384-test-css-integrity',
  },
};

/**
 * Auto-fire link onload for stylesheet/preload injection tests.
 * @returns {import('vitest').MockInstance} createElement spy (call mockRestore to disable)
 */
export function autoResolveCssLinkLoads() {
  const originalCreateElement = document.createElement.bind(document);
  return vi.spyOn(document, 'createElement').mockImplementation((tag, options) => {
    const element = originalCreateElement(tag, options);
    if (tag === 'link') {
      queueMicrotask(() => {
        if (typeof element.onload === 'function') {
          element.onload();
        }
      });
    }
    return element;
  });
}

/**
 * Disable auto onload so tests can drive link onerror/onload manually.
 * @param {import('vitest').MockInstance | undefined} createElementSpy
 */
export function disableAutoCssLinkResolve(createElementSpy) {
  createElementSpy?.mockRestore();
}

/**
 * @param {{ getSectionBundlePaths: Function }} mocks
 * @param {object} [bundle]
 */
export function configureDefaultCssMocks(mocks, bundle = DEFAULT_CSS_BUNDLE) {
  mocks.getSectionBundlePaths.mockResolvedValue(bundle);
}

export function setupCssLoaderTestEnvironment(mocks) {
  vi.resetModules();
  vi.stubGlobal('fetch', vi.fn());
  window.performanceTracker = { step: vi.fn() };
  vi.stubEnv('PROD', '1');
  vi.stubEnv('DEV', '');
  document.head.innerHTML = '';
  configureDefaultCssMocks(mocks);
  return autoResolveCssLinkLoads();
}

export function teardownCssLoaderTestEnvironment() {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
}
