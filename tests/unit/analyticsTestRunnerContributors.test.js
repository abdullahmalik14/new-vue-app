import { describe, expect, it } from 'vitest';
import {
  getTopContributorsArray,
  resolveTopContributorField,
} from '@/analytics-test-runner/config/uiExpectationResolver.js';

const payload = {
  contributors: {
    topContributors: {
      daily: [{ name: 'Fan 88001', usdSpent: 29.99 }],
      alltime: [{ name: 'Fan 88001', usdSpent: 29.99 }],
    },
  },
};

describe('top contributors API resolvers', () => {
  it('reads nested alltime contributor rows', () => {
    expect(getTopContributorsArray(payload, 'alltime')).toHaveLength(1);
    expect(resolveTopContributorField(payload, 'alltime', 'name')).toBe('Fan 88001');
    expect(resolveTopContributorField(payload, 'alltime', 'amount')).toBe(29.99);
  });

  it('falls back to alltime when daily bucket empty', () => {
    const sparse = {
      contributors: {
        topContributors: {
          daily: [],
          alltime: [{ name: 'Fan 88005', usdSpent: 15 }],
        },
      },
    };
    expect(resolveTopContributorField(sparse, 'daily', 'amount')).toBe(15);
  });

  it('uses getContributorsListForPeriod semantics (nested keys only)', () => {
    const nested = {
      contributors: {
        topContributors: {
          weekly: [{ name: 'Fan 88002', usdSpent: 10 }],
          alltime: [{ name: 'Fan 88001', usdSpent: 29.99 }],
        },
      },
    };
    expect(resolveTopContributorField(nested, 'week', 'amount')).toBe(10);
  });
});
