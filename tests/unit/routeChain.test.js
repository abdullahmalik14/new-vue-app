import { describe, it, expect, beforeEach } from 'vitest';
import { getRouteChainForPath } from '../../src/systems/routing/routeResolver.js';

beforeEach(() => {
  delete window.performanceTracker;
});

describe('getRouteChainForPath (A7)', () => {
  it('returns progressive slug matches from root to target', () => {
    const chain = getRouteChainForPath('/dashboard/analytics');

    expect(chain.length).toBeGreaterThanOrEqual(2);
    expect(chain[0].slug).toBe('/dashboard');
    expect(chain[chain.length - 1].slug).toBe('/dashboard/analytics');
  });

  it('returns a single entry for top-level routes', () => {
    const chain = getRouteChainForPath('/log-in');

    expect(chain).toHaveLength(1);
    expect(chain[0].slug).toBe('/log-in');
  });

  it('returns an empty array when no route segments match', () => {
    const chain = getRouteChainForPath('/totally-unknown/path');

    expect(chain).toEqual([]);
  });
});
