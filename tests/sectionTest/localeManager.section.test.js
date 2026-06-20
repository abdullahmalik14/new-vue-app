/**
 * localeManager.js — section refresh on locale change (section test plan §42, §117).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const LOCALE_MANAGER_PATH = '../../src/systems/i18n/localeManager.js';

const loadTranslationsForSection = vi.fn(() => Promise.resolve({ ok: true }));
const loadBaseTranslations = vi.fn(() => Promise.resolve({ ui: {} }));
const clearTranslationCaches = vi.fn();
const getSectionPreloadPlan = vi.fn();
const refreshSectionPreloadsOnLocaleChange = vi.fn(() => Promise.resolve());
const resolveRoleSectionVariant = vi.fn((section) => section);

vi.mock('../../src/systems/i18n/translationLoader.js', () => ({
  loadTranslationsForSection: (...args) => loadTranslationsForSection(...args),
  loadBaseTranslations: (...args) => loadBaseTranslations(...args),
  clearTranslationCaches: (...args) => clearTranslationCaches(...args),
}));

vi.mock('../../src/systems/routing/routeResolver.js', () => ({
  resolveRouteFromPath: vi.fn(),
}));

vi.mock('../../src/systems/sections/sectionPreloadOrchestrator.js', () => ({
  getSectionPreloadPlan,
  refreshSectionPreloadsOnLocaleChange,
}));

vi.mock('../../src/systems/sections/sectionResolver.js', () => ({
  resolveRoleSectionVariant: (...args) => resolveRoleSectionVariant(...args),
}));

vi.mock('../../src/systems/i18n/i18nInstance.js', () => ({
  getI18nInstance: vi.fn(() => ({
    global: { locale: { value: 'en' } },
  })),
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  setActivePinia(createPinia());
  window.performanceTracker = { step: vi.fn() };
  window.history.replaceState({}, '', '/log-in');
  loadTranslationsForSection.mockResolvedValue({ ok: true });
  refreshSectionPreloadsOnLocaleChange.mockResolvedValue(undefined);
  resolveRoleSectionVariant.mockImplementation((section) => section);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('setActiveLocale section refresh (Phase F §42, §117)', () => {
  async function loadLocaleManager() {
    return import(LOCALE_MANAGER_PATH);
  }

  it('reloads current section translations for the new locale', async () => {
    const { resolveRouteFromPath } = await import('../../src/systems/routing/routeResolver.js');
    resolveRouteFromPath.mockReturnValue({ section: 'auth', preLoadSections: [] });
    getSectionPreloadPlan.mockReturnValue({ resolvedSectionNames: [] });

    const { setActiveLocale } = await loadLocaleManager();

    await setActiveLocale('vi', { updateUrl: false, syncProfile: false });

    expect(clearTranslationCaches).toHaveBeenCalled();
    expect(loadBaseTranslations).toHaveBeenCalledWith('vi');
    expect(loadTranslationsForSection).toHaveBeenCalledWith('auth', 'vi');
  });

  it('calls refreshSectionPreloadsOnLocaleChange for background preLoadSections', async () => {
    const { resolveRouteFromPath } = await import('../../src/systems/routing/routeResolver.js');
    resolveRouteFromPath.mockReturnValue({
      section: 'auth',
      preLoadSections: ['shop'],
    });
    getSectionPreloadPlan.mockReturnValue({
      preloadSectionIdentifiers: ['shop'],
      resolvedSectionNames: ['shop', 'profile'],
    });

    const { setActiveLocale } = await loadLocaleManager();

    await setActiveLocale('fr', { updateUrl: false, syncProfile: false });

    expect(refreshSectionPreloadsOnLocaleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sections: ['shop', 'profile'],
        locale: 'fr',
        skipSection: 'auth',
        logContext: expect.objectContaining({
          file: 'localeManager.js',
          method: 'setActiveLocale',
        }),
      }),
    );
  });

  it('does not refresh background section preloads when plan is empty', async () => {
    const { resolveRouteFromPath } = await import('../../src/systems/routing/routeResolver.js');
    resolveRouteFromPath.mockReturnValue({ section: 'auth', preLoadSections: [] });
    getSectionPreloadPlan.mockReturnValue({ resolvedSectionNames: [] });

    const { setActiveLocale } = await loadLocaleManager();

    await setActiveLocale('vi', { updateUrl: false, syncProfile: false });

    expect(refreshSectionPreloadsOnLocaleChange).not.toHaveBeenCalled();
  });

  it('refreshes preloaded sections even when current route has no section field', async () => {
    const { resolveRouteFromPath } = await import('../../src/systems/routing/routeResolver.js');
    resolveRouteFromPath.mockReturnValue({
      slug: '/log-in',
      preLoadSections: ['shop'],
    });
    getSectionPreloadPlan.mockReturnValue({
      preloadSectionIdentifiers: ['shop'],
      resolvedSectionNames: ['shop'],
    });

    const { setActiveLocale } = await loadLocaleManager();

    await setActiveLocale('vi', { updateUrl: false, syncProfile: false });

    expect(loadTranslationsForSection).not.toHaveBeenCalledWith('auth', 'vi');
    expect(refreshSectionPreloadsOnLocaleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sections: ['shop'],
        locale: 'vi',
        skipSection: null,
      }),
    );
  });

  it('still refreshes background preloads when section resolution throws', async () => {
    const { resolveRouteFromPath } = await import('../../src/systems/routing/routeResolver.js');
    resolveRouteFromPath.mockReturnValue({
      section: { creator: 'dashboard-creator' },
      preLoadSections: ['shop'],
    });
    resolveRoleSectionVariant.mockImplementation(() => {
      throw new Error('resolver failed');
    });
    getSectionPreloadPlan.mockReturnValue({
      preloadSectionIdentifiers: ['shop'],
      resolvedSectionNames: ['shop', 'profile'],
    });

    const { setActiveLocale } = await loadLocaleManager();

    await expect(
      setActiveLocale('fr', { updateUrl: false, syncProfile: false }),
    ).resolves.toBe(true);

    expect(refreshSectionPreloadsOnLocaleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sections: ['shop', 'profile'],
        locale: 'fr',
        skipSection: null,
      }),
    );
  });

  it('does not block locale switch while background section refresh is running', async () => {
    const { resolveRouteFromPath } = await import('../../src/systems/routing/routeResolver.js');
    resolveRouteFromPath.mockReturnValue({
      section: 'auth',
      preLoadSections: ['shop'],
    });
    getSectionPreloadPlan.mockReturnValue({
      preloadSectionIdentifiers: ['shop'],
      resolvedSectionNames: ['shop'],
    });

    let releaseRefresh;
    refreshSectionPreloadsOnLocaleChange.mockImplementation(
      () =>
        new Promise((resolve) => {
          releaseRefresh = resolve;
        }),
    );

    const { setActiveLocale } = await loadLocaleManager();

    await expect(
      Promise.race([
        setActiveLocale('de', { updateUrl: false, syncProfile: false }),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('setActiveLocale timed out')), 75);
        }),
      ]),
    ).resolves.toBe(true);

    releaseRefresh?.();
  });
});
