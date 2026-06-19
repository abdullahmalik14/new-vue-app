/**
 * router/index.js + createAppRouter — Phase E (route test plan §37–38).
 */

import { describe, it, expect } from 'vitest';

const ROUTER_IMPORT_TIMEOUT = 15000;

describe('router/index.js exports (Phase E §37)', () => {
  it('default export is a Vue Router instance', async () => {
    const routerModule = await import('../../src/router/index.js');

    expect(routerModule.default).toBeDefined();
    expect(typeof routerModule.default.push).toBe('function');
    expect(typeof routerModule.default.getRoutes).toBe('function');
  }, ROUTER_IMPORT_TIMEOUT);

  it('re-exports prefetch helpers from routing barrel', async () => {
    const routerModule = await import('../../src/router/index.js');

    expect(typeof routerModule.prefetchRouteComponent).toBe('function');
    expect(typeof routerModule.createRoutePrefetchIntentHandler).toBe('function');
    expect(typeof routerModule.prefetchSectionAssetsForRoute).toBe('function');
  }, ROUTER_IMPORT_TIMEOUT);

  it('registers production routes including login and dashboard', async () => {
    const router = (await import('../../src/router/index.js')).default;
    const slugs = router
      .getRoutes()
      .map((record) => record.meta?.routeConfig?.slug)
      .filter(Boolean);

    expect(slugs).toContain('/log-in');
    expect(slugs).toContain('/dashboard');
    expect(slugs).toContain('/404');
  }, ROUTER_IMPORT_TIMEOUT);

  it('uses resolveRouterScrollPosition for scrollBehavior', async () => {
    const router = (await import('../../src/router/index.js')).default;

    const saved = { left: 0, top: 250 };
    const result = await router.options.scrollBehavior({ hash: '' }, {}, saved);

    expect(result).toEqual(saved);
  }, ROUTER_IMPORT_TIMEOUT);
});
