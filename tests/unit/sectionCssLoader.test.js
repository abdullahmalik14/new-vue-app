import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const LOADER_PATH = '../../src/systems/sections/sectionCssLoader.js';

const getSectionBundlePaths = vi.fn();

vi.mock('../../src/systems/sections/sectionManifestHelpers.js', () => ({
  getSectionBundlePaths
}));

beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal('fetch', vi.fn());
  window.performanceTracker = { step: vi.fn() };
  vi.stubEnv('PROD', '1');
  vi.stubEnv('DEV', '');

  document.head.innerHTML = '';

  getSectionBundlePaths.mockResolvedValue({
    js: '/assets/section-auth-abc123.js',
    css: '/assets/section-auth-abc123.css',
    integrity: {
      css: 'sha384-test-css-integrity'
    }
  });

  const originalCreateElement = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation((tag, options) => {
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
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('sectionCssLoader unified manifest lookup (B-01)', () => {
  it('resolves CSS paths from manifestLoader instead of a separate CSS manifest', async () => {
    const { loadSectionCss } = await import(LOADER_PATH);

    await loadSectionCss('auth');

    expect(getSectionBundlePaths).toHaveBeenCalledWith('auth');
    expect(document.querySelector('link[data-section-css="true"]')).not.toBeNull();
  });
});

describe('preloadSectionCss cleanup (P-05)', () => {
  it('tracks preload hints and removes them in unloadSectionCss', async () => {
    const { preloadSectionCss, unloadSectionCss } = await import(LOADER_PATH);

    await preloadSectionCss('auth');

    expect(document.querySelector('link[data-section-preload="auth"]')).not.toBeNull();

    const result = unloadSectionCss('auth');

    expect(result).toBe(true);
    expect(document.querySelector('link[data-section-preload="auth"]')).toBeNull();
  });

  it('clearAllSectionCss removes tracked preload hints', async () => {
    const { preloadSectionCss, clearAllSectionCss } = await import(LOADER_PATH);

    await preloadSectionCss('auth');
    expect(document.querySelector('link[data-section-preload="auth"]')).not.toBeNull();

    clearAllSectionCss();

    expect(document.querySelector('link[data-section-preload="auth"]')).toBeNull();
  });

  it('applies CSS bundle integrity to stylesheet and preload links (S-02)', async () => {
    const { preloadSectionCss, loadSectionCss } = await import(LOADER_PATH);

    await preloadSectionCss('auth');
    expect(document.querySelector('link[data-section-preload="auth"]').integrity)
      .toBe('sha384-test-css-integrity');

    await loadSectionCss('auth');
    expect(document.querySelector('link[data-section-css="true"]').integrity)
      .toBe('sha384-test-css-integrity');
  });

  it('rejects untrusted CSS bundle paths from manifest (S-03)', async () => {
    getSectionBundlePaths.mockResolvedValue({
      js: '/assets/section-auth-abc123.js',
      css: 'https://evil.example.com/malicious.css',
      integrity: { css: 'sha384-test-css-integrity' }
    });

    const { preloadSectionCss, loadSectionCss } = await import(LOADER_PATH);

    expect(await preloadSectionCss('auth')).toBe(false);
    expect(await loadSectionCss('auth')).toBe(false);
    expect(document.querySelector('link[data-section-css="true"]')).toBeNull();
    expect(document.querySelector('link[data-section-preload="auth"]')).toBeNull();
  });
});
