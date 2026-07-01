import { EVENT_EXPECTATIONS } from './eventExpectations.js';
import { TEST_FAN_IDS } from './testCreator.js';

/** Dropdown value: run every single-event case sequentially (clear + 1 event each). */
export const BATCH_RUN_ALL_KEY = '__batch_all__';

/** @typedef {{ key: string, label: string, fanId?: ((ids: typeof TEST_FAN_IDS) => number | null) | null, batch?: boolean }} RunnableTestCase */

/** Unique fan per case — avoids idempotency collisions on creator 99999. */
const FAN_BY_KEY = {
  newSubscription: (ids) => ids.primary,
  recurringSubscription: (ids) => ids.recurringFan,
  switchSubscription: (ids) => ids.switchSubFan,
  cancelSubscription: (ids) => ids.cancelFan,
  merchOrder: (ids) => ids.merchFan,
  p2vOrder: (ids) => ids.p2vFan,
  tokenOrder: (ids) => ids.tokenFan,
  follow: (ids) => ids.followFan,
  unfollow: (ids) => ids.unfollowFan,
  profileVisit: (ids) => ids.profileVisitFan,
  mediaLike: (ids) => ids.mediaLikeFan,
  mediaUnlike: (ids) => ids.mediaLikeFan,
  profileLike: (ids) => ids.profileLikeFan,
  profileUnlike: (ids) => ids.profileLikeFan,
  merchLike: (ids) => ids.merchLikeFan,
  merchUnlike: (ids) => ids.merchLikeFan,
  feedLike: (ids) => ids.feedLikeFan,
  feedUnlike: (ids) => ids.feedLikeFan,
  tagEngagement: (ids) => ids.tagFan,
  mediaView: () => null,
  mediaWatchDuration: (ids) => ids.mediaWatchFan,
};

/** @type {RunnableTestCase[]} */
export const RUNNABLE_TEST_CASES = Object.keys(EVENT_EXPECTATIONS).map((key) => ({
  key,
  label: EVENT_EXPECTATIONS[key].label,
  fanId: FAN_BY_KEY[key] ?? ((ids) => ids.primary),
}));

/** Panel dropdown entries (batch option + all single-event cases). */
export const DROPDOWN_TEST_OPTIONS = [
  {
    key: BATCH_RUN_ALL_KEY,
    label: 'Batch: all cases (sequential)',
    batch: true,
  },
  ...RUNNABLE_TEST_CASES,
];

export function isBatchRunSelection(testCaseKey) {
  return testCaseKey === BATCH_RUN_ALL_KEY;
}

export function getBatchTestCaseKeys() {
  return RUNNABLE_TEST_CASES.map((c) => c.key);
}

export function resolveFanIdForTestCase(testCaseKey) {
  const resolver = FAN_BY_KEY[testCaseKey];
  if (resolver === undefined) return TEST_FAN_IDS.primary;
  return resolver(TEST_FAN_IDS);
}

export function getDefaultTestCaseKey() {
  return 'newSubscription';
}

export function isRunnableTestCaseKey(testCaseKey) {
  return testCaseKey in EVENT_EXPECTATIONS;
}
