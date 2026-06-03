import { describe, expect, it } from 'vitest';

import {
  validateScope,
  stampInteractionConfig,
  stampValidation,
  clearInteractionConfig,
} from '@/interactions/utils/engine.js';

describe('validateScope re-validates stale stamps (L-17)', () => {
  it('invalidates a field that was stamped valid but value changed programmatically', () => {
    const scope = document.createElement('div');
    scope.setAttribute('interaction-container', '');
    const input = document.createElement('input');
    input.setAttribute('id', 'staleEmail');
    input.setAttribute('name', 'staleEmail');
    input.value = 'good@example.com';
    scope.appendChild(input);
    document.body.appendChild(scope);

    stampInteractionConfig(input, [
      {
        triggerEvents: ['input'],
        rules: [{ type: 'isEmail', error: 'Invalid email' }],
      },
    ]);

    stampValidation(input, { isValid: true, failedRules: [] });
    expect(input.getAttribute('validated')).toBe('true');

    input.value = 'not-an-email';

    const result = validateScope(scope);
    expect(result.isValid).toBe(false);
    expect(result.invalid).toHaveLength(1);
    expect(result.invalid[0].id).toBe('staleEmail');
    expect(input.getAttribute('validated')).toBe('false');

    clearInteractionConfig(input);
    scope.remove();
  });
});
