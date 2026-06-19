/**
 * routeGuards.js — authentication guard (Phase C §6).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { guardCheckAuthentication } from '../../src/systems/routing/routeGuards.js';
import {
  makeAuthenticatedContext,
  makeGuardContext,
  resetGuardModuleState,
} from '../helpers/routeFixtures.js';

beforeEach(async () => {
  delete window.performanceTracker;
  await resetGuardModuleState();
});

describe('guardCheckAuthentication (Phase C §6)', () => {
  it('allows public route when guest is not authenticated', () => {
    const result = guardCheckAuthentication(
      { slug: '/log-in', requiresAuth: false },
      makeGuardContext(),
    );

    expect(result.isNavigationAllowed).toBe(true);
    expect(result.redirectTargetPath).toBeNull();
  });

  it('blocks requiresAuth route when guest is not authenticated', () => {
    const result = guardCheckAuthentication(
      { slug: '/dashboard', requiresAuth: true },
      makeGuardContext(),
    );

    expect(result.isNavigationAllowed).toBe(false);
    expect(result.blockReason).toBe('Authentication required');
  });

  it('redirects to redirectIfNotAuth when set and unauthenticated', () => {
    const result = guardCheckAuthentication(
      {
        slug: '/dashboard',
        requiresAuth: true,
        redirectIfNotAuth: '/custom-login',
      },
      makeGuardContext(),
    );

    expect(result.redirectTargetPath).toBe('/custom-login');
  });

  it('redirects to default login slug when redirectIfNotAuth is missing', () => {
    const result = guardCheckAuthentication(
      { slug: '/dashboard', requiresAuth: true },
      makeGuardContext(),
    );

    expect(result.redirectTargetPath).toBe('/log-in');
  });

  it('allows authenticated user on protected route', () => {
    const result = guardCheckAuthentication(
      { slug: '/dashboard', requiresAuth: true },
      makeAuthenticatedContext('creator'),
    );

    expect(result.isNavigationAllowed).toBe(true);
  });

  it('redirects authenticated user away from login page with redirectIfLoggedIn', () => {
    const result = guardCheckAuthentication(
      {
        slug: '/log-in',
        redirectIfLoggedIn: '/dashboard',
      },
      makeAuthenticatedContext('creator'),
    );

    expect(result.isNavigationAllowed).toBe(false);
    expect(result.redirectTargetPath).toBe('/dashboard');
    expect(result.blockReason).toBe('Already authenticated');
  });

  it('allows guest on login page without redirectIfLoggedIn', () => {
    const result = guardCheckAuthentication({ slug: '/log-in' }, makeGuardContext());

    expect(result.isNavigationAllowed).toBe(true);
  });

  it('treats requiresAuth undefined as not required', () => {
    const result = guardCheckAuthentication({ slug: '/shop' }, makeGuardContext());

    expect(result.isNavigationAllowed).toBe(true);
  });
});
