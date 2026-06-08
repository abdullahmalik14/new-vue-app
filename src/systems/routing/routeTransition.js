/**
 * Resolve per-route Vue Router transition settings from routeConfig (M3).
 * Supports inheritance via resolveEffectiveRouteConfig.
 */

import { resolveEffectiveRouteConfig } from '../sections/sectionPreloadOrchestrator.js';

export const ROUTE_TRANSITION_PRESETS = Object.freeze([
  'route-fade',
  'route-slide-fade',
  'none',
]);

const DEFAULT_ROUTE_TRANSITION = Object.freeze({
  name: 'route-fade',
  mode: 'out-in',
});

/**
 * @typedef {object} ResolvedRouteTransition
 * @property {boolean} disabled
 * @property {string} [name]
 * @property {'default' | 'in-out' | 'out-in'} [mode]
 */

/**
 * Normalize routeConfig transition values to a Vue Transition name.
 *
 * @param {string} name
 * @returns {string}
 */
function normalizeTransitionName(name) {
  if (name === 'fade') {
    return 'route-fade';
  }
  if (name === 'slide-fade') {
    return 'route-slide-fade';
  }
  return name;
}

/**
 * Resolve transition props for the active route.
 *
 * @param {import('vue-router').RouteLocationNormalizedLoaded} route
 * @returns {ResolvedRouteTransition}
 */
export function resolveRouteTransition(route) {
  const routeConfig = route?.meta?.routeConfig;
  const effectiveConfig = routeConfig ? resolveEffectiveRouteConfig(routeConfig) : null;
  const transition = effectiveConfig?.transition ?? route?.meta?.transition;

  if (transition === false || transition === 'none' || transition === null) {
    return { disabled: true };
  }

  if (typeof transition === 'string') {
    return {
      disabled: false,
      name: normalizeTransitionName(transition),
      mode: DEFAULT_ROUTE_TRANSITION.mode,
    };
  }

  if (typeof transition === 'object' && transition !== null) {
    return {
      disabled: false,
      name: normalizeTransitionName(transition.name ?? DEFAULT_ROUTE_TRANSITION.name),
      mode: transition.mode ?? DEFAULT_ROUTE_TRANSITION.mode,
    };
  }

  return {
    disabled: false,
    ...DEFAULT_ROUTE_TRANSITION,
  };
}
