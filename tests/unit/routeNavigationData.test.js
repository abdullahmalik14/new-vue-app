import { describe, it, expect, vi, beforeEach } from 'vitest';

const loadTranslationsForSection = vi.fn(() => Promise.resolve({}));
const areTranslationsLoadedForSection = vi.fn(() => false);

vi.mock('../../src/utils/translation/translationLoader.js', () => ({
  loadTranslationsForSection: (...args) => loadTranslationsForSection(...args),
  areTranslationsLoadedForSection: (...args) => areTranslationsLoadedForSection(...args),
}));

vi.mock('../../src/utils/section/sectionCssLoader.js', () => ({
  loadSectionCss: vi.fn(() => Promise.resolve()),
  unloadSectionCss: vi.fn(),
}));

vi.mock('../../src/utils/assets/assetPreloader.js', () => ({
  preloadSectionAssets: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../src/utils/section/sectionResolver.js', () => ({
  resolveRoleSectionVariant: vi.fn((section, role) => section[role] || section.default),
}));

import {
  resolveCurrentSectionForNavigation,
  startCurrentSectionResourceLoads,
} from '../../src/utils/route/routeNavigationData.js';

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

  it('startCurrentSectionResourceLoads skips translation fetch when already loaded (P-02)', () => {
    areTranslationsLoadedForSection.mockReturnValue(true);

    startCurrentSectionResourceLoads({
      to: { meta: { routeConfig: {}, section: 'auth' } },
      from: { meta: {} },
      userRole: 'guest',
      activeLocale: 'vi',
      logContext: { file: 'test', method: 'test' },
    });

    expect(areTranslationsLoadedForSection).toHaveBeenCalledWith('auth', 'vi');
    expect(loadTranslationsForSection).not.toHaveBeenCalled();
  });

  it('startCurrentSectionResourceLoads loads translations when not yet loaded', () => {
    startCurrentSectionResourceLoads({
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
