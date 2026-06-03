import { describe, expect, it, afterEach } from 'vitest';

import { validationEngine } from '@/utils/validation/validationEngine.js';
import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';

const SCOPE = 'unknown-rule-register-test';

describe('validationEngine unknown rules (B-12)', () => {
  afterEach(() => {
    delete interactionsEngine.scopes[SCOPE];
  });

  it('throws in DEV when rule type is unknown during validation', () => {
    expect(() =>
      validationEngine._runRuleList('x', [{ type: 'isEMail' }], {})
    ).toThrow(/Unknown rule type: isEMail/);
  });

  it('throws at register time for unknown rule types in DEV', () => {
    expect(() =>
      interactionsEngine.register(
        {
          scope: SCOPE,
          id: 'field',
          validation: { rules: [{ type: 'isEMail', message: 'bad' }] },
        },
        '',
        null
      )
    ).toThrow(/Unknown rule type at register: isEMail/);
  });
});
