/**
 * sectionManifestHelpers.js — runtime manifest (section test plan §32–33, §105–106).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const MANIFEST_HELPERS_PATH = '../../src/systems/sections/sectionManifestHelpers.js';
const MANIFEST_SESSION_KEY = 'app-section-manifest';

const manifestPayload = {
  auth: {
    js: '/assets/section-auth-abc123.js',
    css: '/assets/section-auth-abc123.css',
    integrity: {
      js: 'sha384-test-js-integrity',
      css: 'sha384-test-css-integrity',
    },
  },
  shop: {
    path: '/assets/section-shop-legacy.js',
    css: '/assets/section-shop-abc123.css',
  },
};

function createSessionStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

async function mockVerifiedManifestFetch(manifest = manifestPayload) {
  const { MANIFEST_INTEGRITY_META, sha256HexFromText } = await import(
    '../../src/systems/build/manifestIntegrity.js'
  );
  const body = JSON.stringify(manifest);
  const hash = await sha256HexFromText(body);

  const meta = document.createElement('meta');
  meta.setAttribute('name', MANIFEST_INTEGRITY_META.section);
  meta.setAttribute('content', hash);
  document.head.appendChild(meta);

  fetch.mockResolvedValue({
    ok: true,
    text: async () => body,
  });
}

beforeEach(() => {
  vi.resetModules();
  setActivePinia(createPinia());
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
  vi.useRealTimers();
});

describe('loadSectionManifest (Phase D §32)', () => {
  it('loads manifest from sessionStorage without fetching on same build hash', async () => {
    sessionStorage.setItem(
      MANIFEST_SESSION_KEY,
      JSON.stringify({
        buildHash: 'build-v1',
        manifest: manifestPayload,
      }),
    );

    const { loadSectionManifest } = await import(MANIFEST_HELPERS_PATH);
    const manifest = await loadSectionManifest();

    expect(fetch).not.toHaveBeenCalled();
    expect(manifest.auth.js).toBe('/assets/section-auth-abc123.js');
  });

  it('returns cached manifest on second call without refetch', async () => {
    sessionStorage.setItem(
      MANIFEST_SESSION_KEY,
      JSON.stringify({
        buildHash: 'build-v1',
        manifest: manifestPayload,
      }),
    );

    const { loadSectionManifest } = await import(MANIFEST_HELPERS_PATH);

    await loadSectionManifest();
    await loadSectionManifest();

    expect(fetch).not.toHaveBeenCalled();
  });

  it('refetches when sessionStorage build hash differs from current build', async () => {
    sessionStorage.setItem(
      MANIFEST_SESSION_KEY,
      JSON.stringify({
        buildHash: 'build-old',
        manifest: manifestPayload,
      }),
    );

    await mockVerifiedManifestFetch();

    const { getSectionBundlePaths } = await import(MANIFEST_HELPERS_PATH);
    await getSectionBundlePaths('auth');

    expect(fetch).toHaveBeenCalledWith('/section-manifest.json', { cache: 'no-cache' });
  });

  it('clearManifestCache forces refetch on next loadSectionManifest call', async () => {
    sessionStorage.setItem(
      MANIFEST_SESSION_KEY,
      JSON.stringify({
        buildHash: 'build-v1',
        manifest: manifestPayload,
      }),
    );

    const { loadSectionManifest, clearManifestCache } = await import(MANIFEST_HELPERS_PATH);

    await loadSectionManifest();
    clearManifestCache();

    await mockVerifiedManifestFetch();
    await loadSectionManifest();

    expect(fetch).toHaveBeenCalled();
  });
});

describe('getSectionBundlePaths (Phase D §33, §106)', () => {
  it('returns null when section is missing from manifest', async () => {
    const { getSectionBundlePaths } = await import(MANIFEST_HELPERS_PATH);
    await expect(getSectionBundlePaths('missing-section', {})).resolves.toBeNull();
  });

  it('returns js/css paths for object manifest entry', async () => {
    const { getSectionBundlePaths } = await import(MANIFEST_HELPERS_PATH);

    await expect(getSectionBundlePaths('auth', manifestPayload)).resolves.toEqual({
      js: '/assets/section-auth-abc123.js',
      css: '/assets/section-auth-abc123.css',
      integrity: manifestPayload.auth.integrity,
    });
  });

  it('uses path fallback when js key is missing', async () => {
    const { getSectionBundlePaths } = await import(MANIFEST_HELPERS_PATH);

    await expect(getSectionBundlePaths('shop', manifestPayload)).resolves.toEqual({
      js: '/assets/section-shop-legacy.js',
      css: '/assets/section-shop-abc123.css',
      integrity: null,
    });
  });

  it('returns null for untrusted JS path in object entry', async () => {
    const { getSectionBundlePaths } = await import(MANIFEST_HELPERS_PATH);

    await expect(
      getSectionBundlePaths('evil', {
        evil: {
          js: 'https://evil.example.com/bundle.js',
          css: '/assets/section-evil.css',
        },
      }),
    ).resolves.toBeNull();
  });

  it('uses provided manifest without fetching when manifest argument is passed', async () => {
    const { getSectionBundlePaths } = await import(MANIFEST_HELPERS_PATH);

    await expect(getSectionBundlePaths('auth', manifestPayload)).resolves.toEqual({
      js: '/assets/section-auth-abc123.js',
      css: '/assets/section-auth-abc123.css',
      integrity: manifestPayload.auth.integrity,
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('returns null on manifest load throw when manifest not provided', async () => {
    vi.useFakeTimers();
    fetch.mockRejectedValue(new TypeError('Failed to fetch'));

    const { getSectionBundlePaths } = await import(MANIFEST_HELPERS_PATH);
    const promise = getSectionBundlePaths('auth');
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toBeNull();
  });
});

describe('manifest failure recovery (Phase D §105)', () => {
  it('does not cache failed fetch and retries on next loadSectionManifest call', async () => {
    vi.useFakeTimers();
    fetch.mockRejectedValue(new TypeError('Failed to fetch'));

    const { loadSectionManifest } = await import(MANIFEST_HELPERS_PATH);

    const firstPromise = loadSectionManifest();
    await vi.runAllTimersAsync();
    await expect(firstPromise).resolves.toEqual({});
    expect(fetch).toHaveBeenCalledTimes(3);

    await mockVerifiedManifestFetch();
    await expect(loadSectionManifest()).resolves.toEqual(manifestPayload);
    expect(fetch).toHaveBeenCalledTimes(4);
  });
});
