/**
 * routeGuards.js — role guard (Phase C §8).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { guardCheckRouteUserRole } from '../../src/systems/routing/routeGuards.js';
import {
  KYC_GUARD_ROUTE,
  makeAuthenticatedContext,
  makeGuardContext,
  resetGuardModuleState,
} from '../helpers/routeFixtures.js';

beforeEach(async () => {
  delete window.performanceTracker;
  await resetGuardModuleState();
});

describe('guardCheckRouteUserRole (Phase C §8)', () => {
  it('allows any role when supportedRoles includes all', () => {
    const result = guardCheckRouteUserRole(
      { slug: '/shop', supportedRoles: ['all'] },
      makeAuthenticatedContext('fan'),
    );

    expect(result.isNavigationAllowed).toBe(true);
  });

  it('allows any role when supportedRoles is omitted', () => {
    const result = guardCheckRouteUserRole({ slug: '/shop' }, makeAuthenticatedContext('fan'));

    expect(result.isNavigationAllowed).toBe(true);
  });

  it('allows creator when supportedRoles lists creator', () => {
    const result = guardCheckRouteUserRole(
      { slug: '/dashboard/creator', supportedRoles: ['creator'] },
      makeAuthenticatedContext('creator'),
    );

    expect(result.isNavigationAllowed).toBe(true);
  });

  it('blocks fan when only creator is supported', () => {
    const result = guardCheckRouteUserRole(
      { slug: '/dashboard/creator', supportedRoles: ['creator'] },
      makeAuthenticatedContext('fan'),
    );

    expect(result.isNavigationAllowed).toBe(false);
    expect(result.redirectTargetPath).toBe('/404');
  });

  it('uses userProfile.role over context.userRole when both are set', () => {
    const result = guardCheckRouteUserRole(
      { slug: '/dashboard/creator', supportedRoles: ['creator'] },
      {
        ...makeAuthenticatedContext('fan'),
        userProfile: { role: 'creator' },
      },
    );

    expect(result.isNavigationAllowed).toBe(true);
  });

  it('defaults to guest when no role is in context', () => {
    const result = guardCheckRouteUserRole(
      { slug: '/dashboard/creator', supportedRoles: ['creator'] },
      makeGuardContext({ isAuthenticated: false }),
    );

    expect(result.isNavigationAllowed).toBe(false);
  });

  it('redirects authenticated guest-role user to onboarding', () => {
    const result = guardCheckRouteUserRole(
      { slug: '/dashboard/creator', supportedRoles: ['creator'] },
      makeAuthenticatedContext('guest'),
    );

    expect(result.isNavigationAllowed).toBe(false);
    expect(result.redirectTargetPath).toBe('/sign-up/onboarding');
  });

  it('allows non-creator through to dependency check when dependencies.roles entry exists', () => {
    const result = guardCheckRouteUserRole(KYC_GUARD_ROUTE, {
      userRole: 'vendor',
      userProfile: { role: 'vendor', onboardingPassed: false },
      isAuthenticated: true,
    });

    expect(result.isNavigationAllowed).toBe(true);
    expect(result.blockReason).toContain('dependency check');
  });
});
