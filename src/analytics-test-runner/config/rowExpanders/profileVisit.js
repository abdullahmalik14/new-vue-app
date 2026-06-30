import {
  addMainFansMetricRow,
  addFanInsightsApiRow,
  addFansPopupRows,
} from './helpers.js';

export function expandProfileVisit(testCaseKey) {
  const rows = [];

  addMainFansMetricRow(rows, testCaseKey, 'PROFILE VISIT', 1, {
    knownGap: 'fans.daily can be null when fanInsights uses zero-filled arrays',
  });
  addFanInsightsApiRow(rows, testCaseKey, 'profileVisits', 1);
  addFansPopupRows(rows, testCaseKey, { profileVisit: 1 });

  return rows;
}
