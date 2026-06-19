/**
 * localeManager.js route-coupled paths — Phase F (route test plan §35, §68).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

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
  useLocaleStore: vi.fn(() => ({ locale: null, setLocale: vi.fn() })),
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
  vi.stubGlobal('location', { pathname: '', href: 'http://localhost/' });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('locale path utilities (Phase F §35)', () => {
  it('getLeadingLocaleFromPath returns the first supported segment', async () => {
    const { getLeadingLocaleFromPath } = await import('../../src/systems/i18n/localeManager.js');

    expect(getLeadingLocaleFromPath('/vi/dashboard')).toBe('vi');
    expect(getLeadingLocaleFromPath('/zh-tw/settings')).toBe('zh-tw');
    expect(getLeadingLocaleFromPath('/fr/dashboard')).toBe('fr');
    expect(getLeadingLocaleFromPath('/dashboard')).toBeNull();
    expect(getLeadingLocaleFromPath('/')).toBeNull();
    expect(getLeadingLocaleFromPath('/en')).toBe('en');
  });

  it('stripLeadingLocaleFromPath removes one locale prefix', async () => {
    const { stripLeadingLocaleFromPath } = await import('../../src/systems/i18n/localeManager.js');

    expect(stripLeadingLocaleFromPath('/vi/dashboard')).toBe('/dashboard');
    expect(stripLeadingLocaleFromPath('/fr/about/team')).toBe('/about/team');
    expect(stripLeadingLocaleFromPath('/vi')).toBe('/');
    expect(stripLeadingLocaleFromPath('/dashboard')).toBe('/dashboard');
    expect(stripLeadingLocaleFromPath('/')).toBe('/');
  });

  it('stripLeadingLocaleFromPath leaves unsupported locale segments unchanged', async () => {
    const { stripLeadingLocaleFromPath, SUPPORTED_LOCALES } = await import(
      '../../src/systems/i18n/localeManager.js'
    );

    expect(stripLeadingLocaleFromPath('/xx/page', SUPPORTED_LOCALES)).toBe('/xx/page');
  });

  it('normalizeLocalizedPath behaves like stripLeadingLocaleFromPath', async () => {
    const { normalizeLocalizedPath, stripLeadingLocaleFromPath } = await import(
      '../../src/systems/i18n/localeManager.js'
    );

    expect(normalizeLocalizedPath('/vi/log-in')).toBe('/log-in');
    expect(normalizeLocalizedPath('/vi/log-in')).toBe(stripLeadingLocaleFromPath('/vi/log-in'));
  });

  it('uses custom supportedLocales list for path parsing', async () => {
    const { getLeadingLocaleFromPath, stripLeadingLocaleFromPath } = await import(
      '../../src/systems/i18n/localeManager.js'
    );
    const customLocales = ['xx'];

    expect(getLeadingLocaleFromPath('/xx/page', customLocales)).toBe('xx');
    expect(getLeadingLocaleFromPath('/vi/page', customLocales)).toBeNull();
    expect(stripLeadingLocaleFromPath('/xx/page', customLocales)).toBe('/page');
    expect(stripLeadingLocaleFromPath('/vi/page', customLocales)).toBe('/vi/page');
  });
});

describe('applyLocaleTemporarily route coupling (Phase F §35)', () => {
  it('loads section translations from resolved route path', async () => {
    const { applyLocaleTemporarily, getActiveLocale } = await import(
      '../../src/systems/i18n/localeManager.js'
    );

    await applyLocaleTemporarily('vi', { routePath: '/vi/log-in' });

    expect(getActiveLocale()).toBe('vi');
    expect(loadTranslationsForSection).toHaveBeenCalledWith('auth', 'vi');
  });

  it('uses explicit sectionName when provided', async () => {
    const { applyLocaleTemporarily } = await import('../../src/systems/i18n/localeManager.js');

    await applyLocaleTemporarily('vi', {
      sectionName: 'dashboard-global',
      routePath: '/vi/dashboard',
    });

    expect(loadTranslationsForSection).toHaveBeenCalledWith('dashboard-global', 'vi');
  });

  it('skips translation load when loadTranslations is false', async () => {
    const { applyLocaleTemporarily } = await import('../../src/systems/i18n/localeManager.js');

    await applyLocaleTemporarily('vi', { loadTranslations: false });

    expect(loadTranslationsForSection).not.toHaveBeenCalled();
  });
});

describe('getDisplayedLocale and locale injection (Phase F §68)', () => {
  it('getDisplayedLocale reads locale segment from route path', async () => {
    const { getDisplayedLocale } = await import('../../src/systems/i18n/localeManager.js');

    expect(getDisplayedLocale('/vi/dashboard')).toBe('vi');
    expect(getDisplayedLocale('/dashboard')).toBeTruthy();
  });

  it('syncTemporaryPageLocaleFromUrl ignores unsupported locale segments', async () => {
    const { syncTemporaryPageLocaleFromUrl, getTemporaryPageLocale } = await import(
      '../../src/systems/i18n/localeManager.js'
    );

    syncTemporaryPageLocaleFromUrl('xx-not-a-locale');

    expect(getTemporaryPageLocale()).toBeNull();
  });

  it('resolveLocaleForUrlInjection returns active locale when no temporary locale', async () => {
    const { resolveLocaleForUrlInjection, getActiveLocale } = await import(
      '../../src/systems/i18n/localeManager.js'
    );

    expect(resolveLocaleForUrlInjection()).toBe(getActiveLocale());
  });
});
