import { structuredCloneSafe } from '../utils/structuredCloneSafe.js';
import { markScannedElement } from '../utils/markScannedElement.js';
import { analyticsTestState } from '../state.js';

export function collectRenderedAmChartsData() {
  const pageChartsData = [];

  if (!window.am5?.registry?.rootElements) {
    return {
      ok: false,
      error: 'am5.registry.rootElements is not available',
      charts: pageChartsData,
    };
  }

  window.am5.registry.rootElements.forEach((root) => {
    if (!root?.dom) return;

    const chartContainer = root.dom.closest('[data-chart-container]');
    if (!chartContainer) return;

    markScannedElement(chartContainer, 'amCharts container scanned');

    const chartId = chartContainer.getAttribute('data-chart-id') || 'unnamed_chart';
    const chartConfigRaw = chartContainer.getAttribute('data-chart-config') || '{}';
    let chartConfig = {};

    try {
      chartConfig = JSON.parse(chartConfigRaw);
    } catch (error) {
      chartConfig = { parseError: error.message, raw: chartConfigRaw };
    }

    const chartSnapshot = {
      chartId,
      visible: !chartContainer.hasAttribute('hidden'),
      hidden: chartContainer.hasAttribute('hidden'),
      config: chartConfig,
      series: [],
      maps: [],
      rawRootUid: root.uid || null,
    };

    root.container.walkChildren((child) => {
      if (!child) return;

      if (child.series && typeof child.series.each === 'function') {
        child.series.each((seriesInstance) => {
          if (!seriesInstance) return;
          const seriesName = seriesInstance.get('name') || seriesInstance.uid || 'unnamed_series';
          const rawData =
            seriesInstance.data?.values ? structuredCloneSafe(seriesInstance.data.values) : [];
          const renderedData = seriesInstance.dataItems
            ? seriesInstance.dataItems.map((item) => structuredCloneSafe(item.dataContext))
            : [];

          chartSnapshot.series.push({ seriesName, rawData, renderedData });
        });
      }

      if (child.data?.values && !child.series) {
        chartSnapshot.maps.push({
          componentUid: child.uid || null,
          data: structuredCloneSafe(child.data.values),
        });
      }
    });

    pageChartsData.push(chartSnapshot);
  });

  analyticsTestState.chartSnapshots.push({
    collectedAt: new Date().toISOString(),
    charts: pageChartsData,
  });

  return { ok: true, error: null, charts: pageChartsData };
}

export function findChartSnapshot(chartSnapshots, chartRule) {
  return chartSnapshots.find((snapshot) => {
    if (chartRule.visibleOnly && !snapshot.visible) return false;
    if (chartRule.chartId && snapshot.chartId !== chartRule.chartId) return false;
    if (chartRule.chartIdIncludes && !snapshot.chartId.includes(chartRule.chartIdIncludes)) return false;
    if (chartRule.expectedDatasetKeyIncludes) {
      const datasetKey = snapshot.config?.datasetKey || '';
      if (!datasetKey.includes(chartRule.expectedDatasetKeyIncludes)) return false;
    }
    return true;
  });
}

export function extractChartRows(chartSnapshot) {
  const rows = [];
  chartSnapshot.series.forEach((series) => {
    const sourceRows = series.renderedData.length ? series.renderedData : series.rawData;
    sourceRows.forEach((row) => rows.push({ seriesName: series.seriesName, row }));
  });
  chartSnapshot.maps.forEach((mapData) => {
    mapData.data.forEach((row) => rows.push({ seriesName: 'map', row }));
  });
  return rows;
}
