/**
 * sectionPreloadOrchestrator.js route-coupled — Phase F (route test plan §33, §66).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const preloadSection = vi.fn();
const resetSectionPreloadState = vi.fn();

vi.mock('../../src/systems/sections/sectionPreloader.js', () => ({
  preloadSection,
  resetSectionPreloadState,
}));

vi.mock('../../src/systems/i18n/translationLoader.js', () => ({
  loadTranslationsForSection: vi.fn().mockResolvedValue(undefined),
  areTranslationsLoadedForSection: vi.fn(() => false),
}));

beforeEach(async () => {
  setActivePinia(createPinia());
  vi.resetModules();
  preloadSection.mockReset();
  preloadSection.mockResolvedValue(true);
  resetSectionPreloadState.mockReset();

  const { areTranslationsLoadedForSection, loadTranslationsForSection } = await import(
    '../../src/systems/i18n/translationLoader.js'
  );
  areTranslationsLoadedForSection.mockReturnValue(false);
  loadTranslationsForSection.mockClear();
});

describe('resolveEffectiveRouteConfig (Phase F §33)', () => {
  it('returns null when route config is null', async () => {
    const { resolveEffectiveRouteConfig } = await import(
      '../../src/systems/sections/sectionPreloadOrchestrator.js'
    );

    expect(resolveEffectiveRouteConfig(null)).toBeNull();
  });
});

describe('getRoutePreloadPlan (Phase F §33)', () => {
  it('returns empty plan for null route config', async () => {
    const { getRoutePreloadPlan } = await import(
      '../../src/systems/sections/sectionPreloadOrchestrator.js'
    );

    expect(getRoutePreloadPlan(null, 'guest')).toEqual({
      preloadSectionIdentifiers: [],
      resolvedSectionNames: [],
    });
  });

  it('returns empty plan for route with empty preLoadSections array', async () => {
    const { getRoutePreloadPlan } = await import(
      '../../src/systems/sections/sectionPreloadOrchestrator.js'
    );

    const plan = getRoutePreloadPlan(
      { slug: '/dashboard', section: 'dashboard-global', preLoadSections: [] },
      'creator',
    );

    expect(plan.preloadSectionIdentifiers).toEqual([]);
    expect(plan.resolvedSectionNames).toEqual([]);
  });

  it('deduplicates resolved section names', async () => {
    const { getRoutePreloadPlan } = await import(
      '../../src/systems/sections/sectionPreloadOrchestrator.js'
    );

    const plan = getRoutePreloadPlan(
      {
        slug: '/log-in',
        section: 'auth',
        preLoadSections: ['shop', 'shop', 'auth'],
      },
      'guest',
    );

    expect(plan.preloadSectionIdentifiers).toEqual(['shop', 'auth']);
    expect(plan.resolvedSectionNames).toEqual(['shop', 'auth']);
  });

  it('merges additionalSections without duplicates', async () => {
    const { getRoutePreloadPlan } = await import(
      '../../src/systems/sections/sectionPreloadOrchestrator.js'
    );

    const plan = getRoutePreloadPlan(
      {
        slug: '/log-in',
        section: 'auth',
        preLoadSections: ['shop'],
      },
      'guest',
      { additionalSections: ['shop', 'analytics'] },
    );

    expect(plan.resolvedSectionNames).toEqual(['shop', 'analytics']);
  });
});

describe('resolveCurrentRouteSectionName (Phase F §33)', () => {
  it('resolves role-based section for user role', async () => {
    const { resolveCurrentRouteSectionName } = await import(
      '../../src/systems/sections/sectionPreloadOrchestrator.js'
    );

    const sectionName = resolveCurrentRouteSectionName(
      {
        slug: '/dashboard',
        section: { creator: 'dashboard-creator', fan: 'dashboard-fan' },
      },
      'creator',
    );

    expect(sectionName).toBe('dashboard-creator');
  });

  it('returns null when route has no section', async () => {
    const { resolveCurrentRouteSectionName } = await import(
      '../../src/systems/sections/sectionPreloadOrchestrator.js'
    );

    expect(resolveCurrentRouteSectionName({ slug: '/callback' }, 'guest')).toBeNull();
  });
});

describe('shouldPreloadDefaultAuthSection (Phase F §33)', () => {
  it('returns true for unauthenticated guest', async () => {
    const { shouldPreloadDefaultAuthSection } = await import(
      '../../src/systems/sections/sectionPreloadOrchestrator.js'
    );

    expect(
      shouldPreloadDefaultAuthSection({
        isAuthenticated: false,
        currentPath: '/dashboard',
        resolvedSections: [],
      }),
    ).toBe(true);
  });

  it('returns false for authenticated user not on login without auth section', async () => {
    const { shouldPreloadDefaultAuthSection } = await import(
      '../../src/systems/sections/sectionPreloadOrchestrator.js'
    );

    expect(
      shouldPreloadDefaultAuthSection({
        isAuthenticated: true,
        currentPath: '/dashboard',
        resolvedSections: ['dashboard-global'],
      }),
    ).toBe(false);
  });

  it('returns true when authenticated user is on login path', async () => {
    const { shouldPreloadDefaultAuthSection } = await import(
      '../../src/systems/sections/sectionPreloadOrchestrator.js'
    );

    expect(
      shouldPreloadDefaultAuthSection({
        isAuthenticated: true,
        currentPath: '/log-in',
        resolvedSections: [],
      }),
    ).toBe(true);
  });
});

describe('startBackgroundSectionPreloads (Phase F §33)', () => {
  it('calls preloadSection only for each background section', async () => {
    const { startBackgroundSectionPreloads } = await import(
      '../../src/systems/sections/sectionPreloadOrchestrator.js'
    );

    await startBackgroundSectionPreloads({
      sections: ['auth', 'shop'],
      skipSection: 'auth',
      logContext: { file: 'test', method: 'test' },
    });

    expect(preloadSection).toHaveBeenCalledTimes(1);
    expect(preloadSection).toHaveBeenCalledWith('shop');
  });

  it('skips background translation preload when section/locale already loaded', async () => {
    const { areTranslationsLoadedForSection, loadTranslationsForSection } = await import(
      '../../src/systems/i18n/translationLoader.js'
    );
    areTranslationsLoadedForSection.mockReturnValue(true);

    const { startBackgroundSectionPreloads } = await import(
      '../../src/systems/sections/sectionPreloadOrchestrator.js'
    );

    await startBackgroundSectionPreloads({
      sections: ['shop'],
      locale: 'vi',
      preloadTranslations: true,
      logContext: { file: 'test', method: 'test' },
    });

    expect(areTranslationsLoadedForSection).toHaveBeenCalledWith('shop', 'vi');
    expect(loadTranslationsForSection).not.toHaveBeenCalled();
  });
});

describe('refreshSectionPreloadsOnLocaleChange (Phase F §33)', () => {
  it('resets preload state then re-runs bundles and translations', async () => {
    const { loadTranslationsForSection } = await import('../../src/systems/i18n/translationLoader.js');
    const { refreshSectionPreloadsOnLocaleChange } = await import(
      '../../src/systems/sections/sectionPreloadOrchestrator.js'
    );

    await refreshSectionPreloadsOnLocaleChange({
      sections: ['auth', 'shop', 'auth'],
      locale: 'vi',
      skipSection: 'auth',
      logContext: { file: 'test', method: 'test' },
    });

    expect(resetSectionPreloadState).toHaveBeenCalledTimes(1);
    expect(resetSectionPreloadState).toHaveBeenCalledWith('shop');
    expect(preloadSection).toHaveBeenCalledTimes(1);
    expect(preloadSection).toHaveBeenCalledWith('shop');
    expect(loadTranslationsForSection).toHaveBeenCalledWith('shop', 'vi');
  });
});
