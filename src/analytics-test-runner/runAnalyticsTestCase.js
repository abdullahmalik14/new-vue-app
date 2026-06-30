import { analyticsTestState, resetAnalyticsTestState } from './state.js';
import { EVENT_EXPECTATIONS } from './config/eventExpectations.js';
import { buildTestExpectations } from './config/buildTestExpectations.js';
import { TEST_CREATOR_ID } from './config/testCreator.js';
import { resolveFanIdForTestCase } from './config/testCaseRegistry.js';
import { clearCreatorDatabase, triggerMasterEvent, fetchChartsPayload } from './api/endpoints.js';
import { refreshAnalyticsWithoutPageReload } from './refresh/trigger.js';
import {
  initPageBootGuard,
  markRefreshSession,
  captureMainAnalyticsSnapshot,
  readApiMetricForTestCase,
  buildRefreshVerificationChecks,
} from './refresh/verifyRefresh.js';
import { validateChartsPayloadContract } from './validation/contractValidator.js';
import { compareExpectedToFound } from './compare/index.js';
import { executeExpectedScan, executePopupScanBatch } from './scanners/executeScan.js';
import { renderRunnerPanel, setTestRunnerPanelOpen } from './ui/panel.js';
import { setRunnerStep, logActivity } from './ui/activityLog.js';
import { lockPageForDomScan, unlockPageAfterDomScan } from './ui/pageLock.js';
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
  initPageBootGuard();
  analyticsTestState.activeTestCase = testCaseKey;
  setTestRunnerPanelOpen(true);
  setRunnerStep('reset', `Starting: ${testCase.label}`);

  try {
    markRefreshSession();

    setRunnerStep('reset', 'Resetting test data for creator 99999');
    const clearResult = await clearCreatorDatabase(TEST_CREATOR_ID);
    if (!clearResult.ok) {
      const msg = `Clear endpoint unavailable (${clearResult.status ?? 'error'}) — using live API numbers as expected values`;
      analyticsTestState.errors.push(msg);
      logActivity(msg, 'reset');
    }
    await sleep(2000);

    const baselineSnapshot = captureMainAnalyticsSnapshot();

    const fanId = resolveFanIdForTestCase(testCaseKey);

    if (testCaseKey === 'cancelSubscription') {
      const seedPayload = {
        masterEventType: CANCEL_SEED.masterEventType,
        fields: {
          ...CANCEL_SEED.fields,
          creatorId: TEST_CREATOR_ID,
          fanId: resolveFanIdForTestCase('newSubscription'),
        },
      };
      logActivity(`POST /api/events/trigger (seed)\n${JSON.stringify(seedPayload, null, 2)}`, 'trigger');
      await triggerMasterEvent(seedPayload);
      await sleep(6000);
    }

    setRunnerStep('trigger', `Triggering live event: ${testCase.trigger.masterEventType}`);

    const fields = {
      ...testCase.trigger.fields,
      creatorId: TEST_CREATOR_ID,
      fanId,
    };

    const triggerPayload = {
      masterEventType: testCase.trigger.masterEventType,
      fields,
    };
    logActivity(`POST /api/events/trigger\n${JSON.stringify(triggerPayload, null, 2)}`, 'trigger');

    const triggerResult = await triggerMasterEvent(triggerPayload);

    if (!triggerResult.ok) {
      throw new Error(`Event trigger failed: ${JSON.stringify(triggerResult.response)}`);
    }
    logActivity(`Event accepted: ${JSON.stringify(triggerResult.response)}`, 'trigger');

    setRunnerStep('wait-backend', 'Waiting for backend processing (8s)');
    await sleep(8000);

    setRunnerStep('fetch-api', 'Fetching GET /api/charts/99999 (HTTP ground truth)');
    const chartsBeforeRefresh = await fetchChartsPayload(TEST_CREATOR_ID);
    const apiMetric = readApiMetricForTestCase(testCaseKey, chartsBeforeRefresh);
    logActivity(`HTTP charts metric: ${apiMetric ?? 'n/a'}`, 'fetch-api');

    const beforeRefreshSnapshot = captureMainAnalyticsSnapshot();

    setRunnerStep('refresh', 'Clicking Refresh — waiting for Vue (NO page reload)');
    await refreshAnalyticsWithoutPageReload();

    const afterRefreshSnapshot = captureMainAnalyticsSnapshot();
    analyticsTestState.chartsPayload = await fetchChartsPayload(TEST_CREATOR_ID);

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
        chartsPayload: analyticsTestState.chartsPayload,
      }),
    };

    setRunnerStep('validate', 'JSON contract validation (report only)');
    analyticsTestState.validationResults = validateChartsPayloadContract(analyticsTestState.chartsPayload);

    analyticsTestState.expectedRows = buildTestExpectations(testCaseKey, analyticsTestState.chartsPayload, {
      fields,
    });
    logActivity(
      `Built ${analyticsTestState.expectedRows.length} expectations (DOM + internal API config)`,
      'validate',
    );
    renderRunnerPanel();

    setTestRunnerPanelOpen(false);
    lockPageForDomScan('DOM runner starting — scanning main cards');

    setRunnerStep('scan-main', 'DOM runner: scanning main cards');
    const mainRows = analyticsTestState.expectedRows.filter((row) => !row.popup);
    const popupRows = analyticsTestState.expectedRows.filter((row) => row.popup);

    try {
      for (const expected of mainRows) {
        const label = `${expected.valueKind.toUpperCase()} · ${expected.location} · ${expected.metric}`;
        lockPageForDomScan(`DOM SCAN: ${label}`);
        logActivity(`DOM SCAN: ${label} (API ${expected.apiPath} = ${expected.expectedValue})`, 'scan-main');
        const found = await executeExpectedScan(expected, analyticsTestState.chartsPayload);
        analyticsTestState.foundRows.push(found);
        analyticsTestState.comparisonRows = compareExpectedToFound(
          analyticsTestState.expectedRows,
          analyticsTestState.foundRows,
        );
        renderRunnerPanel();
        await sleep(400);
      }

      setRunnerStep('scan-popups', 'DOM runner: opening popups — day / week / month / year');
      const popupFound = await executePopupScanBatch(popupRows, analyticsTestState.chartsPayload, {
        onProgress: (message) => {
          lockPageForDomScan(`DOM SCAN: ${message}`);
          logActivity(`DOM SCAN: ${message}`, 'scan-popups');
        },
      });
      analyticsTestState.foundRows.push(...popupFound);
    } finally {
      unlockPageAfterDomScan();
      setTestRunnerPanelOpen(true);
    }

    setRunnerStep('compare', 'Final report: API vs DOM');
    analyticsTestState.comparisonRows = compareExpectedToFound(
      analyticsTestState.expectedRows,
      analyticsTestState.foundRows,
    );

    const failed = analyticsTestState.comparisonRows.filter((row) => !row.pass && !row.knownGap).length;
    const refreshFailed =
      analyticsTestState.refreshVerification?.checks?.filter((check) => !check.pass).length ?? 0;
    const knownGaps = analyticsTestState.expectedRows.filter((row) => row.knownGap).length;
    const totalFailed = failed + refreshFailed;

    setRunnerStep(
      'done',
      totalFailed
        ? `Report: ${totalFailed} FAIL (${failed} comparisons, ${refreshFailed} refresh)${knownGaps ? ` · ${knownGaps} known gaps` : ''}`
        : 'Report: all PASS (API matches DOM)',
    );
  } catch (error) {
    unlockPageAfterDomScan();
    setTestRunnerPanelOpen(true);
    analyticsTestState.status = 'Error';
    analyticsTestState.currentStepId = 'done';
    analyticsTestState.errors.push(error instanceof Error ? error.message : String(error));
    logActivity(`ERROR: ${error instanceof Error ? error.message : String(error)}`, 'done');
    renderRunnerPanel();
    throw error;
  }
}

if (typeof window !== 'undefined') {
  window.runAnalyticsTestCase = runAnalyticsTestCase;
}
