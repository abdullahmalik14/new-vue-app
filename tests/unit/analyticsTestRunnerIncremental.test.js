import { describe, expect, it } from 'vitest';
import { getEventIncrement } from '../../src/analytics-test-runner/config/eventDeltas.js';
import { applyIncrementalExpectations } from '../../src/analytics-test-runner/config/incrementalExpectations.js';

describe('eventDeltas', () => {
  it('newSubscription increments match Event Usage doc', () => {
    const inc = getEventIncrement('newSubscription', {
      amount: 29.99,
      countryId: 702,
      countryCode: 'SG',
      planId: 2,
    });
    expect(inc.subscribersNew).toBe(1);
    expect(inc.earningsTotal).toBe(29.99);
    expect(inc.contributorAmount).toBe(29.99);
    expect(inc.countrySales).toBe(29.99);
    expect(inc.countryId).toBe(702);
    expect(inc.planTierKey).toBe('tier2');
  });

  it('tokenOrder increments tokens not USD total', () => {
    const inc = getEventIncrement('tokenOrder', { amount: 5, countryId: 250 });
    expect(inc.earningsTotal).toBe(0);
    expect(inc.earningsTipTokens).toBe(5);
    expect(inc.contributorAmount).toBe(5);
  });
});

describe('applyIncrementalExpectations', () => {
  const emptyBaseline = {
    subscriptions: { daily: [{ newSubscriber: 0, recurringSubscriber: 0, tier2: 0 }] },
    earnings: { daily: [{ total: 0, subscription: 0 }] },
    trendingCountries: { daily: [] },
    contributors: { topContributors: { alltime: [] } },
  };

  const afterOneSub = {
    subscriptions: { daily: [{ newSubscriber: 1, recurringSubscriber: 0, tier2: 1 }] },
    earnings: { daily: [{ total: 29.99, subscription: 29.99 }] },
    trendingCountries: {
      daily: [{ country: 'Country 702', salesUSD: 29.99, rank: 1 }],
    },
    contributors: {
      topContributors: {
        alltime: [{ name: 'Fan 88001', usdSpent: 29.99 }],
      },
    },
  };

  it('computes baseline + 1 for new subscribers', () => {
    const rows = [
      {
        id: 'newSubscription.singular.main.subscribers.new',
        expectedValue: 1,
        tolerance: 0.01,
      },
    ];
    const patched = applyIncrementalExpectations(rows, {
      testCaseKey: 'newSubscription',
      fields: { amount: 29.99, countryId: 702, planId: 2 },
      baselinePayload: emptyBaseline,
      afterPayload: afterOneSub,
    });
    expect(patched[0].expectedValue).toBe(1);
    expect(patched[0].deltaWarning).toBeUndefined();
  });

  it('computes baseline + amount for top contributor preview', () => {
    const rows = [
      {
        id: 'newSubscription.singular.main.contributors.amount',
        expectedValue: 29.99,
        tolerance: 0.01,
      },
      {
        id: 'newSubscription.singular.main.contributors.name',
        expectedValue: 'Fan 88001',
        tolerance: 0.01,
      },
    ];
    const patched = applyIncrementalExpectations(rows, {
      testCaseKey: 'newSubscription',
      fields: { amount: 29.99, fanId: 88001 },
      baselinePayload: emptyBaseline,
      afterPayload: afterOneSub,
    });
    expect(patched[0].expectedValue).toBe(29.99);
    expect(patched[1].expectedValue).toBe('Fan 88001');
  });

  it('flags API delta mismatch when after payload is not baseline + increment', () => {
    const pollutedAfter = {
      subscriptions: { daily: [{ newSubscriber: 5, recurringSubscriber: 0, tier2: 5 }] },
      earnings: { daily: [{ total: 100, subscription: 100 }] },
      trendingCountries: { daily: [] },
    };
    const rows = [
      {
        id: 'newSubscription.singular.main.subscribers.new',
        expectedValue: 5,
        tolerance: 0.01,
      },
    ];
    const patched = applyIncrementalExpectations(rows, {
      testCaseKey: 'newSubscription',
      fields: { amount: 29.99, countryId: 702, planId: 2 },
      baselinePayload: emptyBaseline,
      afterPayload: pollutedAfter,
    });
    expect(patched[0].expectedValue).toBe(1);
  });
});
