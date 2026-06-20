import { describe, expect, it } from 'vitest';

describe('systems/assets barrel exports (§93)', () => {
  it('re-exports direct asset helpers', async () => {
    const barrel = await import('../../src/systems/assets/index.js');
    const assetLibrary = await import('../../src/systems/assets/assetLibrary.js');
    const assetPreloader = await import('../../src/systems/assets/assetPreloader.js');
    const routeSectionAssetPreloadEntries = await import('../../src/systems/assets/routeSectionAssetPreloadEntries.js');
    const assetPolicy = await import('../../src/systems/assets/assetPolicy.js');

    expect(barrel.getAssetUrl).toBe(assetLibrary.getAssetUrl);
    expect(barrel.preloadAsset).toBe(assetPreloader.preloadAsset);
    expect(barrel.getAssetPreloadEntriesForSection).toBe(routeSectionAssetPreloadEntries.getAssetPreloadEntriesForSection);
    expect(barrel.validateRouteAssetPreloadFlags).toBe(assetPolicy.validateRouteAssetPreloadFlags);
  });

  it('re-exports shared component asset helpers', async () => {
    const barrel = await import('../../src/systems/assets/index.js');
    const sharedAssets = await import('../../src/systems/assets/resolveSharedComponentAssets.js');

    expect(barrel.resolveSharedComponentAssets).toBe(sharedAssets.resolveSharedComponentAssets);
    expect(barrel.getSharedComponentAssetMapping).toBe(sharedAssets.getSharedComponentAssetMapping);
    expect(barrel.groupComponentSlotsByPreloadTier).toBe(sharedAssets.groupComponentSlotsByPreloadTier);
  });

  it('re-exports resetAssetLibrary', async () => {
    const barrel = await import('../../src/systems/assets/index.js');
    const resetAssetLibrary = await import('../../src/systems/assets/resetAssetLibrary.js');

    expect(barrel.resetAssetLibrary).toBe(resetAssetLibrary.resetAssetLibrary);
    expect(barrel.resetAssetSystem).toBe(resetAssetLibrary.resetAssetSystem);
  });

  it('does not duplicate or leak assetMapSource exports', async () => {
    const barrel = await import('../../src/systems/assets/index.js');
    const exportNames = Object.keys(barrel);

    expect(new Set(exportNames).size).toBe(exportNames.length);
    expect('getBundledAssetMap' in barrel).toBe(false);
    expect('loadSectionAssetMap' in barrel).toBe(true);
  });
});
import { describe, expect, it, vi } from 'vitest';

describe('assets index barrel (§93)', () => {
  it('re-exports getAssetUrl from assetLibrary', async () => {
    const assets = await import('../../src/systems/assets/index.js');
    expect(assets.getAssetUrl).toBeDefined();
    expect(assets.getAssetUrl.name).toBe('getAssetUrl');
  });

  it('re-exports preloadAsset from assetPreloader', async () => {
    const assets = await import('../../src/systems/assets/index.js');
    expect(assets.preloadAsset).toBeDefined();
    expect(assets.preloadImage).toBeDefined();
  });

  it('re-exports getAssetPreloadEntriesForSection', async () => {
    const assets = await import('../../src/systems/assets/index.js');
    expect(typeof assets.getAssetPreloadEntriesForSection).toBe('function');
  });

  it('re-exports validateRouteAssetPreloadFlags', async () => {
    const assets = await import('../../src/systems/assets/index.js');
    expect(typeof assets.validateRouteAssetPreloadFlags).toBe('function');
  });

  it('re-exports resolveSharedComponentAssets', async () => {
    const assets = await import('../../src/systems/assets/index.js');
    expect(typeof assets.resolveSharedComponentAssets).toBe('function');
  });

  it('re-exports resetAssetLibrary', async () => {
    const assets = await import('../../src/systems/assets/index.js');
    expect(typeof assets.resetAssetLibrary).toBe('function');
    expect(typeof assets.resetAssetSystem).toBe('function');
  });

  it('no duplicate export names', async () => {
    vi.resetModules();
    const module = await import('../../src/systems/assets/index.js');
    const exportNames = Object.keys(module);
    const unique = new Set(exportNames);

    expect(unique.size).toBe(exportNames.length);
  });

  it('assetMapSource not in barrel (intentional)', async () => {
    const assets = await import('../../src/systems/assets/index.js');
    expect('getBundledAssetMap' in assets).toBe(false);
    expect('shouldAllowRuntimeAssetMapFetch' in assets).toBe(false);
  });
});
