import { describe, expect, it, afterEach } from 'vitest';

import { validationsLibrary } from '@/utils/validation/validationsLibrary.js';

describe('isRadioCheck name escaping (L-20)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('finds checked radio when name contains quotes', () => {
    const form = document.createElement('form');
    form.setAttribute('interaction-container', '');
    form.innerHTML = `
      <input type="radio" name='audit"group' id="r1" />
      <input type="radio" name='audit"group' id="r2" checked />
    `;
    document.body.appendChild(form);

    const anchor = form.querySelector('#r1');
    const result = validationsLibrary.isRadioCheck('', 'audit"group', { element: anchor });

    expect(result).toBe(true);
    form.remove();
  });

  it('returns false when no radio in group is checked', () => {
    const form = document.createElement('form');
    form.setAttribute('interaction-container', '');
    form.innerHTML = `
      <input type="radio" name="plain" id="a" />
      <input type="radio" name="plain" id="b" />
    `;
    document.body.appendChild(form);

    const anchor = form.querySelector('#a');
    expect(validationsLibrary.isRadioCheck('', 'plain', { element: anchor })).toBe(false);
    form.remove();
  });
});
