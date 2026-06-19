/**
 * Shared utilities for sectionPreloader Vitest suites.
 */

import { vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

export const PRELOADER_PATH = '../../src/systems/sections/sectionPreloader.js';

export const DEFAULT_BUNDLE_PATHS = {
  js: '/assets/section-auth-abc123.js',
  css: '/assets/section-auth-abc123.css',
  integrity: {
    js: 'sha384-test-js-integrity',
    css: 'sha384-test-css-integrity',
  },
};

/**
 * Auto-fire link onload for successful JS modulepreload tests.
 * @returns {import('vitest').MockInstance}
 */
export function autoResolveLinkPreloads() {
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
 * @param {{ getSectionBundlePaths: Function, preloadSectionCss: Function, preloadSectionAssets: Function }} mocks
 */
export function configureDefaultPreloaderMocks(mocks) {
  mocks.getSectionBundlePaths.mockResolvedValue(DEFAULT_BUNDLE_PATHS);
  mocks.preloadSectionCss.mockResolvedValue(undefined);
  mocks.preloadSectionAssets.mockResolvedValue(undefined);
}

/**
 * Standard beforeEach for sectionPreloader tests.
 * @param {{ getSectionBundlePaths: Function, preloadSectionCss: Function, preloadSectionAssets: Function }} mocks
 */
export function setupPreloaderTestEnvironment(mocks) {
  vi.resetModules();
  vi.clearAllMocks();

  setActivePinia(createPinia());
  document.head.innerHTML = '';
  window.performanceTracker = { step: vi.fn() };

  configureDefaultPreloaderMocks(mocks);
  autoResolveLinkPreloads();
}

export async function importPreloaderModule() {
  return import(PRELOADER_PATH);
}
