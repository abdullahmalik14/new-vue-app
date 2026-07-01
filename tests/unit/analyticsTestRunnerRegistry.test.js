import { describe, expect, it } from 'vitest';

import { EVENT_EXPECTATIONS } from '@/analytics-test-runner/config/eventExpectations.js';
import {
  RUNNABLE_TEST_CASES,
  DROPDOWN_TEST_OPTIONS,
  BATCH_RUN_ALL_KEY,
  isBatchRunSelection,
  resolveFanIdForTestCase,
} from '@/analytics-test-runner/config/testCaseRegistry.js';
import { resolveSeedForTestCase } from '@/analytics-test-runner/config/eventSeeds.js';
import { getEventIncrement } from '@/analytics-test-runner/config/eventDeltas.js';

describe('analytics test runner registry', () => {
  it('lists every event expectation as runnable', () => {
    const eventKeys = Object.keys(EVENT_EXPECTATIONS);
    const runnableKeys = RUNNABLE_TEST_CASES.map((c) => c.key);
    expect(runnableKeys.sort()).toEqual(eventKeys.sort());
  });

  it('exposes batch-all option in dropdown separate from event keys', () => {
    expect(DROPDOWN_TEST_OPTIONS[0].key).toBe(BATCH_RUN_ALL_KEY);
    expect(isBatchRunSelection(BATCH_RUN_ALL_KEY)).toBe(true);
    expect(EVENT_EXPECTATIONS[BATCH_RUN_ALL_KEY]).toBeUndefined();
  });

  it('assigns fanId for all cases except mediaView', () => {
    Object.keys(EVENT_EXPECTATIONS).forEach((key) => {
      const fanId = resolveFanIdForTestCase(key);
      if (key === 'mediaView') {
        expect(fanId).toBeNull();
      } else {
        expect(fanId).toBeGreaterThan(0);
      }
    });
  });

  it('defines seed-before for unlike, unfollow, and cancel', () => {
    expect(resolveSeedForTestCase('mediaUnlike')?.useTestCase).toBe('mediaLike');
    expect(resolveSeedForTestCase('unfollow')?.useTestCase).toBe('follow');
    expect(resolveSeedForTestCase('cancelSubscription')?.masterEventType).toBe('newOrder');
    expect(resolveSeedForTestCase('newSubscription')).toBeNull();
  });

  it('defines event increments for every case', () => {
    Object.entries(EVENT_EXPECTATIONS).forEach(([key, config]) => {
      const inc = getEventIncrement(key, config.trigger.fields);
      expect(Object.keys(inc).length).toBeGreaterThan(0);
    });
  });
});
