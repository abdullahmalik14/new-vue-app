import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const LOCALE_MANAGER_PATH = '../../src/utils/translation/localeManager.js';

const loadTranslationsForSection = vi.fn(() => Promise.resolve({ ok: true }));

vi.mock('../../src/utils/translation/translationLoader.js', () => ({
  loadTranslationsForSection: (...args) => loadTranslationsForSection(...args),
}));

vi.mock('../../src/utils/route/routeResolver.js', () => ({
  resolveRouteFromPath: vi.fn(() => ({ section: 'auth' })),
}));

vi.mock('../../src/stores/useAuthStore.js', () => ({
  useAuthStore: vi.fn(() => ({ currentUser: { role: 'guest' } })),
}));

vi.mock('../../src/stores/useLocaleStore.js', () => ({
  useLocaleStore: vi.fn(() => ({ locale: 'en', setLocale: vi.fn() })),
}));

vi.mock('../../src/utils/translation/i18nInstance.js', () => ({
  getI18nInstance: vi.fn(() => ({
    global: { locale: { value: 'en' } },
  })),
}));

vi.mock('../../src/utils/section/sectionResolver.js', () => ({
  resolveRoleSectionVariant: vi.fn((section) => section),
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  loadTranslationsForSection.mockResolvedValue({ ok: true });
  window.performanceTracker = { step: vi.fn() };
  document.documentElement.setAttribute('lang', 'en');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('applyLocaleTemporarily (L-03)', () => {
  it('starts translation load for resolved section using routePath', async () => {
    const { applyLocaleTemporarily, getActiveLocale } = await import(LOCALE_MANAGER_PATH);

    await applyLocaleTemporarily('vi', { routePath: '/vi/log-in' });

    expect(getActiveLocale()).toBe('vi');
    expect(loadTranslationsForSection).toHaveBeenCalledWith('auth', 'vi');
  });

  it('uses explicit sectionName when provided', async () => {
    const { applyLocaleTemporarily } = await import(LOCALE_MANAGER_PATH);

    await applyLocaleTemporarily('vi', {
      sectionName: 'dashboard-global',
      routePath: '/vi/dashboard',
    });

    expect(loadTranslationsForSection).toHaveBeenCalledWith(
      'dashboard-global',
      'vi'
    );
  });

  it('can await translation load for preview-style callers', async () => {
    const { applyLocaleTemporarily } = await import(LOCALE_MANAGER_PATH);
    let resolved = false;
    loadTranslationsForSection.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolved = true;
            resolve({ preview: true });
          }, 10);
        })
    );

    await applyLocaleTemporarily('vi', {
      sectionName: 'auth',
      awaitTranslations: true,
    });

    expect(resolved).toBe(true);
  });

  it('skips translation load when loadTranslations is false', async () => {
    const { applyLocaleTemporarily } = await import(LOCALE_MANAGER_PATH);

    await applyLocaleTemporarily('vi', { loadTranslations: false });

    expect(loadTranslationsForSection).not.toHaveBeenCalled();
  });
});
