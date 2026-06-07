import { defineStore } from 'pinia';
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

export const useDashboardAnalyticsStore = defineStore('dashboardAnalytics', {
  state: () => ({
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
  }),

  getters: {
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
      console.log('📡 Pipeline bundle set at:', now.toLocaleTimeString());

      try {
        const mapped = mapAnalyticsBundleResponse(bundle);
        if (!mapped) return;

        applyMappedAnalyticsState(this, mapped, now.toISOString());
        validateAnalyticsBundleIntegrity(bundle, { earningsDaily: this.earnings?.daily });
      } catch (err) {
        console.error('❌ Bundle fetch failed:', err);
      }
    },

    resetAnalyticsState() {
      this.subscriptionsBundle = {
        daily: [],
        weekly: [],
        monthly: [],
        yearly: [],
        grandTotal: null,
      };
      this.lastUpdated = null;
      this.bundleLoaded = false;
      this.metadata = { etag: null, lastUpdated: null };
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
