import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const LIBRARY_PATH = '../../src/systems/assets/assetLibrary.js';

const loadSectionManifest = vi.fn();
const getSectionBundlePaths = vi.fn();

vi.mock('../../src/systems/build/manifestLoader.js', () => ({
  loadSectionManifest,
  getSectionBundlePaths
}));

vi.mock('../../src/systems/assets/routeSectionAssetPreloadEntries.js', () => ({
  getAssetPreloadEntriesForSection: vi.fn(() => ({ assets: [], routeCount: 0 }))
}));

async function importAssetLibrary() {
  return import(LIBRARY_PATH);
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  setActivePinia(createPinia());
  window.performanceTracker = { step: vi.fn() };

  loadSectionManifest.mockResolvedValue({ auth: { js: '/a.js' } });
  getSectionBundlePaths.mockResolvedValue({
    js: '/assets/section-auth.js',
    css: '/assets/section-auth.css'
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('loadAssetsForSection dedup (L-02)', () => {
  it('shares the same promise for concurrent callers', async () => {
    let manifestResolve;
    loadSectionManifest.mockImplementation(
      () => new Promise((resolve) => { manifestResolve = resolve; })
    );

    const { loadAssetsForSection } = await importAssetLibrary();

    const p1 = loadAssetsForSection('auth');
    const p2 = loadAssetsForSection('auth');

    expect(p1).toBe(p2);

    const { getAssetStatistics } = await importAssetLibrary();
    expect(getAssetStatistics().loadingInProgress).toEqual(['auth']);

    manifestResolve({ auth: { js: '/a.js' } });
    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1.sectionName).toBe('auth');
    expect(r2).toBe(r1);
    expect(loadSectionManifest).toHaveBeenCalledTimes(1);
    expect(getSectionBundlePaths).toHaveBeenCalledTimes(1);
  });

  it('clears in-progress tracking after load completes', async () => {
    const { loadAssetsForSection, getAssetStatistics } = await importAssetLibrary();

    await loadAssetsForSection('auth');

    expect(getAssetStatistics().loadingInProgress).toEqual([]);
  });

  it('cache-hit returns a thenable for preloadAssetsForSections-style chaining (P-02)', async () => {
    const { setValueWithExpiration } = await import('../../src/utils/common/cacheHandler.js');
    const { clearAssetCaches, loadAssetsForSection } = await importAssetLibrary();

    clearAssetCaches();

    const cached = {
      sectionName: 'auth',
      bundlePaths: { js: null, css: null },
      assetPreloadConfigs: [],
      manifestEntry: null,
      loadedAt: new Date().toISOString(),
      state: 'loaded',
    };
    setValueWithExpiration('asset_metadata_auth', cached, 3600000);

    const chained = loadAssetsForSection('auth').then((assets) => assets.sectionName);
    await expect(chained).resolves.toBe('auth');
    expect(loadSectionManifest).not.toHaveBeenCalled();
  });

  it('clearAssetCaches clears in-flight section load promises', async () => {
    let manifestResolve;
    loadSectionManifest.mockImplementation(
      () => new Promise((resolve) => { manifestResolve = resolve; })
    );

    const { loadAssetsForSection, clearAssetCaches, getAssetStatistics } = await importAssetLibrary();

    const inFlight = loadAssetsForSection('auth');
    await vi.waitUntil(() => getAssetStatistics().loadingInProgress.length === 1);

    clearAssetCaches();
    expect(getAssetStatistics().loadingInProgress).toEqual([]);

    manifestResolve({ auth: { js: '/a.js' } });
    await inFlight;
  });
});
