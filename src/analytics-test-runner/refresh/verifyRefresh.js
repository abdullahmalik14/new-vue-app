import {
  scanCardValueByHeading,
  scanCardMetricByLabel,
} from '../scanners/domScanners.js';
import { getAnalyticsRefreshButton } from './trigger.js';
import { normalizeNumber } from '../utils/normalizeNumber.js';

let activeSessionMarker = null;

export function markRefreshSession() {
  activeSessionMarker = `analytics-test-${Date.now()}`;
  window.__analyticsTestRefreshSession = activeSessionMarker;
  return activeSessionMarker;
}

export function assertPageNotReloaded() {
  return window.__analyticsTestRefreshSession === activeSessionMarker;
}

function readMetric(result) {
  if (!result?.ok) return null;
  return normalizeNumber(result.foundValue);
}

/**
 * Snapshot key main-card values used for Step 10 refresh verification.
 */
export function captureMainAnalyticsSnapshot() {
  const earnings = scanCardValueByHeading('Earnings');
  const subscribers = scanCardValueByHeading('Subscribers');
  const newFollowers = scanCardMetricByLabel('Fans', 'NEW FOLLOWERS');
  const profileVisit = scanCardMetricByLabel('Fans', 'PROFILE VISIT');

  let subscribersNew = null;
  if (subscribers.ok && Array.isArray(subscribers.foundValue)) {
    subscribersNew =
      subscribers.foundValue.find((v) => /new/i.test(v.label))?.num ?? subscribers.foundValue[0]?.num ?? null;
  }

  return {
    capturedAt: new Date().toISOString(),
    earnings: readMetric(earnings),
    subscribersNew,
    newFollowers: readMetric(newFollowers),
    profileVisit: readMetric(profileVisit),
  };
}

/**
 * @param {string} testCaseKey
 * @param {Record<string, unknown>} chartsPayload
 */
export function readApiMetricForTestCase(testCaseKey, chartsPayload) {
  const readers = {
    newSubscription: () => normalizeNumber(chartsPayload?.earnings?.daily?.at(-1)?.total),
    recurringSubscription: () => normalizeNumber(chartsPayload?.earnings?.daily?.at(-1)?.total),
    merchOrder: () => normalizeNumber(chartsPayload?.earnings?.daily?.at(-1)?.merch),
    tokenOrder: () => normalizeNumber(chartsPayload?.earnings?.daily?.at(-1)?.tipTokens),
    follow: () => normalizeNumber(chartsPayload?.fanInsights?.daily?.at(-1)?.newFollowers),
    profileVisit: () => normalizeNumber(chartsPayload?.fanInsights?.daily?.at(-1)?.profileVisits),
    tagEngagement: () => {
      const tags = chartsPayload?.trendingTags?.daily;
      if (!Array.isArray(tags) || tags.length === 0) return null;
      return normalizeNumber(tags[0]?.views);
    },
    cancelSubscription: () => normalizeNumber(chartsPayload?.earnings?.daily?.at(-1)?.subscription),
  };

  const reader = readers[testCaseKey];
  return reader ? reader() : null;
}

/**
 * @param {{
 *   testCaseKey: string,
 *   baseline: ReturnType<typeof captureMainAnalyticsSnapshot>,
 *   beforeRefresh: ReturnType<typeof captureMainAnalyticsSnapshot>,
 *   afterRefresh: ReturnType<typeof captureMainAnalyticsSnapshot>,
 *   apiMetric: number|null,
 * }} input
 */
export function buildRefreshVerificationChecks(input) {
  const { testCaseKey, baseline, beforeRefresh, afterRefresh, apiMetric } = input;
  const checks = [];

  checks.push({
    id: 'step10.sessionAlive',
    label: 'Page did not reload',
    pass: assertPageNotReloaded(),
    message: assertPageNotReloaded()
      ? 'Session marker intact after refresh click'
      : 'Session marker lost — page may have reloaded',
  });

  const refreshButton = getAnalyticsRefreshButton();
  checks.push({
    id: 'step10.refreshButtonReady',
    label: 'Refresh button re-enabled',
    pass: Boolean(refreshButton && !refreshButton.disabled),
    message:
      refreshButton && !refreshButton.disabled
        ? 'Refresh completed without full page reload'
        : 'Refresh button still disabled or missing',
  });

  checks.push({
    id: 'step10.apiHasData',
    label: 'API has post-event data',
    pass: apiMetric != null && apiMetric > 0,
    message:
      apiMetric != null && apiMetric > 0
        ? `API metric for ${testCaseKey}: ${apiMetric}`
        : `API metric missing or zero for ${testCaseKey}`,
  });

  const domMetricKey = {
    newSubscription: 'earnings',
    recurringSubscription: 'earnings',
    merchOrder: 'earnings',
    tokenOrder: 'earnings',
    follow: 'newFollowers',
    profileVisit: 'profileVisit',
    tagEngagement: null,
    cancelSubscription: 'earnings',
  }[testCaseKey];

  if (domMetricKey) {
    const beforeVal = beforeRefresh[domMetricKey];
    const afterVal = afterRefresh[domMetricKey];
    const baselineVal = baseline[domMetricKey];
    const domUpdated = afterVal != null && (afterVal !== beforeVal || afterVal !== baselineVal);

    checks.push({
      id: 'step10.domUpdatedAfterRefresh',
      label: `DOM ${domMetricKey} updated after refresh`,
      pass: domUpdated,
      message: domUpdated
        ? `${domMetricKey}: baseline=${baselineVal}, beforeRefresh=${beforeVal}, afterRefresh=${afterVal}`
        : `${domMetricKey} unchanged after refresh (baseline=${baselineVal}, before=${beforeVal}, after=${afterVal})`,
    });
  } else {
    checks.push({
      id: 'step10.domUpdatedAfterRefresh',
      label: 'DOM refresh check',
      pass: true,
      message: `No main-card DOM metric mapped for ${testCaseKey} — API check only`,
    });
  }

  return checks;
}
