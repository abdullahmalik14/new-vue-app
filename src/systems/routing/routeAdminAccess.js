/**
 * Admin-only route access helpers (M11).
 */

/**
 * Whether the navigation context represents an admin user.
 *
 * @param {object} [context]
 * @param {boolean} [context.isAuthenticated]
 * @param {string} [context.userRole]
 * @param {object} [context.userProfile]
 * @returns {boolean}
 */
export function isAdminUser(context = {}) {
  const profile = context.userProfile || {};
  const role = profile.role || context.userRole || 'guest';

  return profile.isAdmin === true || role === 'admin';
}

/**
 * @param {object|null|undefined} route
 * @param {object} [context]
 * @returns {boolean}
 */
export function isRouteAccessibleToAdmin(route, context = {}) {
  if (!route?.adminOnly) {
    return true;
  }

  return isAdminUser(context);
}
