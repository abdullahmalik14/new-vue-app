import {
  addMainEarningsRow,
  addEarningsPopupRows,
  addContributorsApiRow,
  addTokenEarningsApiRow,
} from './helpers.js';

export function expandTokenOrder(testCaseKey, testCase) {
  const amount = Number(testCase.fields?.amount ?? 5);
  const fanId = testCase.fields?.fanId ?? '88007';
  const rows = [];

  addMainEarningsRow(rows, testCaseKey, amount);
  addEarningsPopupRows(rows, testCaseKey, amount, { tipTokens: amount });
  addTokenEarningsApiRow(rows, testCaseKey, amount);
  addContributorsApiRow(rows, testCaseKey, `Fan ${fanId}`);

  return rows;
}
