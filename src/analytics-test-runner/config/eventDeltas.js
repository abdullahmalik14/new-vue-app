/**
 * Single-event increments per test case (one ingest after a clean database).
 * Expected UI values = baseline (post-clear) + these deltas.
 */

/**
 * @param {string} testCaseKey
 * @param {Record<string, unknown>} fields
 */
export function getEventIncrement(testCaseKey, fields = {}) {
  const amount = Number(fields.amount ?? 0);
  const planId = Number(fields.planId ?? 2);

  const deltas = {
    newSubscription: {
      subscribersNew: 1,
      subscribersRecurring: 0,
      earningsTotal: Number(fields.amount ?? 29.99),
      earningsSubscription: Number(fields.amount ?? 29.99),
      subsNewChart: 1,
      planTierKey: `tier${planId}`,
      planTierCount: 1,
      countrySales: Number(fields.amount ?? 29.99),
      countryId: Number(fields.countryId ?? 702),
      countryCode: String(fields.countryCode ?? 'SG'),
    },
    recurringSubscription: {
      subscribersNew: 0,
      subscribersRecurring: 1,
      earningsTotal: amount || 10,
      earningsSubscription: amount || 10,
      subsRecurringChart: 1,
      countrySales: amount || 10,
      countryId: Number(fields.countryId ?? 840),
    },
    merchOrder: {
      earningsTotal: amount || 15,
      earningsMerch: amount || 15,
      countrySales: amount || 15,
      countryId: Number(fields.countryId ?? 634),
    },
    tokenOrder: {
      earningsTotal: amount || 5,
      earningsTipTokens: amount || 5,
      countrySales: amount || 5,
      countryId: Number(fields.countryId ?? 250),
    },
    follow: {
      newFollowers: 1,
      countryId: Number(fields.countryId ?? 352),
    },
    profileVisit: {
      profileVisit: 1,
      countryId: Number(fields.countryId ?? 643),
    },
    tagEngagement: {
      tagViews: 1,
      tagId: String(fields.tagId ?? 'Panty_Fetish'),
    },
    cancelSubscription: {
      subscribersNew: -1,
      earningsTotal: -(amount || 29.99),
      earningsSubscription: -(amount || 29.99),
    },
  };

  return deltas[testCaseKey] || {};
}
