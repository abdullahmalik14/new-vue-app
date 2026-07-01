import {
  scanCardValueByHeading,
  scanCardMetricByLabel,
  scanCardPercentageByHeading,
  scanCardMetricPercentage,
  scanPopupPercentageByStatHeading,
  scanTrendTableCountrySales,
  scanTopContributorsPreview,
  scanDataValueNearLabel,
  scanPopupStatByHeading,
  openTrendPopupFromHeading,
} from '../scanners/domScanners.js';
import { closeTrendPopup, waitForPopupPaint, switchPopupPeriod } from '../scanners/popupControls.js';
import { waitForChartRenderSettle } from '../refresh/chartSettle.js';
import {
  collectRenderedAmChartsData,
  findChartSnapshot,
  extractChartRows,
} from '../charts/collect.js';
import { buildElementSelectorHint } from '../utils/markScannedElement.js';
import { normalizeNumber } from '../utils/normalizeNumber.js';
import { sleep } from '../utils/sleep.js';

function getApiPathValue(payload, path) {
  return path.split('.').reduce((acc, key) => {
    if (acc == null) return undefined;
    if (key === '-1' && Array.isArray(acc)) return acc[acc.length - 1];
    return acc[key];
  }, payload);
}

function scanApiPath(path, payload) {
  const value = getApiPathValue(payload, path);
  if (path.endsWith('.length')) {
    const arrPath = path.replace(/\.length$/, '');
    const arr = getApiPathValue(payload, arrPath);
    return {
      ok: true,
      foundValue: Array.isArray(arr) ? arr.length : 0,
      rawText: String(Array.isArray(arr) ? arr.length : 0),
      element: null,
      error: null,
    };
  }
  return {
    ok: value != null,
    foundValue: value,
    rawText: JSON.stringify(value),
    element: null,
    error: value == null ? `Missing API path ${path}` : null,
  };
}

function scanApiArrayMatch(scan, payload) {
  const arr = getApiPathValue(payload, scan.path);
  if (!Array.isArray(arr)) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: null,
      error: `Expected array at ${scan.path}`,
    };
  }

  const match = arr.find((item) => {
    const keyValue = item?.[scan.matchKey];
    if (keyValue == null) return false;
    if (scan.matchValue == null) return true;
    return String(keyValue) === String(scan.matchValue) || String(keyValue).includes(String(scan.matchValue));
  });

  const foundValue = match ? match[scan.valueKey] : null;
  const min = scan.min ?? 1;
  const ok = match != null && Number(foundValue) >= min;

  return {
    ok,
    foundValue,
    rawText: JSON.stringify(foundValue),
    element: null,
    error: ok ? null : `No match for ${scan.matchKey}=${scan.matchValue} with ${scan.valueKey}>=${min}`,
  };
}

function scanDatasetField(expected) {
  const latest = window.__analyticsTestLatestCharts || { charts: [] };
  const chartRule = expected.chart || {};
  const snapshot = findChartSnapshot(latest.charts, chartRule);
  if (!snapshot) {
    return { ok: false, foundValue: null, rawText: '', element: null, error: 'Chart not visible for dataset field' };
  }

  const rows = extractChartRows(snapshot);
  const field = chartRule.field;

  if (chartRule.donutName) {
    const match = rows.find(({ row }) => {
      const label = String(row?.name ?? row?.category ?? '').trim().toLowerCase();
      const needle = String(chartRule.donutName).trim().toLowerCase();
      return label === needle || label.includes(needle);
    });

    const value = normalizeNumber(match?.row?.value ?? match?.row?.[field]);
    const ok = match != null && value != null && !Number.isNaN(value);

    return {
      ok,
      foundValue: value,
      rawText: String(value),
      element: null,
      error: ok ? null : `Dataset field missing: ${chartRule.donutName}`,
    };
  }

  const slotRows = rows
    .map((entry) => entry.row)
    .filter((row) => row && typeof row === 'object' && ('period' in row || field in row));

  const lastRow = slotRows.length > 0 ? slotRows[slotRows.length - 1] : rows[rows.length - 1]?.row ?? null;
  if (!lastRow) {
    return { ok: false, foundValue: null, rawText: '', element: null, error: 'Chart has no data rows' };
  }

  const value = normalizeNumber(lastRow[field] ?? lastRow[expected.chart?.dataKey]);
  const ok = value != null && !Number.isNaN(value);

  return {
    ok,
    foundValue: value,
    rawText: String(value),
    element: null,
    error: ok ? null : `Dataset field missing: ${field}`,
  };
}

function resolveCardFieldValue(result, field) {
  if (!result.ok || !Array.isArray(result.foundValue)) return result;

  const values = result.foundValue;
  let picked = null;

  if (field === 'new') {
    picked = values.find((v) => /new/i.test(v.label))?.num ?? values[0]?.num ?? null;
  } else if (field === 'recurring') {
    picked = values.find((v) => /recurring/i.test(v.label))?.num ?? null;
  } else {
    picked = values[0]?.num ?? null;
  }

  return {
    ...result,
    foundValue: picked,
    rawText: String(picked),
  };
}

/**
 * @param {object} expected
 * @param {object} chartsPayload
 * @param {{ skipPopupSetup?: boolean }} [options]
 */
export async function executeExpectedScan(expected, chartsPayload, options = {}) {
  try {
    if (expected.source === 'api') {
      const scan = expected.scan || {};
      const result =
        scan.type === 'apiArrayMatch'
          ? scanApiArrayMatch(scan, chartsPayload)
          : scanApiPath(scan.path, chartsPayload);
      return toFoundRow(expected, result);
    }

    if (expected.popup && !options.skipPopupSetup) {
      await openTrendPopupFromHeading(expected.popup.openFromHeading);
      await waitForPopupPaint();
      if (expected.periodToggle) {
        await switchPopupPeriod(expected.periodToggle);
        await waitForPopupPaint();
        await waitForChartRenderSettle({
          chartIdIncludes: expected.chart?.chartIdIncludes,
        });
      }
    }

    if (expected.source === 'dataset' || expected.source === 'amcharts') {
      collectRenderedAmChartsData();
      const result = scanDatasetField(expected);
      return toFoundRow(expected, result);
    }

    let result;
    if (expected.scan?.type === 'cardValueByHeading') {
      result = scanCardValueByHeading(expected.scan.heading);
      if (expected.scan.field) {
        result = resolveCardFieldValue(result, expected.scan.field);
      }
    } else if (expected.scan?.type === 'popupValueNearLabel') {
      result = scanDataValueNearLabel(expected.scan.label);
    } else if (expected.scan?.type === 'cardMetricByLabel') {
      result = scanCardMetricByLabel(expected.scan.heading, expected.scan.label);
    } else if (expected.scan?.type === 'cardPercentageByHeading') {
      result = scanCardPercentageByHeading(expected.scan.heading, expected.scan.field);
    } else if (expected.scan?.type === 'cardMetricPercentage') {
      result = scanCardMetricPercentage(expected.scan.heading, expected.scan.label);
    } else if (expected.scan?.type === 'popupPercentageByStatHeading') {
      result = scanPopupPercentageByStatHeading(expected.scan.statHeading);
    } else if (expected.scan?.type === 'trendTableCountrySales') {
      result = scanTrendTableCountrySales(expected.scan.tableHeading, expected.scan.countryName);
    } else if (expected.scan?.type === 'topContributorsPreview') {
      result = scanTopContributorsPreview(expected.scan.field);
    } else if (expected.scan?.type === 'popupStatByHeading') {
      result = scanPopupStatByHeading(expected.scan.heading);
    } else {
      result = { ok: false, foundValue: null, rawText: '', element: null, error: 'Unknown scan type' };
    }

    return toFoundRow(expected, result);
  } catch (error) {
    return {
      expectedId: expected.id,
      view: expected.view,
      metric: expected.metric,
      period: expected.period,
      source: expected.source,
      foundValue: null,
      rawText: '',
      elementPath: null,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Open each popup once per heading, toggle all periods, scan, then close.
 * @param {object[]} popupRows
 * @param {object} chartsPayload
 * @param {{ onProgress?: (msg: string) => void | Promise<void> }} [options]
 */
export async function executePopupScanBatch(popupRows, chartsPayload, options = {}) {
  const foundRows = [];
  const onProgress = options.onProgress;
  const byHeading = new Map();

  popupRows.forEach((row) => {
    const heading = row.popup?.openFromHeading;
    if (!heading) return;
    if (!byHeading.has(heading)) byHeading.set(heading, []);
    byHeading.get(heading).push(row);
  });

  const orderedHeadings = ['Subscribers', 'Fans', 'Earnings', 'Likes', 'Top Contributors'].filter((heading) =>
    byHeading.has(heading),
  );
  const remaining = [...byHeading.keys()].filter((heading) => !orderedHeadings.includes(heading));
  const headings = [...orderedHeadings, ...remaining];

  for (const heading of headings) {
    const rows = byHeading.get(heading);
    await onProgress?.(`Opening popup: ${heading}`);
    await openTrendPopupFromHeading(heading);
    await waitForPopupPaint();
    await onProgress?.(`Popup open: ${heading} — waiting for paint`);

    const periods = [...new Set(rows.map((row) => row.periodToggle).filter(Boolean))];
    if (periods.length === 0) periods.push(null);

    for (const period of periods) {
      if (period) {
        await onProgress?.(`${heading}: switching period → ${period}`);
        await switchPopupPeriod(period);
        await waitForPopupPaint();
        const chartHint = rows.find((row) => row.periodToggle === period && row.chart)?.chart?.chartIdIncludes;
        await onProgress?.(`${heading} / ${period}: waiting for chart paint`);
        await waitForChartRenderSettle({ chartIdIncludes: chartHint });
      }

      const chartCollection = collectRenderedAmChartsData();
      stashLatestChartsCollection(chartCollection);

      const batch = period ? rows.filter((row) => row.periodToggle === period) : rows;
      for (const expected of batch) {
        await onProgress?.(`Scanning ${heading} · ${period || 'default'} · ${expected.metric}`);
        const found = await executeExpectedScan(expected, chartsPayload, { skipPopupSetup: true });
        foundRows.push(found);
      }
    }

    await onProgress?.(`Closing popup: ${heading}`);
    await closeTrendPopup();
    await sleep(300);
  }

  return foundRows;
}

function toFoundRow(expected, result) {
  return {
    expectedId: expected.id,
    view: expected.view,
    metric: expected.metric,
    period: expected.period,
    source: expected.source,
    foundValue: result.foundValue,
    rawText: result.rawText,
    elementPath: result.element ? buildElementSelectorHint(result.element) : null,
    ok: result.ok,
    error: result.error,
  };
}

export function stashLatestChartsCollection(collection) {
  window.__analyticsTestLatestCharts = collection;
}
