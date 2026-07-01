/**
 * Events that need a prior ingest after DB clear (unlike / cancel / unfollow).
 * Baseline is captured AFTER the seed event.
 */
export const EVENT_SEED_BEFORE = {
  cancelSubscription: {
    masterEventType: 'newOrder',
    fields: {
      orderType: 'new_subscription',
      amount: 29.99,
      countryId: 702,
      countryCode: 'SG',
      planId: 2,
      calculated_amount: 0,
      is_switch: false,
    },
    fanIdKey: 'newSubscription',
  },
  mediaUnlike: { useTestCase: 'mediaLike' },
  profileUnlike: { useTestCase: 'profileLike' },
  merchUnlike: { useTestCase: 'merchLike' },
  feedUnlike: { useTestCase: 'feedLike' },
  unfollow: { useTestCase: 'follow' },
};

export function resolveSeedForTestCase(testCaseKey) {
  return EVENT_SEED_BEFORE[testCaseKey] ?? null;
}
