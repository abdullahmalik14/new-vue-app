import { describe, it, expect } from 'vitest';

describe('startup route resolution (L-11)', () => {
  it('normalizeLocalizedPath strips locale before resolveRouteFromPath matches slug', async () => {
    const { normalizeLocalizedPath } = await import(
      '@/systems/i18n/localeManager.js'
    );
    const { resolveRouteFromPath } = await import('@/systems/routing/routeResolver.js');

    const rawPath = '/vi/log-in';
    const normalized = normalizeLocalizedPath(rawPath);

    expect(normalized).toBe('/log-in');

    const withoutNormalize = resolveRouteFromPath(rawPath);
    const withNormalize = resolveRouteFromPath(normalized);

    expect(withoutNormalize?.slug).not.toBe('/log-in');
    expect(withNormalize?.slug).toBe('/log-in');
    expect(withNormalize?.section).toBe('auth');
  });

  it('hyphenated locale prefixes normalize correctly', async () => {
    const { normalizeLocalizedPath } = await import(
      '@/systems/i18n/localeManager.js'
    );
    const { resolveRouteFromPath } = await import('@/systems/routing/routeResolver.js');

    const normalized = normalizeLocalizedPath('/zh-tw/log-in');

    expect(normalized).toBe('/log-in');
    expect(resolveRouteFromPath(normalized)?.section).toBe('auth');
  });
});
