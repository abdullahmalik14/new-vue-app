/**
 * routeResolver.js — section / preLoadSections inheritance (section test plan §37, §53).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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
  vi.stubEnv('VITE_ENABLE_LOGGER', '');
  window.performanceTracker = { step: vi.fn() };
  getRouteConfiguration.mockReturnValue(getSectionTestFixtures(SECTION_INHERITANCE_FIXTURES));
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('inheritConfigurationFromParentRoute — section fields (Phase E §37, §53)', () => {
  async function loadRouteResolver() {
    return import('../../src/systems/routing/routeResolver.js');
  }

  function routeBySlug(slug) {
    return getSectionTestFixtures(SECTION_INHERITANCE_FIXTURES).find((route) => route.slug === slug);
  }

  it('returns child route unchanged when inheritConfigFromParent is false', async () => {
    const { inheritConfigurationFromParentRoute } = await loadRouteResolver();
    const parent = routeBySlug('/parent-shop');

    expect(inheritConfigurationFromParentRoute(parent)).toBe(parent);
    expect(inheritConfigurationFromParentRoute(parent).section).toBe('dashboard-global');
  });

  it('inherits parent section when child omits section', async () => {
    const { inheritConfigurationFromParentRoute } = await loadRouteResolver();
    const child = routeBySlug('/parent-shop/child-inherit-all');

    expect(inheritConfigurationFromParentRoute(child).section).toBe('dashboard-global');
  });

  it('inherits parent preLoadSections when child omits preLoadSections', async () => {
    const { inheritConfigurationFromParentRoute } = await loadRouteResolver();
    const child = routeBySlug('/parent-shop/child-inherit-all');

    expect(inheritConfigurationFromParentRoute(child).preLoadSections).toEqual(['shop-slug']);
  });

  it('child section overrides inherited parent section', async () => {
    const { inheritConfigurationFromParentRoute } = await loadRouteResolver();
    const child = routeBySlug('/parent-shop/child-override-section');

    expect(inheritConfigurationFromParentRoute(child).section).toBe('shop');
  });

  it('child preLoadSections overrides inherited parent preLoadSections (not concat)', async () => {
    const { inheritConfigurationFromParentRoute } = await loadRouteResolver();
    const child = routeBySlug('/parent-shop/child-override-preloads');

    const effective = inheritConfigurationFromParentRoute(child);
    expect(effective.preLoadSections).toEqual(['profile-slug']);
    expect(effective.preLoadSections).not.toEqual(['shop-slug']);
  });

  it('nested inheritance chain merges grandparent preLoadSections through middle parent', async () => {
    const { inheritConfigurationFromParentRoute } = await loadRouteResolver();
    const grandchild = routeBySlug('/grandparent-auth/middle-shop/grandchild');

    expect(inheritConfigurationFromParentRoute(grandchild).section).toBe('shop');
    expect(inheritConfigurationFromParentRoute(grandchild).preLoadSections).toEqual(['dashboard-slug']);
  });

  it('resolveEffectiveRouteConfig delegates to inheritConfigurationFromParentRoute', async () => {
    const { resolveEffectiveRouteConfig } = await loadRouteResolver();
    const child = routeBySlug('/parent-shop/child-inherit-all');

    expect(resolveEffectiveRouteConfig(child).section).toBe('dashboard-global');
    expect(resolveEffectiveRouteConfig(null)).toBeNull();
  });
});
