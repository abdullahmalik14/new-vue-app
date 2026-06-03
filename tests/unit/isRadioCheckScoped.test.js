import { describe, expect, it, afterEach } from 'vitest';

import { validationsLibrary } from '@/utils/validation/validationsLibrary.js';

describe('isRadioCheck scoped to interaction container (B-13)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('ignores a checked radio with the same name outside the scoped container', () => {
    const outer = document.createElement('div');
    outer.innerHTML = '<input type="radio" name="plan" checked />';
    document.body.appendChild(outer);

    const form = document.createElement('form');
    form.setAttribute('interaction-container', '');
    form.innerHTML = `
      <input type="radio" name="plan" id="in-scope" />
      <input type="radio" name="plan" id="in-scope-2" />
    `;
    document.body.appendChild(form);

    const anchor = form.querySelector('#in-scope');
    expect(validationsLibrary.isRadioCheck('', 'plan', { element: anchor })).toBe(false);

    outer.remove();
    form.remove();
  });

  it('returns true when a radio in the scoped container is checked', () => {
    const form = document.createElement('form');
    form.setAttribute('interaction-container', '');
    form.innerHTML = `
      <input type="radio" name="plan" id="a" />
      <input type="radio" name="plan" id="b" checked />
    `;
    document.body.appendChild(form);

    const anchor = form.querySelector('#a');
    expect(validationsLibrary.isRadioCheck('', 'plan', { element: anchor })).toBe(true);

    form.remove();
  });
});
