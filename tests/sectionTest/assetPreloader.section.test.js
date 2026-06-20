/**
 * assetPreloader.js — section asset preload (section test plan §43–44, §118).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { usePreloadStore } from '../../src/stores/usePreloadStore.js';

const getAssetPreloadEntriesForSection = vi.fn();

vi.mock('../../src/systems/assets/routeSectionAssetPreloadEntries.js', () => ({
  getAssetPreloadEntriesForSection,
}));

vi.mock('../../src/systems/assets/assetLibrary.js', () => ({
  getAssetUrl: vi.fn().mockResolvedValue('/assets/logo.png'),
  getAssetUrls: vi.fn().mockResolvedValue({
    'dashboard.logo': '/assets/logo.png',
    'dashboard.avatar': '/assets/avatar.png',
  }),
}));

function autoResolveLinkPreloads() {
  const originalCreateElement = document.createElement.bind(document);
  return vi.spyOn(document, 'createElement').mockImplementation((tag, options) => {
    const element = originalCreateElement(tag, options);
    if (tag === 'link') {
      queueMicrotask(() => {
        if (typeof element.onload === 'function') {
          element.onload();
        }
      });
    }
    return element;
  });
}

describe('preloadSectionAssets (Phase F §43)', () => {
  beforeEach(() => {
    vi.resetModules();
    setActivePinia(createPinia());
    document.head.innerHTML = '';
    window.performanceTracker = { step: vi.fn() };
    getAssetPreloadEntriesForSection.mockReset();
    getAssetPreloadEntriesForSection.mockReturnValue({
      assets: [{ flag: 'dashboard.logo', type: 'image', priority: 'high' }],
      routeCount: 1,
    });
  });

  it('skips preloadAssets when every resolved section URL is already in the store', async () => {
    autoResolveLinkPreloads();
    const mod = await import('../../src/systems/assets/assetPreloader.js');
    const preloadAssetsSpy = vi.spyOn(mod, 'preloadAssets');
    const store = usePreloadStore();

    store.addPreloadedAsset('/assets/logo.png');

    await mod.preloadSectionAssets('dashboard-global');

    expect(preloadAssetsSpy).not.toHaveBeenCalled();
    preloadAssetsSpy.mockRestore();
  });

  it('injects preload links when section asset URLs are missing from the store', async () => {
    autoResolveLinkPreloads();
    const { preloadSectionAssets } = await import('../../src/systems/assets/assetPreloader.js');

    await preloadSectionAssets('dashboard-global');

    expect(document.querySelector('link[href="/assets/logo.png"]')).toBeTruthy();
    expect(getAssetPreloadEntriesForSection).toHaveBeenCalledWith('dashboard-global');
  });
});

describe('preloadSectionCriticalImages (Phase F §44)', () => {
  beforeEach(() => {
    vi.resetModules();
    setActivePinia(createPinia());
    document.head.innerHTML = '';
    window.performanceTracker = { step: vi.fn() };
    getAssetPreloadEntriesForSection.mockReset();
  });

  it('requests section rollup entries for the target section', async () => {
    getAssetPreloadEntriesForSection.mockReturnValue({
      assets: [{ flag: 'auth.background', type: 'image', priority: 'critical' }],
      routeCount: 1,
    });

    const { preloadSectionCriticalImages } = await import('../../src/systems/assets/assetPreloader.js');
    await expect(preloadSectionCriticalImages('auth')).resolves.toBeUndefined();
    expect(getAssetPreloadEntriesForSection).toHaveBeenCalledWith('auth');
  });

  it('does not inject preload links when section has no critical or high image assets', async () => {
    getAssetPreloadEntriesForSection.mockReturnValue({
      assets: [{ flag: 'auth.optional', type: 'image', priority: 'low' }],
      routeCount: 1,
    });

    const { preloadSectionCriticalImages } = await import('../../src/systems/assets/assetPreloader.js');
    await preloadSectionCriticalImages('auth');

    expect(document.querySelectorAll('link').length).toBe(0);
  });
});
