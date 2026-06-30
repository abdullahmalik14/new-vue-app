import {
  addMainSubscriptionRows,
  addMainEarningsRow,
  addEarningsPopupRows,
  addSubscribersPopupRows,
  addContributorsApiRow,
  addRecentOrdersApiRow,
} from './helpers.js';

export function expandNewSubscription(testCaseKey, testCase) {
  const amount = Number(testCase.fields?.amount ?? 29.99);
  const fanId = testCase.fields?.fanId ?? '88001';
  const rows = [];

  addMainSubscriptionRows(rows, testCaseKey, { newCount: 1 });
  addMainEarningsRow(rows, testCaseKey, amount);
  addEarningsPopupRows(rows, testCaseKey, amount, { subscription: amount });
  addSubscribersPopupRows(rows, testCaseKey, { newSubscriber: 1 });
  addContributorsApiRow(rows, testCaseKey, `Fan ${fanId}`);
  addRecentOrdersApiRow(rows, testCaseKey, 'subscriptions');

  return rows;
}
