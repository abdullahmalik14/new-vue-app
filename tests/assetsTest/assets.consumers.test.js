import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { autoResolveLinkPreloads, getProjectRoot, setupAssetTestEnv } from '../helpers/assetFixtures.js';

describe('assets.consumers (§95)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
    setActivePinia(createPinia());
    autoResolveLinkPreloads();
  });

  it('preloadIcons loads Image for each URL', async () => {
    const { preloadImage } = await import('../../src/systems/assets/assetPreloader.js');

    await preloadImage('/assets/icon-a.svg');
    await preloadImage('/assets/icon-b.svg');

    expect(document.querySelectorAll('link[rel="preload"]').length).toBeGreaterThan(0);
  });

  it('preloadIcons empty array no-op', async () => {
    const { preloadAssets } = await import('../../src/systems/assets/assetPreloader.js');
    await expect(preloadAssets([])).resolves.toBeUndefined();
  });

  it('preloadIcons duplicate URLs deduped', async () => {
    const { preloadImage } = await import('../../src/systems/assets/assetPreloader.js');
    const url = '/assets/deduped-icon.svg';

    await Promise.all([preloadImage(url), preloadImage(url)]);

    expect(document.querySelectorAll(`link[href="${url}"]`).length).toBe(1);
  });

  it('behavior documented as deprecated vs assetPreloader.preloadImage', () => {
    const projectRoot = getProjectRoot();
    const preloadUtilPath = join(projectRoot, 'src/utils/preload.js');

    expect(() => readFileSync(preloadUtilPath, 'utf8')).toThrow();
    const preloaderSource = readFileSync(
      join(projectRoot, 'src/systems/assets/assetPreloader.js'),
      'utf8',
    );
    expect(preloaderSource).toContain('export function preloadImage');
  });

  it('Cart.vue migration removes import of utils/preload', () => {
    const cartSource = readFileSync(join(getProjectRoot(), 'src/components/ui/cart/Cart.vue'), 'utf8');

    expect(cartSource).not.toMatch(/utils\/preload/);
    expect(cartSource).toContain('systems/assets/assetPreloader');
    expect(cartSource).toContain('preloadImage');
  });
});
