import { describe, expect, it } from 'vitest';

import { periodMatchesLabel, toUiPeriodId } from '@/analytics-test-runner/utils/periodMap.js';
import { toAnalyticsContractPeriod } from '@/systems/analytics/analyticsPeriodsConfig.js';

describe('periodMap', () => {
  it('maps day to daily ui id', () => {
    expect(toUiPeriodId('day')).toBe('daily');
  });

  it('maps daily ui id to contract day key', () => {
    expect(toAnalyticsContractPeriod('daily')).toBe('day');
    expect(toAnalyticsContractPeriod('weekly')).toBe('week');
    expect(toAnalyticsContractPeriod('all-time')).toBe('alltime');
  });

  it('matches Daily label for day period', () => {
    expect(periodMatchesLabel('day', 'Daily')).toBe(true);
  });

  it('matches Weekly label for week period', () => {
    expect(periodMatchesLabel('week', 'Weekly')).toBe(true);
  });
});
