import { analyticsTestState } from '../state.js';
import { RUNNABLE_TEST_CASES, getDefaultTestCaseKey } from '../config/testCaseRegistry.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

export function ensureTestRunnerPanel() {
  let panel = document.querySelector('[data-analytics-test-runner]');
  if (panel) return panel;

  const optionsHtml = RUNNABLE_TEST_CASES.map(
    (item) => `<option value="${item.key}">${item.label}</option>`,
  ).join('');

  panel = el('section', 'analytics-test-runner-panel');
  panel.setAttribute('data-analytics-test-runner', 'true');
  panel.innerHTML = `
    <style>
      .analytics-test-runner-panel {
        position: fixed; right: 12px; bottom: 12px; z-index: 100000;
        width: min(520px, 95vw); max-height: 80vh; overflow: auto;
        background: #111; color: #f5f5f5; border: 1px solid #444; border-radius: 10px;
        padding: 12px; font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
        box-shadow: 0 8px 30px rgba(0,0,0,.35);
      }
      .analytics-test-runner-panel h2 { margin: 0 0 8px; font-size: 14px; }
      .analytics-test-runner-panel button,
      .analytics-test-runner-panel select { cursor: pointer; padding: 6px 10px; }
      .analytics-test-runner-panel .runner-controls { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; flex-wrap: wrap; }
      .analytics-test-runner-panel table { width: 100%; border-collapse: collapse; font-size: 11px; }
      .analytics-test-runner-panel th, .analytics-test-runner-panel td { border: 1px solid #333; padding: 4px; vertical-align: top; }
      .analytics-test-runner-panel .pass { color: #4ade80; }
      .analytics-test-runner-panel .fail { color: #f87171; }
      .analytics-test-runner-panel pre { white-space: pre-wrap; word-break: break-word; max-height: 180px; overflow: auto; }
    </style>
    <h2>Analytics Test Runner</h2>
    <div data-runner-status>Status: idle</div>
    <div class="runner-controls">
      <label>Test case
        <select data-test-case-select>${optionsHtml}</select>
      </label>
      <button type="button" data-start-runner>Start Test Runner</button>
    </div>
    <details open><summary>API Log</summary><pre data-api-log></pre></details>
    <details><summary>Sent Payloads</summary><pre data-sent-payloads></pre></details>
    <details open><summary>JSON Validation</summary><pre data-json-validation></pre></details>
    <details open><summary>Step 10 — Refresh Verification (creator 99999)</summary><div data-refresh-verification></div></details>
    <details open><summary>Comparison Table</summary><div data-comparison-table></div></details>
    <details><summary>Chart Debug JSON</summary><pre data-chart-debug-json></pre></details>
    <details><summary>Found Rows</summary><pre data-found-rows></pre></details>
  `;

  const select = panel.querySelector('[data-test-case-select]');
  select.value = getDefaultTestCaseKey();

  document.body.appendChild(panel);
  return panel;
}

export function renderRunnerPanel() {
  const panel = ensureTestRunnerPanel();
  const s = analyticsTestState;

  panel.querySelector('[data-runner-status]').textContent = `Status: ${s.status}`;
  panel.querySelector('[data-api-log]').textContent = JSON.stringify(s.apiLog, null, 2);
  panel.querySelector('[data-sent-payloads]').textContent = JSON.stringify(s.sentPayloads, null, 2);
  panel.querySelector('[data-json-validation]').textContent = JSON.stringify(s.validationResults, null, 2);
  panel.querySelector('[data-chart-debug-json]').textContent = JSON.stringify(s.chartSnapshots, null, 2);
  panel.querySelector('[data-found-rows]').textContent = JSON.stringify(s.foundRows, null, 2);

  const refreshHost = panel.querySelector('[data-refresh-verification]');
  if (refreshHost) {
    const rv = s.refreshVerification;
    if (!rv) {
      refreshHost.innerHTML = '<p>Refresh verification runs after event trigger (Step 10).</p>';
    } else {
      const checks = (rv.checks || [])
        .map((check) => {
          const cls = check.pass ? 'pass' : 'fail';
          return `<tr class="${cls}"><td>${escapeHtml(check.label)}</td><td>${check.pass ? 'PASS' : 'FAIL'}</td><td>${escapeHtml(check.message)}</td></tr>`;
        })
        .join('');
      refreshHost.innerHTML = `
        <p>Creator <strong>${rv.creatorId}</strong> · case <strong>${escapeHtml(rv.testCaseKey)}</strong></p>
        <table>
          <tr><th>Check</th><th>Result</th><th>Detail</th></tr>
          ${checks}
        </table>
        <details><summary>Snapshots</summary><pre>${escapeHtml(JSON.stringify({ baseline: rv.baseline, beforeRefresh: rv.beforeRefresh, afterRefresh: rv.afterRefresh, apiMetric: rv.apiMetric }, null, 2))}</pre></details>
      `;
    }
  }

  const select = panel.querySelector('[data-test-case-select]');
  if (s.activeTestCase) select.value = s.activeTestCase;

  const tableHost = panel.querySelector('[data-comparison-table]');
  const rows = s.comparisonRows;
  if (!rows.length) {
    tableHost.innerHTML = '<p>No comparisons yet.</p>';
    return;
  }

  const header = `<tr><th>View</th><th>Metric</th><th>Period</th><th>Expected</th><th>Found</th><th>Source</th><th>Pass/Fail</th></tr>`;
  const body = rows
    .map((row) => {
      const cls = row.pass ? 'pass' : 'fail';
      return `<tr class="${cls}">
        <td>${row.view}</td><td>${row.metric}</td><td>${row.period}</td>
        <td>${escapeHtml(JSON.stringify(row.expectedValue))}</td>
        <td>${escapeHtml(JSON.stringify(row.foundValue))}</td>
        <td>${row.source}</td>
        <td>${row.pass ? 'PASS' : 'FAIL'} — ${escapeHtml(row.message)}</td>
      </tr>`;
    })
    .join('');

  tableHost.innerHTML = `<table>${header}${body}</table>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function bindStartButton(onStart) {
  const panel = ensureTestRunnerPanel();
  const button = panel.querySelector('[data-start-runner]');
  button.onclick = onStart;
}

export function getSelectedTestCaseKey() {
  const panel = ensureTestRunnerPanel();
  const select = panel.querySelector('[data-test-case-select]');
  return select?.value || getDefaultTestCaseKey();
}
