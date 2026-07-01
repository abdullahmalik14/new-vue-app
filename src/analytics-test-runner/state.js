/** @typedef {'dom'|'amcharts'|'api'|'dataset'} TestSource */

/**
 * @typedef {Object} ExpectedRow
 * @property {string} id
 * @property {string} view
 * @property {string} metric
 * @property {string} period
 * @property {TestSource} source
 * @property {unknown} expectedValue
 * @property {number} [tolerance]
 * @property {Object} [scan]
 * @property {Object} [popup]
 * @property {string} [periodToggle]
 * @property {Object} [chart]
 */

/**
 * @typedef {Object} FoundRow
 * @property {string} expectedId
 * @property {string} view
 * @property {string} metric
 * @property {string} period
 * @property {TestSource} source
 * @property {unknown} foundValue
 * @property {string} [rawText]
 * @property {string} [elementPath]
 * @property {boolean} ok
 * @property {string|null} error
 */

/**
 * @typedef {Object} ComparisonRow
 * @property {string} expectedId
 * @property {string} view
 * @property {string} metric
 * @property {string} period
 * @property {unknown} expectedValue
 * @property {unknown} foundValue
 * @property {TestSource} source
 * @property {boolean} pass
 * @property {string} message
 */

export function createInitialAnalyticsTestState() {
  return {
    activeTestCase: null,
    status: 'idle',
    sentPayloads: [],
    apiLog: [],
    validationResults: [],
    chartsPayload: null,
    expectedRows: [],
    foundRows: [],
    comparisonRows: [],
    chartSnapshots: [],
    scannedElements: [],
    errors: [],
    refreshVerification: null,
    currentStepId: null,
    activityLog: [],
    baselinePayload: null,
    pauseDomScanBeforeEachStep: false,
    batchResults: [],
  };
}

export const analyticsTestState = createInitialAnalyticsTestState();

export function resetAnalyticsTestState() {
  const fresh = createInitialAnalyticsTestState();
  Object.keys(fresh).forEach((key) => {
    analyticsTestState[key] = fresh[key];
  });
}
