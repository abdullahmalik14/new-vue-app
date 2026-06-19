/**
 * sectionCssLoader.js — load/unload/clear (section test plan §15–18, §21, §90).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  CSS_LOADER_PATH,
  DEFAULT_CSS_BUNDLE,
  disableAutoCssLinkResolve,
  setupCssLoaderTestEnvironment,
  teardownCssLoaderTestEnvironment,
} from '../helpers/sectionCssLoaderTestSetup.js';

const { getSectionBundlePaths } = vi.hoisted(() => ({
  getSectionBundlePaths: vi.fn(),
}));

vi.mock('../../src/systems/sections/sectionManifestHelpers.js', () => ({
  getSectionBundlePaths,
}));

let createElementSpy;

beforeEach(() => {
  createElementSpy = setupCssLoaderTestEnvironment({ getSectionBundlePaths });
});

afterEach(() => {
  teardownCssLoaderTestEnvironment();
});

describe('loadSectionCss (Phase D §15)', () => {
  async function loadCssLoader() {
    return import(CSS_LOADER_PATH);
  }

  it('loads CSS from sectionManifestHelpers bundle paths', async () => {
    const { loadSectionCss } = await loadCssLoader();
    await expect(loadSectionCss('auth')).resolves.toBe(true);
    expect(getSectionBundlePaths).toHaveBeenCalledWith('auth');
    expect(document.querySelector('link[data-section-css="true"]')).not.toBeNull();
  });

  it('returns true immediately when section CSS is already loaded', async () => {
    const { loadSectionCss } = await loadCssLoader();
    await loadSectionCss('auth');
    getSectionBundlePaths.mockClear();

    await expect(loadSectionCss('auth')).resolves.toBe(true);
    expect(getSectionBundlePaths).not.toHaveBeenCalled();
  });

  it('returns false when manifest has no CSS bundle', async () => {
    getSectionBundlePaths.mockResolvedValue({
      js: '/assets/section-auth-abc123.js',
      css: null,
      integrity: {},
    });

    const { loadSectionCss } = await loadCssLoader();
    await expect(loadSectionCss('auth')).resolves.toBe(false);
  });

  it('returns false when CSS path fails trust validation', async () => {
    getSectionBundlePaths.mockResolvedValue({
      js: '/assets/section-auth-abc123.js',
      css: 'https://evil.example.com/malicious.css',
      integrity: { css: 'sha384-test-css-integrity' },
    });

    const { loadSectionCss } = await loadCssLoader();
    await expect(loadSectionCss('auth')).resolves.toBe(false);
    expect(document.querySelector('link[data-section-css="true"]')).toBeNull();
  });

  it('returns false when inject onerror fires', async () => {
    disableAutoCssLinkResolve(createElementSpy);
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag, options) => {
      const element = originalCreateElement(tag, options);
      if (tag === 'link') {
        queueMicrotask(() => element.onerror?.(new Event('error')));
      }
      return element;
    });

    const { loadSectionCss } = await loadCssLoader();
    await expect(loadSectionCss('auth')).resolves.toBe(false);
  });

  it('normalizes relative CSS paths with leading slash', async () => {
    getSectionBundlePaths.mockResolvedValue({
      js: null,
      css: 'section-auth.css',
      integrity: { css: 'sha384-test-css-integrity' },
    });

    const { loadSectionCss } = await loadCssLoader();
    await loadSectionCss('auth');

    expect(document.querySelector('link[data-section-css="true"]')?.getAttribute('href')).toBe(
      '/section-auth.css',
    );
  });

  it('does not inject duplicate stylesheet links when loadSectionCss is called twice', async () => {
    const { loadSectionCss } = await loadCssLoader();
    await loadSectionCss('auth');
    await loadSectionCss('auth');

    expect(document.querySelectorAll('link[data-section="auth"]').length).toBe(1);
  });
});

describe('unloadSectionCss and getLoadedSections (Phase D §17–18)', () => {
  async function loadCssLoader() {
    return import(CSS_LOADER_PATH);
  }

  it('removes active stylesheet and clears loaded tracking', async () => {
    const { loadSectionCss, unloadSectionCss, getLoadedSections } = await loadCssLoader();

    await loadSectionCss('auth');
    expect(getLoadedSections()).toEqual(['auth']);

    expect(unloadSectionCss('auth')).toBe(true);
    expect(getLoadedSections()).toEqual([]);
    expect(document.querySelector('link[data-section="auth"]')).toBeNull();
  });

  it('returns false when section is not loaded', async () => {
    const { unloadSectionCss } = await loadCssLoader();
    expect(unloadSectionCss('unknown')).toBe(false);
  });

  it('does not remove other sections CSS when unloading one section', async () => {
    getSectionBundlePaths.mockImplementation(async (sectionName) => ({
      js: null,
      css: `/assets/section-${sectionName}.css`,
      integrity: {},
    }));

    const { loadSectionCss, unloadSectionCss, getLoadedSections } = await loadCssLoader();

    await loadSectionCss('auth');
    await loadSectionCss('shop');

    unloadSectionCss('auth');

    expect(getLoadedSections()).toEqual(['shop']);
    expect(document.querySelector('link[data-section="shop"]')).not.toBeNull();
  });
});

describe('clearAllSectionCss and clearSectionCssPreloadHint (Phase D §19–20)', () => {
  async function loadCssLoader() {
    return import(CSS_LOADER_PATH);
  }

  it('clearAllSectionCss removes stylesheet and preload hint links', async () => {
    const { loadSectionCss, preloadSectionCss, clearAllSectionCss, getLoadedSections } =
      await loadCssLoader();

    await preloadSectionCss('auth');
    await loadSectionCss('auth');

    clearAllSectionCss();

    expect(getLoadedSections()).toEqual([]);
    expect(document.querySelector('link[data-section-css="true"]')).toBeNull();
    expect(document.querySelector('link[data-section-preload]')).toBeNull();
  });

  it('clearSectionCssPreloadHint removes preload hint only', async () => {
    const { preloadSectionCss, clearSectionCssPreloadHint } = await loadCssLoader();

    await preloadSectionCss('auth');
    expect(clearSectionCssPreloadHint('auth')).toBe(true);
    expect(document.querySelector('link[data-section-preload="auth"]')).toBeNull();
    expect(clearSectionCssPreloadHint('auth')).toBe(false);
  });
});

describe('loadSectionCss integrity (Phase D §80, §95)', () => {
  async function loadCssLoader() {
    return import(CSS_LOADER_PATH);
  }

  it('applies CSS bundle integrity to injected stylesheet links', async () => {
    const { preloadSectionCss, loadSectionCss } = await loadCssLoader();

    await preloadSectionCss('auth');
    expect(document.querySelector('link[data-section-preload="auth"]').integrity).toBe(
      DEFAULT_CSS_BUNDLE.integrity.css,
    );

    await loadSectionCss('auth');
    expect(document.querySelector('link[data-section-css="true"]').integrity).toBe(
      DEFAULT_CSS_BUNDLE.integrity.css,
    );
  });
});
