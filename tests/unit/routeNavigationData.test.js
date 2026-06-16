import { describe, it, expect, vi, beforeEach } from 'vitest';

const loadTranslationsForSection = vi.fn(() => Promise.resolve({}));
const areTranslationsLoadedForSection = vi.fn(() => false);

vi.mock('../../src/systems/i18n/translationLoader.js', () => ({
  loadTranslationsForSection: (...args) => loadTranslationsForSection(...args),
  areTranslationsLoadedForSection: (...args) => areTranslationsLoadedForSection(...args),
}));

vi.mock('../../src/systems/sections/sectionCssLoader.js', () => ({
  loadSectionCss: vi.fn(() => Promise.resolve()),
  unloadSectionCss: vi.fn(),
}));

vi.mock('../../src/systems/assets/assetPreloader.js', () => ({
  preloadSectionAssets: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../src/systems/sections/sectionResolver.js', () => ({
  resolveRoleSectionVariant: vi.fn((section, role) => section[role] || section.default),
}));

import {
  resolveCurrentSectionForNavigation,
  loadCurrentSectionResources,
} from '../../src/systems/routing/routeNavigationResourceLoader.js';

describe('routeNavigationData (M9)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    areTranslationsLoadedForSection.mockReturnValue(false);
    loadTranslationsForSection.mockResolvedValue({});
  });

  it('resolveCurrentSectionForNavigation returns string sections directly', () => {
    const section = resolveCurrentSectionForNavigation(
      { meta: { section: 'auth' } },
      'guest',
    );

    expect(section).toBe('auth');
  });

  it('resolveCurrentSectionForNavigation resolves role-based section objects', () => {
    const section = resolveCurrentSectionForNavigation(
      {
        meta: {
          section: {
            creator: 'dashboard-creator',
            fan: 'dashboard-fan',
          },
        },
      },
      'creator',
    );

    expect(section).toBe('dashboard-creator');
  });

  it('resolveCurrentSectionForNavigation returns null when section is missing', () => {
    expect(resolveCurrentSectionForNavigation({ meta: {} }, 'guest')).toBeNull();
  });

  it('loadCurrentSectionResources skips translation fetch when already loaded (P-02)', () => {
    areTranslationsLoadedForSection.mockReturnValue(true);

    loadCurrentSectionResources({
      to: { meta: { routeConfig: {}, section: 'auth' } },
      from: { meta: {} },
      userRole: 'guest',
      activeLocale: 'vi',
      logContext: { file: 'test', method: 'test' },
    });

    expect(areTranslationsLoadedForSection).toHaveBeenCalledWith('auth', 'vi');
    expect(loadTranslationsForSection).not.toHaveBeenCalled();
  });

  it('loadCurrentSectionResources loads translations when not yet loaded', () => {
    loadCurrentSectionResources({
      to: { meta: { routeConfig: {}, section: 'auth' } },
      from: { meta: {} },
      userRole: 'guest',
      activeLocale: 'vi',
      logContext: { file: 'test', method: 'test' },
    });

    expect(areTranslationsLoadedForSection).toHaveBeenCalledWith('auth', 'vi');
    expect(loadTranslationsForSection).toHaveBeenCalledWith('auth', 'vi');
  });
});
