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

    if (id.includes('singular.main.fans.newFollowers')) {
      const expected = applyDelta(resolveFansPeriodStat(baseline, 'day', 'newFollowers'), increment.newFollowers ?? 0);
      return patch(row, expected, resolveFansPeriodStat(after, 'day', 'newFollowers'));
    }

    if (id.includes('singular.main.fans.profileVisit')) {
      const expected = applyDelta(resolveFansPeriodStat(baseline, 'day', 'profileVisit'), increment.profileVisit ?? 0);
      return patch(row, expected, resolveFansPeriodStat(after, 'day', 'profileVisit'));
    }

    return row;
  });
}
