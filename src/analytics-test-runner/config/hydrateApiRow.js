import { getStateMetric } from './stateMetricResolver.js';
import { getApiPathValue } from './apiPath.js';

/**
 * Attach expectedValue from internal state; keep scan rules for API found reads.
 */
export function attachApiFoundValues(row, expectationState, chartsPayload) {
  const expectedValue =
    row.expectedValue !== undefined
      ? row.expectedValue
      : getStateMetric(expectationState, row.apiPath || row.scan?.path, {
          period: row.period,
          countryId: row.countryId,
          mediaId: row.mediaId,
          tagId: row.tagId,
        });

  return {
    ...row,
    expectedValue: expectedValue ?? row.expectedValue ?? null,
    _chartsPayloadForScan: chartsPayload,
  };
}

/**
 * Read found value from live charts payload (API under test).
 */
export function readApiFoundValue(row, chartsPayload) {
  const scan = row.scan;
  if (!scan || !chartsPayload) return null;
  if (scan.type === 'apiPath') {
    return getApiPathValue(chartsPayload, scan.path);
  }
  if (scan.type === 'apiArrayMatch') {
    const arr = getApiPathValue(chartsPayload, scan.path);
    if (!Array.isArray(arr)) return null;
    const match = arr.find((item) => {
      const keyValue = item?.[scan.matchKey];
      if (keyValue == null) return false;
      return String(keyValue) === String(scan.matchValue) || String(keyValue).includes(String(scan.matchValue));
    });
    return match ? match[scan.valueKey] : null;
  }
  return getApiPathValue(chartsPayload, row.apiPath);
}
