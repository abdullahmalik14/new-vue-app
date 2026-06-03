import { afterEach, describe, expect, it } from 'vitest';

import directiveRules, {
  registerRule,
  runRule,
} from '@/interactions/utils/validationRules.js';
import { validationsLibrary } from '@/utils/validation/validationsLibrary.js';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('validation rules single source of truth', () => {
  it('shares the same registry object across directive and engine', () => {
    expect(validationsLibrary).toBe(directiveRules);
  });

  it('registerRule updates engine-visible validationsLibrary', () => {
    const name = 'unitRuntimeSharedRule';
    registerRule(name, (value) => value === 'ok');
    expect(validationsLibrary[name]('ok')).toBe(true);
    expect(runRule(name, 'bad')).toBe(false);
  });

  it('enforces unified core behavior from canonical rules', () => {
    expect(validationsLibrary.isNumeric('-')).toBe(false);
    expect(validationsLibrary.isNumeric('12')).toBe(true);
    expect(validationsLibrary.isNumeric('-12.5')).toBe(true);
    expect(validationsLibrary.hasContent(null)).toBe(false);
    expect(validationsLibrary.custom('x', null, {})).toBe(false);
    expect(validationsLibrary.isSecurePassword('Abcdef12')).toBe(false);
    expect(validationsLibrary.isSecurePassword('Abcd12!@')).toBe(true);
  });

  it('supports explicit selector and field matchValue paths', () => {
    const root = document.createElement('div');
    root.setAttribute('interaction-container', '');
    root.innerHTML = `
      <input id="password" name="password" value="Abcd12!@" />
      <input id="confirm" name="confirmPassword" value="Abcd12!@" />
    `;
    document.body.appendChild(root);

    const confirm = root.querySelector('#confirm');
    expect(confirm).toBeTruthy();

    expect(
      validationsLibrary.matchValueSelector(
        'Abcd12!@',
        '[name="password"]',
        { element: confirm },
      ),
    ).toBe(true);

    expect(
      validationsLibrary.matchValueField(
        'same',
        'password',
        { scope: 'auth', getFieldValue: () => 'same' },
      ),
    ).toBe(true);
  });

  it('uses the same email validator for both directive and engine imports', () => {
    const sample = 'user+tag@sub.example.co.uk';
    expect(directiveRules.isEmail(sample)).toBe(true);
    expect(validationsLibrary.isEmail(sample)).toBe(true);
    expect(validationsLibrary.isEmail).toBe(directiveRules.isEmail);
  });

  it('treats untouched required fields as blocking in scope guard', () => {
    const root = document.createElement('div');
    root.setAttribute('interaction-container', '');
    root.innerHTML = `
      <input id="req" required interaction-config='[]' value="" />
      <input id="optional" interaction-config='[]' value="ok" />
    `;
    document.body.appendChild(root);

    const req = root.querySelector('#req');
    req.setAttribute('validated', 'true');
    req.value = 'typed';
    req.removeAttribute('validated');
    req.value = '';

    expect(
      validationsLibrary.scopeHasNoBlockingInvalids(
        null,
        null,
        { element: req },
      ),
    ).toBe(false);
  });

  it('allows required field after it is filled with null selector', () => {
    const scope = document.createElement('div');
    scope.setAttribute('interaction-container', '');
    scope.innerHTML = '<input id="req" required interaction-config="[]" value=""><input id="ok" interaction-config="[]" value="x">';
    document.body.appendChild(scope);

    const req = scope.querySelector('#req');
    expect(
      validationsLibrary.scopeHasNoBlockingInvalids('', null, { element: req }),
    ).toBe(false);

    req.value = 'filled';
    expect(
      validationsLibrary.scopeHasNoBlockingInvalids('', null, { element: req }),
    ).toBe(true);
  });
});
