import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

describe('withPreloadRetry (M-06)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retries failed operations with exponential backoff', async () => {
    const { withPreloadRetry } = await import('../../src/utils/assets/assetPreloader.js');
    let attempts = 0;

    const promise = withPreloadRetry(async () => {
      attempts += 1;
      if (attempts < 3) {
        throw new Error('transient failure');
      }
      return 'ok';
    }, { maxRetries: 2, baseDelayMs: 100 });

    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBe('ok');
    expect(attempts).toBe(3);
  });
});

describe('preloadImage retry (M-06)', () => {
  beforeEach(() => {
    vi.resetModules();
    setActivePinia(createPinia());
    document.head.innerHTML = '';
    window.performanceTracker = { step: vi.fn() };
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retries after link onerror and succeeds on a later attempt', async () => {
    const originalCreateElement = document.createElement.bind(document);
    let linkCount = 0;

    vi.spyOn(document, 'createElement').mockImplementation((tag, options) => {
      const element = originalCreateElement(tag, options);

      if (tag === 'link') {
        linkCount += 1;
        queueMicrotask(() => {
          if (linkCount === 1 && typeof element.onerror === 'function') {
            element.onerror(new Event('error'));
          } else if (typeof element.onload === 'function') {
            element.onload(new Event('load'));
          }
        });
      }

      return element;
    });

    const { preloadImage } = await import('../../src/utils/assets/assetPreloader.js');
    const url = '/assets/retry-icon.png';
    const preloadPromise = preloadImage(url, { priority: 'high' });

    await vi.runAllTimersAsync();
    await preloadPromise;

    expect(linkCount).toBe(2);
    expect(document.querySelectorAll(`link[href="${url}"]`).length).toBe(1);
  });
});
