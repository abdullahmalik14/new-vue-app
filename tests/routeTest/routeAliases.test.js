/**
 * routeAliasResolver.js — Phase B (route test plan §12).
 */

import { describe, it, expect } from 'vitest';
import {
  buildLocaleOptionalRoutePath,
  buildVueRouterAliases,
  collectRoutePathClaims,
  createRedirectFromRouteRecords,
  findDuplicateRoutePathClaims,
  normalizeAliasList,
  normalizeRedirectFromList,
  normalizeRoutePath,
  doesRouteConfigMatchPath,
} from '../../src/systems/routing/routeAliasResolver.js';

describe('routeAliases (Phase B §12)', () => {
  it('normalizeRoutePath adds a leading slash', () => {
    expect(normalizeRoutePath('login')).toBe('/login');
    expect(normalizeRoutePath('/login')).toBe('/login');
    expect(normalizeRoutePath('  ')).toBeNull();
  });

  it('normalizeAliasList normalizes alias entries', () => {
    expect(normalizeAliasList(['home', '/dashboard'])).toEqual(['/home', '/dashboard']);
    expect(normalizeAliasList(undefined)).toEqual([]);
  });

  it('normalizeRedirectFromList normalizes redirectFrom entries', () => {
    expect(normalizeRedirectFromList('/login')).toEqual(['/login']);
    expect(normalizeRedirectFromList(['/legacy', 'sign-in'])).toEqual(['/legacy', '/sign-in']);
  });

  it('buildLocaleOptionalRoutePath prefixes optional locale param', () => {
    expect(buildLocaleOptionalRoutePath('/login')).toBe('/:locale?/login');
  });

  it('buildVueRouterAliases maps config aliases to router aliases', () => {
    expect(buildVueRouterAliases(['/home', 'dashboard'])).toEqual([
      '/:locale?/home',
      '/:locale?/dashboard',
    ]);
  });

  it('doesRouteConfigMatchPath resolves slug and aliases', () => {
    const route = {
      slug: '/log-in',
      aliases: ['/sign-in'],
    };

    expect(doesRouteConfigMatchPath(route, '/log-in')).toBe(true);
    expect(doesRouteConfigMatchPath(route, '/sign-in')).toBe(true);
    expect(doesRouteConfigMatchPath(route, '/login')).toBe(false);
  });

  it('collectRoutePathClaims registers slug, alias, and redirectFrom paths', () => {
    const claims = collectRoutePathClaims([
      {
        slug: '/log-in',
        aliases: ['/sign-in'],
        redirectFrom: ['/login'],
      },
    ]);

    expect(claims.get('/log-in')).toEqual({ slug: '/log-in', kind: 'slug' });
    expect(claims.get('/sign-in')).toEqual({ slug: '/log-in', kind: 'alias' });
    expect(claims.get('/login')).toEqual({ slug: '/log-in', kind: 'redirectFrom' });
  });

  it('createRedirectFromRouteRecords builds locale-aware redirects', () => {
    const records = createRedirectFromRouteRecords(
      { slug: '/log-in', redirectFrom: ['/login'] },
      {
        resolveLocaleFromRouteLocation: () => 'vi',
        buildLocaleAwareRedirectPath: (target, locale) => `/${locale}${target}`,
        supportedLocales: ['en', 'vi'],
      },
    );

    expect(records).toHaveLength(1);
    expect(records[0].path).toBe('/:locale?/login');
    expect(records[0].redirect({ path: '/vi/login', params: { locale: 'vi' } })).toBe('/vi/log-in');
  });

  it('findDuplicateRoutePathClaims detects cross-route path conflicts', () => {
    const duplicates = findDuplicateRoutePathClaims([
      { slug: '/log-in', aliases: ['/sign-in'] },
      { slug: '/dashboard', aliases: ['/sign-in'] },
    ]);

    expect(duplicates).toHaveLength(1);
    expect(duplicates[0].path).toBe('/sign-in');
  });
});
