import { describe, expect, it } from 'vitest';
import { getEventIncrement } from '../../src/analytics-test-runner/config/eventDeltas.js';

describe('eventDeltas (legacy shim)', () => {
  it('newSubscription increments match Event Usage doc', () => {
    const inc = getEventIncrement('newSubscription', {
      amount: 29.99,
      countryId: 702,
      countryCode: 'SG',
      planId: 2,
    });
    expect(inc.subscribersNew).toBe(1);
    expect(inc.earningsTotal).toBe(29.99);
    expect(inc.earningsSubscription).toBe(29.99);
    expect(inc.countryId).toBe(702);
    expect(inc.planTierKey).toBe('tier2');
  });

  it('tokenOrder increments tokens not USD total', () => {
    const inc = getEventIncrement('tokenOrder', { amount: 5, countryId: 250 });
    expect(inc.earningsTotal).toBe(0);
    expect(inc.earningsTipTokens).toBe(5);
  });
});
