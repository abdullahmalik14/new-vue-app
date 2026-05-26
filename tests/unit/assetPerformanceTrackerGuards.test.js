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

describe('asset modules performanceTracker guards (B-01)', () => {
  beforeEach(() => {
    vi.resetModules();
    setActivePinia(createPinia());
    document.head.innerHTML = '';
    delete window.performanceTracker;
  });

  it('preloadImage does not throw when performanceTracker is missing', async () => {
    autoResolveLinkPreloads();
    const { preloadImage } = await import('../../src/utils/assets/assetPreloader.js');
    await expect(preloadImage('/assets/test-icon.webp')).resolves.toBeUndefined();
  });

  it('extractAssetsFromComponent does not throw when performanceTracker is missing', async () => {
    const { extractAssetsFromComponent } = await import('../../src/utils/assets/assetScanner.js');
    expect(extractAssetsFromComponent({ preloadAssets: [{ src: '/x.png', type: 'image' }] })).toEqual([
      { src: '/x.png', type: 'image' },
    ]);
  });

  it('scanSectionComponents does not throw when performanceTracker is missing', async () => {
    const { scanSectionComponents } = await import('../../src/utils/assets/assetScanner.js');
    const assets = await scanSectionComponents('auth');
    expect(Array.isArray(assets)).toBe(true);
  });
});
