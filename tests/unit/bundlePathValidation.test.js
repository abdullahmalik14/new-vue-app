import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const VALIDATION_PATH = '../../src/systems/build/bundlePathValidation.js';

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('isTrustedBundlePath (S-03)', () => {
  it('accepts same-origin absolute paths starting with /', async () => {
    const { isTrustedBundlePath } = await import(VALIDATION_PATH);

    expect(isTrustedBundlePath('/assets/section-auth-abc123.js')).toBe(true);
  });

  it('rejects protocol-relative and dangerous scheme URLs', async () => {
    const { isTrustedBundlePath } = await import(VALIDATION_PATH);

    expect(isTrustedBundlePath('//evil.example.com/bundle.js')).toBe(false);
    expect(isTrustedBundlePath('javascript:alert(1)')).toBe(false);
    expect(isTrustedBundlePath('data:text/javascript,alert(1)')).toBe(false);
  });

  it('rejects absolute http(s) URLs unless allowlisted', async () => {
    const { isTrustedBundlePath } = await import(VALIDATION_PATH);

    expect(isTrustedBundlePath('https://evil.example.com/bundle.js')).toBe(false);
  });

  it('accepts absolute URLs matching VITE_TRUSTED_BUNDLE_ORIGINS', async () => {
    vi.stubEnv('VITE_TRUSTED_BUNDLE_ORIGINS', 'https://cdn.example.com,https://assets.example.net');

    const { isTrustedBundlePath } = await import(VALIDATION_PATH);

    expect(isTrustedBundlePath('https://cdn.example.com/section-auth.js')).toBe(true);
    expect(isTrustedBundlePath('https://assets.example.net/foo.css')).toBe(true);
    expect(isTrustedBundlePath('https://other.example.com/foo.js')).toBe(false);
  });

  it('rejects empty and non-string values', async () => {
    const { isTrustedBundlePath } = await import(VALIDATION_PATH);

    expect(isTrustedBundlePath('')).toBe(false);
    expect(isTrustedBundlePath('   ')).toBe(false);
    expect(isTrustedBundlePath(null)).toBe(false);
    expect(isTrustedBundlePath(undefined)).toBe(false);
  });
});

describe('escapeSelectorAttributeValue (S-06)', () => {
  it('escapes characters that break attribute selectors', async () => {
    const { escapeSelectorAttributeValue } = await import(VALIDATION_PATH);

    expect(escapeSelectorAttributeValue('/assets/section-auth.js')).toBe('/assets/section-auth.js');
    expect(escapeSelectorAttributeValue('path"with"quotes')).toBe('path\\"with\\"quotes');
    expect(document.querySelector(`link[href="${escapeSelectorAttributeValue('path"bad"')}"]`)).toBeNull();
  });
});
