import { CHART_CONTRACTS, validateChartContractElement } from '../config/chartContractSchema.js';
import { normalizeNumber } from '../utils/normalizeNumber.js';
import { markScannedElement } from '../utils/markScannedElement.js';

/**
 * Find the chart container element for a given chartId.
 * Checks both data-chart-id (chartsHandler native) and data-analytics-chart-id.
 *
 * @param {string} chartId
 * @returns {HTMLElement|null}
 */
function findChartContainer(chartId) {
  return (
    document.querySelector(`[data-chart-id="${chartId}"]`) ||
    document.querySelector(`[data-analytics-chart-id="${chartId}"]`) ||
    null
  );
}

/**
 * Validate that a chart satisfies its contract schema.
 * Returns pass/fail with error list.
 *
 * @param {string} chartId
 * @param {string} [_period] — reserved for future period-specific contracts
 * @returns {{ pass: boolean, chartId: string, errors: string[], container: HTMLElement|null }}
 */
export function validateChartContract(chartId, _period) {
  const container = findChartContainer(chartId);
  const { pass, errors } = validateChartContractElement(chartId, container);

  if (container) {
    markScannedElement(container, `contract: ${chartId}`);
  }

  return { pass, chartId, errors, container };
}

/**
 * Run contract validation for all charts visible in the current DOM.
 *
 * @returns {{ results: Array<{ chartId: string, pass: boolean, errors: string[] }>, passCount: number, failCount: number }}
 */
export function validateAllVisibleChartContracts() {
  const results = [];

  Object.keys(CHART_CONTRACTS).forEach((chartId) => {
    const container = findChartContainer(chartId);
    if (!container) return;

    // Only validate visible containers (hidden attribute = not currently shown)
    if (container.hidden || container.getAttribute('hidden') !== null) return;

    const { pass, errors } = validateChartContractElement(chartId, container);
    results.push({ chartId, pass, errors });
  });

  const passCount = results.filter((r) => r.pass).length;
  const failCount = results.filter((r) => !r.pass).length;
  return { results, passCount, failCount };
}

/**
 * Read a metric value from a chart container's data-analytics-values.
 *
 * @param {{ chartId: string, period?: string, metric: string, shape?: 'scalar'|'last'|'slots' }} options
 * @returns {{ ok: boolean, foundValue: number|null, rawText: string, element: HTMLElement|null, error: string|null }}
 */
export function scanChartMetric({ chartId, metric, shape = 'last' }) {
  if (!chartId || !metric) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: null,
      error: 'chartId and metric are required for scanChartMetric',
    };
  }

  const container = findChartContainer(chartId);

  if (!container) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: null,
      error: `Chart container not found: ${chartId}`,
    };
  }

  markScannedElement(container, `chart: ${chartId} · ${metric}`);

  const renderedAt = container.getAttribute('data-analytics-rendered-at');
  if (!renderedAt) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: container,
      error: `Chart "${chartId}" has no data-analytics-rendered-at — stamp not yet applied`,
    };
  }

  const valuesRaw = container.getAttribute('data-analytics-values');
  if (!valuesRaw) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: container,
      error: `Chart "${chartId}" has no data-analytics-values`,
    };
  }

  let valuesMap;
  try {
    valuesMap = JSON.parse(valuesRaw);
  } catch {
    return {
      ok: false,
      foundValue: null,
      rawText: valuesRaw,
      element: container,
      error: `data-analytics-values is not valid JSON for "${chartId}"`,
    };
  }

  if (!(metric in valuesMap)) {
    const available = Object.keys(valuesMap).join(', ') || 'none';
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: container,
      error: `Metric "${metric}" not in data-analytics-values for "${chartId}". Available: ${available}`,
    };
  }

  const entry = valuesMap[metric];
  let foundValue = null;

  if (entry == null) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: container,
      error: `Metric "${metric}" is null in data-analytics-values for "${chartId}"`,
    };
  }

  if (shape === 'scalar') {
    foundValue = normalizeNumber(typeof entry === 'object' ? entry.last ?? entry.value : entry);
  } else if (shape === 'last') {
    foundValue = normalizeNumber(
      typeof entry === 'object' ? entry.last ?? (Array.isArray(entry.slots) ? entry.slots[entry.slots.length - 1] : null) : entry,
    );
  } else if (shape === 'slots') {
    // Return the full slots array as the foundValue (comparison handles arrays)
    foundValue = typeof entry === 'object' && Array.isArray(entry.slots) ? entry.slots : null;
    return {
      ok: foundValue != null,
      foundValue,
      rawText: JSON.stringify(foundValue),
      element: container,
      error: foundValue == null ? `No slots array in "${metric}" for "${chartId}"` : null,
    };
  } else {
    foundValue = normalizeNumber(typeof entry === 'object' ? entry.last : entry);
  }

  const ok = foundValue != null && !Number.isNaN(foundValue);
  return {
    ok,
    foundValue,
    rawText: String(foundValue),
    element: container,
    error: ok ? null : `Could not resolve numeric value for metric "${metric}" in "${chartId}" (shape="${shape}")`,
  };
}
