import { readApiFoundValue } from './hydrateApiRow.js';
import { getStateMetric } from './stateMetricResolver.js';

/**
 * Explicit internal-vs-API comparison rows for drift visibility.
 */
export function buildApiValidationRows(domRows, expectationState, chartsPayload) {
  if (!chartsPayload) return [];

  const apiRows = domRows.filter((row) => row.source === 'api' || row.apiPath?.startsWith('contributors.'));
  const validationRows = [];

  apiRows.forEach((row) => {
    const expectedValue = getStateMetric(expectationState, row.apiPath, {
      period: row.period,
      countryId: row.countryId,
      mediaId: row.mediaId,
      tagId: row.tagId,
    });
    if (expectedValue == null && !row.knownGap) return;

    validationRows.push({
      ...row,
      id: `${row.id}.apiValidation`,
      source: 'api',
      valueKind: 'api-validation',
      expectedValue,
      validationOnly: true,
      scan: row.scan || { type: 'apiPath', path: row.apiPath },
      _chartsPayloadForScan: chartsPayload,
    });
  });

  return validationRows;
}

export function compareInternalToApi(expectedValue, chartsPayload, row) {
  const found = readApiFoundValue(row, chartsPayload);
  if (expectedValue == null) return { pass: true, found, message: 'No internal expectation' };
  if (found == null) return { pass: false, found, message: `Internal ${expectedValue} vs API missing` };
  const diff = Math.abs(Number(found) - Number(expectedValue));
  const pass = diff <= (row.tolerance ?? 0.01);
  return {
    pass,
    found,
    message: pass
      ? `Internal ${expectedValue} matches API ${found}`
      : `Internal ${expectedValue} vs API ${found}`,
  };
}
