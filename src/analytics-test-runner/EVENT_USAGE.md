# Event Usage — Analytics Test Reference

Local copy of [Copy of Event Usage (Google Doc)](https://docs.google.com/document/d/11YKEooxjfhCnxhX2W0X7Aks5m4ClfHl-4iMcDCjjgcs/edit?usp=sharing).

**Test creator:** `99999` (isolated — do not use `566` for automated runs)  
**API server:** `http://15.235.59.191` (Node API at `/var/www/unified-api-handler/`)  
**Clear before each run:** `POST /api/events/clear` with `{ "creatorId": 99999 }`  
**Trigger event:** `POST /api/events/trigger` with `{ masterEventType, data }` (server requires `data`, not `fields`)  
**Ground truth:** `GET /api/charts/99999?nocache=1`

Each test case fires **one** master event after a clean database. Expected values = **baseline (post-clear) + single increment** from the payload below.

---

## New Subscription

**Trigger**

```json
{
  "masterEventType": "newOrder",
  "data": {
    "orderType": "new_subscription",
    "amount": 29.99,
    "countryId": 702,
    "countryCode": "SG",
    "planId": 2,
    "calculated_amount": 0,
    "is_switch": false,
    "creatorId": 99999,
    "fanId": 88001
  }
}
```

**Single-event increments (day period)**

| Area | Metric | Expected delta |
|------|--------|----------------|
| Main · Subscribers | NEW | +1 |
| Main · Subscribers | % vs yesterday | 100% when previous bucket was 0 |
| Main · Earnings | Total USD | +29.99 |
| Main · Earnings | % vs yesterday | 100% when previous bucket was 0 |
| Trends · Top Countries | Singapore sales | +29.99 (`countryId` 702 → UI label **Singapore**) |
| Popup · Subscribers | New subscriber donut / tier2 | +1 |
| Popup · Earnings | subscription slice | +29.99 |
| Popup · Earnings | total (week/month/year bars) | +29.99 |
| Main · Contributors | Top fan amount | +29.99 |

**Country mapping (payload → UI)**

| Field | Value | UI display |
|-------|-------|------------|
| `countryId` | 702 | Singapore |
| `countryCode` | SG | ISO reference |

---

## Recurring Subscription

```json
{
  "masterEventType": "newOrder",
  "data": {
    "orderType": "recurring_subscription",
    "amount": 10,
    "countryId": 840,
    "countryCode": "US",
    "planId": 3
  }
}
```

| Metric | Delta |
|--------|-------|
| RECURRING subscribers | +1 |
| Total earnings | +10 |
| Top Countries (US) | +10 |

---

## Merch Order

```json
{
  "masterEventType": "newOrder",
  "data": {
    "orderType": "merch",
    "amount": 15,
    "merchId": 4,
    "countryCode": "BR",
    "countryId": 634
  }
}
```

| Metric | Delta |
|--------|-------|
| Total earnings | +15 |
| Earnings chart · merch | +15 |
| Top Merch row | +1 sale (known gap: `trendingMerch` may stay empty) |

---

## Token Order

```json
{
  "masterEventType": "newOrder",
  "data": {
    "orderType": "token",
    "amount": 5,
    "tokenChannel": "tip",
    "countryCode": "FR",
    "countryId": 250
  }
}
```

| Metric | Delta |
|--------|-------|
| Total earnings (USD) | **0** (tips are tokens, not USD `total`) |
| Tokens Received / `tipTokens` | +5 |
| Top Countries (France) | +5 (`countryId` 250) |

---

## Follow

```json
{
  "masterEventType": "follow",
  "data": { "countryCode": "FI", "countryId": 352 }
}
```

| Metric | Delta |
|--------|-------|
| NEW FOLLOWERS (main + popup) | +1 |

---

## Profile Visit

```json
{
  "masterEventType": "profileVisit",
  "data": { "trafficSource": "referral", "countryCode": "RU", "countryId": 643 }
}
```

| Metric | Delta |
|--------|-------|
| PROFILE VISIT | +1 |

---

## Tag Engagement

```json
{
  "masterEventType": "tagEngagement",
  "data": { "tagId": "Panty_Fetish", "engagementType": "click" }
}
```

| Metric | Delta |
|--------|-------|
| Top Tags · views | +1 |

---

## Cancel Subscription

1. Clear database  
2. Seed one `new_subscription` (+29.99, plan 2, SG)  
3. Fire cancel:

```json
{
  "masterEventType": "subscriptionCancel",
  "data": { "planId": 10, "subscriptionId": 10, "countryCode": "SG", "countryId": 702 }
}
```

| Metric | Expected delta |
|--------|----------------|
| NEW subscribers | −1 |
| Total earnings | −29.99 |

**Known gap:** cancel may not reverse earnings in API/UI.

---

## Percentage validation

The test runner validates **all overview `%` indicators** and **popup stat header `%`** where the Vue UI renders them.

### Main dashboard (vs yesterday)

Uses `calculatePeriodChangePercent` via `buildSubscriberInsights` / `buildEarningsInsights` / `mapFansFromFanInsights` / `mapLikesSummary`:

| Card | Fields | Runnable test cases |
|------|--------|---------------------|
| Subscribers | NEW %, RECURRING % | New Subscription, Recurring, Cancel |
| Earnings | Total % | New/Recurring/Merch/Token/Cancel |
| Fans | NEW FOLLOWERS %, PROFILE VISIT % | Follow, Profile Visit |
| Likes | MEDIA/MERCH/PROFILE/FEED % | mediaLike, merchLike, etc. (when enabled) |

After **clear + one event**: NEW subscribers and earnings typically show **100%** (previous bucket 0 → current positive).

RECURRING % is **null/hidden** when recurring count stays 0.

### Popup stat headers (day / week / month / year / alltime)

Uses popup-specific logic (requires **2+ period buckets** and **previous ≠ 0**):

| Popup | Metrics |
|-------|---------|
| Earnings | Total earnings %, Tokens received % |
| Fans | New Followers %, Profile Visit % |
| Subscribers | New / Recurring % — **known gap**: stat cards commented out in Vue template |

Popup daily `%` is often **hidden** after a single-event ingest (only one daily bucket). Week/month rows appear when the API returns 2+ buckets.

### Implementation files

- `config/percentageResolvers.js` — mirrors Vue mapper / popup formulas
- `config/percentageExpectationRows.js` — builds scan rows per test case
- `scanners/domScanners.js` — `cardPercentageByHeading`, `cardMetricPercentage`, `popupPercentageByStatHeading`

### How to verify

1. Run a test case (e.g. **New Subscription**).
2. In the expectations table, filter for `%` in the Field column.
3. **PASS** = DOM `%` matches API-derived expected value.
4. **GAP** = known UI limitation (e.g. subscribers popup % commented out).
5. Row omitted = expected `%` is null (indicator not shown in UI).

---

## Views scanned per event

1. **Main dashboard** — overview cards (`[data-value]`, `%` indicators)  
2. **Trends** — Top Countries, Top Tags, Top Merch, Top Media  
3. **Popups** — Subscribers, Earnings, Fans, Likes, Contributors (day / week / month / year / alltime)  
4. **amCharts** — runtime dataset via `am5.registry`  
5. **Orders Received** — when `recentOrders` exists in API (currently missing — known gap)

---

## Known backend gaps (report only)

| Gap | Impact |
|-----|--------|
| `recentOrders` missing | Orders Received empty |
| `subscriptions.alltime` / `earnings.alltime` missing | All Time popup periods |
| Country code `Country 702` in raw API | UI still maps to Singapore |
| Cancel does not reverse earnings | Cancel test fails earnings check |
| `trendingMerch` empty after merch | Top Merch empty |
| `orderType: "p2v"` rejected | P2V blocked |

---

## Test runner controls

- **Pause before each DOM scan** — unlocks the page between scan steps so you can manually edit DOM values, then click **Resume DOM scan** on the overlay.  
- **Incremental expectations** — every numeric row is `baseline + 1 event`, not polluted cumulative history.
