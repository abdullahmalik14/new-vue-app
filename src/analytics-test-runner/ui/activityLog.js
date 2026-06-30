import { analyticsTestState } from '../state.js';
import { renderRunnerPanel } from './panel.js';

export const RUNNER_STEPS = [
  { id: 'reset', label: 'Reset test data' },
  { id: 'trigger', label: 'Trigger live event' },
  { id: 'wait-backend', label: 'Waiting for backend processing' },
  { id: 'fetch-api', label: 'Fetch charts API' },
  { id: 'refresh', label: 'Waiting for Vue to refresh' },
  { id: 'validate', label: 'Validate payload contract' },
  { id: 'scan-main', label: 'Scanning main cards' },
  { id: 'scan-popups', label: 'Scanning all popups (day / week / month / year)' },
  { id: 'compare', label: 'Compare card expectations' },
  { id: 'done', label: 'Complete' },
];

/**
 * @param {string} stepId
 * @param {string} [detail]
 */
export function setRunnerStep(stepId, detail) {
  analyticsTestState.currentStepId = stepId;
  const step = RUNNER_STEPS.find((item) => item.id === stepId);
  analyticsTestState.status = detail || step?.label || stepId;
  logActivity(detail || step?.label || stepId, stepId);
  renderRunnerPanel();
}

/**
 * @param {string} message
 * @param {string} [stepId]
 */
export function logActivity(message, stepId) {
  analyticsTestState.activityLog.push({
    at: new Date().toISOString(),
    time: new Date().toLocaleTimeString(),
    stepId: stepId || analyticsTestState.currentStepId,
    message,
  });
  renderRunnerPanel();
}
