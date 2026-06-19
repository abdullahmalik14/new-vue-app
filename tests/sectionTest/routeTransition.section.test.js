/**
 * routeTransition.js — effective config path used by section inheritance (section test plan §46).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  SECTION_INHERITANCE_FIXTURES,
  getSectionTestFixtures,
} from '../helpers/sectionFixtures.js';

const { getRouteConfiguration } = vi.hoisted(() => ({
  getRouteConfiguration: vi.fn(),
}));

vi.mock('../../src/systems/routing/routeConfigLoader.js', () => ({
  getRouteConfiguration,
}));

beforeEach(() => {
  vi.resetModules();
  window.performanceTracker = { step: vi.fn() };
  getRouteConfiguration.mockReturnValue(getSectionTestFixtures(SECTION_INHERITANCE_FIXTURES));
});

describe('resolveRouteTransition with inherited route config (Phase F §46)', () => {
  it('reads transition from resolveEffectiveRouteConfig merged child route', async () => {
    const child = getSectionTestFixtures(SECTION_INHERITANCE_FIXTURES).find(
      (route) => route.slug === '/parent-shop/child-inherit-all',
    );

    const { resolveEffectiveRouteConfig } = await import('../../src/systems/routing/routeResolver.js');
    const { resolveRouteTransition } = await import('../../src/systems/routing/routeTransition.js');

    const effective = resolveEffectiveRouteConfig(child);
    expect(effective.section).toBe('dashboard-global');

    const transition = resolveRouteTransition({
      meta: { routeConfig: child },
    });

    expect(transition.disabled).toBe(false);
    expect(transition.name).toBe('route-fade');
  });

  it('resolveEffectiveRouteConfig exposes inherited section before transition consumers run', async () => {
    const grandchild = getSectionTestFixtures(SECTION_INHERITANCE_FIXTURES).find(
      (route) => route.slug === '/grandparent-auth/middle-shop/grandchild',
    );

    const { resolveEffectiveRouteConfig } = await import('../../src/systems/routing/routeResolver.js');

    expect(resolveEffectiveRouteConfig(grandchild).section).toBe('shop');
  });
});
