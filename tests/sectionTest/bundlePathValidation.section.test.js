/**
 * bundlePathValidation.js — section consumer paths (section test plan §34, §107–108).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const VALIDATION_PATH = '../../src/systems/build/bundlePathValidation.js';

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('isTrustedBundlePath (Phase D §34, §107)', () => {
  async function loadValidation() {
    return import(VALIDATION_PATH);
  }

  it('accepts same-origin absolute asset paths', async () => {
    const { isTrustedBundlePath } = await loadValidation();
    expect(isTrustedBundlePath('/assets/section-auth-Abc123.js')).toBe(true);
    expect(isTrustedBundlePath('/assets/section-dashboard-creator-xyz.css')).toBe(true);
  });

  it('rejects dangerous schemes and protocol-relative URLs', async () => {
    const { isTrustedBundlePath } = await loadValidation();
    expect(isTrustedBundlePath('javascript:alert(1)')).toBe(false);
    expect(isTrustedBundlePath('data:text/javascript,alert(1)')).toBe(false);
    expect(isTrustedBundlePath('//evil.com/script.js')).toBe(false);
    expect(isTrustedBundlePath('../relative/path.js')).toBe(false);
  });

  it('rejects empty and non-string values without throwing', async () => {
    const { isTrustedBundlePath } = await loadValidation();
    expect(isTrustedBundlePath('')).toBe(false);
    expect(isTrustedBundlePath(null)).toBe(false);
    expect(isTrustedBundlePath(undefined)).toBe(false);
  });

  it('accepts absolute URLs matching VITE_TRUSTED_BUNDLE_ORIGINS', async () => {
    vi.stubEnv('VITE_TRUSTED_BUNDLE_ORIGINS', 'https://cdn.example.com,https://assets.example.net');

    const { isTrustedBundlePath } = await loadValidation();
    expect(isTrustedBundlePath('https://cdn.example.com/section-auth.js')).toBe(true);
    expect(isTrustedBundlePath('https://other.example.com/foo.js')).toBe(false);
  });
});

describe('escapeSelectorAttributeValue (Phase D §108)', () => {
  async function loadValidation() {
    return import(VALIDATION_PATH);
  }

  it('escapes quotes and backslashes for attribute selectors', async () => {
    const { escapeSelectorAttributeValue } = await loadValidation();

    expect(escapeSelectorAttributeValue('/assets/auth-Kx9pQ.js')).toBe('/assets/auth-Kx9pQ.js');
    expect(escapeSelectorAttributeValue('path"with"quotes')).toBe('path\\"with\\"quotes');
    expect(escapeSelectorAttributeValue(String.raw`path\with\backslash`)).toContain('\\\\');
  });

  it('returns empty string for non-string input', async () => {
    const { escapeSelectorAttributeValue } = await loadValidation();
    expect(escapeSelectorAttributeValue(null)).toBe('');
  });
});
