import { getEventIncrement } from './eventDeltas.js';
import {
  mapChartsPayloadToUiState,
  resolveMainSubscribersNew,
  resolveMainSubscribersRecurring,
  resolveMainEarningsTotal,
  resolveEarningsPopupTotal,
  resolveEarningsChartField,
  resolveSubsChartField,
  resolveTrendingCountrySales,
  resolveFansPeriodStat,
  resolveLikesMainMetric,
  resolveLikesChartField,
  resolveEarningsPopupTokensReceived,
  resolveTopContributorField,
  CONTRIBUTORS_PREVIEW_PERIOD,
} from './uiExpectationResolver.js';
import {
  resolveMainSubscribersNewPercentageFromMapped,
  resolveMainEarningsPercentageFromMapped,
} from './percentageResolvers.js';

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function applyDelta(baselineVal, delta) {
  return num(baselineVal) + num(delta);
}

/**
 * After a mandatory DB clear, recompute singular/chart expectations as baseline + one event delta.
 * Also records API delta mismatches on the row for the comparison table.
 *
 * @param {object[]} rows
 * @param {{ testCaseKey: string, fields: Record<string, unknown>, baselinePayload: object, afterPayload: object }} ctx
 */
export function applyIncrementalExpectations(rows, ctx) {
  const { testCaseKey, fields, baselinePayload, afterPayload } = ctx;
  if (!baselinePayload || !afterPayload) return rows;

  const increment = getEventIncrement(testCaseKey, fields);
  const baseline = mapChartsPayloadToUiState(baselinePayload);
  const after = mapChartsPayloadToUiState(afterPayload);

  const patch = (row, expectedValue, afterValue) => {
    if (expectedValue == null) return row;
    const next = { ...row, expectedValue };
    if (afterValue != null && Math.abs(num(afterValue) - num(expectedValue)) > (row.tolerance ?? 0.01)) {
      next.deltaWarning = `API after clear expected ${expectedValue} but charts returned ${afterValue}`;
    }
    return next;
  };

  return rows.map((row) => {
    const id = row.id || '';

    if (id.includes('singular.main.subscribers.new') && !id.includes('Percentage')) {
      const expected = applyDelta(resolveMainSubscribersNew(baseline), increment.subscribersNew);
      return patch(row, expected, resolveMainSubscribersNew(after));
    }

    if (id.includes('singular.main.subscribers.recurring')) {
      const expected = applyDelta(resolveMainSubscribersRecurring(baseline), increment.subscribersRecurring ?? 0);
      return patch(row, expected, resolveMainSubscribersRecurring(after));
    }

    if (id.includes('singular.main.subscribers.newPercentage')) {
      return patch(
        row,
        resolveMainSubscribersNewPercentageFromMapped(after),
        resolveMainSubscribersNewPercentageFromMapped(after),
      );
    }

    if (id.includes('singular.main.earnings.percentage')) {
      return patch(row, resolveMainEarningsPercentageFromMapped(after), resolveMainEarningsPercentageFromMapped(after));
    }

    if (id.includes('singular.main.earnings.total')) {
      const expected = applyDelta(resolveMainEarningsTotal(baseline), increment.earningsTotal ?? 0);
      return patch(row, expected, resolveMainEarningsTotal(after));
    }

    if (id.includes('singular.trends.country.sales')) {
      const countryId = increment.countryId ?? fields.countryId;
      const expected = applyDelta(
        resolveTrendingCountrySales(baselinePayload, row.period || 'day', countryId),
        increment.countrySales ?? 0,
      );
      return patch(row, expected, resolveTrendingCountrySales(afterPayload, row.period || 'day', countryId));
    }

    if (id.includes('chart.popup.earnings.subscription.')) {
      const period = row.period;
      const expected = applyDelta(
        resolveEarningsChartField(baseline, period, 'subscription'),
        increment.earningsSubscription ?? 0,
      );
      return patch(row, expected, resolveEarningsChartField(after, period, 'subscription'));
    }

    if (id.includes('chart.popup.earnings.total.') && row.period !== 'day') {
      const period = row.period;
      const expected = applyDelta(
        resolveEarningsChartField(baseline, period, 'total'),
        increment.earningsTotal ?? 0,
      );
      return patch(row, expected, resolveEarningsChartField(after, period, 'total'));
    }

    if (id.includes('chart.popup.earnings.merch.')) {
      const period = row.period;
      const expected = applyDelta(
        resolveEarningsChartField(baseline, period, 'merch'),
        increment.earningsMerch ?? 0,
      );
      return patch(row, expected, resolveEarningsChartField(after, period, 'merch'));
    }

    if (id.includes('chart.popup.earnings.tipTokens.')) {
      const period = row.period;
      const expected = applyDelta(
        resolveEarningsChartField(baseline, period, 'tipTokens'),
        increment.earningsTipTokens ?? 0,
      );
      return patch(row, expected, resolveEarningsChartField(after, period, 'tipTokens'));
    }

    if (id.includes('chart.popup.subscribers.new.')) {
      const period = row.period;
      const expected = applyDelta(
        resolveSubsChartField(baseline, period, 'newSubscriber'),
        increment.subsNewChart ?? 0,
      );
      return patch(row, expected, resolveSubsChartField(after, period, 'newSubscriber'));
    }

    if (id.includes('chart.popup.subscribers.plan.')) {
      const period = row.period;
      const tierKey = increment.planTierKey || `tier${fields.planId ?? 2}`;
      const expected = applyDelta(resolveSubsChartField(baseline, period, tierKey), increment.planTierCount ?? 0);
      return patch(row, expected, resolveSubsChartField(after, period, tierKey));
    }

    if (id.includes('singular.popup.earnings.total.')) {
      const period = row.period;
      const expected = applyDelta(resolveEarningsPopupTotal(baseline, period), increment.earningsTotal ?? 0);
      return patch(row, expected, resolveEarningsPopupTotal(after, period));
    }

    if (id.includes('singular.popup.earnings.tokensReceived.')) {
      const period = row.period || 'day';
      const expected = applyDelta(
        resolveEarningsPopupTokensReceived(baseline, period),
        increment.earningsTipTokens ?? 0,
      );
      return patch(row, expected, resolveEarningsPopupTokensReceived(after, period));
    }

    if (id.includes('singular.main.fans.newFollowers')) {
      const expected = applyDelta(resolveFansPeriodStat(baseline, 'day', 'newFollowers'), increment.newFollowers ?? 0);
      return patch(row, expected, resolveFansPeriodStat(after, 'day', 'newFollowers'));
    }

    if (id.includes('singular.main.fans.profileVisit')) {
      const expected = applyDelta(resolveFansPeriodStat(baseline, 'day', 'profileVisit'), increment.profileVisit ?? 0);
      return patch(row, expected, resolveFansPeriodStat(after, 'day', 'profileVisit'));
    }

    const likesFieldMatch = id.match(/singular\.main\.likes\.(media|profile|merch|feed)$/);
    if (likesFieldMatch) {
      const field = likesFieldMatch[1];
      const incKey = `likes${field.charAt(0).toUpperCase()}${field.slice(1)}`;
      const expected = applyDelta(resolveLikesMainMetric(baseline, field), increment[incKey] ?? 0);
      return patch(row, expected, resolveLikesMainMetric(after, field));
    }

    const likesChartMatch = id.match(/chart\.popup\.likes\.(media|profile|merch|feed)\./);
    if (likesChartMatch) {
      const field = likesChartMatch[1];
      const incKey = `likes${field.charAt(0).toUpperCase()}${field.slice(1)}`;
      const period = row.period || 'day';
      const expected = applyDelta(
        resolveLikesChartField(baselinePayload, period, field),
        increment[incKey] ?? 0,
      );
      return patch(row, expected, resolveLikesChartField(afterPayload, period, field));
    }

    if (id.includes('chart.popup.earnings.paytoview.')) {
      const period = row.period;
      const expected = applyDelta(
        resolveEarningsChartField(baseline, period, 'paytoview'),
        increment.earningsPaytoview ?? 0,
      );
      return patch(row, expected, resolveEarningsChartField(after, period, 'paytoview'));
    }

    if (id.includes('chart.popup.subscribers.recurring.')) {
      const period = row.period;
      const expected = applyDelta(
        resolveSubsChartField(baseline, period, 'recurringSubscriber'),
        increment.subsRecurringChart ?? 0,
      );
      return patch(row, expected, resolveSubsChartField(after, period, 'recurringSubscriber'));
    }

    if (id.includes('singular.main.contributors.amount')) {
      const expected = applyDelta(
        resolveTopContributorField(baselinePayload, CONTRIBUTORS_PREVIEW_PERIOD, 'amount'),
        increment.contributorAmount ?? 0,
      );
      return patch(
        row,
        expected,
        resolveTopContributorField(afterPayload, CONTRIBUTORS_PREVIEW_PERIOD, 'amount'),
      );
    }

    if (id.includes('singular.main.contributors.name')) {
      const fanId = fields.fanId;
      const expectedName =
        fanId != null ? `Fan ${fanId}` : resolveTopContributorField(baselinePayload, CONTRIBUTORS_PREVIEW_PERIOD, 'name');
      return patch(
        row,
        expectedName,
        resolveTopContributorField(afterPayload, CONTRIBUTORS_PREVIEW_PERIOD, 'name'),
      );
    }

    if (id.includes('api.contributors.popup.topContributors.')) {
      const period = row.period || CONTRIBUTORS_PREVIEW_PERIOD;
      const expected = applyDelta(
        resolveTopContributorField(baselinePayload, period, 'amount'),
        increment.contributorAmount ?? 0,
      );
      return patch(row, expected, resolveTopContributorField(afterPayload, period, 'amount'));
    }

    return row;
  });
}
