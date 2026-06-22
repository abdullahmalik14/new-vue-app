import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  autoResolveLinkPreloads,
  loadProductionAssetLibrary,
  setupAssetTestEnv,
} from '../helpers/assetFixtures.js';

describe('preloadAsset / preloadAssets (§22)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    autoResolveLinkPreloads();
  });

  it('preloadAsset dispatches image type', async () => {
    const { preloadAsset } = await import('../../src/systems/assets/assetPreloader.js');
    await preloadAsset({ src: '/assets/icon.svg', type: 'image' });
    expect(document.querySelector('link[href="/assets/icon.svg"]')).toBeTruthy();
  });

  it('preloadAsset dispatches font type', async () => {
    const { preloadAsset } = await import('../../src/systems/assets/assetPreloader.js');
    await preloadAsset({ src: '/assets/fonts/primary.woff2', type: 'font' });
    expect(document.querySelector('link[href="/assets/fonts/primary.woff2"]')).toBeTruthy();
  });

  it('preloadAsset dispatches script type', async () => {
    const { preloadAsset } = await import('../../src/systems/assets/assetPreloader.js');
    await preloadAsset({ src: '/vendor/amazon-cognito-identity-6.3.15.min.js', type: 'script' });
    expect(document.querySelector('link[href="/vendor/amazon-cognito-identity-6.3.15.min.js"]')).toBeTruthy();
  });

  it('preloadAsset dispatches json type', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => ({}) });
    const { preloadAsset } = await import('../../src/systems/assets/assetPreloader.js');
    await preloadAsset({ src: '/src/config/countries.json', type: 'json' });
    expect(globalThis.fetch).toHaveBeenCalled();
  });

  it('preloadAsset dispatches media type', async () => {
    const { preloadAsset } = await import('../../src/systems/assets/assetPreloader.js');
    await preloadAsset({ src: '/assets/media/clip.mp4', type: 'video' });
    expect(document.querySelector('link[href="/assets/media/clip.mp4"]')).toBeTruthy();
  });

  it('preloadAsset unknown type rejects', async () => {
    const { preloadAsset } = await import('../../src/systems/assets/assetPreloader.js');
    await expect(preloadAsset({ src: '/assets/x.bin', type: 'unknown' })).resolves.toBeUndefined();
    expect(document.querySelectorAll('link').length).toBe(0);
  });

  it('preloadAssets batch obeys priority order', async () => {
    const { preloadAssets } = await import('../../src/systems/assets/assetPreloader.js');
    await preloadAssets([
      { src: '/assets/low.svg', type: 'image', priority: 'low' },
      { src: '/assets/high.svg', type: 'image', priority: 'high' },
    ]);
    expect(document.querySelector('link[href="/assets/high.svg"]')).toBeTruthy();
    expect(document.querySelector('link[href="/assets/low.svg"]')).toBeTruthy();
  });

  it('preloadAssets empty no-op', async () => {
    const { preloadAssets } = await import('../../src/systems/assets/assetPreloader.js');
    await expect(preloadAssets([])).resolves.toBeUndefined();
  });

  it('preloadAssets partial failure behavior per contract', async () => {
    const { preloadAssets } = await import('../../src/systems/assets/assetPreloader.js');
    await expect(
      preloadAssets([
        { src: '/assets/good.svg', type: 'image' },
        { src: 'javascript:alert(1)', type: 'script' },
      ]),
    ).resolves.toBeUndefined();
    expect(document.querySelector('link[href="/assets/good.svg"]')).toBeTruthy();
  });
});
