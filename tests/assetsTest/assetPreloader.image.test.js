import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePreloadStore } from '../../src/stores/usePreloadStore.js';
import { autoResolveLinkPreloads, setupAssetTestEnv } from '../helpers/assetFixtures.js';

describe('preloadImage (§16)', () => {
  beforeEach(() => {
    setupAssetTestEnv();
  });

  it('preloadImage: valid src resolves', async () => {
    autoResolveLinkPreloads();
    const { preloadImage } = await import('../../src/systems/assets/assetPreloader.js');
    await expect(preloadImage('/assets/icon.svg')).resolves.toBeUndefined();
  });

  it('preloadImage: onload resolves promise', async () => {
    autoResolveLinkPreloads();
    const { preloadImage } = await import('../../src/systems/assets/assetPreloader.js');
    await preloadImage('/assets/icon-onload.svg');
    expect(document.querySelector('link[href="/assets/icon-onload.svg"]')).toBeTruthy();
  });

  it('preloadImage: onerror rejects', async () => {
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag, options) => {
      const element = originalCreateElement(tag, options);
      if (tag === 'link') {
        queueMicrotask(() => element.onerror?.(new Event('error')));
      }
      return element;
    });
    const { preloadImage } = await import('../../src/systems/assets/assetPreloader.js');
    await expect(preloadImage('/assets/icon-error.svg')).rejects.toThrow();
  });

  it('preloadImage: duplicate skipped', async () => {
    autoResolveLinkPreloads();
    const { preloadImage } = await import('../../src/systems/assets/assetPreloader.js');
    const url = '/assets/icon-dup.svg';
    await preloadImage(url);
    await preloadImage(url);
    expect(document.querySelectorAll(`link[href="${url}"]`).length).toBe(1);
  });

  it('preloadImage: crossOrigin set', async () => {
    autoResolveLinkPreloads();
    const { preloadImage } = await import('../../src/systems/assets/assetPreloader.js');
    const url = '/assets/cors-icon.svg';
    await preloadImage(url, { crossOrigin: 'anonymous' });
    const link = document.querySelector(`link[href="${url}"]`);
    expect(link?.getAttribute('crossorigin') ?? link?.crossOrigin).toBe('anonymous');
  });

  it('preloadImage: records in preload store', async () => {
    autoResolveLinkPreloads();
    const { preloadImage } = await import('../../src/systems/assets/assetPreloader.js');
    const url = '/assets/icon-store.svg';
    await preloadImage(url);
    expect(usePreloadStore().hasAsset(url)).toBe(true);
  });
});
