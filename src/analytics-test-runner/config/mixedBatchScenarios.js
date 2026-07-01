/**
 * Mixed-batch scenarios: multiple master events before one refresh.
 */
export const MIXED_BATCH_SCENARIOS = {
  mixedBatch_subscriptionAndMerch: {
    label: 'Mixed: New Subscription + Merch',
    events: [{ useTestCase: 'newSubscription' }, { useTestCase: 'merchOrder' }],
  },
  mixedBatch_followAndSubscription: {
    label: 'Mixed: Follow + New Subscription',
    events: [{ useTestCase: 'follow' }, { useTestCase: 'newSubscription' }],
  },
};

export function isMixedBatchKey(testCaseKey) {
  return testCaseKey in MIXED_BATCH_SCENARIOS;
}

export function resolveMixedBatchScenario(testCaseKey) {
  return MIXED_BATCH_SCENARIOS[testCaseKey] ?? null;
}
