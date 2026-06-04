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

  it('blocks javascript: URLs without injecting a link (S-03)', async () => {
    autoResolveLinkPreloads();
    const { preloadScript } = await import('../../src/utils/assets/assetPreloader.js');

    await preloadScript('javascript:alert(1)');

    expect(document.querySelectorAll('link').length).toBe(0);
  });

  it('sets integrity when provided for allowed scripts (S-03)', async () => {
    autoResolveLinkPreloads();
    const { preloadScript } = await import('../../src/utils/assets/assetPreloader.js');
    const url = '/vendor/amazon-cognito-identity-6.3.15.min.js';

    await preloadScript(url, { integrity: 'sha384-test' });

    const link = document.querySelector(`link[href="${url}"]`);
    expect(link?.integrity).toBe('sha384-test');
  });

  it('injects executable scripts with location/defer/flags metadata (C-08)', async () => {
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag, options) => {
      const el = originalCreateElement(tag, options);
      if (tag === 'script') {
        queueMicrotask(() => {
          if (typeof el.onload === 'function') {
            el.onload();
          }
        });
      }
      return el;
    });

    const { preloadScript } = await import('../../src/utils/assets/assetPreloader.js');
    const url = '/scripts/dashboard-metrics.js';

    await preloadScript(url, {
      name: 'dashboard-metrics-lib',
      location: 'head-last',
      defer: true,
      async: false,
      flags: ['dashboard-metrics'],
    });

    const script = document.querySelector(`script[src="${url}"]`);
    expect(script).toBeTruthy();
    expect(script?.defer).toBe(true);
    expect(script?.async).toBeFalsy();
    expect(script?.dataset.assetName).toBe('dashboard-metrics-lib');
    expect(script?.dataset.assetFlags).toBe('dashboard-metrics');
    expect(document.querySelectorAll(`link[href="${url}"]`).length).toBe(0);
  });
});
