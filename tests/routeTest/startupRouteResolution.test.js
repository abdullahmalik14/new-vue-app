/**
 * Startup route resolution — Phase E (route test plan §39).
 */

import { describe, it, expect } from 'vitest';
import { normalizeLocalizedPath } from '../../src/systems/i18n/localeManager.js';
import { resolveRouteFromPath } from '../../src/systems/routing/routeResolver.js';

describe('startupRouteResolution (Phase E §39)', () => {
  it('normalizeLocalizedPath strips locale before resolveRouteFromPath matches slug', () => {
    const rawPath = '/vi/log-in';
    const normalized = normalizeLocalizedPath(rawPath);

    expect(normalized).toBe('/log-in');

    const withoutNormalize = resolveRouteFromPath(rawPath);
    const withNormalize = resolveRouteFromPath(normalized);

    expect(withoutNormalize?.slug).not.toBe('/log-in');
    expect(withNormalize?.slug).toBe('/log-in');
    expect(withNormalize?.section).toBe('auth');
  });

  it('hyphenated locale prefixes normalize correctly', () => {
    const normalized = normalizeLocalizedPath('/zh-tw/log-in');

    expect(normalized).toBe('/log-in');
    expect(resolveRouteFromPath(normalized)?.section).toBe('auth');
  });
});
