import { describe, it, expect, vi } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  collectComponentPathsFromRoute,
  componentPathToRelativeFile,
  validateRouteComponentPathsWithResolver,
} from '../../src/systems/routing/routeComponentPathValidator.js';
import { validateRouteComponentPathsOnDisk } from '../../src/systems/routing/routeComponentPathDiskValidator.node.js';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

describe('routeComponentPathValidator (M10)', () => {
  it('collectComponentPathsFromRoute gathers base and role-specific paths', () => {
    const paths = collectComponentPathsFromRoute({
      slug: '/dashboard',
      componentPath: '@/templates/dashboard/role/DashboardDevPlaygroundPage.vue',
      customComponentPath: {
        creator: {
          componentPath: '@/templates/dashboard/creator/DashboardCreator.vue',
        },
      },
    });

    expect(paths).toEqual([
      { path: '@/templates/dashboard/role/DashboardDevPlaygroundPage.vue', source: 'componentPath' },
      {
        path: '@/templates/dashboard/creator/DashboardCreator.vue',
        source: 'customComponentPath.creator',
      },
    ]);
  });

  it('componentPathToRelativeFile maps @/ alias to src path', () => {
    expect(componentPathToRelativeFile('@/dev/templates/auth/page/role/LoginPage.vue')).toBe(
      'src/dev/templates/auth/page/role/LoginPage.vue',
    );
  });

  it('validateRouteComponentPathsOnDisk passes for an existing route component', () => {
    const result = validateRouteComponentPathsOnDisk(
      [
        {
          slug: '/log-in',
          componentPath: '@/dev/templates/auth/page/role/LoginPage.vue',
        },
      ],
      projectRoot,
    );

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('validateRouteComponentPathsOnDisk fails for missing files', () => {
    const result = validateRouteComponentPathsOnDisk(
      [
        {
          slug: '/broken',
          componentPath: '@/templates/does/not/Exist.vue',
        },
      ],
      projectRoot,
    );

    expect(result.valid).toBe(false);
    expect(result.errors[0].type).toBe('MISSING_COMPONENT_FILE');
  });

  it('validateRouteComponentPathsWithResolver uses glob resolver', () => {
    const resolveLoader = vi.fn((path) =>
      path === '@/dev/templates/auth/page/role/LoginPage.vue' ? () => Promise.resolve({}) : null,
    );

    const valid = validateRouteComponentPathsWithResolver(
      [{ slug: '/log-in', componentPath: '@/dev/templates/auth/page/role/LoginPage.vue' }],
      resolveLoader,
    );
    const invalid = validateRouteComponentPathsWithResolver(
      [{ slug: '/broken', componentPath: '@/templates/missing/Component.vue' }],
      resolveLoader,
    );

    expect(valid.valid).toBe(true);
    expect(invalid.valid).toBe(false);
  });
});
