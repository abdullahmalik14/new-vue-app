import { describe, it, expect } from 'vitest';

describe('router index exports (B7)', () => {
  it('does not re-export runAllRouteGuards', async () => {
    const routerModule = await import('../../src/router/index.js');

    expect(routerModule.default).toBeDefined();
    expect(routerModule.runAllRouteGuards).toBeUndefined();
  }, 10000);

  it('runAllRouteGuards remains available from routeGuards.js', async () => {
    const { runAllRouteGuards } = await import('../../src/utils/route/routeGuards.js');

    expect(typeof runAllRouteGuards).toBe('function');
  });
});
