import { markScannedElement } from '../utils/markScannedElement.js';
import { sleep } from '../utils/sleep.js';
import { useDashboardAnalyticsStore } from '@/stores/useDashboardAnalyticsStore.js';

export function getAnalyticsRefreshButton() {
  const wrapper = document.querySelector('[data-testid="dashboard-analytics-refresh-button"]');
  if (!wrapper) return null;
  return wrapper.querySelector('button');
}

function isRefreshButtonReady(button) {
  if (!button) return false;
  if (button.disabled) return false;
  if (button.getAttribute('aria-busy') === 'true') return false;
  return true;
}

export { isRefreshButtonReady };

export async function waitForAnalyticsDomUpdate(timeoutMs = 20000) {
  const store = useDashboardAnalyticsStore();
  const lastUpdatedBefore = store.lastUpdated;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const refreshButton = getAnalyticsRefreshButton();
    const storeTicked = Boolean(store.lastUpdated && store.lastUpdated !== lastUpdatedBefore);

    if (isRefreshButtonReady(refreshButton) && storeTicked) {
      await sleep(400);
      return true;
    }

    await sleep(250);
  }

  const refreshButton = getAnalyticsRefreshButton();
  if (isRefreshButtonReady(refreshButton)) {
    return true;
  }

  throw new Error('Timed out waiting for analytics refresh to complete');
}

export async function refreshAnalyticsWithoutPageReload() {
  const refreshButton = getAnalyticsRefreshButton();
  if (!refreshButton) {
    throw new Error('Analytics refresh button not found');
  }

  markScannedElement(refreshButton, 'Refresh clicked by test runner');
  refreshButton.click();
  await waitForAnalyticsDomUpdate();
}

export function waitForChartRenderSettle() {
  return sleep(5000);
}

export async function waitForPopupOpen() {
  await sleep(500);
  const popup = document.querySelector('[data-analytics-trend-popup], [role="dialog"], .fixed.inset-0');
  if (!popup) await sleep(1000);
}
