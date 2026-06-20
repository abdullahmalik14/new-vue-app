import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AssetHandler from '../../src/systems/assets/assetHandler.js';

const config = [
  { name: 'dep-a', url: '/a.js', type: 'script', flags: ['group1'] },
  { name: 'dep-b', url: '/b.js', type: 'script', flags: ['group1'], dependencies: ['dep-a'] },
  { name: 'dep-c', url: '/c.js', type: 'script', flags: ['group2'] },
];

function createHandler() {
  return new AssetHandler(config);
}

describe('AssetHandler dependency APIs', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    globalThis.CSS = { escape: (value) => String(value) };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports missing named dependencies as pending', () => {
    const handler = createHandler();

    expect(handler.areAssetDependenciesReady(['dep-a'])).toEqual({
      ready: false,
      pending: ['dep-a'],
    });
  });

  it('reports DOM-loaded dependencies as ready', () => {
    const handler = createHandler();
    const script = document.createElement('script');
    script.setAttribute('data-asset-name', 'dep-a');
    document.head.appendChild(script);

    expect(handler.areAssetDependenciesReady(['dep-a'])).toEqual({
      ready: true,
      pending: [],
    });
  });

  it('_normalizeDependencyInput splits string, flag, and name prefixes', () => {
    const handler = createHandler();

    expect(handler._normalizeDependencyInput(['dep-a', 'flag:group1', 'name:dep-c'])).toEqual({
      names: ['dep-a', 'dep-c'],
      flags: ['group1'],
    });
  });

  it('_normalizeDependencyInput reads object dependency values', () => {
    const handler = createHandler();

    expect(handler._normalizeDependencyInput([
      { type: 'name', value: 'dep-a' },
      { type: 'flag', value: 'group2' },
    ])).toEqual({
      names: ['dep-a'],
      flags: ['group2'],
    });
  });

  it('ensureAssetDependencies loads matching named dependencies', async () => {
    const handler = createHandler();
    vi.spyOn(handler, '_loadAssetsWithPipeline').mockImplementation(async (assets) => {
      assets.forEach((asset) => handler.loadedAssets.add(asset.name));
      return assets.map((asset) => ({ name: asset.name, type: asset.type, url: asset.url }));
    });

    await expect(handler.ensureAssetDependencies(['dep-a'])).resolves.toMatchObject({
      satisfied: ['dep-a'],
      attempted: ['dep-a'],
      triggeredLoads: ['dep-a'],
    });
  });

  it('ensureAssetDependencies loads matching flag dependencies', async () => {
    const handler = createHandler();
    vi.spyOn(handler, '_loadAssetsWithPipeline').mockImplementation(async (assets) => {
      assets.forEach((asset) => handler.loadedAssets.add(asset.name));
      return assets.map((asset) => ({ name: asset.name, type: asset.type, url: asset.url }));
    });

    await expect(handler.ensureAssetDependencies(['flag:group1'])).resolves.toMatchObject({
      satisfied: ['dep-a', 'dep-b'],
      attempted: ['dep-a', 'dep-b'],
      triggeredLoads: ['dep-a', 'dep-b'],
    });
  });

  it('ensureAssetDependencies skips unknown dependencies', async () => {
    const handler = createHandler();

    await expect(handler.ensureAssetDependencies(['missing-dependency'])).resolves.toEqual({
      satisfied: [],
      failed: [],
      alreadyReady: [],
      attempted: [],
      triggeredLoads: [],
      skipped: true,
    });
  });

  it('ensureAssetDependencies supports both strict and non-strict failure handling', async () => {
    const handler = createHandler();
    vi.spyOn(handler, '_loadAssetsWithPipeline').mockResolvedValue([]);

    await expect(handler.ensureAssetDependencies(['dep-a'], { strict: true })).rejects.toThrow(
      'Asset dependencies not satisfied: dep-a',
    );

    const result = await handler.ensureAssetDependencies(['dep-a'], { strict: false });
    expect(result.failed).toEqual(['dep-a']);
    expect(result.triggeredLoads).toEqual(['dep-a']);
  });

  it('getAssetByName returns the matching asset or null', () => {
    const handler = createHandler();

    expect(handler.getAssetByName('dep-b')).toMatchObject({ name: 'dep-b' });
    expect(handler.getAssetByName('missing')).toBeNull();
  });
});
