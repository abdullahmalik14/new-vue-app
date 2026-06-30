import { PERIODS } from '../eventExpectations.js';

const CHART_PERIODS = PERIODS.filter((p) => p !== 'alltime');

export function createRow(id, row) {
  return { tolerance: 0.01, ...row, id };
}

export function addMainSubscriptionRows(rows, testCaseKey, { newCount = 1, recurringCount = 0 } = {}) {
  rows.push(
    createRow(`${testCaseKey}.main.subscribers.new.day.dom`, {
      view: 'Main',
      metric: 'Subscribers NEW',
      period: 'day',
      source: 'dom',
      expectedValue: newCount,
      scan: { type: 'cardValueByHeading', heading: 'Subscribers', field: 'new' },
    }),
  );

  if (recurringCount > 0) {
    rows.push(
      createRow(`${testCaseKey}.main.subscribers.recurring.day.dom`, {
        view: 'Main',
        metric: 'Subscribers RECURRING',
        period: 'day',
        source: 'dom',
        expectedValue: recurringCount,
        scan: { type: 'cardValueByHeading', heading: 'Subscribers', field: 'recurring' },
      }),
    );
  }
}

export function addMainEarningsRow(rows, testCaseKey, amount) {
  rows.push(
    createRow(`${testCaseKey}.main.earnings.total.day.dom`, {
      view: 'Main',
      metric: 'Total Earnings',
      period: 'day',
      source: 'dom',
      expectedValue: amount,
      scan: { type: 'cardValueByHeading', heading: 'Earnings' },
    }),
  );
}

export function addEarningsPopupRows(rows, testCaseKey, amount, { subscription = null, merch = null, tipTokens = null } = {}) {
  const chartExpected = { total: amount };
  if (subscription != null) chartExpected.subscription = subscription;
  if (merch != null) chartExpected.merch = merch;
  if (tipTokens != null) chartExpected.tipTokens = tipTokens;

  CHART_PERIODS.forEach((period) => {
    rows.push(
      createRow(`${testCaseKey}.popup.earnings.total.${period}.dom`, {
        view: 'Popup Earnings',
        metric: 'Total Earnings',
        period,
        source: 'dom',
        expectedValue: amount,
        popup: { openFromHeading: 'Earnings' },
        periodToggle: period,
        scan: { type: 'popupValueNearLabel', label: 'Total Earnings' },
      }),
      createRow(`${testCaseKey}.popup.earnings.chart.${period}.amcharts`, {
        view: 'Popup Earnings',
        metric: 'Chart JSON earnings',
        period,
        source: 'amcharts',
        expectedValue: chartExpected,
        popup: { openFromHeading: 'Earnings' },
        periodToggle: period,
        chart: {
          visibleOnly: true,
          chartIdIncludes: 'earnings',
          expectedDatasetKeyIncludes: 'earnings',
          fields: { total: 'total', subscription: 'subscription', merch: 'merch', tipTokens: 'tipTokens' },
        },
      }),
    );
  });
}

export function addSubscribersPopupRows(rows, testCaseKey, { newSubscriber = 1 } = {}) {
  CHART_PERIODS.forEach((period) => {
    rows.push(
      createRow(`${testCaseKey}.popup.subscribers.chart.${period}.amcharts`, {
        view: 'Popup Subscribers',
        metric: 'Chart JSON newSubscriber',
        period,
        source: 'amcharts',
        expectedValue: { newSubscriber },
        popup: { openFromHeading: 'Subscribers' },
        periodToggle: period,
        chart: {
          visibleOnly: true,
          chartIdIncludes: 'subs',
          fields: { newSubscriber: 'newSubscriber', recurringSubscriber: 'recurringSubscriber' },
        },
      }),
    );
  });
}

export function addContributorsApiRow(rows, testCaseKey, fanLabel) {
  rows.push(
    createRow(`${testCaseKey}.api.contributors.top`, {
      view: 'API',
      metric: 'Top contributor name',
      period: 'day',
      source: 'api',
      expectedValue: fanLabel,
      scan: { type: 'apiPath', path: 'contributors.topContributors.0.name' },
    }),
  );
}

export function addRecentOrdersApiRow(rows, testCaseKey, tab, minLength = 1) {
  rows.push(
    createRow(`${testCaseKey}.api.recentOrders.${tab}`, {
      view: 'Orders Received',
      metric: `${tab} row count`,
      period: 'day',
      source: 'api',
      expectedValue: minLength,
      scan: { type: 'apiPath', path: `recentOrders.${tab}.length` },
    }),
  );
}

export function addTrendingTagsApiRow(rows, testCaseKey, tagId, minViews = 1) {
  rows.push(
    createRow(`${testCaseKey}.api.trendingTags.${tagId}`, {
      view: 'Trends',
      metric: `Tag ${tagId} views`,
      period: 'day',
      source: 'api',
      expectedValue: minViews,
      scan: {
        type: 'apiArrayMatch',
        path: 'trendingTags.daily',
        matchKey: 'tag',
        matchValue: tagId,
        valueKey: 'views',
        min: minViews,
      },
    }),
  );
}

export function addTrendingMerchApiRow(rows, testCaseKey, minItems = 1) {
  rows.push(
    createRow(`${testCaseKey}.api.trendingMerch.daily`, {
      view: 'Trends',
      metric: 'Top Merch items',
      period: 'day',
      source: 'api',
      expectedValue: minItems,
      scan: { type: 'apiPath', path: 'trendingMerch.daily.length' },
    }),
  );
}

export function addMainFansMetricRow(rows, testCaseKey, metricLabel, expectedValue, { knownGap } = {}) {
  rows.push(
    createRow(`${testCaseKey}.main.fans.${metricLabel.replace(/\s+/g, '_').toLowerCase()}.day.dom`, {
      view: 'Main',
      metric: metricLabel,
      period: 'day',
      source: 'dom',
      expectedValue,
      knownGap,
      scan: { type: 'cardMetricByLabel', heading: 'Fans', label: metricLabel },
    }),
  );
}

export function addFanInsightsApiRow(rows, testCaseKey, field, minValue = 1, { knownGap } = {}) {
  rows.push(
    createRow(`${testCaseKey}.api.fanInsights.${field}.daily`, {
      view: 'API',
      metric: `fanInsights.daily ${field}`,
      period: 'day',
      source: 'api',
      expectedValue: minValue,
      knownGap,
      scan: { type: 'apiPath', path: `fanInsights.daily.-1.${field}` },
    }),
  );
}

export function addFansPopupRows(rows, testCaseKey, { newFollowers = null, profileVisit = null } = {}) {
  const popupPeriods = CHART_PERIODS.filter((p) => p !== 'day');

  popupPeriods.forEach((period) => {
    if (newFollowers != null) {
      rows.push(
        createRow(`${testCaseKey}.popup.fans.newFollowers.${period}.dom`, {
          view: 'Popup Fans',
          metric: 'New Followers',
          period,
          source: 'dom',
          expectedValue: newFollowers,
          popup: { openFromHeading: 'Fans' },
          periodToggle: period,
          scan: { type: 'popupStatByHeading', heading: 'New Followers' },
        }),
        createRow(`${testCaseKey}.popup.fans.chart.newFollowers.${period}.amcharts`, {
          view: 'Popup Fans',
          metric: 'Chart JSON newFollowers',
          period,
          source: 'amcharts',
          expectedValue: { newFollowers },
          popup: { openFromHeading: 'Fans' },
          periodToggle: period,
          chart: {
            visibleOnly: true,
            chartIdIncludes: 'fans',
            fields: { newFollowers: 'newFollowers', profileVisits: 'profileVisits' },
          },
        }),
      );
    }

    if (profileVisit != null) {
      rows.push(
        createRow(`${testCaseKey}.popup.fans.profileVisit.${period}.dom`, {
          view: 'Popup Fans',
          metric: 'Total Profile Visit',
          period,
          source: 'dom',
          expectedValue: profileVisit,
          popup: { openFromHeading: 'Fans' },
          periodToggle: period,
          scan: { type: 'popupStatByHeading', heading: 'Profile Visit' },
        }),
      );
    }
  });
}

export function addTokenEarningsApiRow(rows, testCaseKey, amount) {
  rows.push(
    createRow(`${testCaseKey}.api.earnings.tipTokens.day`, {
      view: 'API',
      metric: 'Daily tipTokens',
      period: 'day',
      source: 'api',
      expectedValue: amount,
      scan: { type: 'apiPath', path: 'earnings.daily.-1.tipTokens' },
    }),
  );
}
