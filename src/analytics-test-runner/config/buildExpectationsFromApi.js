import { POPUP_SCAN_PERIODS_WITH_ALLTIME } from '../utils/periodMap.js';
import {
  mapChartsPayloadToUiState,
  resolveMainSubscribersNew,
  resolveMainSubscribersRecurring,
  resolveMainEarningsTotal,
  resolveEarningsPopupTotal,
  resolveEarningsPopupTokensReceived,
  resolveEarningsChartField,
  resolveSubsChartField,
  resolveTrendingCountryDisplayName,
  resolveTrendingCountrySales,
  earningsChartRule,
  subscribersChartRule,
  tokensChartRule,
  resolveFansPeriodStat,
  resolveFansChartField,
  fansChartRule,
} from './uiExpectationResolver.js';
import { appendAllPercentageRows } from './percentageExpectationRows.js';
import {
  buildLikesFieldExpectations,
  buildSwitchSubscriptionExpectations,
  buildUnfollowExpectations,
  buildP2vOrderExpectations,
  buildMediaViewExpectations,
  buildMediaWatchDurationExpectations,
  buildMerchTrendRow,
  buildCountryTrendRow,
} from './allExpectationBuilders.js';

const PERIOD_API_KEY = {
  day: 'daily',
  week: 'weekly',
  month: 'monthly',
  year: 'yearly',
  alltime: 'alltime',
};

function getApiPathValue(payload, path) {
  return path.split('.').reduce((acc, key) => {
    if (acc == null) return undefined;
    if (key === '-1' && Array.isArray(acc)) return acc[acc.length - 1];
    return acc[key];
  }, payload);
}

function createRow(id, row) {
  return { tolerance: 0.01, ...row, id };
}

function apiPeriod(period) {
  return PERIOD_API_KEY[period] || period;
}

function singularRow(testCaseKey, config) {
  const expectedValue =
    config.expectedValue !== undefined
      ? config.expectedValue
      : getApiPathValue(config.payload, config.apiPath);
  return createRow(`${testCaseKey}.${config.idSuffix}`, {
    valueKind: 'singular',
    view: config.view,
    location: config.location,
    metric: config.metric,
    period: config.period || 'day',
    apiPath: config.apiPath,
    expectedValue,
    source: config.source || 'dom',
    knownGap: config.knownGap,
    scan: config.scan,
    popup: config.popup,
    periodToggle: config.periodToggle,
    chart: config.chart,
  });
}

function chartRow(testCaseKey, config) {
  const expectedValue =
    config.expectedValue !== undefined
      ? config.expectedValue
      : getApiPathValue(config.payload, config.apiPath);
  return createRow(`${testCaseKey}.${config.idSuffix}`, {
    valueKind: 'chart',
    view: config.view,
    location: config.location,
    metric: config.metric,
    period: config.period,
    apiPath: config.apiPath,
    expectedValue,
    source: config.source || 'dataset',
    knownGap: config.knownGap,
    scan: config.scan,
    popup: config.popup,
    periodToggle: config.periodToggle,
    chart: config.chart,
  });
}

/**
 * Build expectation rows from live /api/charts numbers (HTTP ground truth).
 * DOM scans are compared against these API-derived values.
 */
export function buildExpectationsFromApi(testCaseKey, chartsPayload, { fields = {} } = {}) {
  const rowFns = {
    singularRow,
    chartRow,
    buildNewSubscriptionExpectations,
    buildFollowExpectations,
  };

  const builders = {
    newSubscription: buildNewSubscriptionExpectations,
    recurringSubscription: buildRecurringSubscriptionExpectations,
    switchSubscription: (key, payload, f) => buildSwitchSubscriptionExpectations(key, payload, f, rowFns),
    merchOrder: buildMerchOrderExpectations,
    p2vOrder: (key, payload, f) => buildP2vOrderExpectations(key, payload, f, rowFns),
    tokenOrder: buildTokenOrderExpectations,
    follow: buildFollowExpectations,
    unfollow: (key, payload) => buildUnfollowExpectations(key, payload, rowFns),
    profileVisit: buildProfileVisitExpectations,
    mediaLike: (key, payload) => buildLikesFieldExpectations(key, payload, 'media', rowFns),
    mediaUnlike: (key, payload) => buildLikesFieldExpectations(key, payload, 'media', rowFns),
    profileLike: (key, payload) => buildLikesFieldExpectations(key, payload, 'profile', rowFns),
    profileUnlike: (key, payload) => buildLikesFieldExpectations(key, payload, 'profile', rowFns),
    merchLike: (key, payload) => buildLikesFieldExpectations(key, payload, 'merch', rowFns),
    merchUnlike: (key, payload) => buildLikesFieldExpectations(key, payload, 'merch', rowFns),
    feedLike: (key, payload) => buildLikesFieldExpectations(key, payload, 'feed', rowFns),
    feedUnlike: (key, payload) => buildLikesFieldExpectations(key, payload, 'feed', rowFns),
    tagEngagement: buildTagEngagementExpectations,
    cancelSubscription: buildCancelSubscriptionExpectations,
    mediaView: (key, payload, f) => buildMediaViewExpectations(key, payload, f, rowFns),
    mediaWatchDuration: (key, payload, f) => buildMediaWatchDurationExpectations(key, payload, f, rowFns),
  };

  const builder = builders[testCaseKey];
  if (!builder) {
    throw new Error(`No API expectation builder for: ${testCaseKey}`);
  }
  const mapped = mapChartsPayloadToUiState(chartsPayload);
  const rows = builder(testCaseKey, chartsPayload, fields);
  appendAllPercentageRows(rows, testCaseKey, mapped, singularRow);
  return rows.filter((row) => row.expectedValue != null || row.knownGap);
}

function buildNewSubscriptionExpectations(testCaseKey, payload, fields) {
  const rows = [];
  const planId = Number(fields.planId ?? 2);
  const planTierKey = `tier${planId}`;
  const countryId = Number(fields.countryId ?? 702);
  const countryName = resolveTrendingCountryDisplayName(countryId);
  const mapped = mapChartsPayloadToUiState(payload);

  rows.push(
    singularRow(testCaseKey, {
      idSuffix: 'singular.main.subscribers.new',
      view: 'Main',
      location: 'Subscribers card',
      metric: 'NEW subscribers',
      apiPath: 'ui.subscriberInsights.daily.new',
      payload,
      expectedValue: resolveMainSubscribersNew(mapped),
      scan: { type: 'cardValueByHeading', heading: 'Subscribers', field: 'new' },
    }),
    singularRow(testCaseKey, {
      idSuffix: 'singular.main.earnings.total',
      view: 'Main',
      location: 'Earnings card',
      metric: 'Total earnings',
      apiPath: 'ui.earningsInsights.daily.total',
      payload,
      expectedValue: resolveMainEarningsTotal(mapped),
      scan: { type: 'cardValueByHeading', heading: 'Earnings' },
    }),
    singularRow(testCaseKey, {
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
    }),
    singularRow(testCaseKey, {
      idSuffix: 'singular.main.contributors.amount',
      view: 'Main',
      location: 'Top Contributors preview',
      metric: 'Top contributor amount',
      apiPath: 'contributors.topContributors.0.amount',
      payload,
      knownGap: 'Top Contributors is the only known backend gap — name/amount may differ',
      scan: { type: 'cardValueByHeading', heading: 'Contributors' },
    }),
  );

  POPUP_SCAN_PERIODS_WITH_ALLTIME.forEach((period) => {
    const apiP = apiPeriod(period);
    const earningsChart = earningsChartRule(period, 'total');
    const subscriptionChart = earningsChartRule(period, 'subscription');
    const subsNewChart = subscribersChartRule(period, 'newSubscriber');
    const subsTierChart = subscribersChartRule(period, planTierKey);

    rows.push(
      singularRow(testCaseKey, {
        idSuffix: `singular.popup.earnings.total.${period}`,
        view: 'Popup · Earnings',
        location: 'Earnings popup header',
        metric: 'Total earnings',
        period,
        apiPath: `ui.earningsPopup.${apiP}.total`,
        payload,
        expectedValue: resolveEarningsPopupTotal(mapped, period),
        popup: { openFromHeading: 'Earnings' },
        periodToggle: period,
        scan: { type: 'popupStatByHeading', heading: 'Total Earnings' },
      }),
      ...(period !== 'day'
        ? [
            chartRow(testCaseKey, {
              idSuffix: `chart.popup.earnings.total.${period}`,
              view: 'Popup · Earnings',
              location: 'Earnings chart dataset',
              metric: 'total',
              period,
              apiPath: `ui.earningsChart.${apiP}.total`,
              payload,
              expectedValue: resolveEarningsChartField(mapped, period, 'total'),
              popup: { openFromHeading: 'Earnings' },
              periodToggle: period,
              chart: earningsChart,
            }),
          ]
        : []),
      chartRow(testCaseKey, {
        idSuffix: `chart.popup.earnings.subscription.${period}`,
        view: 'Popup · Earnings',
        location: 'Earnings chart dataset',
        metric: 'subscription',
        period,
        apiPath: `ui.earningsChart.${apiP}.subscription`,
        payload,
        expectedValue: resolveEarningsChartField(mapped, period, 'subscription'),
        popup: { openFromHeading: 'Earnings' },
        periodToggle: period,
        chart: subscriptionChart,
      }),
      chartRow(testCaseKey, {
        idSuffix: `chart.popup.subscribers.new.${period}`,
        view: 'Popup · Subscribers',
        location: 'Subscribers chart dataset',
        metric: 'newSubscriber',
        period,
        apiPath: `ui.subsChart.${apiP}.newSubscriber`,
        payload,
        expectedValue: resolveSubsChartField(mapped, period, 'newSubscriber'),
        popup: { openFromHeading: 'Subscribers' },
        periodToggle: period,
        chart: subsNewChart,
      }),
      chartRow(testCaseKey, {
        idSuffix: `chart.popup.subscribers.plan.${period}`,
        view: 'Popup · Subscribers',
        location: 'Subscribers chart dataset (plan tier)',
        metric: planTierKey,
        period,
        apiPath: `ui.subsChart.${apiP}.${planTierKey}`,
        payload,
        expectedValue: resolveSubsChartField(mapped, period, planTierKey),
        popup: { openFromHeading: 'Subscribers' },
        periodToggle: period,
        chart: subsTierChart,
      }),
    );
  });

  return rows.filter((row) => row.expectedValue != null || row.knownGap);
}

function buildRecurringSubscriptionExpectations(testCaseKey, payload, fields) {
  const mapped = mapChartsPayloadToUiState(payload);
  const rows = buildNewSubscriptionExpectations(testCaseKey, payload, fields);
  rows.push(
    singularRow(testCaseKey, {
      idSuffix: 'singular.main.subscribers.recurring',
      view: 'Main',
      location: 'Subscribers card',
      metric: 'RECURRING subscribers',
      apiPath: 'ui.subscriberInsights.daily.recurring',
      payload,
      expectedValue: resolveMainSubscribersRecurring(mapped),
      scan: { type: 'cardValueByHeading', heading: 'Subscribers', field: 'recurring' },
    }),
    buildCountryTrendRow(testCaseKey, payload, fields, { singularRow, chartRow }),
  );
  return rows;
}

function buildMerchOrderExpectations(testCaseKey, payload, fields) {
  const mapped = mapChartsPayloadToUiState(payload);
  const rows = [];
  rows.push(
    singularRow(testCaseKey, {
      idSuffix: 'singular.main.earnings.total',
      view: 'Main',
      location: 'Earnings card',
      metric: 'Total earnings',
      apiPath: 'ui.earningsInsights.daily.total',
      payload,
      expectedValue: resolveMainEarningsTotal(mapped),
      scan: { type: 'cardValueByHeading', heading: 'Earnings' },
    }),
  );
  POPUP_SCAN_PERIODS_WITH_ALLTIME.forEach((period) => {
    const apiP = apiPeriod(period);
    rows.push(
      chartRow(testCaseKey, {
        idSuffix: `chart.popup.earnings.merch.${period}`,
        view: 'Popup · Earnings',
        location: 'Earnings chart dataset',
        metric: 'merch',
        period,
        apiPath: `ui.earningsChart.${apiP}.merch`,
        payload,
        expectedValue: resolveEarningsChartField(mapped, period, 'merch'),
        popup: { openFromHeading: 'Earnings' },
        periodToggle: period,
        chart: earningsChartRule(period, 'merch'),
      }),
    );
  });
  rows.push(buildMerchTrendRow(testCaseKey, payload, { singularRow, chartRow }));
  rows.push(buildCountryTrendRow(testCaseKey, payload, fields, { singularRow, chartRow }));
  return rows;
}

function buildTokenOrderExpectations(testCaseKey, payload, fields) {
  const mapped = mapChartsPayloadToUiState(payload);
  const rows = [];

  POPUP_SCAN_PERIODS_WITH_ALLTIME.forEach((period) => {
    const apiP = apiPeriod(period);
    rows.push(
      singularRow(testCaseKey, {
        idSuffix: `singular.popup.earnings.tokensReceived.${period}`,
        view: 'Popup · Earnings',
        location: 'Earnings popup header',
        metric: 'Tokens Received',
        period,
        apiPath: `ui.earningsPopup.${apiP}.totalTokens`,
        payload,
        expectedValue: resolveEarningsPopupTokensReceived(mapped, period),
        popup: { openFromHeading: 'Earnings' },
        periodToggle: period,
        scan: { type: 'popupStatByHeading', heading: 'Tokens Received' },
      }),
      chartRow(testCaseKey, {
        idSuffix: `chart.popup.earnings.tipTokens.${period}`,
        view: 'Popup · Earnings',
        location: 'Token insights chart dataset',
        metric: 'tipTokens',
        period,
        apiPath: `ui.earningsChart.${apiP}.tipTokens`,
        payload,
        expectedValue: resolveEarningsChartField(mapped, period, 'tipTokens'),
        knownGap:
          period === 'day'
            ? 'Daily tokens donut may not expose tipTokens to amCharts scan — verify Tokens Received stat'
            : undefined,
        popup: { openFromHeading: 'Earnings' },
        periodToggle: period,
        chart: tokensChartRule(period, 'tipTokens'),
      }),
    );
  });

  rows.push(buildCountryTrendRow(testCaseKey, payload, fields, { singularRow, chartRow }));

  return rows;
}

function buildFollowExpectations(testCaseKey, payload) {
  const mapped = mapChartsPayloadToUiState(payload);
  const rows = [];
  rows.push(
    singularRow(testCaseKey, {
      idSuffix: 'singular.main.fans.newFollowers',
      view: 'Main',
      location: 'Fans card',
      metric: 'NEW FOLLOWERS',
      apiPath: 'ui.fans.daily.newFollowers',
      payload,
      expectedValue: resolveFansPeriodStat(mapped, 'day', 'newFollowers'),
      scan: { type: 'cardMetricByLabel', heading: 'Fans', label: 'NEW FOLLOWERS' },
    }),
  );
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
        payload,
        expectedValue: resolveFansPeriodStat(mapped, period, 'newFollowers'),
        popup: { openFromHeading: 'Fans' },
        periodToggle: period,
        scan: { type: 'popupStatByHeading', heading: 'New Followers' },
      }),
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
          payload,
          expectedValue: resolveFansChartField(mapped, period, 'newFollowers'),
          popup: { openFromHeading: 'Fans' },
          periodToggle: period,
          chart: chartRule,
        }),
      );
    }
  });
  return rows;
}

function buildProfileVisitExpectations(testCaseKey, payload) {
  const mapped = mapChartsPayloadToUiState(payload);
  const rows = [];
  rows.push(
    singularRow(testCaseKey, {
      idSuffix: 'singular.main.fans.profileVisit',
      view: 'Main',
      location: 'Fans card',
      metric: 'PROFILE VISIT',
      apiPath: 'ui.fans.daily.profileVisit',
      payload,
      expectedValue: resolveFansPeriodStat(mapped, 'day', 'profileVisit'),
      scan: { type: 'cardMetricByLabel', heading: 'Fans', label: 'PROFILE VISIT' },
    }),
  );
  POPUP_SCAN_PERIODS_WITH_ALLTIME.forEach((period) => {
    const apiP = apiPeriod(period);
    rows.push(
      singularRow(testCaseKey, {
        idSuffix: `singular.popup.fans.profileVisit.${period}`,
        view: 'Popup · Fans',
        location: 'Fans popup stat',
        metric: 'Profile Visit',
        period,
        apiPath: `ui.fans.${apiP}.profileVisit`,
        payload,
        expectedValue: resolveFansPeriodStat(mapped, period, 'profileVisit'),
        popup: { openFromHeading: 'Fans' },
        periodToggle: period,
        scan: { type: 'popupStatByHeading', heading: 'Total Profile Visit' },
      }),
    );
  });
  return rows;
}

function buildTagEngagementExpectations(testCaseKey, payload, fields) {
  const tagId = fields.tagId ?? 'Panty_Fetish';
  const tags = payload?.trendingTags?.daily;
  const match = Array.isArray(tags) ? tags.find((t) => String(t.tag).includes(tagId)) : null;
  const hasTag = match != null && Number(match.views) >= 1;
  return [
    createRow(`${testCaseKey}.singular.trends.tag`, {
      valueKind: 'singular',
      view: 'Trends',
      location: 'Top Tags',
      metric: tagId,
      period: 'day',
      apiPath: `trendingTags.daily[tag=${tagId}].views`,
      expectedValue: match?.views ?? null,
      source: 'api',
      knownGap: hasTag
        ? undefined
        : 'Tag views may be missing when clear-database is unavailable (404) or backend has not indexed the tag yet',
      scan: {
        type: 'apiArrayMatch',
        path: 'trendingTags.daily',
        matchKey: 'tag',
        matchValue: tagId,
        valueKey: 'views',
        min: 1,
      },
    }),
  ];
}

function buildCancelSubscriptionExpectations(testCaseKey, payload) {
  const mapped = mapChartsPayloadToUiState(payload);
  return [
    singularRow(testCaseKey, {
      idSuffix: 'singular.main.earnings.total',
      view: 'Main',
      location: 'Earnings card',
      metric: 'Total earnings',
      apiPath: 'ui.earningsInsights.daily.total',
      payload,
      expectedValue: resolveMainEarningsTotal(mapped),
      knownGap: 'Cancel may not reverse earnings in API',
      scan: { type: 'cardValueByHeading', heading: 'Earnings' },
    }),
  ];
}

export { PERIOD_API_KEY, getApiPathValue };
