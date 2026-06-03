import { afterEach, describe, expect, it, vi } from 'vitest';

import { execActions } from '@/interactions/utils/engine.js';
import { default as rules } from '@/interactions/utils/validationRules.js';

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('directive engine security hardening', () => {
  it('setHTML uses textContent by default', () => {
    const host = document.createElement('div');
    host.innerHTML = '<div id="t"></div>';
    document.body.appendChild(host);

    execActions({ actionType: 'setHTML', targetSelector: '#t', value: '<img src=x onerror=alert(1)>' }, host, host);

    const target = host.querySelector('#t');
    expect(target.textContent).toBe('<img src=x onerror=alert(1)>');
  });

  it('attribute action blocks unsafe attributes and javascript urls', () => {
    const host = document.createElement('div');
    host.innerHTML = '<a id="lnk"></a>';
    document.body.appendChild(host);

    execActions(
      {
        actionType: 'attribute',
        targetSelector: '#lnk',
        add: { onclick: 'alert(1)', href: 'javascript:alert(1)', 'data-safe': '1' },
      },
      host,
      host,
    );

    const target = host.querySelector('#lnk');
    expect(target.hasAttribute('onclick')).toBe(false);
    expect(target.getAttribute('href')).toBe(null);
    expect(target.getAttribute('data-safe')).toBe('1');
  });

  it('jsObjectExists allows only AppGlobals namespace', () => {
    window.AppGlobals = { demo: { ok: true } };
    expect(rules.jsObjectExists('', 'AppGlobals.demo.ok')).toBe(true);
    expect(rules.jsObjectExists('', '__vue_app__.config')).toBe(false);
  });
});
