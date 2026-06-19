/**
 * sectionPreloadOrchestrator.js — inheritance via resolveEffectiveRouteConfig (§53, §78–79, §100).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  SECTION_INHERITANCE_FIXTURES,
  getSectionTestFixtures,
} from '../helpers/sectionFixtures.js';
import { ORCHESTRATOR_PATH } from '../helpers/sectionOrchestratorTestSetup.js';

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

describe('getSectionPreloadPlan with inherited route config (Phase E §53)', () => {
  async function loadOrchestrator() {
    return import(ORCHESTRATOR_PATH);
  }

  function routeBySlug(slug) {
    return getSectionTestFixtures(SECTION_INHERITANCE_FIXTURES).find((route) => route.slug === slug);
  }

  it('inherits parent preLoadSections when child omits preLoadSections', async () => {
    const { getSectionPreloadPlan } = await loadOrchestrator();
    const child = routeBySlug('/parent-shop/child-inherit-all');

    const plan = getSectionPreloadPlan(child, 'guest');
    expect(plan.preloadSectionIdentifiers).toEqual(['shop-slug']);
    expect(plan.resolvedSectionNames).toEqual(['shop']);
  });

  it('uses child preLoadSections override instead of parent list', async () => {
    const { getSectionPreloadPlan } = await loadOrchestrator();
    const child = routeBySlug('/parent-shop/child-override-preloads');

    const plan = getSectionPreloadPlan(child, 'guest');
    expect(plan.preloadSectionIdentifiers).toEqual(['profile-slug']);
    expect(plan.resolvedSectionNames).toEqual(['profile']);
    expect(plan.resolvedSectionNames).not.toContain('shop');
  });

  it('resolves nested inheritance chain preLoadSections to concrete section names', async () => {
    const { getSectionPreloadPlan } = await loadOrchestrator();
    const grandchild = routeBySlug('/grandparent-auth/middle-shop/grandchild');

    const plan = getSectionPreloadPlan(grandchild, 'guest');
    expect(plan.preloadSectionIdentifiers).toEqual(['dashboard-slug']);
    expect(plan.resolvedSectionNames).toEqual(['dashboard-global']);
  });
});

describe('resolveCurrentSectionNameFromRouteConfig with inherited route config (Phase E §79)', () => {
  async function loadOrchestrator() {
    return import(ORCHESTRATOR_PATH);
  }

  function routeBySlug(slug) {
    return getSectionTestFixtures(SECTION_INHERITANCE_FIXTURES).find((route) => route.slug === slug);
  }

  it('inherits parent section when child omits section', async () => {
    const { resolveCurrentSectionNameFromRouteConfig } = await loadOrchestrator();
    const child = routeBySlug('/parent-shop/child-inherit-all');

    expect(resolveCurrentSectionNameFromRouteConfig(child, 'guest')).toBe('dashboard-global');
  });

  it('uses child section override from inherited parent chain', async () => {
    const { resolveCurrentSectionNameFromRouteConfig } = await loadOrchestrator();
    const child = routeBySlug('/parent-shop/child-override-section');

    expect(resolveCurrentSectionNameFromRouteConfig(child, 'guest')).toBe('shop');
  });

  it('resolves nested inheritance chain section from nearest ancestor override', async () => {
    const { resolveCurrentSectionNameFromRouteConfig } = await loadOrchestrator();
    const grandchild = routeBySlug('/grandparent-auth/middle-shop/grandchild');

    expect(resolveCurrentSectionNameFromRouteConfig(grandchild, 'guest')).toBe('shop');
  });
});
