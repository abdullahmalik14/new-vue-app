/**
 * routeDefaults.js — Phase B (route test plan §20).
 */

import { describe, it, expect } from 'vitest';
import {
  getDefaultNotFoundSlug,
  getDefaultGuardErrorSlug,
  getDefaultNavigationErrorSlug,
  getDefaultLoginSlug,
  getDefaultDashboardSlug,
  ROUTE_DEFAULTS,
} from '../../src/systems/routing/routeDefaults.js';
import { loadRouteDefaults } from '../helpers/routeFixtures.js';

describe('routeDefaults (Phase B §20)', () => {
  const jsonDefaults = loadRouteDefaults();

  it('getDefaultNotFoundSlug matches routeDefaults.json', () => {
    expect(getDefaultNotFoundSlug()).toBe(jsonDefaults.notFoundSlug);
    expect(getDefaultNotFoundSlug()).toBe('/404');
  });

  it('getDefaultGuardErrorSlug matches routeDefaults.json', () => {
    expect(getDefaultGuardErrorSlug()).toBe(jsonDefaults.guardErrorSlug);
  });

  it('getDefaultNavigationErrorSlug matches routeDefaults.json', () => {
    expect(getDefaultNavigationErrorSlug()).toBe(jsonDefaults.navigationErrorSlug);
  });

  it('getDefaultLoginSlug matches routeDefaults.json', () => {
    expect(getDefaultLoginSlug()).toBe(jsonDefaults.loginSlug);
    expect(getDefaultLoginSlug()).toBe('/log-in');
  });

  it('getDefaultDashboardSlug matches routeDefaults.json', () => {
    expect(getDefaultDashboardSlug()).toBe(jsonDefaults.dashboardSlug);
    expect(getDefaultDashboardSlug()).toBe('/dashboard');
  });

  it('ROUTE_DEFAULTS mirrors JSON keys for login, dashboard, and notFound', () => {
    expect(ROUTE_DEFAULTS).toEqual({
      notFound: getDefaultNotFoundSlug(),
      login: getDefaultLoginSlug(),
      dashboard: getDefaultDashboardSlug(),
    });
  });
});
