import { describe, it, expect } from 'vitest';
import {
  isChunkLoadNavigationError,
  isOnNavigationErrorRoute,
} from '../../src/utils/route/navigationErrorHandler.js';

describe('navigationErrorHandler B6', () => {
  it('detects ChunkLoadError by name', () => {
    expect(isChunkLoadNavigationError(new Error('x'))).toBe(false);
    expect(isChunkLoadNavigationError(Object.assign(new Error('fail'), { name: 'ChunkLoadError' }))).toBe(true);
  });

  it('detects webpack and vite chunk messages', () => {
    expect(isChunkLoadNavigationError(new Error('Loading chunk 5 failed.'))).toBe(true);
    expect(isChunkLoadNavigationError(new Error('Failed to fetch dynamically imported module: http://localhost/x.js'))).toBe(true);
    expect(isChunkLoadNavigationError(new Error('Importing a module script failed.'))).toBe(true);
  });

  it('isOnNavigationErrorRoute matches configured slug', () => {
    const router = {
      currentRoute: {
        value: {
          path: '/404',
          name: '/404',
          meta: { routeConfig: { slug: '/404' } },
        },
      },
    };

    expect(isOnNavigationErrorRoute(router)).toBe(true);
  });
});
