import { describe, expect, it } from 'vitest';
import { resolveChildUpdates } from '../../src/analytics-test-runner/config/masterEventChildMap.js';
import {
  createEmptyExpectationState,
  applyMasterEvent,
  projectStateToChartPaths,
} from '../../src/analytics-test-runner/config/expectationState.js';

describe('masterEventChildMap domain isolation', () => {
  it('follow updates only fans domain', () => {
    const state = createEmptyExpectationState();
    applyMasterEvent(state, { testCaseKey: 'follow', fields: {} });

    expect(state.fans.daily.at(-1)?.newFollowers).toBe(1);
    expect(state.subscriptions.daily.at(-1)?.newSubscriber ?? 0).toBe(0);
    expect(state.earnings.daily.at(-1)?.total ?? 0).toBe(0);
  });

  it('newSubscription updates subscriptions + earnings + countries, not fans', () => {
    const state = createEmptyExpectationState();
    applyMasterEvent(state, {
      testCaseKey: 'newSubscription',
      fields: { amount: 29.99, countryId: 702, planId: 2 },
      fanId: 88001,
    });

    expect(state.subscriptions.daily.at(-1)?.newSubscriber).toBe(1);
    expect(state.subscriptions.daily.at(-1)?.tier2).toBe(1);
    expect(state.earnings.daily.at(-1)?.total).toBe(29.99);
    expect(state.countries.daily[0]?.salesUSD).toBe(29.99);
    expect(state.fans.daily.at(-1)?.newFollowers ?? 0).toBe(0);
  });

  it('profileVisit vs follow — same domain, different metrics', () => {
    const followState = createEmptyExpectationState();
    applyMasterEvent(followState, { testCaseKey: 'follow', fields: {} });

    const visitState = createEmptyExpectationState();
    applyMasterEvent(visitState, { testCaseKey: 'profileVisit', fields: {} });

    expect(followState.fans.daily.at(-1)?.newFollowers).toBe(1);
    expect(followState.fans.daily.at(-1)?.profileVisits ?? 0).toBe(0);
    expect(visitState.fans.daily.at(-1)?.profileVisits).toBe(1);
    expect(visitState.fans.daily.at(-1)?.newFollowers ?? 0).toBe(0);
  });

  it('tokenOrder increments tipTokens not USD total', () => {
    const state = createEmptyExpectationState();
    applyMasterEvent(state, {
      testCaseKey: 'tokenOrder',
      fields: { amount: 5, countryId: 250 },
      fanId: 88007,
    });

    expect(state.earnings.daily.at(-1)?.tipTokens).toBe(5);
    expect(state.earnings.daily.at(-1)?.total ?? 0).toBe(0);
  });

  it('switchSubscription uses calculated_amount when configured', () => {
    const updates = resolveChildUpdates(
      'newOrder',
      {
        orderType: 'new_subscription',
        is_switch: true,
        amount: 30,
        calculated_amount: 20,
        earningsCreditField: 'calculated_amount',
        planId: 3,
      },
      { earningsCreditField: 'calculated_amount' },
    );
    const state = createEmptyExpectationState();
    const fields = {
      orderType: 'new_subscription',
      is_switch: true,
      amount: 30,
      calculated_amount: 20,
      planId: 3,
    };
    updates.forEach(({ apply }) =>
      apply(state, fields, { earningsCreditField: 'calculated_amount' }),
    );
    expect(state.earnings.daily.at(-1)?.total).toBe(20);
  });
});

describe('expectationState mixed batch', () => {
  it('composes newSubscription + merchOrder earnings', () => {
    const state = createEmptyExpectationState();
    applyMasterEvent(state, {
      testCaseKey: 'newSubscription',
      fields: { amount: 29.99, countryId: 702, planId: 2 },
      fanId: 88001,
    });
    applyMasterEvent(state, {
      testCaseKey: 'merchOrder',
      fields: { amount: 15, countryId: 634, merchId: 4 },
      fanId: 88005,
    });

    expect(state.earnings.daily.at(-1)?.total).toBeCloseTo(44.99, 2);
    expect(state.earnings.daily.at(-1)?.subscription).toBeCloseTo(29.99, 2);
    expect(state.earnings.daily.at(-1)?.merch).toBeCloseTo(15, 2);
    expect(state.fans.daily.at(-1)?.newFollowers ?? 0).toBe(0);
  });

  it('projects charts-compatible payload', () => {
    const state = createEmptyExpectationState();
    applyMasterEvent(state, {
      testCaseKey: 'newSubscription',
      fields: { amount: 29.99, planId: 2, countryId: 702 },
      fanId: 88001,
    });
    const projected = projectStateToChartPaths(state);
    expect(projected.earnings.daily.at(-1)?.total).toBe(29.99);
    expect(projected.subscriptions.daily.at(-1)?.newSubscriber).toBe(1);
    expect(projected.contributors.topContributors.alltime[0]?.usdSpent).toBe(29.99);
  });
});
