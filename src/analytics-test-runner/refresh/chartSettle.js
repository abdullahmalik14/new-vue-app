import { collectRenderedAmChartsData } from '../charts/collect.js';
import { sleep } from '../utils/sleep.js';

function chartSignature(charts, chartIdIncludes) {
  const visible = charts.filter((chart) => {
    if (chart.hidden) return false;
    if (chartIdIncludes && !chart.chartId.includes(chartIdIncludes)) return false;
    return true;
  });

  return JSON.stringify(
    visible.map((chart) => ({
      id: chart.chartId,
      series: chart.series.length,
      rows: chart.series[0]?.renderedData?.length ?? chart.series[0]?.rawData?.length ?? 0,
    })),
  );
}

/**
 * Check if a chart container has been stamped with the analytics contract
 * (i.e. has data-analytics-rendered-at attribute).
 *
 * @param {string|undefined} chartIdIncludes
 * @returns {boolean}
 */
function hasContractStamp(chartIdIncludes) {
  const selector = chartIdIncludes
    ? `[data-analytics-rendered-at][data-chart-id*="${chartIdIncludes}"], [data-analytics-rendered-at][data-analytics-chart-id*="${chartIdIncludes}"]`
    : '[data-analytics-rendered-at]';
  return document.querySelector(selector) !== null;
}

/**
 * Poll until chart data signature is stable (or timeout).
 * Prefers the data-analytics-rendered-at contract stamp over am5 signature polling,
 * but falls back to the signature approach if stamp is not present.
 *
 * @param {{ chartIdIncludes?: string, timeoutMs?: number, pollMs?: number, stableTicks?: number }} [options]
 * @returns {Promise<{ settled: boolean, signature: string, method: 'contract'|'amcharts' }>}
 */
export async function waitForChartRenderSettle(options = {}) {
  const timeoutMs = options.timeoutMs ?? 8000;
  const pollMs = options.pollMs ?? 300;
  const stableTicks = options.stableTicks ?? 2;
  const chartIdIncludes = options.chartIdIncludes;

  const started = Date.now();

  // First pass: wait for contract stamp (fast path — preferred)
  while (Date.now() - started < timeoutMs) {
    if (hasContractStamp(chartIdIncludes)) {
      return { settled: true, signature: 'contract-stamp', method: 'contract' };
    }
    await sleep(pollMs);
    // If still no stamp after 1 second, fall through to am5 polling
    if (Date.now() - started >= 1000) break;
  }

  // Fallback: am5 signature polling
  let stable = 0;
  let lastSignature = '';

  while (Date.now() - started < timeoutMs) {
    const { charts } = collectRenderedAmChartsData();
    const signature = chartSignature(charts, chartIdIncludes);

    if (signature && signature === lastSignature) {
      stable += 1;
      if (stable >= stableTicks) return { settled: true, signature, method: 'amcharts' };
    } else {
      stable = 0;
      lastSignature = signature;
    }

    await sleep(pollMs);
  }

  return { settled: false, signature: lastSignature, method: 'amcharts' };
}
