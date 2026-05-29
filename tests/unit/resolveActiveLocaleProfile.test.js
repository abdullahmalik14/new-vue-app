import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

describe('resolveActiveLocale profile priority', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.performanceTracker = { step: vi.fn() };
    localStorage.clear();
    vi.resetModules();
  });

  it('prefers Cognito profile locale over stale persisted localStorage', async () => {
    const { useLocaleStore } = await import('@/stores/useLocaleStore.js');
    const { useAuthStore } = await import('@/stores/useAuthStore.js');
    const { resolveActiveLocale } = await import('@/utils/translation/localeManager.js');

    const localeStore = useLocaleStore();
    localeStore.setLocale('am');

    const auth = useAuthStore();
    auth.idToken = 'token';
    auth.currentUser = {
      email: 'u@test.com',
      preferredLocale: 'en',
      raw: { 'custom:preferred_locale': 'en' },
    };

    window.history.replaceState({}, '', '/dashboard');

    expect(resolveActiveLocale()).toBe('en');
    expect(localeStore.locale).toBe('en');
  });
});
