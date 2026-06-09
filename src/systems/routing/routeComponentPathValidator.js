/**
 * Validate route componentPath / customComponentPath against import.meta.glob (M10).
 * Browser-safe — Node disk checks live in routeComponentPathValidator.node.js.
 */

const ALLOWED_COMPONENT_PREFIXES = ['src/templates/', 'src/components/', 'src/dev/'];

/**
 * @typedef {object} RouteComponentPathRef
 * @property {string} path
 * @property {string} source
 */

/**
 * @typedef {object} RouteComponentPathError
 * @property {string} type
 * @property {string} slug
 * @property {string} field
 * @property {string} componentPath
 * @property {string} message
 */

/**
 * Convert `@/` alias path to project-relative filesystem path.
 *
 * @param {string} componentPath
 * @returns {string|null}
 */
export function componentPathToRelativeFile(componentPath) {
  if (typeof componentPath !== 'string' || !componentPath.startsWith('@/')) {
    return null;
  }

  return `src/${componentPath.slice(2)}`.replace(/\\/g, '/');
}

/**
 * Collect component paths declared on a route config entry.
 *
 * @param {object} route
 * @returns {RouteComponentPathRef[]}
 */
export function collectComponentPathsFromRoute(route) {
  const paths = [];

  if (typeof route?.componentPath === 'string' && route.componentPath.trim()) {
    paths.push({
      path: route.componentPath.trim(),
      source: 'componentPath',
    });
  }

  if (route?.customComponentPath && typeof route.customComponentPath === 'object') {
    for (const [role, roleConfig] of Object.entries(route.customComponentPath)) {
      const rolePath = roleConfig?.componentPath;
      if (typeof rolePath === 'string' && rolePath.trim()) {
        paths.push({
          path: rolePath.trim(),
          source: `customComponentPath.${role}`,
        });
      }
    }
  }

  return paths;
}

/**
 * @param {Array<object>} routes
 * @returns {Array<{ slug: string, path: string, source: string }>}
 */
export function collectComponentPathsFromRoutes(routes) {
  const collected = [];

  for (const route of routes) {
    if (!route || route.redirect) {
      continue;
    }

    if (route.slug?.includes('pathMatch') && !route.componentPath && !route.customComponentPath) {
      continue;
    }

    for (const entry of collectComponentPathsFromRoute(route)) {
      collected.push({
        slug: route.slug || '(unknown slug)',
        ...entry,
      });
    }
  }

  return collected;
}

/**
 * @param {string} componentPath
 * @returns {string|null}
 */
export function getComponentPathValidationError(componentPath) {
  if (typeof componentPath !== 'string' || !componentPath.trim()) {
    return 'component path must be a non-empty string';
  }

  if (!componentPath.startsWith('@/')) {
    return 'component path must use the @/ alias';
  }

  if (!componentPath.endsWith('.vue')) {
    return 'component path must point to a .vue file';
  }

  const relativeFile = componentPathToRelativeFile(componentPath);
  if (!relativeFile) {
    return 'component path could not be resolved';
  }

  const allowed = ALLOWED_COMPONENT_PREFIXES.some((prefix) => relativeFile.startsWith(prefix));
  if (!allowed) {
    return 'component path must be under src/templates/ or src/components/';
  }

  return null;
}

/**
 * @param {object} route
 * @param {RouteComponentPathRef} entry
 * @returns {RouteComponentPathError|null}
 */
function buildMissingComponentPathError(route, entry) {
  return {
    type: 'MISSING_COMPONENT_FILE',
    slug: route.slug || '(unknown slug)',
    field: entry.source,
    componentPath: entry.path,
    message: `Route "${route.slug}" ${entry.source} "${entry.path}" is not registered in the router component map`,
  };
}

/**
 * Validate component paths using import.meta.glob resolver (browser/dev).
 *
 * @param {Array<object>} routes
 * @param {(componentPath: string) => Function|null} resolveLoader
 * @returns {{ valid: boolean, errors: RouteComponentPathError[] }}
 */
export function validateRouteComponentPathsWithResolver(routes, resolveLoader) {
  const errors = [];

  for (const route of routes) {
    if (!route || route.redirect) {
      continue;
    }

    for (const entry of collectComponentPathsFromRoute(route)) {
      const formatError = getComponentPathValidationError(entry.path);
      if (formatError) {
        errors.push({
          type: 'INVALID_COMPONENT_PATH',
          slug: route.slug || '(unknown slug)',
          field: entry.source,
          componentPath: entry.path,
          message: `Route "${route.slug}" ${entry.source} "${entry.path}" is invalid: ${formatError}`,
        });
        continue;
      }

      if (typeof resolveLoader !== 'function' || !resolveLoader(entry.path)) {
        errors.push(buildMissingComponentPathError(route, entry));
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
