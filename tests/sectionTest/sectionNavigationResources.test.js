/**
 * sectionNavigationResources.js — current-section loads on navigation (§29, §78, §96).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const loadTranslationsForSection = vi.fn(() => Promise.resolve({}));
const areTranslationsLoadedForSection = vi.fn(() => false);
const loadSectionCss = vi.fn(() => Promise.resolve(true));
const unloadSectionCss = vi.fn();
const preloadSectionAssets = vi.fn(() => Promise.resolve());

vi.mock('../../src/systems/i18n/translationLoader.js', () => ({
  loadTranslationsForSection: (...args) => loadTranslationsForSection(...args),
  areTranslationsLoadedForSection: (...args) => areTranslationsLoadedForSection(...args),
}));

vi.mock('../../src/systems/sections/sectionCssLoader.js', () => ({
  loadSectionCss: (...args) => loadSectionCss(...args),
  unloadSectionCss: (...args) => unloadSectionCss(...args),
}));

vi.mock('../../src/systems/assets/assetPreloader.js', () => ({
  preloadSectionAssets: (...args) => preloadSectionAssets(...args),
}));

vi.mock('../../src/systems/sections/sectionResolver.js', () => ({
  resolveRoleSectionVariant: vi.fn((section, role) => section[role] || section.default),
}));

import {
  resolveCurrentSectionForNavigation,
  loadCurrentSectionResources,
} from '../../src/systems/sections/sectionNavigationResources.js';

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('VITE_ENABLE_LOGGER', '');
  areTranslationsLoadedForSection.mockReturnValue(false);
  loadTranslationsForSection.mockResolvedValue({});
  loadSectionCss.mockResolvedValue(true);
});

describe('resolveCurrentSectionForNavigation (Phase E §29)', () => {
  it('returns string sections directly', () => {
    expect(resolveCurrentSectionForNavigation({ meta: { section: 'auth' } }, 'guest')).toBe('auth');
  });

  it('resolves role-based section objects', () => {
    expect(
      resolveCurrentSectionForNavigation(
        {
          meta: {
            section: {
              creator: 'dashboard-creator',
              fan: 'dashboard-fan',
            },
          },
        },
        'creator',
      ),
    ).toBe('dashboard-creator');
  });

  it('returns null when section is missing', () => {
    expect(resolveCurrentSectionForNavigation({ meta: {} }, 'guest')).toBeNull();
  });
});

describe('loadCurrentSectionResources (Phase E §29, §78)', () => {
  it('returns null when routeConfig meta is missing', () => {
    const result = loadCurrentSectionResources({
      to: { meta: { section: 'auth' } },
      from: { meta: {} },
      userRole: 'guest',
      activeLocale: 'vi',
      logContext: { file: 'test', method: 'test' },
    });

    expect(result).toBeNull();
    expect(loadSectionCss).not.toHaveBeenCalled();
  });

  it('unloads previous section CSS when section changes', () => {
    loadCurrentSectionResources({
      to: { meta: { routeConfig: {}, section: 'shop' } },
      from: { meta: { section: 'auth' } },
      userRole: 'guest',
      activeLocale: 'vi',
      logContext: { file: 'test', method: 'test' },
    });

    expect(unloadSectionCss).toHaveBeenCalledWith('auth');
    expect(loadSectionCss).toHaveBeenCalledWith('shop');
  });

  it('skips translation fetch when already loaded', () => {
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

  it('loads translations and assets when section resolves', () => {
    loadCurrentSectionResources({
      to: { meta: { routeConfig: {}, section: 'auth' } },
      from: { meta: {} },
      userRole: 'guest',
      activeLocale: 'vi',
      logContext: { file: 'test', method: 'test' },
    });

    expect(loadTranslationsForSection).toHaveBeenCalledWith('auth', 'vi');
    expect(preloadSectionAssets).toHaveBeenCalledWith('auth');
    expect(loadSectionCss).toHaveBeenCalledWith('auth');
  });

  it('returns resolved section name for callers', () => {
    const resolved = loadCurrentSectionResources({
      to: { meta: { routeConfig: {}, section: 'auth' } },
      from: { meta: {} },
      userRole: 'guest',
      activeLocale: 'vi',
      logContext: { file: 'test', method: 'test' },
    });

    expect(resolved).toBe('auth');
  });
});
