/**
 * sectionPreloadOrchestrator.js — core exports (section test plan §22–27, §64, §96–99).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ORCHESTRATOR_PATH,
  resetTranslationLoaderMocks,
  setupOrchestratorTestEnvironment,
  teardownOrchestratorTestEnvironment,
} from '../helpers/sectionOrchestratorTestSetup.js';

const { preloadSection, resetSectionPreloadState } = vi.hoisted(() => ({
  preloadSection: vi.fn(),
  resetSectionPreloadState: vi.fn(),
}));

const mocks = { preloadSection, resetSectionPreloadState };

vi.mock('../../src/systems/sections/sectionPreloader.js', () => ({
  preloadSection,
  resetSectionPreloadState,
}));

vi.mock('../../src/systems/i18n/translationLoader.js', () => ({
  loadTranslationsForSection: vi.fn().mockResolvedValue(undefined),
  areTranslationsLoadedForSection: vi.fn(() => false),
}));

beforeEach(async () => {
  setupOrchestratorTestEnvironment(mocks);
  await resetTranslationLoaderMocks();
});

afterEach(() => {
  teardownOrchestratorTestEnvironment();
});

describe('getSectionPreloadPlan (Phase E §22–23)', () => {
  async function loadOrchestrator() {
    return import(ORCHESTRATOR_PATH);
  }

  it('returns empty plan for null route config', async () => {
    const { getSectionPreloadPlan } = await loadOrchestrator();
    expect(getSectionPreloadPlan(null, 'guest')).toEqual({
      preloadSectionIdentifiers: [],
      resolvedSectionNames: [],
    });
  });

  it('returns empty plan for route with empty preLoadSections array', async () => {
    const { getSectionPreloadPlan } = await loadOrchestrator();
    const plan = getSectionPreloadPlan(
      { slug: '/dashboard', section: 'dashboard-global', preLoadSections: [] },
      'creator',
    );
    expect(plan.preloadSectionIdentifiers).toEqual([]);
    expect(plan.resolvedSectionNames).toEqual([]);
  });

  it('deduplicates resolved section names from direct identifiers', async () => {
    const { getSectionPreloadPlan } = await loadOrchestrator();
    const plan = getSectionPreloadPlan(
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
    const { getSectionPreloadPlan } = await loadOrchestrator();
    const plan = getSectionPreloadPlan(
      { slug: '/log-in', section: 'auth', preLoadSections: ['shop'] },
      'guest',
      { additionalSections: ['shop', 'analytics'] },
    );
    expect(plan.resolvedSectionNames).toEqual(['shop', 'analytics']);
  });
});

describe('resolveCurrentSectionNameFromRouteConfig (Phase E §24)', () => {
  async function loadOrchestrator() {
    return import(ORCHESTRATOR_PATH);
  }

  it('resolves role-based section for user role', async () => {
    const { resolveCurrentSectionNameFromRouteConfig } = await loadOrchestrator();
    expect(
      resolveCurrentSectionNameFromRouteConfig(
        {
          slug: '/dashboard',
          section: { creator: 'dashboard-creator', fan: 'dashboard-fan' },
        },
        'creator',
      ),
    ).toBe('dashboard-creator');
  });

  it('returns null when route has no section', async () => {
    const { resolveCurrentSectionNameFromRouteConfig } = await loadOrchestrator();
    expect(resolveCurrentSectionNameFromRouteConfig({ slug: '/callback' }, 'guest')).toBeNull();
  });
});

describe('shouldPreloadDefaultAuthSection (Phase E §25)', () => {
  async function loadOrchestrator() {
    return import(ORCHESTRATOR_PATH);
  }

  it('returns true for unauthenticated guest', async () => {
    const { shouldPreloadDefaultAuthSection } = await loadOrchestrator();
    expect(
      shouldPreloadDefaultAuthSection({
        isAuthenticated: false,
        currentPath: '/dashboard',
        resolvedSections: [],
      }),
    ).toBe(true);
  });

  it('returns false for authenticated user not on login without auth section', async () => {
    const { shouldPreloadDefaultAuthSection } = await loadOrchestrator();
    expect(
      shouldPreloadDefaultAuthSection({
        isAuthenticated: true,
        currentPath: '/dashboard',
        resolvedSections: ['dashboard-global'],
      }),
    ).toBe(false);
  });

  it('returns true when authenticated user is on login path', async () => {
    const { shouldPreloadDefaultAuthSection } = await loadOrchestrator();
    expect(
      shouldPreloadDefaultAuthSection({
        isAuthenticated: true,
        currentPath: '/log-in',
        resolvedSections: [],
      }),
    ).toBe(true);
  });

  it('returns true when resolvedSections includes auth', async () => {
    const { shouldPreloadDefaultAuthSection } = await loadOrchestrator();
    expect(
      shouldPreloadDefaultAuthSection({
        isAuthenticated: true,
        currentPath: '/dashboard',
        resolvedSections: ['auth', 'shop'],
      }),
    ).toBe(true);
  });
});

describe('preloadDefaultAuthSection (Phase E §26)', () => {
  async function loadOrchestrator() {
    return import(ORCHESTRATOR_PATH);
  }

  it('calls preloadSection for auth without throwing on failure', async () => {
    mocks.preloadSection.mockRejectedValueOnce(new Error('auth preload failed'));
    const { preloadDefaultAuthSection } = await loadOrchestrator();

    await expect(
      preloadDefaultAuthSection({ file: 'test.js', method: 'startup' }),
    ).resolves.toBeUndefined();
    expect(mocks.preloadSection).toHaveBeenCalledWith('auth');
  });
});

describe('startBackgroundSectionPreloads (Phase E §27, §64)', () => {
  async function loadOrchestrator() {
    return import(ORCHESTRATOR_PATH);
  }

  it('calls preloadSection only for non-skipped background sections', async () => {
    const { startBackgroundSectionPreloads } = await loadOrchestrator();

    await startBackgroundSectionPreloads({
      sections: ['auth', 'shop'],
      skipSection: 'auth',
      logContext: { file: 'test', method: 'test' },
    });

    expect(mocks.preloadSection).toHaveBeenCalledTimes(1);
    expect(mocks.preloadSection).toHaveBeenCalledWith('shop');
  });

  it('skips invalid section names without calling preloadSection', async () => {
    const { startBackgroundSectionPreloads } = await loadOrchestrator();

    await startBackgroundSectionPreloads({
      sections: ['', null, 'shop', 0],
      logContext: { file: 'test', method: 'test' },
    });

    expect(mocks.preloadSection).toHaveBeenCalledTimes(1);
    expect(mocks.preloadSection).toHaveBeenCalledWith('shop');
  });

  it('does not call preloadSectionCss directly', async () => {
    const cssLoader = await import('../../src/systems/sections/sectionCssLoader.js');
    const preloadSectionCssSpy = vi.spyOn(cssLoader, 'preloadSectionCss');
    const { startBackgroundSectionPreloads } = await loadOrchestrator();

    await startBackgroundSectionPreloads({
      sections: ['auth'],
      logContext: { file: 'test', method: 'test' },
    });

    expect(preloadSectionCssSpy).not.toHaveBeenCalled();
    preloadSectionCssSpy.mockRestore();
  });

  it('loads translations when preloadTranslations is true and locale is set', async () => {
    const { loadTranslationsForSection } = await import(
      '../../src/systems/i18n/translationLoader.js'
    );
    const { startBackgroundSectionPreloads } = await loadOrchestrator();

    await startBackgroundSectionPreloads({
      sections: ['shop'],
      locale: 'vi',
      preloadTranslations: true,
      logContext: { file: 'test', method: 'test' },
    });

    expect(loadTranslationsForSection).toHaveBeenCalledWith('shop', 'vi');
  });

  it('skips background translation preload when section/locale already loaded', async () => {
    const { areTranslationsLoadedForSection, loadTranslationsForSection } = await import(
      '../../src/systems/i18n/translationLoader.js'
    );
    areTranslationsLoadedForSection.mockReturnValue(true);
    const { startBackgroundSectionPreloads } = await loadOrchestrator();

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
