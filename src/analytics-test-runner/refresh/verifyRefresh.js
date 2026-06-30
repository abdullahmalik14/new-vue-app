import {
  scanCardValueByHeading,
  scanCardMetricByLabel,
} from '../scanners/domScanners.js';
import { getAnalyticsRefreshButton, isRefreshButtonReady } from './trigger.js';
import { normalizeNumber } from '../utils/normalizeNumber.js';
import {
  mapChartsPayloadToUiState,
  resolveRefreshDomExpectation,
} from '../config/uiExpectationResolver.js';

const BOOT_KEY = 'analytics-test-runner-boot-id';
let refreshBootId = null;

export function initPageBootGuard() {
  let bootId = sessionStorage.getItem(BOOT_KEY);
  if (!bootId) {
    bootId = `boot-${Date.now()}`;
    sessionStorage.setItem(BOOT_KEY, bootId);
  }
  return bootId;
}

export function markRefreshSession() {
  refreshBootId = sessionStorage.getItem(BOOT_KEY) || initPageBootGuard();
  window.__analyticsTestRefreshSession = refreshBootId;
  return refreshBootId;
}

export function assertPageNotReloaded() {
  const currentBoot = sessionStorage.getItem(BOOT_KEY);
  if (!refreshBootId || currentBoot !== refreshBootId) {
    return false;
  }
  return window.__analyticsTestRefreshSession === refreshBootId;
}

function readMetric(result) {
  if (!result?.ok) return null;
  return normalizeNumber(result.foundValue);
}

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

export function buildRefreshVerificationChecks(input) {
  const { testCaseKey, afterRefresh, apiMetric, chartsPayload } = input;
  const checks = [];
  const pageOk = assertPageNotReloaded();
  const mapped = chartsPayload ? mapChartsPayloadToUiState(chartsPayload) : null;
  const expectedDom = mapped ? resolveRefreshDomExpectation(testCaseKey, mapped) : null;

  const domMetricKey = {
    newSubscription: 'subscribersNew',
    recurringSubscription: 'subscribersNew',
    merchOrder: 'earnings',
    tokenOrder: 'earnings',
    follow: 'newFollowers',
    profileVisit: 'profileVisit',
    cancelSubscription: 'earnings',
  }[testCaseKey];

  const afterDom =
    domMetricKey === 'subscribersNew'
      ? afterRefresh.subscribersNew ?? afterRefresh.earnings
      : afterRefresh[domMetricKey];

  checks.push({
    id: 'step10.sessionAlive',
    label: 'Page did not reload (boot id + navigation)',
    pass: pageOk,
    message: pageOk
      ? 'No full page reload detected after Refresh click'
      : 'FULL PAGE RELOAD detected — Refresh must update Vue in-place only',
  });

  const refreshButton = getAnalyticsRefreshButton();
  checks.push({
    id: 'step10.refreshButtonReady',
    label: 'Refresh button re-enabled',
    pass: isRefreshButtonReady(refreshButton),
    message:
      isRefreshButtonReady(refreshButton)
        ? 'Refresh completed in-place'
        : 'Refresh button still disabled or missing',
  });

  checks.push({
    id: 'step10.apiHasData',
    label: 'HTTP /api/charts has post-event data',
    pass: apiMetric != null && apiMetric > 0,
    message:
      apiMetric != null && apiMetric > 0
        ? `API metric for ${testCaseKey}: ${apiMetric}`
        : `API metric missing or zero for ${testCaseKey}`,
  });

  if (domMetricKey) {
    const domMatchesApi =
      afterDom != null &&
      expectedDom != null &&
      Math.abs(Number(afterDom) - Number(expectedDom)) <= 0.01;

    checks.push({
      id: 'step10.domUpdatedAfterRefresh',
      label: `DOM reflects post-event API after refresh`,
      pass: domMatchesApi,
      message: domMatchesApi
        ? `DOM ${afterDom} matches UI-expected ${expectedDom} (API metric ${apiMetric})`
        : `DOM ${afterDom ?? '—'} does not match UI-expected ${expectedDom ?? '—'} (API metric ${apiMetric})`,
    });
  }

  return checks;
}
