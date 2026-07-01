import { analyticsTestState } from './state.js';
import { EVENT_EXPECTATIONS } from './config/eventExpectations.js';
import { getBatchTestCaseKeys } from './config/testCaseRegistry.js';
import { runAnalyticsTestCase } from './runAnalyticsTestCase.js';
import { renderRunnerPanel, setTestRunnerPanelOpen } from './ui/panel.js';
import { setRunnerStep, logActivity } from './ui/activityLog.js';
import { unlockPageAfterDomScan } from './ui/pageLock.js';

let batchInFlight = false;

/**
 * Run every single-event test case in sequence (DB clear + one ingest per case).
 * Aligns with build spec v1 (one event per run). True mixed-event batches
 * (multiple ingests before one refresh) are Later Expansion item #10.
 */
export async function runAnalyticsTestBatch() {
  if (batchInFlight) {
    throw new Error('Batch runner already in progress');
  }

  const keys = getBatchTestCaseKeys();
  batchInFlight = true;
  analyticsTestState.batchResults = [];
  analyticsTestState.activeTestCase = '__batch_all__';

  setTestRunnerPanelOpen(true);
  setRunnerStep('reset', `Batch: ${keys.length} cases (sequential)`);
  logActivity(`Starting batch — ${keys.length} cases, one clear + one event each`, 'reset');

  const results = [];

  try {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const label = EVENT_EXPECTATIONS[key]?.label || key;
      const progress = `[${i + 1}/${keys.length}]`;

      setRunnerStep('reset', `${progress} ${label}`);
      logActivity(`${progress} Starting: ${label}`, 'trigger');

      let caseResult;
      try {
        await runAnalyticsTestCase(key);
        const comparisonFailed =
          analyticsTestState.comparisonRows.filter((row) => !row.pass && !row.knownGap).length;
        const refreshFailed =
          analyticsTestState.refreshVerification?.checks?.filter((check) => !check.pass).length ?? 0;
        const knownGaps = analyticsTestState.expectedRows.filter((row) => row.knownGap).length;
        const pass = comparisonFailed === 0 && refreshFailed === 0;

        caseResult = {
          key,
          label,
          pass,
          comparisonFailed,
          refreshFailed,
          knownGaps,
          errors: [...analyticsTestState.errors],
        };
      } catch (error) {
        caseResult = {
          key,
          label,
          pass: false,
          comparisonFailed: null,
          refreshFailed: null,
          knownGaps: 0,
          errors: [error instanceof Error ? error.message : String(error)],
        };
      }

      results.push(caseResult);
      analyticsTestState.batchResults = [...results];
      renderRunnerPanel();

      const status = caseResult.pass ? 'PASS' : 'FAIL';
      logActivity(`${progress} ${label}: ${status}`, 'done');
    }

    const passed = results.filter((r) => r.pass).length;
    const failed = results.length - passed;

    setRunnerStep(
      'done',
      failed
        ? `Batch done: ${passed}/${results.length} passed, ${failed} failed`
        : `Batch done: all ${results.length} passed`,
    );
    logActivity(`Batch complete — ${passed}/${results.length} passed`, 'done');
  } finally {
    unlockPageAfterDomScan();
    batchInFlight = false;
    analyticsTestState.batchResults = results;
    renderRunnerPanel();
  }
}

if (typeof window !== 'undefined') {
  window.runAnalyticsTestBatch = runAnalyticsTestBatch;
}
