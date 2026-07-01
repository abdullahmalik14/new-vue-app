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

  const section =
    headingEl.closest('.flex-1') ||
    headingEl.parentElement?.parentElement ||
    headingEl.closest('div');

  const valueEl = Array.from(section?.querySelectorAll('span') || []).find((el) => {
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

export function scanCardPercentageByHeading(headingText, field) {
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

  markScannedElement(cardElement, `Card %: ${headingText}`);

  if (headingText.toLowerCase() === 'subscribers' && (field === 'new' || field === 'recurring')) {
    const newValueEl = Array.from(cardElement.querySelectorAll('[data-value]')).find((el) => {
      const label = el.closest('.flex-col')?.querySelector('span')?.textContent || '';
      if (field === 'recurring') return /recurring/i.test(label);
      return /new/i.test(label);
    });
    const block = newValueEl?.closest('.flex-col')?.parentElement;
    const pctEl = block?.querySelector('.text-sm.font-medium');
    if (!pctEl) {
      return {
        ok: false,
        foundValue: null,
        rawText: '',
        element: cardElement,
        error: `${field} subscribers percentage not found`,
      };
    }
    markScannedElement(pctEl, `${field} subscribers %`);
    const pct = normalizeNumber(pctEl.textContent.replace('%', ''));
    return { ok: true, foundValue: pct, rawText: pctEl.textContent.trim(), element: pctEl, error: null };
  }

  if (headingText.toLowerCase() === 'earnings') {
    const totalEl = cardElement.querySelector('[data-value]');
    const row = totalEl?.closest('.flex.justify-between') || totalEl?.parentElement?.parentElement;
    const pctEl = row?.querySelector('.text-sm.font-medium');
    if (!pctEl) {
      return {
        ok: false,
        foundValue: null,
        rawText: '',
        element: cardElement,
        error: 'Earnings percentage not found',
      };
    }
    markScannedElement(pctEl, 'Earnings %');
    const pct = normalizeNumber(pctEl.textContent.replace('%', ''));
    return { ok: true, foundValue: pct, rawText: pctEl.textContent.trim(), element: pctEl, error: null };
  }

  return {
    ok: false,
    foundValue: null,
    rawText: '',
    element: cardElement,
    error: `Unsupported percentage scan for ${headingText}/${field || 'default'}`,
  };
}

export function scanCardMetricPercentage(headingText, metricLabel) {
  const metricScan = scanCardMetricByLabel(headingText, metricLabel);
  if (!metricScan.ok) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: metricScan.element,
      error: metricScan.error,
    };
  }

  const labelEl = metricScan.element?.closest('.flex-col') || metricScan.element;
  const row = labelEl?.closest('.flex-col')?.querySelector('.flex.items-end') || labelEl?.parentElement;
  const pctEl = row?.querySelector('.text-sm.font-medium');
  if (!pctEl) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: metricScan.element,
      error: `Percentage not found for ${headingText} / ${metricLabel}`,
    };
  }

  markScannedElement(pctEl, `${headingText} / ${metricLabel} %`);
  const pct = normalizeNumber(pctEl.textContent.replace('%', ''));
  return {
    ok: true,
    foundValue: pct,
    rawText: pctEl.textContent.trim(),
    element: pctEl,
    error: null,
  };
}

export function scanPopupPercentageByStatHeading(statHeading) {
  const needle = statHeading.toLowerCase();
  const headingEl = Array.from(document.querySelectorAll('h3')).find((el) => {
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

  const section = headingEl.closest('.flex-col') || headingEl.parentElement;
  markScannedElement(headingEl, `Popup % heading: ${statHeading}`);

  const pctEl = Array.from(section?.querySelectorAll('div') || []).find((el) => {
    const text = el.textContent.trim();
    return /%/.test(text) && /-?\d+/.test(text) && el.children.length <= 2;
  });

  if (!pctEl) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: headingEl,
      error: `Popup percentage not visible for: ${statHeading}`,
    };
  }

  markScannedElement(pctEl, `Popup %: ${statHeading}`);
  const pct = normalizeNumber(pctEl.textContent.replace(/[^\d.-]/g, ''));
  return {
    ok: !Number.isNaN(pct),
    foundValue: pct,
    rawText: pctEl.textContent.trim(),
    element: pctEl,
    error: Number.isNaN(pct) ? `Could not parse popup % for ${statHeading}` : null,
  };
}

/**
 * Top Contributors preview table (overview card title is "Top Contributors").
 * @param {'total'|'name'} field
 */
export function scanTopContributorsPreview(field = 'total') {
  const headingScan = findHeadingElement('Top Contributors');
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
      error: 'Top Contributors card container not found',
    };
  }

  markScannedElement(cardElement, 'Card: Top Contributors');

  const valueElements = Array.from(cardElement.querySelectorAll('[data-value]'));
  if (valueElements.length === 0) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: cardElement,
      error: 'No contributor rows in Top Contributors preview',
    };
  }

  if (field === 'name') {
    const nameEl = valueElements.find((el) => {
      const raw = el.getAttribute('data-value') || '';
      return raw && !raw.startsWith('@') && Number.isNaN(Number(raw));
    });
    if (!nameEl) {
      return {
        ok: false,
        foundValue: null,
        rawText: '',
        element: cardElement,
        error: 'Top contributor name not found in preview table',
      };
    }
    markScannedElement(nameEl, 'Top contributor name');
    return {
      ok: true,
      foundValue: nameEl.getAttribute('data-value')?.trim() || nameEl.textContent.trim(),
      rawText: nameEl.textContent.trim(),
      element: nameEl,
      error: null,
    };
  }

  const totalEl = valueElements.find((el) => {
    const num = normalizeNumber(el.getAttribute('data-value'));
    return num != null && !Number.isNaN(num);
  });

  if (!totalEl) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: cardElement,
      error: 'Top contributor USD total not found in preview table',
    };
  }

  const total = normalizeNumber(totalEl.getAttribute('data-value'));
  markScannedElement(totalEl, 'Top contributor total');
  return {
    ok: true,
    foundValue: total,
    rawText: totalEl.textContent.trim(),
    element: totalEl,
    error: null,
  };
}

export function scanTrendTableCountrySales(tableHeading, countryName) {
  const headingEl =
    document.querySelector('[data-testid="dashboard-analytics-top-countries-heading"]') ||
    findHeadingElement(tableHeading).element;

  if (!headingEl) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: null,
      error: `Top Countries heading not found`,
    };
  }

  const tableRoot =
    headingEl.closest('.fourth-white-card-column') ||
    headingEl.closest('[class*="white-card"]') ||
    headingEl.closest('div');

  markScannedElement(headingEl, `Table: ${tableHeading}`);

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
  const salesEl = Array.from(row?.querySelectorAll('[data-value]') || []).find((el) => el !== countryEl);
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

