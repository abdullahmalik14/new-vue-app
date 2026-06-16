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

describe('preload URL guard (S-04)', () => {
  beforeEach(() => {
    vi.resetModules();
    setActivePinia(createPinia());
    document.head.innerHTML = '';
    window.performanceTracker = { step: vi.fn() };
  });

  it('preloadImage does not inject link for data: URIs', async () => {
    autoResolveLinkPreloads();
    const { preloadImage } = await import('../../src/systems/assets/assetPreloader.js');

    await preloadImage('data:image/png;base64,abc');

    expect(document.querySelectorAll('link').length).toBe(0);
  });

  it('preloadFont allows same-origin paths', async () => {
    autoResolveLinkPreloads();
    const { preloadFont } = await import('../../src/systems/assets/assetPreloader.js');
    const url = '/assets/fonts/primary.woff2';

    await preloadFont(url);

    expect(document.querySelector(`link[href="${url}"]`)).toBeTruthy();
  });
});
