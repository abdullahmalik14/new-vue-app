import {
  addMainEarningsRow,
  addEarningsPopupRows,
  addContributorsApiRow,
  addRecentOrdersApiRow,
  addTrendingMerchApiRow,
} from './helpers.js';

export function expandMerchOrder(testCaseKey, testCase) {
  const amount = Number(testCase.fields?.amount ?? 15);
  const fanId = testCase.fields?.fanId ?? '88005';
  const rows = [];

  addMainEarningsRow(rows, testCaseKey, amount);
  addEarningsPopupRows(rows, testCaseKey, amount, { merch: amount });
  addContributorsApiRow(rows, testCaseKey, `Fan ${fanId}`);
  addRecentOrdersApiRow(rows, testCaseKey, 'merch');
  addTrendingMerchApiRow(rows, testCaseKey, 1);

  return rows;
}
