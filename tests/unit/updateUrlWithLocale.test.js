import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const LOCALE_MANAGER_PATH = '../../src/systems/i18n/localeManager.js';

const loadTranslationsForSection = vi.fn(() => Promise.resolve({ ok: true }));
const loadBaseTranslations = vi.fn(() => Promise.resolve({ ui: {} }));
const clearTranslationCaches = vi.fn();

vi.mock('../../src/systems/i18n/translationLoader.js', () => ({
  loadTranslationsForSection: (...args) => loadTranslationsForSection(...args),
  loadBaseTranslations: (...args) => loadBaseTranslations(...args),
  clearTranslationCaches: (...args) => clearTranslationCaches(...args),
}));

vi.mock('../../src/systems/routing/routeResolver.js', () => ({
  resolveRouteFromPath: vi.fn(() => ({ section: 'auth', preLoadSections: [] })),
}));

vi.mock('../../src/systems/sections/sectionPreloadOrchestrator.js', () => ({
  getRoutePreloadPlan: vi.fn(() => ({ resolved: [] })),
  refreshSectionPreloadsOnLocaleChange: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../src/stores/useAuthStore.js', () => ({
  useAuthStore: vi.fn(() => ({ currentUser: { role: 'guest' }, isAuthenticated: false })),
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

describe('updateUrlWithLocale via setActiveLocale (L-10)', () => {
  const originalPathname = window.location.pathname;
  let replace;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    window.performanceTracker = { step: vi.fn() };
    window.history.replaceState({}, '', '/log-in');
    replace = vi.fn(() => Promise.resolve());
  });

  afterEach(() => {
    window.history.replaceState({}, '', originalPathname || '/');
    vi.unstubAllGlobals();
  });

  it('uses router.replace instead of pushState when router is registered', async () => {
    const { registerLocaleRouter, setActiveLocale } = await import(LOCALE_MANAGER_PATH);

    registerLocaleRouter({
      replace,
      currentRoute: {
        value: {
          path: '/log-in',
          query: { ref: 'test' },
          hash: '#form',
        },
      },
    });

    await setActiveLocale('vi', { updateUrl: true, syncProfile: false });

    expect(replace).toHaveBeenCalledWith({
      path: '/vi/log-in',
      query: { ref: 'test' },
      hash: '#form',
    });
  });

  it('removes locale prefix via router.replace when switching to default locale', async () => {
    const { registerLocaleRouter, setActiveLocale } = await import(LOCALE_MANAGER_PATH);

    registerLocaleRouter({
      replace,
      currentRoute: {
        value: {
          path: '/vi/log-in',
          query: {},
          hash: '',
        },
      },
    });

    await setActiveLocale('en', { updateUrl: true, syncProfile: false });

    expect(replace).toHaveBeenCalledWith({
      path: '/log-in',
      query: {},
      hash: '',
    });
  });

  it('removes locale prefix when route.path is slug-only but params.locale is set (Vue Router optional param)', async () => {
    window.history.replaceState({}, '', '/vi/log-in');

    const { registerLocaleRouter, setActiveLocale } = await import(LOCALE_MANAGER_PATH);

    registerLocaleRouter({
      replace,
      currentRoute: {
        value: {
          path: '/log-in',
          params: { locale: 'vi' },
          fullPath: '/vi/log-in',
          query: {},
          hash: '',
        },
      },
    });

    await setActiveLocale('en', { updateUrl: true, syncProfile: false });

    expect(replace).toHaveBeenCalledWith({
      path: '/log-in',
      query: {},
      hash: '',
    });
  });
});
