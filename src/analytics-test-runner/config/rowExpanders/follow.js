import {
  addMainFansMetricRow,
  addFanInsightsApiRow,
  addFansPopupRows,
} from './helpers.js';

export function expandFollow(testCaseKey) {
  const rows = [];

  addMainFansMetricRow(rows, testCaseKey, 'NEW FOLLOWERS', 1, {
    knownGap: 'fans.daily can be null when fanInsights uses zero-filled arrays',
  });
  addFanInsightsApiRow(rows, testCaseKey, 'newFollowers', 1);
  addFansPopupRows(rows, testCaseKey, { newFollowers: 1 });

  return rows;
}
