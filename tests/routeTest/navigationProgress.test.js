/**
 * navigationProgressTracker.js — Phase E (route test plan §26).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  startNavigationProgress,
  finishNavigationProgress,
  failNavigationProgress,
  useNavigationProgress,
} from '../../src/systems/routing/navigationProgressTracker.js';

describe('navigationProgress (Phase E §26)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    failNavigationProgress();
  });

  afterEach(() => {
    failNavigationProgress();
    vi.useRealTimers();
  });

  it('starts visible with initial progress', () => {
    const { isActive, progress } = useNavigationProgress();

    startNavigationProgress();

    expect(isActive.value).toBe(true);
    expect(progress.value).toBeGreaterThan(0);
  });

  it('trickles toward 90% while navigation is pending', () => {
    const { progress } = useNavigationProgress();

    startNavigationProgress();
    const initial = progress.value;

    vi.advanceTimersByTime(600);

    expect(progress.value).toBeGreaterThan(initial);
    expect(progress.value).toBeLessThanOrEqual(0.9);
  });

  it('finishes at 100% then hides', () => {
    const { isActive, progress } = useNavigationProgress();

    startNavigationProgress();
    finishNavigationProgress();

    expect(progress.value).toBe(1);
    expect(isActive.value).toBe(true);

    vi.advanceTimersByTime(300);

    expect(isActive.value).toBe(false);
    expect(progress.value).toBe(0);
  });

  it('failNavigationProgress resets immediately', () => {
    const { isActive, progress } = useNavigationProgress();

    startNavigationProgress();
    failNavigationProgress();

    expect(isActive.value).toBe(false);
    expect(progress.value).toBe(0);
  });

  it('finishNavigationProgress without start does not throw', () => {
    expect(() => finishNavigationProgress()).not.toThrow();
  });
});
