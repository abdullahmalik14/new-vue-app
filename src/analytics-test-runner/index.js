import { bindStartButton, ensureTestRunnerPanel, renderRunnerPanel, getSelectedTestCaseKey } from './ui/panel.js';
import { runAnalyticsTestCase } from './runAnalyticsTestCase.js';

let bootstrapped = false;

export function bootstrapAnalyticsTestRunner() {
  if (bootstrapped) return;
  if (!isAnalyticsRoute()) return;

  bootstrapped = true;
  ensureTestRunnerPanel();
  bindStartButton(async () => {
    try {
      await runAnalyticsTestCase(getSelectedTestCaseKey());
    } catch (error) {
      console.error('[AnalyticsTestRunner]', error);
    }
  });
  renderRunnerPanel();
  console.info('[AnalyticsTestRunner] Ready — pick a test case and click Start Test Runner');
}

function isAnalyticsRoute() {
  return /analytics/i.test(window.location.pathname) || /creator=/.test(window.location.search);
}

if (import.meta.env.DEV) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapAnalyticsTestRunner);
  } else {
    bootstrapAnalyticsTestRunner();
  }
}
