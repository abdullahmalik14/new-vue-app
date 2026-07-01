import { POPUP_SCAN_PERIODS } from '../../utils/periodMap.js';
import { CONTRIBUTORS_PREVIEW_PERIOD } from '../uiExpectationResolver.js';

export function createRow(id, row) {
  return { tolerance: 0.01, ...row, id };
}

export function addMainSubscriptionRows(rows, testCaseKey, { newCount = 1, recurringCount = 0 } = {}) {
  rows.push(
    createRow(`${testCaseKey}.main.subscribers.new.day.dom`, {
      view: 'Main · Subscribers',
      metric: 'NEW',
      period: 'day',
      source: 'dom',
      expectedValue: newCount,
      scan: { type: 'cardValueByHeading', heading: 'Subscribers', field: 'new' },
    }),
  );

  if (recurringCount > 0) {
    rows.push(
      createRow(`${testCaseKey}.main.subscribers.recurring.day.dom`, {
        view: 'Main · Subscribers',
        metric: 'RECURRING',
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
      view: 'Main · Earnings',
      metric: 'Total',
      period: 'day',
      source: 'dom',
      expectedValue: amount,
      scan: { type: 'cardValueByHeading', heading: 'Earnings' },
    }),
  );
}

function addPopupDatasetRows(rows, testCaseKey, { view, popupHeading, period, chartIdIncludes, fields }) {
  Object.entries(fields).forEach(([fieldName, expectedValue]) => {
    if (expectedValue == null) return;
    rows.push(
      createRow(`${testCaseKey}.popup.${popupHeading}.${fieldName}.${period}.dataset`, {
        view,
        metric: fieldName,
        period,
        source: 'dataset',
        expectedValue,
        popup: { openFromHeading: popupHeading },
        periodToggle: period,
        chart: { chartIdIncludes, field: fieldName },
      }),
    );
  });
}

export function addEarningsPopupRows(rows, testCaseKey, amount, { subscription = null, merch = null, tipTokens = null } = {}) {
  const datasetFields = { total: amount };
  if (subscription != null) datasetFields.subscription = subscription;
  if (merch != null) datasetFields.merch = merch;
  if (tipTokens != null) datasetFields.tipTokens = tipTokens;

  POPUP_SCAN_PERIODS.forEach((period) => {
    rows.push(
      createRow(`${testCaseKey}.popup.earnings.total.${period}.dom`, {
        view: 'Popup · Earnings',
        metric: 'Total Earnings',
        period,
        source: 'dom',
        expectedValue: amount,
        popup: { openFromHeading: 'Earnings' },
        periodToggle: period,
        scan: { type: 'popupValueNearLabel', label: 'Total Earnings' },
      }),
    );
    addPopupDatasetRows(rows, testCaseKey, {
      view: 'Popup · Earnings',
      popupHeading: 'Earnings',
      period,
      chartIdIncludes: 'earnings',
      fields: datasetFields,
    });
  });
}

export function addSubscribersPopupRows(rows, testCaseKey, { newSubscriber = 1, recurringSubscriber = 0 } = {}) {
  POPUP_SCAN_PERIODS.forEach((period) => {
    addPopupDatasetRows(rows, testCaseKey, {
      view: 'Popup · Subscribers',
      popupHeading: 'Subscribers',
      period,
      chartIdIncludes: 'subs',
      fields: { newSubscriber, recurringSubscriber },
    });
  });
}

export function addContributorsApiRow(rows, testCaseKey, fanLabel) {
  const periodKey = CONTRIBUTORS_PREVIEW_PERIOD === 'alltime' ? 'alltime' : 'daily';
  rows.push(
    createRow(`${testCaseKey}.api.contributors.top`, {
      view: 'API',
      metric: 'Top contributor name',
      period: CONTRIBUTORS_PREVIEW_PERIOD,
      source: 'api',
      expectedValue: fanLabel,
      knownGap: 'contributors.topContributors missing from /api/charts when section absent',
      scan: { type: 'apiPath', path: `contributors.topContributors.${periodKey}.-1.name` },
    }),
    createRow(`${testCaseKey}.api.contributors.amount`, {
      view: 'API',
      metric: 'Top contributor amount',
      period: CONTRIBUTORS_PREVIEW_PERIOD,
      source: 'api',
      scan: { type: 'apiPath', path: `contributors.topContributors.${periodKey}.-1.usdSpent` },
    }),
  );
}

export function addRecentOrdersApiRow(rows, testCaseKey, tab, minLength = 1) {
  rows.push(
    createRow(`${testCaseKey}.api.recentOrders.${tab}`, {
      view: 'Orders Received',
      location: 'Orders Received table',
      metric: `${tab} rows`,
      period: 'day',
      source: 'api',
      expectedValue: minLength,
      knownGap: 'recentOrders missing from /api/charts payload — Orders Received table stays empty',
      scan: { type: 'apiPath', path: `recentOrders.${tab}.length` },
    }),
  );
}

export function addTrendingTagsApiRow(rows, testCaseKey, tagId, minViews = 1) {
  rows.push(
    createRow(`${testCaseKey}.api.trendingTags.${tagId}`, {
      view: 'Trends',
      metric: tagId,
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
      metric: 'Top Merch count',
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
      view: 'Main · Fans',
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
      metric: field,
      period: 'day',
      source: 'api',
      expectedValue: minValue,
      knownGap,
      scan: { type: 'apiPath', path: `fanInsights.daily.-1.${field}` },
    }),
  );
}

export function addFansPopupRows(rows, testCaseKey, { newFollowers = null, profileVisit = null } = {}) {
  const chartPeriods = POPUP_SCAN_PERIODS.filter((period) => period !== 'day');

  POPUP_SCAN_PERIODS.forEach((period) => {
    if (newFollowers != null) {
      rows.push(
        createRow(`${testCaseKey}.popup.fans.newFollowers.${period}.dom`, {
          view: 'Popup · Fans',
          metric: 'New Followers',
          period,
          source: 'dom',
          expectedValue: newFollowers,
          popup: { openFromHeading: 'Fans' },
          periodToggle: period,
          scan: { type: 'popupStatByHeading', heading: 'New Followers' },
        }),
      );
    }

    if (profileVisit != null) {
      rows.push(
        createRow(`${testCaseKey}.popup.fans.profileVisit.${period}.dom`, {
          view: 'Popup · Fans',
          metric: 'Profile Visit',
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

  chartPeriods.forEach((period) => {
    if (newFollowers != null) {
      addPopupDatasetRows(rows, testCaseKey, {
        view: 'Popup · Fans',
        popupHeading: 'Fans',
        period,
        chartIdIncludes: 'fans',
        fields: { newFollowers },
      });
    }
    if (profileVisit != null) {
      addPopupDatasetRows(rows, testCaseKey, {
        view: 'Popup · Fans',
        popupHeading: 'Fans',
        period,
        chartIdIncludes: 'fans',
        fields: { profileVisits: profileVisit },
      });
    }
  });
}

export function addTokenEarningsApiRow(rows, testCaseKey, amount) {
  rows.push(
    createRow(`${testCaseKey}.api.earnings.tipTokens.day`, {
      view: 'API',
      metric: 'tipTokens',
      period: 'day',
      source: 'api',
      expectedValue: amount,
      scan: { type: 'apiPath', path: 'earnings.daily.-1.tipTokens' },
    }),
  );
}