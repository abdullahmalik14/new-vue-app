import { POPUP_SCAN_PERIODS_WITH_ALLTIME } from '../utils/periodMap.js';
import {
  resolveTrendingCountryDisplayName,
  earningsChartRule,
  subscribersChartRule,
  tokensChartRule,
  fansChartRule,
  likesChartRule,
  CONTRIBUTORS_PREVIEW_PERIOD,
} from './uiExpectationResolver.js';
import { projectStateToChartPaths } from './expectationState.js';

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

export function buildLikesFieldExpectationsFromState(testCaseKey, state, likeField, rowFns) {
  const { singularRow, chartRow } = rowFns;
  const LIKES_LABELS = {
    media: 'MEDIA',
    merch: 'MERCH',
    profile: 'PROFILE',
    feed: 'FEED',
  };
  const label = LIKES_LABELS[likeField] || likeField.toUpperCase();
  const rows = [];

  rows.push(
    singularRow(testCaseKey, {
      idSuffix: `singular.main.likes.${likeField}`,
      view: 'Main',
      location: 'Likes card',
      metric: label,
      apiPath: `ui.likes.${likeField}`,
      scan: { type: 'cardMetricByLabel', heading: 'Likes', label },
    }, state),
  );

  POPUP_SCAN_PERIODS_WITH_ALLTIME.forEach((period) => {
    const apiP = apiPeriod(period);
    rows.push(
      chartRow(testCaseKey, {
        idSuffix: `chart.popup.likes.${likeField}.${period}`,
        view: 'Popup · Likes',
        location: 'Likes chart dataset',
        metric: likeField,
        period,
        apiPath: `likes.${apiP}.${likeField}`,
        popup: { openFromHeading: 'Likes' },
        periodToggle: period,
        chart: likesChartRule(likeField),
      }, state),
    );
  });

  return rows;
}

export function buildUnfollowExpectationsFromState(testCaseKey, state, rowFns) {
  return buildFollowExpectationsFromState(testCaseKey, state, rowFns);
}

function buildFollowExpectationsFromState(testCaseKey, state, rowFns) {
  const { singularRow, chartRow } = rowFns;
  const rows = [
    singularRow(testCaseKey, {
      idSuffix: 'singular.main.fans.newFollowers',
      view: 'Main',
      location: 'Fans card',
      metric: 'NEW FOLLOWERS',
      apiPath: 'ui.fans.daily.newFollowers',
      scan: { type: 'cardMetricByLabel', heading: 'Fans', label: 'NEW FOLLOWERS' },
    }, state),
  ];
  POPUP_SCAN_PERIODS_WITH_ALLTIME.forEach((period) => {
    const apiP = apiPeriod(period);
    const chartRule = fansChartRule(period, 'newFollowers');
    rows.push(
      singularRow(testCaseKey, {
        idSuffix: `singular.popup.fans.newFollowers.${period}`,
        view: 'Popup · Fans',
        location: 'Fans popup stat',
        metric: 'New Followers',
        period,
        apiPath: `ui.fans.${apiP}.newFollowers`,
        popup: { openFromHeading: 'Fans' },
        periodToggle: period,
        scan: { type: 'popupStatByHeading', heading: 'New Followers' },
      }, state),
    );
    if (chartRule) {
      rows.push(
        chartRow(testCaseKey, {
          idSuffix: `chart.popup.fans.newFollowers.${period}`,
          view: 'Popup · Fans',
          location: 'Fans chart dataset',
          metric: 'newFollowers',
          period,
          apiPath: `ui.fansChart.${apiP}.newFollowers`,
          popup: { openFromHeading: 'Fans' },
          periodToggle: period,
          chart: chartRule,
        }, state),
      );
    }
  });
  return rows;
}

export function buildP2vOrderExpectationsFromState(testCaseKey, state, fields, rowFns) {
  const { singularRow, chartRow } = rowFns;
  const blockedGap = 'BLOCKED: API may reject orderType p2v — trigger can fail';
  const rows = [
    singularRow(testCaseKey, {
      idSuffix: 'singular.main.earnings.total',
      view: 'Main',
      location: 'Earnings card',
      metric: 'Total earnings',
      apiPath: 'ui.earningsInsights.daily.total',
      knownGap: blockedGap,
      scan: { type: 'cardValueByHeading', heading: 'Earnings' },
    }, state),
  ];

  POPUP_SCAN_PERIODS_WITH_ALLTIME.forEach((period) => {
    const apiP = apiPeriod(period);
    rows.push(
      chartRow(testCaseKey, {
        idSuffix: `chart.popup.earnings.paytoview.${period}`,
        view: 'Popup · Earnings',
        location: 'Earnings chart dataset',
        metric: 'paytoview',
        period,
        apiPath: `ui.earningsChart.${apiP}.paytoview`,
        knownGap: blockedGap,
        popup: { openFromHeading: 'Earnings' },
        periodToggle: period,
        chart: earningsChartRule(period, 'paytoview'),
      }, state),
    );
  });

  const mediaId = fields.mediaId ?? 101;
  rows.push(
    singularRow(testCaseKey, {
      idSuffix: 'singular.trends.media.p2v',
      view: 'Trends',
      location: 'Top Media P2V sales',
      metric: `Media ${mediaId} P2V sales`,
      period: 'day',
      apiPath: `trendingsMedia.daily[mediaId=${mediaId}].ppvSalesUSD`,
      mediaId,
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
    }, state),
  );

  return rows;
}

export function buildMediaViewExpectationsFromState(testCaseKey, state, fields, rowFns) {
  const { singularRow } = rowFns;
  const mediaId = fields.mediaId ?? 5117;
  return [
    singularRow(testCaseKey, {
      idSuffix: 'singular.trends.media.views',
      view: 'Trends',
      location: 'Top Media',
      metric: `Media ${mediaId} views`,
      period: 'day',
      apiPath: `trendingsMedia.daily[mediaId=${mediaId}].views`,
      mediaId,
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
    }, state),
  ];
}

export function buildMediaWatchDurationExpectationsFromState(testCaseKey, state, fields, rowFns) {
  const { singularRow } = rowFns;
  const mediaId = fields.mediaId ?? 2811;
  return [
    singularRow(testCaseKey, {
      idSuffix: 'singular.trends.media.watchDuration',
      view: 'Trends',
      location: 'Top Media',
      metric: `Media ${mediaId} watch duration`,
      period: 'day',
      apiPath: `trendingsMedia.daily[mediaId=${mediaId}].watchDurationSec`,
      mediaId,
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
    }, state),
  ];
}

export function buildMerchTrendRowFromState(testCaseKey, state, rowFns) {
  const { singularRow } = rowFns;
  const arr = projectStateToChartPaths(state).trendingMerch?.daily;
  const count = Array.isArray(arr) ? arr.length : 0;

  return singularRow(testCaseKey, {
    idSuffix: 'singular.trends.merch.count',
    view: 'Trends',
    location: 'Top Merch',
    metric: 'Top Merch row count',
    period: 'day',
    apiPath: 'trendingMerch.daily.length',
    expectedValue: count > 0 ? count : null,
    knownGap: 'CONFIRMED: trendingMerch.daily may stay empty after merch ingest',
    source: 'api',
    scan: { type: 'apiPath', path: 'trendingMerch.daily.length' },
  }, state);
}

export function buildCountryTrendRowFromState(testCaseKey, state, fields, rowFns) {
  const { singularRow } = rowFns;
  const countryId = Number(fields.countryId ?? 702);
  const countryName = resolveTrendingCountryDisplayName(countryId);

  return singularRow(testCaseKey, {
    idSuffix: 'singular.trends.country.sales.day',
    view: 'Trends',
    location: 'Top Countries table',
    metric: `${countryName} sales (USD)`,
    period: 'day',
    apiPath: `trendingCountries.daily[country=${countryId}].salesUSD`,
    countryId,
    scan: {
      type: 'trendTableCountrySales',
      tableHeading: 'Top Countries',
      countryName,
    },
  }, state);
}

export function buildContributorsPreviewRowsFromState(testCaseKey, state, rowFns) {
  const { singularRow } = rowFns;
  const apiP = apiPeriod(CONTRIBUTORS_PREVIEW_PERIOD);

  return [
    singularRow(testCaseKey, {
      idSuffix: 'singular.main.contributors.amount',
      view: 'Main',
      location: 'Top Contributors preview',
      metric: 'Top contributor amount (USD)',
      period: CONTRIBUTORS_PREVIEW_PERIOD,
      apiPath: `contributors.topContributors.${apiP}.-1.usdSpent`,
      scan: { type: 'topContributorsPreview', field: 'total' },
    }, state),
    singularRow(testCaseKey, {
      idSuffix: 'singular.main.contributors.name',
      view: 'Main',
      location: 'Top Contributors preview',
      metric: 'Top contributor name',
      period: CONTRIBUTORS_PREVIEW_PERIOD,
      apiPath: `contributors.topContributors.${apiP}.-1.name`,
      scan: { type: 'topContributorsPreview', field: 'name' },
    }, state),
  ];
}

export function buildContributorsPopupApiRowsFromState(testCaseKey, state, rowFns) {
  const { singularRow } = rowFns;
  const rows = [];

  POPUP_SCAN_PERIODS_WITH_ALLTIME.forEach((period) => {
    const apiP = apiPeriod(period);
    rows.push(
      singularRow(testCaseKey, {
        idSuffix: `api.contributors.popup.topContributors.${period}`,
        view: 'API',
        location: 'Contributors popup contract',
        metric: `Top contributor amount (${period})`,
        period,
        source: 'api',
        apiPath: `contributors.topContributors.${apiP}.-1.usdSpent`,
        scan: { type: 'apiPath', path: `contributors.topContributors.${apiP}.-1.usdSpent` },
      }, state),
    );
  });

  return rows;
}
