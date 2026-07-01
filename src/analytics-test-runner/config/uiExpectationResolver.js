import {
  mapAnalyticsBundleResponse,
  mapFansFromFanInsights,
  buildSubscriberInsights,
  buildEarningsInsights,
} from '@/services/analytics/mappers/analyticsResponseMapper.js';
import { analyticsCountryCodeToDisplayName } from '@/systems/analytics/analyticsCountryLabels.js';
import { PERIOD_API_KEY } from './buildExpectationsFromApi.js';

const TIER_DONUT_LABELS = {
  free: 'Free',
  tier1: 'Tier 1',
  tier2: 'Tier 2',
  tier3: 'Tier 3',
  tier4: 'Tier 4',
  tier5: 'Tier 5',
};

const PERIOD_SLUG = {
  week: 'weekly',
  month: 'monthly',
  year: 'yearly',
  alltime: 'alltime',
};

export function mapChartsPayloadToUiState(payload) {
  return mapAnalyticsBundleResponse(payload) || {};
}

export function resolveMainSubscribersNew(mapped) {
  return buildSubscriberInsights(mapped.subscriptionsBundle || {}).daily?.new ?? null;
}

export function resolveMainSubscribersRecurring(mapped) {
  return buildSubscriberInsights(mapped.subscriptionsBundle || {}).daily?.recurring ?? null;
}

export function resolveMainEarningsTotal(mapped) {
  return buildEarningsInsights(mapped.earnings || {}).daily?.total ?? null;
}

export function resolveMainSubscribersNewPercentage(mapped) {
  return buildSubscriberInsights(mapped.subscriptionsBundle || {}).daily?.newPercentage ?? null;
}

export function resolveMainEarningsPercentage(mapped) {
  return buildEarningsInsights(mapped.earnings || {}).daily?.percentage ?? null;
}

export function resolveTrendingCountryDisplayName(countryId) {
  const code = `Country ${countryId}`;
  return analyticsCountryCodeToDisplayName[code] || code;
}

export function resolveTrendingCountrySales(payload, period, countryId) {
  const key = PERIOD_API_KEY[period] || period;
  const arr = payload?.trendingCountries?.[key] || [];
  const code = `Country ${countryId}`;
  const row = arr.find((item) => item?.country === code || String(item?.country) === String(countryId));
  return row?.salesUSD ?? row?.earningsUSD ?? row?.sales_usd ?? null;
}

/** Mirrors useDashboardAnalyticsStore.getEarningsViewModel */
export function resolveEarningsPopupTotal(mapped, period) {
  const key = PERIOD_API_KEY[period] || period;
  const arr = mapped.earnings?.[key] || [];
  if (!arr.length) return null;

  const summary = mapped.earnings?.summaries?.[key];
  if (summary?.totalEarningsUSD != null) {
    return summary.totalEarningsUSD;
  }

  return arr.reduce((sum, item) => sum + (item.total || 0), 0);
}

/** Mirrors DashboardAnalyticsEarningsTrendPopup.injectChartData daily donut index */
export function resolveEarningsChartField(mapped, period, field) {
  const key = PERIOD_API_KEY[period] || period;

  if (period === 'day') {
    const daily = mapped.earnings?.daily || [];
    const row = daily[0] || {};
    return row[field] ?? null;
  }

  const arr = mapped.earnings?.[key] || [];
  const last = arr[arr.length - 1] || {};
  return last[field] ?? null;
}

/** Mirrors mapped subscriptions bundle used by subscriber popups */
export function resolveSubsChartField(mapped, period, field) {
  const bundle = mapped.subscriptionsBundle || {};
  const key = PERIOD_API_KEY[period] || period;
  const mappedField = field === 'newSubscriber' ? 'sub' : field === 'recurringSubscriber' ? 'tip' : field;

  if (period === 'day') {
    const daily = bundle.daily || [];
    const last = daily[daily.length - 1] || {};
    return last[mappedField] ?? null;
  }

  const arr = bundle[key] || [];
  const last = arr[arr.length - 1] || {};
  return last[mappedField] ?? null;
}

export function earningsChartRule(period, field) {
  if (period === 'day') {
    return {
      chartIdIncludes: 'sales-daily-donut',
      field,
      donutName: field,
      visibleOnly: true,
    };
  }

  const slug = PERIOD_SLUG[period];
  return {
    chartIdIncludes: `sales-${slug}-bar`,
    field,
    visibleOnly: true,
  };
}

export function subscribersChartRule(period, field) {
  const mappedField = field === 'newSubscriber' ? 'sub' : field === 'recurringSubscriber' ? 'tip' : field;

  if (period === 'day') {
    if (field.startsWith('tier')) {
      return {
        chartIdIncludes: 'tiers-daily-donut',
        field: mappedField,
        donutName: TIER_DONUT_LABELS[field] || field,
        visibleOnly: true,
      };
    }

    return {
      chartIdIncludes: 'subs-daily-donut',
      field: mappedField,
      donutName: 'New Subscriber',
      visibleOnly: true,
    };
  }

  const slug = PERIOD_SLUG[period];
  if (field.startsWith('tier')) {
    return {
      chartIdIncludes: `tiers-${slug}-bar`,
      field: mappedField,
      visibleOnly: true,
    };
  }

  return {
    chartIdIncludes: `subs-${slug}-bar`,
    field: mappedField,
    visibleOnly: true,
  };
}

/** Mirrors mapFansFromFanInsights → store.fans (main card + popup stats). */
export function resolveFansPeriodStat(mapped, period, metric) {
  const fans = mapFansFromFanInsights(mapped.fanInsights || {});
  const key = PERIOD_API_KEY[period] || period;
  const periodData = fans[key] || {};
  if (metric === 'newFollowers') return periodData.newFollowers ?? null;
  if (metric === 'profileVisits' || metric === 'profileVisit') {
    return periodData.profileVisit ?? null;
  }
  return null;
}

/** Mirrors Fans popup chart injectChartData (raw fanInsights period arrays). */
export function resolveFansChartField(mapped, period, field) {
  if (period === 'day') return null;
  const key = PERIOD_API_KEY[period] || period;
  const raw = mapped.fanInsights?.[key] || [];
  const last = raw[raw.length - 1] || {};
  if (field === 'profileVisit') return last.profileVisits ?? null;
  return last[field] ?? null;
}

export function fansChartRule(period, field) {
  if (period === 'day') return null;
  const slug = PERIOD_SLUG[period];
  const chartField = field === 'profileVisit' ? 'profileVisits' : field;
  return {
    chartIdIncludes: `fans-${slug}-bar`,
    field: chartField,
    visibleOnly: true,
  };
}

export function tokensChartRule(period, field) {
  if (period === 'day') {
    return {
      chartIdIncludes: 'tokens-daily-donut',
      field,
      donutName: field,
      visibleOnly: true,
    };
  }

  const slug = PERIOD_SLUG[period];
  return {
    chartIdIncludes: `tokens-${slug}-bar`,
    field,
    visibleOnly: true,
  };
}

export function resolveLikesMainMetric(mapped, field) {
  return mapped.likes?.[field] ?? null;
}

export function resolveLikesChartField(payload, period, field) {
  const key = PERIOD_API_KEY[period] || period;
  const arr = payload?.likes?.[key] || [];
  const last = arr[arr.length - 1] || {};
  return last[field] ?? null;
}

export function likesChartRule(field) {
  return {
    chartIdIncludes: 'likes-chart',
    field,
    visibleOnly: true,
  };
}

/** Main-card / refresh metric for a test case (UI-aligned). */
export function resolveRefreshDomExpectation(testCaseKey, mapped) {
  switch (testCaseKey) {
    case 'newSubscription':
    case 'switchSubscription':
      return resolveMainSubscribersNew(mapped) ?? resolveMainEarningsTotal(mapped);
    case 'recurringSubscription':
      return resolveMainSubscribersRecurring(mapped) ?? resolveMainEarningsTotal(mapped);
    case 'merchOrder':
    case 'tokenOrder':
    case 'p2vOrder':
    case 'cancelSubscription':
      return resolveMainEarningsTotal(mapped);
    case 'follow':
    case 'unfollow':
      return resolveFansPeriodStat(mapped, 'day', 'newFollowers');
    case 'profileVisit':
      return resolveFansPeriodStat(mapped, 'day', 'profileVisit');
    case 'mediaLike':
      return resolveLikesMainMetric(mapped, 'media');
    case 'mediaUnlike':
      return resolveLikesMainMetric(mapped, 'media');
    case 'profileLike':
    case 'profileUnlike':
      return resolveLikesMainMetric(mapped, 'profile');
    case 'merchLike':
    case 'merchUnlike':
      return resolveLikesMainMetric(mapped, 'merch');
    case 'feedLike':
    case 'feedUnlike':
      return resolveLikesMainMetric(mapped, 'feed');
    case 'tagEngagement':
      return null;
    case 'mediaView':
    case 'mediaWatchDuration':
      return null;
    default:
      return null;
  }
}
