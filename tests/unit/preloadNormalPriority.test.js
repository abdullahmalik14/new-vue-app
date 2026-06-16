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

describe('preload normal priority (C-03)', () => {
  beforeEach(() => {
    vi.resetModules();
    setActivePinia(createPinia());
    document.head.innerHTML = '';
    window.performanceTracker = { step: vi.fn() };
  });

  it('schedules high-priority assets before normal-priority assets', async () => {
    autoResolveLinkPreloads();
    const { preloadAssets } = await import('../../src/systems/assets/assetPreloader.js');

    await preloadAssets([
      { src: '/assets/icon-normal.png', type: 'image', priority: 'normal' },
      { src: '/assets/logo-high.png', type: 'image', priority: 'high' },
    ]);

    const links = [...document.querySelectorAll('link[href="/assets/icon-normal.png"], link[href="/assets/logo-high.png"]')];
    const order = links.map((link) => (link.getAttribute('href')?.includes('logo-high') ? 'high' : 'normal'));

    expect(order).toEqual(['high', 'normal']);
    expect(document.querySelector('link[href="/assets/logo-high.png"]')?.rel).toBe('preload');
    expect(document.querySelector('link[href="/assets/icon-normal.png"]')?.rel).toBe('prefetch');
  });

  it('maps normal route priority to fetchpriority=auto on image links', async () => {
    autoResolveLinkPreloads();
    const { preloadImage } = await import('../../src/systems/assets/assetPreloader.js');
    const url = '/assets/icon-normal.png';

    await preloadImage(url, { priority: 'normal' });

    const link = document.querySelector(`link[href="${url}"]`);
    expect(link?.getAttribute('fetchpriority')).toBe('auto');
  });
});
