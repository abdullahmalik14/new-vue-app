/**
 * sectionPreloader.js — JS preload timeout matrix (section test plan §9, §61, §87).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import {
  PRELOADER_PATH,
  configureDefaultPreloaderMocks,
  DEFAULT_BUNDLE_PATHS,
} from '../helpers/sectionPreloaderTestSetup.js';

const { getSectionBundlePaths, preloadSectionCss, preloadSectionAssets } = vi.hoisted(() => ({
  getSectionBundlePaths: vi.fn(),
  preloadSectionCss: vi.fn(),
  preloadSectionAssets: vi.fn(),
}));

vi.mock('../../src/systems/sections/sectionManifestHelpers.js', () => ({
  getSectionBundlePaths,
}));

vi.mock('../../src/systems/sections/sectionCssLoader.js', () => ({
  preloadSectionCss,
  clearAllSectionCss: vi.fn(),
  clearSectionCssPreloadHint: vi.fn(),
}));

vi.mock('../../src/systems/assets/assetPreloader.js', () => ({
  preloadSectionAssets,
}));

function stubHungJsPreload() {
  vi.spyOn(document.head, 'appendChild').mockImplementation((node) => node);
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  setActivePinia(createPinia());
  document.head.innerHTML = '';
  window.performanceTracker = { step: vi.fn() };
  configureDefaultPreloaderMocks({ getSectionBundlePaths, preloadSectionCss, preloadSectionAssets });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('preloadSection — timeout env matrix (Phase C §61)', () => {
  async function loadPreloader() {
    return import(PRELOADER_PATH);
  }

  it('VITE_SECTION_PRELOAD_TIMEOUT_MS=500 fails hung JS preload and clears in-progress tracking', async () => {
    vi.useFakeTimers();
    vi.stubEnv('VITE_SECTION_PRELOAD_TIMEOUT_MS', '500');
    stubHungJsPreload();

    const { preloadSection, getPreloadStatistics } = await loadPreloader();
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    const promise = preloadSection('auth');
    expect(getPreloadStatistics().inProgressCount).toBe(1);

    await vi.advanceTimersByTimeAsync(500);

    await expect(promise).resolves.toBe(false);
    expect(usePreloadStore().hasSection('auth')).toBe(false);
    expect(getPreloadStatistics().inProgressCount).toBe(0);
  });

  it('VITE_SECTION_PRELOAD_TIMEOUT_MS=0 falls back to default timeout behaviour', async () => {
    vi.useFakeTimers();
    vi.stubEnv('VITE_SECTION_PRELOAD_TIMEOUT_MS', '0');
    stubHungJsPreload();

    const { preloadSection } = await loadPreloader();
    const promise = preloadSection('auth');

    await vi.advanceTimersByTimeAsync(9_999);
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    await vi.advanceTimersByTimeAsync(1);
    await expect(promise).resolves.toBe(false);
  });

  it('VITE_SECTION_PRELOAD_TIMEOUT_MS=-1 falls back to default timeout behaviour', async () => {
    vi.useFakeTimers();
    vi.stubEnv('VITE_SECTION_PRELOAD_TIMEOUT_MS', '-1');
    stubHungJsPreload();

    const { preloadSection } = await loadPreloader();
    const promise = preloadSection('auth');

    await vi.advanceTimersByTimeAsync(10_000);
    await expect(promise).resolves.toBe(false);
  });

  it('VITE_SECTION_PRELOAD_TIMEOUT_MS=abc falls back to default timeout behaviour', async () => {
    vi.useFakeTimers();
    vi.stubEnv('VITE_SECTION_PRELOAD_TIMEOUT_MS', 'abc');
    stubHungJsPreload();

    const { preloadSection } = await loadPreloader();
    const promise = preloadSection('auth');

    await vi.advanceTimersByTimeAsync(10_000);
    await expect(promise).resolves.toBe(false);
  });

  it('timeout removes partial JS link from DOM and does not call addSection', async () => {
    vi.useFakeTimers();
    vi.stubEnv('VITE_SECTION_PRELOAD_TIMEOUT_MS', '100');
    stubHungJsPreload();

    const { preloadSection } = await loadPreloader();
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    const promise = preloadSection('auth');
    await vi.advanceTimersByTimeAsync(100);
    await promise;

    expect(document.querySelector('link[data-section-js-preload="auth"]')).toBeNull();
    expect(usePreloadStore().hasSection('auth')).toBe(false);
  });
});

describe('preloadJavaScriptBundle — link lifecycle (Phase C §87)', () => {
  async function loadPreloader() {
    return import(PRELOADER_PATH);
  }

  it('successful load keeps modulepreload link in DOM', async () => {
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag, options) => {
      const element = originalCreateElement(tag, options);
      if (tag === 'link') {
        queueMicrotask(() => element.onload?.());
      }
      return element;
    });

    const { preloadSection } = await loadPreloader();
    await preloadSection('auth');

    const link = document.querySelector('link[data-section-js-preload="auth"]');
    expect(link).not.toBeNull();
    expect(link?.rel).toBe('modulepreload');
    expect(link?.href).toContain(DEFAULT_BUNDLE_PATHS.js);
  });

  it('onerror removes link from DOM before rejecting preload', async () => {
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag, options) => {
      const element = originalCreateElement(tag, options);
      if (tag === 'link') {
        queueMicrotask(() => element.onerror?.(new Event('error')));
      }
      return element;
    });

    const { preloadSection } = await loadPreloader();
    await expect(preloadSection('auth')).resolves.toBe(false);
    expect(document.querySelector('link[data-section-js-preload="auth"]')).toBeNull();
  });

  it('success before timeout clears timer (no false timeout after onload)', async () => {
    vi.useFakeTimers();
    vi.stubEnv('VITE_SECTION_PRELOAD_TIMEOUT_MS', '1000');

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag, options) => {
      const element = originalCreateElement(tag, options);
      if (tag === 'link') {
        queueMicrotask(() => element.onload?.());
      }
      return element;
    });

    const { preloadSection } = await loadPreloader();
    await expect(preloadSection('auth')).resolves.toBe(true);

    await vi.advanceTimersByTimeAsync(1000);
    expect(document.querySelector('link[data-section-js-preload="auth"]')).not.toBeNull();
  });
});
