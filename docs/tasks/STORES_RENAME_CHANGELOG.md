# Stores Rename & Extraction Changelog

Date: 2026-06-07  
Scope: `src/stores/` naming compliance and analytics content extraction.

Import path updates in consumers are omitted — they follow mechanically from file/export renames.

---

## `src/stores`

| Original | Change | Original line | Why |
|----------|--------|---------------|-----|
| `ipStore.js` | **Deleted** — replaced by `useIpStore.js` | file | Pinia store files must use `useNameStore.js` per naming guidelines §17 / §25. |
| `useIpStore.js` | **Created** (same store logic as former `ipStore.js`) | file | Canonical filename for the existing `useIpStore` export. |
| `export const useIpStore` | unchanged | `useIpStore.js` L48 | Export already matched composable-style store naming. |
| `defineStore('ip', …)` | unchanged | `useIpStore.js` L48 | Short lowercase store id matches `auth`, `cart`, `locale`. |
| `setIp` / `removeIp` | unchanged | `useIpStore.js` L60–70 | Action verbs already follow store action naming rules. |
| `DashboardAnalytics.js` | **Deleted** — replaced by `useDashboardAnalyticsStore.js` | file | Store file used PascalCase without `use`/`Store` suffix. |
| `useDashboardAnalyticsStore.js` | **Created** (slimmed store) | file | Pinia store file naming standardization. |
| `export const useDashboardAnalytics` | `export const useDashboardAnalyticsStore` | `DashboardAnalytics.js` L72 → `useDashboardAnalyticsStore.js` L104 | Store composable export must include `Store` suffix. |
| `defineStore('DashboardAnalytics', …)` | `defineStore('dashboardAnalytics', …)` | `DashboardAnalytics.js` L72 → `useDashboardAnalyticsStore.js` L104 | Align Pinia id casing with other stores (`auth`, `cart`). |
| `DASHBOARD_PERSIST_KEY = buildPersistKey('DashboardAnalytics')` | `DASHBOARD_ANALYTICS_PERSIST_KEY = buildPersistKey('dashboard-analytics')` | `DashboardAnalytics.js` L16–17 → `useDashboardAnalyticsStore.js` L17–18 | Persist keys should use lowercase kebab domain keys; legacy key kept for migration. |
| `dashboardPersistSerializer` | `dashboardAnalyticsPersistSerializer` | `DashboardAnalytics.js` L18 → `useDashboardAnalyticsStore.js` L19 | Renamed to match new store/file name. |
| `_findLatestNonZero` getter | **Removed from store** → `findLatestNonZeroEntry()` in mapper | `DashboardAnalytics.js` L154–164 | Private helper logic belongs in service mapper, not Pinia getters. |
| `subscribers` getter | `subscriberInsights` getter | `DashboardAnalytics.js` L167 → `useDashboardAnalyticsStore.js` L178 | Getter name should be domain-specific and readable per §19. |
| `earningsInsights` getter | unchanged name; logic moved to `buildEarningsInsights()` | `DashboardAnalytics.js` L221 → mapper + `useDashboardAnalyticsStore.js` L182 | Presentation derivation extracted; getter now delegates to mapper. |
| `setAnalyticsAction(bundle)` | `syncAnalyticsBundle(bundle)` | `DashboardAnalytics.js` L242 → `useDashboardAnalyticsStore.js` L193 | Pipeline hydration should use `sync` verb; `*Action` is vague per §18. |
| Inline `mapSub` / `mapFans` / `getPct` / `calcPct` in action | **Moved** to `analyticsResponseMapper.js` | `DashboardAnalytics.js` L262–407 | Mapping/transformation belongs in `services/analytics/mappers/`, not store. |
| Integrity `console.group` block in action | **Moved** to `validateAnalyticsBundleIntegrity()` | `DashboardAnalytics.js` L412–518 | Validation/logging belongs in `services/analytics/validators/`, not store. |
| `resetAnalytics()` | `resetAnalyticsState()` | `DashboardAnalytics.js` L525 → `useDashboardAnalyticsStore.js` L209 | Store reset actions should use explicit `resetXState` naming. |
| `legacyKeys: ['DashboardAnalytics']` | `legacyKeys: ['DashboardAnalytics', 'dashboard-analytics']` | `DashboardAnalytics.js` L547 → `useDashboardAnalyticsStore.js` L231 | Preserve old persisted data after persist key rename. |
| `baseKey: 'DashboardAnalytics'` | `baseKey: 'dashboard-analytics'` | `DashboardAnalytics.js` L548 → `useDashboardAnalyticsStore.js` L232 | Align migration base key with new persist key. |
| `label: 'dashboard'` | `label: 'dashboard-analytics'` | `DashboardAnalytics.js` L556 → `useDashboardAnalyticsStore.js` L241 | Quota monitor label matches new persist domain key. |

---

## `src/services/analytics/mappers`

| Original | Change | Original line | Why |
|----------|--------|---------------|-----|
| _(none — new file)_ | `analyticsResponseMapper.js` created | file | Mapper layer for analytics bundle shape transformation per architecture §2.4 / naming §16. |
| `calcPct` / `getPct` inline helpers | `calculatePeriodChangePercent()` | `DashboardAnalytics.js` L172–176, L300–303, L359–362 | Shared pure percentage helper with explicit verb naming. |
| `_findLatestNonZero` getter logic | `findLatestNonZeroEntry()` | `DashboardAnalytics.js` L154–164 | Reusable non-store helper for latest non-zero time-series entry. |
| `mapSub` inline closure | `mapSubscriptionsPeriod()` + `mapSubscriptionsBundle()` | `DashboardAnalytics.js` L262–286 | Subscription bundle mapping extracted to mapper module. |
| Earnings assignment block | `mapEarningsBundle()` | `DashboardAnalytics.js` L288–297 | Earnings response mapping extracted to mapper module. |
| `mapFans` inline closure | `mapFanInsightsPeriod()` + `mapFansFromFanInsights()` + `mapRawFanInsights()` | `DashboardAnalytics.js` L305–355 | Fan insights mapping extracted to mapper module. |
| Likes assignment block | `mapLikesSummary()` | `DashboardAnalytics.js` L358–385 | Likes summary mapping extracted to mapper module. |
| Trending countries assignment | `mapTrendingCountries()` | `DashboardAnalytics.js` L397–402 | Countries slice mapping extracted to mapper module. |
| `subscribers` getter body | `buildSubscriberInsights()` | `DashboardAnalytics.js` L167–217 | UI-facing subscriber insights derivation lives in mapper. |
| `earningsInsights` getter body | `buildEarningsInsights()` | `DashboardAnalytics.js` L221–237 | UI-facing earnings insights derivation lives in mapper. |
| Full action mapping orchestration | `mapAnalyticsBundleResponse()` | `DashboardAnalytics.js` L242–407 | Single mapper entry used by `syncAnalyticsBundle`. |

---

## `src/services/analytics/validators`

| Original | Change | Original line | Why |
|----------|--------|---------------|-----|
| _(none — new file)_ | `analyticsBundleValidator.js` created | file | Validator layer for analytics bundle integrity checks. |
| `console.group('🛡️ ANALYTICS DATA INTEGRITY CHECK')` block | `validateAnalyticsBundleIntegrity()` | `DashboardAnalytics.js` L412–518 | Debug validation does not belong in Pinia store actions. |

---

## `src/services/flow-system`

| Original | Change | Original line | Why |
|----------|--------|---------------|-----|
| `action: "setAnalyticsAction"` | `action: "syncAnalyticsBundle"` | `flowRegistry.js` L1845 | Flow registry must target renamed store action. |

---

## `src/templates/analytics`

| Original | Change | Original line | Why |
|----------|--------|---------------|-----|
| `store.subscribers` (13 usages) | `store.subscriberInsights` | `AnalyticsPage.vue` L86–906 | Getter renamed for clearer domain-specific naming. |

---

## Final `src/stores/` inventory

```text
useAuthStore.js
useCartStore.js
useChatStore.js
useLocaleStore.js
usePreloadStore.js
useIpStore.js
useDashboardAnalyticsStore.js
```

All store files now follow `useNameStore.js` naming.
