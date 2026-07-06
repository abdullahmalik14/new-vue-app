import { markScannedElement } from '../utils/markScannedElement.js';
import { normalizeNumber } from '../utils/normalizeNumber.js';

/**
 * Scan a DOM element by data-analytics-metric (+ optional period and surface).
 * Reads value from data-value attribute first; falls back to textContent for percentages.
 *
 * @param {{ metric: string, period?: string, surface?: string }} options
 * @returns {{ ok: boolean, foundValue: number|null, rawText: string, element: Element|null, error: string|null }}
 */
export function scanMetricSelector({ metric, period, surface } = {}) {
  if (!metric) {
    return { ok: false, foundValue: null, rawText: '', element: null, error: 'metric is required for scanMetricSelector' };
  }

  const selector = [
    `[data-analytics-metric="${metric}"]`,
    period ? `[data-analytics-period="${period}"]` : '',
    surface ? `[data-analytics-surface="${surface}"]` : '',
  ].join('');

  const el = document.querySelector(selector);

  if (!el) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: null,
      error: `Element not found: ${selector}`,
    };
  }

  markScannedElement(el, `metric: ${metric}`);

  const rawAttr = el.getAttribute('data-value');
  if (rawAttr != null) {
    const num = normalizeNumber(rawAttr);
    return {
      ok: num != null && !Number.isNaN(num),
      foundValue: num,
      rawText: el.textContent.trim(),
      element: el,
      error: num == null || Number.isNaN(num) ? `Could not parse data-value="${rawAttr}" for ${metric}` : null,
    };
  }

  // Percentage fallback: strip %, parse number
  const text = el.textContent.trim().replace('%', '');
  const num = normalizeNumber(text);
  return {
    ok: num != null && !Number.isNaN(num),
    foundValue: num,
    rawText: el.textContent.trim(),
    element: el,
    error: num == null || Number.isNaN(num) ? `Could not parse textContent for ${metric}` : null,
  };
}

/**
 * Scan the sales value for a specific country in the Top Countries table.
 * Uses data-testid to locate the table and data-analytics-metric for the sales cell.
 *
 * @param {string} _tableHeading - unused; kept for call-site compatibility
 * @param {string} countryName   - display name used as data-value on the country cell
 */
export function scanTrendTableCountrySales(_tableHeading, countryName) {
  const headingEl = document.querySelector('[data-testid="dashboard-analytics-top-countries-heading"]');

  if (!headingEl) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: null,
      error: 'Top Countries heading not found (data-testid="dashboard-analytics-top-countries-heading")',
    };
  }

  const tableRoot =
    headingEl.closest('.fourth-white-card-column') ||
    headingEl.closest('[class*="white-card"]') ||
    headingEl.closest('div');

  markScannedElement(headingEl, 'Table: Top Countries');

  const countryCells = Array.from(tableRoot?.querySelectorAll('[data-value]') || []).filter((el) => {
    const value = el.getAttribute('data-value') || el.textContent.trim();
    return value === countryName || el.textContent.trim() === countryName;
  });

  if (countryCells.length === 0) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: tableRoot,
      error: `Country row not found: ${countryName}`,
    };
  }

  const countryEl = countryCells[0];
  markScannedElement(countryEl, `Country: ${countryName}`);

  const row = countryEl.closest('[class*="row"]') || countryEl.closest('.flex');

  // Prefer explicit data-analytics-metric selector; fall back to any other [data-value] in the row
  const salesEl =
    row?.querySelector('[data-analytics-metric^="countries."][data-analytics-metric$=".sales"]') ||
    Array.from(row?.querySelectorAll('[data-value]') || []).find((el) => el !== countryEl);

  if (!salesEl) {
    return {
      ok: false,
      foundValue: null,
      rawText: countryEl.textContent.trim(),
      element: countryEl,
      error: `Sales cell not found for ${countryName}`,
    };
  }

  markScannedElement(salesEl, `Sales: ${countryName}`);
  const salesText = salesEl.getAttribute('data-value') || salesEl.textContent;
  const sales = normalizeNumber(String(salesText).replace(/[^\d.-]/g, ''));

  return {
    ok: !Number.isNaN(sales),
    foundValue: sales,
    rawText: salesEl.textContent.trim(),
    element: salesEl,
    error: Number.isNaN(sales) ? `Could not parse sales for ${countryName}` : null,
  };
}

/**
 * Open a trend popup by clicking its card's "Trend" button.
 * Locates the card via data-analytics-card="<name>" (set on DashboardAnalyticsMetricCard).
 * Accepted names: "subscribers" | "earnings" | "fans" | "likes" | "top contributors"
 *
 * @param {string} cardName  e.g. "Earnings", "Subscribers" — matched case-insensitively
 */
export async function openTrendPopupFromHeading(cardName) {
  const key = cardName.toLowerCase();
  const cardEl = document.querySelector(`[data-analytics-card="${key}"]`);

  if (!cardEl) {
    throw new Error(
      `Analytics card not found: [data-analytics-card="${key}"] — ` +
      `ensure data-analytics-card is set on the DashboardAnalyticsMetricCard for "${cardName}"`,
    );
  }

  markScannedElement(cardEl, `Popup source card: ${cardName}`);
  cardEl.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

  const buttons = Array.from(cardEl.querySelectorAll('button'));
  const trendButton = buttons.find((button) => button.textContent.trim().toLowerCase().includes('trend'));

  if (!trendButton) throw new Error(`Trend button not found inside card: ${cardName}`);

  markScannedElement(trendButton, `Open popup: ${cardName}`);
  trendButton.click();
}
