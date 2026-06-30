import { describe, expect, it } from 'vitest';

import { buildExpectationsFromApi } from '@/analytics-test-runner/config/buildExpectationsFromApi.js';

const samplePayload = {
  earnings: {
    daily: [{ total: 29.99, subscription: 29.99 }],
    weekly: [{ total: 29.99, subscription: 29.99 }],
    monthly: [{ total: 29.99, subscription: 29.99 }],
    yearly: [{ total: 29.99, subscription: 29.99 }],
  },
  subscriptions: {
    daily: [{ newSubscriber: 1, tier2: 1 }],
    weekly: [{ newSubscriber: 1, tier2: 1 }],
    monthly: [{ newSubscriber: 1, tier2: 1 }],
    yearly: [{ newSubscriber: 1, tier2: 1 }],
  },
  contributors: { topContributors: [{ amount: 29.99, name: 'Fan 88001' }] },
};

describe('buildExpectationsFromApi', () => {
  it('builds singular and chart rows from HTTP payload for newSubscription', () => {
    const rows = buildExpectationsFromApi('newSubscription', samplePayload, { planId: 2 });

    expect(rows.some((r) => r.valueKind === 'singular' && r.metric === 'NEW subscribers')).toBe(true);
    expect(rows.some((r) => r.valueKind === 'chart' && r.metric === 'total' && r.period === 'week')).toBe(true);
    expect(rows.some((r) => r.valueKind === 'chart' && r.metric === 'total' && r.period === 'day')).toBe(false);
    expect(rows.some((r) => r.valueKind === 'chart' && r.metric === 'tier2' && r.period === 'week')).toBe(true);
    expect(rows.find((r) => r.location === 'Earnings popup header' && r.period === 'day')?.expectedValue).toBe(29.99);
  });
});
