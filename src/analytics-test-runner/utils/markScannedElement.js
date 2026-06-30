import { analyticsTestState } from '../state.js';

export function buildElementSelectorHint(element) {
  if (!element) return '';
  const parts = [element.tagName.toLowerCase()];
  if (element.getAttribute('data-testid')) {
    parts.push(`[data-testid="${element.getAttribute('data-testid')}"]`);
  }
  if (element.getAttribute('data-value') != null) {
    parts.push(`[data-value="${element.getAttribute('data-value')}"]`);
  }
  if (element.id) parts.push(`#${element.id}`);
  return parts.join('');
}

export function markScannedElement(element, label) {
  if (!element) return;

  element.style.outline = '2px solid red';
  element.style.outlineOffset = '2px';
  element.setAttribute('data-analytics-test-scanned', 'true');

  if (label) {
    element.setAttribute('data-analytics-test-scan-label', label);
  }

  analyticsTestState.scannedElements.push({
    label,
    tagName: element.tagName,
    text: element.textContent ? element.textContent.trim().slice(0, 120) : '',
    selectorHint: buildElementSelectorHint(element),
  });
}
