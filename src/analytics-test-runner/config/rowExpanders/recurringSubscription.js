import {
  addMainSubscriptionRows,
  addMainEarningsRow,
  addEarningsPopupRows,
  addContributorsApiRow,
  addRecentOrdersApiRow,
} from './helpers.js';

export function expandRecurringSubscription(testCaseKey, testCase) {
  const amount = Number(testCase.fields?.amount ?? 10);
  const fanId = testCase.fields?.fanId ?? '88001';
  const rows = [];

  addMainSubscriptionRows(rows, testCaseKey, { newCount: 0, recurringCount: 1 });
  addMainEarningsRow(rows, testCaseKey, amount);
  addEarningsPopupRows(rows, testCaseKey, amount, { subscription: amount });
  addContributorsApiRow(rows, testCaseKey, `Fan ${fanId}`);
  addRecentOrdersApiRow(rows, testCaseKey, 'subscriptions');

  return rows;
}
