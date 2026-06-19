/**
 * routeTransition.js — Phase E (route test plan §24).
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/systems/routing/routeResolver.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    resolveEffectiveRouteConfig: (config) => config,
  };
});

import { resolveRouteTransition } from '../../src/systems/routing/routeTransition.js';

describe('routeTransition (Phase E §24)', () => {
  it('uses route-fade by default when transition is unset', () => {
    const result = resolveRouteTransition({
      meta: { routeConfig: { slug: '/dashboard' } },
    });

    expect(result).toEqual({
      disabled: false,
      name: 'route-fade',
      mode: 'out-in',
    });
  });

  it('maps string presets to transition names', () => {
    expect(
      resolveRouteTransition({
        meta: { routeConfig: { slug: '/shop', transition: 'slide-fade' } },
      }).name,
    ).toBe('route-slide-fade');

    expect(
      resolveRouteTransition({
        meta: { routeConfig: { slug: '/shop', transition: 'fade' } },
      }).name,
    ).toBe('route-fade');
  });

  it('disables transition for none/false', () => {
    expect(
      resolveRouteTransition({
        meta: { routeConfig: { slug: '/callback', transition: 'none' } },
      }).disabled,
    ).toBe(true);

    expect(
      resolveRouteTransition({
        meta: { routeConfig: { slug: '/callback', transition: false } },
      }).disabled,
    ).toBe(true);
  });

  it('supports object transition config', () => {
    const result = resolveRouteTransition({
      meta: {
        routeConfig: {
          slug: '/profile',
          transition: { name: 'route-slide-fade', mode: 'in-out' },
        },
      },
    });

    expect(result).toEqual({
      disabled: false,
      name: 'route-slide-fade',
      mode: 'in-out',
    });
  });

  it('reads meta.transition when routeConfig omits transition', () => {
    const result = resolveRouteTransition({
      meta: {
        routeConfig: { slug: '/demo' },
        transition: 'route-slide-fade',
      },
    });

    expect(result.name).toBe('route-slide-fade');
  });
});
