import { defineStore } from 'pinia';
import { analyticsCountryCodeToDisplayName, analyticsCountryCodeToIso3166 } from '@/systems/analytics/analyticsCountryLabels.js'
import { mapContributorToPreviewRow, getContributorsListForPeriod } from '@/systems/analytics/analyticsDataMappers.js'

import { mapAnalyticsBundleResponse, buildEarningsInsights, buildSubscriberInsights } from '@/services/analytics/mappers/analyticsResponseMapper.js';
import { validateAnalyticsBundleIntegrity } from '@/services/analytics/validators/analyticsBundleValidator.js';
import {
  attachStorageQuotaMonitor,
  buildPersistKey,
  createPersistedStateSerializer,
  migrateLegacyPersistedState,
  persistStorageAdapter,
  resolvePersistStorage,
  resolvePersistTtlMs,
} from '../utils/common/persistUtils.js';

const ensureArray = (value) => (Array.isArray(value) ? value : []);
const ensureObject = (value) => (value && typeof value === 'object' ? value : {});

const DASHBOARD_ANALYTICS_PERSIST_VERSION = 1;
const DASHBOARD_ANALYTICS_PERSIST_KEY = buildPersistKey('dashboard-analytics');
const dashboardAnalyticsPersistSerializer = createPersistedStateSerializer({
  version: DASHBOARD_ANALYTICS_PERSIST_VERSION,
  ttlMs: resolvePersistTtlMs(),
  fallback: {},
  migrate: (state, fromVersion) => {
    if (!state || typeof state !== 'object') {
      return {};
    }

    if (fromVersion === 0) {
      return state;
    }

    return state;
  },
});

function normalizeDashboardAnalyticsAfterRestore(store) {
  const subscriptionsBundle = ensureObject(store.subscriptionsBundle);
  store.subscriptionsBundle = {
    daily: ensureArray(subscriptionsBundle.daily),
    weekly: ensureArray(subscriptionsBundle.weekly),
    monthly: ensureArray(subscriptionsBundle.monthly),
    yearly: ensureArray(subscriptionsBundle.yearly),
    alltime: ensureArray(subscriptionsBundle.alltime),
    grandTotal: subscriptionsBundle.grandTotal ?? null,
  };

  const earnings = ensureObject(store.earnings);
  store.earnings = {
    daily: ensureArray(earnings.daily),
    weekly: ensureArray(earnings.weekly),
    monthly: ensureArray(earnings.monthly),
    yearly: ensureArray(earnings.yearly),
    alltime: ensureArray(earnings.alltime),
    grandTotal: earnings.grandTotal ?? null,
  };

  const recentOrders = ensureObject(store.recentOrders);
  store.recentOrders = {
    subscriptions: ensureArray(recentOrders.subscriptions),
    p2v: ensureArray(recentOrders.p2v),
    merch: ensureArray(recentOrders.merch),
    customRequest: ensureArray(recentOrders.customRequest),
    wishtender: ensureArray(recentOrders.wishtender),
  };

  store.metadata = {
    etag: null,
    lastUpdated: null,
    ...(store.metadata && typeof store.metadata === 'object' ? store.metadata : {}),
  };
}

function applyMappedAnalyticsState(store, mapped, timestamp) {
  if (mapped.dataSource) {
    store.dataSource = mapped.dataSource;
  }

  if (!store.metadata) {
    store.metadata = { etag: null, lastUpdated: null };
  }

  if (mapped.metadata?.etag) {
    store.metadata.etag = mapped.metadata.etag;
  }

  store.metadata.lastUpdated = timestamp;
  store.lastUpdated = timestamp;
  store.bundleLoaded = mapped.bundleLoaded ?? true;

  if (mapped.subscriptionsBundle) store.subscriptionsBundle = mapped.subscriptionsBundle;
  if (mapped.earnings) store.earnings = mapped.earnings;
  if (mapped.fans) store.fans = mapped.fans;
  if (mapped.fanInsights) store.fanInsights = mapped.fanInsights;
  if (mapped.likes) store.likes = mapped.likes;
  if (mapped.contributors) store.contributors = mapped.contributors;
  if (mapped.trendingMedia) store.trendingMedia = mapped.trendingMedia;
  if (mapped.trendingMerch) store.trendingMerch = mapped.trendingMerch;
  if (mapped.trendingTags) store.trendingTags = mapped.trendingTags;
  if (mapped.trendingCountries) store.trendingCountries = mapped.trendingCountries;
  if (mapped.countries) store.countries = mapped.countries;
  if (mapped.recentOrders) store.recentOrders = mapped.recentOrders;
}

function createInitialDashboardAnalyticsState() {
  return {
    subscriptionsBundle: {
      daily: [],
      weekly: [],
      monthly: [],
      yearly: [],
      alltime: [],
      grandTotal: null,
    },
    fans: {
      daily: {
        newFollowers: null,
        profileVisit: null,
        newFollowersPercentage: null,
        profileVisitPercentage: null,
      },
      weekly: {
        newFollowers: null,
        profileVisit: null,
        newFollowersPercentage: null,
        profileVisitPercentage: null,
      },
      monthly: {
        newFollowers: null,
        profileVisit: null,
        newFollowersPercentage: null,
        profileVisitPercentage: null,
      },
      yearly: {
        newFollowers: null,
        profileVisit: null,
        newFollowersPercentage: null,
        profileVisitPercentage: null,
      },
    },
    earnings: {
      daily: [],
      weekly: [],
      monthly: [],
      yearly: [],
      alltime: [],
      grandTotal: null,
    },
    likes: {
      media: null,
      merch: null,
      profile: null,
      feed: null,
      mediaPercentage: null,
      merchPercentage: null,
      profilePercentage: null,
      feedPercentage: null,
    },
    contributors: [],
    trendingMedia: {},
    trendingMerch: {},
    trendingTags: {},
    trendingCountries: {},
    countries: { daily: [], weekly: [], monthly: [], yearly: [] },
    fanInsights: { daily: [], weekly: [], monthly: [], yearly: [], grandTotal: {} },
    recentOrders: {
      subscriptions: [],
      p2v: [],
      merch: [],
      customRequest: [],
      wishtender: [],
    },
    lastUpdated: null,
    bundleLoaded: false,
    dataSource: 'full',
    metadata: {
      etag: null,
      lastUpdated: null,
    },
  };
}

let lastAppliedAnalyticsBundleSignature = null;

function buildAnalyticsBundleSignature(mapped) {
  return JSON.stringify({
    subscriptionsBundle: mapped.subscriptionsBundle,
    earnings: mapped.earnings,
    fans: mapped.fans,
    fanInsights: mapped.fanInsights,
    likes: mapped.likes,
    contributors: mapped.contributors,
    trendingMedia: mapped.trendingMedia,
    trendingMerch: mapped.trendingMerch,
    trendingTags: mapped.trendingTags,
    trendingCountries: mapped.trendingCountries,
    countries: mapped.countries,
    recentOrders: mapped.recentOrders,
  });
}

export const useDashboardAnalyticsStore = defineStore('dashboardAnalytics', {
  state: createInitialDashboardAnalyticsState,

  getters: {
    getContributorsViewModel: (state) => (periodKey) => {
      const storeContributorsByPeriod = state.contributors || {};
      let key = periodKey.toLowerCase()
      if (key === 'all-time') key = 'alltime'
      return {
        topContributors: mapContributorToPreviewRow(getContributorsListForPeriod(storeContributorsByPeriod.topContributors, key)),
        topFans: mapContributorToPreviewRow(getContributorsListForPeriod(storeContributorsByPeriod.topFans, key)),
        topOrderSpenders: mapContributorToPreviewRow(getContributorsListForPeriod(storeContributorsByPeriod.topOrderSpenders, key))
      };
    },
    getEarningsViewModel: (state) => (periodKey) => {
      let key = periodKey.toLowerCase()
      if (key === 'all-time') key = 'alltime'
      const arr = state.earnings[key]
      const earningsInsightRow = arr && arr.length ? { ...arr[arr.length - 1] } : null
      if (earningsInsightRow) {
        const countries = state.countries?.[key] || []
        earningsInsightRow.topCountries = countries.map((c, i) => ({
          rank: c.rank || i + 1,
          country: analyticsCountryCodeToDisplayName[c.country] || c.country,
          iso: analyticsCountryCodeToIso3166[c.country] || c.iso || null,
          salesRaw: c.salesUSD || 0,
          salesUSD: c.salesUSD || 0,
          earningsUSD: c.earningsUSD || c.salesUSD || 0,
          sales: c.salesUSD || 0
        }))
        const summary = state.earnings.summaries?.[key]
        if (summary && summary.totalEarningsUSD != null) {
          earningsInsightRow.total = summary.totalEarningsUSD
          earningsInsightRow.totalTokens = summary.tokensReceived
        } else {
          earningsInsightRow.total = arr?.reduce ? arr.reduce((sum, item) => sum + (item.total || 0), 0) : 0
          earningsInsightRow.totalTokens = arr?.reduce ? arr.reduce((sum, item) => sum + (item.totalTokens || 0), 0) : 0
        }
      }
      return earningsInsightRow
    },
    getFansViewModel: (state) => (periodKey) => {
      let key = periodKey.toLowerCase()
      if (key === 'all-time') key = 'alltime'
      const fansInsightForPeriod = state.fans[key] || state.fans['yearly']
      if (!fansInsightForPeriod || fansInsightForPeriod.newFollowers == null) {
        return { newFollowers: null, profileVisit: null, topCountries: [], sources: [] }
      }
      const fanTrafficSourcesByPeriod = state.fanInsights?.sources || {}
      const fanTrafficSourcesForSelectedPeriod = fanTrafficSourcesByPeriod[key] || []
      const fansTopCountriesDisplay = (fansInsightForPeriod.topCountries || []).map(c => ({
        ...c,
        country: analyticsCountryCodeToDisplayName[c.country] || c.country,
        visits: c.visits || 0
      }))
      return {
        newFollowers: fansInsightForPeriod.newFollowers,
        profileVisit: fansInsightForPeriod.profileVisit,
        newFollowersPercentage: fansInsightForPeriod.newFollowersPercentage,
        profileVisitPercentage: fansInsightForPeriod.profileVisitPercentage,
        topCountries: fansTopCountriesDisplay,
        sources: fanTrafficSourcesForSelectedPeriod
      }
    },
    getLikesViewModel: (state) => () => {
      return state.likes || {}
    },

    getSubscribersViewModel: (state) => (periodKey) => {
      let key = periodKey.toLowerCase()
      if (key === 'all-time') key = 'yearly'
      const insights = buildSubscriberInsights(state.subscriptionsBundle)
      return insights[key] || { new: null, recurring: null }
    },
    subscriberInsights(state) {
      return buildSubscriberInsights(state.subscriptionsBundle);
    },

    earningsInsights(state) {
      return buildEarningsInsights(state.earnings);
    },
  },

  actions: {
    syncAnalyticsBundle(bundle) {
      if (!bundle) return;

      const now = new Date();

      try {
        const mapped = mapAnalyticsBundleResponse(bundle);
        if (!mapped) return;

        const signature = buildAnalyticsBundleSignature(mapped);
        if (signature === lastAppliedAnalyticsBundleSignature) {
          this.metadata.lastUpdated = now.toISOString();
          this.lastUpdated = now.toISOString();
          return;
        }

        lastAppliedAnalyticsBundleSignature = signature;
        console.log('📡 Pipeline bundle set at:', now.toLocaleTimeString());

        applyMappedAnalyticsState(this, mapped, now.toISOString());
        validateAnalyticsBundleIntegrity(bundle, { earningsDaily: this.earnings?.daily });
      } catch (err) {
        console.error('❌ Bundle fetch failed:', err);
      }
    },

    resetAnalyticsState() {
      lastAppliedAnalyticsBundleSignature = null;
      Object.assign(this, createInitialDashboardAnalyticsState());
    },
  },

  persist: {
    key: DASHBOARD_ANALYTICS_PERSIST_KEY,
    storage: persistStorageAdapter,
    serializer: dashboardAnalyticsPersistSerializer,
    beforeHydrate({ store }) {
      migrateLegacyPersistedState({
        storage: resolvePersistStorage(),
        newKey: DASHBOARD_ANALYTICS_PERSIST_KEY,
        legacyKeys: ['DashboardAnalytics', 'dashboard-analytics'],
        baseKey: 'dashboard-analytics',
      });
      if (!store.metadata || typeof store.metadata !== 'object') {
        store.metadata = { etag: null, lastUpdated: null };
      }
    },
    afterHydrate({ store }) {
      normalizeDashboardAnalyticsAfterRestore(store);
      attachStorageQuotaMonitor(store, {
        key: DASHBOARD_ANALYTICS_PERSIST_KEY,
        label: 'dashboard-analytics',
      });
    },
  },
});
