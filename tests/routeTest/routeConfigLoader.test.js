/**
 * routeConfigLoader.js — Phase B (route test plan §1).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const LOADER_PATH = '../../src/systems/routing/routeConfigLoader.js';

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_ENABLE_LOGGER', '');
  window.performanceTracker = { step: vi.fn() };
});

describe('routeConfigLoader (Phase B §1)', () => {
  it('getRouteConfiguration returns an array of routes with slug present', async () => {
    const { getRouteConfiguration, resetRouteConfigurationCache } = await import(LOADER_PATH);

    resetRouteConfigurationCache();
    const routes = getRouteConfiguration();

    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBeGreaterThan(0);
    expect(routes.every((route) => typeof route.slug === 'string' && route.slug.length > 0)).toBe(
      true,
    );
  });

  it('getRouteConfiguration returns equivalent config on subsequent access', async () => {
    const { getRouteConfiguration, resetRouteConfigurationCache } = await import(LOADER_PATH);

    resetRouteConfigurationCache();
    const first = getRouteConfiguration();
    const second = getRouteConfiguration();

    expect(first.map((route) => route.slug)).toEqual(second.map((route) => route.slug));
    expect(first.length).toBe(second.length);
  });

  it('getCachedRouteConfiguration returns equivalent config on second call', async () => {
    const { getCachedRouteConfiguration, resetRouteConfigurationCache } = await import(LOADER_PATH);

    resetRouteConfigurationCache();
    const first = getCachedRouteConfiguration();
    const second = getCachedRouteConfiguration();

    expect(first.map((route) => route.slug)).toEqual(second.map((route) => route.slug));
  });

  it('resetRouteConfigurationCache is safe to call multiple times', async () => {
    const { resetRouteConfigurationCache } = await import(LOADER_PATH);

    expect(() => {
      resetRouteConfigurationCache();
      resetRouteConfigurationCache();
    }).not.toThrow();
  });

  it('loadRouteConfigurationFromFile returns array when imports succeed', async () => {
    const { loadRouteConfigurationFromFile } = await import(LOADER_PATH);

    const routes = loadRouteConfigurationFromFile();

    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBeGreaterThan(0);
  });

  it('loadRouteConfigurationFromFile attaches resolved asset preload fields', async () => {
    const { loadRouteConfigurationFromFile } = await import(LOADER_PATH);

    const routes = loadRouteConfigurationFromFile();
    const dashboard = routes.find((route) => route.slug === '/dashboard');

    expect(dashboard).toBeTruthy();
    expect(Array.isArray(dashboard.assetPreload)).toBe(true);
    expect(dashboard.assetPreload.length).toBeGreaterThan(0);
  });

  it('loadRouteConfigurationFromFile returns a fresh array copy not shared with prior call', async () => {
    const { loadRouteConfigurationFromFile, resetRouteConfigurationCache } =
      await import(LOADER_PATH);

    resetRouteConfigurationCache();
    const first = loadRouteConfigurationFromFile();
    const second = loadRouteConfigurationFromFile();

    expect(first).not.toBe(second);
    expect(first.length).toBe(second.length);
  });
});
