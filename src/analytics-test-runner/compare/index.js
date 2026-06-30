import { normalizeNumber } from '../utils/normalizeNumber.js';

export function compareNumbers(expected, found, tolerance = 0.01) {
  const diff = Math.abs(Number(found) - Number(expected));
  if (Number.isNaN(diff) || diff > tolerance) {
    return { pass: false, message: `Numeric mismatch: expected ${expected}, found ${found}` };
  }
  return { pass: true, message: 'Matched within tolerance' };
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

export function compareExpectedToFound(expectedRows, foundRows) {
  return expectedRows.map((expected) => {
    const found = foundRows.find((row) => row.expectedId === expected.id);

    if (!found || !found.ok) {
      return {
        expectedId: expected.id,
        view: expected.view,
        metric: expected.metric,
        period: expected.period,
        source: expected.source,
        expectedValue: expected.expectedValue,
        foundValue: found?.foundValue ?? null,
        pass: false,
        message: found?.error || 'No found row',
      };
    }

    if (typeof expected.expectedValue === 'number') {
      const result = compareNumbers(expected.expectedValue, found.foundValue, expected.tolerance ?? 0.01);
      return {
        expectedId: expected.id,
        view: expected.view,
        metric: expected.metric,
        period: expected.period,
        source: expected.source,
        expectedValue: expected.expectedValue,
        foundValue: found.foundValue,
        pass: result.pass,
        message: result.message,
      };
    }

    if (expected.expectedValue && typeof expected.expectedValue === 'object') {
      const result = compareExpectedObject(
        expected.expectedValue,
        found.foundValue,
        expected.tolerance ?? 0.01,
      );
      return {
        expectedId: expected.id,
        view: expected.view,
        metric: expected.metric,
        period: expected.period,
        source: expected.source,
        expectedValue: expected.expectedValue,
        foundValue: found.foundValue,
        pass: result.pass,
        message: result.messages?.join('; ') || 'Matched',
      };
    }

    return {
      expectedId: expected.id,
      view: expected.view,
      metric: expected.metric,
      period: expected.period,
      source: expected.source,
      expectedValue: expected.expectedValue,
      foundValue: found.foundValue,
      pass: String(found.foundValue) === String(expected.expectedValue),
      message: 'Equality check',
    };
  });
}
