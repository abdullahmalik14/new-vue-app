import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

describe('syncCurrentActiveLocaleFromStore (L-12)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetModules();
    window.performanceTracker = { step: vi.fn() };
  });

  it('aligns in-memory locale after direct Pinia setLocale', async () => {
    const { useLocaleStore } = await import('@/stores/useLocaleStore.js');
    const {
      applyLocaleTemporarily,
      getActiveLocale,
      syncCurrentActiveLocaleFromStore,
    } = await import('@/utils/translation/localeManager.js');

    await applyLocaleTemporarily('vi', { loadTranslations: false });

    const store = useLocaleStore();
    store.setLocale('en');
    syncCurrentActiveLocaleFromStore('en');

    expect(getActiveLocale()).toBe('en');
    expect(store.locale).toBe('en');
  });

  it('ignores unsupported locale codes', async () => {
    const {
      getActiveLocale,
      syncCurrentActiveLocaleFromStore,
      setActiveLocale,
    } = await import('@/utils/translation/localeManager.js');

    await setActiveLocale('vi', { updateUrl: false, syncProfile: false });
    syncCurrentActiveLocaleFromStore('not-a-locale');

    expect(getActiveLocale()).toBe('vi');
  });
});
