/**
 * sectionCssLoader.js — preloadSectionCss (section test plan §16, §91, §63).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  CSS_LOADER_PATH,
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

describe('preloadSectionCss (Phase D §16)', () => {
  async function loadCssLoader() {
    return import(CSS_LOADER_PATH);
  }

  it('creates link[rel=preload][as=style] with data-section-preload attribute', async () => {
    const { preloadSectionCss } = await loadCssLoader();
    await preloadSectionCss('auth');

    const hint = document.querySelector('link[data-section-preload="auth"]');
    expect(hint).not.toBeNull();
    expect(hint.rel).toBe('preload');
    expect(hint.as).toBe('style');
  });

  it('returns true when section stylesheet is already injected', async () => {
    const { loadSectionCss, preloadSectionCss } = await loadCssLoader();

    await loadSectionCss('auth');
    getSectionBundlePaths.mockClear();

    await expect(preloadSectionCss('auth')).resolves.toBe(true);
    expect(getSectionBundlePaths).not.toHaveBeenCalled();
  });

  it('does not refetch bundle paths after preload hint is already registered', async () => {
    const { preloadSectionCss } = await loadCssLoader();
    await preloadSectionCss('auth');
    getSectionBundlePaths.mockClear();

    await expect(preloadSectionCss('auth')).resolves.toBe(true);
    expect(getSectionBundlePaths).not.toHaveBeenCalled();
    expect(document.querySelectorAll('link[data-section-preload="auth"]').length).toBe(1);
  });

  it('returns false when no CSS bundle exists', async () => {
    getSectionBundlePaths.mockResolvedValue({ js: '/assets/a.js', css: null, integrity: {} });

    const { preloadSectionCss } = await loadCssLoader();
    await expect(preloadSectionCss('auth')).resolves.toBe(false);
  });

  it('returns true when existing preload link with same href is already in DOM', async () => {
    const existing = document.createElement('link');
    existing.rel = 'preload';
    existing.href = '/assets/section-auth-abc123.css';
    document.head.appendChild(existing);

    const { preloadSectionCss } = await loadCssLoader();
    await expect(preloadSectionCss('auth')).resolves.toBe(true);
    expect(document.querySelectorAll('link[href="/assets/section-auth-abc123.css"]').length).toBe(1);
  });

  it('rejects on onerror and removes hint link from DOM', async () => {
    disableAutoCssLinkResolve(createElementSpy);
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag, options) => {
      const element = originalCreateElement(tag, options);
      if (tag === 'link') {
        queueMicrotask(() => element.onerror?.(new Event('error')));
      }
      return element;
    });

    const { preloadSectionCss } = await loadCssLoader();
    await expect(preloadSectionCss('auth')).rejects.toThrow(/Failed to preload CSS/);
    expect(document.querySelector('link[data-section-preload="auth"]')).toBeNull();
  });

  it('two sections preloading simultaneously get separate hint links', async () => {
    getSectionBundlePaths.mockImplementation(async (sectionName) => ({
      js: null,
      css: `/assets/section-${sectionName}.css`,
      integrity: {},
    }));

    const { preloadSectionCss } = await loadCssLoader();
    await Promise.all([preloadSectionCss('auth'), preloadSectionCss('shop')]);

    expect(document.querySelector('link[data-section-preload="auth"]')).not.toBeNull();
    expect(document.querySelector('link[data-section-preload="shop"]')).not.toBeNull();
  });
});
