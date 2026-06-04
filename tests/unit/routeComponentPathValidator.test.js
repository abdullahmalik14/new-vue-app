import { describe, it, expect, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  collectComponentPathsFromRoute,
  componentPathToRelativeFile,
  validateRouteComponentPathsWithResolver,
} from '../../src/utils/route/routeComponentPathValidator.js';
import { validateRouteComponentPathsOnDisk } from '../../src/utils/route/routeComponentPathValidator.node.js';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

describe('routeComponentPathValidator (M10)', () => {
  it('collectComponentPathsFromRoute gathers base and role-specific paths', () => {
    const paths = collectComponentPathsFromRoute({
      slug: '/dashboard',
      componentPath: '@/templates/dashboard/page/role/Dashboard.vue',
      customComponentPath: {
        creator: {
          componentPath: '@/templates/dashboard/page/creator/DashboardCreator.vue',
        },
      },
    });

    expect(paths).toEqual([
      { path: '@/templates/dashboard/page/role/Dashboard.vue', source: 'componentPath' },
      {
        path: '@/templates/dashboard/page/creator/DashboardCreator.vue',
        source: 'customComponentPath.creator',
      },
    ]);
  });

  it('componentPathToRelativeFile maps @/ alias to src path', () => {
    expect(componentPathToRelativeFile('@/templates/auth/page/role/AuthLogIn.vue')).toBe(
      'src/templates/auth/page/role/AuthLogIn.vue',
    );
  });

  it('validateRouteComponentPathsOnDisk passes for an existing route component', () => {
    const relative = 'src/templates/auth/page/role/AuthLogIn.vue';
    if (!existsSync(join(projectRoot, relative))) {
      return;
    }

    const result = validateRouteComponentPathsOnDisk(
      [
        {
          slug: '/log-in',
          componentPath: '@/templates/auth/page/role/AuthLogIn.vue',
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
      path === '@/templates/auth/page/role/AuthLogIn.vue' ? () => Promise.resolve({}) : null,
    );

    const valid = validateRouteComponentPathsWithResolver(
      [{ slug: '/log-in', componentPath: '@/templates/auth/page/role/AuthLogIn.vue' }],
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
