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
import {
  getStateMetric,
  resolveMainSubscribersNewPercentageFromState,
  resolveMainEarningsPercentageFromState,
} from './stateMetricResolver.js';
import { appendStatePercentageRows } from './percentageExpectationRows.js';
import {
  buildLikesFieldExpectationsFromState,
  buildUnfollowExpectationsFromState,
  buildP2vOrderExpectationsFromState,
  buildMediaViewExpectationsFromState,
  buildMediaWatchDurationExpectationsFromState,
  buildMerchTrendRowFromState,
  buildCountryTrendRowFromState,
  buildContributorsPreviewRowsFromState,
  buildContributorsPopupApiRowsFromState,
} from './allExpectationBuilders.js';

const PERIOD_API_KEY = {
  day: 'daily',
  week: 'weekly',
  month: 'monthly',
  year: 'yearly',
  alltime: 'alltime',
};

function createRow(id, row) {
  return { tolerance: 0.01, ...row, id };
}

function apiPeriod(period) {
  return PERIOD_API_KEY[period] || period;
}

function singularRow(testCaseKey, config, state) {
  const expectedValue =
    config.expectedValue !== undefined
      ? config.expectedValue
      : getStateMetric(state, config.apiPath, {
          period: config.period,
          countryId: config.countryId,
          mediaId: config.mediaId,
          tagId: config.tagId,
        });
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

function chartRow(testCaseKey, config, state) {
  const expectedValue =
    config.expectedValue !== undefined
      ? config.expectedValue
      : getStateMetric(state, config.apiPath, { period: config.period });
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

const BUILDERS = {
  newSubscription: buildNewSubscriptionExpectations,
  recurringSubscription: buildRecurringSubscriptionExpectations,
  switchSubscription: (key, state, f) => buildNewSubscriptionExpectations(key, state, f),
  merchOrder: buildMerchOrderExpectations,
  p2vOrder: (key, state, f) => buildP2vOrderExpectationsFromState(key, state, f, rowFns),
  tokenOrder: buildTokenOrderExpectations,
  follow: buildFollowExpectations,
  unfollow: (key, state) => buildUnfollowExpectationsFromState(key, state, rowFns),
  profileVisit: buildProfileVisitExpectations,
  mediaLike: (key, state) => buildLikesFieldExpectationsFromState(key, state, 'media', rowFns),
  mediaUnlike: (key, state) => buildLikesFieldExpectationsFromState(key, state, 'media', rowFns),
  profileLike: (key, state) => buildLikesFieldExpectationsFromState(key, state, 'profile', rowFns),
  profileUnlike: (key, state) => buildLikesFieldExpectationsFromState(key, state, 'profile', rowFns),
  merchLike: (key, state) => buildLikesFieldExpectationsFromState(key, state, 'merch', rowFns),
  merchUnlike: (key, state) => buildLikesFieldExpectationsFromState(key, state, 'merch', rowFns),
  feedLike: (key, state) => buildLikesFieldExpectationsFromState(key, state, 'feed', rowFns),
  feedUnlike: (key, state) => buildLikesFieldExpectationsFromState(key, state, 'feed', rowFns),
  tagEngagement: buildTagEngagementExpectations,
  cancelSubscription: buildCancelSubscriptionExpectations,
  mediaView: (key, state, f) => buildMediaViewExpectationsFromState(key, state, f, rowFns),
  mediaWatchDuration: (key, state, f) => buildMediaWatchDurationExpectationsFromState(key, state, f, rowFns),
};

const rowFns = { singularRow, chartRow };

/**
 * Build expectation rows from internal state (never from live API payload).
 * @param {string} testCaseKey
 * @param {import('./expectationState.js').ReturnType<typeof import('./expectationState.js').createEmptyExpectationState>} expectationState
 * @param {{ fields?: Record<string, unknown> }} [options]
 */
export function buildExpectationsFromState(testCaseKey, expectationState, { fields = {} } = {}) {
  const builder = BUILDERS[testCaseKey];
  if (!builder) {
    throw new Error(`No state expectation builder for: ${testCaseKey}`);
  }
  const rows = builder(testCaseKey, expectationState, fields);
  appendStatePercentageRows(rows, testCaseKey, expectationState, (key, cfg) =>
    singularRow(key, cfg, expectationState),
  );
  return rows.filter((row) => row.expectedValue != null || row.knownGap);
}

/**
 * Union expectation rows for mixed event history (dedupe by row id).
 * @param {Array<{ testCaseKey: string, fields?: object }>} eventHistory
 * @param {import('./expectationState.js').ReturnType<typeof import('./expectationState.js').createEmptyExpectationState>} expectationState
 */
export function buildExpectationsFromEventHistory(eventHistory, expectationState) {
  const byId = new Map();
  eventHistory.forEach((event) => {
    const fields = event.fields || {};
    const rows = buildExpectationsFromState(event.testCaseKey, expectationState, { fields });
    rows.forEach((row) => {
      if (!byId.has(row.id)) {
        byId.set(row.id, row);
      }
    });
  });
  return [...byId.values()];
}

function buildNewSubscriptionExpectations(testCaseKey, state, fields) {
  const planId = Number(fields.planId ?? 2);
  const planTierKey = `tier${planId}`;
  const countryId = Number(fields.countryId ?? 702);
  const countryName = resolveTrendingCountryDisplayName(countryId);
  const rows = [];

  rows.push(
    singularRow(testCaseKey, {
      idSuffix: 'singular.main.subscribers.new',
      view: 'Main',
      location: 'Subscribers card',
      metric: 'NEW subscribers',
      apiPath: 'ui.subscriberInsights.daily.new',
      scan: { type: 'metricSelector', metric: 'subscribers.new', period: 'day', surface: 'main' },
    }, state),
    singularRow(testCaseKey, {
      idSuffix: 'singular.main.earnings.total',
      view: 'Main',
      location: 'Earnings card',
      metric: 'Total earnings',
      apiPath: 'ui.earningsInsights.daily.total',
      scan: { type: 'metricSelector', metric: 'earnings.total', period: 'day', surface: 'main' },
    }, state),
    singularRow(testCaseKey, {
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
    }, state),
    ...buildContributorsPreviewRowsFromState(testCaseKey, state, rowFns),
    ...buildContributorsPopupApiRowsFromState(testCaseKey, state, rowFns),
  );

  POPUP_SCAN_PERIODS_WITH_ALLTIME.forEach((period) => {
    const apiP = apiPeriod(period);
    rows.push(
      singularRow(testCaseKey, {
        idSuffix: `singular.popup.earnings.total.${period}`,
        view: 'Popup · Earnings',
        location: 'Earnings popup header',
        metric: 'Total earnings',
        period,
        apiPath: `ui.earningsPopup.${apiP}.total`,
        popup: { openFromHeading: 'Earnings' },
        periodToggle: period,
        scan: { type: 'metricSelector', metric: 'earnings.total', period, surface: 'popup-earnings' },
      }, state),
      ...(period !== 'day'
        ? [
            chartRow(testCaseKey, {
              idSuffix: `chart.popup.earnings.total.${period}`,
              view: 'Popup · Earnings',
              location: 'Earnings chart dataset',
              metric: 'earnings.total',
              period,
              apiPath: `ui.earningsChart.${apiP}.total`,
              popup: { openFromHeading: 'Earnings' },
              periodToggle: period,
              scan: { type: 'chartContract', chartId: `sales-${period === 'week' ? 'weekly' : period === 'month' ? 'monthly' : period === 'year' ? 'yearly' : 'alltime'}-bar`, period, metric: 'earnings.total', shape: 'last' },
              chart: earningsChartRule(period, 'total'),
            }, state),
          ]
        : []),
      chartRow(testCaseKey, {
        idSuffix: `chart.popup.earnings.subscription.${period}`,
        view: 'Popup · Earnings',
        location: 'Earnings chart dataset',
        metric: 'earnings.subscription',
        period,
        apiPath: `ui.earningsChart.${apiP}.subscription`,
        popup: { openFromHeading: 'Earnings' },
        periodToggle: period,
        scan: period === 'day'
          ? { type: 'chartContract', chartId: 'sales-daily-donut', period, metric: 'earnings.subscription', shape: 'scalar' }
          : { type: 'chartContract', chartId: `sales-${period === 'week' ? 'weekly' : period === 'month' ? 'monthly' : period === 'year' ? 'yearly' : 'alltime'}-bar`, period, metric: 'earnings.subscription', shape: 'last' },
        chart: earningsChartRule(period, 'subscription'),
      }, state),
      chartRow(testCaseKey, {
        idSuffix: `chart.popup.subscribers.new.${period}`,
        view: 'Popup · Subscribers',
        location: 'Subscribers chart dataset',
        metric: 'subscribers.new',
        period,
        apiPath: `ui.subsChart.${apiP}.newSubscriber`,
        popup: { openFromHeading: 'Subscribers' },
        periodToggle: period,
        scan: period === 'day'
          ? { type: 'chartContract', chartId: 'subs-daily-donut', period, metric: 'subscribers.new', shape: 'scalar' }
          : { type: 'chartContract', chartId: `subs-${period === 'week' ? 'weekly' : period === 'month' ? 'monthly' : period === 'year' ? 'yearly' : 'alltime'}-bar`, period, metric: 'subscribers.new', shape: 'last' },
        chart: subscribersChartRule(period, 'newSubscriber'),
      }, state),
      chartRow(testCaseKey, {
        idSuffix: `chart.popup.subscribers.plan.${period}`,
        view: 'Popup · Subscribers',
        location: 'Subscribers chart dataset (plan tier)',
        metric: `subscribers.${planTierKey}`,
        period,
        apiPath: `ui.subsChart.${apiP}.${planTierKey}`,
        popup: { openFromHeading: 'Subscribers' },
        periodToggle: period,
        scan: period === 'day'
          ? { type: 'chartContract', chartId: 'tiers-daily-donut', period, metric: `subscribers.${planTierKey}`, shape: 'scalar' }
          : { type: 'chartContract', chartId: `tiers-${period === 'week' ? 'weekly' : period === 'month' ? 'monthly' : period === 'year' ? 'yearly' : 'alltime'}-bar`, period, metric: `subscribers.${planTierKey}`, shape: 'last' },
        chart: subscribersChartRule(period, planTierKey),
      }, state),
    );
  });

  return rows;
}

function buildRecurringSubscriptionExpectations(testCaseKey, state, fields) {
  const rows = buildNewSubscriptionExpectations(testCaseKey, state, fields);
  rows.push(
    singularRow(testCaseKey, {
      idSuffix: 'singular.main.subscribers.recurring',
      view: 'Main',
      location: 'Subscribers card',
      metric: 'RECURRING subscribers',
      apiPath: 'ui.subscriberInsights.daily.recurring',
      scan: { type: 'metricSelector', metric: 'subscribers.recurring', period: 'day', surface: 'main' },
    }, state),
    buildCountryTrendRowFromState(testCaseKey, state, fields, rowFns),
  );
  return rows;
}

function buildMerchOrderExpectations(testCaseKey, state, fields) {
  const rows = [
    singularRow(testCaseKey, {
      idSuffix: 'singular.main.earnings.total',
      view: 'Main',
      location: 'Earnings card',
      metric: 'Total earnings',
      apiPath: 'ui.earningsInsights.daily.total',
      scan: { type: 'metricSelector', metric: 'earnings.total', period: 'day', surface: 'main' },
    }, state),
    ...buildContributorsPreviewRowsFromState(testCaseKey, state, rowFns),
    ...buildContributorsPopupApiRowsFromState(testCaseKey, state, rowFns),
  ];
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
        popup: { openFromHeading: 'Earnings' },
        periodToggle: period,
        chart: earningsChartRule(period, 'merch'),
      }, state),
    );
  });
  rows.push(buildMerchTrendRowFromState(testCaseKey, state, rowFns));
  rows.push(buildCountryTrendRowFromState(testCaseKey, state, fields, rowFns));
  return rows;
}

function buildTokenOrderExpectations(testCaseKey, state, fields) {
  const rows = [
    ...buildContributorsPreviewRowsFromState(testCaseKey, state, rowFns),
    ...buildContributorsPopupApiRowsFromState(testCaseKey, state, rowFns),
  ];
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
        popup: { openFromHeading: 'Earnings' },
        periodToggle: period,
        scan: { type: 'metricSelector', metric: 'earnings.tokens-received', period, surface: 'popup-earnings' },
      }, state),
      chartRow(testCaseKey, {
        idSuffix: `chart.popup.earnings.tipTokens.${period}`,
        view: 'Popup · Earnings',
        location: 'Token insights chart dataset',
        metric: 'tipTokens',
        period,
        apiPath: `ui.earningsChart.${apiP}.tipTokens`,
        knownGap:
          period === 'day'
            ? 'Daily tokens donut may not expose tipTokens to amCharts scan — verify Tokens Received stat'
            : undefined,
        popup: { openFromHeading: 'Earnings' },
        periodToggle: period,
        chart: tokensChartRule(period, 'tipTokens'),
      }, state),
    );
  });
  rows.push(buildCountryTrendRowFromState(testCaseKey, state, fields, rowFns));
  return rows;
}

function buildFollowExpectations(testCaseKey, state) {
  const rows = [
    singularRow(testCaseKey, {
      idSuffix: 'singular.main.fans.newFollowers',
      view: 'Main',
      location: 'Fans card',
      metric: 'NEW FOLLOWERS',
      apiPath: 'ui.fans.daily.newFollowers',
      scan: { type: 'metricSelector', metric: 'fans.new-followers', period: 'day', surface: 'main' },
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
        scan: { type: 'metricSelector', metric: 'fans.new-followers', period, surface: 'popup-fans' },
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

function buildProfileVisitExpectations(testCaseKey, state) {
  const rows = [
    singularRow(testCaseKey, {
      idSuffix: 'singular.main.fans.profileVisit',
      view: 'Main',
      location: 'Fans card',
      metric: 'PROFILE VISIT',
      apiPath: 'ui.fans.daily.profileVisit',
      scan: { type: 'metricSelector', metric: 'fans.profile-visits', period: 'day', surface: 'main' },
    }, state),
  ];
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
        popup: { openFromHeading: 'Fans' },
        periodToggle: period,
        scan: { type: 'metricSelector', metric: 'fans.profile-visits', period, surface: 'popup-fans' },
      }, state),
    );
  });
  return rows;
}

function buildTagEngagementExpectations(testCaseKey, state, fields) {
  const tagId = fields.tagId ?? 'Panty_Fetish';
  const views = getStateMetric(state, `trendingTags.daily[tag=${tagId}].views`, { tagId });
  return [
    createRow(`${testCaseKey}.singular.trends.tag`, {
      valueKind: 'singular',
      view: 'Trends',
      location: 'Top Tags',
      metric: tagId,
      period: 'day',
      apiPath: `trendingTags.daily[tag=${tagId}].views`,
      expectedValue: views,
      source: 'api',
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

function buildCancelSubscriptionExpectations(testCaseKey, state) {
  return [
    singularRow(testCaseKey, {
      idSuffix: 'singular.main.earnings.total',
      view: 'Main',
      location: 'Earnings card',
      metric: 'Total earnings',
      apiPath: 'ui.earningsInsights.daily.total',
      knownGap: 'Cancel may not reverse earnings in API',
      scan: { type: 'metricSelector', metric: 'earnings.total', period: 'day', surface: 'main' },
    }, state),
  ];
}

export { PERIOD_API_KEY, apiPeriod };
