import { analyticsTestState, resetAnalyticsTestState } from './state.js';
import { EVENT_EXPECTATIONS } from './config/eventExpectations.js';
import { buildTestExpectations } from './config/buildTestExpectations.js';
import { createEmptyExpectationState, applyMasterEvent } from './config/expectationState.js';
import { resolveMixedBatchScenario } from './config/mixedBatchScenarios.js';
import { resolveTestCreatorId } from './config/testCreator.js';
import { resolveFanIdForTestCase } from './config/testCaseRegistry.js';
import { resetTestDatabase, triggerMasterEvent, fetchChartsPayload } from './api/endpoints.js';
import { refreshAnalyticsWithoutPageReload } from './refresh/trigger.js';
import {
  initPageBootGuard,
  markRefreshSession,
  captureMainAnalyticsSnapshot,
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
import { resolveRefreshExpectationFromState } from './config/stateMetricResolver.js';

let mixedBatchInFlight = false;

/**
 * Fire multiple master events after one DB clear, then one refresh.
 * @param {string} scenarioKey
 */
export async function runAnalyticsTestMixedBatch(scenarioKey = 'mixedBatch_subscriptionAndMerch') {
  if (mixedBatchInFlight) {
    throw new Error('Mixed batch runner already in progress');
  }

  const scenario = resolveMixedBatchScenario(scenarioKey);
  if (!scenario) throw new Error(`Unknown mixed batch scenario: ${scenarioKey}`);

  const creatorId = resolveTestCreatorId();
  mixedBatchInFlight = true;

  resetAnalyticsTestState();
  initPageBootGuard();
  analyticsTestState.activeTestCase = scenarioKey;
  setTestRunnerPanelOpen(true);
  setRunnerStep('reset', `Starting mixed batch: ${scenario.label}`);

  try {
    markRefreshSession();

    setRunnerStep('reset', `Resetting database for creator ${creatorId}`);
    const clearResult = await resetTestDatabase(creatorId);
    if (!clearResult.ok) {
      throw new Error(`Database reset failed (${clearResult.status ?? 'error'})`);
    }
    await sleep(2000);

    analyticsTestState.expectationState = createEmptyExpectationState();
    analyticsTestState.eventHistory = [];

    await refreshAnalyticsWithoutPageReload();

    for (let i = 0; i < scenario.events.length; i++) {
      const step = scenario.events[i];
      const testCaseKey = step.useTestCase;
      const testCase = EVENT_EXPECTATIONS[testCaseKey];
      if (!testCase) throw new Error(`Unknown event in mixed batch: ${testCaseKey}`);

      const fanId = resolveFanIdForTestCase(testCaseKey);
      const { fanId: _omit, ...eventFields } = testCase.trigger.fields;
      const fields = { ...eventFields, creatorId, ...(fanId != null ? { fanId } : {}) };

      setRunnerStep('trigger', `[${i + 1}/${scenario.events.length}] ${testCase.label}`);
      logActivity(
        `POST /api/events/trigger\n${JSON.stringify({ masterEventType: testCase.trigger.masterEventType, data: fields }, null, 2)}`,
        'trigger',
      );

      const result = await triggerMasterEvent({
        masterEventType: testCase.trigger.masterEventType,
        fields,
      });
      if (!result.ok) {
        throw new Error(`Event ${testCaseKey} failed: ${JSON.stringify(result.response)}`);
      }

      applyMasterEvent(analyticsTestState.expectationState, {
        testCaseKey,
        fields: eventFields,
        fanId,
        fanLabel: fanId != null ? `Fan ${fanId}` : undefined,
      });
      analyticsTestState.eventHistory.push({ testCaseKey, fields: eventFields, fanId });

      await sleep(8000);
    }

    setRunnerStep('refresh', 'Single refresh after all events');
    const beforeRefresh = captureMainAnalyticsSnapshot();
    await refreshAnalyticsWithoutPageReload();
    const afterRefresh = captureMainAnalyticsSnapshot();
    analyticsTestState.chartsPayload = await fetchChartsPayload(creatorId);

    analyticsTestState.refreshVerification = {
      creatorId,
      testCaseKey: scenarioKey,
      beforeRefresh,
      afterRefresh,
      checks: buildRefreshVerificationChecks({
        testCaseKey: scenario.events[scenario.events.length - 1].useTestCase,
        afterRefresh,
        apiMetric: resolveRefreshExpectationFromState(
          scenario.events[scenario.events.length - 1].useTestCase,
          analyticsTestState.expectationState,
        ),
        expectationState: analyticsTestState.expectationState,
      }),
    };

    analyticsTestState.validationResults = validateChartsPayloadContract(analyticsTestState.chartsPayload);

    analyticsTestState.expectedRows = buildTestExpectations(scenarioKey, analyticsTestState.chartsPayload, {
      expectationState: analyticsTestState.expectationState,
      eventHistory: analyticsTestState.eventHistory,
      mixedBatch: true,
    });

    setTestRunnerPanelOpen(false);
    lockPageForDomScan('Mixed batch DOM scan');

    const mainRows = analyticsTestState.expectedRows.filter((row) => !row.popup && !row.validationOnly);
    const popupRows = analyticsTestState.expectedRows.filter((row) => row.popup && !row.validationOnly);

    try {
      for (const expected of mainRows) {
        const label = `${expected.metric} · ${expected.location}`;
        await waitForDomScanContinue(label);
        const found = await executeExpectedScan(expected, analyticsTestState.chartsPayload);
        analyticsTestState.foundRows.push(found);
      }
      const popupFound = await executePopupScanBatch(popupRows, analyticsTestState.chartsPayload);
      analyticsTestState.foundRows.push(...popupFound);
    } finally {
      unlockPageAfterDomScan();
      setTestRunnerPanelOpen(true);
    }

    analyticsTestState.comparisonRows = compareExpectedToFound(
      analyticsTestState.expectedRows,
      analyticsTestState.foundRows,
      analyticsTestState.chartsPayload,
    );

    const failed = analyticsTestState.comparisonRows.filter((r) => !r.pass && !r.knownGap).length;
    setRunnerStep('done', failed ? `Mixed batch: ${failed} FAIL` : 'Mixed batch: all PASS');
  } catch (error) {
    unlockPageAfterDomScan();
    setTestRunnerPanelOpen(true);
    analyticsTestState.errors.push(error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    mixedBatchInFlight = false;
    renderRunnerPanel();
  }
}

if (typeof window !== 'undefined') {
  window.runAnalyticsTestMixedBatch = runAnalyticsTestMixedBatch;
}
