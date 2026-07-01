import { describe, expect, it } from 'vitest';

import { buildTestExpectations } from '@/analytics-test-runner/config/buildTestExpectations.js';

const samplePayload = {
  earnings: {
    daily: [{ total: 29.99, subscription: 29.99 }],
    weekly: [{ total: 29.99, subscription: 29.99 }],
    monthly: [{ total: 29.99, subscription: 29.99 }],
    yearly: [{ total: 29.99, subscription: 29.99 }],
    alltime: [{ total: 29.99, subscription: 29.99 }],
  },
  subscriptions: {
    daily: [{ newSubscriber: 1, tier2: 1 }],
    weekly: [{ newSubscriber: 1, tier2: 1 }],
    monthly: [{ newSubscriber: 1, tier2: 1 }],
    yearly: [{ newSubscriber: 1, tier2: 1 }],
  },
  contributors: {
    topContributors: {
      alltime: [{ amount: 29.99, name: 'Fan 88001', usdSpent: 29.99 }],
      daily: [{ amount: 29.99, name: 'Fan 88001', usdSpent: 29.99 }],
    },
  },
};

describe('buildTestExpectations', () => {
  it('merges DOM expectations with internal API-only rows for newSubscription', () => {
    const rows = buildTestExpectations('newSubscription', samplePayload, {
      fields: { fanId: 88001, planId: 2 },
    });

    expect(rows.some((r) => r.source === 'dom' && r.metric === 'NEW subscribers')).toBe(true);
    expect(rows.some((r) => r.source === 'api' && r.id.includes('recentOrders'))).toBe(true);
    expect(rows.some((r) => r.period === 'alltime')).toBe(true);
  });

  it('includes merch recentOrders from internal config', () => {
    const rows = buildTestExpectations('merchOrder', samplePayload, {
      fields: { fanId: 88005 },
    });

    expect(rows.some((r) => r.scan?.path === 'recentOrders.merch.length')).toBe(true);
    expect(rows.some((r) => r.scan?.path === 'trendingMerch.daily.length')).toBe(true);
  });
});
