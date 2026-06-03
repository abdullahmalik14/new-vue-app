import { describe, expect, it } from 'vitest';

import { step1Validator } from '@/services/events/validators/eventStepValidators.js';

function baseState(overrides = {}) {
  return {
    eventTitle: 'Demo Event',
    duration: 30,
    basePrice: 10,
    repeatRule: 'weekly',
    weeklyAvailability: [{ unavailable: false, slots: [{ startTime: '10:00', endTime: '11:00' }] }],
    oneTimeAvailability: [{ slots: [{ startTime: '10:00', endTime: '11:00' }] }],
    monthlyAvailability: [{ startTime: '10:00', endTime: '11:00' }],
    ...overrides,
  };
}

describe('eventStepValidators step1', () => {
  it('does not treat empty repeatRule as weekly default', () => {
    const result = step1Validator(
      baseState({
        repeatRule: '',
        weeklyAvailability: [],
      }),
    );

    const hasRepeatRuleError = result.errors.some((error) => error.field === 'repeatRule');
    const hasWeeklyError = result.errors.some((error) => error.field === 'weeklyAvailability');
    expect(hasRepeatRuleError).toBe(true);
    expect(hasWeeklyError).toBe(false);
  });

  it('rejects inverted weekly slot ranges', () => {
    const result = step1Validator(
      baseState({
        repeatRule: 'weekly',
        weeklyAvailability: [{ unavailable: false, slots: [{ startTime: '18:00', endTime: '08:00' }] }],
      }),
    );

    const hasWeeklyError = result.errors.some((error) => error.field === 'weeklyAvailability');
    expect(hasWeeklyError).toBe(true);
  });
});
