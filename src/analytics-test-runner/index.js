import {
  bindStartButton,
  ensureTestRunnerPanel,
  ensureLauncherButton,
  setTestRunnerPanelOpen,
  renderRunnerPanel,
  getSelectedTestCaseKey,
} from './ui/panel.js';
import { runAnalyticsTestCase } from './runAnalyticsTestCase.js';
import { runAnalyticsTestBatch } from './runAnalyticsTestBatch.js';
import { isBatchRunSelection } from './config/testCaseRegistry.js';
import { initPageBootGuard } from './refresh/verifyRefresh.js';
import router from '@/router/index.js';

let startHandlerBound = false;

export function isAnalyticsTestRunnerRoute(location = window.location) {
  const path = location.pathname || '';
  const search = location.search || '';
  return /analytics/i.test(path) || /creator=/.test(search);
}

function hideTestRunnerUi() {
  const launcher = document.querySelector('[data-analytics-test-runner-launcher]');
  const panel = document.querySelector('[data-analytics-test-runner]');
  if (launcher) launcher.hidden = true;
  if (panel) panel.hidden = true;
}

export function bootstrapAnalyticsTestRunner() {
  if (!import.meta.env.DEV) return;

  if (!isAnalyticsTestRunnerRoute()) {
    hideTestRunnerUi();
    return;
  }

  initPageBootGuard();
  ensureLauncherButton();
  ensureTestRunnerPanel();

  if (!startHandlerBound) {
    startHandlerBound = true;
    bindStartButton(async () => {
      setTestRunnerPanelOpen(true);
      try {
        const selected = getSelectedTestCaseKey();
        if (isBatchRunSelection(selected)) {
          await runAnalyticsTestBatch();
        } else {
          await runAnalyticsTestCase(selected);
        }
      } catch (error) {
        console.error('[AnalyticsTestRunner]', error);
      }
    });
  }

  setTestRunnerPanelOpen(false);
  renderRunnerPanel();
  console.info('[AnalyticsTestRunner] Ready — click the Test Runner button (bottom-right)');
}

export function registerAnalyticsTestRunnerNavigation(routerInstance = router) {
  if (!import.meta.env.DEV) return;

  routerInstance.afterEach(() => {
    bootstrapAnalyticsTestRunner();
  });
}

if (import.meta.env.DEV) {
  const runBootstrap = () => bootstrapAnalyticsTestRunner();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runBootstrap);
  } else {
    runBootstrap();
  }

  router.isReady().then(() => {
    registerAnalyticsTestRunnerNavigation();
    bootstrapAnalyticsTestRunner();
  });
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.bootstrapAnalyticsTestRunner = bootstrapAnalyticsTestRunner;
}
