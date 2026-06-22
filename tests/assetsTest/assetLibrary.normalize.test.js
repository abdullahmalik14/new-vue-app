import { describe, expect, it } from 'vitest';
import { normalizeAssetMapUrl, normalizeGetAssetUrlArgs } from '../../src/systems/assets/assetLibrary.js';

describe('normalizeGetAssetUrlArgs (§3)', () => {
  it('flag + null → section null environment null', () => {
    expect(normalizeGetAssetUrlArgs('icon.cart', null)).toEqual({
      flag: 'icon.cart',
      environment: null,
      section: null,
    });
  });

  it('flag + staging string → environment staging', () => {
    expect(normalizeGetAssetUrlArgs('icon.cart', 'staging')).toEqual({
      flag: 'icon.cart',
      environment: 'staging',
      section: null,
    });
  });

  it('flag + { environment: dev } → environment dev', () => {
    expect(normalizeGetAssetUrlArgs('icon.cart', { environment: 'dev' })).toEqual({
      flag: 'icon.cart',
      environment: 'dev',
      section: null,
    });
  });

  it('flag + { section: auth } → section auth when valid', () => {
    expect(normalizeGetAssetUrlArgs('icon.cart', { section: 'auth' })).toEqual({
      flag: 'icon.cart',
      environment: null,
      section: 'auth',
    });
  });

  it('flag + { section: invalid! } → section null', () => {
    expect(normalizeGetAssetUrlArgs('icon.cart', { section: 'invalid!' })).toEqual({
      flag: 'icon.cart',
      environment: null,
      section: null,
    });
  });

  it('flag + { section: " auth " } → trims section', () => {
    expect(normalizeGetAssetUrlArgs('icon.cart', { section: ' auth ' })).toEqual({
      flag: 'icon.cart',
      environment: null,
      section: 'auth',
    });
  });

  it('flag + { environment: prod, section: auth } → both set', () => {
    expect(
      normalizeGetAssetUrlArgs('icon.cart', { environment: 'prod', section: 'auth' }),
    ).toEqual({
      flag: 'icon.cart',
      environment: 'prod',
      section: 'auth',
    });
  });

  it('preserves flag string unchanged', () => {
    expect(normalizeGetAssetUrlArgs('  icon.cart ', null).flag).toBe('  icon.cart ');
  });

  it('non-string environment in options → null environment', () => {
    expect(normalizeGetAssetUrlArgs('icon.cart', { environment: 123 })).toEqual({
      flag: 'icon.cart',
      environment: null,
      section: null,
    });
  });

  it('empty options object → nulls for both', () => {
    expect(normalizeGetAssetUrlArgs('icon.cart', {})).toEqual({
      flag: 'icon.cart',
      environment: null,
      section: null,
    });
  });
});

describe('normalizeAssetMapUrl (§3b)', () => {
  it('prepends base for relative path', () => {
    expect(normalizeAssetMapUrl('/assets/icon.svg')).toBe('/assets/icon.svg');
  });

  it('leaves https URL unchanged', () => {
    expect(normalizeAssetMapUrl('https://cdn.example.com/icon.svg')).toBe(
      'https://cdn.example.com/icon.svg',
    );
  });

  it('leaves http URL unchanged', () => {
    expect(normalizeAssetMapUrl('http://localhost:8080/icon.svg')).toBe(
      'http://localhost:8080/icon.svg',
    );
  });

  it('handles protocol-relative URL', () => {
    expect(normalizeAssetMapUrl('//cdn.example.com/icon.svg')).toBe('//cdn.example.com/icon.svg');
  });

  it('trims whitespace', () => {
    expect(normalizeAssetMapUrl('  /assets/icon.svg  ')).toBe('/assets/icon.svg');
  });

  it('empty input → empty string', () => {
    expect(normalizeAssetMapUrl('')).toBe('');
  });

  it('already normalized path is idempotent', () => {
    const url = 'https://cdn.example.com/icon.svg';
    expect(normalizeAssetMapUrl(normalizeAssetMapUrl(url))).toBe(url);
  });

  it('preserves query string', () => {
    expect(normalizeAssetMapUrl('/assets/icon.svg?v=1')).toBe('/assets/icon.svg?v=1');
  });

  it('preserves hash fragment', () => {
    expect(normalizeAssetMapUrl('/assets/icon.svg#frag')).toBe('/assets/icon.svg#frag');
  });

  it('upgrades remote http to https', () => {
    expect(normalizeAssetMapUrl('http://cdn.example.com/icon.svg')).toBe(
      'https://cdn.example.com/icon.svg',
    );
  });
});
