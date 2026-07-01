import { EVENT_EXPECTATIONS } from './eventExpectations.js';
import { expandExpectedRows } from './expandExpectedRows.js';
import {
  buildExpectationsFromState,
  buildExpectationsFromEventHistory,
} from './buildExpectationsFromState.js';
import { attachApiFoundValues } from './hydrateApiRow.js';
import { buildApiValidationRows } from './apiValidationRows.js';

/**
 * Build expectation rows from internal state (never from live API for expectedValue).
 *
 * @param {string} testCaseKey
 * @param {object} chartsPayload — used only for API "found" reads and contract validation
 * @param {{ fields?: Record<string, unknown>, expectationState?: object, eventHistory?: Array }} [options]
 */
export function buildTestExpectations(testCaseKey, chartsPayload, options = {}) {
  const fields = options.fields || {};
  const expectationState = options.expectationState;
  if (!expectationState) {
    throw new Error('buildTestExpectations requires expectationState (internal ledger)');
  }

  const testCase = EVENT_EXPECTATIONS[testCaseKey];
  if (!testCase && !options.mixedBatch) {
    throw new Error(`Unknown test case: ${testCaseKey}`);
  }

  let domRows;
  if (options.eventHistory?.length > 1 || options.mixedBatch) {
    domRows = buildExpectationsFromEventHistory(options.eventHistory, expectationState);
  } else {
    domRows = buildExpectationsFromState(testCaseKey, expectationState, { fields });
  }

  const domIds = new Set(domRows.map((row) => row.id));

  let supplementalApiRows = [];
  try {
    if (testCase) {
      const internalRows = expandExpectedRows(testCaseKey, { ...testCase, fields });
      supplementalApiRows = internalRows
        .filter((row) => row.source === 'api' && !domIds.has(row.id))
        .map((row) => attachApiFoundValues(row, expectationState, chartsPayload));
    }
  } catch {
    supplementalApiRows = [];
  }

  const apiValidationRows = buildApiValidationRows(domRows, expectationState, chartsPayload);

  return [...domRows, ...supplementalApiRows, ...apiValidationRows];
}
