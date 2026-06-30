import { getApiPathValue } from './buildExpectationsFromApi.js';

function hydrateApiArrayMatch(scan, payload) {
  const arr = getApiPathValue(payload, scan.path);
  if (!Array.isArray(arr)) return null;
  const match = arr.find((item) => {
    const keyValue = item?.[scan.matchKey];
    if (keyValue == null) return false;
    if (scan.matchValue == null) return true;
    return (
      String(keyValue) === String(scan.matchValue) ||
      String(keyValue).includes(String(scan.matchValue))
    );
  });
  return match ? match[scan.valueKey] : null;
}

/**
 * Fill expectedValue on internal API-only rows from live /api/charts payload.
 * @param {object} row
 * @param {object} payload
 */
export function hydrateApiRow(row, payload) {
  const scan = row.scan || {};
  let expectedValue = row.expectedValue;

  if (scan.type === 'apiArrayMatch') {
    expectedValue = hydrateApiArrayMatch(scan, payload);
  } else if (scan.path) {
    if (scan.path.endsWith('.length')) {
      const arrPath = scan.path.replace(/\.length$/, '');
      const arr = getApiPathValue(payload, arrPath);
      expectedValue = Array.isArray(arr) ? arr.length : 0;
    } else {
      expectedValue = getApiPathValue(payload, scan.path);
    }
  }

  return {
    ...row,
    valueKind: row.valueKind || 'singular',
    apiPath: row.apiPath || scan.path || row.id,
    expectedValue: expectedValue ?? row.expectedValue ?? null,
  };
}
