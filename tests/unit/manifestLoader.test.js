import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const LOADER_PATH = '../../src/utils/build/manifestLoader.js';
const MANIFEST_SESSION_KEY = 'app-section-manifest';

const manifestPayload = {
  auth: {
    js: '/assets/section-auth-abc123.js',
    css: '/assets/section-auth-abc123.css',
    integrity: {
      js: 'sha384-test-js-integrity',
      css: 'sha384-test-css-integrity'
    }
  }
};

function createSessionStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => { store.set(key, value); },
    removeItem: (key) => { store.delete(key); },
    clear: () => { store.clear(); }
  };
}

async function mockVerifiedManifestFetch(manifest = manifestPayload) {
  const { MANIFEST_INTEGRITY_META, sha256HexFromText } = await import('../../src/utils/build/manifestIntegrity.js');
  const body = JSON.stringify(manifest);
  const hash = await sha256HexFromText(body);

  const meta = document.createElement('meta');
  meta.setAttribute('name', MANIFEST_INTEGRITY_META.section);
  meta.setAttribute('content', hash);
  document.head.appendChild(meta);

  fetch.mockResolvedValue({
    ok: true,
    text: async () => body
  });
}

beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal('sessionStorage', createSessionStorage());
  vi.stubGlobal('fetch', vi.fn());
  window.performanceTracker = { step: vi.fn() };
  vi.stubEnv('VITE_BUILD_HASH', 'build-v1');
  vi.stubEnv('PROD', '1');
  vi.stubEnv('DEV', '');

  document.head.innerHTML = '';
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('manifestLoader unified manifest cache (B-01)', () => {
  it('loads manifest from sessionStorage without fetching on cold start in same build', async () => {
    sessionStorage.setItem(MANIFEST_SESSION_KEY, JSON.stringify({
      buildHash: 'build-v1',
      manifest: manifestPayload
    }));

    const { getSectionBundlePaths } = await import(LOADER_PATH);

    const paths = await getSectionBundlePaths('auth');

    expect(fetch).not.toHaveBeenCalled();
    expect(paths).toEqual({
      js: '/assets/section-auth-abc123.js',
      css: '/assets/section-auth-abc123.css',
      integrity: {
        js: 'sha384-test-js-integrity',
        css: 'sha384-test-css-integrity'
      }
    });
  });

  it('refetches manifest when sessionStorage build hash differs from current build', async () => {
    sessionStorage.setItem(MANIFEST_SESSION_KEY, JSON.stringify({
      buildHash: 'build-old',
      manifest: manifestPayload
    }));

    await mockVerifiedManifestFetch();

    const { getSectionBundlePaths } = await import(LOADER_PATH);

    await getSectionBundlePaths('auth');

    expect(fetch).toHaveBeenCalledWith('/section-manifest.json', { cache: 'force-cache' });
  });

  it('persists fetched manifest to sessionStorage keyed by build hash', async () => {
    await mockVerifiedManifestFetch();

    const { loadSectionManifest } = await import(LOADER_PATH);

    await loadSectionManifest();

    const stored = JSON.parse(sessionStorage.getItem(MANIFEST_SESSION_KEY));
    expect(stored.buildHash).toBe('build-v1');
    expect(stored.manifest).toEqual(manifestPayload);
  });

  it('clearManifestCache removes sessionStorage entry', async () => {
    sessionStorage.setItem(MANIFEST_SESSION_KEY, JSON.stringify({
      buildHash: 'build-v1',
      manifest: manifestPayload
    }));

    const { clearManifestCache } = await import(LOADER_PATH);

    clearManifestCache();

    expect(sessionStorage.getItem(MANIFEST_SESSION_KEY)).toBeNull();
  });
});

describe('manifestLoader failure recovery (L-14 / Task 8)', () => {
  it('does not cache failed fetch — retries on next loadSectionManifest call', async () => {
    vi.useFakeTimers();

    fetch.mockRejectedValue(new TypeError('Failed to fetch'));

    const { loadSectionManifest } = await import(LOADER_PATH);

    const firstPromise = loadSectionManifest();
    await vi.runAllTimersAsync();
    const first = await firstPromise;

    expect(first).toEqual({});
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(sessionStorage.getItem(MANIFEST_SESSION_KEY)).toBeNull();

    await mockVerifiedManifestFetch();

    const second = await loadSectionManifest();

    expect(second).toEqual(manifestPayload);
    expect(fetch).toHaveBeenCalledTimes(4);

    vi.useRealTimers();
  });

  it('getSectionBundlePaths succeeds after manifest fetch recovers', async () => {
    vi.useFakeTimers();

    fetch.mockRejectedValue(new TypeError('Failed to fetch'));

    const { getSectionBundlePaths } = await import(LOADER_PATH);

    const firstPromise = getSectionBundlePaths('auth');
    await vi.runAllTimersAsync();
    const first = await firstPromise;

    expect(first).toBeNull();

    await mockVerifiedManifestFetch();

    const second = await getSectionBundlePaths('auth');

    expect(second).toEqual({
      js: '/assets/section-auth-abc123.js',
      css: '/assets/section-auth-abc123.css',
      integrity: {
        js: 'sha384-test-js-integrity',
        css: 'sha384-test-css-integrity'
      }
    });

    vi.useRealTimers();
  });
});
