import { describe, expect, it } from 'vitest';

import { periodMatchesLabel, toUiPeriodId } from '@/analytics-test-runner/utils/periodMap.js';

describe('periodMap', () => {
  it('maps day to daily ui id', () => {
    expect(toUiPeriodId('day')).toBe('daily');
  });

  it('matches Daily label for day period', () => {
    expect(periodMatchesLabel('day', 'Daily')).toBe(true);
  });

  it('matches Weekly label for week period', () => {
    expect(periodMatchesLabel('week', 'Weekly')).toBe(true);
  });
});
