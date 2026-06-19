/**
 * sectionResolver.js — resolveSectionIdentifier (section test plan §2, §60).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSectionTestFixtures, RESOLVER_ROUTE_FIXTURES } from '../helpers/sectionFixtures.js';

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
  getRouteConfiguration.mockReturnValue(getSectionTestFixtures(RESOLVER_ROUTE_FIXTURES));
});

describe('resolveSectionIdentifier (Phase B §2)', () => {
  async function loadResolver() {
    return import('../../src/systems/sections/sectionResolver.js');
  }

  it('returns null for null, undefined, empty, whitespace, and non-string identifiers', async () => {
    const { resolveSectionIdentifier } = await loadResolver();

    expect(resolveSectionIdentifier(null, 'guest')).toBeNull();
    expect(resolveSectionIdentifier(undefined, 'guest')).toBeNull();
    expect(resolveSectionIdentifier('', 'guest')).toBeNull();
    expect(resolveSectionIdentifier('   ', 'guest')).toBeNull();
    expect(resolveSectionIdentifier(123, 'guest')).toBeNull();
  });

  it('trims leading and trailing whitespace from direct section names', async () => {
    const { resolveSectionIdentifier } = await loadResolver();
    expect(resolveSectionIdentifier('  auth  ', 'guest')).toBe('auth');
  });

  it('treats auth as direct section name when no route slug matches', async () => {
    const { resolveSectionIdentifier } = await loadResolver();
    expect(resolveSectionIdentifier('auth', 'guest')).toBe('auth');
  });

  it('resolves dashboard slug to role-specific section for creator', async () => {
    const { resolveSectionIdentifier } = await loadResolver();
    expect(resolveSectionIdentifier('dashboard', 'creator')).toBe('dashboard-creator');
  });

  it('resolves /dashboard slug with leading slash', async () => {
    const { resolveSectionIdentifier } = await loadResolver();
    expect(resolveSectionIdentifier('/dashboard', 'fan')).toBe('dashboard-fan');
  });

  it('defaults userRole to guest when omitted', async () => {
    const { resolveSectionIdentifier } = await loadResolver();
    expect(resolveSectionIdentifier('dashboard')).toBe('dashboard-global');
  });

  it('falls through to trimmed identifier when matched route section is unresolvable for userRole', async () => {
    const { resolveSectionIdentifier } = await loadResolver();
    expect(resolveSectionIdentifier('unresolved-role', 'fan')).toBe('unresolved-role');
  });

  it('falls through to trimmed identifier when slug does not match any route', async () => {
    const { resolveSectionIdentifier } = await loadResolver();
    expect(resolveSectionIdentifier('misc', 'guest')).toBe('misc');
  });

  it('resolves log-in slug to auth section via /log-in route', async () => {
    const { resolveSectionIdentifier } = await loadResolver();
    expect(resolveSectionIdentifier('log-in', 'guest')).toBe('auth');
  });

  it('resolves /shop slug to shop section', async () => {
    const { resolveSectionIdentifier } = await loadResolver();
    expect(resolveSectionIdentifier('/shop', 'guest')).toBe('shop');
  });

  it('does not match identifiers with query strings or hash fragments as slugs', async () => {
    const { resolveSectionIdentifier } = await loadResolver();
    expect(resolveSectionIdentifier('shop?x=1', 'guest')).toBe('shop?x=1');
    expect(resolveSectionIdentifier('shop#tab', 'guest')).toBe('shop#tab');
  });
});

describe('resolveSectionIdentifier — slug matrix (Phase B §60)', () => {
  async function loadResolver() {
    return import('../../src/systems/sections/sectionResolver.js');
  }

  it('profile without slash is treated as direct section name when no route exists', async () => {
    const { resolveSectionIdentifier } = await loadResolver();
    expect(resolveSectionIdentifier('profile', 'guest')).toBe('profile');
  });

  it('creator role resolves dashboard-creator from dashboard fixture', async () => {
    const { resolveSectionIdentifier } = await loadResolver();
    expect(resolveSectionIdentifier('dashboard', 'creator')).toBe('dashboard-creator');
  });

  it('guest role resolves default dashboard-global from dashboard fixture', async () => {
    const { resolveSectionIdentifier } = await loadResolver();
    expect(resolveSectionIdentifier('dashboard', 'guest')).toBe('dashboard-global');
  });
});
