import { analyticsTestState } from '../state.js';
import { DROPDOWN_TEST_OPTIONS, getDefaultTestCaseKey } from '../config/testCaseRegistry.js';
import { RUNNER_STEPS } from './activityLog.js';
import { initPanelResize } from './panelResize.js';

const PANEL_VERSION = '8';
let panelOpen = false;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function formatCellValue(value) {
  if (value == null) return '—';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value;
  return String(value);
}

function isDisplayRow() {
  return true;
}

function injectStyles() {
  const STYLE_VERSION = '8';
  let style = document.querySelector('[data-analytics-test-runner-styles]');
  if (style?.getAttribute('data-style-version') === STYLE_VERSION) return;
  if (style) style.remove();

  style = document.createElement('style');
  style.setAttribute('data-analytics-test-runner-styles', 'true');
  style.setAttribute('data-style-version', STYLE_VERSION);
  style.textContent = `
    .analytics-test-runner-launcher {
      position: fixed; right: 16px; bottom: 16px; z-index: 100001;
      display: flex; align-items: center; gap: 8px;
      padding: 12px 16px; border-radius: 999px;
      border: 1px solid #3b82f6; background: #2563eb; color: #fff;
      font: 600 13px/1 ui-sans-serif, system-ui, sans-serif;
      cursor: pointer; box-shadow: 0 8px 24px rgba(37, 99, 235, 0.45);
      animation: analytics-runner-float 3s ease-in-out infinite;
    }
    .analytics-test-runner-launcher:hover { background: #1d4ed8; }
    .analytics-test-runner-launcher[hidden] { display: none !important; }
    @keyframes analytics-runner-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    .analytics-test-runner-panel {
      position: fixed; right: 16px; bottom: 16px; z-index: 100000;
      background: #0f1117; color: #e8eaed; border: 1px solid #3a3f4b;
      border-radius: 12px; padding: 12px;
      font: 13px/1.45 ui-sans-serif, system-ui, -apple-system, sans-serif;
      box-shadow: 0 12px 40px rgba(0,0,0,.4);
      display: flex; flex-direction: column; gap: 10px;
      overflow: hidden;
    }
    .runner-resize-handle {
      position: absolute; top: 6px; left: 6px; width: 14px; height: 14px;
      cursor: nwse-resize; border-radius: 3px;
      border-top: 2px solid #64748b; border-left: 2px solid #64748b;
      opacity: 0.7;
    }
    .runner-resize-handle:hover { opacity: 1; border-color: #93c5fd; }
    .runner-panel-scroll {
      flex: 1; min-height: 280px; overflow: hidden;
      display: flex; flex-direction: column; gap: 10px;
    }
    .analytics-test-runner-panel[hidden] { display: none !important; }
    .analytics-test-runner-panel * { box-sizing: border-box; }
    .analytics-test-runner-panel h2 { margin: 0; font-size: 16px; font-weight: 600; }
    .runner-header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 10px; flex-wrap: wrap; flex-shrink: 0;
    }
    .runner-header-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .runner-controls { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .runner-controls button, .runner-controls select, .runner-header-actions button {
      cursor: pointer; padding: 6px 10px; border-radius: 8px;
      border: 1px solid #4b5563; background: #1f2937; color: #f9fafb;
      font-size: 12px;
    }
    .runner-controls button[data-start-runner] { background: #2563eb; border-color: #3b82f6; font-weight: 600; }
    .runner-pause-toggle { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #d1d5db; }
    .runner-pause-toggle input { margin: 0; }
    .runner-controls button[data-close-runner] { background: transparent; }
    .runner-body {
      display: grid; grid-template-columns: 1fr 1.2fr; gap: 12px;
      flex: 1; min-height: 320px; overflow: hidden;
    }
    @media (max-width: 900px) { .runner-body { grid-template-columns: 1fr; } }
    .runner-col {
      display: flex; flex-direction: column; gap: 8px;
      min-height: 280px; overflow: hidden;
    }
    .runner-col-left {
      overflow-y: auto; overflow-x: hidden;
      padding-right: 4px;
    }
    .runner-col-right {
      min-height: 320px;
    }
    .runner-col h3 {
      margin: 0; font-size: 13px; font-weight: 600; color: #cbd5e1;
      flex-shrink: 0;
    }
    .runner-current-step {
      padding: 10px 12px; border-radius: 8px; background: #1e293b;
      border: 1px solid #334155; font-size: 13px; font-weight: 600;
      flex-shrink: 0; min-height: 42px;
    }
    .runner-current-step[data-running="true"] { border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f680; }
    .runner-step-track { display: flex; flex-wrap: wrap; gap: 4px; flex-shrink: 0; min-height: 28px; }
    .runner-step-pill {
      padding: 3px 8px; border-radius: 999px; font-size: 10px;
      border: 1px solid #374151; color: #9ca3af; background: #111827;
    }
    .runner-step-pill.active { border-color: #3b82f6; color: #93c5fd; background: #172554; }
    .runner-step-pill.done { border-color: #166534; color: #86efac; background: #052e16; }
    .runner-log, .runner-api-log {
      flex: 0 0 auto;
      min-height: 88px; max-height: 140px;
      overflow: auto; border: 1px solid #374151;
      border-radius: 8px; background: #0b0f14; padding: 6px;
      font: 11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .runner-api-log { min-height: 64px; max-height: 100px; }
    .runner-log-entry { padding: 3px 0; border-bottom: 1px solid #1f2937; }
    .runner-log-entry .time { color: #6b7280; margin-right: 6px; }
    .runner-expectations {
      flex: 1 1 auto; min-height: 240px;
      overflow: auto; border: 1px solid #374151; border-radius: 8px;
    }
    .analytics-test-runner-panel table { width: 100%; border-collapse: collapse; font-size: 11px; }
    .analytics-test-runner-panel th {
      position: sticky; top: 0; background: #1f2937; z-index: 1;
      text-align: left; padding: 6px; border-bottom: 1px solid #374151;
    }
    .analytics-test-runner-panel td { padding: 6px; border-bottom: 1px solid #1f2937; vertical-align: top; }
    .analytics-test-runner-panel tr.pass td:last-child { color: #4ade80; }
    .analytics-test-runner-panel tr.fail td:last-child { color: #f87171; }
    .analytics-test-runner-panel tr.pending td { color: #9ca3af; }
    .runner-refresh-block {
      font-size: 11px; color: #cbd5e1;
      flex-shrink: 0; min-height: 52px;
    }
    .runner-refresh-block:empty { min-height: 0; }
    .runner-refresh-block table { margin-top: 4px; }
    .runner-debug-block {
      font: 10px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace;
      border: 1px solid #374151; border-radius: 8px; background: #0b0f14;
      padding: 6px; min-height: 72px; max-height: 120px;
      overflow: auto; color: #cbd5e1;
      white-space: pre-wrap; word-break: break-word;
      flex-shrink: 0;
    }
    .runner-debug-block:empty { display: none; min-height: 0; }
    .runner-debug-title {
      margin: 6px 0 4px; font-size: 11px; font-weight: 600; color: #94a3b8;
      flex-shrink: 0;
    }
  `;
  document.head.appendChild(style);
}

export function ensureLauncherButton() {
  injectStyles();
  let launcher = document.querySelector('[data-analytics-test-runner-launcher]');
  if (launcher) return launcher;

  launcher = el('button', 'analytics-test-runner-launcher');
  launcher.type = 'button';
  launcher.setAttribute('data-analytics-test-runner-launcher', 'true');
  launcher.setAttribute('aria-label', 'Open analytics test runner');
  launcher.innerHTML = '<span>🧪</span><span>Test Runner</span>';
  launcher.addEventListener('click', () => setTestRunnerPanelOpen(true));
  document.body.appendChild(launcher);
  return launcher;
}

export function setTestRunnerPanelOpen(open) {
  panelOpen = open;
  const panel = document.querySelector('[data-analytics-test-runner]');
  const launcher = document.querySelector('[data-analytics-test-runner-launcher]');
  if (panel) panel.hidden = !open;
  if (launcher) launcher.hidden = open;
}

export function isTestRunnerPanelOpen() {
  return panelOpen;
}

export function ensureTestRunnerPanel() {
  injectStyles();
  let panel = document.querySelector('[data-analytics-test-runner]');
  if (panel && panel.getAttribute('data-runner-version') === PANEL_VERSION) return panel;
  if (panel) panel.remove();

  const optionsHtml = DROPDOWN_TEST_OPTIONS.map(
    (item) => `<option value="${item.key}">${item.label}</option>`,
  ).join('');

  panel = el('section', 'analytics-test-runner-panel');
  panel.setAttribute('data-analytics-test-runner', 'true');
  panel.setAttribute('data-runner-version', PANEL_VERSION);
  panel.hidden = true;
  panel.style.position = 'fixed';
  panel.innerHTML = `
    <div class="runner-resize-handle" data-resize-handle title="Drag to resize"></div>
    <div class="runner-header">
      <h2>Analytics Test Runner · creator 99999</h2>
      <div class="runner-header-actions">
        <div class="runner-controls">
          <label>Test case <select data-test-case-select>${optionsHtml}</select></label>
          <label class="runner-pause-toggle"><input type="checkbox" data-pause-dom-scan /> Pause before each DOM scan</label>
          <button type="button" data-start-runner>Start Test Runner</button>
        </div>
        <button type="button" data-close-runner title="Minimize">✕</button>
      </div>
    </div>

    <div class="runner-panel-scroll">
    <div class="runner-body">
      <div class="runner-col runner-col-left">
        <h3>Progress &amp; log</h3>
        <div class="runner-current-step" data-current-step>Idle</div>
        <div class="runner-step-track" data-step-track></div>
        <div class="runner-refresh-block" data-refresh-verification></div>
        <div class="runner-batch-block" data-batch-summary></div>
        <div class="runner-log" data-activity-log></div>
        <h3>API log</h3>
        <div class="runner-api-log" data-api-log></div>
        <div class="runner-debug-title">Payload sent</div>
        <div class="runner-debug-block" data-sent-payloads></div>
        <div class="runner-debug-title">JSON validation</div>
        <div class="runner-debug-block" data-validation-summary></div>
        <div class="runner-debug-title">Chart debug (last snapshot)</div>
        <div class="runner-debug-block" data-chart-debug></div>
      </div>

      <div class="runner-col runner-col-right">
        <h3>Expectations (config + API vs DOM)</h3>
        <div class="runner-expectations" data-expectation-table></div>
      </div>
    </div>
    </div>
  `;

  const select = panel.querySelector('[data-test-case-select]');
  select.value = getDefaultTestCaseKey();
  const pauseCheckbox = panel.querySelector('[data-pause-dom-scan]');
  pauseCheckbox.checked = analyticsTestState.pauseDomScanBeforeEachStep;
  pauseCheckbox.addEventListener('change', () => {
    analyticsTestState.pauseDomScanBeforeEachStep = pauseCheckbox.checked;
  });
  panel.querySelector('[data-close-runner]').addEventListener('click', () => setTestRunnerPanelOpen(false));
  document.body.appendChild(panel);
  initPanelResize(panel);
  return panel;
}

function renderStepTrack(panel, currentStepId, status) {
  const host = panel.querySelector('[data-step-track]');
  const currentIndex = RUNNER_STEPS.findIndex((step) => step.id === currentStepId);

  host.innerHTML = RUNNER_STEPS.map((step, index) => {
    let cls = 'runner-step-pill';
    if (step.id === currentStepId) cls += ' active';
    else if (currentIndex > index || currentStepId === 'done') cls += ' done';
    return `<span class="${cls}">${step.label}</span>`;
  }).join('');

  const currentEl = panel.querySelector('[data-current-step]');
  const running = currentStepId && currentStepId !== 'done' && !String(status).startsWith('Completed');
  currentEl.textContent = status || 'Idle';
  currentEl.setAttribute('data-running', running ? 'true' : 'false');
}

function renderExpectationTable(panel, state) {
  const host = panel.querySelector('[data-expectation-table]');
  const expected = state.expectedRows.filter(isDisplayRow);
  const comparisons = state.comparisonRows.filter(isDisplayRow);
  const comparisonById = new Map(comparisons.map((row) => [row.expectedId, row]));

  if (!expected.length) {
    host.innerHTML = '<p style="padding:12px;color:#9ca3af">Expectations appear when a test starts.</p>';
    return;
  }

  const header = `<tr>
    <th>Type</th><th>Location</th><th>Period</th><th>Field</th><th>API</th><th>DOM</th><th>Result</th>
  </tr>`;

  const body = expected
    .map((row) => {
      const result = comparisonById.get(row.id);
      const typeLabel = row.valueKind === 'chart' ? 'Chart' : 'Singular';
      const location = row.location || row.view;
      if (!result) {
        return `<tr class="pending">
          <td>${typeLabel}</td>
          <td>${escapeHtml(location)}</td>
          <td>${escapeHtml(row.period)}</td>
          <td>${escapeHtml(row.metric)}</td>
          <td>${escapeHtml(formatCellValue(row.expectedValue))}</td>
          <td>—</td>
          <td>pending</td>
        </tr>`;
      }
      const cls = result.pass ? 'pass' : result.knownGap ? 'pending' : 'fail';
      const gapNote = result.knownGap ? ' (known gap)' : '';
      return `<tr class="${cls}">
        <td>${typeLabel}</td>
        <td>${escapeHtml(location)}</td>
        <td>${escapeHtml(row.period)}</td>
        <td>${escapeHtml(row.metric)}</td>
        <td title="${escapeHtml(row.apiPath || '')}">${escapeHtml(formatCellValue(result.expectedValue))}</td>
        <td>${escapeHtml(formatCellValue(result.foundValue))}</td>
        <td>${result.pass ? 'PASS' : result.knownGap ? 'GAP' : 'FAIL'}${gapNote} — ${escapeHtml(result.message)}</td>
      </tr>`;
    })
    .join('');

  host.innerHTML = `<table>${header}${body}</table>`;
}

export function renderRunnerPanel() {
  const panel = ensureTestRunnerPanel();
  const s = analyticsTestState;

  renderStepTrack(panel, s.currentStepId, s.status);

  const logHost = panel.querySelector('[data-activity-log]');
  logHost.innerHTML = (s.activityLog || [])
    .map(
      (entry) =>
        `<div class="runner-log-entry"><span class="time">${escapeHtml(entry.time)}</span>${escapeHtml(entry.message)}</div>`,
    )
    .join('');
  logHost.scrollTop = logHost.scrollHeight;

  const apiHost = panel.querySelector('[data-api-log]');
  apiHost.textContent = (s.apiLog || [])
    .map((entry) => {
      const status = entry.ok ? 'OK' : 'FAIL';
      return `[${entry.at}] ${status} ${entry.method} ${entry.name} → ${entry.status} (${entry.durationMs}ms)`;
    })
    .join('\n');
  apiHost.scrollTop = apiHost.scrollHeight;

  const payloadHost = panel.querySelector('[data-sent-payloads]');
  payloadHost.textContent = (s.sentPayloads || [])
    .map((entry) => `[${entry.at}] ${entry.step}\n${JSON.stringify(entry.payload, null, 2)}`)
    .join('\n\n');

  const validationHost = panel.querySelector('[data-validation-summary]');
  const vr = s.validationResults;
  if (!vr?.results?.length) {
    validationHost.textContent = vr?.summary
      ? `PASS — no contract issues (${vr.summary.total} checks)`
      : '';
  } else {
    validationHost.textContent = [
      `FAIL ${vr.summary?.fail ?? 0} · WARN ${vr.summary?.warn ?? 0}`,
      ...vr.results.map((r) => `${r.severity} ${r.path}: ${r.message}`),
    ].join('\n');
  }

  const chartHost = panel.querySelector('[data-chart-debug]');
  const lastSnapshot = s.chartSnapshots?.[s.chartSnapshots.length - 1];
  if (lastSnapshot?.charts?.length) {
    const slim = lastSnapshot.charts.map((chart) => ({
      chartId: chart.chartId,
      visible: chart.visible,
      series: chart.series?.map((s) => ({
        name: s.seriesName,
        rowCount: (s.renderedData?.length || s.rawData?.length || 0),
        sample: (s.renderedData?.length ? s.renderedData : s.rawData)?.slice(-3),
      })),
    }));
    chartHost.textContent = JSON.stringify(slim, null, 2);
  } else {
    chartHost.textContent = '';
  }

  const refreshHost = panel.querySelector('[data-refresh-verification]');
  const rv = s.refreshVerification;
  if (!rv) {
    refreshHost.innerHTML = '';
  } else {
    const checks = (rv.checks || [])
      .map((check) => {
        const cls = check.pass ? 'pass' : 'fail';
        return `<tr class="${cls}"><td>${escapeHtml(check.label)}</td><td>${check.pass ? 'PASS' : 'FAIL'}</td></tr>`;
      })
      .join('');
    refreshHost.innerHTML = `<strong>Refresh verification</strong><table><tr><th>Check</th><th>Result</th></tr>${checks}</table>`;
  }

  const batchHost = panel.querySelector('[data-batch-summary]');
  if (!s.batchResults?.length) {
    batchHost.innerHTML = '';
  } else {
    const passed = s.batchResults.filter((r) => r.pass).length;
    const rows = s.batchResults
      .map((row) => {
        const cls = row.pass ? 'pass' : 'fail';
        const detail =
          row.comparisonFailed != null
            ? `${row.comparisonFailed} comparison · ${row.refreshFailed ?? 0} refresh`
            : escapeHtml(row.errors?.[0] || 'error');
        return `<tr class="${cls}"><td>${escapeHtml(row.label)}</td><td>${row.pass ? 'PASS' : 'FAIL'}</td><td>${detail}</td></tr>`;
      })
      .join('');
    batchHost.innerHTML = `<strong>Batch summary (${passed}/${s.batchResults.length} passed)</strong><table><tr><th>Case</th><th>Result</th><th>Detail</th></tr>${rows}</table>`;
  }

  const select = panel.querySelector('[data-test-case-select]');
  if (s.activeTestCase) select.value = s.activeTestCase;
  const pauseCheckbox = panel.querySelector('[data-pause-dom-scan]');
  if (pauseCheckbox) pauseCheckbox.checked = !!s.pauseDomScanBeforeEachStep;

  renderExpectationTable(panel, s);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function bindStartButton(onStart) {
  const panel = ensureTestRunnerPanel();
  panel.querySelector('[data-start-runner]').onclick = onStart;
}

export function getSelectedTestCaseKey() {
  const panel = ensureTestRunnerPanel();
  return panel.querySelector('[data-test-case-select]')?.value || getDefaultTestCaseKey();
}
