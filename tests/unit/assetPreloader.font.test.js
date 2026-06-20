import { beforeEach, describe, expect, it } from 'vitest';
import { autoResolveLinkPreloads, setupAssetTestEnv } from '../helpers/assetFixtures.js';

describe('preloadFont (§17)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
  });

  it('preloadFont: loads font', async () => {
    autoResolveLinkPreloads();
    const { preloadFont } = await import('../../src/systems/assets/assetPreloader.js');
    const url = '/assets/fonts/primary.woff2';
    await preloadFont(url);
    expect(document.querySelector(`link[href="${url}"]`)).toBeTruthy();
  });

  it('preloadFont: duplicate skipped', async () => {
    autoResolveLinkPreloads();
    const { preloadFont } = await import('../../src/systems/assets/assetPreloader.js');
    const url = '/assets/fonts/dup.woff2';
    await preloadFont(url);
    await preloadFont(url);
    expect(document.querySelectorAll(`link[href="${url}"]`).length).toBe(1);
  });

  it('preloadFont: invalid rejects', async () => {
    const { preloadFont } = await import('../../src/systems/assets/assetPreloader.js');
    await expect(preloadFont('javascript:alert(1)')).resolves.toBeUndefined();
    expect(document.querySelectorAll('link').length).toBe(0);
  });
});
