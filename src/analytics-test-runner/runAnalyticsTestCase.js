import { analyticsTestState, resetAnalyticsTestState } from './state.js';
import { EVENT_EXPECTATIONS } from './config/eventExpectations.js';
import { buildTestExpectations } from './config/buildTestExpectations.js';
import { resolveTestCreatorId } from './config/testCreator.js';
import { resolveFanIdForTestCase } from './config/testCaseRegistry.js';
import { resolveSeedForTestCase } from './config/eventSeeds.js';
import { resetTestDatabase, triggerMasterEvent, fetchChartsPayload } from './api/endpoints.js';
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
import { waitForDomScanContinue } from './ui/scanPause.js';
import { sleep } from './utils/sleep.js';

async function runSeedEvent(creatorId, seedConfig, log) {
  let masterEventType;
  let seedFields;
  let fanId;

  if (seedConfig.useTestCase) {
    const seedCase = EVENT_EXPECTATIONS[seedConfig.useTestCase];
    if (!seedCase) throw new Error(`Unknown seed test case: ${seedConfig.useTestCase}`);
    masterEventType = seedCase.trigger.masterEventType;
    seedFields = { ...seedCase.trigger.fields };
    fanId = resolveFanIdForTestCase(seedConfig.useTestCase);
  } else {
    masterEventType = seedConfig.masterEventType;
    seedFields = { ...seedConfig.fields };
    fanId = resolveFanIdForTestCase(seedConfig.fanIdKey || 'newSubscription');
  }

  const data = { ...seedFields, creatorId, ...(fanId != null ? { fanId } : {}) };
  log(
    `POST /api/events/trigger (seed)\n${JSON.stringify({ masterEventType, data }, null, 2)}`,
    'trigger',
  );
  const result = await triggerMasterEvent({ masterEventType, fields: data });
  if (!result.ok) {
    throw new Error(`Seed event failed: ${JSON.stringify(result.response)}`);
  }
  await sleep(6000);
}

let runnerInFlight = false;

/**
 * @param {string} testCaseKey
 */
export async function runAnalyticsTestCase(testCaseKey = 'newSubscription') {
  if (runnerInFlight) {
    throw new Error('Test runner already in progress — wait for the current run to finish');
  }

  const testCase = EVENT_EXPECTATIONS[testCaseKey];
  if (!testCase) throw new Error(`Unknown test case: ${testCaseKey}`);

  const creatorId = resolveTestCreatorId();
  runnerInFlight = true;

  resetAnalyticsTestState();
  initPageBootGuard();
  analyticsTestState.activeTestCase = testCaseKey;
  setTestRunnerPanelOpen(true);
  setRunnerStep('reset', `Starting: ${testCase.label}`);

  try {
    markRefreshSession();

    // Build instructions step 2–3: clear in-memory state, then reset database (always, every run).
    setRunnerStep('reset', `Resetting database for creator ${creatorId}`);
    const clearResult = await resetTestDatabase(creatorId);
    if (!clearResult.ok) {
      throw new Error(
        `Database reset failed (${clearResult.status ?? 'error'}). ` +
          `POST ${clearResult.url ?? '/api/events/clear'} must succeed before any event. ` +
          'Ensure dev proxy targets the Node API server (15.235.59.191), not Vercel.',
      );
    }
    logActivity(`Database cleared for creator ${creatorId}`, 'reset');
    await sleep(2000);

    setRunnerStep('refresh', 'Refreshing analytics UI after database reset');
    await refreshAnalyticsWithoutPageReload();
    logActivity('Dashboard refreshed to post-clear state (no page reload)', 'refresh');

    setRunnerStep('fetch-api', `Fetching baseline GET /api/charts/${creatorId} (post-clear)`);
    analyticsTestState.baselinePayload = await fetchChartsPayload(creatorId);
    logActivity('Baseline charts payload captured after clear', 'fetch-api');

    const baselineSnapshot = captureMainAnalyticsSnapshot();

    const fanId = resolveFanIdForTestCase(testCaseKey);
    const seedConfig = resolveSeedForTestCase(testCaseKey);

    if (seedConfig) {
      setRunnerStep('trigger', 'Seeding prerequisite event before main test');
      await runSeedEvent(creatorId, seedConfig, logActivity);
      analyticsTestState.baselinePayload = await fetchChartsPayload(creatorId);
      logActivity('Baseline updated after seed event', 'trigger');
    }

    setRunnerStep('trigger', `Triggering live event: ${testCase.trigger.masterEventType}`);

    const { fanId: _omitFan, ...eventFields } = testCase.trigger.fields;
    const fields = {
      ...eventFields,
      creatorId,
      ...(fanId != null ? { fanId } : {}),
    };

    logActivity(
      `POST /api/events/trigger\n${JSON.stringify({ masterEventType: testCase.trigger.masterEventType, data: fields }, null, 2)}`,
      'trigger',
    );

    const triggerResult = await triggerMasterEvent({
      masterEventType: testCase.trigger.masterEventType,
      fields,
    });

    if (!triggerResult.ok) {
      if (testCase.gapStatus === 'blocked') {
        const msg = `Event trigger failed (known blocked): ${JSON.stringify(triggerResult.response)}`;
        analyticsTestState.errors.push(msg);
        logActivity(msg, 'trigger');
      } else {
        throw new Error(`Event trigger failed: ${JSON.stringify(triggerResult.response)}`);
      }
    } else {
      logActivity(`Event accepted: ${JSON.stringify(triggerResult.response)}`, 'trigger');
    }

    if (triggerResult.ok) {
      setRunnerStep('wait-backend', 'Waiting for backend processing (8s)');
      await sleep(8000);
    }

    setRunnerStep('fetch-api', 'Fetching GET /api/charts/99999 (HTTP ground truth)');
    const chartsBeforeRefresh = await fetchChartsPayload(creatorId);
    const apiMetric = readApiMetricForTestCase(testCaseKey, chartsBeforeRefresh);
    logActivity(`HTTP charts metric: ${apiMetric ?? 'n/a'}`, 'fetch-api');

    const beforeRefreshSnapshot = captureMainAnalyticsSnapshot();

    setRunnerStep('refresh', 'Clicking Refresh — waiting for Vue (NO page reload)');
    await refreshAnalyticsWithoutPageReload();

    const afterRefreshSnapshot = captureMainAnalyticsSnapshot();
    analyticsTestState.chartsPayload = await fetchChartsPayload(creatorId);

    analyticsTestState.refreshVerification = {
      creatorId,
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
      baselinePayload: analyticsTestState.baselinePayload,
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
        await waitForDomScanContinue(label);
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
        onProgress: async (message) => {
          await waitForDomScanContinue(message);
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
  } finally {
    runnerInFlight = false;
  }
}

if (typeof window !== 'undefined') {
  window.runAnalyticsTestCase = runAnalyticsTestCase;
}
