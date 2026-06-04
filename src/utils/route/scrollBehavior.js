/**
 * Vue Router scrollBehavior target resolution (B8).
 *
 * @param {import('vue-router').RouteLocationNormalized} to
 * @param {import('vue-router').RouteLocationNormalizedLoaded} _from
 * @param {{ left: number, top: number } | null | undefined} savedPosition
 * @returns {import('vue-router').ScrollBehaviorReturn}
 */
export function resolveRouterScrollPosition(to, _from, savedPosition) {
  if (savedPosition) {
    return savedPosition;
  }

  if (to.hash) {
    return { el: to.hash, behavior: 'smooth' };
  }

  return { top: 0 };
}
