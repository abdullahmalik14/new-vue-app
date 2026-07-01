import { POPUP_SCAN_PERIODS_WITH_ALLTIME } from '../utils/periodMap.js';
import {
  mapChartsPayloadToUiState,
  resolveMainSubscribersNew,
  resolveMainSubscribersRecurring,
  resolveMainEarningsTotal,
  resolveEarningsPopupTotal,
  resolveEarningsChartField,
  resolveSubsChartField,
  resolveTrendingCountryDisplayName,
  resolveTrendingCountrySales,
  resolveLikesMainMetric,
  resolveLikesChartField,
  earningsChartRule,
  subscribersChartRule,
  tokensChartRule,
  likesChartRule,
  resolveFansPeriodStat,
  resolveFansChartField,
  fansChartRule,
} from './uiExpectationResolver.js';

const PERIOD_API_KEY = {
  day: 'daily',
  week: 'weekly',
  month: 'monthly',
  year: 'yearly',
  alltime: 'alltime',
};

function apiPeriod(period) {
  return PERIOD_API_KEY[period] || period;
}

function getApiPathValue(payload, path) {
  return path.split('.').reduce((acc, key) => {
    if (acc == null) return undefined;
    if (key === '-1' && Array.isArray(acc)) return acc[acc.length - 1];
    return acc[key];
  }, payload);
}

export function createSingularRow(testCaseKey, singularRow, config) {
  const expectedValue =
    config.expectedValue !== undefined
      ? config.expectedValue
      : getApiPathValue(config.payload, config.apiPath);
  return singularRow(testCaseKey, {
    tolerance: 0.01,
    ...config,
    expectedValue,
  });
}

export function createChartRow(testCaseKey, chartRow, config) {
  const expectedValue =
    config.expectedValue !== undefined
      ? config.expectedValue
      : getApiPathValue(config.payload, config.apiPath);
  return chartRow(testCaseKey, {
    tolerance: 0.01,
    ...config,
    expectedValue,
  });
}

const LIKES_LABELS = {
  media: 'MEDIA',
  merch: 'MERCH',
  profile: 'PROFILE',
  feed: 'FEED',
};

export function buildLikesFieldExpectations(testCaseKey, payload, likeField, rowFns) {
  const { singularRow, chartRow } = rowFns;
  const mapped = mapChartsPayloadToUiState(payload);
  const label = LIKES_LABELS[likeField] || likeField.toUpperCase();
  const rows = [];

  rows.push(
    createSingularRow(testCaseKey, singularRow, {
      idSuffix: `singular.main.likes.${likeField}`,
      view: 'Main',
      location: 'Likes card',
      metric: label,
      apiPath: `ui.likes.${likeField}`,
      payload,
      expectedValue: resolveLikesMainMetric(mapped, likeField),
      scan: { type: 'cardMetricByLabel', heading: 'Likes', label },
    }),
  );

  POPUP_SCAN_PERIODS_WITH_ALLTIME.forEach((period) => {
    const apiP = apiPeriod(period);
    rows.push(
      createChartRow(testCaseKey, chartRow, {
        idSuffix: `chart.popup.likes.${likeField}.${period}`,
        view: 'Popup · Likes',
        location: 'Likes chart dataset',
        metric: likeField,
        period,
        apiPath: `likes.${apiP}.${likeField}`,
        payload,
        expectedValue: resolveLikesChartField(payload, period, likeField),
        popup: { openFromHeading: 'Likes' },
        periodToggle: period,
        chart: likesChartRule(likeField),
      }),
    );
  });

  return rows;
}

export function buildSwitchSubscriptionExpectations(testCaseKey, payload, fields, rowFns) {
  const { buildNewSubscriptionExpectations } = rowFns;
  return buildNewSubscriptionExpectations(testCaseKey, payload, fields);
}

export function buildUnfollowExpectations(testCaseKey, payload, rowFns) {
  const { buildFollowExpectations } = rowFns;
  return buildFollowExpectations(testCaseKey, payload);
}

export function buildP2vOrderExpectations(testCaseKey, payload, fields, rowFns) {
  const { singularRow, chartRow } = rowFns;
  const mapped = mapChartsPayloadToUiState(payload);
  const blockedGap = 'BLOCKED: API may reject orderType p2v — trigger can fail';
  const rows = [
    createSingularRow(testCaseKey, singularRow, {
      idSuffix: 'singular.main.earnings.total',
      view: 'Main',
      location: 'Earnings card',
      metric: 'Total earnings',
      apiPath: 'ui.earningsInsights.daily.total',
      payload,
      expectedValue: resolveMainEarningsTotal(mapped),
      knownGap: blockedGap,
      scan: { type: 'cardValueByHeading', heading: 'Earnings' },
    }),
  ];

  POPUP_SCAN_PERIODS_WITH_ALLTIME.forEach((period) => {
    const apiP = apiPeriod(period);
    rows.push(
      createChartRow(testCaseKey, chartRow, {
        idSuffix: `chart.popup.earnings.paytoview.${period}`,
        view: 'Popup · Earnings',
        location: 'Earnings chart dataset',
        metric: 'paytoview',
        period,
        apiPath: `ui.earningsChart.${apiP}.paytoview`,
        payload,
        expectedValue: resolveEarningsChartField(mapped, period, 'paytoview'),
        knownGap: blockedGap,
        popup: { openFromHeading: 'Earnings' },
        periodToggle: period,
        chart: earningsChartRule(period, 'paytoview'),
      }),
    );
  });

  const mediaId = fields.mediaId ?? 101;
  const trendArr = payload?.trendingsMedia?.daily || [];
  const mediaMatch = Array.isArray(trendArr)
    ? trendArr.find((item) => Number(item.mediaId) === Number(mediaId))
    : null;

  rows.push(
    createSingularRow(testCaseKey, singularRow, {
      idSuffix: 'singular.trends.media.p2v',
      view: 'Trends',
      location: 'Top Media P2V sales',
      metric: `Media ${mediaId} P2V sales`,
      period: 'day',
      apiPath: `trendingsMedia.daily[mediaId=${mediaId}].ppvSalesUSD`,
      payload,
      expectedValue: mediaMatch?.ppvSalesUSD ?? mediaMatch?.salesUSD ?? null,
      knownGap: 'Top Media P2V tab may stay empty on fresh creator',
      source: 'api',
      scan: {
        type: 'apiArrayMatch',
        path: 'trendingsMedia.daily',
        matchKey: 'mediaId',
        matchValue: mediaId,
        valueKey: 'ppvSalesUSD',
        min: 0,
      },
    }),
  );

  return rows;
}

export function buildMediaViewExpectations(testCaseKey, payload, fields, rowFns) {
  const { singularRow } = rowFns;
  const mediaId = fields.mediaId ?? 5117;
  const trendArr = payload?.trendingsMedia?.daily || [];
  const match = Array.isArray(trendArr)
    ? trendArr.find((item) => Number(item.mediaId) === Number(mediaId))
    : null;

  return [
    createSingularRow(testCaseKey, singularRow, {
      idSuffix: 'singular.trends.media.views',
      view: 'Trends',
      location: 'Top Media',
      metric: `Media ${mediaId} views`,
      period: 'day',
      apiPath: `trendingsMedia.daily[mediaId=${mediaId}].views`,
      payload,
      expectedValue: match?.views ?? match?.clicks ?? null,
      knownGap: 'trendingsMedia.daily may be empty on fresh creator',
      source: 'api',
      scan: {
        type: 'apiArrayMatch',
        path: 'trendingsMedia.daily',
        matchKey: 'mediaId',
        matchValue: mediaId,
        valueKey: 'views',
        min: 1,
      },
    }),
  ];
}

export function buildMediaWatchDurationExpectations(testCaseKey, payload, fields, rowFns) {
  const { singularRow } = rowFns;
  const mediaId = fields.mediaId ?? 2811;
  const trendArr = payload?.trendingsMedia?.daily || [];
  const match = Array.isArray(trendArr)
    ? trendArr.find((item) => Number(item.mediaId) === Number(mediaId))
    : null;

  return [
    createSingularRow(testCaseKey, singularRow, {
      idSuffix: 'singular.trends.media.watchDuration',
      view: 'Trends',
      location: 'Top Media',
      metric: `Media ${mediaId} watch duration`,
      period: 'day',
      apiPath: `trendingsMedia.daily[mediaId=${mediaId}].watchDurationSec`,
      payload,
      expectedValue: match?.watchDurationSec ?? null,
      knownGap: 'trendingsMedia.daily may be empty on fresh creator',
      source: 'api',
      scan: {
        type: 'apiArrayMatch',
        path: 'trendingsMedia.daily',
        matchKey: 'mediaId',
        matchValue: mediaId,
        valueKey: 'watchDurationSec',
        min: 1,
      },
    }),
  ];
}

export function buildMerchTrendRow(testCaseKey, payload, rowFns) {
  const { singularRow } = rowFns;
  const arr = payload?.trendingMerch?.daily;
  const count = Array.isArray(arr) ? arr.length : 0;

  return createSingularRow(testCaseKey, singularRow, {
    idSuffix: 'singular.trends.merch.count',
    view: 'Trends',
    location: 'Top Merch',
    metric: 'Top Merch row count',
    period: 'day',
    apiPath: 'trendingMerch.daily.length',
    payload,
    expectedValue: count > 0 ? count : null,
    knownGap: 'CONFIRMED: trendingMerch.daily may stay empty after merch ingest',
    source: 'api',
    scan: { type: 'apiPath', path: 'trendingMerch.daily.length' },
  });
}

export function buildCountryTrendRow(testCaseKey, payload, fields, rowFns) {
  const { singularRow } = rowFns;
  const countryId = Number(fields.countryId ?? 702);
  const countryName = resolveTrendingCountryDisplayName(countryId);

  return createSingularRow(testCaseKey, singularRow, {
    idSuffix: 'singular.trends.country.sales.day',
    view: 'Trends',
    location: 'Top Countries table',
    metric: `${countryName} sales (USD)`,
    period: 'day',
    apiPath: `trendingCountries.daily[country=${countryId}].salesUSD`,
    payload,
    expectedValue: resolveTrendingCountrySales(payload, 'day', countryId),
    scan: {
      type: 'trendTableCountrySales',
      tableHeading: 'Top Countries',
      countryName,
    },
  });
}

export { PERIOD_API_KEY, apiPeriod };
