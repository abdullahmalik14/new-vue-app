import {
  addMainSubscriptionRows,
  addMainEarningsRow,
  addEarningsPopupRows,
  addRecentOrdersApiRow,
} from './helpers.js';

export function expandRecurringSubscription(testCaseKey, testCase) {
  const amount = Number(testCase.fields?.amount ?? 10);
  const rows = [];

  addMainSubscriptionRows(rows, testCaseKey, { newCount: 0, recurringCount: 1 });
  addMainEarningsRow(rows, testCaseKey, amount);
  addEarningsPopupRows(rows, testCaseKey, amount, { subscription: amount });
  addRecentOrdersApiRow(rows, testCaseKey, 'subscriptions');

  return rows;
}
