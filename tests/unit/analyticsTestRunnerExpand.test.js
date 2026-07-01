import { describe, expect, it } from 'vitest';

import { expandExpectedRows } from '@/analytics-test-runner/config/expandExpectedRows.js';
import { EVENT_EXPECTATIONS } from '@/analytics-test-runner/config/eventExpectations.js';

describe('analytics test runner expandExpectedRows', () => {
  it('expands newSubscription with main, popup, and API rows', () => {
    const rows = expandExpectedRows('newSubscription', {
      ...EVENT_EXPECTATIONS.newSubscription,
      fields: { fanId: 88001, amount: 29.99 },
    });

    expect(rows.some((row) => row.id.includes('main.subscribers.new'))).toBe(true);
    expect(rows.some((row) => row.popup?.openFromHeading === 'Earnings')).toBe(true);
    expect(rows.some((row) => row.scan?.type === 'topContributorsPreview')).toBe(true);
    expect(rows.some((row) => row.scan?.path?.includes('contributors.topContributors.alltime'))).toBe(true);
  });

  it('expands merchOrder with trending merch API check', () => {
    const rows = expandExpectedRows('merchOrder', {
      ...EVENT_EXPECTATIONS.merchOrder,
      fields: { fanId: 88005, amount: 15 },
    });

    expect(rows.some((row) => row.id.includes('api.trendingMerch'))).toBe(true);
    expect(rows.some((row) => row.scan?.path === 'recentOrders.merch.length')).toBe(true);
  });

  it('expands tagEngagement with trending tags matcher', () => {
    const rows = expandExpectedRows('tagEngagement', {
      ...EVENT_EXPECTATIONS.tagEngagement,
      fields: { tagId: 'Panty_Fetish' },
    });

    expect(rows).toHaveLength(1);
    expect(rows[0].scan?.type).toBe('apiArrayMatch');
    expect(rows[0].scan?.matchValue).toBe('Panty_Fetish');
  });

  it('expands follow with fans main card and fanInsights API rows', () => {
    const rows = expandExpectedRows('follow', {
      ...EVENT_EXPECTATIONS.follow,
      fields: { fanId: 88003 },
    });

    expect(rows.some((row) => row.scan?.type === 'cardMetricByLabel' && row.scan?.label === 'NEW FOLLOWERS')).toBe(true);
    expect(rows.some((row) => row.scan?.path === 'fanInsights.daily.-1.newFollowers')).toBe(true);
  });

  it('expands tokenOrder with tipTokens API row', () => {
    const rows = expandExpectedRows('tokenOrder', {
      ...EVENT_EXPECTATIONS.tokenOrder,
      fields: { fanId: 88007, amount: 5 },
    });

    expect(rows.some((row) => row.scan?.path === 'earnings.daily.-1.tipTokens')).toBe(true);
  });

  it('expands profileVisit with profile visit DOM row', () => {
    const rows = expandExpectedRows('profileVisit', {
      ...EVENT_EXPECTATIONS.profileVisit,
      fields: { fanId: 88002 },
    });

    expect(rows.some((row) => row.scan?.label === 'PROFILE VISIT')).toBe(true);
  });

  it('throws for unknown test case key', () => {
    expect(() => expandExpectedRows('notARealCase', {})).toThrow(/No row expander/);
  });
});
