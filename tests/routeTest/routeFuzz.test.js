/**
 * Property-style fuzz guards — Phase G (route test plan §92).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCanonicalRouteFixtures } from '../helpers/routeFixtures.js';

const getRouteConfiguration = vi.fn(() => getCanonicalRouteFixtures());

vi.mock('../../src/systems/routing/routeConfigLoader.js', () => ({
  getRouteConfiguration,
}));

const RANDOM_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 /\\-_?#&';

function randomString(maxLength = 24) {
  const length = Math.floor(Math.random() * maxLength) + 1;
  let value = '';
  for (let index = 0; index < length; index += 1) {
    value += RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
  }
  return value;
}

function randomArbitraryValue(depth = 0) {
  const kind = Math.floor(Math.random() * 8);
  if (depth > 2) {
    return randomString(8);
  }
  switch (kind) {
    case 0:
      return randomString(16);
    case 1:
      return null;
    case 2:
      return undefined;
    case 3:
      return Math.random() > 0.5;
    case 4:
      return Number((Math.random() * 200 - 100).toFixed(3));
    case 5:
      return [];
    case 6:
      return { a: randomString(4), nested: randomArbitraryValue(depth + 1) };
    default:
      return [randomString(4), randomArbitraryValue(depth + 1)];
  }
}

beforeEach(() => {
  vi.resetModules();
  getRouteConfiguration.mockReturnValue(getCanonicalRouteFixtures());
  delete window.performanceTracker;
});

describe('routeFuzz (Phase G §92)', () => {
  it('normalizeRoutePath preserves leading slash or returns null', async () => {
    const { normalizeRoutePath } = await import('../../src/systems/routing/routeAliasResolver.js');

    for (let index = 0; index < 120; index += 1) {
      const input = index % 5 === 0 ? '   ' : randomString(20);
      const result = normalizeRoutePath(input);

      if (result === null) {
        expect(typeof input !== 'string' || input.trim().length === 0).toBe(true);
      } else {
        expect(result.startsWith('/')).toBe(true);
      }
    }
  });

  it('buildLocaleOptionalRoutePath never throws for arbitrary values', async () => {
    const { buildLocaleOptionalRoutePath } = await import('../../src/systems/routing/routeAliasResolver.js');

    for (let index = 0; index < 80; index += 1) {
      expect(() => buildLocaleOptionalRoutePath(randomArbitraryValue())).not.toThrow();
    }
  });

  it('doesRouteConfigMatchPath always returns boolean', async () => {
    const { doesRouteConfigMatchPath } = await import('../../src/systems/routing/routeAliasResolver.js');
    const route = { slug: '/shop', aliases: ['/store'] };

    for (let index = 0; index < 80; index += 1) {
      const result = doesRouteConfigMatchPath(route, randomString(12));
      expect(typeof result).toBe('boolean');
    }
  });

  it('resolveRouteFromPath never throws for random target paths', async () => {
    const { resolveRouteFromPath } = await import('../../src/systems/routing/routeResolver.js');

    for (let index = 0; index < 80; index += 1) {
      expect(() => resolveRouteFromPath(randomString(16))).not.toThrow();
    }
  });

  it('resolveExactRouteFromPath never returns catch-all route', async () => {
    const { resolveExactRouteFromPath } = await import('../../src/systems/routing/routeResolver.js');

    for (let index = 0; index < 80; index += 1) {
      const result = resolveExactRouteFromPath(randomString(16));
      expect(result?.slug).not.toBe('/:pathMatch(.*)*');
    }
  });

  it('isChunkLoadNavigationError always returns boolean', async () => {
    const { isChunkLoadNavigationError } = await import(
      '../../src/systems/routing/navigationErrorHandler.js'
    );

    for (let index = 0; index < 80; index += 1) {
      const candidate = randomArbitraryValue();
      expect(typeof isChunkLoadNavigationError(candidate)).toBe('boolean');
    }
  });

  it('resolveRouterScrollPosition never throws for random payloads', async () => {
    const { resolveRouterScrollPosition } = await import('../../src/systems/routing/scrollBehavior.js');

    for (let index = 0; index < 80; index += 1) {
      expect(() =>
        resolveRouterScrollPosition(
          { hash: randomString(6) },
          { hash: randomString(6) },
          Math.random() > 0.5 ? { left: 0, top: 10 } : null,
        ),
      ).not.toThrow();
    }
  });

  it('isValidRouteEnvAccess only accepts allowed enum/null/undefined', async () => {
    const { isValidRouteEnvAccess, ROUTE_ENV_ACCESS } = await import(
      '../../src/systems/routing/routeEnvAccess.js'
    );
    const allowed = new Set([ROUTE_ENV_ACCESS.ALL, ROUTE_ENV_ACCESS.DEVELOPMENT, null, undefined]);

    for (let index = 0; index < 80; index += 1) {
      const value = randomArbitraryValue();
      const result = isValidRouteEnvAccess(value);
      expect(typeof result).toBe('boolean');
      if (result) {
        expect(allowed.has(value)).toBe(true);
      }
    }
  });

  it('isAdminUser always returns boolean for arbitrary context objects', async () => {
    const { isAdminUser } = await import('../../src/systems/routing/routeAdminAccess.js');

    for (let index = 0; index < 80; index += 1) {
      const value = randomArbitraryValue();
      const context = value && typeof value === 'object' ? value : {};
      expect(typeof isAdminUser(context)).toBe('boolean');
    }
  });

  it('resolveRoleSectionVariant always returns string or null', async () => {
    const { resolveRoleSectionVariant } = await import('../../src/systems/sections/sectionResolver.js');

    for (let index = 0; index < 80; index += 1) {
      const result = resolveRoleSectionVariant(randomArbitraryValue(), randomString(6));
      expect(result === null || typeof result === 'string').toBe(true);
    }
  });

  it('findDuplicateRoutePathClaims is deterministic for same input', async () => {
    const { findDuplicateRoutePathClaims } = await import('../../src/systems/routing/routeAliasResolver.js');
    const routes = [
      { slug: '/a', aliases: [`/dup-${Math.floor(Math.random() * 1000)}`] },
      { slug: '/b', aliases: ['/shared-alias'] },
      { slug: '/c', redirectFrom: ['/shared-alias'] },
    ];

    const first = findDuplicateRoutePathClaims(routes);
    const second = findDuplicateRoutePathClaims(routes);

    expect(first).toEqual(second);
  });
});

describe('route regression guards (Phase G §91)', () => {
  it('normalizeRoutePath for root slug returns /', async () => {
    const { normalizeRoutePath } = await import('../../src/systems/routing/routeAliasResolver.js');

    expect(normalizeRoutePath('/')).toBe('/');
  });

  it('buildLocaleOptionalRoutePath for root slug returns locale-optional root pattern', async () => {
    const { buildLocaleOptionalRoutePath } = await import('../../src/systems/routing/routeAliasResolver.js');

    expect(buildLocaleOptionalRoutePath('/')).toBe('/:locale?/');
  });

  it('doesRouteConfigMatchPath matches root slug against /', async () => {
    const { doesRouteConfigMatchPath } = await import('../../src/systems/routing/routeAliasResolver.js');

    expect(doesRouteConfigMatchPath({ slug: '/' }, '/')).toBe(true);
  });

  it('safelyGetNestedProperty returns undefined for missing keys without throw', async () => {
    const { safelyGetNestedProperty } = await import('../../src/utils/common/objectSafety.js');

    expect(safelyGetNestedProperty(null, 'a.b')).toBeUndefined();
    expect(safelyGetNestedProperty({}, 'a.b.c')).toBeUndefined();
  });
});
