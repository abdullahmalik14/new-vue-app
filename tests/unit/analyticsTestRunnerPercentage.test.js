import { describe, expect, it } from 'vitest';
import {
  resolvePopupArrayDeltaPercent,
  resolveMainSubscribersNewPercentageFromMapped,
  resolveMainEarningsPercentageFromMapped,
} from '../../src/analytics-test-runner/config/percentageResolvers.js';
import { calculatePeriodChangePercent } from '../../src/services/analytics/mappers/analyticsResponseMapper.js';

describe('percentageResolvers', () => {
  it('main card uses calculatePeriodChangePercent (0 → positive = 100%)', () => {
    expect(calculatePeriodChangePercent(1, 0)).toBe(100);
    expect(calculatePeriodChangePercent(29.99, 0)).toBe(100);

    const mapped = {
      subscriptionsBundle: {
        daily: [{ sub: 0, tip: 0 }, { sub: 1, tip: 0 }],
      },
      earnings: {
        daily: [{ total: 0 }, { total: 29.99 }],
      },
    };

    expect(resolveMainSubscribersNewPercentageFromMapped(mapped)).toBe(100);
    expect(resolveMainEarningsPercentageFromMapped(mapped)).toBe(100);
  });

  it('popup style returns null when fewer than 2 buckets or previous is 0', () => {
    expect(resolvePopupArrayDeltaPercent([{ total: 10 }], 'total')).toBeNull();
    expect(resolvePopupArrayDeltaPercent([{ total: 0 }, { total: 10 }], 'total')).toBeNull();
    expect(resolvePopupArrayDeltaPercent([{ total: 10 }, { total: 5 }], 'total')).toBe(-50);
  });
});
