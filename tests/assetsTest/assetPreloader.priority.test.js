import { describe, expect, it } from 'vitest';
import { resolveFetchPriority, shouldInjectExecutableScript } from '../../src/systems/assets/assetPreloader.js';

describe('resolveFetchPriority / shouldInjectExecutableScript (§15)', () => {
  it('resolveFetchPriority critical → high fetch priority', () => {
    expect(resolveFetchPriority({ priority: 'critical' })).toBe('high');
  });

  it('resolveFetchPriority high → high', () => {
    expect(resolveFetchPriority({ priority: 'high' })).toBe('high');
  });

  it('resolveFetchPriority normal → auto or default', () => {
    expect(resolveFetchPriority({ priority: 'normal' })).toBe('auto');
  });

  it('resolveFetchPriority missing → default', () => {
    expect(resolveFetchPriority({})).toBeNull();
  });

  it('shouldInjectExecutableScript true for module scripts when configured', () => {
    expect(shouldInjectExecutableScript({ module: true, location: 'head-last' })).toBe(true);
  });

  it('shouldInjectExecutableScript false for plain preload-only', () => {
    expect(shouldInjectExecutableScript({ priority: 'high' })).toBe(false);
  });

  it('shouldInjectExecutableScript respects options.inject', () => {
    expect(shouldInjectExecutableScript({ name: 'cognito' })).toBe(true);
  });
});
