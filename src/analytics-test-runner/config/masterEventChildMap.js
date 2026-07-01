/**
 * Master event → child metric routing (test-runner mirror of Node ingest mapping).
 * When server mapping changes, update this file first — unit tests guard domain isolation.
 *
 * @typedef {'fans'|'subscriptions'|'earnings'|'likes'|'countries'|'contributors'|'trendsMedia'|'trendsMerch'|'trendsTags'} MetricDomain
 */

import { EVENT_EXPECTATIONS } from './eventExpectations.js';

export const PERIOD_KEYS = ['daily', 'weekly', 'monthly', 'yearly', 'alltime'];

/**
 * Resolve USD credit for order events (switch uses configurable field).
 * @param {Record<string, unknown>} fields
 * @param {{ earningsCreditField?: string }} [options]
 */
export function resolveOrderCreditAmount(fields = {}, options = {}) {
  const creditField = options.earningsCreditField || fields.earningsCreditField || 'amount';
  const fromField = fields[creditField];
  if (fromField != null && Number.isFinite(Number(fromField))) {
    return Number(fromField);
  }
  return Number(fields.amount ?? 0);
}

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * @param {Record<string, unknown>} fields
 * @param {{ earningsCreditField?: string }} [ctx]
 * @returns {Array<{ domain: MetricDomain, apply: (state: object, fields: object, ctx: object) => void }>}
 */
export function resolveChildUpdates(masterEventType, fields = {}, ctx = {}) {
  const orderType = String(fields.orderType ?? '');
  const isSwitch = fields.is_switch === true;

  if (masterEventType === 'newOrder') {
    if (orderType === 'new_subscription' && isSwitch) {
      return buildNewSubscriptionUpdates(fields, ctx);
    }
    if (orderType === 'new_subscription') {
      return buildNewSubscriptionUpdates(fields, ctx);
    }
    if (orderType === 'recurring_subscription') {
      return buildRecurringSubscriptionUpdates(fields, ctx);
    }
    if (orderType === 'merch') {
      return buildMerchOrderUpdates(fields, ctx);
    }
    if (orderType === 'p2v') {
      return buildP2vOrderUpdates(fields, ctx);
    }
    if (orderType === 'token') {
      return buildTokenOrderUpdates(fields, ctx);
    }
  }

  const direct = DIRECT_MASTER_MAP[masterEventType];
  if (direct) return direct(fields, ctx);
  return [];
}

/** @type {Record<string, (fields: object, ctx: object) => Array<{ domain: MetricDomain, apply: Function }>>} */
const DIRECT_MASTER_MAP = {
  follow: () => [
    {
      domain: 'fans',
      apply: (state) => {
        incrementPeriodMetric(state.fans, 'newFollowers', 1);
      },
    },
  ],
  unfollow: () => [
    {
      domain: 'fans',
      apply: (state) => {
        incrementPeriodMetric(state.fans, 'newFollowers', -1);
      },
    },
  ],
  profileVisit: () => [
    {
      domain: 'fans',
      apply: (state) => {
        incrementPeriodMetric(state.fans, 'profileVisits', 1);
      },
    },
  ],
  mediaLike: () => [
    {
      domain: 'likes',
      apply: (state) => {
        incrementPeriodMetric(state.likes, 'media', 1);
      },
    },
  ],
  mediaUnlike: () => [
    {
      domain: 'likes',
      apply: (state) => {
        incrementPeriodMetric(state.likes, 'media', -1);
      },
    },
  ],
  profileLike: () => [
    {
      domain: 'likes',
      apply: (state) => {
        incrementPeriodMetric(state.likes, 'profile', 1);
      },
    },
  ],
  profileUnlike: () => [
    {
      domain: 'likes',
      apply: (state) => {
        incrementPeriodMetric(state.likes, 'profile', -1);
      },
    },
  ],
  merchLike: () => [
    {
      domain: 'likes',
      apply: (state) => {
        incrementPeriodMetric(state.likes, 'merch', 1);
      },
    },
  ],
  merchUnlike: () => [
    {
      domain: 'likes',
      apply: (state) => {
        incrementPeriodMetric(state.likes, 'merch', -1);
      },
    },
  ],
  feedLike: () => [
    {
      domain: 'likes',
      apply: (state) => {
        incrementPeriodMetric(state.likes, 'feed', 1);
      },
    },
  ],
  feedUnlike: () => [
    {
      domain: 'likes',
      apply: (state) => {
        incrementPeriodMetric(state.likes, 'feed', -1);
      },
    },
  ],
  tagEngagement: (fields) => [
    {
      domain: 'trendsTags',
      apply: (state) => {
        const tagId = String(fields.tagId ?? 'Panty_Fetish');
        incrementTagViews(state.trendsTags, tagId, 1);
      },
    },
  ],
  subscriptionCancel: (fields, ctx) => {
    const amount = num(ctx?.seedSubscriptionAmount, 29.99);
    return [
      {
        domain: 'subscriptions',
        apply: (state) => {
          incrementPeriodMetric(state.subscriptions, 'newSubscriber', -1);
          const planId = num(ctx?.seedPlanId ?? fields.planId ?? 2);
          incrementPeriodMetric(state.subscriptions, `tier${planId}`, -1);
        },
      },
      {
        domain: 'earnings',
        apply: (state) => {
          incrementPeriodMetric(state.earnings, 'subscription', -amount);
          incrementPeriodMetric(state.earnings, 'total', -amount);
        },
      },
    ];
  },
  mediaView: (fields) => [
    {
      domain: 'trendsMedia',
      apply: (state) => {
        const mediaId = num(fields.mediaId, 5117);
        incrementMediaMetric(state.trendsMedia, mediaId, 'views', 1);
      },
    },
  ],
  mediaWatchDuration: (fields) => [
    {
      domain: 'trendsMedia',
      apply: (state) => {
        const mediaId = num(fields.mediaId, 2811);
        const sec = num(fields.durationMs, 50000) / 1000;
        incrementMediaMetric(state.trendsMedia, mediaId, 'watchDurationSec', sec);
      },
    },
  ],
};

function buildNewSubscriptionUpdates(fields, ctx) {
  const amount = resolveOrderCreditAmount(fields, ctx);
  const planId = num(fields.planId, 2);
  const countryId = num(fields.countryId, 702);
  const fanId = ctx.fanId;

  return [
    {
      domain: 'subscriptions',
      apply: (state) => {
        incrementPeriodMetric(state.subscriptions, 'newSubscriber', 1);
        incrementPeriodMetric(state.subscriptions, `tier${planId}`, 1);
      },
    },
    {
      domain: 'earnings',
      apply: (state) => {
        incrementPeriodMetric(state.earnings, 'subscription', amount);
        incrementPeriodMetric(state.earnings, 'total', amount);
      },
    },
    {
      domain: 'countries',
      apply: (state) => {
        incrementCountrySales(state.countries, countryId, amount);
      },
    },
    {
      domain: 'contributors',
      apply: (state) => {
        if (fanId != null) {
          addContributorSpend(state.contributors, fanId, amount, ctx.fanLabel);
        }
      },
    },
  ];
}

function buildRecurringSubscriptionUpdates(fields, ctx) {
  const amount = num(fields.amount, 10);
  const countryId = num(fields.countryId, 840);
  const fanId = ctx.fanId;

  return [
    {
      domain: 'subscriptions',
      apply: (state) => {
        incrementPeriodMetric(state.subscriptions, 'recurringSubscriber', 1);
      },
    },
    {
      domain: 'earnings',
      apply: (state) => {
        incrementPeriodMetric(state.earnings, 'subscription', amount);
        incrementPeriodMetric(state.earnings, 'total', amount);
      },
    },
    {
      domain: 'countries',
      apply: (state) => {
        incrementCountrySales(state.countries, countryId, amount);
      },
    },
    {
      domain: 'contributors',
      apply: (state) => {
        if (fanId != null) {
          addContributorSpend(state.contributors, fanId, amount, ctx.fanLabel);
        }
      },
    },
  ];
}

function buildMerchOrderUpdates(fields, ctx) {
  const amount = num(fields.amount, 15);
  const countryId = num(fields.countryId, 634);
  const merchId = num(fields.merchId, 4);
  const fanId = ctx.fanId;

  return [
    {
      domain: 'earnings',
      apply: (state) => {
        incrementPeriodMetric(state.earnings, 'merch', amount);
        incrementPeriodMetric(state.earnings, 'total', amount);
      },
    },
    {
      domain: 'countries',
      apply: (state) => {
        incrementCountrySales(state.countries, countryId, amount);
      },
    },
    {
      domain: 'contributors',
      apply: (state) => {
        if (fanId != null) {
          addContributorSpend(state.contributors, fanId, amount, ctx.fanLabel);
        }
      },
    },
    {
      domain: 'trendsMerch',
      apply: (state) => {
        incrementMerchSales(state.trendsMerch, merchId, amount);
      },
    },
  ];
}

function buildP2vOrderUpdates(fields, ctx) {
  const amount = num(fields.amount, 15.02);
  const countryId = num(fields.countryId, 392);
  const mediaId = num(fields.mediaId, 101);
  const fanId = ctx.fanId;

  return [
    {
      domain: 'earnings',
      apply: (state) => {
        incrementPeriodMetric(state.earnings, 'paytoview', amount);
        incrementPeriodMetric(state.earnings, 'total', amount);
      },
    },
    {
      domain: 'countries',
      apply: (state) => {
        incrementCountrySales(state.countries, countryId, amount);
      },
    },
    {
      domain: 'contributors',
      apply: (state) => {
        if (fanId != null) {
          addContributorSpend(state.contributors, fanId, amount, ctx.fanLabel);
        }
      },
    },
    {
      domain: 'trendsMedia',
      apply: (state) => {
        incrementMediaMetric(state.trendsMedia, mediaId, 'ppvSalesUSD', amount);
      },
    },
  ];
}

function buildTokenOrderUpdates(fields, ctx) {
  const amount = num(fields.amount, 5);
  const countryId = num(fields.countryId, 250);
  const channel = String(fields.tokenChannel ?? 'tip');
  const tokenField = channel === 'tip' ? 'tipTokens' : `${channel}Tokens`;
  const fanId = ctx.fanId;

  return [
    {
      domain: 'earnings',
      apply: (state) => {
        incrementPeriodMetric(state.earnings, 'tipTokens', amount);
        incrementPeriodMetric(state.earnings, 'totalTokens', amount);
      },
    },
    {
      domain: 'countries',
      apply: (state) => {
        incrementCountrySales(state.countries, countryId, amount);
      },
    },
    {
      domain: 'contributors',
      apply: (state) => {
        if (fanId != null) {
          addContributorSpend(state.contributors, fanId, amount, ctx.fanLabel, { tokens: amount });
        }
      },
    },
  ];
}

/** Exported for tests and expectationState */
export function incrementPeriodMetric(domainStore, metricKey, delta) {
  PERIOD_KEYS.forEach((periodKey) => {
    if (!domainStore[periodKey]) {
      domainStore[periodKey] = [
        { period: periodKey },
        { period: periodKey },
      ];
    }
    const bucket = domainStore[periodKey];
    while (bucket.length < 2) {
      bucket.unshift({ period: periodKey });
    }
    const row = bucket[bucket.length - 1];
    row[metricKey] = num(row[metricKey]) + delta;
  });
}

export function incrementCountrySales(countriesStore, countryId, delta) {
  const code = `Country ${countryId}`;
  PERIOD_KEYS.forEach((periodKey) => {
    if (!countriesStore[periodKey]) countriesStore[periodKey] = [];
    const arr = countriesStore[periodKey];
    let row = arr.find((item) => item.country === code || String(item.countryId) === String(countryId));
    if (!row) {
      row = { country: code, countryId, salesUSD: 0 };
      arr.push(row);
    }
    row.salesUSD = num(row.salesUSD) + delta;
  });
}

export function addContributorSpend(contributorsStore, fanId, usdDelta, fanLabel, { tokens = 0 } = {}) {
  const key = String(fanId);
  if (!contributorsStore.byFanId[key]) {
    contributorsStore.byFanId[key] = {
      fanId: key,
      name: fanLabel || `Fan ${key}`,
      usdSpent: 0,
      tokens: 0,
    };
  }
  const row = contributorsStore.byFanId[key];
  row.usdSpent = num(row.usdSpent) + usdDelta;
  row.tokens = num(row.tokens) + tokens;
}

export function incrementTagViews(tagsStore, tagId, delta) {
  PERIOD_KEYS.forEach((periodKey) => {
    if (!tagsStore[periodKey]) tagsStore[periodKey] = [];
    const arr = tagsStore[periodKey];
    let row = arr.find((t) => String(t.tag).includes(tagId));
    if (!row) {
      row = { tag: tagId, views: 0 };
      arr.push(row);
    }
    row.views = num(row.views) + delta;
  });
}

export function incrementMediaMetric(mediaStore, mediaId, field, delta) {
  PERIOD_KEYS.forEach((periodKey) => {
    if (!mediaStore[periodKey]) mediaStore[periodKey] = [];
    const arr = mediaStore[periodKey];
    let row = arr.find((m) => Number(m.mediaId) === Number(mediaId));
    if (!row) {
      row = { mediaId, views: 0, watchDurationSec: 0, ppvSalesUSD: 0 };
      arr.push(row);
    }
    row[field] = num(row[field]) + delta;
  });
}

export function incrementMerchSales(merchStore, merchId, delta) {
  PERIOD_KEYS.forEach((periodKey) => {
    if (!merchStore[periodKey]) merchStore[periodKey] = [];
    const arr = merchStore[periodKey];
    let row = arr.find((m) => Number(m.merchId) === Number(merchId));
    if (!row) {
      row = { merchId, salesUSD: 0, salesCount: 0 };
      arr.push(row);
    }
    row.salesUSD = num(row.salesUSD) + delta;
    row.salesCount = num(row.salesCount) + 1;
  });
}

/**
 * Map test case key to master event dispatch context.
 * @param {string} testCaseKey
 * @param {Record<string, unknown>} fields
 */
export function resolveMasterEventFromTestCase(testCaseKey, fields = {}) {
  const fromConfig = EVENT_EXPECTATIONS[testCaseKey]?.trigger;
  const mergedFields = { ...(fromConfig?.fields || {}), ...fields };

  if (testCaseKey === 'switchSubscription') {
    return {
      masterEventType: 'newOrder',
      fields: { ...mergedFields, is_switch: true },
      earningsCreditField: mergedFields.earningsCreditField || 'calculated_amount',
    };
  }
  const fromExpectations = {
    newSubscription: { masterEventType: 'newOrder', fields: mergedFields },
    recurringSubscription: { masterEventType: 'newOrder', fields: mergedFields },
    merchOrder: { masterEventType: 'newOrder', fields: mergedFields },
    p2vOrder: { masterEventType: 'newOrder', fields: mergedFields },
    tokenOrder: { masterEventType: 'newOrder', fields: mergedFields },
    cancelSubscription: { masterEventType: 'subscriptionCancel', fields: mergedFields },
    follow: { masterEventType: 'follow', fields: mergedFields },
    unfollow: { masterEventType: 'unfollow', fields: mergedFields },
    profileVisit: { masterEventType: 'profileVisit', fields: mergedFields },
    mediaLike: { masterEventType: 'mediaLike', fields: mergedFields },
    mediaUnlike: { masterEventType: 'mediaUnlike', fields: mergedFields },
    profileLike: { masterEventType: 'profileLike', fields: mergedFields },
    profileUnlike: { masterEventType: 'profileUnlike', fields: mergedFields },
    merchLike: { masterEventType: 'merchLike', fields: mergedFields },
    merchUnlike: { masterEventType: 'merchUnlike', fields: mergedFields },
    feedLike: { masterEventType: 'feedLike', fields: mergedFields },
    feedUnlike: { masterEventType: 'feedUnlike', fields: mergedFields },
    tagEngagement: { masterEventType: 'tagEngagement', fields: mergedFields },
    mediaView: { masterEventType: 'mediaView', fields: mergedFields },
    mediaWatchDuration: { masterEventType: 'mediaWatchDuration', fields: mergedFields },
  };
  if (fromExpectations[testCaseKey]) {
    return fromExpectations[testCaseKey];
  }
  if (fromConfig) {
    return { masterEventType: fromConfig.masterEventType, fields: mergedFields };
  }
  return { masterEventType: testCaseKey, fields: mergedFields };
}
