import {
  addMainEarningsRow,
  addEarningsPopupRows,
  addRecentOrdersApiRow,
  addTrendingMerchApiRow,
} from './helpers.js';

export function expandMerchOrder(testCaseKey, testCase) {
  const amount = Number(testCase.fields?.amount ?? 15);
  const rows = [];

  addMainEarningsRow(rows, testCaseKey, amount);
  addEarningsPopupRows(rows, testCaseKey, amount, { merch: amount });
  addRecentOrdersApiRow(rows, testCaseKey, 'merch');
  addTrendingMerchApiRow(rows, testCaseKey, 1);

  return rows;
}
