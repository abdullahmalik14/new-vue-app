import { createRow } from './helpers.js';

/**
 * Cancel is expected to reduce earnings per Google Doc.
 * Known backend gap: earnings may NOT decrease — row documents expected behavior.
 */
export function expandCancelSubscription(testCaseKey, testCase) {
  const rows = [];

  rows.push(
    createRow(`${testCaseKey}.main.earnings.decreased.day.dom`, {
      view: 'Main',
      metric: 'Total Earnings after cancel',
      period: 'day',
      source: 'dom',
      expectedValue: 0,
      tolerance: 0.01,
      knownGap: 'Backend may not reverse earnings on cancel',
      scan: { type: 'metricSelector', metric: 'earnings.total', period: 'day', surface: 'main' },
    }),
  );

  rows.push(
    createRow(`${testCaseKey}.api.earnings.subscription.day`, {
      view: 'API',
      metric: 'Daily subscription earnings',
      period: 'day',
      source: 'api',
      expectedValue: 0,
      knownGap: 'Cancel may not reverse subscription revenue in charts payload',
      scan: { type: 'apiPath', path: 'earnings.daily.-1.subscription' },
    }),
  );

  return rows;
}

/**
 * Run after newSubscription in same session — compares against post-cancel state.
 * Used when test case key is cancelSubscription standalone after prior seed.
 */
export function expandCancelSubscriptionStandalone(testCaseKey) {
  return expandCancelSubscription(testCaseKey, { fields: {} });
}
