import { describe, expect, it } from 'vitest';

import {
  validateScope,
  stampInteractionConfig,
  clearInteractionConfig,
  INTERACTION_CONFIG_ATTR,
} from '@/interactions/utils/engine.js';

describe('validateScope discovers v-interactions fields (L-11)', () => {
  it('returns isValid true with zero fields when interaction-config is missing', () => {
    const scope = document.createElement('div');
    scope.setAttribute('interaction-container', '');
    const input = document.createElement('input');
    input.setAttribute('id', 'email');
    input.setAttribute('name', 'email');
    input.value = 'not-an-email';
    scope.appendChild(input);
    document.body.appendChild(scope);

    const result = validateScope(scope);
    expect(result.isValid).toBe(true);
    expect(result.valid).toHaveLength(0);
    expect(result.invalid).toHaveLength(0);

    scope.remove();
  });

  it('validates fields after stampInteractionConfig (v-interactions wire path)', () => {
    const scope = document.createElement('div');
    scope.setAttribute('interaction-container', '');
    const input = document.createElement('input');
    input.setAttribute('id', 'auditEmail');
    input.setAttribute('name', 'auditEmail');
    input.value = 'not-an-email';
    scope.appendChild(input);
    document.body.appendChild(scope);

    stampInteractionConfig(input, [
      {
        triggerEvents: ['input'],
        rules: [{ type: 'isEmail', error: 'Invalid email' }],
      },
    ]);

    expect(input.getAttribute(INTERACTION_CONFIG_ATTR)).toBeTruthy();

    const result = validateScope(scope);
    expect(result.isValid).toBe(false);
    expect(result.invalid).toHaveLength(1);
    expect(result.invalid[0].id).toBe('auditEmail');
    expect(result.invalid[0].failedRules[0].rule).toBe('isEmail');

    clearInteractionConfig(input);
    expect(input.hasAttribute(INTERACTION_CONFIG_ATTR)).toBe(false);

    scope.remove();
  });
});
