import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('temporary page locale (F-03)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.resetModules();
  });

  it('stores and reads temp locale keys', async () => {
    const {
      TEMP_LOCALE_SESSION_KEY,
      TEMP_LOCALE_BASE_KEY,
      getTemporaryPageLocale,
      isTemporaryPageLocaleActive,
    } = await import('@/utils/translation/localeManager.js');

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
    } = await import('@/utils/translation/localeManager.js');

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
});
