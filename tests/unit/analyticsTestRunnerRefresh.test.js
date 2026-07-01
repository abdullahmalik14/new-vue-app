import { describe, expect, it } from 'vitest';

import {
  buildRefreshVerificationChecks,
  assertPageNotReloaded,
  markRefreshSession,
} from '@/analytics-test-runner/refresh/verifyRefresh.js';
import { createEmptyExpectationState, applyMasterEvent } from '@/analytics-test-runner/config/expectationState.js';

const chartsPayload = {
  earnings: {
    daily: [{ total: 29.99, subscription: 29.99, merch: 5, tipTokens: 10 }],
    weekly: [{ total: 29.99, subscription: 29.99 }],
    monthly: [{ total: 29.99, subscription: 29.99 }],
    yearly: [{ total: 29.99, subscription: 29.99 }],
  },
  subscriptions: {
    daily: [{ newSubscriber: 1, recurringSubscriber: 0, tier2: 1 }],
    weekly: [{ newSubscriber: 1, tier2: 1 }],
    monthly: [{ newSubscriber: 1, tier2: 1 }],
    yearly: [{ newSubscriber: 1, tier2: 1 }],
  },
  fanInsights: {
    daily: [{ newFollowers: 9, profileVisits: 34 }],
    weekly: [{ newFollowers: 9, profileVisits: 34 }],
    monthly: [{ newFollowers: 9, profileVisits: 34 }],
    yearly: [{ newFollowers: 9, profileVisits: 23 }],
  },
};

describe('analytics test runner refresh verification (Step 10)', () => {
  it('buildRefreshVerificationChecks passes when DOM matches internal expectation', () => {
    markRefreshSession();

    const expectationState = createEmptyExpectationState();
    applyMasterEvent(expectationState, {
      testCaseKey: 'newSubscription',
      fields: { amount: 29.99, planId: 2, countryId: 702 },
      fanId: 88001,
    });

    const checks = buildRefreshVerificationChecks({
      testCaseKey: 'newSubscription',
      afterRefresh: { earnings: 29.99, subscribersNew: 1, newFollowers: 0, profileVisit: 0 },
      apiMetric: 29.99,
      chartsPayload,
      expectationState,
    });

    expect(assertPageNotReloaded()).toBe(true);
    expect(checks.find((c) => c.id === 'step10.apiHasData')?.pass).toBe(true);
    expect(checks.find((c) => c.id === 'step10.domUpdatedAfterRefresh')?.pass).toBe(true);
    expect(checks.find((c) => c.id === 'step10.apiMatchesInternal')?.pass).toBe(true);
  });

  it('buildRefreshVerificationChecks fails when DOM does not match internal expectation', () => {
    markRefreshSession();

    const expectationState = createEmptyExpectationState();
    applyMasterEvent(expectationState, { testCaseKey: 'follow', fields: {} });

    const checks = buildRefreshVerificationChecks({
      testCaseKey: 'follow',
      afterRefresh: { earnings: 0, newFollowers: 0, profileVisit: 0 },
      apiMetric: 9,
      chartsPayload,
      expectationState,
    });

    expect(checks.find((c) => c.id === 'step10.domUpdatedAfterRefresh')?.pass).toBe(false);
    expect(checks.find((c) => c.id === 'step10.apiHasData')?.pass).toBe(true);
  });
});
