/**
 * routeGuards.js — full guard chain (Phase C §3, §48).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as errorHandler from '../../src/infrastructure/errors/errorHandler.js';
import * as objectSafety from '../../src/utils/common/objectSafety.js';
import * as routeEnvAccess from '../../src/systems/routing/routeEnvAccess.js';
import { runAllRouteGuards } from '../../src/systems/routing/routeGuards.js';
import {
  DASHBOARD_DEPS_GUARD_ROUTE,
  makeAuthenticatedContext,
  makeGuardContext,
  resetGuardModuleState,
} from '../helpers/routeFixtures.js';

beforeEach(async () => {
  delete window.performanceTracker;
  delete window.reportAppError;
  await resetGuardModuleState();
  vi.restoreAllMocks();
});

describe('runAllRouteGuards (Phase C §3)', () => {
  it('allows navigation when all guards pass for public route', async () => {
    const result = await runAllRouteGuards(
      { slug: '/shop', supportedRoles: ['all'] },
      { slug: '/log-in' },
      makeGuardContext(),
    );

    expect(result.isNavigationAllowed).toBe(true);
    expect(result.redirectTargetPath).toBeNull();
    expect(result.blockReason).toBe('All guards passed');
  });

  it('blocks with loop guard before auth runs', async () => {
    const route = { slug: '/dashboard', requiresAuth: true };
    const from = { slug: '/dashboard' };

    await runAllRouteGuards(route, from, makeGuardContext());
    await runAllRouteGuards(route, from, makeGuardContext());
    const blocked = await runAllRouteGuards(route, from, makeGuardContext());

    expect(blocked.isNavigationAllowed).toBe(false);
    expect(blocked.blockReason).toBe('Navigation loop detected');
  });

  it('blocks with env guard before auth runs', async () => {
    vi.spyOn(routeEnvAccess, 'isRouteAccessibleInCurrentEnvironment').mockReturnValue(false);

    const result = await runAllRouteGuards(
      { slug: '/dev/demo', envAccess: 'development', requiresAuth: true },
      { slug: '/log-in' },
      makeGuardContext(),
    );

    expect(result.isNavigationAllowed).toBe(false);
    expect(result.blockReason).toContain('environment');
  });

  it('blocks with auth guard before role runs', async () => {
    const result = await runAllRouteGuards(
      { slug: '/dashboard', requiresAuth: true, supportedRoles: ['creator'] },
      { slug: '/log-in' },
      makeGuardContext(),
    );

    expect(result.isNavigationAllowed).toBe(false);
    expect(result.blockReason).toBe('Authentication required');
    expect(result.redirectTargetPath).toBe('/log-in');
  });

  it('blocks with admin guard before role runs', async () => {
    const result = await runAllRouteGuards(
      {
        slug: '/internal/tools',
        adminOnly: true,
        requiresAuth: true,
        supportedRoles: ['admin'],
      },
      { slug: '/log-in' },
      makeAuthenticatedContext('creator'),
    );

    expect(result.isNavigationAllowed).toBe(false);
    expect(result.blockReason).toContain('admin');
  });

  it('blocks with role guard before dependency runs', async () => {
    const result = await runAllRouteGuards(
      { slug: '/dashboard/creator', requiresAuth: true, supportedRoles: ['creator'] },
      { slug: '/log-in' },
      makeAuthenticatedContext('fan'),
    );

    expect(result.isNavigationAllowed).toBe(false);
    expect(result.blockReason).toContain('not authorized');
  });

  it('blocks with dependency guard after role allows creator', async () => {
    const result = await runAllRouteGuards(
      {
        ...DASHBOARD_DEPS_GUARD_ROUTE,
        requiresAuth: true,
      },
      { slug: '/log-in' },
      {
        ...makeAuthenticatedContext('creator'),
        userProfile: {
          role: 'creator',
          onboardingPassed: false,
          kycPassed: false,
        },
      },
    );

    expect(result.isNavigationAllowed).toBe(false);
    expect(result.redirectTargetPath).toBe('/sign-up/onboarding');
  });

  it('handles empty context as unauthenticated guest without throw', async () => {
    await expect(
      runAllRouteGuards({ slug: '/shop', supportedRoles: ['all'] }, { slug: '/log-in' }, {}),
    ).resolves.toMatchObject({ isNavigationAllowed: true });
  });

  it('handles null fromRoute for initial navigation', async () => {
    const result = await runAllRouteGuards(
      { slug: '/shop', supportedRoles: ['all'] },
      null,
      makeGuardContext(),
    );

    expect(result.isNavigationAllowed).toBe(true);
  });

  it('returns first failing guard result unchanged', async () => {
    const result = await runAllRouteGuards(
      { slug: '/dashboard', requiresAuth: true, redirectIfNotAuth: '/custom-login' },
      { slug: '/log-in' },
      makeGuardContext(),
    );

    expect(result).toEqual({
      isNavigationAllowed: false,
      redirectTargetPath: '/custom-login',
      blockReason: 'Authentication required',
    });
  });
});

describe('runAllRouteGuards — exception handling (S6)', () => {
  it('reports guard chain failures and returns guard error redirect', async () => {
    const reportSpy = vi.spyOn(errorHandler, 'reportApplicationError');
    const simulatedError = new Error('simulated dependency read failure');

    vi.spyOn(objectSafety, 'safelyGetNestedProperty').mockImplementation(() => {
      throw simulatedError;
    });

    const result = await runAllRouteGuards(
      {
        slug: '/dashboard',
        requiresAuth: true,
        dependencies: { roles: { creator: { onboardingPassed: { required: true } } } },
      },
      { slug: '/log-in' },
      {
        isAuthenticated: true,
        userRole: 'creator',
        userProfile: { role: 'creator', onboardingPassed: false },
      },
    );

    expect(result.isNavigationAllowed).toBe(false);
    expect(result.redirectTargetPath).toBe('/404');
    expect(result.blockReason).toBe('Guard execution failed');
    expect(result.errorCode).toBe('GUARD_CHAIN_FAILURE');
    expect(reportSpy).toHaveBeenCalled();
  });
});
