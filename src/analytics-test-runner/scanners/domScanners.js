import { markScannedElement } from '../utils/markScannedElement.js';
import { normalizeNumber } from '../utils/normalizeNumber.js';

function findHeadingElement(headingText) {
  const headingElements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const needle = headingText.toLowerCase();
  const matchingHeadings = headingElements.filter((element) => {
    return element.textContent.trim().toLowerCase().includes(needle);
  });

  if (matchingHeadings.length !== 1) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: null,
      error: `Expected one heading "${headingText}", found ${matchingHeadings.length}`,
    };
  }

  const headingElement = matchingHeadings[0];
  markScannedElement(headingElement, `Heading: ${headingText}`);
  return { ok: true, element: headingElement, error: null };
}

export function scanCardValueByHeading(headingText) {
  const headingScan = findHeadingElement(headingText);
  if (!headingScan.ok) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: null,
      error: headingScan.error,
    };
  }

  const cardElement =
    headingScan.element.closest('.group\\/container') || headingScan.element.closest('div');

  if (!cardElement) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: headingScan.element,
      error: `Card container not found for heading "${headingText}"`,
    };
  }

  markScannedElement(cardElement, `Card: ${headingText}`);

  const valueElements = cardElement.querySelectorAll('[data-value]');
  if (valueElements.length === 0) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: cardElement,
      error: `No [data-value] found for card "${headingText}"`,
    };
  }

  if (headingText.toLowerCase() === 'subscribers') {
    const values = Array.from(valueElements).map((el) => ({
      raw: el.textContent.trim(),
      num: normalizeNumber(el.getAttribute('data-value')),
      label: el.closest('div')?.querySelector('span')?.textContent?.trim() || '',
    }));
    return {
      ok: true,
      foundValue: values,
      rawText: values.map((v) => v.raw).join(' | '),
      element: valueElements[0],
      error: null,
    };
  }

  const valueElement = valueElements[0];
  markScannedElement(valueElement, `Value: ${headingText}`);

  return {
    ok: true,
    foundValue: normalizeNumber(valueElement.getAttribute('data-value')),
    rawText: valueElement.textContent.trim(),
    element: valueElement,
    error: null,
  };
}

export function scanCardMetricByLabel(headingText, metricLabel) {
  const headingScan = findHeadingElement(headingText);
  if (!headingScan.ok) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: null,
      error: headingScan.error,
    };
  }

  const cardElement =
    headingScan.element.closest('.group\\/container') || headingScan.element.closest('div');

  if (!cardElement) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: headingScan.element,
      error: `Card container not found for heading "${headingText}"`,
    };
  }

  markScannedElement(cardElement, `Card: ${headingText}`);

  const needle = metricLabel.toLowerCase();
  const labelEl = Array.from(cardElement.querySelectorAll('span, label, p')).find((el) => {
    return el.textContent.trim().toLowerCase().includes(needle);
  });

  if (!labelEl) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: cardElement,
      error: `Metric label not found in "${headingText}" card: ${metricLabel}`,
    };
  }

  const container = labelEl.closest('div');
  const valueEl =
    container?.querySelector('[data-value]') ||
    container?.parentElement?.querySelector('[data-value]');

  if (!valueEl) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: labelEl,
      error: `No [data-value] near label "${metricLabel}"`,
    };
  }

  markScannedElement(valueEl, `${headingText} / ${metricLabel}`);
  return {
    ok: true,
    foundValue: normalizeNumber(valueEl.getAttribute('data-value')),
    rawText: valueEl.textContent.trim(),
    element: valueEl,
    error: null,
  };
}

export function scanPopupStatByHeading(statHeading) {
  const needle = statHeading.toLowerCase();
  const headingEl = Array.from(document.querySelectorAll('h3, h4')).find((el) => {
    return el.textContent.trim().toLowerCase().includes(needle);
  });

  if (!headingEl) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: null,
      error: `Popup stat heading not found: ${statHeading}`,
    };
  }

  const container = headingEl.closest('div');
  const valueEl = Array.from(container?.querySelectorAll('span') || []).find((el) => {
    const text = el.textContent.trim().replace(/,/g, '');
    return /^-?\d+(\.\d+)?$/.test(text);
  });

  if (!valueEl) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: headingEl,
      error: `Popup stat value not found for: ${statHeading}`,
    };
  }

  markScannedElement(valueEl, `Popup stat: ${statHeading}`);
  return {
    ok: true,
    foundValue: normalizeNumber(valueEl.textContent),
    rawText: valueEl.textContent.trim(),
    element: valueEl,
    error: null,
  };
}

export function scanDataValueNearLabel(labelText) {
  const labels = Array.from(document.querySelectorAll('span, label, h3, h4, p')).filter((el) => {
    return el.textContent.trim().toLowerCase().includes(labelText.toLowerCase());
  });

  if (labels.length === 0) {
    return { ok: false, foundValue: null, rawText: '', element: null, error: `Label not found: ${labelText}` };
  }

  const label = labels[0];
  const container = label.closest('div');
  const valueEl = container?.querySelector('[data-value]') || container?.parentElement?.querySelector('[data-value]');

  if (!valueEl) {
    return { ok: false, foundValue: null, rawText: '', element: label, error: `No value near label: ${labelText}` };
  }

  markScannedElement(valueEl, `Value near: ${labelText}`);
  return {
    ok: true,
    foundValue: normalizeNumber(valueEl.getAttribute('data-value')),
    rawText: valueEl.textContent.trim(),
    element: valueEl,
    error: null,
  };
}

export async function openTrendPopupFromHeading(headingText) {
  const headingScan = findHeadingElement(headingText);
  if (!headingScan.ok) throw new Error(headingScan.error);

  const cardElement =
    headingScan.element.closest('.group\\/container') || headingScan.element.closest('div');
  if (!cardElement) throw new Error(`Card not found for heading "${headingText}"`);

  markScannedElement(cardElement, `Popup source card: ${headingText}`);
  cardElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

  const buttons = Array.from(cardElement.querySelectorAll('button'));
  const trendButton = buttons.find((button) => button.textContent.trim().toLowerCase().includes('trend'));

  if (!trendButton) throw new Error(`Trend button not found for heading "${headingText}"`);

  markScannedElement(trendButton, `Open popup: ${headingText}`);
  trendButton.click();
}

export async function switchPopupPeriod(periodLabel) {
  const normalizedPeriod = periodLabel.toLowerCase();
  const candidates = Array.from(document.querySelectorAll('button, [role="button"], select, option'));

  const target = candidates.find((element) => {
    const text = element.textContent.trim().toLowerCase();
    const ariaLabel = (element.getAttribute('aria-label') || '').toLowerCase();
    const dataPeriod = (element.getAttribute('data-period') || '').toLowerCase();
    return text === normalizedPeriod || ariaLabel.includes(normalizedPeriod) || dataPeriod === normalizedPeriod;
  });

  if (!target) throw new Error(`Period toggle not found: ${periodLabel}`);

  markScannedElement(target, `Period toggle: ${periodLabel}`);
  target.click();
}
