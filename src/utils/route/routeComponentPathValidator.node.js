/**
 * Node-only route componentPath disk validation (M10).
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  collectComponentPathsFromRoute,
  componentPathToRelativeFile,
  getComponentPathValidationError,
} from './routeComponentPathValidator.js';

/**
 * @param {string} componentPath
 * @param {string} projectRoot
 * @returns {string|null}
 */
export function componentPathToAbsoluteFile(componentPath, projectRoot) {
  const relativeFile = componentPathToRelativeFile(componentPath);
  if (!relativeFile) {
    return null;
  }

  return join(projectRoot, relativeFile);
}

/**
 * Validate component paths against the filesystem (build/node).
 *
 * @param {Array<object>} routes
 * @param {string} projectRoot
 * @returns {{ valid: boolean, errors: Array<object> }}
 */
export function validateRouteComponentPathsOnDisk(routes, projectRoot) {
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

      const absolutePath = componentPathToAbsoluteFile(entry.path, projectRoot);
      if (!absolutePath || !existsSync(absolutePath)) {
        errors.push({
          type: 'MISSING_COMPONENT_FILE',
          slug: route.slug || '(unknown slug)',
          field: entry.source,
          componentPath: entry.path,
          message: `Route "${route.slug}" ${entry.source} "${entry.path}" does not exist on disk (${componentPathToRelativeFile(entry.path)})`,
        });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
