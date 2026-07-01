/**
 * Single-event increments per test case (one ingest after a clean database).
 * Expected UI values = baseline (post-clear) + these deltas.
 * Unlike/unfollow/cancel cases use seed baseline — delta applies after seed.
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
      contributorAmount: Number(fields.amount ?? 29.99),
      subsNewChart: 1,
      planTierKey: `tier${planId}`,
      planTierCount: 1,
      countrySales: Number(fields.amount ?? 29.99),
      countryId: Number(fields.countryId ?? 702),
    },
    recurringSubscription: {
      subscribersNew: 0,
      subscribersRecurring: 1,
      earningsTotal: amount || 10,
      earningsSubscription: amount || 10,
      contributorAmount: amount || 10,
      subsRecurringChart: 1,
      countrySales: amount || 10,
      countryId: Number(fields.countryId ?? 840),
    },
    switchSubscription: {
      subscribersNew: 1,
      subscribersRecurring: 0,
      earningsTotal: amount || 30,
      earningsSubscription: amount || 30,
      contributorAmount: amount || 30,
      subsNewChart: 1,
      planTierKey: `tier${planId}`,
      planTierCount: 1,
      countrySales: amount || 30,
      countryId: Number(fields.countryId ?? 840),
    },
    merchOrder: {
      earningsTotal: amount || 15,
      earningsMerch: amount || 15,
      contributorAmount: amount || 15,
      countrySales: amount || 15,
      countryId: Number(fields.countryId ?? 634),
    },
    p2vOrder: {
      earningsTotal: amount || 15.02,
      earningsPaytoview: amount || 15.02,
      contributorAmount: amount || 15.02,
      countryId: Number(fields.countryId ?? 392),
    },
    tokenOrder: {
      earningsTotal: 0,
      earningsTipTokens: amount || 5,
      contributorAmount: amount || 5,
      countrySales: amount || 5,
      countryId: Number(fields.countryId ?? 250),
    },
    follow: {
      newFollowers: 1,
      countryId: Number(fields.countryId ?? 352),
    },
    unfollow: {
      newFollowers: -1,
    },
    profileVisit: {
      profileVisit: 1,
      countryId: Number(fields.countryId ?? 643),
    },
    mediaLike: { likesMedia: 1 },
    mediaUnlike: { likesMedia: -1 },
    profileLike: { likesProfile: 1 },
    profileUnlike: { likesProfile: -1 },
    merchLike: { likesMerch: 1 },
    merchUnlike: { likesMerch: -1 },
    feedLike: { likesFeed: 1 },
    feedUnlike: { likesFeed: -1 },
    tagEngagement: {
      tagViews: 1,
      tagId: String(fields.tagId ?? 'Panty_Fetish'),
    },
    cancelSubscription: {
      subscribersNew: -1,
      earningsTotal: -29.99,
      earningsSubscription: -29.99,
    },
    mediaView: {
      mediaViews: 1,
      mediaId: Number(fields.mediaId ?? 5117),
    },
    mediaWatchDuration: {
      mediaWatchDurationSec: Number(fields.durationMs ?? 50000) / 1000,
      mediaId: Number(fields.mediaId ?? 2811),
    },
  };

  return deltas[testCaseKey] || {};
}
