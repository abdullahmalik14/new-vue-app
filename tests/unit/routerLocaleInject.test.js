import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

describe('router locale inject prefers store over stale URL (L-10 en switch)', () => {
  const originalPathname = window.location.pathname;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetModules();
    window.history.replaceState({}, '', '/vi/log-in');
    window.performanceTracker = { step: vi.fn() };
  });

  afterEach(() => {
    window.history.replaceState({}, '', originalPathname || '/');
  });

  it('getActiveLocale returns en from store while resolveActiveLocale still reads /vi from URL', async () => {
    const { useLocaleStore } = await import('@/stores/useLocaleStore.js');
    useLocaleStore().setLocale('en');

    const { getActiveLocale, resolveActiveLocale } = await import(
      '@/systems/i18n/localeManager.js'
    );

    expect(getActiveLocale()).toBe('en');
    expect(resolveActiveLocale()).toBe('vi');
  });
});
