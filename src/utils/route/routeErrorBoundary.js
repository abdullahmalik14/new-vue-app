/**
 * Route-level render error state helpers (M6).
 */

/**
 * @typedef {object} RouteRenderError
 * @property {string} message
 * @property {string} info
 * @property {number} timestamp
 */

/**
 * Build a serializable error snapshot for the route error boundary UI.
 *
 * @param {unknown} err
 * @param {string} [info]
 * @returns {RouteRenderError}
 */
export function createRouteRenderError(err, info = 'render') {
  const message =
    err instanceof Error
      ? err.message
      : typeof err === 'string'
        ? err
        : 'Something went wrong';

  return {
    message,
    info,
    timestamp: Date.now(),
  };
}

/**
 * Clear captured route errors when navigation changes.
 *
 * @param {string|undefined} previousRouteKey
 * @param {string|undefined} nextRouteKey
 * @returns {boolean}
 */
export function shouldClearRouteErrorOnNavigation(previousRouteKey, nextRouteKey) {
  if (!nextRouteKey) {
    return false;
  }

  return previousRouteKey !== nextRouteKey;
}
