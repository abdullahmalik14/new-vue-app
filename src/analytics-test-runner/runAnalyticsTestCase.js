import { analyticsTestState, resetAnalyticsTestState } from './state.js';
import { EVENT_EXPECTATIONS } from './config/eventExpectations.js';
import { expandExpectedRows } from './config/expandExpectedRows.js';
import { TEST_CREATOR_ID } from './config/testCreator.js';
import { resolveFanIdForTestCase } from './config/testCaseRegistry.js';
import { clearCreatorDatabase, triggerMasterEvent, fetchChartsPayload } from './api/endpoints.js';
import { refreshAnalyticsWithoutPageReload } from './refresh/trigger.js';
import {
  markRefreshSession,
  captureMainAnalyticsSnapshot,
  readApiMetricForTestCase,
  buildRefreshVerificationChecks,
} from './refresh/verifyRefresh.js';
import { validateChartsPayloadContract } from './validation/contractValidator.js';
import { compareExpectedToFound } from './compare/index.js';
import { executeExpectedScan, executePopupScanBatch } from './scanners/executeScan.js';
import { renderRunnerPanel } from './ui/panel.js';
import { sleep } from './utils/sleep.js';

const CANCEL_SEED = {
  masterEventType: 'newOrder',
  fields: {
    orderType: 'new_subscription',
    amount: 29.99,
    countryId: 702,
    countryCode: 'SG',
    planId: 2,
    calculated_amount: 0,
    is_switch: false,
  },
};

/**
 * @param {string} testCaseKey
 */
export async function runAnalyticsTestCase(testCaseKey = 'newSubscription') {
  const testCase = EVENT_EXPECTATIONS[testCaseKey];
  if (!testCase) throw new Error(`Unknown test case: ${testCaseKey}`);

  resetAnalyticsTestState();
  analyticsTestState.activeTestCase = testCaseKey;
  analyticsTestState.status = 'Starting';
  renderRunnerPanel();

  try {
    markRefreshSession();

    analyticsTestState.status = 'Resetting database';
    renderRunnerPanel();
    const clearResult = await clearCreatorDatabase(TEST_CREATOR_ID);
    if (!clearResult.ok) {
      analyticsTestState.errors.push(
        `Clear endpoint unavailable (${clearResult.status ?? 'error'}) — continuing on isolated creator ${TEST_CREATOR_ID}`,
      );
    }
    await sleep(2000);

    const baselineSnapshot = captureMainAnalyticsSnapshot();

    const fanId = resolveFanIdForTestCase(testCaseKey);

    if (testCaseKey === 'cancelSubscription') {
      analyticsTestState.status = 'Seeding subscription before cancel';
      renderRunnerPanel();
      await triggerMasterEvent({
        masterEventType: CANCEL_SEED.masterEventType,
        fields: {
          ...CANCEL_SEED.fields,
          creatorId: TEST_CREATOR_ID,
          fanId: resolveFanIdForTestCase('newSubscription'),
        },
      });
      await sleep(6000);
    }

    analyticsTestState.status = 'Triggering master event';
    renderRunnerPanel();

    const fields = {
      ...testCase.trigger.fields,
      creatorId: TEST_CREATOR_ID,
      fanId,
    };

    const triggerResult = await triggerMasterEvent({
      masterEventType: testCase.trigger.masterEventType,
      fields,
    });

    if (!triggerResult.ok) {
      throw new Error(`Event trigger failed: ${JSON.stringify(triggerResult.response)}`);
    }

    analyticsTestState.status = 'Waiting for processing';
    renderRunnerPanel();
    await sleep(8000);

    analyticsTestState.status = 'Step 10 — verifying refresh (API first, then DOM)';
    renderRunnerPanel();

    const chartsBeforeRefresh = await fetchChartsPayload(TEST_CREATOR_ID);
    const apiMetric = readApiMetricForTestCase(testCaseKey, chartsBeforeRefresh);
    const beforeRefreshSnapshot = captureMainAnalyticsSnapshot();

    await refreshAnalyticsWithoutPageReload();

    const afterRefreshSnapshot = captureMainAnalyticsSnapshot();
    analyticsTestState.refreshVerification = {
      creatorId: TEST_CREATOR_ID,
      testCaseKey,
      baseline: baselineSnapshot,
      beforeRefresh: beforeRefreshSnapshot,
      afterRefresh: afterRefreshSnapshot,
      apiMetric,
      chartsBeforeRefresh,
      checks: buildRefreshVerificationChecks({
        testCaseKey,
        baseline: baselineSnapshot,
        beforeRefresh: beforeRefreshSnapshot,
        afterRefresh: afterRefreshSnapshot,
        apiMetric,
      }),
    };

    analyticsTestState.chartsPayload = await fetchChartsPayload(TEST_CREATOR_ID);

    analyticsTestState.validationResults = validateChartsPayloadContract(analyticsTestState.chartsPayload);
    analyticsTestState.status = 'JSON validation complete (continuing)';
    renderRunnerPanel();

    analyticsTestState.expectedRows = expandExpectedRows(testCaseKey, {
      ...testCase,
      fields,
    });

    analyticsTestState.status = 'Scanning DOM and charts';
    renderRunnerPanel();

    const mainRows = analyticsTestState.expectedRows.filter((row) => !row.popup);
    const popupRows = analyticsTestState.expectedRows.filter((row) => row.popup);

    for (const expected of mainRows) {
      const found = await executeExpectedScan(expected, analyticsTestState.chartsPayload);
      analyticsTestState.foundRows.push(found);
      renderRunnerPanel();
    }

    const popupFound = await executePopupScanBatch(popupRows, analyticsTestState.chartsPayload);
    analyticsTestState.foundRows.push(...popupFound);
    renderRunnerPanel();

    analyticsTestState.comparisonRows = compareExpectedToFound(
      analyticsTestState.expectedRows,
      analyticsTestState.foundRows,
    );

    const failed = analyticsTestState.comparisonRows.filter((row) => !row.pass).length;
    const refreshFailed =
      analyticsTestState.refreshVerification?.checks?.filter((check) => !check.pass).length ?? 0;
    const knownGaps = analyticsTestState.expectedRows.filter((row) => row.knownGap).length;
    const totalFailed = failed + refreshFailed;

    analyticsTestState.status = totalFailed
      ? `Completed with ${totalFailed} FAIL (${failed} scans, ${refreshFailed} refresh)${knownGaps ? ` — ${knownGaps} known gaps` : ''}`
      : 'Completed — all PASS (including Step 10 refresh)';
    renderRunnerPanel();
  } catch (error) {
    analyticsTestState.status = 'Error';
    analyticsTestState.errors.push(error instanceof Error ? error.message : String(error));
    renderRunnerPanel();
    throw error;
  }
}

if (typeof window !== 'undefined') {
  window.runAnalyticsTestCase = runAnalyticsTestCase;
}
