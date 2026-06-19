/**
 * Global Formatting Utilities
 * Provides timezone-independent date and decimal/monetary formatting functions.
 */

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
};

/**
 * Truncates a value to exactly 2 decimal places without rounding.
 * Handles string and numeric inputs safely.
 * E.g., 5.19999 -> 5.19, 10.5678 -> 10.56
 *
 * @param {number|string} val - Value to format
 * @returns {string} Formatted decimal string
 */
export function formatDecimal(val) {
  if (val === null || val === undefined) return '0.00';
  // Strip any currency symbols or commas to parse cleanly (e.g. "USD$ 9.99" -> "9.99")
  const cleanVal = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleanVal);
  if (isNaN(parsed)) return '0.00';

  // Round to 9 decimals first to clean up floating point math inaccuracies (e.g. 6.780000000000001 -> 6.78)
  const cleaned = Math.round(parsed * 1e9) / 1e9;
  const parts = cleaned.toFixed(12).split('.');
  const integerPart = parts[0];
  const fractionalPart = parts[1].substring(0, 2);
  return `${integerPart}.${fractionalPart}`;
}


/**
 * Formats a value as currency, using formatDecimal.
 * Centralizes currency symbols for future extension.
 *
 * @param {number|string} val - Numeric value
 * @param {string} [currency='USD'] - Currency code
 * @returns {string} Formatted currency string
 */
export function formatCurrency(val, currency = 'USD') {
  const formattedDecimal = formatDecimal(val);
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] || '';
  return `${symbol}${formattedDecimal}`;
}

/**
 * Standardizes monetary prices to project's required format: "USD $45.00".
 * Builds on top of the decimal formatter.
 * E.g., 45 -> USD $45.00, 45.999 -> USD $45.99
 *
 * @param {number|string} val - Numeric value
 * @param {string} [currency='USD'] - Currency code
 * @returns {string} Formatted price string
 */
export function formatPrice(val, currency = 'USD') {
  const formattedDecimal = formatDecimal(val);
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] || '$';
  return `${currency.toUpperCase()} ${symbol}${formattedDecimal}`;
}

/**
 * Specific alias for USD price formatting.
 * E.g., 45 -> USD $45.00
 *
 * @param {number|string} val - Numeric value
 * @returns {string} Formatted USD price string
 */
export function formatUsdPrice(val) {
  return formatPrice(val, 'USD');
}

/**
 * Converts dates timezone-independently into format like "22nd JAN 2022".
 * Supports ordinal day suffixes and uppercase month abbreviations.
 *
 * @param {string|Date} dateInput - Date string (YYYY-MM-DD or YYYY/MM/DD) or Date object
 * @returns {string} Formatted date string
 */
export function formatDate(dateInput) {
  if (!dateInput) return '';

  let dateObj;
  if (dateInput instanceof Date) {
    dateObj = dateInput;
  } else {
    const str = String(dateInput).trim();
    // Match YYYY-MM-DD or YYYY/MM/DD timezone-independently
    const match = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(str);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // 0-indexed
      const day = parseInt(match[3], 10);
      dateObj = new Date(year, month, day);
    } else {
      const parsed = new Date(str);
      if (isNaN(parsed)) return str;
      dateObj = parsed;
    }
  }

  const year = dateObj.getFullYear();
  const monthIdx = dateObj.getMonth();
  const day = dateObj.getDate();

  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthStr = MONTHS[monthIdx] || '';

  // Calculate ordinal suffix
  let suffix = 'th';
  if (day === 1 || day === 21 || day === 31) {
    suffix = 'st';
  } else if (day === 2 || day === 22) {
    suffix = 'nd';
  } else if (day === 3 || day === 23) {
    suffix = 'rd';
  }

  return `${day}${suffix} ${monthStr} ${year}`;
}
