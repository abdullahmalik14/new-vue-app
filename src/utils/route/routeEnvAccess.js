/**
 * Route environment access control.
 *
 * Routes may declare `envAccess: "development"` to stay available only in
 * local dev (`import.meta.env.DEV`). Production and staging builds skip
 * registration and guards return 404.
 */

export const ROUTE_ENV_ACCESS = {
  ALL: 'all',
  DEVELOPMENT: 'development',
};

const VALID_ENV_ACCESS = new Set(Object.values(ROUTE_ENV_ACCESS));

/**
 * @param {object} [options]
 * @param {boolean} [options.isDevelopment] - Explicit override for tests/build scripts
 * @returns {boolean}
 */
export function isDevelopmentEnvironment(options = {}) {
  if (typeof options.isDevelopment === 'boolean') {
    return options.isDevelopment;
  }

  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.DEV === true;
  }

  return process.env.NODE_ENV !== 'production';
}

/**
 * @param {object|null|undefined} route
 * @param {object} [options]
 * @param {boolean} [options.isDevelopment]
 * @returns {boolean}
 */
export function isRouteAccessibleInCurrentEnvironment(route, options = {}) {
  if (!route) {
    return false;
  }

  const envAccess = route.envAccess;
  if (!envAccess || envAccess === ROUTE_ENV_ACCESS.ALL) {
    return true;
  }

  if (envAccess === ROUTE_ENV_ACCESS.DEVELOPMENT) {
    return isDevelopmentEnvironment(options);
  }

  return true;
}

/**
 * @param {string|undefined} envAccess
 * @returns {boolean}
 */
export function isValidRouteEnvAccess(envAccess) {
  if (envAccess === undefined) {
    return true;
  }

  return VALID_ENV_ACCESS.has(envAccess);
}
