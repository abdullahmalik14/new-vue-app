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

describe('preloadScript (P-07)', () => {
  beforeEach(() => {
    vi.resetModules();
    setActivePinia(createPinia());
    document.head.innerHTML = '';
    window.performanceTracker = { step: vi.fn() };
  });

  it('uses rel=preload as=script for classic UMD scripts', async () => {
    autoResolveLinkPreloads();
    const { preloadScript } = await import('../../src/utils/assets/assetPreloader.js');
    const url = '/vendor/amazon-cognito-identity-6.3.15.min.js';

    await preloadScript(url);

    const link = document.querySelector(`link[href="${url}"]`);
    expect(link?.rel).toBe('preload');
    expect(link?.getAttribute('as')).toBe('script');
  });

  it('uses modulepreload when options.module is true', async () => {
    autoResolveLinkPreloads();
    const { preloadScript } = await import('../../src/utils/assets/assetPreloader.js');
    const url = '/assets/chunk.mjs';

    await preloadScript(url, { module: true });

    const link = document.querySelector(`link[href="${url}"]`);
    expect(link?.rel).toBe('modulepreload');
    expect(link?.getAttribute('as')).toBeNull();
  });
});
