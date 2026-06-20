/**
 * Section public API contract snapshots — Phase G (section test plan §144).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const startBackgroundSectionPreloads = vi.fn().mockResolvedValue(undefined);
const hookPreloadSection = vi.fn().mockResolvedValue(true);

vi.mock('../../src/systems/assets/assetPreloader.js', () => ({
  preloadSectionCriticalImages: vi.fn(),
  preloadSectionAssets: vi.fn(),
}));

vi.mock('../../src/systems/i18n/translationLoader.js', () => ({
  loadTranslationsForSection: vi.fn(() => Promise.resolve()),
  areTranslationsLoadedForSection: vi.fn(() => false),
}));

vi.mock('../../src/systems/sections/sectionPreloadOrchestrator.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    startBackgroundSectionPreloads,
  };
});

vi.mock('../../src/systems/sections/sectionPreloader.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    preloadSection: hookPreloadSection,
  };
});

vi.mock('../../src/systems/sections/sectionNavigationResources.js', () => ({
  loadCurrentSectionResources: vi.fn(),
  resolveCurrentSectionForNavigation: vi.fn(() => 'auth'),
}));

beforeEach(() => {
  vi.resetModules();
  setActivePinia(createPinia());
  window.performanceTracker = { step: vi.fn() };
  vi.stubEnv('VITE_ENABLE_LOGGER', '');
  startBackgroundSectionPreloads.mockClear();
  startBackgroundSectionPreloads.mockResolvedValue(undefined);
  hookPreloadSection.mockClear();
  hookPreloadSection.mockResolvedValue(true);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('sectionContracts — barrel export stability (Phase G §144)', () => {
  it('systems/sections/index.js export names remain stable', async () => {
    const barrel = await import('../../src/systems/sections/index.js');

    expect(Object.keys(barrel).sort()).toMatchInlineSnapshot(`
      [
        "assignResolvedSectionToRouteMeta",
        "clearAllSectionCss",
        "clearManifestCache",
        "clearSectionCssPreloadHint",
        "clearSectionPreloadState",
        "getAllRouteSectionsForRoute",
        "getAllSectionVariants",
        "getLoadedSections",
        "getPreloadSectionsForRoute",
        "getPreloadStatistics",
        "getSectionBundlePaths",
        "getSectionPreloadPlan",
        "isSectionPreloaded",
        "isSectionRoleBased",
        "loadCurrentSectionResources",
        "loadRouteComponentWithSectionPreload",
        "loadSectionCss",
        "loadSectionManifest",
        "normalizeSectionConfiguration",
        "preloadDefaultAuthSection",
        "preloadMultipleSections",
        "preloadSection",
        "preloadSectionCss",
        "refreshSectionPreloadsOnLocaleChange",
        "resetSectionPreloadState",
        "resolveCurrentSectionForNavigation",
        "resolveCurrentSectionNameFromRouteConfig",
        "resolveRoleSectionVariant",
        "resolveSectionIdentifier",
        "shouldPreloadDefaultAuthSection",
        "startBackgroundSectionPreloads",
        "startCurrentSectionResourceLoads",
        "startPostNavigationSectionPreloads",
        "unloadSectionCss",
      ]
    `);
  });

  it('does not export deprecated preloadSectionBundle alias', async () => {
    const barrel = await import('../../src/systems/sections/index.js');
    expect(barrel.preloadSectionBundle).toBeUndefined();
  });
});

describe('sectionContracts — orchestrator plan shape (Phase G §144)', () => {
  it('getSectionPreloadPlan returns stable keys for role-based fixture', async () => {
    const { getSectionPreloadPlan } = await import(
      '../../src/systems/sections/sectionPreloadOrchestrator.js'
    );

    const plan = getSectionPreloadPlan(
      {
        slug: '/dashboard',
        section: { creator: 'dashboard-creator', fan: 'dashboard-fan' },
        preLoadSections: {
          creator: ['shop', 'analytics'],
          fan: ['shop'],
        },
      },
      'creator',
    );

    expect(Object.keys(plan).sort()).toMatchInlineSnapshot(`
      [
        "preloadSectionIdentifiers",
        "resolvedSectionNames",
      ]
    `);
    expect(plan).toMatchInlineSnapshot(`
      {
        "preloadSectionIdentifiers": [
          "shop",
          "analytics",
        ],
        "resolvedSectionNames": [
          "shop",
          "analytics",
        ],
      }
    `);
  });

  it('getSectionPreloadPlan returns empty arrays for null route config', async () => {
    const { getSectionPreloadPlan } = await import(
      '../../src/systems/sections/sectionPreloadOrchestrator.js'
    );

    expect(getSectionPreloadPlan(null, 'guest')).toEqual({
      preloadSectionIdentifiers: [],
      resolvedSectionNames: [],
    });
  });
});

describe('sectionContracts — non-blocking hook contracts (Phase G §144)', () => {
  it('startPostNavigationSectionPreloads returns immediately without awaiting background work', async () => {
    let releaseBackground;
    startBackgroundSectionPreloads.mockImplementation(
      () =>
        new Promise((resolve) => {
          releaseBackground = resolve;
        }),
    );

    const { startPostNavigationSectionPreloads } = await import(
      '../../src/systems/sections/sectionNavigationHooks.js'
    );

    const result = startPostNavigationSectionPreloads({
      to: { path: '/log-in', meta: { section: 'auth' } },
      from: { path: '/', meta: {} },
      routeConfig: { slug: '/log-in', section: 'auth', preLoadSections: ['shop'] },
      effectiveRouteConfig: { slug: '/log-in', section: 'auth', preLoadSections: ['shop'] },
      userRole: 'guest',
      activeLocale: 'en',
    });

    expect(result).toBeUndefined();
    expect(startBackgroundSectionPreloads).toHaveBeenCalled();

    releaseBackground();
  });

  it('preloadSection resolves to boolean via mocked preloader contract', async () => {
    const { preloadSection } = await import('../../src/systems/sections/sectionPreloader.js');
    await expect(preloadSection('auth')).resolves.toBe(true);
  });
});
