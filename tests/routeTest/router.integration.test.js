/**
 * Router integration journeys — Phase E (route test plan §38, §87).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createRouter, createMemoryHistory } from 'vue-router';
import { runAllRouteGuards } from '../../src/systems/routing/routeGuards.js';
import {
  clearNavigationHistory,
  setCurrentActiveRoute,
} from '../../src/systems/routing/routeNavigation.js';
import {
  makeAuthenticatedContext,
  makeGuardContext,
  resetGuardModuleState,
} from '../helpers/routeFixtures.js';

/** @type {object} */
let authContext = makeGuardContext();

function createIntegrationRouter() {
  const routes = [
    {
      path: '/log-in',
      name: '/log-in',
      component: { template: '<div>Login</div>' },
      meta: {
        routeConfig: {
          slug: '/log-in',
          supportedRoles: ['all'],
          redirectIfLoggedIn: '/dashboard',
        },
      },
    },
    {
      path: '/dashboard',
      name: '/dashboard',
      component: { template: '<div>Dashboard</div>' },
      meta: {
        routeConfig: {
          slug: '/dashboard',
          requiresAuth: true,
          redirectIfNotAuth: '/log-in',
          supportedRoles: ['creator', 'fan'],
        },
      },
    },
    {
      path: '/404',
      name: '/404',
      component: { template: '<div>Not found</div>' },
      meta: {
        routeConfig: {
          slug: '/404',
          supportedRoles: ['all'],
        },
      },
    },
  ];

  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  });

  router.beforeEach(async (to, from, next) => {
    const guardResult = await runAllRouteGuards(
      to.meta.routeConfig,
      from.meta?.routeConfig || null,
      authContext,
    );

    if (!guardResult.isNavigationAllowed) {
      if (guardResult.redirectTargetPath) {
        return next(guardResult.redirectTargetPath);
      }
      return next(false);
    }

    next();
  });

  router.afterEach((to) => {
    if (to.meta?.routeConfig) {
      setCurrentActiveRoute(to.meta.routeConfig);
    }
  });

  return router;
}

beforeEach(async () => {
  delete window.performanceTracker;
  authContext = makeGuardContext();
  clearNavigationHistory();
  await resetGuardModuleState();
});

describe('router.integration (Phase E §87)', () => {
  it('guest navigating to protected route redirects to login', async () => {
    const router = createIntegrationRouter();

    await router.push('/dashboard');

    expect(router.currentRoute.value.path).toBe('/log-in');
  });

  it('authenticated user can reach protected dashboard', async () => {
    authContext = makeAuthenticatedContext('creator');
    const router = createIntegrationRouter();

    await router.push('/dashboard');

    expect(router.currentRoute.value.path).toBe('/dashboard');
  });

  it('authenticated user on login page redirects to dashboard', async () => {
    authContext = makeAuthenticatedContext('creator');
    const router = createIntegrationRouter();

    await router.push('/log-in');

    expect(router.currentRoute.value.path).toBe('/dashboard');
  });

  it('guest can access public login route', async () => {
    const router = createIntegrationRouter();

    await router.push('/log-in');

    expect(router.currentRoute.value.path).toBe('/log-in');
  });

  it('updates route navigation state after successful navigation', async () => {
    authContext = makeAuthenticatedContext('creator');
    const router = createIntegrationRouter();

    await router.push('/dashboard');

    const { getCurrentActiveRoute } = await import('../../src/systems/routing/routeNavigation.js');

    expect(getCurrentActiveRoute()?.slug).toBe('/dashboard');
  });
});
