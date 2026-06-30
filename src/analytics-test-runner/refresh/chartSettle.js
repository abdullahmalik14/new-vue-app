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
 * Poll am5 until chart data signature is stable (or timeout).
 * @param {{ chartIdIncludes?: string, timeoutMs?: number, pollMs?: number, stableTicks?: number }} [options]
 */
export async function waitForChartRenderSettle(options = {}) {
  const timeoutMs = options.timeoutMs ?? 8000;
  const pollMs = options.pollMs ?? 300;
  const stableTicks = options.stableTicks ?? 2;
  const chartIdIncludes = options.chartIdIncludes;

  let stable = 0;
  let lastSignature = '';
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const { charts } = collectRenderedAmChartsData();
    const signature = chartSignature(charts, chartIdIncludes);

    if (signature && signature === lastSignature) {
      stable += 1;
      if (stable >= stableTicks) return { settled: true, signature };
    } else {
      stable = 0;
      lastSignature = signature;
    }

    await sleep(pollMs);
  }

  return { settled: false, signature: lastSignature };
}
