import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const LOCALE_MANAGER_PATH = '../../src/systems/i18n/localeManager.js';

const loadTranslationsForSection = vi.fn(() => Promise.resolve({ ok: true }));
const loadBaseTranslations = vi.fn(() => Promise.resolve({ ui: {} }));

vi.mock('../../src/systems/i18n/translationLoader.js', () => ({
  loadTranslationsForSection: (...args) => loadTranslationsForSection(...args),
  loadBaseTranslations: (...args) => loadBaseTranslations(...args),
}));

vi.mock('../../src/systems/routing/routeResolver.js', () => ({
  resolveRouteFromPath: vi.fn(() => ({ section: 'auth' })),
}));

vi.mock('../../src/stores/useAuthStore.js', () => ({
  useAuthStore: vi.fn(() => ({ currentUser: { role: 'guest' } })),
}));

vi.mock('../../src/stores/useLocaleStore.js', () => ({
  useLocaleStore: vi.fn(() => ({ locale: 'en', setLocale: vi.fn() })),
}));

vi.mock('../../src/systems/i18n/i18nInstance.js', () => ({
  getI18nInstance: vi.fn(() => ({
    global: { locale: { value: 'en' } },
  })),
}));

vi.mock('../../src/systems/sections/sectionResolver.js', () => ({
  resolveRoleSectionVariant: vi.fn((section) => section),
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  loadTranslationsForSection.mockResolvedValue({ ok: true });
  loadBaseTranslations.mockResolvedValue({ ui: {} });
  window.performanceTracker = { step: vi.fn() };
  document.documentElement.setAttribute('lang', 'en');
  document.documentElement.setAttribute('dir', 'ltr');
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

  it('loads base UI translations before section translations', async () => {
    const { applyLocaleTemporarily } = await import(LOCALE_MANAGER_PATH);

    await applyLocaleTemporarily('vi', { routePath: '/vi/log-in' });

    expect(loadBaseTranslations).toHaveBeenCalledWith('vi');
    expect(loadBaseTranslations.mock.invocationCallOrder[0]).toBeLessThan(
      loadTranslationsForSection.mock.invocationCallOrder[0]
    );
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

describe('document RTL direction (B-03)', () => {
  it('getDocumentDirection returns rtl for RTL locales', async () => {
    const { getDocumentDirection, RTL_LOCALES } = await import(LOCALE_MANAGER_PATH);

    expect(RTL_LOCALES.has('ar')).toBe(true);
    expect(getDocumentDirection('ar')).toBe('rtl');
    expect(getDocumentDirection('he')).toBe('rtl');
    expect(getDocumentDirection('fa-af')).toBe('rtl');
    expect(getDocumentDirection('en')).toBe('ltr');
    expect(getDocumentDirection('vi')).toBe('ltr');
  });

  it('applyLocaleTemporarily sets html dir for RTL and LTR locales', async () => {
    const { applyLocaleTemporarily } = await import(LOCALE_MANAGER_PATH);

    await applyLocaleTemporarily('ar', { loadTranslations: false });
    expect(document.documentElement.getAttribute('lang')).toBe('ar');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');

    await applyLocaleTemporarily('en', { loadTranslations: false });
    expect(document.documentElement.getAttribute('lang')).toBe('en');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
  });
});
