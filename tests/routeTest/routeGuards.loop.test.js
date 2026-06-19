/**
 * routeGuards.js — loop prevention + redirect markers (Phase C §4, §10).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearGuardNavigationHistory,
  consumeGuardRedirectNavigation,
  guardPreventNavigationLoop,
  markGuardRedirectNavigation,
  shouldClearGuardLoopHistoryAfterNavigation,
} from '../../src/systems/routing/routeGuards.js';
import { resetGuardModuleState } from '../helpers/routeFixtures.js';

beforeEach(async () => {
  delete window.performanceTracker;
  await resetGuardModuleState();
});

describe('guardPreventNavigationLoop (Phase C §4)', () => {
  it('allows navigation when to and from slugs differ', () => {
    const result = guardPreventNavigationLoop({ slug: '/dashboard' }, { slug: '/log-in' });

    expect(result.isNavigationAllowed).toBe(true);
    expect(result.blockReason).toContain('different path');
  });

  it('allows first repeated navigation to the same slug', () => {
    const route = { slug: '/dashboard' };

    const result = guardPreventNavigationLoop(route, route);

    expect(result.isNavigationAllowed).toBe(true);
  });

  it('blocks when same slug is repeated at least three times', () => {
    const route = { slug: '/dashboard' };

    guardPreventNavigationLoop(route, route);
    guardPreventNavigationLoop(route, route);
    const blocked = guardPreventNavigationLoop(route, route);

    expect(blocked.isNavigationAllowed).toBe(false);
    expect(blocked.blockReason).toBe('Navigation loop detected');
    expect(blocked.redirectTargetPath).toBe('/404');
  });

  it('allows navigation after loop history is cleared', () => {
    const route = { slug: '/dashboard' };

    guardPreventNavigationLoop(route, route);
    guardPreventNavigationLoop(route, route);
    clearGuardNavigationHistory();

    const result = guardPreventNavigationLoop(route, route);

    expect(result.isNavigationAllowed).toBe(true);
  });

  it('handles null to/from slug without throw', () => {
    expect(() => guardPreventNavigationLoop(null, null)).not.toThrow();
    expect(guardPreventNavigationLoop(null, null).isNavigationAllowed).toBe(true);
  });
});

describe('guard loop redirect markers (Phase C §10)', () => {
  it('consumeGuardRedirectNavigation returns true once after mark', () => {
    markGuardRedirectNavigation();

    expect(consumeGuardRedirectNavigation()).toBe(true);
    expect(consumeGuardRedirectNavigation()).toBe(false);
  });

  it('shouldClear returns false when navigation completed via guard redirect', () => {
    expect(
      shouldClearGuardLoopHistoryAfterNavigation('/log-in', '/dashboard', {
        completedViaGuardRedirect: true,
      }),
    ).toBe(false);
  });

  it('shouldClear returns false for same-path completion', () => {
    expect(
      shouldClearGuardLoopHistoryAfterNavigation('/log-in', '/log-in', {
        completedViaGuardRedirect: false,
      }),
    ).toBe(false);
  });

  it('shouldClear returns false when from path is empty (initial load)', () => {
    expect(
      shouldClearGuardLoopHistoryAfterNavigation('', '/log-in', {
        completedViaGuardRedirect: false,
      }),
    ).toBe(false);
  });

  it('shouldClear returns true for user-initiated path change', () => {
    expect(
      shouldClearGuardLoopHistoryAfterNavigation('/log-in', '/sign-up/onboarding', {
        completedViaGuardRedirect: false,
      }),
    ).toBe(true);
  });
});
