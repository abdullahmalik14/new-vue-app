import { describe, it, expect, beforeEach } from 'vitest';
import {
  markGuardRedirectNavigation,
  consumeGuardRedirectNavigation,
  shouldClearGuardLoopHistoryAfterNavigation,
  clearGuardNavigationHistory,
  guardPreventNavigationLoop,
} from '../../src/systems/routing/routeGuards.js';

describe('L5 — guard loop history clear policy', () => {
  beforeEach(() => {
    delete window.performanceTracker;
    consumeGuardRedirectNavigation();
    clearGuardNavigationHistory();
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

  it('consumeGuardRedirectNavigation returns true once after mark', () => {
    markGuardRedirectNavigation();
    expect(consumeGuardRedirectNavigation()).toBe(true);
    expect(consumeGuardRedirectNavigation()).toBe(false);
  });

  it('guardPreventNavigationLoop accumulates same-slug attempts when history is not cleared', () => {
    const route = { slug: '/dashboard' };
    const from = { slug: '/dashboard' };

    guardPreventNavigationLoop(route, from);
    guardPreventNavigationLoop(route, from);
    const blocked = guardPreventNavigationLoop(route, from);

    expect(blocked.allow).toBe(false);
    expect(blocked.reason).toBe('Navigation loop detected');
  });
});
