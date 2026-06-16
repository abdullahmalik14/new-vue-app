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

describe('preload prefetch hint (M-03)', () => {
  beforeEach(() => {
    vi.resetModules();
    setActivePinia(createPinia());
    document.head.innerHTML = '';
    window.performanceTracker = { step: vi.fn() };
  });

  it('uses rel=prefetch for low-priority images', async () => {
    autoResolveLinkPreloads();
    const { preloadImage } = await import('../../src/systems/assets/assetPreloader.js');
    const url = '/assets/bg-low.webp';

    await preloadImage(url, { priority: 'low' });

    const link = document.querySelector(`link[href="${url}"]`);
    expect(link?.rel).toBe('prefetch');
    expect(link?.as).toBe('image');
    expect(link?.getAttribute('fetchpriority')).toBe('low');
  });

  it('uses rel=prefetch for normal-priority images (C-03)', async () => {
    autoResolveLinkPreloads();
    const { preloadImage } = await import('../../src/systems/assets/assetPreloader.js');
    const url = '/assets/bg-normal.webp';

    await preloadImage(url, { priority: 'normal' });

    const link = document.querySelector(`link[href="${url}"]`);
    expect(link?.rel).toBe('prefetch');
    expect(link?.as).toBe('image');
    expect(link?.getAttribute('fetchpriority')).toBe('auto');
  });

  it('uses rel=preload for high-priority images', async () => {
    autoResolveLinkPreloads();
    const { preloadImage } = await import('../../src/systems/assets/assetPreloader.js');
    const url = '/assets/logo-high.png';

    await preloadImage(url, { priority: 'high' });

    const link = document.querySelector(`link[href="${url}"]`);
    expect(link?.rel).toBe('preload');
    expect(link?.as).toBe('image');
  });

  it('uses rel=prefetch for low-priority classic scripts', async () => {
    autoResolveLinkPreloads();
    const { preloadScript } = await import('../../src/systems/assets/assetPreloader.js');
    const url = '/vendor/amazon-cognito-identity-6.3.15.min.js';

    await preloadScript(url, { priority: 'low' });

    const link = document.querySelector(`link[href="${url}"]`);
    expect(link?.rel).toBe('prefetch');
    expect(link?.getAttribute('as')).toBe('script');
  });

  it('dedupes against an existing prefetch link in the DOM', async () => {
    const url = '/assets/already-prefetched.png';
    const existing = document.createElement('link');
    existing.rel = 'prefetch';
    existing.href = url;
    document.head.appendChild(existing);

    autoResolveLinkPreloads();
    const { preloadImage } = await import('../../src/systems/assets/assetPreloader.js');

    await preloadImage(url, { priority: 'low' });

    expect(document.querySelectorAll(`link[href="${url}"]`).length).toBe(1);
  });
});
