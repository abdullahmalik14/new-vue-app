import { describe, expect, it } from 'vitest';

import {
  buildRefreshVerificationChecks,
  assertPageNotReloaded,
  markRefreshSession,
} from '@/analytics-test-runner/refresh/verifyRefresh.js';

describe('analytics test runner refresh verification (Step 10)', () => {
  it('buildRefreshVerificationChecks passes when API and DOM update after refresh', () => {
    markRefreshSession();

    const checks = buildRefreshVerificationChecks({
      testCaseKey: 'newSubscription',
      baseline: { earnings: 0, subscribersNew: 0, newFollowers: 0, profileVisit: 0 },
      beforeRefresh: { earnings: 0, subscribersNew: 0, newFollowers: 0, profileVisit: 0 },
      afterRefresh: { earnings: 29.99, subscribersNew: 1, newFollowers: 0, profileVisit: 0 },
      apiMetric: 29.99,
    });

    expect(assertPageNotReloaded()).toBe(true);
    expect(checks.find((c) => c.id === 'step10.apiHasData')?.pass).toBe(true);
    expect(checks.find((c) => c.id === 'step10.domUpdatedAfterRefresh')?.pass).toBe(true);
  });

  it('buildRefreshVerificationChecks fails when DOM unchanged after refresh', () => {
    markRefreshSession();

    const checks = buildRefreshVerificationChecks({
      testCaseKey: 'follow',
      baseline: { earnings: 0, newFollowers: 0 },
      beforeRefresh: { earnings: 0, newFollowers: 0 },
      afterRefresh: { earnings: 0, newFollowers: 0 },
      apiMetric: 1,
    });

    expect(checks.find((c) => c.id === 'step10.domUpdatedAfterRefresh')?.pass).toBe(false);
    expect(checks.find((c) => c.id === 'step10.apiHasData')?.pass).toBe(true);
  });
});
