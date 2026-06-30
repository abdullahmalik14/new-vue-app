import { markScannedElement } from '../utils/markScannedElement.js';
import { normalizeNumber } from '../utils/normalizeNumber.js';
import { sleep } from '../utils/sleep.js';

export function getAnalyticsRefreshButton() {
  const wrapper = document.querySelector('[data-testid="dashboard-analytics-refresh-button"]');
  if (!wrapper) return null;
  return wrapper.querySelector('button');
}

export async function waitForAnalyticsDomUpdate(timeoutMs = 15000) {
  const refreshButton = getAnalyticsRefreshButton();
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (refreshButton && !refreshButton.disabled) {
      return true;
    }
    await sleep(250);
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
