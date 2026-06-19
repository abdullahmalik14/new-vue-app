/**
 * systems/routing/index.js barrel — Phase E (route test plan §41, §90).
 */

import { describe, it, expect } from 'vitest';
import * as routing from '../../src/systems/routing/index.js';

const BARREL_EXPORTS = [
  'loadRouteConfigurationFromFile',
  'getCachedRouteConfiguration',
  'resetRouteConfigurationCache',
  'getRouteConfiguration',
  'resolveRouteFromPath',
  'resolveExactRouteFromPath',
  'resolveComponentPathForRoute',
  'inheritConfigurationFromParentRoute',
  'resolveEffectiveAssetPreloadForRoute',
  'getRouteChainForPath',
  'runAllRouteGuards',
  'guardPreventNavigationLoop',
  'guardCheckRouteEnvironmentAccess',
  'guardCheckRouteAdminAccess',
  'guardCheckAuthentication',
  'guardCheckRouteUserRole',
  'guardCheckDependencies',
  'clearGuardNavigationHistory',
  'markGuardRedirectNavigation',
  'consumeGuardRedirectNavigation',
  'shouldClearGuardLoopHistoryAfterNavigation',
  'setCurrentActiveRoute',
  'getCurrentActivePath',
  'getCurrentActiveRoute',
  'getCurrentRouteChain',
  'getPreviousActivePath',
  'getPreviousActiveRoute',
  'getNavigationHistory',
  'canNavigateBack',
  'clearNavigationHistory',
  'getNavigationStatistics',
  'isOnPath',
  'wasPreviouslyOnPath',
  'prefetchRouteComponent',
  'normalizeTargetPath',
  'resolveRouteForPrefetch',
  'prefetchSectionAssetsForRoute',
  'createSectionAssetPrefetchIntentHandler',
  'resetRouteAssetPrefetchCache',
  'useRoutePrefetch',
  'createRoutePrefetchIntentHandler',
  'resolveRouteTransition',
  'ROUTE_TRANSITION_PRESETS',
  'createRouteRenderError',
  'shouldClearRouteErrorOnNavigation',
  'normalizeRoutePath',
  'buildLocaleOptionalRoutePath',
  'buildVueRouterAliases',
  'normalizeRedirectFromList',
  'normalizeAliasList',
  'doesRouteConfigMatchPath',
  'createRedirectFromRouteRecords',
  'findDuplicateRoutePathClaims',
  'resolveCurrentSectionForNavigation',
  'loadCurrentSectionResources',
  'isAdminUser',
  'isRouteAccessibleToAdmin',
  'collectComponentPathsFromRoute',
  'collectComponentPathsFromRoutes',
  'componentPathToRelativeFile',
  'validateRouteComponentPathsWithResolver',
  'startNavigationProgress',
  'finishNavigationProgress',
  'failNavigationProgress',
  'useNavigationProgress',
];

describe('routerExports / routing barrel (Phase E §41)', () => {
  it('exports every documented symbol from systems/routing/index.js', () => {
    for (const exportName of BARREL_EXPORTS) {
      expect(routing[exportName], `missing export: ${exportName}`).toBeDefined();
    }
  });

  it('has no duplicate export names in the barrel module', () => {
    const exportNames = Object.keys(routing).filter((key) => key !== 'default');

    expect(new Set(exportNames).size).toBe(exportNames.length);
  });

  it('re-exports core routing helpers as callable functions', () => {
    expect(typeof routing.getRouteConfiguration).toBe('function');
    expect(typeof routing.resolveRouteFromPath).toBe('function');
    expect(typeof routing.runAllRouteGuards).toBe('function');
    expect(typeof routing.setCurrentActiveRoute).toBe('function');
    expect(typeof routing.normalizeRoutePath).toBe('function');
    expect(typeof routing.prefetchRouteComponent).toBe('function');
    expect(typeof routing.createRoutePrefetchIntentHandler).toBe('function');
    expect(typeof routing.useRoutePrefetch).toBe('function');
    expect(typeof routing.resolveRouteTransition).toBe('function');
    expect(typeof routing.createRouteRenderError).toBe('function');
    expect(typeof routing.startNavigationProgress).toBe('function');
    expect(typeof routing.isAdminUser).toBe('function');
    expect(typeof routing.validateRouteComponentPathsWithResolver).toBe('function');
  });

  it('does not re-export router-only or submodule-local symbols', () => {
    expect(routing.resolveRouterScrollPosition).toBeUndefined();
    expect(routing.isChunkLoadNavigationError).toBeUndefined();
    expect(routing.getDefaultNotFoundSlug).toBeUndefined();
    expect(routing.findComponentLoader).toBeUndefined();
    expect(routing.isRouteAccessibleInCurrentEnvironment).toBeUndefined();
  });
});

describe('router/index.js re-exports (Phase E §37)', () => {
  it('does not re-export runAllRouteGuards from router entry', async () => {
    const routerModule = await import('../../src/router/index.js');

    expect(routerModule.runAllRouteGuards).toBeUndefined();
  }, 15000);

  it('runAllRouteGuards remains available from routing barrel', () => {
    expect(typeof routing.runAllRouteGuards).toBe('function');
  });
});
