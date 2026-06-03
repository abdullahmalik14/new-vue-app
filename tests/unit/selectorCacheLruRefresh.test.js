import { afterEach, describe, expect, it, vi } from 'vitest';

import { execActions, safeParseConfig } from '@/interactions/utils/engine.js';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('selector cache LRU refresh behavior', () => {
  it('keeps using live cached elements on repeated hits', () => {
    const host = document.createElement('div');
    host.innerHTML = '<div id="target"></div><input id="field" value="abc">';
    document.body.appendChild(host);
    const field = host.querySelector('#field');

    execActions({ actionType: 'cloneValue', targetSelector: '#target' }, field, host);
    execActions({ actionType: 'cloneValue', targetSelector: '#target' }, field, host);

    expect(host.querySelector('#target').textContent).toBe('abc');
  });

  it('warns in dev when config object is not frozen', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    safeParseConfig([{ rules: [{ type: 'hasContent' }] }]);
    expect(warnSpy).toHaveBeenCalled();
  });
});
