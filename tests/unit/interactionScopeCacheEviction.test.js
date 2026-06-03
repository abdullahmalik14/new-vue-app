import { describe, expect, it } from 'vitest';

import { evictScopeCache, resolveScope } from '@/interactions/utils/engine.js';

describe('interaction scope cache eviction', () => {
  it('re-resolves scope after cache eviction', () => {
    const firstContainer = document.createElement('div');
    firstContainer.setAttribute('interaction-container', '');
    const secondContainer = document.createElement('div');
    secondContainer.setAttribute('interaction-container', '');
    const field = document.createElement('input');

    firstContainer.appendChild(field);
    document.body.appendChild(firstContainer);

    const firstScope = resolveScope(field);
    expect(firstScope).toBe(firstContainer);

    secondContainer.appendChild(field);
    document.body.appendChild(secondContainer);

    const staleScope = resolveScope(field);
    expect(staleScope).toBe(firstContainer);

    evictScopeCache(field);
    const refreshedScope = resolveScope(field);
    expect(refreshedScope).toBe(secondContainer);
  });
});
