/**
 * @deprecated Use masterEventChildMap + expectationState. Kept for legacy test imports.
 */
import { resolveMasterEventFromTestCase } from './masterEventChildMap.js';
import { applyMasterEvent, createEmptyExpectationState } from './expectationState.js';

/**
 * @param {string} testCaseKey
 * @param {Record<string, unknown>} fields
 */
export function getEventIncrement(testCaseKey, fields = {}) {
  const before = createEmptyExpectationState();
  const after = createEmptyExpectationState();
  applyMasterEvent(after, { testCaseKey, fields });

  const inc = {
    subscribersNew: readSub(after, 'newSubscriber') - readSub(before, 'newSubscriber'),
    subscribersRecurring: readSub(after, 'recurringSubscriber') - readSub(before, 'recurringSubscriber'),
    earningsTotal: readEarn(after, 'total') - readEarn(before, 'total'),
    earningsSubscription: readEarn(after, 'subscription') - readEarn(before, 'subscription'),
    earningsMerch: readEarn(after, 'merch') - readEarn(before, 'merch'),
    earningsPaytoview: readEarn(after, 'paytoview') - readEarn(before, 'paytoview'),
    earningsTipTokens: readEarn(after, 'tipTokens') - readEarn(before, 'tipTokens'),
    newFollowers: readFan(after, 'newFollowers') - readFan(before, 'newFollowers'),
    profileVisit: readFan(after, 'profileVisits') - readFan(before, 'profileVisits'),
    countrySales: Number(fields.amount ?? 0),
    countryId: Number(fields.countryId ?? 0),
    planTierKey: `tier${Number(fields.planId ?? 2)}`,
    planTierCount: readSub(after, `tier${Number(fields.planId ?? 2)}`) - readSub(before, `tier${Number(fields.planId ?? 2)}`),
  };

  return inc;
}

function readSub(state, key) {
  const row = state.subscriptions.daily?.at(-1) || {};
  return Number(row[key] ?? 0);
}

function readEarn(state, key) {
  const row = state.earnings.daily?.at(-1) || {};
  return Number(row[key] ?? 0);
}

function readFan(state, key) {
  const row = state.fans.daily?.at(-1) || {};
  return Number(row[key] ?? 0);
}

export { resolveMasterEventFromTestCase };
