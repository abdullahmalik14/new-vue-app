/**
 * Route Defaults - Centralized defaults for fallback redirects
 * Values are loaded from JSON to keep paths out of code.
 */

import defaults from '../../router/routeDefaults.json';

export function getDefaultNotFoundSlug() {
  return defaults?.notFoundSlug || '/404';
}

export function getDefaultLoginSlug() {
  return defaults?.loginSlug || '/log-in';
}

export function getDefaultDashboardSlug() {
  return defaults?.dashboardSlug || '/dashboard';
}

export const ROUTE_DEFAULTS = {
  notFound: getDefaultNotFoundSlug(),
  login: getDefaultLoginSlug(),
  dashboard: getDefaultDashboardSlug()
};


