import { describe, expect, it, afterEach } from 'vitest';

import { vInteractions } from '@/interactions/directives/vInteractions.js';

describe('v-interactions initialPass (P-08)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('stamps validation on mount without running onInvalid actions', async () => {
    const scope = document.createElement('div');
    scope.setAttribute('interaction-container', '');

    const msg = document.createElement('span');
    msg.id = 'initial-pass-msg';
    msg.setAttribute('hidden', '');

    const input = document.createElement('input');
    input.setAttribute('required', '');
    scope.appendChild(msg);
    scope.appendChild(input);
    document.body.appendChild(scope);

    const config = Object.freeze([
      {
        triggerEvents: ['input'],
        rules: [{ type: 'minLength', param: 3, error: 'Too short' }],
        onInvalid: { actionType: 'show', targetSelector: '#initial-pass-msg' },
      },
    ]);

    vInteractions.mounted(input, { value: config, oldValue: undefined });
    await Promise.resolve();

    expect(input.getAttribute('validated')).toBe('false');
    expect(msg.hasAttribute('hidden')).toBe(true);

    input.value = 'ab';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(msg.hasAttribute('hidden')).toBe(false);

    scope.remove();
  });
});
