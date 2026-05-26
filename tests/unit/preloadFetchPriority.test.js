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

describe('preload fetchpriority (M-02)', () => {
  beforeEach(() => {
    vi.resetModules();
    setActivePinia(createPinia());
    document.head.innerHTML = '';
    window.performanceTracker = { step: vi.fn() };
  });

  it('maps critical/high route priority to fetchpriority=high on image links', async () => {
    autoResolveLinkPreloads();
    const { preloadImage } = await import('../../src/utils/assets/assetPreloader.js');
    const url = '/assets/icon-high.png';

    await preloadImage(url, { priority: 'high' });

    const link = document.querySelector(`link[href="${url}"]`);
    expect(link?.getAttribute('fetchpriority')).toBe('high');
  });

  it('maps low route priority to fetchpriority=low on image links', async () => {
    autoResolveLinkPreloads();
    const { preloadImage } = await import('../../src/utils/assets/assetPreloader.js');
    const url = '/assets/icon-low.png';

    await preloadImage(url, { priority: 'low' });

    const link = document.querySelector(`link[href="${url}"]`);
    expect(link?.getAttribute('fetchpriority')).toBe('low');
  });

  it('maps medium/normal route priority to fetchpriority=auto on script links', async () => {
    autoResolveLinkPreloads();
    const { preloadScript } = await import('../../src/utils/assets/assetPreloader.js');
    const url = '/vendor/amazon-cognito-identity-6.3.15.min.js';

    await preloadScript(url, { priority: 'medium' });

    const link = document.querySelector(`link[href="${url}"]`);
    expect(link?.getAttribute('fetchpriority')).toBe('auto');
  });

  it('resolveFetchPriority honors explicit fetchPriority override', async () => {
    const { resolveFetchPriority } = await import('../../src/utils/assets/assetPreloader.js');

    expect(resolveFetchPriority({ priority: 'high', fetchPriority: 'low' })).toBe('low');
  });
});
