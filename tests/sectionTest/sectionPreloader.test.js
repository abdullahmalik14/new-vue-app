/**
 * sectionPreloader.js — core lifecycle (section test plan §8–14, §62, §86–89).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  PRELOADER_PATH,
  configureDefaultPreloaderMocks,
  autoResolveLinkPreloads,
  DEFAULT_BUNDLE_PATHS,
} from '../helpers/sectionPreloaderTestSetup.js';
import { createPinia, setActivePinia } from 'pinia';

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

describe('preloadSection (Phase C §8)', () => {
  async function loadPreloader() {
    return import(PRELOADER_PATH);
  }

  it('returns true immediately when store hasSection is true (cache hit)', async () => {
    const { preloadSection } = await loadPreloader();
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    usePreloadStore().addSection('auth');
    await expect(preloadSection('auth')).resolves.toBe(true);
    expect(getSectionBundlePaths).not.toHaveBeenCalled();
    expect(preloadSectionCss).not.toHaveBeenCalled();
  });

  it('returns true when JS and CSS preload succeed', async () => {
    const { preloadSection } = await loadPreloader();
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    await expect(preloadSection('auth')).resolves.toBe(true);
    expect(usePreloadStore().hasSection('auth')).toBe(true);
    expect(preloadSectionCss).toHaveBeenCalledWith('auth');
  });

  it('returns true when only JS is present in manifest', async () => {
    getSectionBundlePaths.mockResolvedValue({
      js: '/assets/section-auth-abc123.js',
      css: null,
      integrity: { js: 'sha384-test-js-integrity' },
    });

    const { preloadSection } = await loadPreloader();
    await expect(preloadSection('auth')).resolves.toBe(true);
    expect(preloadSectionCss).not.toHaveBeenCalled();
  });

  it('returns true when only CSS is present in manifest', async () => {
    getSectionBundlePaths.mockResolvedValue({
      js: null,
      css: '/assets/section-auth-abc123.css',
      integrity: { css: 'sha384-test-css-integrity' },
    });

    const { preloadSection } = await loadPreloader();
    await expect(preloadSection('auth')).resolves.toBe(true);
    expect(preloadSectionCss).toHaveBeenCalledWith('auth');
  });

  it('returns false when manifest has no paths for section', async () => {
    getSectionBundlePaths.mockResolvedValue(null);

    const { preloadSection } = await loadPreloader();
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    await expect(preloadSection('missing-section')).resolves.toBe(false);
    expect(usePreloadStore().hasSection('missing-section')).toBe(false);
  });

  it('returns false when manifest load throws', async () => {
    getSectionBundlePaths.mockRejectedValue(new Error('manifest fetch failed'));

    const { preloadSection } = await loadPreloader();
    await expect(preloadSection('auth')).resolves.toBe(false);
  });

  it('returns false when CSS preload rejects', async () => {
    preloadSectionCss.mockRejectedValue(new Error('css preload failed'));

    const { preloadSection } = await loadPreloader();
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    await expect(preloadSection('auth')).resolves.toBe(false);
    expect(usePreloadStore().hasSection('auth')).toBe(false);
  });

  it('returns false for untrusted JS bundle path', async () => {
    getSectionBundlePaths.mockResolvedValue({
      js: 'https://evil.example.com/malicious.js',
      css: null,
      integrity: { js: 'sha384-test-js-integrity' },
    });

    const { preloadSection } = await loadPreloader();
    await expect(preloadSection('auth')).resolves.toBe(false);
    expect(document.querySelector('link[rel="modulepreload"]')).toBeNull();
  });

  it('calls addSection only after JS and CSS branches settle', async () => {
    const events = [];
    preloadSectionCss.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      events.push('css-done');
    });

    const { preloadSection } = await loadPreloader();
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    const promise = preloadSection('auth');
    expect(usePreloadStore().hasSection('auth')).toBe(false);

    await promise;
    expect(events).toContain('css-done');
    expect(usePreloadStore().hasSection('auth')).toBe(true);
  });

  it('calls preloadSectionAssets non-blocking after addSection', async () => {
    const { preloadSection } = await loadPreloader();
    await preloadSection('auth');
    expect(preloadSectionAssets).toHaveBeenCalledWith('auth');
  });

  it('asset preload failure does not fail preloadSection return value', async () => {
    preloadSectionAssets.mockRejectedValue(new Error('asset map missing'));

    const { preloadSection } = await loadPreloader();
    await expect(preloadSection('auth')).resolves.toBe(true);
  });

  it('creates modulepreload link with integrity when manifest provides SRI hash', async () => {
    const { preloadSection } = await loadPreloader();
    await preloadSection('auth');

    const link = document.querySelector('link[data-section-js-preload="auth"]');
    expect(link).not.toBeNull();
    expect(link.rel).toBe('modulepreload');
    expect(link.as).toBe('script');
    expect(link.integrity).toBe('sha384-test-js-integrity');
    expect(link.getAttribute('href')).toBe('/assets/section-auth-abc123.js');
  });

  it('resolves immediately when link with same href already exists in DOM', async () => {
    const existing = document.createElement('link');
    existing.rel = 'preload';
    existing.href = DEFAULT_BUNDLE_PATHS.js;
    document.head.appendChild(existing);

    const { preloadSection } = await loadPreloader();
    await expect(preloadSection('auth')).resolves.toBe(true);
    expect(document.querySelectorAll(`link[href="${DEFAULT_BUNDLE_PATHS.js}"]`).length).toBe(1);
  });

  it('does not call addSection when preload returns false', async () => {
    getSectionBundlePaths.mockResolvedValue(null);

    const { preloadSection } = await loadPreloader();
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    await preloadSection('auth');
    expect(usePreloadStore().hasSection('auth')).toBe(false);
  });
});

describe('preloadMultipleSections (Phase C §10)', () => {
  async function loadPreloader() {
    return import(PRELOADER_PATH);
  }

  it('empty array returns { successful: [], failed: [] }', async () => {
    const { preloadMultipleSections } = await loadPreloader();
    await expect(preloadMultipleSections([])).resolves.toEqual({ successful: [], failed: [] });
  });

  it('partitions successful and failed section names', async () => {
    getSectionBundlePaths.mockImplementation(async (sectionName) =>
      sectionName === 'auth' ? DEFAULT_BUNDLE_PATHS : null,
    );

    const { preloadMultipleSections } = await loadPreloader();
    const result = await preloadMultipleSections(['auth', 'missing-section']);

    expect(result.successful).toEqual(['auth']);
    expect(result.failed).toEqual(['missing-section']);
  });

  it('handles duplicate section names via cache hit on second entry', async () => {
    const { preloadMultipleSections } = await loadPreloader();
    const result = await preloadMultipleSections(['auth', 'auth']);

    expect(result.successful).toEqual(['auth', 'auth']);
    expect(getSectionBundlePaths).toHaveBeenCalledTimes(1);
  });
});

describe('isSectionPreloaded (Phase C §11)', () => {
  it('delegates to usePreloadStore.hasSection', async () => {
    const { isSectionPreloaded } = await import(PRELOADER_PATH);
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    expect(isSectionPreloaded('auth')).toBe(false);
    usePreloadStore().addSection('auth');
    expect(isSectionPreloaded('auth')).toBe(true);
  });
});

describe('resetSectionPreloadState (Phase C §12)', () => {
  it('allows subsequent preloadSection to run fresh preload', async () => {
    const { preloadSection, resetSectionPreloadState } = await import(PRELOADER_PATH);
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    await preloadSection('auth');
    resetSectionPreloadState('auth');

    expect(usePreloadStore().hasSection('auth')).toBe(false);
    await preloadSection('auth');
    expect(preloadSectionCss).toHaveBeenCalledTimes(2);
  });

  it('is safe when section was never preloaded', async () => {
    const { resetSectionPreloadState } = await import(PRELOADER_PATH);
    expect(() => resetSectionPreloadState('never-preloaded')).not.toThrow();
  });
});

describe('clearSectionPreloadState (Phase C §13)', () => {
  it('clears store, DOM links, and in-progress tracking', async () => {
    let resolveCss;
    preloadSectionCss.mockImplementation(() => new Promise((resolve) => { resolveCss = resolve; }));

    const { preloadSection, clearSectionPreloadState, getPreloadStatistics } = await import(PRELOADER_PATH);
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    const inFlight = preloadSection('auth');
    await vi.waitUntil(() => preloadSectionCss.mock.calls.length > 0);

    clearSectionPreloadState();

    expect(usePreloadStore().preloadedSections.size).toBe(0);
    expect(getPreloadStatistics().inProgressCount).toBe(0);
    expect(document.querySelector('link[data-section-js-preload]')).toBeNull();

    resolveCss();
    await inFlight;
  });

  it('is safe when already empty', async () => {
    const { clearSectionPreloadState } = await import(PRELOADER_PATH);
    expect(() => clearSectionPreloadState()).not.toThrow();
  });
});

describe('getPreloadStatistics (Phase C §14)', () => {
  it('returns zeros and empty arrays on fresh store', async () => {
    const { getPreloadStatistics } = await import(PRELOADER_PATH);

    expect(getPreloadStatistics()).toEqual({
      preloadedCount: 0,
      preloadedSections: [],
      inProgressCount: 0,
      inProgressSections: [],
    });
  });

  it('reflects state after preload completes', async () => {
    const { preloadSection, getPreloadStatistics } = await import(PRELOADER_PATH);

    await preloadSection('auth');

    expect(getPreloadStatistics()).toMatchObject({
      preloadedCount: 1,
      preloadedSections: ['auth'],
      inProgressCount: 0,
      inProgressSections: [],
    });
  });
});
