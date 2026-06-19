/**
 * sectionPreloader.js — concurrent preload dedup (section test plan §8, §86).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import {
  PRELOADER_PATH,
  configureDefaultPreloaderMocks,
  autoResolveLinkPreloads,
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

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  setActivePinia(createPinia());
  document.head.innerHTML = '';
  window.performanceTracker = { step: vi.fn() };
  configureDefaultPreloaderMocks({ getSectionBundlePaths, preloadSectionCss, preloadSectionAssets });
  autoResolveLinkPreloads();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('preloadSection — concurrent callers (Phase C §8, §86)', () => {
  async function loadPreloader() {
    return import(PRELOADER_PATH);
  }

  it('returns shared in-flight promise when second caller preloads same section concurrently', async () => {
    let resolveCss;
    preloadSectionCss.mockImplementation(() => new Promise((resolve) => { resolveCss = resolve; }));

    const { preloadSection } = await loadPreloader();

    const first = preloadSection('auth');
    const second = preloadSection('auth');

    expect(first).toBe(second);

    await vi.waitUntil(() => typeof resolveCss === 'function');
    resolveCss();
    const [resultA, resultB] = await Promise.all([first, second]);

    expect(resultA).toBe(true);
    expect(resultB).toBe(true);
    expect(getSectionBundlePaths).toHaveBeenCalledTimes(1);
  });

  it('marks sectionsInProgress in store when starting new preload', async () => {
    let resolveCss;
    preloadSectionCss.mockImplementation(() => new Promise((resolve) => { resolveCss = resolve; }));

    const { preloadSection } = await loadPreloader();
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    const promise = preloadSection('auth');
    await vi.waitUntil(() => usePreloadStore().sectionsInProgress.has('auth'));

    expect(usePreloadStore().sectionsInProgress.has('auth')).toBe(true);

    resolveCss();
    await promise;
  });

  it('unmarks in-progress in finally after completion', async () => {
    const { preloadSection, getPreloadStatistics } = await loadPreloader();

    await preloadSection('auth');

    expect(getPreloadStatistics().inProgressCount).toBe(0);
    expect(getPreloadStatistics().inProgressSections).toEqual([]);
  });

  it('calls addSection only once when two callers share the same in-flight preload', async () => {
    let resolveCss;
    preloadSectionCss.mockImplementation(() => new Promise((resolve) => { resolveCss = resolve; }));

    const { preloadSection } = await loadPreloader();
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');
    const addSectionSpy = vi.spyOn(usePreloadStore(), 'addSection');

    const shared = Promise.all([preloadSection('auth'), preloadSection('auth')]);
    await vi.waitUntil(() => typeof resolveCss === 'function');
    resolveCss();
    await shared;

    expect(addSectionSpy).toHaveBeenCalledTimes(1);
  });

  it('preloads three distinct sections in parallel', async () => {
    getSectionBundlePaths.mockImplementation(async (sectionName) => ({
      js: `/assets/section-${sectionName}.js`,
      css: `/assets/section-${sectionName}.css`,
      integrity: {},
    }));

    const { preloadMultipleSections } = await loadPreloader();
    const result = await preloadMultipleSections(['auth', 'shop', 'misc']);

    expect(result.successful).toEqual(['auth', 'shop', 'misc']);
    expect(result.failed).toEqual([]);
    expect(getSectionBundlePaths).toHaveBeenCalledTimes(3);
  });

  it('second preload after completion is a cache hit without extra manifest fetch', async () => {
    const { preloadSection } = await loadPreloader();

    await preloadSection('auth');
    getSectionBundlePaths.mockClear();

    await expect(preloadSection('auth')).resolves.toBe(true);
    expect(getSectionBundlePaths).not.toHaveBeenCalled();
  });
});
