import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAssetTestEnv } from '../helpers/assetFixtures.js';

const loadSectionManifest = vi.fn();
const getSectionBundlePaths = vi.fn();

vi.mock('../../src/systems/sections/sectionManifestHelpers.js', () => ({
  loadSectionManifest,
  getSectionBundlePaths,
}));

vi.mock('../../src/systems/assets/routeSectionAssetPreloadEntries.js', () => ({
  getAssetPreloadEntriesForSection: vi.fn(() => ({
    assets: [{ flag: 'script.cognito', type: 'script', priority: 'high' }],
    routeCount: 1,
  })),
}));

async function importAssetLibrary() {
  return import('../../src/systems/assets/assetLibrary.js');
}

describe('assetLibrary section loading and metadata (§10)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    loadSectionManifest.mockResolvedValue({ auth: { js: '/a.js' } });
    getSectionBundlePaths.mockResolvedValue({
      js: '/assets/section-auth.js',
      css: '/assets/section-auth.css',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loadAssetsForSection loads global if needed', async () => {
    const { loadAssetsForSection } = await importAssetLibrary();
    const assets = await loadAssetsForSection('auth');
    expect(assets.sectionName).toBe('auth');
    expect(loadSectionManifest).toHaveBeenCalled();
  });

  it('loadAssetsForSection fetches section map when valid', async () => {
    const { loadAssetsForSection } = await importAssetLibrary();
    const assets = await loadAssetsForSection('auth');
    expect(assets.assetPreloadConfigs.length).toBeGreaterThan(0);
  });

  it('loadAssetsForSection no-op fetch for invalid section', async () => {
    const { loadAssetsForSection } = await importAssetLibrary();
    const assets = await loadAssetsForSection('');
    expect(assets).toEqual({});
    expect(loadSectionManifest).not.toHaveBeenCalled();
  });

  it('preloadAssetsForSections loads multiple sections in parallel', async () => {
    const { preloadAssetsForSections } = await importAssetLibrary();
    const result = await preloadAssetsForSections(['auth', 'misc']);
    expect(Object.keys(result).sort()).toEqual(['auth', 'misc']);
  });

  it('preloadAssetsForSections dedupes duplicate section names', async () => {
    const { preloadAssetsForSections } = await importAssetLibrary();
    const result = await preloadAssetsForSections(['auth', 'auth']);
    expect(Object.keys(result)).toEqual(['auth']);
  });

  it('getAssetsForSection returns merged view for section', async () => {
    const { loadAssetsForSection, getAssetsForSection } = await importAssetLibrary();
    await loadAssetsForSection('auth');
    const view = getAssetsForSection('auth');
    expect(view.sectionName).toBe('auth');
  });

  it('areAssetsLoadedForSection false before load', async () => {
    const { clearAssetCaches, areAssetsLoadedForSection } = await importAssetLibrary();
    clearAssetCaches();
    expect(areAssetsLoadedForSection('auth')).toBe(false);
  });

  it('areAssetsLoadedForSection true after successful load', async () => {
    const { loadAssetsForSection, areAssetsLoadedForSection } = await importAssetLibrary();
    await loadAssetsForSection('auth');
    expect(areAssetsLoadedForSection('auth')).toBe(true);
  });

  it('isSectionAssetMetadataInMemory reflects RAM cache', async () => {
    const { loadAssetsForSection, isSectionAssetMetadataInMemory } = await importAssetLibrary();
    expect(isSectionAssetMetadataInMemory('auth')).toBe(false);
    await loadAssetsForSection('auth');
    expect(isSectionAssetMetadataInMemory('auth')).toBe(true);
  });

  it('isSectionAssetMetadataCached reflects persistent cache layer', async () => {
    const { setValueWithExpiration } = await import('../../src/infrastructure/cache/cacheHandler.js');
    const { clearAssetCaches, isSectionAssetMetadataCached } = await importAssetLibrary();
    clearAssetCaches();
    setValueWithExpiration('asset_metadata_auth', { sectionName: 'auth', state: 'loaded' }, 60_000);
    expect(isSectionAssetMetadataCached('auth')).toBe(true);
  });

  it('getAssetLoadingState pending during fetch', async () => {
    let manifestResolve;
    loadSectionManifest.mockImplementation(
      () => new Promise((resolve) => { manifestResolve = resolve; }),
    );
    const { loadAssetsForSection, getAssetLoadingState } = await importAssetLibrary();
    const pending = loadAssetsForSection('auth');
    expect(getAssetLoadingState('auth')).toBe('loading');
    manifestResolve({ auth: { js: '/a.js' } });
    await pending;
  });

  it('getAssetLoadingState loaded after success', async () => {
    const { loadAssetsForSection, getAssetLoadingState } = await importAssetLibrary();
    await loadAssetsForSection('auth');
    expect(getAssetLoadingState('auth')).toBe('loaded');
  });

  it('getAssetLoadingState error after failed fetch', async () => {
    getSectionBundlePaths.mockRejectedValue(new Error('bundle failed'));
    const { loadAssetsForSection } = await importAssetLibrary();
    const result = await loadAssetsForSection('auth');
    expect(result.state).toBe('error');
  });

  it('parallel loadAssetsForSection same section single flight', async () => {
    const { loadAssetsForSection } = await importAssetLibrary();
    const p1 = loadAssetsForSection('auth');
    const p2 = loadAssetsForSection('auth');
    expect(p1).toBe(p2);
    await Promise.all([p1, p2]);
    expect(loadSectionManifest).toHaveBeenCalledTimes(1);
  });
});
