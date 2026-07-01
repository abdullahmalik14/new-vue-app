import { describe, expect, it } from 'vitest';

import { buildExpectationsFromApi } from '@/analytics-test-runner/config/buildExpectationsFromApi.js';
import { EVENT_EXPECTATIONS } from '@/analytics-test-runner/config/eventExpectations.js';

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
  contributors: {
    topContributors: {
      alltime: [{ amount: 29.99, name: 'Fan 88001', usdSpent: 29.99 }],
      daily: [{ amount: 29.99, name: 'Fan 88001', usdSpent: 29.99 }],
    },
  },
};

describe('buildExpectationsFromApi', () => {
  it('builds singular and chart rows from HTTP payload for newSubscription', () => {
    const rows = buildExpectationsFromApi('newSubscription', samplePayload, { planId: 2 });

    expect(rows.some((r) => r.valueKind === 'singular' && r.metric === 'NEW subscribers')).toBe(true);
    expect(rows.some((r) => r.valueKind === 'chart' && r.metric === 'total' && r.period === 'week')).toBe(true);
    expect(rows.some((r) => r.valueKind === 'chart' && r.metric === 'total' && r.period === 'day')).toBe(false);
    expect(rows.some((r) => r.valueKind === 'chart' && r.metric === 'tier2' && r.period === 'week')).toBe(true);
    expect(rows.find((r) => r.location === 'Earnings popup header' && r.period === 'day')?.expectedValue).toBe(29.99);
    expect(rows.some((r) => r.scan?.type === 'topContributorsPreview')).toBe(true);
    expect(rows.some((r) => r.id.includes('api.contributors.popup.topContributors.week'))).toBe(true);
  });

  it('builds expectations for every registered event without throwing', () => {
    const keys = Object.keys(EVENT_EXPECTATIONS);
    const richPayload = {
      ...samplePayload,
      likes: { daily: [{ media: 1, profile: 1, merch: 1, feed: 1 }] },
      fanInsights: { daily: [{ newFollowers: 1, profileVisits: 1 }] },
      trendingTags: { daily: [{ tag: 'Panty_Fetish', views: 1 }] },
      trendingsMedia: {
        daily: [
          { mediaId: 5117, views: 1 },
          { mediaId: 2811, watchDurationSec: 50 },
          { mediaId: 101, ppvSalesUSD: 15.02 },
        ],
      },
      trendingMerch: { daily: [{ merchId: 4 }] },
      trendingCountries: { daily: [{ country: 'Country 702', salesUSD: 29.99 }] },
    };

    keys.forEach((key) => {
      const fields = EVENT_EXPECTATIONS[key].trigger.fields;
      expect(() => buildExpectationsFromApi(key, richPayload, fields)).not.toThrow();
      const rows = buildExpectationsFromApi(key, richPayload, fields);
      expect(rows.length).toBeGreaterThan(0);
    });
  });
});
