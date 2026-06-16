import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('@/lib/mock-api-demo/apiWrapper.js', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock('@/systems/i18n/localeManager.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    setActiveLocale: vi.fn(async () => true),
    getActiveLocale: vi.fn(() => 'en'),
    getLeadingLocaleFromPath: vi.fn(() => null),
  };
});

vi.mock('@/systems/i18n/cognitoLocaleProfile.js', () => ({
  isCognitoLocaleProfileEnabled: vi.fn(() => false),
  getPreferredLocaleFromTokenClaims: vi.fn(() => null),
  savePreferredLocaleToCognito: vi.fn(async () => true),
  normalizePreferredLocaleCode: (raw) => {
    const locale = typeof raw === 'string' ? raw.toLowerCase().trim() : '';
    return locale === 'vi' || locale === 'en' ? locale : null;
  },
}));

describe('userLocaleProfile (F-02)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    window.performanceTracker = { step: vi.fn() };
    localStorage.clear();
  });

  it('applyUserPreferredLocaleOnAuth calls setActiveLocale when profile has preferredLocale', async () => {
    const apiWrapper = (await import('@/lib/mock-api-demo/apiWrapper.js')).default;
    const { setActiveLocale } = await import('@/systems/i18n/localeManager.js');
    const { useAuthStore } = await import('@/stores/useAuthStore.js');

    apiWrapper.get.mockResolvedValue({ preferredLocale: 'vi' });
    const auth = useAuthStore();
    auth.currentUser = { email: 'a@test.com', role: 'creator' };
    auth.idToken = 'token';

    const { applyUserPreferredLocaleOnAuth } = await import(
      '@/systems/i18n/userLocaleProfile.js'
    );
    await applyUserPreferredLocaleOnAuth();

    expect(setActiveLocale).toHaveBeenCalledWith('vi', {
      updateUrl: true,
      syncProfile: false,
    });
    expect(auth.currentUser.preferredLocale).toBe('vi');
  });

  it('syncPreferredLocaleToProfile skips when not authenticated', async () => {
    const apiWrapper = (await import('@/lib/mock-api-demo/apiWrapper.js')).default;
    const { syncPreferredLocaleToProfile } = await import(
      '@/systems/i18n/userLocaleProfile.js'
    );

    const ok = await syncPreferredLocaleToProfile('vi');
    expect(ok).toBe(true);
    expect(apiWrapper.patch).not.toHaveBeenCalled();
  });
});
