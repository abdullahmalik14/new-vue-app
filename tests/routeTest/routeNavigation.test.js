/**
 * routeNavigation.js — Phase D (route test plan §11).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  setCurrentActiveRoute,
  getCurrentActivePath,
  getCurrentActiveRoute,
  getCurrentRouteChain,
  getPreviousActiveRoute,
  getPreviousActivePath,
  getNavigationHistory,
  canNavigateBack,
  clearNavigationHistory,
  getNavigationStatistics,
  isOnPath,
  wasPreviouslyOnPath,
} from '../../src/systems/routing/routeNavigation.js';

beforeEach(() => {
  delete window.performanceTracker;
  clearNavigationHistory();
});

describe('routeNavigation (Phase D §11)', () => {
  it('returns null active path before any navigation', () => {
    expect(getCurrentActivePath()).toBeNull();
    expect(getCurrentActiveRoute()).toBeNull();
    expect(getCurrentRouteChain()).toEqual([]);
  });

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

  it('stores parent route chain for nested paths', () => {
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
    expect(getPreviousActivePath()).toBe('/log-in');
    expect(getCurrentActivePath()).toBe('/dashboard');
  });

  it('canNavigateBack is false on first navigation and true after second', () => {
    expect(canNavigateBack()).toBe(false);

    setCurrentActiveRoute({ slug: '/log-in' });
    expect(canNavigateBack()).toBe(false);

    setCurrentActiveRoute({ slug: '/dashboard' });
    expect(canNavigateBack()).toBe(true);
  });

  it('getNavigationHistory respects maxEntries limit', () => {
    setCurrentActiveRoute({ slug: '/log-in' });
    setCurrentActiveRoute({ slug: '/dashboard' });
    setCurrentActiveRoute({ slug: '/shop' });

    const limited = getNavigationHistory(2);

    expect(limited).toHaveLength(2);
    expect(limited[0].path).toBe('/dashboard');
    expect(limited[1].path).toBe('/shop');
  });

  it('getNavigationStatistics reports navigation counts', () => {
    setCurrentActiveRoute({ slug: '/log-in' });
    setCurrentActiveRoute({ slug: '/dashboard' });

    const stats = getNavigationStatistics();

    expect(stats.totalNavigations).toBe(2);
    expect(stats.currentRoute).toBe('/dashboard');
    expect(stats.previousRoute).toBe('/log-in');
    expect(stats.canGoBack).toBe(true);
    expect(stats.uniqueRoutes).toBe(2);
  });

  it('isOnPath matches current slug', () => {
    setCurrentActiveRoute({ slug: '/dashboard' });

    expect(isOnPath('/dashboard')).toBe(true);
    expect(isOnPath('/log-in')).toBe(false);
  });

  it('wasPreviouslyOnPath finds earlier visits', () => {
    setCurrentActiveRoute({ slug: '/log-in' });
    setCurrentActiveRoute({ slug: '/dashboard' });

    expect(wasPreviouslyOnPath('/log-in')).toBe(true);
    expect(wasPreviouslyOnPath('/shop')).toBe(false);
  });

  it('clearNavigationHistory resets all navigation state', () => {
    setCurrentActiveRoute({ slug: '/log-in' });
    setCurrentActiveRoute({ slug: '/dashboard' });

    clearNavigationHistory();

    expect(getCurrentActiveRoute()).toBeNull();
    expect(getPreviousActiveRoute()).toBeNull();
    expect(getNavigationHistory()).toEqual([]);
    expect(canNavigateBack()).toBe(false);
  });
});
