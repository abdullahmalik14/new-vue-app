import {
  buildSubscriberInsights,
  buildEarningsInsights,
  mapFansFromFanInsights,
} from '@/services/analytics/mappers/analyticsResponseMapper.js';
import { PERIOD_API_KEY } from './buildExpectationsFromApi.js';

/**
 * Mirrors popup components (Fans/Earnings/Subscribers trend popups).
 * Requires 2+ buckets and previous !== 0; otherwise UI hides the %.
 */
export function resolvePopupArrayDeltaPercent(arr, valueKey) {
  if (!arr || arr.length < 2) return null;
  const current = arr[arr.length - 1]?.[valueKey] ?? 0;
  const previous = arr[arr.length - 2]?.[valueKey] ?? 0;
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/** Mirrors DashboardAnalyticsSubscribersTrendPopup.calculatePercentage on mapped bundle rows. */
export function resolvePopupSubsPercent(mapped, period, field) {
  const key = PERIOD_API_KEY[period] || period;
  if (period === 'year' || period === 'alltime') return null;
  const arr = mapped.subscriptionsBundle?.[key] || [];
  const valueKey = field === 'recurring' ? 'tip' : 'sub';
  if (arr.length < 2) return null;
  const last = arr[arr.length - 1] || {};
  const prev = arr[arr.length - 2] || {};
  const current = last[valueKey];
  const previous = prev[valueKey];
  if (current == null || previous == null) return null;
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/** Mirrors DashboardAnalyticsEarningsTrendPopup earningsPctChange / tokensPctChange. */
export function resolvePopupEarningsPercent(mapped, period, field) {
  const key = PERIOD_API_KEY[period] || period;
  if (period === 'alltime') return null;
  const arr = mapped.earnings?.[key] || [];
  const valueKey = field === 'tokens' ? 'totalTokens' : 'total';
  return resolvePopupArrayDeltaPercent(arr, valueKey);
}

/** Mirrors DashboardAnalyticsFansTrendPopup followersPct / visitsPct. */
export function resolvePopupFansPercent(mapped, period, field) {
  const key = PERIOD_API_KEY[period] || period;
  const arr = mapped.fanInsights?.[key] || [];
  const valueKey = field === 'profileVisit' ? 'profileVisits' : 'newFollowers';
  return resolvePopupArrayDeltaPercent(arr, valueKey);
}

export function resolveMainSubscribersRecurringPercentage(mapped) {
  return buildSubscriberInsights(mapped.subscriptionsBundle || {}).daily?.recurringPercentage ?? null;
}

export function resolveFansMainPercentage(mapped, metric) {
  const fans = mapFansFromFanInsights(mapped.fanInsights || {});
  const daily = fans.daily || {};
  if (metric === 'newFollowers') return daily.newFollowersPercentage ?? null;
  if (metric === 'profileVisit') return daily.profileVisitPercentage ?? null;
  return null;
}

export function resolveLikesMainPercentage(mapped, metric) {
  const likes = mapped.likes || {};
  if (metric === 'media') return likes.mediaPercentage ?? null;
  if (metric === 'merch') return likes.merchPercentage ?? null;
  if (metric === 'profile') return likes.profilePercentage ?? null;
  if (metric === 'feed') return likes.feedPercentage ?? null;
  return null;
}

export function resolveMainEarningsPercentageFromMapped(mapped) {
  return buildEarningsInsights(mapped.earnings || {}).daily?.percentage ?? null;
}

export function resolveMainSubscribersNewPercentageFromMapped(mapped) {
  return buildSubscriberInsights(mapped.subscriptionsBundle || {}).daily?.newPercentage ?? null;
}
