import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import {
  configureDefaultPreloaderMocks,
  autoResolveLinkPreloads,
} from '../helpers/sectionPreloaderTestSetup.js';
import { setupAssetTestEnv } from '../helpers/assetFixtures.js';

const PRELOADER_PATH = '../../src/systems/sections/sectionPreloader.js';

const {
  getSectionBundlePaths,
  preloadSectionCss,
  preloadSectionAssets,
  preloadSectionCriticalImages,
} = vi.hoisted(() => ({
  getSectionBundlePaths: vi.fn(),
  preloadSectionCss: vi.fn(),
  preloadSectionAssets: vi.fn(),
  preloadSectionCriticalImages: vi.fn(),
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
  preloadSectionCriticalImages,
}));


beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  setupAssetTestEnv();
  setActivePinia(createPinia());
  document.head.innerHTML = '';
  window.performanceTracker = { step: vi.fn() };
  configureDefaultPreloaderMocks({ getSectionBundlePaths, preloadSectionCss, preloadSectionAssets });
  preloadSectionAssets.mockResolvedValue(undefined);
  preloadSectionCriticalImages.mockResolvedValue(undefined);
  autoResolveLinkPreloads();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('sectionPreloader.assets (§86)', () => {
  async function loadPreloader() {
    return import(PRELOADER_PATH);
  }

  it('preloadSection calls preloadSectionAssets', async () => {
    const { preloadSection } = await loadPreloader();

    await preloadSection('auth');

    expect(preloadSectionAssets).toHaveBeenCalledWith('auth');
  });

  it('critical images before components', async () => {
    const order = [];
    preloadSectionCriticalImages.mockImplementation(async () => {
      order.push('critical');
    });

    const { loadRouteComponentWithSectionPreload } = await import(
      '../../src/systems/sections/sectionNavigationHooks.js'
    );

    await loadRouteComponentWithSectionPreload(
      { slug: '/auth', section: 'auth' },
      vi.fn(async () => {
        order.push('component');
        return { default: {} };
      }),
    );

    expect(preloadSectionCriticalImages).toHaveBeenCalledWith('auth');
    expect(order.indexOf('critical')).toBeLessThan(order.indexOf('component'));
  });

  it('invalid section skipped', async () => {
    getSectionBundlePaths.mockResolvedValue(null);
    const { preloadSection } = await loadPreloader();

    await expect(preloadSection('invalid-section')).resolves.toBe(false);
    expect(preloadSectionAssets).not.toHaveBeenCalled();
  });

  it('uses section rollup', async () => {
    const { preloadSection } = await loadPreloader();

    await preloadSection('dashboard');

    expect(preloadSectionAssets).toHaveBeenCalledWith('dashboard');
    expect(getSectionBundlePaths).toHaveBeenCalledWith('dashboard');
  });

  it('asset failure does not block components', async () => {
    preloadSectionAssets.mockRejectedValue(new Error('asset preload failed'));
    const { preloadSection } = await loadPreloader();

    await expect(preloadSection('auth')).resolves.toBe(true);
  });

  it('resetSectionPreloadState clears flags', async () => {
    const { preloadSection, resetSectionPreloadState } = await loadPreloader();
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    await preloadSection('auth');
    expect(usePreloadStore().hasSection('auth')).toBe(true);

    resetSectionPreloadState('auth');
    expect(usePreloadStore().hasSection('auth')).toBe(false);
  });

  it('isSectionPreloaded checks store', async () => {
    const { preloadSection, isSectionPreloaded } = await loadPreloader();
    const { usePreloadStore } = await import('../../src/stores/usePreloadStore.js');

    usePreloadStore().addSection('auth');
    expect(isSectionPreloaded('auth')).toBe(true);

    await preloadSection('auth');
    expect(isSectionPreloaded('auth')).toBe(true);
    expect(getSectionBundlePaths).not.toHaveBeenCalled();
  });
});
