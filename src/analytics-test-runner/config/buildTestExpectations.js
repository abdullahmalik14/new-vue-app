import { EVENT_EXPECTATIONS } from './eventExpectations.js';
import { expandExpectedRows } from './expandExpectedRows.js';
import { buildExpectationsFromApi } from './buildExpectationsFromApi.js';
import { hydrateApiRow } from './hydrateApiRow.js';

/**
 * Merge DOM expectations (API-hydrated, UI-aligned scan rules) with internal config
 * API-only contract rows from rowExpanders / eventExpectations.
 *
 * @param {string} testCaseKey
 * @param {object} chartsPayload
 * @param {{ fields?: Record<string, unknown> }} [options]
 */
export function buildTestExpectations(testCaseKey, chartsPayload, options = {}) {
  const fields = options.fields || {};
  const testCase = EVENT_EXPECTATIONS[testCaseKey];
  if (!testCase) {
    throw new Error(`Unknown test case: ${testCaseKey}`);
  }

  const domRows = buildExpectationsFromApi(testCaseKey, chartsPayload, { fields });
  const domIds = new Set(domRows.map((row) => row.id));

  let supplementalApiRows = [];
  try {
    const internalRows = expandExpectedRows(testCaseKey, { ...testCase, fields });
    supplementalApiRows = internalRows
      .filter((row) => row.source === 'api' && !domIds.has(row.id))
      .map((row) => hydrateApiRow(row, chartsPayload));
  } catch {
    supplementalApiRows = [];
  }

  return [...domRows, ...supplementalApiRows];
}
