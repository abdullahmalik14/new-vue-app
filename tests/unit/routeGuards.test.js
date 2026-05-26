import { describe, it, expect, beforeEach } from 'vitest';
import {
  guardCheckUserRole,
  guardCheckDependencies,
} from '../../src/utils/route/routeGuards.js';

/** Mirrors /sign-up/onboarding/kyc non-creator redirect pattern */
const kycRoute = {
  slug: '/sign-up/onboarding/kyc',
  supportedRoles: ['creator'],
  dependencies: {
    roles: {
      creator: {
        onboardingPassed: { required: true, fallbackSlug: '/sign-up/onboarding' },
        kycPassed: { redirectIfComplete: true, fallbackSlug: '/dashboard' },
      },
      vendor: {
        onboardingPassed: { redirectIfComplete: true, fallbackSlug: '/dashboard' },
      },
    },
  },
};

describe('routeGuards L6 — supportedRoles vs dependencies.roles', () => {
  beforeEach(() => {
    delete window.performanceTracker;
  });

  it('role guard allows non-creator when dependencies.roles entry exists', () => {
    const result = guardCheckUserRole(kycRoute, {
      userRole: 'vendor',
      userProfile: { role: 'vendor', onboardingPassed: false },
      isAuthenticated: true,
    });

    expect(result.allow).toBe(true);
    expect(result.reason).toContain('dependency check');
  });

  it('dependency guard blocks non-creator when no dependency redirect applies (L6)', () => {
    const result = guardCheckDependencies(kycRoute, {
      userRole: 'vendor',
      userProfile: { role: 'vendor', onboardingPassed: false },
      isAuthenticated: true,
    });

    expect(result.allow).toBe(false);
    expect(result.redirectTo).toBe('/404');
    expect(result.reason).toContain('not authorized');
  });

  it('dependency guard redirects non-creator when redirectIfComplete applies', () => {
    const result = guardCheckDependencies(kycRoute, {
      userRole: 'vendor',
      userProfile: { role: 'vendor', onboardingPassed: true },
      isAuthenticated: true,
    });

    expect(result.allow).toBe(false);
    expect(result.redirectTo).toBe('/dashboard');
  });

  it('dependency guard allows creator in supportedRoles when deps met', () => {
    const result = guardCheckDependencies(kycRoute, {
      userRole: 'creator',
      userProfile: {
        role: 'creator',
        onboardingPassed: true,
        kycPassed: false,
      },
      isAuthenticated: true,
    });

    expect(result.allow).toBe(true);
  });
});

describe('routeGuards onboarding redirect loop (L13 follow-up)', () => {
  const onboardingRoute = {
    slug: '/sign-up/onboarding',
    supportedRoles: ['all'],
    dependencies: {
      roles: {
        creator: {
          kycPassed: {
            redirectIfComplete: true,
            fallbackSlug: '/dashboard',
          },
          onboardingPassed: {
            redirectIfComplete: true,
            fallbackSlug: '/sign-up/onboarding/kyc',
          },
        },
      },
    },
  };

  const dashboardRoute = {
    slug: '/dashboard',
    supportedRoles: ['all'],
    dependencies: {
      roles: {
        creator: {
          onboardingPassed: {
            required: true,
            fallbackSlug: '/sign-up/onboarding',
          },
          kycPassed: {
            required: true,
            fallbackSlug: '/sign-up/onboarding/kyc',
          },
        },
      },
    },
  };

  beforeEach(() => {
    delete window.performanceTracker;
  });

  it('does not redirect off onboarding when kycPassed but onboardingPassed is false', () => {
    const result = guardCheckDependencies(onboardingRoute, {
      userRole: 'creator',
      userProfile: {
        role: 'creator',
        onboardingPassed: false,
        kycPassed: true,
      },
      isAuthenticated: true,
    });

    expect(result.allow).toBe(true);
  });

  it('dashboard still sends incomplete onboarding to /sign-up/onboarding', () => {
    const result = guardCheckDependencies(dashboardRoute, {
      userRole: 'creator',
      userProfile: {
        role: 'creator',
        onboardingPassed: false,
        kycPassed: true,
      },
      isAuthenticated: true,
    });

    expect(result.allow).toBe(false);
    expect(result.redirectTo).toBe('/sign-up/onboarding');
  });

  it('onboarding redirects to kyc when onboarding complete and kyc incomplete', () => {
    const result = guardCheckDependencies(onboardingRoute, {
      userRole: 'creator',
      userProfile: {
        role: 'creator',
        onboardingPassed: true,
        kycPassed: false,
      },
      isAuthenticated: true,
    });

    expect(result.allow).toBe(false);
    expect(result.redirectTo).toBe('/sign-up/onboarding/kyc');
  });
});
