# Metric Contract System

> **Primary guide for adding new DOM values and chart metrics to the analytics test runner.**

The contract system makes the analytics test runner **deterministic**. Every assertion targets a `data-analytics-*` attribute — no heading walks, no amCharts `dataContext` reverse-engineering, no HTML `id` selectors.

---

## 1. Architecture

```
Master event → masterEventChildMap.js → expectationState
                                             │
                                             ▼
                                      getStateMetric
                                         (expected)
                                             │
analyticsMetricRegistry.js                  │
    │                                       │
    ├─► Vue template                        │
    │   data-analytics-metric on span       │
    │         │                             │
    │         ▼                             │
    │   scanMetricSelector ─────────────► compareExpectedToFound
    │                                       ▲
    └─► chartsHandler stamp                 │
        data-analytics-values on container  │
              │                             │
              ▼                             │
        validateChartContract              │
        scanChartMetric ────────────────────┘
```

Two validation layers run on every test case:

| Layer | What it checks |
|---|---|
| **Contract/schema** | Required attributes and metric keys exist for this chart container |
| **Value** | Stamped/read value matches internal `expectationState` |

---

## 2. Attribute reference

### DOM value elements

| Attribute | Required | Example |
|---|---|---|
| `data-analytics-metric` | ✅ | `"earnings.total"` |
| `data-analytics-period` | ✅ | `"day"` |
| `data-analytics-surface` | ✅ | `"main"` \| `"popup-earnings"` \| `"trends"` |
| `data-value` | ✅ | `"99.50"` — raw numeric string |

### Chart containers

| Attribute | Set by | Example |
|---|---|---|
| `data-analytics-chart-id` | chartsHandler stamp | `"sales-daily-donut"` |
| `data-analytics-period` | chartsHandler stamp | `"day"` |
| `data-analytics-chart-type` | chartsHandler stamp | `"donut"` \| `"bar"` |
| `data-analytics-values` | chartsHandler stamp | `{"earnings.subscription":150,"earnings.merch":25}` |
| `data-analytics-rendered-at` | chartsHandler stamp | ISO timestamp |

`data-analytics-values` shapes:
- **Donut slices**: `{ "earnings.subscription": 150 }` — scalar number
- **Bar/line last slot**: `{ "earnings.total": { "last": 200, "slots": [100, 150, 200] } }`

### Periods

| Value | UI meaning |
|---|---|
| `day` | Today (daily view) |
| `week` | Weekly view |
| `month` | Monthly view |
| `year` | Yearly view |
| `alltime` | All-time view |
| `*` | Any period (DOM binding wildcard) |

### Surfaces

| Value | Used in |
|---|---|
| `main` | Overview section main cards |
| `popup-earnings` | Earnings trend popup stat header |
| `popup-fans` | Fans trend popup stat header |
| `popup-subscribers` | Subscribers trend popup (when stat cards are shown) |
| `trends` | Trends section (countries table, etc.) |

---

## 3. Adding a new DOM value metric (checklist)

### Step 1 — Register the metric

In `src/analytics-test-runner/config/analyticsMetricRegistry.js`, add an entry:

```js
{
  metricKey: 'my-domain.my-metric',
  stateResolver: 'ui.myDomain.daily.myMetric',
  bindings: [
    { kind: 'dom', surface: 'main', period: 'day' },
  ],
},
```

### Step 2 — Add Vue attributes

In the relevant Vue template, add to the value `<span>`:

```html
<span
  :data-value="storeValue"
  data-analytics-metric="my-domain.my-metric"
  data-analytics-period="day"
  data-analytics-surface="main"
  ...existing classes...
>{{ displayValue(storeValue) }}</span>
```

**Never use `id` for test targeting.**

### Step 3 — Add the expectation row

In `src/analytics-test-runner/config/buildExpectationsFromState.js` (or the appropriate builder):

```js
singularRow(testCaseKey, {
  idSuffix: 'singular.main.my-domain.my-metric',
  view: 'Main',
  location: 'My Card',
  metric: 'My Metric',
  period: 'day',
  apiPath: 'ui.myDomain.daily.myMetric',
  scan: { type: 'metricSelector', metric: 'my-domain.my-metric', period: 'day', surface: 'main' },
}, state),
```

### Step 4 — Extend unit tests

Add a state assertion in `tests/unit/analyticsTestRunnerExpectationState.test.js`.

### Step 5 — Verify in browser

Run `runAnalyticsTestCase('theRelevantCase')` in the panel. The row should show `PASS`.

---

## 4. Adding a new chart metric (checklist)

### Step 1 — Register the metric in the registry

```js
{
  metricKey: 'earnings.new-channel',
  stateResolver: 'ui.earningsChart.daily.newChannel',
  bindings: [
    { kind: 'chart', chartId: 'sales-daily-donut', period: 'day', shape: 'scalar' },
    { kind: 'chart', chartId: 'sales-weekly-bar', period: 'week', shape: 'last' },
  ],
},
```

### Step 2 — Add the breakdown mapping

In `src/analytics-test-runner/config/breakdownKeyToMetric.js`:

```js
newChannel: 'earnings.new-channel',
```

This maps the chart dataset field name to the registry metric key.

### Step 3 — Declare the metric in the chart contract

In `src/analytics-test-runner/config/chartContractSchema.js`, add to the relevant contract:

```js
'sales-daily-donut': {
  ...
  requiredMetrics: {
    'earnings.subscription': { shape: 'scalar' },
    'earnings.new-channel': { shape: 'scalar' },  // ← add here
  },
},
```

### Step 4 — Ensure the popup injects the field

In the popup component's `injectChartData()` function, the field must be present in the dataset rows that are written to `window.chartsHandler._configs.data`. The stamp logic in `chartsHandler.js` picks it up automatically via the breakdown key mapping.

### Step 5 — Add a chart expectation row

```js
chartRow(testCaseKey, {
  idSuffix: `chart.popup.earnings.newChannel.${period}`,
  view: 'Popup · Earnings',
  location: 'Earnings chart dataset',
  metric: 'earnings.new-channel',
  period,
  apiPath: `ui.earningsChart.${apiP}.newChannel`,
  popup: { openFromHeading: 'Earnings' },
  periodToggle: period,
  scan: { type: 'chartContract', chartId: 'sales-daily-donut', period, metric: 'earnings.new-channel', shape: 'scalar' },
  chart: earningsChartRule(period, 'newChannel'),   // keep as fallback during migration
}, state),
```

### Step 6 — Verify in DevTools

After the popup opens and the chart renders, inspect the container:

```
document.querySelector('[data-chart-id="sales-daily-donut"]')
  .getAttribute('data-analytics-values')
// → '{"earnings.subscription":150,"earnings.merch":25,"earnings.new-channel":40}'
```

---

## 5. Chart ID reference table

| Popup | Period | Chart ID | Type |
|---|---|---|---|
| Earnings | day | `sales-daily-donut` | donut |
| Earnings | week | `sales-weekly-bar` | bar |
| Earnings | month | `sales-monthly-bar` | bar |
| Earnings | year | `sales-yearly-bar` | bar |
| Earnings | alltime | `sales-alltime-bar` | bar |
| Earnings (tokens) | day | `tokens-daily-donut` | donut |
| Earnings (tokens) | week | `tokens-weekly-bar` | bar |
| Earnings (tokens) | month | `tokens-monthly-bar` | bar |
| Earnings (tokens) | year | `tokens-yearly-bar` | bar |
| Earnings (tokens) | alltime | `tokens-alltime-bar` | bar |
| Subscribers | day | `subs-daily-donut` | donut |
| Subscribers | week | `subs-weekly-bar` | bar |
| Subscribers | month | `subs-monthly-bar` | bar |
| Subscribers | year | `subs-yearly-bar` | bar |
| Subscribers | alltime | `subs-alltime-bar` | bar |
| Subscribers (tiers) | day | `tiers-daily-donut` | donut |
| Subscribers (tiers) | week | `tiers-weekly-bar` | bar |
| Fans | week | `fans-weekly-bar` | bar |
| Fans | month | `fans-monthly-bar` | bar |
| Fans | year | `fans-yearly-bar` | bar |
| Fans | alltime | `fans-alltime-bar` | bar |
| Likes | day | `likes-chart` | bar |

---

## 6. Scan types reference

| `scan.type` | When to use | Required fields |
|---|---|---|
| `metricSelector` | DOM value span | `metric`, `period`, `surface` |
| `chartContract` | Chart value via contract | `chartId`, `period`, `metric`, `shape` |
| `cardValueByHeading` | **Deprecated** — heading walk | `heading`, `field?` |
| `cardMetricByLabel` | **Deprecated** — label walk | `heading`, `label` |
| `popupStatByHeading` | **Deprecated** — heading walk in popup | `heading` |
| `cardPercentageByHeading` | **Deprecated** — heuristic % | `heading`, `field?` |

Deprecated types remain functional until all rows are migrated. Do not add new rows using deprecated types.

---

## 7. Troubleshooting

### `Element not found: [data-analytics-metric="…"]`

- The Vue template is missing `data-analytics-metric` on the span.
- The `period` or `surface` filter doesn't match what was stamped.
- The component isn't rendered yet (e.g. popup not open).

### `Chart "…" has no data-analytics-rendered-at`

- `chartAnalyticsContract.js` is not loaded before `chartsHandler.js`.
- The chart errored during `instantiateChart` and the stamp was never called.
- Check DevTools console for `[renderChartInstance] [ERROR]`.

### `Contract fail for "…": Missing required metric`

- The dataset field is missing from the rows passed to `injectChartData()`.
- The breakdown key isn't in `breakdownKeyToMetric.js`.
- The chart used a different field name than expected.

### Value mismatch (FAIL in comparison table)

- Contract passes but value differs → the state resolver (`apiPath`) or the dataset field is mis-mapped.
- Check `data-analytics-values` in DevTools vs. the `expectedValue` shown in the panel.

---

## 8. Files owned by this system

| File | Role |
|---|---|
| `src/analytics-test-runner/config/analyticsMetricRegistry.js` | Single source of truth for all metric keys + bindings |
| `src/analytics-test-runner/config/chartContractSchema.js` | Required attributes + metrics per chart container |
| `src/analytics-test-runner/config/breakdownKeyToMetric.js` | Chart field name → metric key mapping |
| `public/chartAnalyticsContract.js` | Stamp logic (plain JS, called from chartsHandler) |
| `src/analytics-test-runner/scanners/domScanners.js` | `scanMetricSelector` + legacy scanners |
| `src/analytics-test-runner/scanners/chartContractScanner.js` | `validateChartContract` + `scanChartMetric` |
| `src/analytics-test-runner/scanners/executeScan.js` | Routes scan types to correct scanner |
