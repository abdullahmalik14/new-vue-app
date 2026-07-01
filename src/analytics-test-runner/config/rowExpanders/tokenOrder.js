import {
  addEarningsPopupRows,
  addTokenEarningsApiRow,
} from './helpers.js';

export function expandTokenOrder(testCaseKey, testCase) {
  const amount = Number(testCase.fields?.amount ?? 5);
  const rows = [];

  addEarningsPopupRows(rows, testCaseKey, 0, { tipTokens: amount });
  addTokenEarningsApiRow(rows, testCaseKey, amount);

  return rows;
}
