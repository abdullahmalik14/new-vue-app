/**
 * Maps chart breakdown keys / donut slice names to analytics metric keys.
 *
 * Used by chartAnalyticsContract.js when stamping data-analytics-values on chart containers,
 * and by the registry to cross-reference chart fields with domain metric keys.
 *
 * HOW TO ADD A MAPPING:
 *  1. Add the chart field name (as it appears in datasetRows / seriesBreakdownKeys) as the key.
 *  2. Set the value to the matching metricKey in analyticsMetricRegistry.js.
 *
 * Keys are lowercase-normalised during lookup (see lookupBreakdownMetric).
 */

/** @type {Record<string, string>} */
export const BREAKDOWN_KEY_TO_METRIC = {
  // ── Earnings donut / bar ──────────────────────────────────────────────────
  subscription: 'earnings.subscription',
  sub: 'earnings.subscription',          // internal alias used by subsChart
  merch: 'earnings.merch',
  total: 'earnings.total',
  tipTokens: 'earnings.tip-tokens',
  tiptokens: 'earnings.tip-tokens',
  callTokens: 'earnings.call-tokens',
  calltokens: 'earnings.call-tokens',
  chatTokens: 'earnings.chat-tokens',
  chattokens: 'earnings.chat-tokens',
  liveStreamTokens: 'earnings.live-stream-tokens',
  livestreamtokens: 'earnings.live-stream-tokens',

  // ── Subscribers donut / bar ───────────────────────────────────────────────
  newSubscriber: 'subscribers.new',
  newsubscriber: 'subscribers.new',
  'New Subscriber': 'subscribers.new',
  recurringSubscriber: 'subscribers.recurring',
  recurringsubscriber: 'subscribers.recurring',

  // Tier labels match data-value on donut slices (from TIER_DONUT_LABELS in uiExpectationResolver.js)
  'Free': 'subscribers.tier0',
  'Tier 1': 'subscribers.tier1',
  'Tier 2': 'subscribers.tier2',
  'Tier 3': 'subscribers.tier3',
  'Tier 4': 'subscribers.tier4',
  'Tier 5': 'subscribers.tier5',
  tier1: 'subscribers.tier1',
  tier2: 'subscribers.tier2',
  tier3: 'subscribers.tier3',
  tier4: 'subscribers.tier4',
  tier5: 'subscribers.tier5',

  // ── Fans bar ─────────────────────────────────────────────────────────────
  newFollowers: 'fans.new-followers',
  newfollowers: 'fans.new-followers',
  profileVisits: 'fans.profile-visits',
  profilevisits: 'fans.profile-visits',
  profileVisit: 'fans.profile-visits',
  profilevisit: 'fans.profile-visits',

  // ── Likes chart ───────────────────────────────────────────────────────────
  media: 'likes.media',
  profile: 'likes.profile',
  feed: 'likes.feed',
};

/**
 * Look up the metric key for a breakdown key / slice name.
 * Tries exact match first, then lowercase-normalised.
 *
 * @param {string} breakdownKey
 * @returns {string|null}
 */
export function lookupBreakdownMetric(breakdownKey) {
  if (breakdownKey == null) return null;
  return (
    BREAKDOWN_KEY_TO_METRIC[breakdownKey] ??
    BREAKDOWN_KEY_TO_METRIC[String(breakdownKey).toLowerCase()] ??
    null
  );
}
