import { TEST_FAN_IDS } from './testCreator.js';

/** @typedef {{ key: string, label: string, fanId: (ids: typeof TEST_FAN_IDS) => number }} RunnableTestCase */

/** @type {RunnableTestCase[]} */
export const RUNNABLE_TEST_CASES = [
  { key: 'newSubscription', label: 'New Subscription', fanId: (ids) => ids.primary },
  { key: 'recurringSubscription', label: 'Recurring Subscription', fanId: (ids) => ids.primary },
  { key: 'merchOrder', label: 'Merch Order', fanId: (ids) => ids.merchFan },
  { key: 'tokenOrder', label: 'Token Order', fanId: (ids) => ids.tokenFan },
  { key: 'follow', label: 'Follow', fanId: (ids) => ids.switchFan },
  { key: 'profileVisit', label: 'Profile Visit', fanId: (ids) => ids.secondary },
  { key: 'tagEngagement', label: 'Tag Engagement', fanId: (ids) => ids.switchFan },
  { key: 'cancelSubscription', label: 'Cancel Subscription', fanId: (ids) => ids.cancelFan },
];

export function resolveFanIdForTestCase(testCaseKey) {
  const entry = RUNNABLE_TEST_CASES.find((item) => item.key === testCaseKey);
  return entry ? entry.fanId(TEST_FAN_IDS) : TEST_FAN_IDS.primary;
}

export function getDefaultTestCaseKey() {
  return 'newSubscription';
}
