import { describe, expect, it } from 'vitest';
import { buildTestExpectations } from '@/analytics-test-runner/config/buildTestExpectations.js';
import { createEmptyExpectationState, applyMasterEvent } from '@/analytics-test-runner/config/expectationState.js';

describe('buildTestExpectations (internal state)', () => {
  it('builds DOM rows from expectation state for newSubscription', () => {
    const state = createEmptyExpectationState();
    applyMasterEvent(state, {
      testCaseKey: 'newSubscription',
      fields: { amount: 29.99, planId: 2, countryId: 702 },
      fanId: 88001,
    });

    const rows = buildTestExpectations('newSubscription', {}, {
      fields: { fanId: 88001, planId: 2, countryId: 702 },
      expectationState: state,
      eventHistory: [{ testCaseKey: 'newSubscription', fields: { amount: 29.99 } }],
    });

    const earningsRow = rows.find((r) => r.id.includes('singular.main.earnings.total'));
    expect(earningsRow?.expectedValue).toBe(29.99);
    expect(rows.some((r) => r.source === 'dom' && r.metric === 'NEW subscribers')).toBe(true);
  });

  it('does not read expected values from charts payload', () => {
    const state = createEmptyExpectationState();
    applyMasterEvent(state, {
      testCaseKey: 'follow',
      fields: {},
      fanId: 88008,
    });

    const pollutedPayload = {
      fanInsights: { daily: [{ newFollowers: 999 }] },
      earnings: { daily: [{ total: 999 }] },
    };

    const rows = buildTestExpectations('follow', pollutedPayload, {
      expectationState: state,
      eventHistory: [{ testCaseKey: 'follow' }],
    });

    const fansRow = rows.find((r) => r.id.includes('singular.main.fans.newFollowers'));
    expect(fansRow?.expectedValue).toBe(1);
  });
});
