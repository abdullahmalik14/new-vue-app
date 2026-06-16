import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as errorHandler from '../../src/infrastructure/errors/errorHandler.js';
import * as objectSafety from '../../src/utils/common/objectSafety.js';
import * as routeGuardsModule from '../../src/systems/routing/routeGuards.js';

describe('routeGuards S6 — guard chain exception handling', () => {
  beforeEach(() => {
    delete window.performanceTracker;
    delete window.reportAppError;
    vi.restoreAllMocks();
  });

  it('reports guard chain failures via reportApplicationError and returns guard error redirect', async () => {
    const reportSpy = vi.spyOn(errorHandler, 'reportApplicationError');
    const simulatedError = new Error('simulated dependency read failure');

    vi.spyOn(objectSafety, 'safelyGetNestedProperty').mockImplementation(() => {
      throw simulatedError;
    });

    const result = await routeGuardsModule.runAllRouteGuards(
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
    expect(reportSpy).toHaveBeenCalledWith(
      'routeGuards.js',
      'runAllRouteGuards',
      'Guard chain execution failed',
      simulatedError,
      expect.objectContaining({
        toSlug: '/dashboard',
        fromSlug: '/log-in',
        userRole: 'creator',
        errorCode: 'GUARD_CHAIN_FAILURE',
      }),
    );
  });

  it('forwards guard chain failures to window.reportAppError when configured', async () => {
    const reportAppError = vi.fn();
    window.reportAppError = reportAppError;

    vi.spyOn(objectSafety, 'safelyGetNestedProperty').mockImplementation(() => {
      throw new Error('external reporter test');
    });

    await routeGuardsModule.runAllRouteGuards(
      {
        slug: '/dashboard',
        requiresAuth: true,
        dependencies: { roles: { creator: { onboardingPassed: { required: true } } } },
      },
      { slug: '/log-in' },
      {
        isAuthenticated: true,
        userRole: 'creator',
        userProfile: { role: 'creator' },
      },
    );

    expect(reportAppError).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: 'routeGuards.js',
        methodName: 'runAllRouteGuards',
        description: 'Guard chain execution failed',
        message: 'external reporter test',
        errorCode: 'GUARD_CHAIN_FAILURE',
      }),
    );
  });
});
