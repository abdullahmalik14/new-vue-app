/**
 * Contract snapshots and stability guards — Phase G (route test plan §93).
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  DASHBOARD_DEPS_GUARD_ROUTE,
  makeAuthenticatedContext,
  makeGuardContext,
  resetGuardModuleState,
} from '../helpers/routeFixtures.js';

function guardResultContract(result) {
  return {
    keys: Object.keys(result).sort(),
    isNavigationAllowed: typeof result.isNavigationAllowed,
    redirectTargetPath:
      result.redirectTargetPath === null ? null : typeof result.redirectTargetPath,
    blockReason: typeof result.blockReason,
  };
}

beforeEach(async () => {
  delete window.performanceTracker;
  await resetGuardModuleState();
});

describe('routeContracts — guard block shapes (Phase G §93)', () => {
  it('guardCheckAuthentication block result matches contract', async () => {
    const { guardCheckAuthentication } = await import('../../src/systems/routing/routeGuards.js');

    const result = guardCheckAuthentication(
      { slug: '/dashboard', requiresAuth: true },
      makeGuardContext(),
    );

    expect(guardResultContract(result)).toMatchInlineSnapshot(`
      {
        "blockReason": "string",
        "isNavigationAllowed": "boolean",
        "keys": [
          "blockReason",
          "isNavigationAllowed",
          "redirectTargetPath",
        ],
        "redirectTargetPath": "string",
      }
    `);
  });

  it('guardCheckRouteUserRole block result matches contract', async () => {
    const { guardCheckRouteUserRole } = await import('../../src/systems/routing/routeGuards.js');

    const result = guardCheckRouteUserRole(
      { slug: '/dashboard/creator', supportedRoles: ['creator'] },
      makeAuthenticatedContext('fan'),
    );

    expect(guardResultContract(result)).toMatchInlineSnapshot(`
      {
        "blockReason": "string",
        "isNavigationAllowed": "boolean",
        "keys": [
          "blockReason",
          "isNavigationAllowed",
          "redirectTargetPath",
        ],
        "redirectTargetPath": "string",
      }
    `);
  });

  it('guardCheckDependencies block result matches contract', async () => {
    const { guardCheckDependencies } = await import('../../src/systems/routing/routeGuards.js');

    const result = guardCheckDependencies(
      DASHBOARD_DEPS_GUARD_ROUTE,
      makeAuthenticatedContext('creator', { onboardingPassed: false, kycPassed: false }),
    );

    expect(result.isNavigationAllowed).toBe(false);
    expect(guardResultContract(result)).toMatchInlineSnapshot(`
      {
        "blockReason": "string",
        "isNavigationAllowed": "boolean",
        "keys": [
          "blockReason",
          "isNavigationAllowed",
          "redirectTargetPath",
        ],
        "redirectTargetPath": "string",
      }
    `);
  });

  it('runAllRouteGuards allow result uses null redirectTargetPath not undefined', async () => {
    const { runAllRouteGuards } = await import('../../src/systems/routing/routeGuards.js');

    const result = await runAllRouteGuards(
      { slug: '/shop', supportedRoles: ['all'] },
      { slug: '/log-in' },
      makeGuardContext(),
    );

    expect(result.redirectTargetPath).toBeNull();
    expect(result.blockReason.length).toBeGreaterThan(0);
  });
});

describe('routeContracts — config stability (Phase G §93)', () => {
  it('ROUTE_DEFAULTS keys remain stable', async () => {
    const { ROUTE_DEFAULTS } = await import('../../src/systems/routing/routeDefaults.js');

    expect(Object.keys(ROUTE_DEFAULTS).sort()).toMatchInlineSnapshot(`
      [
        "dashboard",
        "login",
        "notFound",
      ]
    `);
    expect(ROUTE_DEFAULTS.login).toBe('/log-in');
    expect(ROUTE_DEFAULTS.notFound).toBe('/404');
  });

  it('ROUTE_TRANSITION_PRESETS remains stable', async () => {
    const { ROUTE_TRANSITION_PRESETS } = await import('../../src/systems/routing/routeTransition.js');

    expect([...ROUTE_TRANSITION_PRESETS]).toMatchInlineSnapshot(`
      [
        "route-fade",
        "route-slide-fade",
        "none",
      ]
    `);
  });

  it('validateRouteConfig returns expected shape for invalid fixture', async () => {
    const { validateRouteConfig } = await import('../../src/systems/build/jsonConfigValidator.js');

    const result = validateRouteConfig([{ slug: '/broken-route' }]);

    expect({
      keys: Object.keys(result).sort(),
      valid: result.valid,
      errorCount: result.errors.length,
      warningCount: result.warnings.length,
    }).toMatchInlineSnapshot(`
      {
        "errorCount": 3,
        "keys": [
          "errors",
          "valid",
          "warnings",
        ],
        "valid": false,
        "warningCount": 0,
      }
    `);
  });

  it('getRoutePreloadPlan snapshot for role-based preload fixture', async () => {
    const { getRoutePreloadPlan } = await import(
      '../../src/systems/sections/sectionPreloadOrchestrator.js'
    );

    const plan = getRoutePreloadPlan(
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

    expect({
      preloadSectionIdentifiers: plan.preloadSectionIdentifiers,
      resolvedSectionNames: plan.resolvedSectionNames,
    }).toMatchInlineSnapshot(`
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

  it('findDuplicateRoutePathClaims snapshot for duplicate alias fixture', async () => {
    const { findDuplicateRoutePathClaims } = await import('../../src/systems/routing/routeAliasResolver.js');

    const duplicates = findDuplicateRoutePathClaims([
      { slug: '/dashboard', aliases: ['/home'] },
      { slug: '/shop', aliases: ['/home'] },
    ]);

    expect(duplicates.map((entry) => entry.path)).toEqual(['/home']);
  });

  it('buildHreflangAlternateUrls preserves locale ordering contract', async () => {
    const { buildHreflangAlternateUrls } = await import('../../src/systems/i18n/routeHreflangTags.js');

    const alternates = buildHreflangAlternateUrls('/shop', {
      origin: 'https://example.com',
      supportedLocales: ['en', 'vi', 'fr'],
      defaultLocale: 'en',
    });

    expect(alternates.map((entry) => entry.hreflang)).toEqual(['en', 'vi', 'fr', 'x-default']);
    expect(alternates.find((entry) => entry.hreflang === 'x-default')?.href).toBe(
      'https://example.com/shop',
    );
  });

  it('resolveRouteFromPath snapshot for canonical dashboard slug', async () => {
    const { resolveRouteFromPath } = await import('../../src/systems/routing/routeResolver.js');

    const route = resolveRouteFromPath('/dashboard');

    expect({
      slug: route?.slug,
      section: route?.section,
      supportedRoles: route?.supportedRoles,
    }).toMatchInlineSnapshot(`
      {
        "section": "dashboard-global",
        "slug": "/dashboard",
        "supportedRoles": [
          "all",
        ],
      }
    `);
  });
});

describe('routeContracts — navigation progress transitions (Phase G §93)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    const { failNavigationProgress } = await import(
      '../../src/systems/routing/navigationProgressTracker.js'
    );
    failNavigationProgress();
    vi.useRealTimers();
  });

  it('useNavigationProgress state transitions for start/fail/finish flow', async () => {
    const {
      startNavigationProgress,
      finishNavigationProgress,
      failNavigationProgress,
      useNavigationProgress,
    } = await import('../../src/systems/routing/navigationProgressTracker.js');

    const snapshot = () => ({
      isActive: useNavigationProgress().isActive.value,
      progress: Number(useNavigationProgress().progress.value.toFixed(2)),
    });

    startNavigationProgress();
    expect(snapshot()).toMatchInlineSnapshot(`
      {
        "isActive": true,
        "progress": 0.08,
      }
    `);

    failNavigationProgress();
    expect(snapshot()).toMatchInlineSnapshot(`
      {
        "isActive": false,
        "progress": 0,
      }
    `);

    startNavigationProgress();
    finishNavigationProgress();
    expect(snapshot()).toMatchInlineSnapshot(`
      {
        "isActive": true,
        "progress": 1,
      }
    `);

    vi.advanceTimersByTime(300);
    expect(snapshot()).toMatchInlineSnapshot(`
      {
        "isActive": false,
        "progress": 0,
      }
    `);
  });
});
