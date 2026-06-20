/**
 * Section concurrency and race hardening — Phase G (section test plan §142).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import {
  PRELOADER_PATH,
  autoResolveLinkPreloads,
  configureDefaultPreloaderMocks,
} from '../helpers/sectionPreloaderTestSetup.js';
import { ORCHESTRATOR_PATH } from '../helpers/sectionOrchestratorTestSetup.js';

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

vi.mock('../../src/systems/i18n/translationLoader.js', () => ({
  loadTranslationsForSection: vi.fn().mockResolvedValue(undefined),
  areTranslationsLoadedForSection: vi.fn(() => false),
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

describe('sectionConcurrency — preloader in-flight dedupe (Phase G §142)', () => {
  async function loadPreloader() {
    return import(PRELOADER_PATH);
  }

  it('resetSectionPreloadState mid-flight allows a subsequent preload to start fresh work', async () => {
    const releases = [];
    preloadSectionCss.mockImplementation(
      () =>
        new Promise((resolve) => {
          releases.push(() => resolve(undefined));
        }),
    );

    const { preloadSection, resetSectionPreloadState } = await loadPreloader();

    const first = preloadSection('auth');
    await vi.waitUntil(() => preloadSectionCss.mock.calls.length > 0);

    resetSectionPreloadState('auth');
    const second = preloadSection('auth');
    await vi.waitUntil(() => preloadSectionCss.mock.calls.length >= 2);

    expect(preloadSectionCss).toHaveBeenCalledTimes(2);

    releases.forEach((release) => release());
    await Promise.all([first, second]);
  });

  it('two concurrent resetSectionPreloadState calls remain idempotent', async () => {
    const { preloadSection, resetSectionPreloadState } = await loadPreloader();
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    await preloadSection('auth');
    expect(usePreloadStore().hasSection('auth')).toBe(true);

    resetSectionPreloadState('auth');
    resetSectionPreloadState('auth');

    expect(usePreloadStore().hasSection('auth')).toBe(false);
  });

  it('rapid auth→shop→auth navigation does not leak duplicate JS preload links', async () => {
    getSectionBundlePaths.mockImplementation(async (sectionName) => ({
      js: `/assets/section-${sectionName}.js`,
      css: `/assets/section-${sectionName}.css`,
      integrity: {},
    }));

    const { preloadSection } = await loadPreloader();

    await preloadSection('auth');
    await preloadSection('shop');
    await preloadSection('auth');

    const jsLinks = document.querySelectorAll('link[data-section-js-preload]');
    expect(jsLinks.length).toBeLessThanOrEqual(2);
  });
});

describe('sectionConcurrency — orchestrator overlap (Phase G §142)', () => {
  async function loadOrchestrator() {
    return import(ORCHESTRATOR_PATH);
  }

  it('overlapping startBackgroundSectionPreloads calls share in-flight preloadSection work', async () => {
    let resolveAuth;
    preloadSectionCss.mockImplementation((sectionName) => {
      if (sectionName === 'auth') {
        return new Promise((resolve) => {
          resolveAuth = () => resolve(undefined);
        });
      }
      return Promise.resolve(undefined);
    });

    const { startBackgroundSectionPreloads } = await loadOrchestrator();

    const first = startBackgroundSectionPreloads({
      sections: ['auth', 'shop'],
      logContext: { file: 'sectionConcurrency.test.js', method: 'overlap-first' },
    });
    const second = startBackgroundSectionPreloads({
      sections: ['auth', 'profile'],
      logContext: { file: 'sectionConcurrency.test.js', method: 'overlap-second' },
    });

    await vi.waitUntil(() => typeof resolveAuth === 'function');
    resolveAuth();
    await Promise.all([first, second]);

    const authCssCalls = preloadSectionCss.mock.calls.filter(([sectionName]) => sectionName === 'auth');
    expect(authCssCalls.length).toBe(1);
  });

  it('clearSectionPreloadState during in-flight preloadMultipleSections leaves store consistent', async () => {
    let resolveShop;
    preloadSectionCss.mockImplementation((sectionName) => {
      if (sectionName === 'shop') {
        return new Promise((resolve) => {
          resolveShop = () => resolve(undefined);
        });
      }
      return Promise.resolve(undefined);
    });

    const { preloadMultipleSections, clearSectionPreloadState } = await import(PRELOADER_PATH);
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    const batch = preloadMultipleSections(['auth', 'shop']);
    await vi.waitUntil(() => typeof resolveShop === 'function');

    clearSectionPreloadState();
    expect(usePreloadStore().preloadedSections.size).toBe(0);
    expect(usePreloadStore().sectionsInProgress.size).toBe(0);

    resolveShop();
    await batch;

    expect(usePreloadStore().sectionsInProgress.size).toBe(0);
  });
});
