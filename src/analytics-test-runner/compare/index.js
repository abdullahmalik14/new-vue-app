import { normalizeNumber } from '../utils/normalizeNumber.js';

export function compareNumbers(expected, found, tolerance = 0.01) {
  const diff = Math.abs(Number(found) - Number(expected));
  if (Number.isNaN(diff) || diff > tolerance) {
    return { pass: false, message: `Numeric mismatch: API ${expected}, DOM ${found}` };
  }
  return { pass: true, message: 'API matches DOM' };
}

export function compareExpectedObject(expectedObject, foundObject, tolerance = 0.01) {
  const messages = [];

  Object.keys(expectedObject).forEach((key) => {
    const expectedValue = expectedObject[key];
    const foundValue = foundObject ? foundObject[key] : undefined;

    if (typeof expectedValue === 'number') {
      const result = compareNumbers(expectedValue, foundValue, tolerance);
      if (!result.pass) messages.push(`${key}: ${result.message}`);
      return;
    }

    if (String(foundValue ?? '').trim() !== String(expectedValue).trim()) {
      messages.push(`${key} expected ${expectedValue}, found ${foundValue}`);
    }
  });

  return { pass: messages.length === 0, messages };
}

function baseComparison(expected, found, pass, message) {
  return {
    expectedId: expected.id,
    valueKind: expected.valueKind,
    view: expected.view,
    location: expected.location,
    metric: expected.metric,
    period: expected.period,
    apiPath: expected.apiPath,
    source: expected.source,
    knownGap: expected.knownGap,
    expectedValue: expected.expectedValue,
    foundValue: found?.foundValue ?? null,
    pass,
    message,
  };
}

export function compareExpectedToFound(expectedRows, foundRows) {
  return expectedRows.map((expected) => {
    const found = foundRows.find((row) => row.expectedId === expected.id);

    if (!found || !found.ok) {
      return baseComparison(expected, found, false, found?.error || 'DOM scan failed');
    }

    if (typeof expected.expectedValue === 'number') {
      const result = compareNumbers(expected.expectedValue, found.foundValue, expected.tolerance ?? 0.01);
      return baseComparison(expected, found, result.pass, result.message);
    }

    return baseComparison(
      expected,
      found,
      String(found.foundValue) === String(expected.expectedValue),
      'Equality check',
    );
  });
}
