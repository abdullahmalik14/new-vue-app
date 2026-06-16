import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

function autoResolveLinkPreloads() {
  const originalCreateElement = document.createElement.bind(document);
  return vi.spyOn(document, 'createElement').mockImplementation((tag, options) => {
    const el = originalCreateElement(tag, options);
    if (tag === 'link') {
      queueMicrotask(() => {
        if (typeof el.onload === 'function') {
          el.onload();
        }
      });
    }
    return el;
  });
}

describe('assetPreloader performanceTracker guards (B-02)', () => {
  beforeEach(() => {
    vi.resetModules();
    setActivePinia(createPinia());
    document.head.innerHTML = '';
    delete window.performanceTracker;
  });

  it('preloadImage does not throw when performanceTracker is missing', async () => {
    autoResolveLinkPreloads();
    const { preloadImage } = await import('../../src/systems/assets/assetPreloader.js');
    await expect(preloadImage('/assets/test-icon.webp')).resolves.toBeUndefined();
  });

  it('preloadScript does not throw when performanceTracker is missing', async () => {
    autoResolveLinkPreloads();
    const { preloadScript } = await import('../../src/systems/assets/assetPreloader.js');
    await expect(
      preloadScript('/vendor/amazon-cognito-identity-6.3.15.min.js'),
    ).resolves.toBeUndefined();
  });

  it('preloadSectionAssets does not throw when performanceTracker is missing', async () => {
    autoResolveLinkPreloads();
    const { preloadSectionAssets } = await import('../../src/systems/assets/assetPreloader.js');
    await expect(preloadSectionAssets('auth')).resolves.toBeUndefined();
  });

  it('extractAssetsFromComponent does not throw when performanceTracker is missing', async () => {
    const { extractAssetsFromComponent } = await import('../../src/systems/assets/assetScanner.js');
    expect(extractAssetsFromComponent({ preloadAssets: [{ src: '/x.png', type: 'image' }] })).toEqual([
      { src: '/x.png', type: 'image' },
    ]);
  });

  it('scanSectionComponents does not throw when performanceTracker is missing', async () => {
    const { scanSectionComponents } = await import('../../src/systems/assets/assetScanner.js');
    const assets = await scanSectionComponents('auth');
    expect(Array.isArray(assets)).toBe(true);
  });
});
