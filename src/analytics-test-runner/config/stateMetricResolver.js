import { calculatePeriodChangePercent } from '@/services/analytics/mappers/analyticsResponseMapper.js';
import { mapAnalyticsBundleResponse } from '@/services/analytics/mappers/analyticsResponseMapper.js';
import { analyticsCountryCodeToDisplayName } from '@/systems/analytics/analyticsCountryLabels.js';
import { projectStateToChartPaths } from './expectationState.js';
import { PERIOD_API_KEY } from './buildExpectationsFromApi.js';

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function getPathValue(payload, path) {
  return path.split('.').reduce((acc, key) => {
    if (acc == null) return undefined;
    if (key === '-1' && Array.isArray(acc)) return acc[acc.length - 1];
    const bracket = key.match(/^\[([^=]+)=([^\]]+)\]$/);
    if (bracket && Array.isArray(acc)) {
      const [, matchKey, matchValue] = bracket;
      return acc.find((item) => String(item?.[matchKey]) === String(matchValue));
    }
    return acc[key];
  }, payload);
}

export function getProjectedPayload(state) {
  return projectStateToChartPaths(state);
}

export function getMappedUiState(state) {
  return mapAnalyticsBundleResponse(projectStateToChartPaths(state)) || {};
}

export function resolveTrendingCountryDisplayName(countryId) {
  const code = `Country ${countryId}`;
  return analyticsCountryCodeToDisplayName[code] || code;
}

export function getStateMetric(state, apiPath, { period = 'day', countryId, mediaId, tagId } = {}) {
  const projected = projectStateToChartPaths(state);
  const mapped = mapAnalyticsBundleResponse(projected) || {};

  if (apiPath === 'ui.subscriberInsights.daily.new') {
    const bundle = mapped.subscriptionsBundle || {};
    const daily = bundle.daily || [];
    const last = daily[daily.length - 1] || {};
    return last.sub ?? (daily.length > 0 ? 0 : null);
  }
  if (apiPath === 'ui.subscriberInsights.daily.recurring') {
    const bundle = mapped.subscriptionsBundle || {};
    const daily = bundle.daily || [];
    const last = daily[daily.length - 1] || {};
    return last.tip ?? (daily.length > 0 ? 0 : null);
  }
  if (apiPath === 'ui.earningsInsights.daily.total') {
    return lastEarningsField(projected, 'total', period);
  }
  if (apiPath.startsWith('ui.earningsPopup.') || apiPath.startsWith('ui.earningsChart.')) {
    const parts = apiPath.split('.');
    const periodKey = parts[2];
    const field = parts[3];
    if (field === 'totalTokens') {
      return lastEarningsField(projected, 'totalTokens', periodKeyToUi(periodKey));
    }
    return lastEarningsField(projected, field, periodKeyToUi(periodKey));
  }
  if (apiPath.startsWith('ui.subsChart.')) {
    const parts = apiPath.split('.');
    const periodKey = parts[2];
    const field = parts[3];
    const mappedField = field === 'newSubscriber' ? 'sub' : field === 'recurringSubscriber' ? 'tip' : field;
    return lastSubField(mapped, mappedField, periodKeyToUi(periodKey));
  }
  if (apiPath.startsWith('ui.fans.')) {
    const parts = apiPath.split('.');
    const periodKey = parts[2];
    const field = parts[3];
    if (field === 'profileVisit') {
      return lastFanField(projected, 'profileVisits', periodKeyToUi(periodKey));
    }
    return lastFanField(projected, field, periodKeyToUi(periodKey));
  }
  if (apiPath.startsWith('ui.likes.')) {
    const field = apiPath.split('.').pop();
    return mapped.likes?.[field] ?? null;
  }
  if (apiPath.startsWith('trendingCountries.')) {
    const periodKey = apiPath.split('.')[1];
    const id = countryId ?? extractCountryFromPath(apiPath);
    return resolveTrendingCountrySalesFromProjected(projected, periodKeyToUi(periodKey), id);
  }
  if (apiPath.includes('contributors.topContributors')) {
    const field = apiPath.endsWith('.name') ? 'name' : 'usdSpent';
    const arr = projected.contributors?.topContributors?.alltime || [];
    const row = arr[0];
    if (!row) return null;
    return field === 'name' ? row.name : row.usdSpent;
  }
  if (apiPath.includes('trendingTags')) {
    const arr = projected.trendingTags?.daily || [];
    const match = arr.find((t) => String(t.tag).includes(String(tagId)));
    return match?.views ?? null;
  }
  if (apiPath.includes('trendingsMedia')) {
    const arr = projected.trendingsMedia?.daily || [];
    const id = mediaId ?? extractMediaFromPath(apiPath);
    const match = arr.find((m) => Number(m.mediaId) === Number(id));
    if (apiPath.includes('views')) return match?.views ?? null;
    if (apiPath.includes('watchDuration')) return match?.watchDurationSec ?? null;
    if (apiPath.includes('ppvSales')) return match?.ppvSalesUSD ?? null;
  }
  if (apiPath.includes('trendingMerch')) {
    const arr = projected.trendingMerch?.daily || [];
    return arr.length > 0 ? arr.length : null;
  }

  return getPathValue(projected, apiPath);
}

function periodKeyToUi(periodKey) {
  const map = { daily: 'day', weekly: 'week', monthly: 'month', yearly: 'year', alltime: 'alltime' };
  return map[periodKey] || periodKey;
}

function periodToApiKey(period) {
  return PERIOD_API_KEY[period] || period;
}

function lastEarningsField(projected, field, period) {
  const key = periodToApiKey(period);
  const arr = projected.earnings?.[key] || [];
  const last = arr[arr.length - 1] || {};
  return last[field] ?? (arr.length > 0 ? 0 : null);
}

function lastSubField(mapped, field, period) {
  const key = periodToApiKey(period);
  const bundle = mapped.subscriptionsBundle || {};
  const arr = bundle[key] || [];
  const last = arr[arr.length - 1] || {};
  return last[field] ?? (arr.length > 0 ? 0 : null);
}

function lastFanField(projected, field, period) {
  const key = periodToApiKey(period);
  const arr = projected.fanInsights?.[key] || [];
  const last = arr[arr.length - 1] || {};
  return last[field] ?? (arr.length > 0 ? 0 : null);
}

function resolveTrendingCountrySalesFromProjected(projected, period, countryId) {
  const key = periodToApiKey(period);
  const arr = projected.trendingCountries?.[key] || [];
  const code = `Country ${countryId}`;
  const row = arr.find((item) => item?.country === code || String(item?.countryId) === String(countryId));
  return row?.salesUSD ?? null;
}

function extractCountryFromPath(path) {
  const m = path.match(/country=(\d+)/);
  return m ? Number(m[1]) : undefined;
}

function extractMediaFromPath(path) {
  const m = path.match(/mediaId=(\d+)/);
  return m ? Number(m[1]) : undefined;
}

export function resolveMainSubscribersNewFromState(state) {
  return getStateMetric(state, 'ui.subscriberInsights.daily.new');
}

export function resolveMainEarningsTotalFromState(state) {
  return getStateMetric(state, 'ui.earningsInsights.daily.total');
}

export function resolveRefreshApiExpectationFromState(testCaseKey, state) {
  switch (testCaseKey) {
    case 'newSubscription':
    case 'recurringSubscription':
    case 'switchSubscription':
    case 'merchOrder':
    case 'p2vOrder':
    case 'cancelSubscription':
      return resolveMainEarningsTotalFromState(state);
    case 'tokenOrder':
      return getStateMetric(state, 'ui.earningsPopup.daily.totalTokens', { period: 'day' });
    case 'follow':
    case 'unfollow':
      return getStateMetric(state, 'ui.fans.daily.newFollowers', { period: 'day' });
    case 'profileVisit':
      return getStateMetric(state, 'ui.fans.daily.profileVisit', { period: 'day' });
    default:
      return resolveMainEarningsTotalFromState(state);
  }
}
export function resolveRefreshExpectationFromState(testCaseKey, state) {
  switch (testCaseKey) {
    case 'newSubscription':
    case 'switchSubscription':
      return resolveMainSubscribersNewFromState(state) ?? resolveMainEarningsTotalFromState(state);
    case 'recurringSubscription':
      return getStateMetric(state, 'ui.subscriberInsights.daily.recurring') ?? resolveMainEarningsTotalFromState(state);
    case 'merchOrder':
    case 'p2vOrder':
    case 'cancelSubscription':
      return resolveMainEarningsTotalFromState(state);
    case 'tokenOrder':
      return getStateMetric(state, 'ui.earningsPopup.daily.totalTokens', { period: 'day' });
    case 'follow':
    case 'unfollow':
      return getStateMetric(state, 'ui.fans.daily.newFollowers', { period: 'day' });
    case 'profileVisit':
      return getStateMetric(state, 'ui.fans.daily.profileVisit', { period: 'day' });
    case 'mediaLike':
    case 'mediaUnlike':
      return getStateMetric(state, 'ui.likes.media');
    case 'profileLike':
    case 'profileUnlike':
      return getStateMetric(state, 'ui.likes.profile');
    case 'merchLike':
    case 'merchUnlike':
      return getStateMetric(state, 'ui.likes.merch');
    case 'feedLike':
    case 'feedUnlike':
      return getStateMetric(state, 'ui.likes.feed');
    default:
      return resolveMainEarningsTotalFromState(state);
  }
}

export function resolvePercentageFromStateBuckets(current, previous) {
  return calculatePeriodChangePercent(current, previous);
}

export function resolveMainSubscribersNewPercentageFromState(state) {
  const projected = projectStateToChartPaths(state);
  const daily = projected.subscriptions?.daily || [];
  const today = daily[daily.length - 1]?.newSubscriber ?? 0;
  const yesterday = daily.length > 1 ? daily[daily.length - 2]?.newSubscriber ?? 0 : 0;
  return resolvePercentageFromStateBuckets(today, yesterday);
}

export function resolveMainEarningsPercentageFromState(state) {
  const projected = projectStateToChartPaths(state);
  const daily = projected.earnings?.daily || [];
  const today = daily[daily.length - 1]?.total ?? 0;
  const yesterday = daily.length > 1 ? daily[daily.length - 2]?.total ?? 0 : 0;
  return resolvePercentageFromStateBuckets(today, yesterday);
}
