import { describe, expect, it } from 'vitest';
import { normalizeAssetMapUrl } from '../../src/systems/assets/assetLibrary.js';

describe('normalizeAssetMapUrl (S-05)', () => {
  it('upgrades http to https for non-localhost hosts', () => {
    expect(normalizeAssetMapUrl('http://cdn.example.com/icon.svg')).toBe(
      'https://cdn.example.com/icon.svg',
    );
  });

  it('keeps http for localhost', () => {
    expect(normalizeAssetMapUrl('http://localhost:8080/icon.svg')).toBe(
      'http://localhost:8080/icon.svg',
    );
  });

  it('leaves relative and https URLs unchanged', () => {
    expect(normalizeAssetMapUrl('/assets/icon.svg')).toBe('/assets/icon.svg');
    expect(normalizeAssetMapUrl('https://cdn.example.com/icon.svg')).toBe(
      'https://cdn.example.com/icon.svg',
    );
  });
});
