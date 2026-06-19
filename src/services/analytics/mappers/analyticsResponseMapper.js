/**
 * Maps raw analytics pipeline bundle responses into dashboard store state shapes.
 */

export function calculatePeriodChangePercent(current, previous) {
  if (current == null || current === 0) return null;
  if (!previous || previous === 0) return 100;
  return Math.round(((current - previous) / previous) * 100);
}

export function findLatestNonZeroEntry(arr, valueKeys) {
  if (!arr || arr.length === 0) return { latest: {}, prev: {} };

  for (let i = arr.length - 1; i >= 0; i--) {
    const entry = arr[i];
    const hasData = valueKeys.some((key) => entry[key] && entry[key] !== 0);
    if (hasData) return { latest: entry, prev: arr[i - 1] || {} };
  }

  return { latest: arr[arr.length - 1] || {}, prev: arr[arr.length - 2] || {} };
}

export function mapSubscriptionsPeriod(arr) {
  return (arr || []).map((item) => ({
    period: item.period,
    total: item.totalSubscribers || 0,
    sub: item.newSubscriber || 0,
    tip: item.recurringSubscriber || 0,
    free: item.free || 0,
    tier1: item.tier1 || 0,
    tier2: item.tier2 || 0,
    tier3: item.tier3 || 0,
    tier4: item.tier4 || 0,
    tier5: item.tier5 || 0,
  }));
}

export function mapSubscriptionsBundle(subscriptions) {
  const mapSub = mapSubscriptionsPeriod;

  return {
    daily: mapSub(subscriptions.daily),
    weekly: mapSub(subscriptions.weekly),
    monthly: mapSub(subscriptions.monthly),
    yearly: mapSub(subscriptions.yearly),
    alltime: mapSub(subscriptions.alltime || subscriptions.yearly),
    grandTotal:
      subscriptions.yearly && subscriptions.yearly.length > 0
        ? mapSub([subscriptions.yearly[subscriptions.yearly.length - 1]])[0]
        : null,
  };
}

export function mapEarningsBundle(earnings) {
  return {
    daily: earnings.daily || [],
    weekly: earnings.weekly || [],
    monthly: earnings.monthly || [],
    yearly: earnings.yearly || [],
    alltime: earnings.alltime || earnings.yearly || [],
    grandTotal: earnings.grandTotal || null,
  };
}

export function mapFanInsightsPeriod(arr, countriesArr) {
  if (!arr || arr.length === 0) {
    return {
      newFollowers: null,
      profileVisit: null,
      newFollowersPercentage: null,
      profileVisitPercentage: null,
      topCountries: [],
    };
  }

  let latestIdx = arr.length - 1;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (
      (arr[i].newFollowers && arr[i].newFollowers !== 0) ||
      (arr[i].profileVisits && arr[i].profileVisits !== 0)
    ) {
      latestIdx = i;
      break;
    }
  }

  const latest = arr[latestIdx] || {};
  const prev = arr[latestIdx - 1] || {};
  const topCountries = (countriesArr || []).map((country, index) => ({
    rank: country.rank || index + 1,
    country: country.country,
    visits: country.views || 0,
  }));

  return {
    newFollowers: latest.newFollowers ?? 0,
    profileVisit: latest.profileVisits ?? 0,
    newFollowersPercentage: calculatePeriodChangePercent(latest.newFollowers, prev.newFollowers),
    profileVisitPercentage: calculatePeriodChangePercent(latest.profileVisits, prev.profileVisits),
    topCountries,
  };
}

export function mapFansFromFanInsights(fanInsights) {
  return {
    daily: mapFanInsightsPeriod(fanInsights.daily, fanInsights.countries?.daily),
    weekly: mapFanInsightsPeriod(fanInsights.weekly, fanInsights.countries?.weekly),
    monthly: mapFanInsightsPeriod(fanInsights.monthly, fanInsights.countries?.monthly),
    yearly: mapFanInsightsPeriod(fanInsights.yearly, fanInsights.countries?.yearly),
    alltime: mapFanInsightsPeriod(
      fanInsights.alltime || fanInsights.yearly,
      fanInsights.countries?.alltime,
    ),
  };
}

export function mapRawFanInsights(fanInsights) {
  return {
    daily: fanInsights.daily || [],
    weekly: fanInsights.weekly || [],
    monthly: fanInsights.monthly || [],
    yearly: fanInsights.yearly || [],
    alltime: fanInsights.alltime || fanInsights.yearly || [],
    sources: fanInsights.sources || {},
    countries: fanInsights.countries || {},
    grandTotal: fanInsights.grandTotal || {},
  };
}

export function mapLikesSummary(likes) {
  const arr = (likes && (likes.daily || likes.weekly || likes.monthly)) || [];

  if (!arr || arr.length === 0) {
    return {
      media: null,
      merch: null,
      profile: null,
      feed: null,
      mediaPercentage: null,
      merchPercentage: null,
      profilePercentage: null,
      feedPercentage: null,
    };
  }

  let latestIdx = arr.length - 1;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (
      (arr[i].media && arr[i].media !== 0) ||
      (arr[i].merch && arr[i].merch !== 0) ||
      (arr[i].profile && arr[i].profile !== 0) ||
      (arr[i].feed && arr[i].feed !== 0)
    ) {
      latestIdx = i;
      break;
    }
  }

  const latest = arr[latestIdx] || {};
  const prev = arr[latestIdx - 1] || {};

  return {
    media: latest.media ?? 0,
    merch: latest.merch ?? 0,
    profile: latest.profile ?? 0,
    feed: latest.feed ?? 0,
    mediaPercentage: calculatePeriodChangePercent(latest.media, prev.media),
    merchPercentage: calculatePeriodChangePercent(latest.merch, prev.merch),
    profilePercentage: calculatePeriodChangePercent(latest.profile, prev.profile),
    feedPercentage: calculatePeriodChangePercent(latest.feed, prev.feed),
  };
}

export function mapTrendingCountries(countries) {
  return {
    daily: countries.daily || [],
    weekly: countries.weekly || [],
    monthly: countries.monthly || [],
    yearly: countries.yearly || [],
  };
}

export function buildSubscriberInsights(subscriptionsBundle) {
  const daily = subscriptionsBundle.daily || [];
  const { latest, prev } = findLatestNonZeroEntry(daily, ['sub', 'tip', 'total']);

  const buildPeriodInsights = (arr) => {
    const last = arr[arr.length - 1] || {};
    const secondLast = arr[arr.length - 2] || {};
    return {
      new: last.sub ?? (arr.length > 0 ? 0 : null),
      recurring: last.tip ?? (arr.length > 0 ? 0 : null),
      newPercentage: calculatePeriodChangePercent(last.sub, secondLast.sub),
      recurringPercentage: calculatePeriodChangePercent(last.tip, secondLast.tip),
    };
  };

  const grandTotal = subscriptionsBundle.grandTotal || {};

  return {
    daily: {
      new: latest.sub ?? (daily.length > 0 ? 0 : null),
      recurring: latest.tip ?? (daily.length > 0 ? 0 : null),
      newPercentage: calculatePeriodChangePercent(latest.sub, prev.sub),
      recurringPercentage: calculatePeriodChangePercent(latest.tip, prev.tip),
    },
    weekly: buildPeriodInsights(subscriptionsBundle.weekly || []),
    monthly: buildPeriodInsights(subscriptionsBundle.monthly || []),
    yearly: {
      new: grandTotal.sub ?? null,
      recurring: grandTotal.tip ?? null,
      newPercentage: null,
      recurringPercentage: null,
    },
  };
}

export function buildEarningsInsights(earnings) {
  const daily = earnings.daily || [];
  const { latest, prev } = findLatestNonZeroEntry(daily, ['total']);

  return {
    daily: {
      total: latest.total ?? (daily.length > 0 ? 0 : null),
      percentage: calculatePeriodChangePercent(latest.total, prev.total),
      sparklineData: daily.slice(-10).map((entry) => entry.total || 0),
    },
  };
}

/**
 * Maps a pipeline analytics bundle into partial store state updates.
 * @param {Object} bundle
 * @returns {Object|null}
 */
export function mapAnalyticsBundleResponse(bundle) {
  if (!bundle) return null;

  const mapped = {
    bundleLoaded: true,
  };

  if (bundle.dataSource) {
    mapped.dataSource = bundle.dataSource;
  }

  if (bundle.etag) {
    mapped.metadata = {
      etag: bundle.etag,
      lastUpdated: new Date().toISOString(),
    };
  }

  if (bundle.subscriptions) {
    mapped.subscriptionsBundle = mapSubscriptionsBundle(bundle.subscriptions);
  }

  if (bundle.earnings) {
    mapped.earnings = mapEarningsBundle(bundle.earnings);
  }

  if (bundle.fanInsights) {
    mapped.fans = mapFansFromFanInsights(bundle.fanInsights);
    mapped.fanInsights = mapRawFanInsights(bundle.fanInsights);
  }

  if (bundle.likes) {
    mapped.likes = mapLikesSummary(bundle.likes);
  }

  if (bundle.contributors) {
    mapped.contributors = bundle.contributors;
  }

  if (bundle.trendingsMedia) {
    mapped.trendingMedia = bundle.trendingsMedia || {};
  }

  if (bundle.trendingMerch) {
    mapped.trendingMerch = bundle.trendingMerch || {};
  }

  if (bundle.trendingTags) {
    mapped.trendingTags = bundle.trendingTags || {};
  }

  if (bundle.trendingCountries) {
    mapped.trendingCountries = bundle.trendingCountries || {};
    mapped.countries = mapTrendingCountries(bundle.trendingCountries);
  }

  if (bundle.recentOrders) {
    mapped.recentOrders = bundle.recentOrders;
  }

  return mapped;
}
