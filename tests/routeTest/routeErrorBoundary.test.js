/**
 * routeErrorBoundary.js — Phase E (route test plan §25).
 */

import { describe, it, expect } from 'vitest';
import {
  createRouteRenderError,
  shouldClearRouteErrorOnNavigation,
} from '../../src/systems/routing/routeErrorBoundary.js';

describe('routeErrorBoundary (Phase E §25)', () => {
  it('createRouteRenderError normalizes Error instances', () => {
    const result = createRouteRenderError(new Error('render failed'), 'render function');

    expect(result.message).toBe('render failed');
    expect(result.info).toBe('render function');
    expect(typeof result.timestamp).toBe('number');
  });

  it('createRouteRenderError falls back for unknown values', () => {
    const result = createRouteRenderError(null);

    expect(result.message).toBe('Something went wrong');
    expect(result.info).toBe('render');
  });

  it('createRouteRenderError accepts string errors', () => {
    const result = createRouteRenderError('plain string error');

    expect(result.message).toBe('plain string error');
  });

  it('shouldClearRouteErrorOnNavigation clears when route key changes', () => {
    expect(shouldClearRouteErrorOnNavigation('/log-in', '/dashboard')).toBe(true);
    expect(shouldClearRouteErrorOnNavigation('/dashboard', '/dashboard')).toBe(false);
    expect(shouldClearRouteErrorOnNavigation('/dashboard', '')).toBe(false);
  });
});
