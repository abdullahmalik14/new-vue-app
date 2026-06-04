import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { usePreloadStore } from '../../src/stores/usePreloadStore.js';

const getAssetPreloadEntriesForSection = vi.fn();

vi.mock('../../src/utils/assets/getAssetPreloadEntriesForSection.js', () => ({
  getAssetPreloadEntriesForSection,
}));

vi.mock('../../src/utils/assets/assetLibrary.js', () => ({
  getAssetUrl: vi.fn().mockResolvedValue('/assets/logo.png'),
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
});
