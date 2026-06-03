import { describe, expect, it } from 'vitest';

import { createStepStateEngine } from '@/utils/stateEngine.js';

describe('stateEngine.addFieldRequirement (L-15)', () => {
  it('passes validation context so matchValue can read sibling state fields', async () => {
    const engine = createStepStateEngine({
      flowId: 'l15-match-test',
      defaults: { password: 'secret', confirmPassword: 'secret' },
      urlSync: 'none',
    });

    engine.addFieldRequirement(
      1,
      'confirmPassword',
      {
        rules: [{ type: 'matchValue', param: 'password', message: 'Passwords must match' }],
      },
      { scope: 'booking', fieldId: 'confirmPassword' },
    );

    const passResult = await engine.validate(1);
    expect(passResult.valid).toBe(true);

    engine.setState('confirmPassword', 'wrong', { silent: true });
    const failResult = await engine.validate(1);
    expect(failResult.valid).toBe(false);
    expect(failResult.errors.length).toBeGreaterThan(0);
  });

  it('uses element from contextOptions for required attribute checks', async () => {
    const engine = createStepStateEngine({
      flowId: 'l15-element-test',
      defaults: { title: '' },
      urlSync: 'none',
    });

    const input = document.createElement('input');
    input.setAttribute('required', '');
    input.value = '';

    engine.addFieldRequirement(
      1,
      'title',
      { required: true, requiredMessage: 'Title required' },
      { element: input, fieldId: 'title', scope: 'booking' },
    );

    const result = await engine.validate(1);
    expect(result.valid).toBe(false);
  });
});
