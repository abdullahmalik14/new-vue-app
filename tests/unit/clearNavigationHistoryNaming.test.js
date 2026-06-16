import { describe, it, expect, beforeEach } from 'vitest';

describe('A15 — clearNavigationHistory naming', () => {
  beforeEach(() => {
    delete window.performanceTracker;
  });

  it('routeGuards exports clearGuardNavigationHistory, not clearNavigationHistory', async () => {
    const guards = await import('../../src/systems/routing/routeGuards.js');

    expect(typeof guards.clearGuardNavigationHistory).toBe('function');
    expect(guards.clearNavigationHistory).toBeUndefined();
  });

  it('guard and navigation modules export distinct clear helpers', async () => {
    const { clearGuardNavigationHistory } = await import(
      '../../src/systems/routing/routeGuards.js'
    );
    const { clearNavigationHistory } = await import(
      '../../src/systems/routing/routeNavigation.js'
    );

    expect(typeof clearGuardNavigationHistory).toBe('function');
    expect(typeof clearNavigationHistory).toBe('function');
    expect(clearGuardNavigationHistory).not.toBe(clearNavigationHistory);
  });
});
