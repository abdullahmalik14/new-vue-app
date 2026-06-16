import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

describe('resolveActiveLocaleForNavigation (L-09)', () => {
  const originalPathname = window.location.pathname;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetModules();
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    window.history.replaceState({}, '', originalPathname || '/');
    sessionStorage.clear();
    localStorage.clear();
  });

  it('uses destination route path when window.location is still the previous URL', async () => {
    window.history.replaceState({}, '', '/log-in');

    const { useLocaleStore } = await import('@/stores/useLocaleStore.js');
    useLocaleStore().setLocale('en');

    const { resolveActiveLocaleForNavigation, resolveActiveLocale } = await import(
      '@/systems/i18n/localeManager.js'
    );

    const to = { path: '/vi/log-in', params: { locale: 'vi' } };

    expect(resolveActiveLocaleForNavigation(to)).toBe('vi');
    expect(resolveActiveLocale()).toBe('en');
  });

  it('uses temporary page locale when destination path has no locale prefix', async () => {
    window.history.replaceState({}, '', '/dashboard');

    const {
      TEMP_LOCALE_SESSION_KEY,
      resolveActiveLocaleForNavigation,
    } = await import('@/systems/i18n/localeManager.js');

    sessionStorage.setItem(TEMP_LOCALE_SESSION_KEY, 'vi');

    expect(resolveActiveLocaleForNavigation({ path: '/dashboard', params: {} })).toBe('vi');
  });
});
