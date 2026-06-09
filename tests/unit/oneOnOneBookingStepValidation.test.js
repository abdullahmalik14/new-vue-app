import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('OneOnOneBookingStep1 step validation (L-18)', () => {
  it('uses flow engine.validate(1) instead of interactionsEngine.validateScope', () => {
    const source = readFileSync(
      resolve('src/components/forms/booking-form/OneOnOneBookingStep1.vue'),
      'utf8',
    );

    expect(source).toContain('props.engine.validate(1)');
    expect(source).not.toContain('interactionsEngine.validateScope');
  });
});
