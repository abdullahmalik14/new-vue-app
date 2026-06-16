import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const LOADER_PATH = '../../src/systems/sections/sectionPreloader.js';

const getSectionBundlePaths = vi.fn();
const preloadSectionCss = vi.fn();
const preloadSectionAssets = vi.fn();

vi.mock('../../src/utils/build/manifestLoader.js', () => ({
  getSectionBundlePaths
}));

vi.mock('../../src/systems/sections/sectionCssLoader.js', () => ({
  preloadSectionCss,
  clearAllSectionCss: vi.fn(),
  clearSectionCssPreloadHint: vi.fn()
}));

vi.mock('../../src/utils/assets/assetPreloader.js', () => ({
  preloadSectionAssets
}));

function autoResolveLinkPreloads() {
  const originalCreateElement = document.createElement.bind(document);
  return vi.spyOn(document, 'createElement').mockImplementation((tag, options) => {
    const el = originalCreateElement(tag, options);
    if (tag === 'link') {
      queueMicrotask(() => {
        if (typeof el.onload === 'function') {
          el.onload();
        }
      });
    }
    return el;
  });
}

async function importPreloader() {
  return import(LOADER_PATH);
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();

  setActivePinia(createPinia());
  document.head.innerHTML = '';

  window.performanceTracker = { step: vi.fn() };

  getSectionBundlePaths.mockResolvedValue({
    js: '/assets/section-auth-abc123.js',
    css: '/assets/section-auth-abc123.css',
    integrity: {
      js: 'sha384-test-js-integrity',
      css: 'sha384-test-css-integrity'
    }
  });

  preloadSectionCss.mockResolvedValue(undefined);
  preloadSectionAssets.mockResolvedValue(undefined);

  autoResolveLinkPreloads();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('sectionPreloader (Task 5 lifecycle)', () => {
  it('returns an immediately resolved true when section is already in store', async () => {
    const { preloadSection } = await importPreloader();
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    usePreloadStore().addSection('auth');

    const result = await preloadSection('auth');

    expect(result).toBe(true);
    expect(getSectionBundlePaths).not.toHaveBeenCalled();
    expect(preloadSectionCss).not.toHaveBeenCalled();
  });

  it('shares the same promise for concurrent callers (5b)', async () => {
    let cssResolve;
    preloadSectionCss.mockImplementation(
      () => new Promise((resolve) => { cssResolve = resolve; })
    );

    const { preloadSection } = await importPreloader();

    const p1 = preloadSection('auth');
    const p2 = preloadSection('auth');

    expect(p1).toBe(p2);

    const { getPreloadStatistics } = await importPreloader();
    const stats = getPreloadStatistics();
    expect(stats.inProgressCount).toBe(1);
    expect(stats.inProgressSections).toEqual(['auth']);

    cssResolve();
    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1).toBe(true);
    expect(r2).toBe(true);
    expect(getSectionBundlePaths).toHaveBeenCalledTimes(1);
  });

  it('marks section preloaded only after JS and CSS both complete (5a)', async () => {
    const events = [];

    preloadSectionCss.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      events.push('css-done');
    });

    const { preloadSection } = await importPreloader();
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    const promise = preloadSection('auth');

    expect(usePreloadStore().hasSection('auth')).toBe(false);

    await promise;

    expect(events).toContain('css-done');
    expect(document.querySelector('link[rel="modulepreload"]')).not.toBeNull();
    expect(preloadSectionCss).toHaveBeenCalledWith('auth');
    expect(usePreloadStore().hasSection('auth')).toBe(true);
  });

  it('delegates CSS preload to sectionCssLoader, not an internal helper (5c)', async () => {
    const { preloadSection } = await importPreloader();

    await preloadSection('auth');

    expect(preloadSectionCss).toHaveBeenCalledWith('auth');
    expect(preloadSectionCss).toHaveBeenCalledTimes(1);
  });

  it('returns false when manifest has no bundle paths', async () => {
    getSectionBundlePaths.mockResolvedValue(null);

    const { preloadSection } = await importPreloader();
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    const result = await preloadSection('missing-section');

    expect(result).toBe(false);
    expect(usePreloadStore().hasSection('missing-section')).toBe(false);
  });

  it('clears in-progress tracking after preload completes', async () => {
    const { preloadSection, getPreloadStatistics } = await importPreloader();

    await preloadSection('auth');

    const stats = getPreloadStatistics();
    expect(stats.inProgressCount).toBe(0);
    expect(stats.inProgressSections).toEqual([]);
  });

  it('clearPreloadState resets store, in-progress map, and section preload DOM hints', async () => {
    let resolveCss;
    preloadSectionCss.mockImplementation(
      () => new Promise((resolve) => { resolveCss = resolve; })
    );

    const { preloadSection, clearPreloadState, getPreloadStatistics } = await importPreloader();
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    const inFlight = preloadSection('auth');

    await vi.waitUntil(() => preloadSectionCss.mock.calls.length > 0);
    expect(getPreloadStatistics().inProgressCount).toBe(1);
    expect(usePreloadStore().sectionsInProgress.has('auth')).toBe(true);

    clearPreloadState();

    expect(usePreloadStore().preloadedSections.size).toBe(0);
    expect(getPreloadStatistics().inProgressCount).toBe(0);
    expect(usePreloadStore().sectionsInProgress.size).toBe(0);
    expect(document.querySelector('link[data-section-js-preload]')).toBeNull();

    resolveCss();
    await inFlight;
  });

  it('clearPreloadState removes section JS modulepreload links after preload completes', async () => {
    const { preloadSection, clearPreloadState } = await importPreloader();
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    await preloadSection('auth');

    expect(document.querySelector('link[data-section-js-preload="auth"]').integrity)
      .toBe('sha384-test-js-integrity');
    expect(usePreloadStore().hasSection('auth')).toBe(true);

    clearPreloadState();

    expect(document.querySelector('link[data-section-js-preload]')).toBeNull();
    expect(usePreloadStore().hasSection('auth')).toBe(false);
  });

  it('resetSectionPreloadState clears one section so it can be preloaded again (M-07)', async () => {
    const { preloadSection, resetSectionPreloadState } = await importPreloader();
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    await preloadSection('auth');
    expect(usePreloadStore().hasSection('auth')).toBe(true);
    expect(document.querySelector('link[data-section-js-preload="auth"]')).not.toBeNull();

    resetSectionPreloadState('auth');

    expect(usePreloadStore().hasSection('auth')).toBe(false);
    expect(document.querySelector('link[data-section-js-preload="auth"]')).toBeNull();

    await preloadSection('auth');

    expect(usePreloadStore().hasSection('auth')).toBe(true);
    expect(preloadSectionCss).toHaveBeenCalledTimes(2);
  });

  it('rejects untrusted JS bundle paths and does not inject modulepreload links (S-03)', async () => {
    getSectionBundlePaths.mockResolvedValue({
      js: 'https://evil.example.com/malicious.js',
      css: null,
      integrity: { js: 'sha384-test-js-integrity' }
    });

    const { preloadSection } = await importPreloader();
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    const result = await preloadSection('auth');

    expect(result).toBe(false);
    expect(document.querySelector('link[rel="modulepreload"]')).toBeNull();
    expect(usePreloadStore().hasSection('auth')).toBe(false);
  });

  it('clearPreloadState clears reactive sectionsInProgress in store (M-06)', async () => {
    let resolveCss;
    preloadSectionCss.mockImplementation(
      () => new Promise((resolve) => { resolveCss = resolve; })
    );

    const { preloadSection, clearPreloadState } = await importPreloader();
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    const inFlight = preloadSection('auth');

    await vi.waitUntil(() => usePreloadStore().sectionsInProgress.has('auth'));

    clearPreloadState();

    expect(usePreloadStore().sectionsInProgress.size).toBe(0);

    resolveCss();
    await inFlight;
  });

  it('rejects hung JS preload after timeout and clears in-progress tracking (M-05)', async () => {
    vi.useFakeTimers();
    vi.stubEnv('VITE_SECTION_PRELOAD_TIMEOUT_MS', '500');

    document.createElement.mockRestore();
    vi.spyOn(document.head, 'appendChild').mockImplementation((node) => node);

    const { preloadSection, getPreloadStatistics } = await importPreloader();
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    const promise = preloadSection('auth');
    expect(getPreloadStatistics().inProgressCount).toBe(1);
    expect(usePreloadStore().sectionsInProgress.has('auth')).toBe(true);

    await vi.advanceTimersByTimeAsync(500);

    const result = await promise;

    expect(result).toBe(false);
    expect(usePreloadStore().hasSection('auth')).toBe(false);
    expect(getPreloadStatistics().inProgressCount).toBe(0);
    expect(usePreloadStore().sectionsInProgress.size).toBe(0);

    vi.useRealTimers();
    vi.unstubAllEnvs();
  });
});
