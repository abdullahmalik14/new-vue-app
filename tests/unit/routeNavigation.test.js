import { describe, it, expect, beforeEach } from 'vitest';
import {
  setCurrentActiveRoute,
  getCurrentActiveRoute,
  getPreviousActiveRoute,
  getNavigationHistory,
  clearNavigationHistory,
} from '../../src/utils/route/routeNavigation.js';

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
