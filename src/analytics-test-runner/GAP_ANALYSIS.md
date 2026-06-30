# Gap Analysis — Google Doc vs Live Analytics (creator `99999`)

Reference: [Copy of Event Usage](https://docs.google.com/document/d/11YKEooxjfhCnxhX2W0X7Aks5m4ClfHl-4iMcDCjjgcs/edit?usp=sharing)

Test creator: **99999** (isolated from shared QA id `566`)

Visual URL: `https://admin.uy4sdjn4f7.com/?creator_id=99999`  
Local URL: `http://localhost:5173/iframe/analytics?creator=99999`

---

## Method

1. Fired `new_subscription` on creator **99999** via `POST /api/events/trigger`
2. Compared `/api/charts/99999` payload vs Google Doc “Need to update in here” sections
3. Cross-checked Vue mapping in `analyticsResponseMapper.js` + overview/popup components
4. Compared with prior visual QA on creator **566** (screenshots)

---

## New Subscription — Doc vs Actual

| Doc expects | API after ingest | UI (566 screenshots / 99999 API) | Status |
|-------------|------------------|-----------------------------------|--------|
| Subscribers NEW +1 | `newSubscriber: 1`, `tier2: 1` | Main card shows NEW count | ✅ PASS |
| Subscribers RECURRING | `recurringSubscriber: 0` | Main card shows RECURRING | ✅ PASS |
| Total Earnings += amount | `total: 29.99`, `subscription: 29.99` | Main Earnings **84.99** on 566 / **29.99** on 99999 | ✅ PASS |
| Top Contributors | `topContributors: Fan 88001 $29.99` | Preview table populated on 566 | ✅ PASS |
| Top Countries | `trendingCountries.daily` has row | Shows **Singapore** on 566; **Country 702** on 99999 | ⚠️ PARTIAL — wrong country label |
| Subscriptions Trend D/W/M/Y | `subscriptions.{daily,weekly,monthly,yearly}` all have data | Popup donuts on 566 | ✅ PASS |
| Earnings Trend D/W/M/Y | `earnings.*` periods populated | Popup + donuts on 566 | ✅ PASS |
| Contributors Trend D/W/M/Y | Flat contributor arrays (no per-period keys) | Popup bars on 566 | ⚠️ PARTIAL — period toggle may not change data |
| **Orders Received** subscription row | **`recentOrders` missing from API** | Tab visible but likely **empty** | ❌ FAIL |
| Top Merch / Top Media | N/A for new sub | Empty on fresh creator | — N/A |

---

## Global payload gaps (affect multiple events)

These break JSON contract validation (`fail: 77` on live payload) and block several doc expectations:

| Missing / broken in `/api/charts` | Doc impact | UI impact |
|-----------------------------------|------------|-----------|
| `recentOrders` (entire object) | Orders Received for **all** order types | Orders Received section empty |
| `subscriptions.alltime`, `earnings.alltime`, `likes.alltime`, `fanInsights.alltime` | Period = All Time in popups | All Time toggle may show stale/empty |
| `trendingMerch.daily` empty after merch ingest | Top Merch | “No trend to show” |
| P2V `orderType: "p2v"` rejected | P2V order + Top Media sales | Event blocked at API |
| Cancel does not reverse earnings | Cancel Subscription doc | Earnings stays high after cancel |
| Country `702` → `"Country 702"` not `"Singapore"` | Top Countries | Wrong label in table/map |
| `fans.daily` null when only `fanInsights` present | Follow / Profile Visit main cards | Followers may show 0 incorrectly |

---

## Per-event status (full Google Doc)

| Event | Doc sections | Overall |
|-------|--------------|---------|
| New Subscription | Subscribers, Earnings, Contributors, Countries, Trends, Orders | ⚠️ PARTIAL |
| Recurring Subscription | Earnings, Contributors, Countries, Orders, Trends | ⚠️ PARTIAL |
| Switch Subscription | Same as New Subscription | ⚠️ PARTIAL |
| Cancel Subscription | Earnings should decrease | ❌ FAIL |
| Merch Order | Earnings, Contributors, Orders, **Top Merch**, Countries | ❌ FAIL (Top Merch) |
| P2V Order | Earnings, Contributors, Orders, **Top Media** | 🚫 BLOCKED (API validation) |
| Token (tip/call/chat/livestream) | Earnings, Contributors, Countries, Trends | ⚠️ PARTIAL |
| Follow / Unfollow | Fans overview + Fans Trend all periods | ⚠️ PARTIAL |
| Profile Visit | Fans + traffic source | ⚠️ PARTIAL |
| Media Like/Unlike | Likes overview + Likes Trend | ⚠️ PARTIAL |
| Profile/Merch/Feed Like/Unlike | Same as Media Like pattern | ⚠️ UNTESTED on 99999 |
| Tag Engagement | Top Tags | ✅ PASS |
| Media View / Watch Duration | Top Media clicks/duration | ⚠️ PARTIAL on fresh creator |

---

## What the test runner must assert (per doc)

For each master event in `config/eventExpectations.js`:

1. **Main dashboard** — `[data-value]` on overview cards (day only)
2. **Trend popups** — open via Trend button on heading; toggle **day/week/month/year/alltime**
3. **amCharts** — `am5.registry.rootElements` mapped by `[data-chart-container][data-chart-id]`
4. **Trends section** — Top Media, Top Tags, Top Merch, Top Countries tables
5. **Orders Received** — tabbed table (`DashboardAnalyticsOrdersReceivedTable.vue`)

Expected rows must be generated **per period**, not only “today”.

---

## Recommended test creator setup

```js
creatorId: 99999
fanId: 88001  // unique per test run to avoid duplicate/idempotency
```

Clear before each case: `POST /api/events/clear` with `{ creatorId: 99999 }`

---

## Backend fixes required (out of test runner scope)

1. Emit `recentOrders` in charts payload
2. Add `alltime` branches to subscriptions/earnings/likes/fanInsights
3. Accept `orderType: "p2v"`
4. Reverse earnings on `subscriptionCancel`
5. Populate `trendingMerch` after merch orders
6. Map `countryId` 702 → `Singapore` (and other ISO names)
7. Fix `fans` summary when `fanInsights` has data
