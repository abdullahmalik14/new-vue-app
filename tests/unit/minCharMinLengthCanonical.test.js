import { describe, expect, it } from 'vitest';

import interactionsRules from '@/interactions/utils/validationRules.js';
import { validationsLibrary } from '@/utils/validation/validationsLibrary.js';

describe('minChar/minLength canonical unification', () => {
  it('shares same rule functions and normalized param behavior', () => {
    const out = {
      sameMinCharReference: interactionsRules.minChar === validationsLibrary.minChar,
      sameMinLengthReference: interactionsRules.minLength === validationsLibrary.minLength,
      minCharRejectsTooShort: interactionsRules.minChar('ab', 3) === false,
      minLengthRejectsTooShort: interactionsRules.minLength('ab', 3) === false,
      minCharBadParamUsesFallback: interactionsRules.minChar('ab', 'bad') === true,
      minLengthBadParamUsesFallback: interactionsRules.minLength('ab', 'bad') === true,
    };

    expect(Object.values(out).every(Boolean)).toBe(true);
  });
});
