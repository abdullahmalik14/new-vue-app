import {
  scanCardValueByHeading,
  scanCardMetricByLabel,
} from '../scanners/domScanners.js';
import { getAnalyticsRefreshButton, isRefreshButtonReady } from './trigger.js';
import { normalizeNumber } from '../utils/normalizeNumber.js';
import { EVENT_EXPECTATIONS } from '../config/eventExpectations.js';
import { resolveRefreshExpectationFromState, resolveRefreshApiExpectationFromState } from '../config/stateMetricResolver.js';
import { readApiFoundValue } from '../config/hydrateApiRow.js';

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
  const likesMedia = scanCardMetricByLabel('Likes', 'MEDIA');
  const likesProfile = scanCardMetricByLabel('Likes', 'PROFILE');
  const likesMerch = scanCardMetricByLabel('Likes', 'MERCH');
  const likesFeed = scanCardMetricByLabel('Likes', 'FEED');

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
    likesMedia: readMetric(likesMedia),
    likesProfile: readMetric(likesProfile),
    likesMerch: readMetric(likesMerch),
    likesFeed: readMetric(likesFeed),
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
    switchSubscription: () => normalizeNumber(chartsPayload?.subscriptions?.daily?.at(-1)?.newSubscriber),
    unfollow: () => normalizeNumber(chartsPayload?.fanInsights?.daily?.at(-1)?.newFollowers),
    mediaLike: () => normalizeNumber(chartsPayload?.likes?.daily?.at(-1)?.media),
    mediaUnlike: () => normalizeNumber(chartsPayload?.likes?.daily?.at(-1)?.media),
    profileLike: () => normalizeNumber(chartsPayload?.likes?.daily?.at(-1)?.profile),
    profileUnlike: () => normalizeNumber(chartsPayload?.likes?.daily?.at(-1)?.profile),
    merchLike: () => normalizeNumber(chartsPayload?.likes?.daily?.at(-1)?.merch),
    merchUnlike: () => normalizeNumber(chartsPayload?.likes?.daily?.at(-1)?.merch),
    feedLike: () => normalizeNumber(chartsPayload?.likes?.daily?.at(-1)?.feed),
    feedUnlike: () => normalizeNumber(chartsPayload?.likes?.daily?.at(-1)?.feed),
    p2vOrder: () => normalizeNumber(chartsPayload?.earnings?.daily?.at(-1)?.paytoview),
    mediaView: () => {
      const mediaId = 5117;
      const arr = chartsPayload?.trendingsMedia?.daily;
      const match = Array.isArray(arr) ? arr.find((m) => Number(m.mediaId) === mediaId) : null;
      return normalizeNumber(match?.views);
    },
    mediaWatchDuration: () => {
      const mediaId = 2811;
      const arr = chartsPayload?.trendingsMedia?.daily;
      const match = Array.isArray(arr) ? arr.find((m) => Number(m.mediaId) === mediaId) : null;
      return normalizeNumber(match?.watchDurationSec);
    },
  };

  const reader = readers[testCaseKey];
  return reader ? reader() : null;
}

export function buildRefreshVerificationChecks(input) {
  const { testCaseKey, afterRefresh, apiMetric, expectationState } = input;
  const checks = [];
  const pageOk = assertPageNotReloaded();
  const expectedInternal = expectationState
    ? resolveRefreshExpectationFromState(testCaseKey, expectationState)
    : null;
  const expectedApiInternal = expectationState
    ? resolveRefreshApiExpectationFromState(testCaseKey, expectationState)
    : null;

  const domMetricKey = {
    newSubscription: 'subscribersNew',
    recurringSubscription: 'earnings',
    switchSubscription: 'subscribersNew',
    merchOrder: 'earnings',
    p2vOrder: 'earnings',
    follow: 'newFollowers',
    unfollow: 'newFollowers',
    profileVisit: 'profileVisit',
    cancelSubscription: 'earnings',
    mediaLike: 'likesMedia',
    mediaUnlike: 'likesMedia',
    profileLike: 'likesProfile',
    profileUnlike: 'likesProfile',
    merchLike: 'likesMerch',
    merchUnlike: 'likesMerch',
    feedLike: 'likesFeed',
    feedUnlike: 'likesFeed',
  }[testCaseKey];

  const isBlocked = EVENT_EXPECTATIONS[testCaseKey]?.gapStatus === 'blocked';

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
    pass: isBlocked ? true : apiMetric != null && Number(apiMetric) !== 0,
    message: isBlocked
      ? `Skipped — ${testCaseKey} trigger is known blocked`
      : apiMetric != null && Number(apiMetric) !== 0
        ? `API metric for ${testCaseKey}: ${apiMetric}`
        : `API metric missing or zero for ${testCaseKey}`,
  });

  if (domMetricKey && expectedInternal != null) {
    const domMatchesInternal =
      afterDom != null && Math.abs(Number(afterDom) - Number(expectedInternal)) <= 0.01;

    const apiMatchesInternal =
      apiMetric != null &&
      expectedApiInternal != null &&
      Math.abs(Number(apiMetric) - Number(expectedApiInternal)) <= 0.01;

    checks.push({
      id: 'step10.domUpdatedAfterRefresh',
      label: 'DOM reflects internal expectation after refresh',
      pass: domMatchesInternal,
      message: domMatchesInternal
        ? `DOM ${afterDom} matches internal ${expectedInternal}`
        : `DOM ${afterDom ?? '—'} does not match internal ${expectedInternal}`,
    });

    checks.push({
      id: 'step10.apiMatchesInternal',
      label: 'API reflects internal expectation',
      pass: isBlocked ? true : apiMatchesInternal,
      message: isBlocked
        ? `Skipped — ${testCaseKey} trigger is known blocked`
        : apiMatchesInternal
          ? `API ${apiMetric} matches internal ${expectedApiInternal}`
          : `API ${apiMetric ?? '—'} does not match internal ${expectedApiInternal ?? '—'}`,
    });
  }

  return checks;
}
