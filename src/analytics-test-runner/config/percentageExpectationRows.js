import { POPUP_SCAN_PERIODS_WITH_ALLTIME } from '../utils/periodMap.js';
import {
  resolveMainSubscribersNewPercentageFromMapped,
  resolveMainSubscribersRecurringPercentage,
  resolveMainEarningsPercentageFromMapped,
  resolveFansMainPercentage,
  resolveLikesMainPercentage,
  resolvePopupSubsPercent,
  resolvePopupEarningsPercent,
  resolvePopupFansPercent,
} from './percentageResolvers.js';

const PERCENT_ROW = {
  tolerance: 0,
  source: 'dom',
};

function mainCardPercentRow(testCaseKey, singularRow, config) {
  return singularRow(testCaseKey, {
    ...PERCENT_ROW,
    view: 'Main',
    period: 'day',
    ...config,
  });
}

function popupPercentRow(testCaseKey, singularRow, config) {
  return singularRow(testCaseKey, {
    ...PERCENT_ROW,
    source: 'dom',
    ...config,
  });
}

/**
 * Main overview card % rows (vs yesterday) — EVENT_USAGE.md + overview section.
 */
export function appendMainOverviewPercentageRows(rows, testCaseKey, mapped, singularRow) {
  const subscriptionCases = new Set([
    'newSubscription',
    'recurringSubscription',
    'cancelSubscription',
  ]);
  const earningsCases = new Set([
    'newSubscription',
    'recurringSubscription',
    'merchOrder',
    'cancelSubscription',
  ]);
  const fansCases = new Set(['follow', 'profileVisit']);

  if (subscriptionCases.has(testCaseKey)) {
    rows.push(
      mainCardPercentRow(testCaseKey, singularRow, {
        idSuffix: 'singular.main.subscribers.newPercentage',
        location: 'Subscribers card',
        metric: 'NEW subscribers % vs yesterday',
        apiPath: 'ui.subscriberInsights.daily.newPercentage',
        expectedValue: resolveMainSubscribersNewPercentageFromMapped(mapped),
        scan: { type: 'cardPercentageByHeading', heading: 'Subscribers', field: 'new' },
      }),
      mainCardPercentRow(testCaseKey, singularRow, {
        idSuffix: 'singular.main.subscribers.recurringPercentage',
        location: 'Subscribers card',
        metric: 'RECURRING subscribers % vs yesterday',
        apiPath: 'ui.subscriberInsights.daily.recurringPercentage',
        expectedValue: resolveMainSubscribersRecurringPercentage(mapped),
        scan: { type: 'cardPercentageByHeading', heading: 'Subscribers', field: 'recurring' },
      }),
    );
  }

  if (earningsCases.has(testCaseKey)) {
    rows.push(
      mainCardPercentRow(testCaseKey, singularRow, {
        idSuffix: 'singular.main.earnings.percentage',
        location: 'Earnings card',
        metric: 'Earnings % vs yesterday',
        apiPath: 'ui.earningsInsights.daily.percentage',
        expectedValue: resolveMainEarningsPercentageFromMapped(mapped),
        scan: { type: 'cardPercentageByHeading', heading: 'Earnings' },
      }),
    );
  }

  if (fansCases.has(testCaseKey)) {
    rows.push(
      mainCardPercentRow(testCaseKey, singularRow, {
        idSuffix: 'singular.main.fans.newFollowersPercentage',
        location: 'Fans card',
        metric: 'NEW FOLLOWERS % vs yesterday',
        apiPath: 'ui.fans.daily.newFollowersPercentage',
        expectedValue: resolveFansMainPercentage(mapped, 'newFollowers'),
        scan: { type: 'cardMetricPercentage', heading: 'Fans', label: 'NEW FOLLOWERS' },
      }),
      mainCardPercentRow(testCaseKey, singularRow, {
        idSuffix: 'singular.main.fans.profileVisitPercentage',
        location: 'Fans card',
        metric: 'PROFILE VISIT % vs yesterday',
        apiPath: 'ui.fans.daily.profileVisitPercentage',
        expectedValue: resolveFansMainPercentage(mapped, 'profileVisit'),
        scan: { type: 'cardMetricPercentage', heading: 'Fans', label: 'PROFILE VISIT' },
      }),
    );
  }
}

/**
 * Likes overview % — included when the event touches likes (runnable: none yet; kept for mediaLike etc.).
 */
export function appendLikesPercentageRows(rows, testCaseKey, mapped, singularRow) {
  const likesFieldByCase = {
    mediaLike: ['media'],
    mediaUnlike: ['media'],
    profileLike: ['profile'],
    profileUnlike: ['profile'],
    merchLike: ['merch'],
    merchUnlike: ['merch'],
    feedLike: ['feed'],
    feedUnlike: ['feed'],
  };
  const fields = likesFieldByCase[testCaseKey];
  if (!fields) return;

  fields.forEach((field) => {
    rows.push(
      mainCardPercentRow(testCaseKey, singularRow, {
        idSuffix: `singular.main.likes.${field}Percentage`,
        location: 'Likes card',
        metric: `${field.toUpperCase()} % vs yesterday`,
        apiPath: `ui.likes.${field}Percentage`,
        expectedValue: resolveLikesMainPercentage(mapped, field),
        scan: { type: 'cardMetricPercentage', heading: 'Likes', label: field.toUpperCase() },
      }),
    );
  });
}

/**
 * Popup header % rows (day/week/month/year) — mirrors trend popup stat headers.
 */
export function appendPopupPercentageRows(rows, testCaseKey, mapped, singularRow) {
  const subscriptionPopups = new Set(['newSubscription', 'recurringSubscription', 'cancelSubscription']);
  const earningsPopups = new Set([
    'newSubscription',
    'recurringSubscription',
    'merchOrder',
    'cancelSubscription',
  ]);
  const tokenPopups = new Set(['tokenOrder']);
  const fansPopups = new Set(['follow', 'profileVisit']);

  POPUP_SCAN_PERIODS_WITH_ALLTIME.forEach((period) => {
    if (subscriptionPopups.has(testCaseKey)) {
      ['new', 'recurring'].forEach((field) => {
        const expected = resolvePopupSubsPercent(mapped, period, field);
        rows.push(
          popupPercentRow(testCaseKey, singularRow, {
            idSuffix: `singular.popup.subscribers.${field}Percentage.${period}`,
            view: 'Popup · Subscribers',
            location: 'Subscribers popup stat header',
            metric: `${field === 'new' ? 'New' : 'Recurring'} subscribers %`,
            period,
            apiPath: `ui.popupSubs.${period}.${field}Percentage`,
            expectedValue: expected,
            knownGap:
              'Subscribers popup % stat cards are commented out in DashboardAnalyticsSubscribersTrendPopup.vue',
            popup: { openFromHeading: 'Subscribers' },
            periodToggle: period,
            scan: {
              type: 'popupPercentageByStatHeading',
              statHeading: field === 'new' ? 'New Subscribers' : 'Recurring Subscribers',
            },
          }),
        );
      });
    }

    if (earningsPopups.has(testCaseKey)) {
      rows.push(
        popupPercentRow(testCaseKey, singularRow, {
          idSuffix: `singular.popup.earnings.totalPercentage.${period}`,
          view: 'Popup · Earnings',
          location: 'Earnings popup stat header',
          metric: 'Total earnings %',
          period,
          apiPath: `ui.popupEarnings.${period}.totalPercentage`,
          expectedValue: resolvePopupEarningsPercent(mapped, period, 'total'),
          popup: { openFromHeading: 'Earnings' },
          periodToggle: period,
          scan: { type: 'popupPercentageByStatHeading', statHeading: 'Total Earnings' },
        }),
        popupPercentRow(testCaseKey, singularRow, {
          idSuffix: `singular.popup.earnings.tokensPercentage.${period}`,
          view: 'Popup · Earnings',
          location: 'Earnings popup stat header',
          metric: 'Tokens received %',
          period,
          apiPath: `ui.popupEarnings.${period}.tokensPercentage`,
          expectedValue: resolvePopupEarningsPercent(mapped, period, 'tokens'),
          popup: { openFromHeading: 'Earnings' },
          periodToggle: period,
          scan: { type: 'popupPercentageByStatHeading', statHeading: 'Tokens Received' },
        }),
      );
    }

    if (tokenPopups.has(testCaseKey)) {
      rows.push(
        popupPercentRow(testCaseKey, singularRow, {
          idSuffix: `singular.popup.earnings.tokensPercentage.${period}`,
          view: 'Popup · Earnings',
          location: 'Earnings popup stat header',
          metric: 'Tokens received %',
          period,
          apiPath: `ui.popupEarnings.${period}.tokensPercentage`,
          expectedValue: resolvePopupEarningsPercent(mapped, period, 'tokens'),
          popup: { openFromHeading: 'Earnings' },
          periodToggle: period,
          scan: { type: 'popupPercentageByStatHeading', statHeading: 'Tokens Received' },
        }),
      );
    }

    if (fansPopups.has(testCaseKey)) {
      rows.push(
        popupPercentRow(testCaseKey, singularRow, {
          idSuffix: `singular.popup.fans.newFollowersPercentage.${period}`,
          view: 'Popup · Fans',
          location: 'Fans popup stat header',
          metric: 'New Followers %',
          period,
          apiPath: `ui.popupFans.${period}.newFollowersPercentage`,
          expectedValue: resolvePopupFansPercent(mapped, period, 'newFollowers'),
          popup: { openFromHeading: 'Fans' },
          periodToggle: period,
          scan: { type: 'popupPercentageByStatHeading', statHeading: 'New Followers' },
        }),
        popupPercentRow(testCaseKey, singularRow, {
          idSuffix: `singular.popup.fans.profileVisitPercentage.${period}`,
          view: 'Popup · Fans',
          location: 'Fans popup stat header',
          metric: 'Profile Visit %',
          period,
          apiPath: `ui.popupFans.${period}.profileVisitPercentage`,
          expectedValue: resolvePopupFansPercent(mapped, period, 'profileVisit'),
          popup: { openFromHeading: 'Fans' },
          periodToggle: period,
          scan: { type: 'popupPercentageByStatHeading', statHeading: 'Total Profile Visit' },
        }),
      );
    }
  });
}

export function appendAllPercentageRows(rows, testCaseKey, mapped, singularRow) {
  appendMainOverviewPercentageRows(rows, testCaseKey, mapped, singularRow);
  appendLikesPercentageRows(rows, testCaseKey, mapped, singularRow);
  appendPopupPercentageRows(rows, testCaseKey, mapped, singularRow);
  return rows;
}
