import { describe, it, expect, beforeEach, vi } from 'vitest';
import { normalizeAssetDefinition } from '../../src/utils/assets/assetScanner.js';

describe('assetScanner — normalizeAssetDefinition (L-11)', () => {
  beforeEach(() => {
    window.performanceTracker = { step: vi.fn() };
  });
  it('applies fallbacks when src/type/priority are null on the source object', () => {
    const normalized = normalizeAssetDefinition({
      src: null,
      type: null,
      priority: null,
      flag: 'icon.test'
    });

    expect(normalized.src).toBe('');
    expect(normalized.type).toBe('unknown');
    expect(normalized.priority).toBe('low');
    expect(normalized.flag).toBe('icon.test');
  });

  it('preserves valid fields from the source object', () => {
    const normalized = normalizeAssetDefinition({
      src: '/images/foo.webp',
      type: 'image',
      priority: 'high'
    });

    expect(normalized).toMatchObject({
      src: '/images/foo.webp',
      type: 'image',
      priority: 'high'
    });
  });
});
