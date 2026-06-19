/**
 * notFoundComponentLoader.js — Phase E (route test plan §29).
 */

import { describe, it, expect } from 'vitest';
import {
  loadNotFoundComponent,
  NOT_FOUND_COMPONENT_PATH,
} from '../../src/systems/routing/notFoundComponentLoader.js';

describe('notFoundComponentLoader (Phase E §29)', () => {
  it('exports centralized not-found component path', () => {
    expect(NOT_FOUND_COMPONENT_PATH).toBe('@/dev/templates/misc/NotFoundPage.vue');
  });

  it('loadNotFoundComponent returns a promise', () => {
    const result = loadNotFoundComponent();

    expect(result).toBeInstanceOf(Promise);
  });

  it('loadNotFoundComponent resolves a Vue component module', async () => {
    const module = await loadNotFoundComponent();

    expect(module).toBeTruthy();
    expect(module.default || module).toBeTruthy();
  }, 15000);
});
