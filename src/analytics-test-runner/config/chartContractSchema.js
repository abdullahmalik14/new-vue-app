/**
 * Schema contracts for each chart container (keyed by data-chart-id value).
 *
 * Each entry declares what attributes and metric keys MUST exist on the container
 * after chartsHandler stamps it. The test runner validates these before comparing values.
 *
 * HOW TO ADD A CHART CONTRACT:
 *  1. Add the chart's data-chart-id here.
 *  2. List every metric key that must appear in data-analytics-values.
 *  3. Declare the valueShape per metric so the scanner knows how to read the value.
 *  4. Register the same chart binding in analyticsMetricRegistry.js.
 */

/**
 * @typedef {'scalar'|'last'|'slots'} ValueShape
 *   scalar — single numeric value (donut slice)
 *   last   — last slot of a series array { last, slots }
 *   slots  — full series array
 *
 * @typedef {Object} MetricContract
 * @property {ValueShape} shape
 * @property {boolean} [optional] — if true, contract does not fail when key is absent
 *
 * @typedef {Object} ChartContract
 * @property {string} period        — UI period when this chart is active
 * @property {string} chartType     — 'donut'|'bar'|'line'|'map'
 * @property {string[]} requiredAttributes
 * @property {Record<string, MetricContract>} requiredMetrics
 */

const REQUIRED_BASE_ATTRIBUTES = [
  'data-analytics-chart-id',
  'data-analytics-period',
  'data-analytics-chart-type',
  'data-analytics-values',
  'data-analytics-rendered-at',
];

/** @type {Record<string, ChartContract>} */
export const CHART_CONTRACTS = {
  // ── Earnings popup ────────────────────────────────────────────────────────
  'sales-daily-donut': {
    period: 'day',
    chartType: 'donut',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'earnings.subscription': { shape: 'scalar' },
      'earnings.merch': { shape: 'scalar', optional: true },
      'earnings.total': { shape: 'scalar', optional: true },
    },
  },
  'sales-weekly-bar': {
    period: 'week',
    chartType: 'bar',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'earnings.total': { shape: 'last' },
      'earnings.subscription': { shape: 'last' },
      'earnings.merch': { shape: 'last', optional: true },
    },
  },
  'sales-monthly-bar': {
    period: 'month',
    chartType: 'bar',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'earnings.total': { shape: 'last' },
      'earnings.subscription': { shape: 'last' },
      'earnings.merch': { shape: 'last', optional: true },
    },
  },
  'sales-yearly-bar': {
    period: 'year',
    chartType: 'bar',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'earnings.total': { shape: 'last' },
      'earnings.subscription': { shape: 'last' },
      'earnings.merch': { shape: 'last', optional: true },
    },
  },
  'sales-alltime-bar': {
    period: 'alltime',
    chartType: 'bar',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'earnings.total': { shape: 'last' },
      'earnings.subscription': { shape: 'last' },
      'earnings.merch': { shape: 'last', optional: true },
    },
  },

  // ── Token earnings ────────────────────────────────────────────────────────
  'tokens-daily-donut': {
    period: 'day',
    chartType: 'donut',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'earnings.tip-tokens': { shape: 'scalar', optional: true },
    },
  },
  'tokens-weekly-bar': {
    period: 'week',
    chartType: 'bar',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'earnings.tip-tokens': { shape: 'last', optional: true },
    },
  },
  'tokens-monthly-bar': {
    period: 'month',
    chartType: 'bar',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'earnings.tip-tokens': { shape: 'last', optional: true },
    },
  },
  'tokens-yearly-bar': {
    period: 'year',
    chartType: 'bar',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'earnings.tip-tokens': { shape: 'last', optional: true },
    },
  },
  'tokens-alltime-bar': {
    period: 'alltime',
    chartType: 'bar',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'earnings.tip-tokens': { shape: 'last', optional: true },
    },
  },

  // ── Subscribers popup ─────────────────────────────────────────────────────
  'subs-daily-donut': {
    period: 'day',
    chartType: 'donut',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'subscribers.new': { shape: 'scalar' },
    },
  },
  'subs-weekly-bar': {
    period: 'week',
    chartType: 'bar',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'subscribers.new': { shape: 'last' },
    },
  },
  'subs-monthly-bar': {
    period: 'month',
    chartType: 'bar',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'subscribers.new': { shape: 'last' },
    },
  },
  'subs-yearly-bar': {
    period: 'year',
    chartType: 'bar',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'subscribers.new': { shape: 'last' },
    },
  },
  'subs-alltime-bar': {
    period: 'alltime',
    chartType: 'bar',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'subscribers.new': { shape: 'last' },
    },
  },

  // Tier breakdown
  'tiers-daily-donut': {
    period: 'day',
    chartType: 'donut',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'subscribers.tier1': { shape: 'scalar', optional: true },
      'subscribers.tier2': { shape: 'scalar', optional: true },
    },
  },
  'tiers-weekly-bar': {
    period: 'week',
    chartType: 'bar',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'subscribers.tier1': { shape: 'last', optional: true },
      'subscribers.tier2': { shape: 'last', optional: true },
    },
  },
  'tiers-monthly-bar': {
    period: 'month',
    chartType: 'bar',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'subscribers.tier1': { shape: 'last', optional: true },
    },
  },
  'tiers-yearly-bar': {
    period: 'year',
    chartType: 'bar',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'subscribers.tier1': { shape: 'last', optional: true },
    },
  },
  'tiers-alltime-bar': {
    period: 'alltime',
    chartType: 'bar',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'subscribers.tier1': { shape: 'last', optional: true },
    },
  },

  // ── Fans popup ────────────────────────────────────────────────────────────
  'fans-weekly-bar': {
    period: 'week',
    chartType: 'bar',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'fans.new-followers': { shape: 'last' },
    },
  },
  'fans-monthly-bar': {
    period: 'month',
    chartType: 'bar',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'fans.new-followers': { shape: 'last' },
    },
  },
  'fans-yearly-bar': {
    period: 'year',
    chartType: 'bar',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'fans.new-followers': { shape: 'last' },
    },
  },
  'fans-alltime-bar': {
    period: 'alltime',
    chartType: 'bar',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'fans.new-followers': { shape: 'last' },
    },
  },

  // ── Likes ─────────────────────────────────────────────────────────────────
  // DashboardAnalyticsLikesTrendPopup uses data-chart-id="likes-chart-bar" and "likes-chart-line"
  'likes-chart-bar': {
    period: 'day',
    chartType: 'bar',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'likes.media': { shape: 'last', optional: true },
      'likes.merch': { shape: 'last', optional: true },
      'likes.profile': { shape: 'last', optional: true },
      'likes.feed': { shape: 'last', optional: true },
    },
  },
  'likes-chart-line': {
    period: 'day',
    chartType: 'line',
    requiredAttributes: REQUIRED_BASE_ATTRIBUTES,
    requiredMetrics: {
      'likes.media': { shape: 'last', optional: true },
      'likes.merch': { shape: 'last', optional: true },
      'likes.profile': { shape: 'last', optional: true },
      'likes.feed': { shape: 'last', optional: true },
    },
  },
};

/**
 * Validate that a chart container element satisfies its contract.
 *
 * @param {string} chartId
 * @param {HTMLElement|null} container
 * @returns {{ pass: boolean, errors: string[] }}
 */
export function validateChartContractElement(chartId, container) {
  const contract = CHART_CONTRACTS[chartId];
  const errors = [];

  if (!contract) {
    return { pass: true, errors: [] };
  }

  if (!container) {
    return { pass: false, errors: [`Container not found for chartId="${chartId}"`] };
  }

  contract.requiredAttributes.forEach((attr) => {
    if (!container.hasAttribute(attr)) {
      errors.push(`Missing attribute: ${attr}`);
    }
  });

  let valuesMap = {};
  const valuesRaw = container.getAttribute('data-analytics-values');
  if (valuesRaw) {
    try {
      valuesMap = JSON.parse(valuesRaw);
    } catch {
      errors.push('data-analytics-values is not valid JSON');
    }
  }

  Object.entries(contract.requiredMetrics).forEach(([metricKey, metricContract]) => {
    if (metricContract.optional) return;
    if (!(metricKey in valuesMap)) {
      errors.push(`Missing required metric in data-analytics-values: "${metricKey}"`);
    }
  });

  return { pass: errors.length === 0, errors };
}
