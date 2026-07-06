/**
 * chartAnalyticsContract.js
 *
 * Stamps data-analytics-* attributes on chart container elements at render time.
 * This is the only place chart values are written to the DOM for test runner consumption.
 *
 * Loaded as a plain browser script (window.chartAnalyticsContract) before chartsHandler.
 * Functions are also exported (for unit tests via ES module bundler).
 *
 * ATTRIBUTE CONTRACT:
 *   data-analytics-chart-id       — matches data-chart-id (chart instance id)
 *   data-analytics-period         — UI period (day|week|month|year|alltime)
 *   data-analytics-chart-type     — donut|bar|line|map
 *   data-analytics-values         — JSON: { [metricKey]: number | { last: number, slots: number[] } }
 *   data-analytics-rendered-at    — ISO timestamp set after each render
 */

(function (root) {
  'use strict';

  // ── Period derivation ───────────────────────────────────────────────────────

  const PERIOD_SLUG_TO_UI = {
    daily: 'day',
    weekly: 'week',
    monthly: 'month',
    yearly: 'year',
    alltime: 'alltime',
    day: 'day',
    week: 'week',
    month: 'month',
    year: 'year',
  };

  /**
   * Derive a UI period string from a chart instance id.
   * e.g. 'sales-daily-donut' → 'day', 'fans-weekly-bar' → 'week'
   *
   * @param {string} chartInstanceId
   * @returns {string}
   */
  function derivePeriodFromChartId(chartInstanceId) {
    if (!chartInstanceId) return 'day';
    const id = String(chartInstanceId).toLowerCase();
    const matches = id.match(/\b(daily|weekly|monthly|yearly|alltime|day|week|month|year)\b/);
    if (matches) return PERIOD_SLUG_TO_UI[matches[1]] || 'day';
    return 'day';
  }

  /**
   * Derive chart type from chartType config value or chart id.
   *
   * @param {string} chartType
   * @param {string} chartInstanceId
   * @returns {string}
   */
  function deriveChartType(chartType, chartInstanceId) {
    if (chartType) {
      const t = String(chartType).toLowerCase();
      if (t.includes('donut') || t.includes('pie')) return 'donut';
      if (t.includes('bar')) return 'bar';
      if (t.includes('line')) return 'line';
      if (t.includes('map')) return 'map';
      return t;
    }
    const id = String(chartInstanceId || '').toLowerCase();
    if (id.includes('donut')) return 'donut';
    if (id.includes('bar')) return 'bar';
    if (id.includes('map')) return 'map';
    if (id.includes('line')) return 'line';
    return 'bar';
  }

  // ── Breakdown key → metric key ──────────────────────────────────────────────

  /**
   * Inline breakdown mapping (mirrors breakdownKeyToMetric.js — kept in sync manually).
   * Using an inline copy so this file stays dependency-free for browser loading.
   */
  const BREAKDOWN_TO_METRIC = {
    subscription: 'earnings.subscription',
    sub: 'earnings.subscription',
    merch: 'earnings.merch',
    total: 'earnings.total',
    tipTokens: 'earnings.tip-tokens',
    tiptokens: 'earnings.tip-tokens',
    callTokens: 'earnings.call-tokens',
    calltokens: 'earnings.call-tokens',
    chatTokens: 'earnings.chat-tokens',
    chattokens: 'earnings.chat-tokens',
    liveStreamTokens: 'earnings.live-stream-tokens',
    livestreamtokens: 'earnings.live-stream-tokens',
    newSubscriber: 'subscribers.new',
    newsubscriber: 'subscribers.new',
    'New Subscriber': 'subscribers.new',
    recurringSubscriber: 'subscribers.recurring',
    recurringsubscriber: 'subscribers.recurring',
    'Free': 'subscribers.tier0',
    'Tier 1': 'subscribers.tier1',
    'Tier 2': 'subscribers.tier2',
    'Tier 3': 'subscribers.tier3',
    'Tier 4': 'subscribers.tier4',
    'Tier 5': 'subscribers.tier5',
    tier1: 'subscribers.tier1',
    tier2: 'subscribers.tier2',
    tier3: 'subscribers.tier3',
    tier4: 'subscribers.tier4',
    tier5: 'subscribers.tier5',
    newFollowers: 'fans.new-followers',
    newfollowers: 'fans.new-followers',
    profileVisits: 'fans.profile-visits',
    profilevisits: 'fans.profile-visits',
    profileVisit: 'fans.profile-visits',
    profilevisit: 'fans.profile-visits',
    media: 'likes.media',
    profile: 'likes.profile',
    feed: 'likes.feed',
  };

  function lookupMetricKey(key) {
    if (key == null) return null;
    return BREAKDOWN_TO_METRIC[key] || BREAKDOWN_TO_METRIC[String(key).toLowerCase()] || null;
  }

  // ── Value building ──────────────────────────────────────────────────────────

  /**
   * Build the data-analytics-values map from chart render context.
   *
   * @param {object} ctx
   * @param {string}   ctx.chartType           — e.g. 'PieChart', 'XYChart'
   * @param {object}   [ctx.fieldConfig]        — chart field configuration
   * @param {string[]} [ctx.breakdownKeys]      — series breakdown keys
   * @param {object[]} [ctx.datasetRows]        — raw dataset rows
   * @param {object}   [ctx.metricMap]          — optional override { breakdownKey → metricKey }
   * @returns {Record<string, number | { last: number, slots: number[] }>}
   */
  function buildChartAnalyticsValues({ chartType, fieldConfig, breakdownKeys, datasetRows, metricMap }) {
    const derivedType = deriveChartType(chartType, '');
    const rows = Array.isArray(datasetRows) ? datasetRows : [];
    const keys = Array.isArray(breakdownKeys) ? breakdownKeys : [];
    const overrides = metricMap || {};
    const values = {};

    if (derivedType === 'donut' || derivedType === 'pie') {
      // Each row in datasetRows represents a slice. The slice name is the breakdown key.
      rows.forEach((row) => {
        if (!row || typeof row !== 'object') return;

        // Try common name fields used by amCharts donut data
        const sliceName = row.name || row.category || row.label;
        if (!sliceName) return;

        const metricKey = overrides[sliceName] || lookupMetricKey(sliceName);
        if (!metricKey) return;

        const value = row.value != null ? Number(row.value) : null;
        if (value != null && !Number.isNaN(value)) {
          values[metricKey] = value;
        }
      });

      // Also handle breakdown key → slice value mappings (fieldConfig-based donut)
      if (fieldConfig && typeof fieldConfig === 'object') {
        const valueField = fieldConfig.valueField || fieldConfig.value || 'value';
        const categoryField = fieldConfig.categoryField || fieldConfig.category || 'name';
        rows.forEach((row) => {
          if (!row) return;
          const sliceName = row[categoryField] || row.name || row.category;
          const metricKey = overrides[sliceName] || lookupMetricKey(sliceName);
          if (!metricKey) return;
          const value = Number(row[valueField] ?? row.value);
          if (!Number.isNaN(value)) {
            values[metricKey] = value;
          }
        });
      }
    } else {
      // Bar / line: stamp { last, slots } per breakdown key
      keys.forEach((breakdownKey) => {
        if (!breakdownKey) return;
        const metricKey = overrides[breakdownKey] || lookupMetricKey(breakdownKey);
        if (!metricKey) return;

        const slots = rows
          .map((row) => {
            if (!row) return null;
            const v = row[breakdownKey];
            return v != null ? Number(v) : null;
          })
          .filter((v) => v != null && !Number.isNaN(v));

        const last = slots.length > 0 ? slots[slots.length - 1] : null;
        if (last != null) {
          values[metricKey] = { last, slots };
        }
      });

      // If no breakdown keys produced values, try all numeric fields from last row
      if (Object.keys(values).length === 0 && rows.length > 0) {
        const lastRow = rows[rows.length - 1];
        Object.keys(lastRow || {}).forEach((k) => {
          if (k === 'period' || k === 'date' || k === 'label') return;
          const metricKey = overrides[k] || lookupMetricKey(k);
          if (!metricKey) return;
          const v = Number(lastRow[k]);
          if (!Number.isNaN(v)) {
            values[metricKey] = { last: v, slots: [] };
          }
        });
      }
    }

    return values;
  }

  /**
   * Stamp data-analytics-* attributes on a chart container element.
   *
   * @param {HTMLElement} container
   * @param {object} ctx
   * @param {string}   ctx.chartInstanceId
   * @param {string}   [ctx.chartType]
   * @param {object}   [ctx.fieldConfig]
   * @param {string[]} [ctx.seriesBreakdownKeys]
   * @param {object[]} [ctx.datasetRows]
   * @param {object}   [ctx.metricMap]
   */
  function stampChartAnalyticsContract(container, ctx) {
    if (!container || typeof container.setAttribute !== 'function') return;

    const {
      chartInstanceId,
      chartType,
      fieldConfig,
      seriesBreakdownKeys,
      datasetRows,
      metricMap,
    } = ctx || {};

    const period = derivePeriodFromChartId(chartInstanceId);
    const resolvedType = deriveChartType(chartType, chartInstanceId);

    const values = buildChartAnalyticsValues({
      chartType: resolvedType,
      fieldConfig,
      breakdownKeys: seriesBreakdownKeys,
      datasetRows,
      metricMap,
    });

    container.setAttribute('data-analytics-chart-id', chartInstanceId || '');
    container.setAttribute('data-analytics-period', period);
    container.setAttribute('data-analytics-chart-type', resolvedType);
    container.setAttribute('data-analytics-values', JSON.stringify(values));
    container.setAttribute('data-analytics-rendered-at', new Date().toISOString());
  }

  /**
   * Clear all data-analytics-* attributes from a container (call on destroy).
   *
   * @param {HTMLElement} container
   */
  function clearChartAnalyticsContract(container) {
    if (!container || typeof container.removeAttribute !== 'function') return;
    container.removeAttribute('data-analytics-chart-id');
    container.removeAttribute('data-analytics-period');
    container.removeAttribute('data-analytics-chart-type');
    container.removeAttribute('data-analytics-values');
    container.removeAttribute('data-analytics-rendered-at');
  }

  // ── Expose as global and as ES module exports ─────────────────────────────

  const api = {
    buildChartAnalyticsValues,
    stampChartAnalyticsContract,
    clearChartAnalyticsContract,
    derivePeriodFromChartId,
    deriveChartType,
    lookupMetricKey,
  };

  // Browser global
  if (root) {
    root.chartAnalyticsContract = api;
  }

  // ES module export for unit tests
  if (typeof exports !== 'undefined') {
    Object.assign(exports, api);
  }

}(typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : null));

// ES module re-exports (tree-shakeable path for test bundlers)
export function buildChartAnalyticsValues(ctx) {
  return window.chartAnalyticsContract.buildChartAnalyticsValues(ctx);
}
export function stampChartAnalyticsContract(container, ctx) {
  return window.chartAnalyticsContract.stampChartAnalyticsContract(container, ctx);
}
export function clearChartAnalyticsContract(container) {
  return window.chartAnalyticsContract.clearChartAnalyticsContract(container);
}
export function derivePeriodFromChartId(id) {
  return window.chartAnalyticsContract.derivePeriodFromChartId(id);
}
export function deriveChartType(chartType, chartInstanceId) {
  return window.chartAnalyticsContract.deriveChartType(chartType, chartInstanceId);
}
export function lookupMetricKey(key) {
  return window.chartAnalyticsContract.lookupMetricKey(key);
}
