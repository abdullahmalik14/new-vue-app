import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { usePreloadStore } from '../../src/stores/usePreloadStore.js';

const getAssetPreloadEntriesForSection = vi.fn();

vi.mock('../../src/systems/assets/routeSectionAssetPreloadEntries.js', () => ({
  getAssetPreloadEntriesForSection,
}));

vi.mock('../../src/utils/assets/assetLibrary.js', () => ({
  getAssetUrl: vi.fn().mockResolvedValue('/assets/logo.png'),
  getAssetUrls: vi.fn().mockResolvedValue({ 'dashboard.logo': '/assets/logo.png' }),
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

describe('preloadSectionAssets URL short-circuit (C-07)', () => {
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
    const mod = await import('../../src/utils/assets/assetPreloader.js');
    const preloadAssetsSpy = vi.spyOn(mod, 'preloadAssets');
    const store = usePreloadStore();

    store.addAsset('/assets/logo.png');

    await mod.preloadSectionAssets('dashboard-global');

    expect(preloadAssetsSpy).not.toHaveBeenCalled();
    preloadAssetsSpy.mockRestore();
  });

  it('calls preloadAssets when at least one resolved URL is missing from the store', async () => {
    autoResolveLinkPreloads();
    const mod = await import('../../src/utils/assets/assetPreloader.js');

    await mod.preloadSectionAssets('dashboard-global');

    expect(document.querySelector('link[href="/assets/logo.png"]')).toBeTruthy();
  });

  it('batch-resolves section flags via getAssetUrls (P-04)', async () => {
    getAssetPreloadEntriesForSection.mockReturnValue({
      assets: [
        { flag: 'dashboard.logo', type: 'image', priority: 'high' },
        { flag: 'dashboard.avatar', type: 'image', priority: 'high' },
      ],
      routeCount: 1,
    });

    const assetLibrary = await import('../../src/utils/assets/assetLibrary.js');
    assetLibrary.getAssetUrls.mockClear();
    assetLibrary.getAssetUrl.mockClear();
    assetLibrary.getAssetUrls.mockResolvedValue({
      'dashboard.logo': '/assets/logo.png',
      'dashboard.avatar': '/assets/avatar.png',
    });

    autoResolveLinkPreloads();
    const mod = await import('../../src/utils/assets/assetPreloader.js');

    await mod.preloadSectionAssets('dashboard-global');

    expect(assetLibrary.getAssetUrls).toHaveBeenCalledTimes(1);
    expect(assetLibrary.getAssetUrls).toHaveBeenCalledWith(
      ['dashboard.logo', 'dashboard.avatar'],
      { section: 'dashboard-global' },
    );
    expect(assetLibrary.getAssetUrl).not.toHaveBeenCalled();
  });
});
