  // DashboardAnalytics.js
import { defineStore } from 'pinia'
import {
  attachStorageQuotaMonitor,
  buildPersistKey,
  createPersistedStateSerializer,
  migrateLegacyPersistedState,
  resolvePersistStorage,
  resolvePersistTtlMs,
} from '../utils/common/persistUtils.js'

const ensureArray = (value) => (Array.isArray(value) ? value : [])
const ensureObject = (value) => (value && typeof value === 'object' ? value : {})

const DASHBOARD_PERSIST_VERSION = 1
const DASHBOARD_PERSIST_KEY = buildPersistKey('DashboardAnalytics')
const dashboardPersistSerializer = createPersistedStateSerializer({
  version: DASHBOARD_PERSIST_VERSION,
  ttlMs: resolvePersistTtlMs(),
  fallback: {},
  migrate: (state) => (state && typeof state === 'object' ? state : {}),
})

function normalizeDashboardAnalyticsAfterRestore(store) {
  const subscriptionsBundle = ensureObject(store.subscriptionsBundle)
  store.subscriptionsBundle = {
    daily: ensureArray(subscriptionsBundle.daily),
    weekly: ensureArray(subscriptionsBundle.weekly),
    monthly: ensureArray(subscriptionsBundle.monthly),
    yearly: ensureArray(subscriptionsBundle.yearly),
    alltime: ensureArray(subscriptionsBundle.alltime),
    grandTotal: subscriptionsBundle.grandTotal ?? null,
  }

  const earnings = ensureObject(store.earnings)
  store.earnings = {
    daily: ensureArray(earnings.daily),
    weekly: ensureArray(earnings.weekly),
    monthly: ensureArray(earnings.monthly),
    yearly: ensureArray(earnings.yearly),
    alltime: ensureArray(earnings.alltime),
    grandTotal: earnings.grandTotal ?? null,
  }

  const recentOrders = ensureObject(store.recentOrders)
  store.recentOrders = {
    subscriptions: ensureArray(recentOrders.subscriptions),
    p2v: ensureArray(recentOrders.p2v),
    merch: ensureArray(recentOrders.merch),
    customRequest: ensureArray(recentOrders.customRequest),
    wishtender: ensureArray(recentOrders.wishtender),
  }

  store.metadata = {
    etag: null,
    lastUpdated: null,
    ...(store.metadata && typeof store.metadata === 'object' ? store.metadata : {}),
  }
}

export const useDashboardAnalytics = defineStore('DashboardAnalytics', {
  state: () => ({
    // Subscribers bundle (Said's format: sub, tip, tier1-5)
    subscriptionsBundle: {
      daily: [],
      weekly: [],
      monthly: [],
      yearly: [],
      alltime: [],
      grandTotal: null,
    },

    // Baki cards ke liye (baad mein implement honge)
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
      wishtender: []
    },
    lastUpdated: null,
    bundleLoaded: false,
    dataSource: 'full', // 'full' or 'empty' — for demo switching
    metadata: {
      etag: null,
      lastUpdated: null,
    },
  }),

  getters: {
    // Subscribers card: daily ka sabse latest entry
    subscribers(state) {
      const daily = state.subscriptionsBundle.daily
      const latest = daily[daily.length - 1] || {}
      const prev = daily[daily.length - 2] || {}

      // Percentage calculate karo (prev se compare)
      const calcPct = (curr, prev) => {
        if (!prev || prev === 0) return null
        return Math.round(((curr - prev) / prev) * 100)
      }

      // Using Said's field names: sub = new, tip = recurring
      return {
        daily: {
          new: latest.sub ?? null,
          recurring: latest.tip ?? null,
          newPercentage: calcPct(latest.sub, prev.sub),
          recurringPercentage: calcPct(latest.tip, prev.tip),
        },
        weekly: (() => {
          const arr = state.subscriptionsBundle.weekly
          const last = arr[arr.length - 1] || {}
          const secondLast = arr[arr.length - 2] || {}
          return {
            new: last.sub ?? null,
            recurring: last.tip ?? null,
            newPercentage: calcPct(last.sub, secondLast.sub),
            recurringPercentage: calcPct(last.tip, secondLast.tip),
          }
        })(),
        monthly: (() => {
          const arr = state.subscriptionsBundle.monthly
          const last = arr[arr.length - 1] || {}
          const secondLast = arr[arr.length - 2] || {}
          return {
            new: last.sub ?? null,
            recurring: last.tip ?? null,
            newPercentage: calcPct(last.sub, secondLast.sub),
            recurringPercentage: calcPct(last.tip, secondLast.tip),
          }
        })(),
        yearly: (() => {
          const gt = state.subscriptionsBundle.grandTotal || {}
          return {
            new: gt.sub ?? null,
            recurring: gt.tip ?? null,
            newPercentage: null,
            recurringPercentage: null,
          }
        })(),
      }
    },

    // Earnings card logic
    earningsInsights(state) {
      const daily = state.earnings.daily || []
      const latest = daily[daily.length - 1] || {}
      const prev = daily[daily.length - 2] || {}

      const calcPct = (curr, prev) => {
        if (!prev || prev === 0) return null
        return Math.round(((curr - prev) / prev) * 100)
      }

      return {
        daily: {
          total: latest.total ?? null,
          percentage: calcPct(latest.total, prev.total),
          sparklineData: daily.slice(-10).map((d) => d.total || 0),
        },
      }
    },
  },

  actions: {
    setAnalyticsAction(bundle) {
      if (!bundle) return;
      const now = new Date();
      console.log(`📡 Pipeline bundle set at:`, now.toLocaleTimeString());
      try {
        if (bundle.dataSource) {
          this.dataSource = bundle.dataSource;
        }
        if (!this.metadata) {
          this.metadata = { etag: null, lastUpdated: null };
        }
        if (bundle.etag) {
          this.metadata.etag = bundle.etag;
        }
        this.metadata.lastUpdated = now.toISOString();
        this.lastUpdated = now.toISOString();
        this.bundleLoaded = true;

        // Subscriptions data — use REAL data from Linden's chartsData.bundle.json
        if (bundle.subscriptions) {
          const mapSub = (arr) =>
            (arr || []).map((item) => ({
              period: item.period,
              total: item.totalSubscribers || 0,
              sub: item.newSubscriber || 0,
              tip: item.recurringSubscriber || 0,
              free: item.free || 0,
              tier1: item.tier1 || 0,
              tier2: item.tier2 || 0,
              tier3: item.tier3 || 0,
              tier4: item.tier4 || 0,
              tier5: item.tier5 || 0,
            }))

          this.subscriptionsBundle = {
            daily: mapSub(bundle.subscriptions.daily),
            weekly: mapSub(bundle.subscriptions.weekly),
            monthly: mapSub(bundle.subscriptions.monthly),
            yearly: mapSub(bundle.subscriptions.yearly),
            alltime: mapSub(bundle.subscriptions.alltime || bundle.subscriptions.yearly), // Fix: use alltime if exists
            grandTotal:
              bundle.subscriptions.yearly && bundle.subscriptions.yearly.length > 0
                ? mapSub([bundle.subscriptions.yearly[bundle.subscriptions.yearly.length - 1]])[0]
                : null,
          }
        }

        // Baki cards ke liye (baad mein implement honge)
        if (bundle.earnings) {
          this.earnings = {
            daily: bundle.earnings.daily || [],
            weekly: bundle.earnings.weekly || [],
            monthly: bundle.earnings.monthly || [],
            yearly: bundle.earnings.yearly || [],
            alltime: bundle.earnings.alltime || bundle.earnings.yearly || [],
            grandTotal: bundle.earnings.grandTotal || null,
          }
        }

        if (bundle.fanInsights) {
          const getPct = (curr, prev) =>
            !prev || prev === 0 ? null : Math.round(((curr - prev) / prev) * 100)
          const mapFans = (arr, countriesArr) => {
            if (!arr || arr.length === 0)
              return {
                newFollowers: null,
                profileVisit: null,
                newFollowersPercentage: null,
                profileVisitPercentage: null,
                topCountries: [],
              }
            const latest = arr[arr.length - 1]
            const prev = arr[arr.length - 2] || {}
            const topCountries = (countriesArr || [])
              .map((c, i) => ({ rank: c.rank || i + 1, country: c.country, visits: c.views || 0 }))
            return {
              newFollowers: latest.newFollowers ?? null,
              profileVisit: latest.profileVisits ?? null,
              newFollowersPercentage: getPct(latest.newFollowers, prev.newFollowers),
              profileVisitPercentage: getPct(latest.profileVisits, prev.profileVisits),
              topCountries: topCountries,
            }
          }

          this.fans = {
            daily: mapFans(bundle.fanInsights.daily, bundle.fanInsights.countries?.daily),
            weekly: mapFans(bundle.fanInsights.weekly, bundle.fanInsights.countries?.weekly),
            monthly: mapFans(bundle.fanInsights.monthly, bundle.fanInsights.countries?.monthly),
            yearly: mapFans(bundle.fanInsights.yearly, bundle.fanInsights.countries?.yearly),
            alltime: mapFans(
              bundle.fanInsights.alltime || bundle.fanInsights.yearly,
              bundle.fanInsights.countries?.alltime,
            ),
          }
          // Also store raw fanInsights for popup percentage calculations
          this.fanInsights = {
            daily: bundle.fanInsights.daily || [],
            weekly: bundle.fanInsights.weekly || [],
            monthly: bundle.fanInsights.monthly || [],
            yearly: bundle.fanInsights.yearly || [],
            alltime: bundle.fanInsights.alltime || bundle.fanInsights.yearly || [],
            sources: bundle.fanInsights.sources || {},
            countries: bundle.fanInsights.countries || {},
            grandTotal: bundle.fanInsights.grandTotal || {},
          }
        }

        if (bundle.likes) {
          const getPct = (curr, prev) =>
            !prev || prev === 0 ? null : Math.round(((curr - prev) / prev) * 100)
          const arr = bundle.likes.daily || bundle.likes.weekly || bundle.likes.monthly || []
          const latest = arr[arr.length - 1] || {}
          const prev = arr[arr.length - 2] || {}
          this.likes = {
            media: latest.media ?? null,
            merch: latest.merch ?? null,
            profile: latest.profile ?? null,
            feed: latest.feed ?? null,
            mediaPercentage: getPct(latest.media, prev.media),
            merchPercentage: getPct(latest.merch, prev.merch),
            profilePercentage: getPct(latest.profile, prev.profile),
            feedPercentage: getPct(latest.feed, prev.feed),
          }
        }

        if (bundle.contributors) {
          this.contributors = bundle.contributors
        }

        if (bundle.trendingsMedia) this.trendingMedia = bundle.trendingsMedia || {}
        if (bundle.trendingMerch) this.trendingMerch = bundle.trendingMerch || {}
        if (bundle.trendingTags) this.trendingTags = bundle.trendingTags || {}
        if (bundle.trendingCountries) {
          this.trendingCountries = bundle.trendingCountries || {}
          // Map trendingCountries to 'countries' for Earnings popup topCountries
          this.countries = {
            daily: bundle.trendingCountries.daily || [],
            weekly: bundle.trendingCountries.weekly || [],
            monthly: bundle.trendingCountries.monthly || [],
            yearly: bundle.trendingCountries.yearly || [],
          }
        }

        if (bundle.recentOrders) {
          this.recentOrders = bundle.recentOrders
        }

        this.bundleLoaded = true
        this.lastUpdated = now.toISOString()

        // --- COMPREHENSIVE DEBUGGING GUARD (Linden: "Add js to console log all empty or missing data") ---
        console.group('🛡️ ANALYTICS DATA INTEGRITY CHECK')

        const checks = []
        const warn = (section, msg) => {
          checks.push(`❌ ${section}: ${msg}`)
          console.warn(`❌ ${section}: ${msg}`)
        }
        const ok = (section) => {
          console.log(`✅ ${section}: Data present`)
        }

        // 1. EARNINGS
        if (!bundle.earnings) {
          warn('Earnings', 'Entire earnings section MISSING from bundle!')
        } else {
          ;['daily', 'weekly', 'monthly', 'yearly'].forEach((p) => {
            const arr = bundle.earnings[p]
            if (!arr || arr.length === 0) warn('Earnings', `${p} data is EMPTY`)
            else ok(`Earnings.${p} (${arr.length} entries)`)
          })
          if (!bundle.earnings.grandTotal) warn('Earnings', 'grandTotal is MISSING')
          // Check if earnings exist but total = 0
          const totalEarnings = bundle.earnings.grandTotal?.total
          if (totalEarnings === 0)
            warn('Earnings', 'grandTotal.total is 0 — possible child event wiring issue')
        }

        // 2. SUBSCRIPTIONS
        if (!bundle.subscriptions) {
          warn('Subscriptions', 'Entire subscriptions section MISSING!')
        } else {
          ;['daily', 'weekly', 'monthly', 'yearly'].forEach((p) => {
            const arr = bundle.subscriptions[p]
            if (!arr || arr.length === 0) warn('Subscriptions', `${p} data is EMPTY`)
            else ok(`Subscriptions.${p} (${arr.length} entries)`)
          })
        }

        // 3. FAN INSIGHTS
        if (!bundle.fanInsights) {
          warn('FanInsights', 'Entire fanInsights section MISSING!')
        } else {
          ;['daily', 'weekly', 'monthly', 'yearly'].forEach((p) => {
            const arr = bundle.fanInsights[p]
            if (!arr || arr.length === 0) warn('FanInsights', `${p} data is EMPTY`)
            else ok(`FanInsights.${p} (${arr.length} entries)`)
          })
          // Check sources
          if (!bundle.fanInsights.sources || Object.keys(bundle.fanInsights.sources).length === 0) {
            warn('FanInsights', 'Traffic sources data is EMPTY')
          }
          // Check countries with zero views
          const countries = bundle.fanInsights.countries
          if (countries) {
            Object.keys(countries).forEach((p) => {
              const arr = countries[p]
              if (arr && arr.length > 0 && arr.every((c) => c.views === 0 || c.earningsUSD === 0)) {
                warn(
                  'FanInsights',
                  `countries.${p} has ALL zero views/earnings — master events may not be wired`,
                )
              }
            })
          }
        }

        // 4. LIKES
        if (!bundle.likes) {
          warn('Likes', 'Entire likes section MISSING!')
        } else {
          if (!bundle.likes.daily?.length) warn('Likes', 'daily data is EMPTY')
          else ok(`Likes.daily (${bundle.likes.daily.length} entries)`)
        }

        // 5. CONTRIBUTORS
        if (!bundle.contributors) {
          warn('Contributors', 'Entire contributors section MISSING!')
        } else {
          ;['topContributors', 'topFirms', 'topOrderSpenders'].forEach((key) => {
            const arr = bundle.contributors[key]?.daily || bundle.contributors[key]?.weekly || []
            if (!arr.length) warn('Contributors', `${key} is EMPTY`)
            else ok(`Contributors.${key} (${arr.length} entries)`)
          })
          // Critical: If we have earnings but no top spenders
          const topSpendersArr = bundle.contributors.topOrderSpenders?.daily || bundle.contributors.topOrderSpenders?.weekly || []
          if (this.earnings?.daily?.length > 0 && !topSpendersArr.length) {
            warn(
              'CRITICAL',
              'We have earnings/orders but "topOrderSpenders" is EMPTY — child events broken!',
            )
          }
        }

        // 6. TRENDING
        if (!bundle.trendingsMedia || Object.keys(bundle.trendingsMedia).length === 0) warn('Trending', 'trendingsMedia is MISSING')
        if (!bundle.trendingMerch || Object.keys(bundle.trendingMerch).length === 0) warn('Trending', 'trendingMerch is MISSING')
        if (!bundle.trendingTags || Object.keys(bundle.trendingTags).length === 0) warn('Trending', 'trendingTags is MISSING')
        if (!bundle.trendingCountries || Object.keys(bundle.trendingCountries).length === 0) warn('Trending', 'trendingCountries is MISSING')

        // Summary
        if (checks.length === 0) {
          console.log('🎉 ALL DATA INTEGRITY CHECKS PASSED — No missing data detected')
        } else {
          console.warn(`⚠️ ${checks.length} DATA ISSUES FOUND — Review above warnings`)
        }
        console.groupEnd()
        // ---------------------------------------------------------------------------------
      } catch (err) {
        console.error('❌ Bundle fetch failed:', err)
      }
    },

    resetAnalytics() {
      this.subscriptionsBundle = {
        daily: [],
        weekly: [],
        monthly: [],
        yearly: [],
        grandTotal: null,
      }
      this.lastUpdated = null
      this.bundleLoaded = false
      this.metadata = { etag: null, lastUpdated: null }
    },
  },

  persist: {
    key: DASHBOARD_PERSIST_KEY,
    storage: () => resolvePersistStorage(),
    serializer: dashboardPersistSerializer,
    beforeRestore({ store }) {
      migrateLegacyPersistedState({
        storage: resolvePersistStorage(),
        newKey: DASHBOARD_PERSIST_KEY,
        legacyKeys: ['DashboardAnalytics'],
      })
      if (!store.metadata || typeof store.metadata !== 'object') {
        store.metadata = { etag: null, lastUpdated: null }
      }
    },
    afterRestore({ store }) {
      normalizeDashboardAnalyticsAfterRestore(store)
      attachStorageQuotaMonitor(store, { key: DASHBOARD_PERSIST_KEY, label: 'dashboard' })
    },
  },
})
