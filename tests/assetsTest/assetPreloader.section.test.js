import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePreloadStore } from '../../src/stores/usePreloadStore.js';
import {
  autoResolveLinkPreloads,
  loadProductionAssetLibrary,
  setupAssetTestEnv,
} from '../helpers/assetFixtures.js';

const rollupAssets = [
  { flag: 'script.cognito', type: 'script', priority: 'high' },
  { src: '/images/telegram.svg', type: 'image', priority: 'critical' },
];

vi.mock('../../src/systems/assets/routeSectionAssetPreloadEntries.js', () => ({
  getAssetPreloadEntriesForSection: vi.fn(() => ({ assets: rollupAssets, routeCount: 2 })),
}));

describe('assetPreloader section + resolve helpers (§23)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    autoResolveLinkPreloads();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => ({}) });
  });

  it('resolveAssetPreloadUrl resolves flag via library', async () => {
    const lib = await loadProductionAssetLibrary();
    const { resolveAssetPreloadUrl } = await import('../../src/systems/assets/assetPreloader.js');
    const url = await resolveAssetPreloadUrl({ flag: 'script.cognito' }, 'auth');
    expect(url).toBe('/vendor/amazon-cognito-identity-6.3.15.min.js');
    expect(lib).toBeTruthy();
  });

  it('resolveAssetPreloadUrl null when flag missing', async () => {
    await loadProductionAssetLibrary();
    const { resolveAssetPreloadUrl } = await import('../../src/systems/assets/assetPreloader.js');
    expect(await resolveAssetPreloadUrl({ flag: 'missing.flag' })).toBeNull();
  });

  it('resolveAssetPreloadUrl passes sectionName scope', async () => {
    await loadProductionAssetLibrary();
    const { resolveAssetPreloadUrl } = await import('../../src/systems/assets/assetPreloader.js');
    const url = await resolveAssetPreloadUrl({ flag: 'script.cognito' }, 'auth');
    expect(url).toBeTruthy();
  });

  it('resolveAssetPreloadUrls batch', async () => {
    await loadProductionAssetLibrary();
    const { resolveAssetPreloadUrls } = await import('../../src/systems/assets/assetPreloader.js');
    const urls = await resolveAssetPreloadUrls([
      { flag: 'script.cognito' },
      { src: '/assets/direct.svg' },
    ]);
    expect(urls.length).toBe(2);
  });

  it('enrichAssetsWithPreloadUrls adds url field', async () => {
    await loadProductionAssetLibrary();
    const { enrichAssetsWithPreloadUrls } = await import('../../src/systems/assets/assetPreloader.js');
    const { assets } = await enrichAssetsWithPreloadUrls([{ flag: 'script.cognito' }]);
    expect(assets[0].src).toBe('/vendor/amazon-cognito-identity-6.3.15.min.js');
  });

  it('enrichAssetsWithPreloadUrls preserves flag priority type', async () => {
    await loadProductionAssetLibrary();
    const { enrichAssetsWithPreloadUrls } = await import('../../src/systems/assets/assetPreloader.js');
    const input = [{ flag: 'script.cognito', type: 'script', priority: 'high' }];
    const { assets } = await enrichAssetsWithPreloadUrls(input);
    expect(assets[0].flag).toBe('script.cognito');
    expect(assets[0].type).toBe('script');
    expect(assets[0].priority).toBe('high');
  });

  it('areSectionAssetUrlsFullyPreloaded true when all cached', async () => {
    const { areSectionAssetUrlsFullyPreloaded } = await import('../../src/systems/assets/assetPreloader.js');
    const store = usePreloadStore();
    store.addPreloadedAsset('/assets/a.svg');
    store.addPreloadedAsset('/assets/b.svg');
    expect(areSectionAssetUrlsFullyPreloaded(['/assets/a.svg', '/assets/b.svg'])).toBe(true);
  });

  it('areSectionAssetUrlsFullyPreloaded false when any missing', async () => {
    const { areSectionAssetUrlsFullyPreloaded } = await import('../../src/systems/assets/assetPreloader.js');
    usePreloadStore().addPreloadedAsset('/assets/a.svg');
    expect(areSectionAssetUrlsFullyPreloaded(['/assets/a.svg', '/assets/missing.svg'])).toBe(false);
  });

  it('preloadSectionAssets loads rollup entries', async () => {
    await loadProductionAssetLibrary();
    const { preloadSectionAssets } = await import('../../src/systems/assets/assetPreloader.js');
    await preloadSectionAssets('auth');
    expect(document.querySelector('link[href="/vendor/amazon-cognito-identity-6.3.15.min.js"]')).toBeTruthy();
  });

  it('preloadSectionAssets skips unresolved URLs', async () => {
    const { getAssetPreloadEntriesForSection } = await import(
      '../../src/systems/assets/routeSectionAssetPreloadEntries.js',
    );
    getAssetPreloadEntriesForSection.mockReturnValueOnce({
      assets: [{ flag: 'missing.flag', type: 'image', priority: 'normal' }],
      routeCount: 1,
    });
    await loadProductionAssetLibrary();
    const { preloadSectionAssets } = await import('../../src/systems/assets/assetPreloader.js');
    await expect(preloadSectionAssets('auth')).resolves.toBeUndefined();
  });

  it('preloadSectionCriticalImages only critical tier', async () => {
    await loadProductionAssetLibrary();
    const { preloadSectionCriticalImages } = await import('../../src/systems/assets/assetPreloader.js');
    await preloadSectionCriticalImages('auth');
    expect(document.querySelector('link[href="/images/telegram.svg"]')).toBeTruthy();
  });

  it('preloadSectionCriticalImages uses section rollup', async () => {
    const { getAssetPreloadEntriesForSection } = await import(
      '../../src/systems/assets/routeSectionAssetPreloadEntries.js',
    );
    await loadProductionAssetLibrary();
    const { preloadSectionCriticalImages } = await import('../../src/systems/assets/assetPreloader.js');
    await preloadSectionCriticalImages('auth');
    expect(getAssetPreloadEntriesForSection).toHaveBeenCalledWith('auth');
  });
});
