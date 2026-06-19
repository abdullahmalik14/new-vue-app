/**
 * routeGuards.js — dependency guard (Phase C §9 + onboarding → KYC).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { guardCheckDependencies } from '../../src/systems/routing/routeGuards.js';
import {
  DASHBOARD_DEPS_GUARD_ROUTE,
  KYC_GUARD_ROUTE,
  ONBOARDING_GUARD_ROUTE,
  makeAuthenticatedContext,
  makeGuardContext,
  resetGuardModuleState,
} from '../helpers/routeFixtures.js';

beforeEach(async () => {
  delete window.performanceTracker;
  await resetGuardModuleState();
});

describe('guardCheckDependencies — onboarding → KYC ordering (Phase C §9)', () => {
  it('allows when dependencies are omitted', () => {
    const result = guardCheckDependencies({ slug: '/shop' }, makeAuthenticatedContext('creator'));

    expect(result.isNavigationAllowed).toBe(true);
  });

  it('allows guest on public route without running role deps', () => {
    const result = guardCheckDependencies(
      {
        slug: '/log-in',
        requiresAuth: false,
        dependencies: {
          roles: {
            creator: {
              onboardingPassed: { required: true, fallbackSlug: '/sign-up/onboarding' },
            },
          },
        },
      },
      makeGuardContext(),
    );

    expect(result.isNavigationAllowed).toBe(true);
    expect(result.blockReason).toContain('Guest on public route');
  });

  it('blocks non-creator on KYC route when no dependency redirect applies (L6)', () => {
    const result = guardCheckDependencies(KYC_GUARD_ROUTE, {
      userRole: 'vendor',
      userProfile: { role: 'vendor', onboardingPassed: false },
      isAuthenticated: true,
    });

    expect(result.isNavigationAllowed).toBe(false);
    expect(result.redirectTargetPath).toBe('/404');
    expect(result.blockReason).toContain('not authorized');
  });

  it('redirects non-creator when redirectIfComplete applies', () => {
    const result = guardCheckDependencies(KYC_GUARD_ROUTE, {
      userRole: 'vendor',
      userProfile: { role: 'vendor', onboardingPassed: true },
      isAuthenticated: true,
    });

    expect(result.isNavigationAllowed).toBe(false);
    expect(result.redirectTargetPath).toBe('/dashboard');
  });

  it('allows creator on KYC route when onboarding passed and kyc incomplete', () => {
    const result = guardCheckDependencies(KYC_GUARD_ROUTE, {
      userRole: 'creator',
      userProfile: {
        role: 'creator',
        onboardingPassed: true,
        kycPassed: false,
      },
      isAuthenticated: true,
    });

    expect(result.isNavigationAllowed).toBe(true);
  });

  it('does not redirect off onboarding when kycPassed but onboardingPassed is false', () => {
    const result = guardCheckDependencies(ONBOARDING_GUARD_ROUTE, {
      userRole: 'creator',
      userProfile: {
        role: 'creator',
        onboardingPassed: false,
        kycPassed: true,
      },
      isAuthenticated: true,
    });

    expect(result.isNavigationAllowed).toBe(true);
  });

  it('dashboard sends incomplete onboarding to /sign-up/onboarding', () => {
    const result = guardCheckDependencies(DASHBOARD_DEPS_GUARD_ROUTE, {
      userRole: 'creator',
      userProfile: {
        role: 'creator',
        onboardingPassed: false,
        kycPassed: true,
      },
      isAuthenticated: true,
    });

    expect(result.isNavigationAllowed).toBe(false);
    expect(result.redirectTargetPath).toBe('/sign-up/onboarding');
  });

  it('onboarding redirects to kyc when onboarding complete and kyc incomplete', () => {
    const result = guardCheckDependencies(ONBOARDING_GUARD_ROUTE, {
      userRole: 'creator',
      userProfile: {
        role: 'creator',
        onboardingPassed: true,
        kycPassed: false,
      },
      isAuthenticated: true,
    });

    expect(result.isNavigationAllowed).toBe(false);
    expect(result.redirectTargetPath).toBe('/sign-up/onboarding/kyc');
  });

  it('blocks when required dependency is missing (not strictly true)', () => {
    const result = guardCheckDependencies(
      {
        slug: '/protected',
        supportedRoles: ['creator'],
        dependencies: {
          roles: {
            creator: {
              onboardingPassed: { required: true, fallbackSlug: '/sign-up/onboarding' },
            },
          },
        },
      },
      {
        ...makeAuthenticatedContext('creator'),
        userProfile: { role: 'creator', onboardingPassed: 'true' },
      },
    );

    expect(result.isNavigationAllowed).toBe(false);
    expect(result.blockReason).toContain('Missing required dependency');
  });

  it('passes with empty dependencies object', () => {
    const result = guardCheckDependencies(
      { slug: '/dashboard', dependencies: {} },
      makeAuthenticatedContext('creator'),
    );

    expect(result.isNavigationAllowed).toBe(true);
  });
});
