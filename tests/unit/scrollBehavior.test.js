import { describe, it, expect } from 'vitest';
import { resolveRouterScrollPosition } from '../../src/systems/routing/scrollBehavior.js';

describe('resolveRouterScrollPosition B8', () => {
  it('restores saved back/forward position', () => {
    const saved = { left: 0, top: 420 };

    expect(resolveRouterScrollPosition({ hash: '' }, {}, saved)).toEqual(saved);
  });

  it('scrolls to hash anchor when present', () => {
    expect(
      resolveRouterScrollPosition({ hash: '#features' }, {}, null),
    ).toEqual({ el: '#features', behavior: 'smooth' });
  });

  it('scrolls to top when no hash or saved position', () => {
    expect(resolveRouterScrollPosition({ hash: '' }, {}, null)).toEqual({ top: 0 });
  });

  it('prefers savedPosition over hash', () => {
    const saved = { left: 0, top: 100 };

    expect(
      resolveRouterScrollPosition({ hash: '#features' }, {}, saved),
    ).toEqual(saved);
  });
});
