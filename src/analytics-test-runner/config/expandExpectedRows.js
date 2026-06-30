import { rowExpanders } from './rowExpanders/index.js';

/**
 * @param {string} testCaseKey
 * @param {{ fields: Record<string, unknown> }} testCase
 */
export function expandExpectedRows(testCaseKey, testCase) {
  const expander = rowExpanders[testCaseKey];
  if (!expander) {
    throw new Error(`No row expander registered for test case: ${testCaseKey}`);
  }
  return expander(testCaseKey, testCase);
}

export { rowExpanders };
