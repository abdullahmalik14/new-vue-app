import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

describe('temporary page locale (F-03)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    sessionStorage.clear();
    vi.resetModules();
  });

  it('stores and reads temp locale keys', async () => {
    const {
      TEMP_LOCALE_SESSION_KEY,
      TEMP_LOCALE_BASE_KEY,
      getTemporaryPageLocale,
      isTemporaryPageLocaleActive,
    } = await import('@/systems/i18n/localeManager.js');

    sessionStorage.setItem(TEMP_LOCALE_BASE_KEY, 'en');
    sessionStorage.setItem(TEMP_LOCALE_SESSION_KEY, 'vi');

    expect(getTemporaryPageLocale()).toBe('vi');
    expect(isTemporaryPageLocaleActive()).toBe(true);
  });

  it('clearTemporaryPageLocaleOnReload clears keys on reload navigation', async () => {
    const {
      TEMP_LOCALE_SESSION_KEY,
      TEMP_LOCALE_BASE_KEY,
      clearTemporaryPageLocaleOnReload,
    } = await import('@/systems/i18n/localeManager.js');

    sessionStorage.setItem(TEMP_LOCALE_SESSION_KEY, 'vi');
    sessionStorage.setItem(TEMP_LOCALE_BASE_KEY, 'en');

    vi.stubGlobal('performance', {
      getEntriesByType: () => [{ type: 'reload' }],
    });

    clearTemporaryPageLocaleOnReload();

    expect(sessionStorage.getItem(TEMP_LOCALE_SESSION_KEY)).toBeNull();
    expect(sessionStorage.getItem(TEMP_LOCALE_BASE_KEY)).toBeNull();

    vi.unstubAllGlobals();
  });

  it('syncTemporaryPageLocaleFromUrl records temp locale when URL differs from persisted en', async () => {
    const { useLocaleStore } = await import('@/stores/useLocaleStore.js');
    useLocaleStore().setLocale('en');

    const {
      TEMP_LOCALE_SESSION_KEY,
      TEMP_LOCALE_BASE_KEY,
      syncTemporaryPageLocaleFromUrl,
      getTemporaryPageLocale,
    } = await import('@/systems/i18n/localeManager.js');

    syncTemporaryPageLocaleFromUrl('vi');

    expect(getTemporaryPageLocale()).toBe('vi');
    expect(sessionStorage.getItem(TEMP_LOCALE_BASE_KEY)).toBe('en');
    expect(sessionStorage.getItem(TEMP_LOCALE_SESSION_KEY)).toBe('vi');
  });

  it('syncTemporaryPageLocaleFromUrl clears temp keys when URL matches persisted locale', async () => {
    const { useLocaleStore } = await import('@/stores/useLocaleStore.js');
    useLocaleStore().setLocale('da');

    const {
      TEMP_LOCALE_SESSION_KEY,
      TEMP_LOCALE_BASE_KEY,
      syncTemporaryPageLocaleFromUrl,
      getTemporaryPageLocale,
    } = await import('@/systems/i18n/localeManager.js');

    sessionStorage.setItem(TEMP_LOCALE_BASE_KEY, 'da');
    sessionStorage.setItem(TEMP_LOCALE_SESSION_KEY, 'vi');

    syncTemporaryPageLocaleFromUrl('da');

    expect(getTemporaryPageLocale()).toBeNull();
    expect(sessionStorage.getItem(TEMP_LOCALE_SESSION_KEY)).toBeNull();
    expect(sessionStorage.getItem(TEMP_LOCALE_BASE_KEY)).toBeNull();
  });

  it('resolveLocaleForUrlInjection prefers temporary locale over persisted store', async () => {
    const { useLocaleStore } = await import('@/stores/useLocaleStore.js');
    useLocaleStore().setLocale('en');

    const {
      TEMP_LOCALE_SESSION_KEY,
      TEMP_LOCALE_BASE_KEY,
      resolveLocaleForUrlInjection,
    } = await import('@/systems/i18n/localeManager.js');

    sessionStorage.setItem(TEMP_LOCALE_BASE_KEY, 'en');
    sessionStorage.setItem(TEMP_LOCALE_SESSION_KEY, 'vi');

    expect(resolveLocaleForUrlInjection()).toBe('vi');
  });

  it('reapplyTemporaryPageLocaleForRoute resolves when no temporary locale is active', async () => {
    const { reapplyTemporaryPageLocaleForRoute } = await import('@/systems/i18n/localeManager.js');
    await expect(reapplyTemporaryPageLocaleForRoute('/dashboard')).resolves.toBeUndefined();
  });
});
