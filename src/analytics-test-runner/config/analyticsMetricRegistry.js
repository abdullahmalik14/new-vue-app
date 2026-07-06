/**
 * Single source of truth for all analytics metrics.
 *
 * Each entry declares:
 *  - metricKey   — domain-scoped key used in data-analytics-metric, data-analytics-values, and scan configs
 *  - stateResolver — dot-path into expectationState / getStateMetric's apiPath
 *  - bindings[]  — where the metric appears (DOM surfaces and/or chart containers)
 *
 * HOW TO ADD A METRIC:
 *  1. Add an entry here with all bindings.
 *  2. Add breakdown mapping in breakdownKeyToMetric.js (if chart-based).
 *  3. Add chartId to chartContractSchema.js requiredMetrics (if chart-based).
 *  4. Add data-analytics-* attribute to the Vue template.
 *  5. Add expectation row in buildExpectationsFromState.js.
 */

/** @typedef {'dom'|'chart'} BindingKind */
/** @typedef {'scalar'|'last'|'slots'} ValueShape */

/**
 * @typedef {Object} DomBinding
 * @property {'dom'} kind
 * @property {string} surface — e.g. 'main', 'popup-earnings', 'popup-subscribers', 'trends'
 * @property {string} period  — UI period ('day'|'week'|'month'|'year'|'alltime') or '*' for all
 */

/**
 * @typedef {Object} ChartBinding
 * @property {'chart'} kind
 * @property {string} chartId   — matches data-chart-id on the container
 * @property {string} period    — UI period when this chart is visible
 * @property {ValueShape} shape
 */

/**
 * @typedef {Object} MetricEntry
 * @property {string} metricKey
 * @property {string} stateResolver — apiPath used by getStateMetric
 * @property {Array<DomBinding|ChartBinding>} bindings
 */

/** @type {MetricEntry[]} */
export const ANALYTICS_METRICS = [
  // ── Subscribers ──────────────────────────────────────────────────────────
  {
    metricKey: 'subscribers.new',
    stateResolver: 'ui.subscriberInsights.daily.new',
    bindings: [
      { kind: 'dom', surface: 'main', period: 'day' },
      { kind: 'chart', chartId: 'subs-daily-donut', period: 'day', shape: 'scalar' },
      { kind: 'chart', chartId: 'subs-weekly-bar', period: 'week', shape: 'last' },
      { kind: 'chart', chartId: 'subs-monthly-bar', period: 'month', shape: 'last' },
      { kind: 'chart', chartId: 'subs-yearly-bar', period: 'year', shape: 'last' },
      { kind: 'chart', chartId: 'subs-alltime-bar', period: 'alltime', shape: 'last' },
    ],
  },
  {
    metricKey: 'subscribers.recurring',
    stateResolver: 'ui.subscriberInsights.daily.recurring',
    bindings: [
      { kind: 'dom', surface: 'main', period: 'day' },
    ],
  },
  {
    metricKey: 'subscribers.new-percentage',
    stateResolver: 'ui.subscriberInsights.daily.newPercentage',
    bindings: [
      { kind: 'dom', surface: 'main', period: 'day' },
    ],
  },
  {
    metricKey: 'subscribers.recurring-percentage',
    stateResolver: 'ui.subscriberInsights.daily.recurringPercentage',
    bindings: [
      { kind: 'dom', surface: 'main', period: 'day' },
    ],
  },

  // Plan tier metrics (subscribers popup donut / bar)
  ...[1, 2, 3, 4, 5].flatMap((tier) => [
    {
      metricKey: `subscribers.tier${tier}`,
      stateResolver: `ui.subsChart.daily.tier${tier}`,
      bindings: [
        { kind: 'chart', chartId: 'tiers-daily-donut', period: 'day', shape: 'scalar' },
        { kind: 'chart', chartId: 'tiers-weekly-bar', period: 'week', shape: 'last' },
        { kind: 'chart', chartId: 'tiers-monthly-bar', period: 'month', shape: 'last' },
        { kind: 'chart', chartId: 'tiers-yearly-bar', period: 'year', shape: 'last' },
        { kind: 'chart', chartId: 'tiers-alltime-bar', period: 'alltime', shape: 'last' },
      ],
    },
  ]),

  // ── Earnings ─────────────────────────────────────────────────────────────
  {
    metricKey: 'earnings.total',
    stateResolver: 'ui.earningsInsights.daily.total',
    bindings: [
      { kind: 'dom', surface: 'main', period: 'day' },
      { kind: 'dom', surface: 'popup-earnings', period: '*' },
      { kind: 'chart', chartId: 'sales-weekly-bar', period: 'week', shape: 'last' },
      { kind: 'chart', chartId: 'sales-monthly-bar', period: 'month', shape: 'last' },
      { kind: 'chart', chartId: 'sales-yearly-bar', period: 'year', shape: 'last' },
      { kind: 'chart', chartId: 'sales-alltime-bar', period: 'alltime', shape: 'last' },
    ],
  },
  {
    metricKey: 'earnings.subscription',
    stateResolver: 'ui.earningsChart.daily.subscription',
    bindings: [
      { kind: 'chart', chartId: 'sales-daily-donut', period: 'day', shape: 'scalar' },
      { kind: 'chart', chartId: 'sales-weekly-bar', period: 'week', shape: 'last' },
      { kind: 'chart', chartId: 'sales-monthly-bar', period: 'month', shape: 'last' },
      { kind: 'chart', chartId: 'sales-yearly-bar', period: 'year', shape: 'last' },
      { kind: 'chart', chartId: 'sales-alltime-bar', period: 'alltime', shape: 'last' },
    ],
  },
  {
    metricKey: 'earnings.merch',
    stateResolver: 'ui.earningsChart.daily.merch',
    bindings: [
      { kind: 'chart', chartId: 'sales-daily-donut', period: 'day', shape: 'scalar' },
      { kind: 'chart', chartId: 'sales-weekly-bar', period: 'week', shape: 'last' },
      { kind: 'chart', chartId: 'sales-monthly-bar', period: 'month', shape: 'last' },
      { kind: 'chart', chartId: 'sales-yearly-bar', period: 'year', shape: 'last' },
      { kind: 'chart', chartId: 'sales-alltime-bar', period: 'alltime', shape: 'last' },
    ],
  },
  {
    metricKey: 'earnings.percentage',
    stateResolver: 'ui.earningsInsights.daily.percentage',
    bindings: [
      { kind: 'dom', surface: 'main', period: 'day' },
    ],
  },
  {
    metricKey: 'earnings.tokens-received',
    stateResolver: 'ui.earningsPopup.daily.totalTokens',
    bindings: [
      { kind: 'dom', surface: 'popup-earnings', period: '*' },
    ],
  },

  // Token channel earnings
  {
    metricKey: 'earnings.tip-tokens',
    stateResolver: 'ui.earningsChart.daily.tipTokens',
    bindings: [
      { kind: 'chart', chartId: 'tokens-daily-donut', period: 'day', shape: 'scalar' },
      { kind: 'chart', chartId: 'tokens-weekly-bar', period: 'week', shape: 'last' },
      { kind: 'chart', chartId: 'tokens-monthly-bar', period: 'month', shape: 'last' },
      { kind: 'chart', chartId: 'tokens-yearly-bar', period: 'year', shape: 'last' },
      { kind: 'chart', chartId: 'tokens-alltime-bar', period: 'alltime', shape: 'last' },
    ],
  },

  // ── Fans ─────────────────────────────────────────────────────────────────
  {
    metricKey: 'fans.new-followers',
    stateResolver: 'ui.fans.daily.newFollowers',
    bindings: [
      { kind: 'dom', surface: 'main', period: 'day' },
      { kind: 'dom', surface: 'popup-fans', period: '*' },
      { kind: 'chart', chartId: 'fans-weekly-bar', period: 'week', shape: 'last' },
      { kind: 'chart', chartId: 'fans-monthly-bar', period: 'month', shape: 'last' },
      { kind: 'chart', chartId: 'fans-yearly-bar', period: 'year', shape: 'last' },
      { kind: 'chart', chartId: 'fans-alltime-bar', period: 'alltime', shape: 'last' },
    ],
  },
  {
    metricKey: 'fans.profile-visits',
    stateResolver: 'ui.fans.daily.profileVisit',
    bindings: [
      { kind: 'dom', surface: 'main', period: 'day' },
      { kind: 'dom', surface: 'popup-fans', period: '*' },
    ],
  },
  {
    metricKey: 'fans.new-followers-percentage',
    stateResolver: 'ui.fans.daily.newFollowersPercentage',
    bindings: [
      { kind: 'dom', surface: 'main', period: 'day' },
      { kind: 'dom', surface: 'popup-fans', period: '*' },
    ],
  },
  {
    metricKey: 'fans.profile-visits-percentage',
    stateResolver: 'ui.fans.daily.profileVisitPercentage',
    bindings: [
      { kind: 'dom', surface: 'main', period: 'day' },
      { kind: 'dom', surface: 'popup-fans', period: '*' },
    ],
  },

  // ── Likes ─────────────────────────────────────────────────────────────────
  {
    metricKey: 'likes.media',
    stateResolver: 'ui.likes.media',
    bindings: [
      { kind: 'dom', surface: 'main', period: 'day' },
      { kind: 'chart', chartId: 'likes-chart-bar', period: 'day', shape: 'last' },
      { kind: 'chart', chartId: 'likes-chart-line', period: 'day', shape: 'last' },
    ],
  },
  {
    metricKey: 'likes.merch',
    stateResolver: 'ui.likes.merch',
    bindings: [
      { kind: 'dom', surface: 'main', period: 'day' },
      { kind: 'chart', chartId: 'likes-chart-bar', period: 'day', shape: 'last' },
      { kind: 'chart', chartId: 'likes-chart-line', period: 'day', shape: 'last' },
    ],
  },
  {
    metricKey: 'likes.profile',
    stateResolver: 'ui.likes.profile',
    bindings: [
      { kind: 'dom', surface: 'main', period: 'day' },
      { kind: 'chart', chartId: 'likes-chart-bar', period: 'day', shape: 'last' },
      { kind: 'chart', chartId: 'likes-chart-line', period: 'day', shape: 'last' },
    ],
  },
  {
    metricKey: 'likes.feed',
    stateResolver: 'ui.likes.feed',
    bindings: [
      { kind: 'dom', surface: 'main', period: 'day' },
      { kind: 'chart', chartId: 'likes-chart-bar', period: 'day', shape: 'last' },
      { kind: 'chart', chartId: 'likes-chart-line', period: 'day', shape: 'last' },
    ],
  },
  {
    metricKey: 'likes.media-percentage',
    stateResolver: 'ui.likes.mediaPercentage',
    bindings: [{ kind: 'dom', surface: 'main', period: 'day' }],
  },
  {
    metricKey: 'likes.merch-percentage',
    stateResolver: 'ui.likes.merchPercentage',
    bindings: [{ kind: 'dom', surface: 'main', period: 'day' }],
  },
  {
    metricKey: 'likes.profile-percentage',
    stateResolver: 'ui.likes.profilePercentage',
    bindings: [{ kind: 'dom', surface: 'main', period: 'day' }],
  },
  {
    metricKey: 'likes.feed-percentage',
    stateResolver: 'ui.likes.feedPercentage',
    bindings: [{ kind: 'dom', surface: 'main', period: 'day' }],
  },

  // ── Earnings percentages ─────────────────────────────────────────────────
  {
    metricKey: 'earnings.total-percentage',
    stateResolver: 'ui.earningsInsights.daily.percentage',
    bindings: [{ kind: 'dom', surface: 'popup-earnings', period: '*' }],
  },
  {
    metricKey: 'earnings.tokens-percentage',
    stateResolver: 'ui.earningsInsights.daily.tokensPercentage',
    bindings: [{ kind: 'dom', surface: 'popup-earnings', period: '*' }],
  },

  // ── Contributors ─────────────────────────────────────────────────────────
  {
    metricKey: 'contributors.top.name',
    stateResolver: 'contributors.topContributors.alltime[0].name',
    bindings: [
      { kind: 'dom', surface: 'main', period: 'alltime' },
    ],
  },
  {
    metricKey: 'contributors.top.amount',
    stateResolver: 'contributors.topContributors.alltime[0].usdSpent',
    bindings: [
      { kind: 'dom', surface: 'main', period: 'alltime' },
    ],
  },
];

/** Build a lookup map: metricKey → MetricEntry */
export const ANALYTICS_METRIC_MAP = new Map(
  ANALYTICS_METRICS.map((entry) => [entry.metricKey, entry]),
);

/** Get all DOM bindings for a given surface */
export function getMetricsByDomSurface(surface) {
  return ANALYTICS_METRICS.filter((m) =>
    m.bindings.some((b) => b.kind === 'dom' && (b.surface === surface || b.surface === '*')),
  );
}

/** Get all metrics bound to a specific chartId */
export function getMetricsByChartId(chartId) {
  return ANALYTICS_METRICS.filter((m) =>
    m.bindings.some((b) => b.kind === 'chart' && b.chartId === chartId),
  );
}
