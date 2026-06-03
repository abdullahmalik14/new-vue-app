import { describe, expect, it, vi } from 'vitest';

import { vInteractions } from '@/interactions/directives/vInteractions.js';

describe('vInteractions listener options', () => {
  it('uses passive:true only for touch/wheel events', () => {
    const el = document.createElement('input');
    const addSpy = vi.spyOn(el, 'addEventListener');

    vInteractions.mounted(el, {
      value: Object.freeze([{
        triggerEvents: ['wheel', 'touchstart', 'input', 'submit'],
        rules: [],
      }]),
    });

    const calls = addSpy.mock.calls.map(([eventName, _handler, options]) => ({ eventName, options }));

    const wheel = calls.find((c) => c.eventName === 'wheel');
    const touchstart = calls.find((c) => c.eventName === 'touchstart');
    const input = calls.find((c) => c.eventName === 'input');
    const submit = calls.find((c) => c.eventName === 'submit');

    expect(wheel?.options).toEqual({ passive: true });
    expect(touchstart?.options).toEqual({ passive: true });
    expect(input?.options).toBeUndefined();
    expect(submit?.options).toBeUndefined();
  });
});
