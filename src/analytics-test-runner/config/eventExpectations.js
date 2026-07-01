/**
 * Expected UI/DOM/chart impact per master event.
 * Source of truth: Copy of Event Usage (Google Doc)
 * https://docs.google.com/document/d/11YKEooxjfhCnxhX2W0X7Aks5m4ClfHl-4iMcDCjjgcs/edit
 *
 * Each entry lists views that MUST update after a successful ingest + refresh.
 * Periods: day | week | month | year (and alltime where popup supports it).
 *
 * `status` is filled by gap analysis (2026-06-30) — backend unless noted.
 */

export const PERIODS = ['day', 'week', 'month', 'year', 'alltime'];

/** @typedef {'pass'|'partial'|'fail'|'blocked'} GapStatus */

/**
 * @type {Record<string, {
 *   label: string,
 *   trigger: { masterEventType: string, fields: Record<string, unknown> },
 *   expectedViews: Array<{ view: string, metrics: string[], periods: string[], sources: ('dom'|'amcharts')[] }>,
 *   knownGaps?: string[],
 *   gapStatus?: GapStatus,
 * }>}
 */
export const EVENT_EXPECTATIONS = {
  newSubscription: {
    label: 'New Subscription',
    trigger: {
      masterEventType: 'newOrder',
      fields: {
        orderType: 'new_subscription',
        amount: 29.99,
        countryId: 702,
        countryCode: 'SG',
        planId: 2,
        calculated_amount: 0,
        is_switch: false,
      },
    },
    expectedViews: [
      { view: 'Main', metrics: ['Subscribers NEW', 'Subscribers RECURRING', 'Total Earnings'], periods: ['day'], sources: ['dom'] },
      { view: 'Main', metrics: ['Top Contributors preview'], periods: ['day'], sources: ['dom'] },
      { view: 'Trends', metrics: ['Top Countries sales'], periods: ['day'], sources: ['dom'] },
      { view: 'Popup Subscribers', metrics: ['New vs Recurring donut', 'Tier breakdown'], periods: ['day', 'week', 'month', 'year'], sources: ['dom', 'amcharts'] },
      { view: 'Popup Earnings', metrics: ['Total Earnings', 'Sales breakdown', 'Token insights', 'Top Countries map'], periods: ['day', 'week', 'month', 'year'], sources: ['dom', 'amcharts'] },
      { view: 'Popup Contributors', metrics: ['Top Contributors', 'Top Fans', 'Top Order Spenders'], periods: ['day', 'week', 'month', 'year'], sources: ['dom', 'amcharts'] },
      { view: 'Orders Received', metrics: ['Subscriptions tab row'], periods: ['day'], sources: ['dom'] },
    ],
    knownGaps: [
      'recentOrders missing from /api/charts payload → Orders Received empty',
      'trendingCountries.country shows "Country 702" not "Singapore"',
      'subscriptions.alltime / earnings.alltime missing from API (JSON validator fails)',
    ],
    gapStatus: 'partial',
  },

  recurringSubscription: {
    label: 'Recurring Subscription',
    trigger: {
      masterEventType: 'newOrder',
      fields: { orderType: 'recurring_subscription', amount: 10, countryId: 840, countryCode: 'US', planId: 3 },
    },
    expectedViews: [
      { view: 'Main', metrics: ['Total Earnings', 'Subscribers RECURRING'], periods: ['day'], sources: ['dom'] },
      { view: 'Main', metrics: ['Top Contributors'], periods: ['day'], sources: ['dom'] },
      { view: 'Trends', metrics: ['Top Countries'], periods: ['day'], sources: ['dom'] },
      { view: 'Orders Received', metrics: ['Subscriptions tab'], periods: ['day'], sources: ['dom'] },
      { view: 'Popup Earnings', metrics: ['Totals + charts'], periods: ['day', 'week', 'month', 'year'], sources: ['dom', 'amcharts'] },
      { view: 'Popup Contributors', metrics: ['Contributor bars'], periods: ['day', 'week', 'month', 'year'], sources: ['dom', 'amcharts'] },
    ],
    knownGaps: ['recentOrders missing', 'Same country label gap'],
    gapStatus: 'partial',
  },

  switchSubscription: {
    label: 'Switch Subscription',
    trigger: {
      masterEventType: 'newOrder',
      fields: {
        orderType: 'new_subscription',
        amount: 30,
        is_switch: true,
        calculated_amount: 20,
        planId: 3,
        old_plan_id: 2,
        countryCode: 'US',
        countryId: 840,
      },
    },
    expectedViews: [
      { view: 'Main', metrics: ['Same as New Subscription'], periods: ['day'], sources: ['dom'] },
      { view: 'Popup Subscribers', metrics: ['Tier breakdown reflects plan change'], periods: ['day', 'week', 'month', 'year'], sources: ['dom', 'amcharts'] },
    ],
    knownGaps: ['Inherits newSubscription gaps'],
    gapStatus: 'partial',
  },

  cancelSubscription: {
    label: 'Cancel Subscription',
    trigger: {
      masterEventType: 'subscriptionCancel',
      fields: { planId: 10, subscriptionId: 10, countryCode: 'SG', countryId: 702 },
    },
    expectedViews: [
      { view: 'Main', metrics: ['Subscribers count decreases', 'Earnings decreases'], periods: ['day'], sources: ['dom'] },
      { view: 'Popup Subscribers', metrics: ['Cancellation reflected'], periods: ['day', 'week', 'month', 'year'], sources: ['dom', 'amcharts'] },
    ],
    knownGaps: [
      'CONFIRMED: ingest succeeds but earnings do NOT decrease in UI or /api/charts',
      'Cancel child metrics do not reverse creator_total_earnings',
    ],
    gapStatus: 'fail',
  },

  merchOrder: {
    label: 'Merch Order',
    trigger: {
      masterEventType: 'newOrder',
      fields: { orderType: 'merch', amount: 15, merchId: 4, countryCode: 'BR', countryId: 634 },
    },
    expectedViews: [
      { view: 'Main', metrics: ['Total Earnings', 'Top Contributors'], periods: ['day'], sources: ['dom'] },
      { view: 'Orders Received', metrics: ['Merch tab'], periods: ['day'], sources: ['dom'] },
      { view: 'Trends', metrics: ['Top Merch', 'Top Countries'], periods: ['day'], sources: ['dom'] },
      { view: 'Popup Earnings', metrics: ['merch slice in sales donut'], periods: ['day', 'week', 'month', 'year'], sources: ['dom', 'amcharts'] },
      { view: 'Popup Contributors', metrics: ['merch bar on fan'], periods: ['day', 'week', 'month', 'year'], sources: ['dom', 'amcharts'] },
    ],
    knownGaps: [
      'CONFIRMED: trendingMerch.daily stays empty after successful ingest',
      'recentOrders missing',
    ],
    gapStatus: 'fail',
  },

  p2vOrder: {
    label: 'P2V Order',
    trigger: {
      masterEventType: 'newOrder',
      fields: { orderType: 'p2v', amount: 15.02, mediaId: 101, countryCode: 'JP', countryId: 392 },
    },
    expectedViews: [
      { view: 'Main', metrics: ['Total Earnings', 'Top Contributors'], periods: ['day'], sources: ['dom'] },
      { view: 'Orders Received', metrics: ['Pay to View tab'], periods: ['day'], sources: ['dom'] },
      { view: 'Trends', metrics: ['Top Media views/sales'], periods: ['day'], sources: ['dom'] },
    ],
    knownGaps: [
      'BLOCKED: API rejects orderType "p2v" — event never records',
      'Top Media P2V Sales tab empty even when other media data exists',
    ],
    gapStatus: 'blocked',
  },

  tokenOrder: {
    label: 'Token Order (tip/call/chat/livestream)',
    trigger: {
      masterEventType: 'newOrder',
      fields: { orderType: 'token', amount: 5, tokenChannel: 'tip', countryCode: 'FR', countryId: 250 },
    },
    expectedViews: [
      { view: 'Popup Earnings', metrics: ['Tokens Received', 'tipTokens / channel breakdown'], periods: ['day', 'week', 'month', 'year'], sources: ['dom', 'amcharts'] },
      { view: 'Trends', metrics: ['Top Countries'], periods: ['day'], sources: ['dom'] },
      { view: 'Popup Contributors', metrics: ['token spend on fan'], periods: ['day', 'week', 'month', 'year'], sources: ['dom', 'amcharts'] },
    ],
    knownGaps: [
      'Token tips increment Tokens Received / tipTokens — not USD Total Earnings on main card',
      'recentOrders missing',
      'Verify call/chat/livestream channels separately',
    ],
    gapStatus: 'partial',
  },

  follow: {
    label: 'Follow',
    trigger: { masterEventType: 'follow', fields: { countryCode: 'FI', countryId: 352 } },
    expectedViews: [
      { view: 'Main', metrics: ['Fans NEW FOLLOWERS'], periods: ['day'], sources: ['dom'] },
      { view: 'Popup Fans', metrics: ['New Followers', 'Traffic source', 'Top Countries'], periods: ['day', 'week', 'month', 'year'], sources: ['dom', 'amcharts'] },
    ],
    knownGaps: [
      'fans.daily can be null in API when fanInsights has zero-filled arrays',
      'Follow + unfollow same fan nets to 0 — test with unique fan per event',
    ],
    gapStatus: 'partial',
  },

  unfollow: {
    label: 'Unfollow',
    trigger: { masterEventType: 'unfollow', fields: { countryCode: 'CA', countryId: 124 } },
    expectedViews: [
      { view: 'Main', metrics: ['Fans NEW FOLLOWERS decreases'], periods: ['day'], sources: ['dom'] },
      { view: 'Popup Fans', metrics: ['Lost followers chart'], periods: ['day', 'week', 'month', 'year'], sources: ['dom', 'amcharts'] },
    ],
    knownGaps: ['Same fans.daily mapping gap as follow'],
    gapStatus: 'partial',
  },

  profileVisit: {
    label: 'Profile Visit',
    trigger: {
      masterEventType: 'profileVisit',
      fields: { trafficSource: 'referral', countryCode: 'RU', countryId: 643 },
    },
    expectedViews: [
      { view: 'Main', metrics: ['Fans PROFILE VISIT'], periods: ['day'], sources: ['dom'] },
      { view: 'Popup Fans', metrics: ['Profile visits', 'Traffic source donut'], periods: ['day', 'week', 'month', 'year'], sources: ['dom', 'amcharts'] },
    ],
    knownGaps: ['Country 643 may show as code not "Russia" in Fans popup table'],
    gapStatus: 'partial',
  },

  mediaLike: {
    label: 'Media Like',
    trigger: { masterEventType: 'mediaLike', fields: { mediaId: 101, countryCode: 'JP', countryId: 392 } },
    expectedViews: [
      { view: 'Main', metrics: ['Likes MEDIA'], periods: ['day'], sources: ['dom'] },
      { view: 'Popup Likes', metrics: ['Media bar in chart'], periods: ['day', 'week', 'month', 'year'], sources: ['dom', 'amcharts'] },
    ],
    knownGaps: ['likes overview uses mapLikesSummary — verify sparkline vs count'],
    gapStatus: 'partial',
  },

  mediaUnlike: {
    label: 'Media Unlike',
    trigger: { masterEventType: 'mediaUnlike', fields: { mediaId: 101, countryCode: 'JP', countryId: 392 } },
    expectedViews: [
      { view: 'Main', metrics: ['Likes MEDIA decreases'], periods: ['day'], sources: ['dom'] },
      { view: 'Popup Likes', metrics: ['Media bar decreases'], periods: ['day', 'week', 'month', 'year'], sources: ['dom', 'amcharts'] },
    ],
    knownGaps: ['Requires seed mediaLike in runner before unlike'],
    gapStatus: 'partial',
  },

  profileLike: {
    label: 'Profile Like',
    trigger: { masterEventType: 'profileLike', fields: { profileId: 121, countryCode: 'US', countryId: 840 } },
    expectedViews: [
      { view: 'Main', metrics: ['Likes PROFILE'], periods: ['day'], sources: ['dom'] },
      { view: 'Popup Likes', metrics: ['Profile bar in chart'], periods: ['day', 'week', 'month', 'year'], sources: ['dom', 'amcharts'] },
    ],
    knownGaps: [],
    gapStatus: 'partial',
  },

  profileUnlike: {
    label: 'Profile Unlike',
    trigger: { masterEventType: 'profileUnlike', fields: { profileId: 121 } },
    expectedViews: [
      { view: 'Main', metrics: ['Likes PROFILE decreases'], periods: ['day'], sources: ['dom'] },
      { view: 'Popup Likes', metrics: ['Profile bar decreases'], periods: ['day', 'week', 'month', 'year'], sources: ['dom', 'amcharts'] },
    ],
    knownGaps: ['Requires seed profileLike in runner before unlike'],
    gapStatus: 'partial',
  },

  merchLike: {
    label: 'Merch Like',
    trigger: { masterEventType: 'merchLike', fields: { merchId: 4, countryCode: 'BR', countryId: 634 } },
    expectedViews: [
      { view: 'Main', metrics: ['Likes MERCH'], periods: ['day'], sources: ['dom'] },
      { view: 'Popup Likes', metrics: ['Merch bar in chart'], periods: ['day', 'week', 'month', 'year'], sources: ['dom', 'amcharts'] },
    ],
    knownGaps: [],
    gapStatus: 'partial',
  },

  merchUnlike: {
    label: 'Merch Unlike',
    trigger: { masterEventType: 'merchUnlike', fields: { merchId: 4 } },
    expectedViews: [
      { view: 'Main', metrics: ['Likes MERCH decreases'], periods: ['day'], sources: ['dom'] },
      { view: 'Popup Likes', metrics: ['Merch bar decreases'], periods: ['day', 'week', 'month', 'year'], sources: ['dom', 'amcharts'] },
    ],
    knownGaps: ['Requires seed merchLike in runner before unlike'],
    gapStatus: 'partial',
  },

  feedLike: {
    label: 'Feed Like',
    trigger: { masterEventType: 'feedLike', fields: { feedId: 215, countryCode: 'CA', countryId: 124 } },
    expectedViews: [
      { view: 'Main', metrics: ['Likes FEED'], periods: ['day'], sources: ['dom'] },
      { view: 'Popup Likes', metrics: ['Feed bar in chart'], periods: ['day', 'week', 'month', 'year'], sources: ['dom', 'amcharts'] },
    ],
    knownGaps: [],
    gapStatus: 'partial',
  },

  feedUnlike: {
    label: 'Feed Unlike',
    trigger: { masterEventType: 'feedUnlike', fields: { feedId: 215 } },
    expectedViews: [
      { view: 'Main', metrics: ['Likes FEED decreases'], periods: ['day'], sources: ['dom'] },
      { view: 'Popup Likes', metrics: ['Feed bar decreases'], periods: ['day', 'week', 'month', 'year'], sources: ['dom', 'amcharts'] },
    ],
    knownGaps: ['Requires seed feedLike in runner before unlike'],
    gapStatus: 'partial',
  },

  tagEngagement: {
    label: 'Tag Engagement',
    trigger: { masterEventType: 'tagEngagement', fields: { tagId: 'Panty_Fetish', engagementType: 'click' } },
    expectedViews: [
      { view: 'Trends', metrics: ['Top Tags view count'], periods: ['day'], sources: ['dom'] },
    ],
    knownGaps: [],
    gapStatus: 'pass',
  },

  mediaView: {
    label: 'Media View',
    trigger: { masterEventType: 'mediaView', fields: { mediaId: 5117, countryCode: 'SG', countryId: 702 } },
    expectedViews: [
      { view: 'Trends', metrics: ['Top Media clicks'], periods: ['day'], sources: ['dom'] },
    ],
    knownGaps: ['trendingMedia may be empty on fresh creator until builder populates'],
    gapStatus: 'partial',
  },

  mediaWatchDuration: {
    label: 'Media Watch Duration',
    trigger: { masterEventType: 'mediaWatchDuration', fields: { mediaId: 2811, durationMs: 50000 } },
    expectedViews: [
      { view: 'Trends', metrics: ['Top Media watch duration'], periods: ['day'], sources: ['dom'] },
    ],
    knownGaps: ['Same as mediaView'],
    gapStatus: 'partial',
  },
};
