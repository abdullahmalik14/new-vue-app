/**
 * routeComponentLoader.js — Phase D (route test plan §13).
 */

import { describe, it, expect } from 'vitest';
import {
  findComponentLoader,
  loadComponentModule,
} from '../../src/systems/routing/routeComponentLoader.js';

describe('routeComponentLoader (Phase D §13)', () => {
  it('findComponentLoader returns a loader for a known dev template path', () => {
    const loader = findComponentLoader('@/dev/templates/auth/page/role/LoginPage.vue');

    expect(typeof loader).toBe('function');
  });

  it('findComponentLoader returns null for unknown component path', () => {
    expect(findComponentLoader('@/templates/does/not/Exist.vue')).toBeNull();
  });

  it('findComponentLoader returns null for empty string', () => {
    expect(findComponentLoader('')).toBeNull();
  });

  it('loadComponentModule throws for missing component path', async () => {
    await expect(loadComponentModule('@/templates/does/not/Exist.vue')).rejects.toThrow(
      /Component not found/,
    );
  });
});
