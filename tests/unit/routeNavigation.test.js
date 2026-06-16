import { describe, it, expect, beforeEach } from 'vitest';
import {
  setCurrentActiveRoute,
  getCurrentActiveRoute,
  getCurrentRouteChain,
  getPreviousActiveRoute,
  getNavigationHistory,
  clearNavigationHistory,
} from '../../src/systems/routing/routeNavigation.js';

beforeEach(() => {
  delete window.performanceTracker;
  clearNavigationHistory();
});

describe('routeNavigation snapshots (A8)', () => {
  it('stores a deep snapshot so later mutations do not alter history', () => {
    const route = {
      slug: '/dashboard',
      requiresAuth: true,
      supportedRoles: ['creator'],
    };

    setCurrentActiveRoute(route);
    route.requiresAuth = false;
    route.supportedRoles.push('guest');

    expect(getCurrentActiveRoute()).toMatchObject({
      slug: '/dashboard',
      requiresAuth: true,
      supportedRoles: ['creator'],
    });

    const [historyEntry] = getNavigationHistory(1);
    expect(historyEntry.route).toMatchObject({
      slug: '/dashboard',
      requiresAuth: true,
      supportedRoles: ['creator'],
    });
    expect(historyEntry.route).not.toBe(route);
  });

  it('stores parent route chain for nested paths (A7)', () => {
    setCurrentActiveRoute({ slug: '/dashboard/analytics' });

    const chain = getCurrentRouteChain();

    expect(chain.length).toBeGreaterThanOrEqual(2);
    expect(chain[0].slug).toBe('/dashboard');
    expect(chain[chain.length - 1].slug).toBe('/dashboard/analytics');
  });

  it('keeps previous route snapshot when navigating again', () => {
    const first = { slug: '/log-in', requiresAuth: false };
    const second = { slug: '/dashboard', requiresAuth: true };

    setCurrentActiveRoute(first);
    first.requiresAuth = true;

    setCurrentActiveRoute(second);

    expect(getPreviousActiveRoute()).toMatchObject({
      slug: '/log-in',
      requiresAuth: false,
    });
    expect(getPreviousActiveRoute()).not.toBe(first);
  });
});
