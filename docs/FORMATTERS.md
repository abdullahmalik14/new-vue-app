# Global Formatters — Documentation

**File:** `src/utils/common/formatters.js`
**Barrel export:** `src/utils/common/index.js`
**Tests:** `tests/unit/formatters.test.js`
**Last updated:** July 2026

---

## Overview

A single, global set of formatting helpers for **decimals, money and dates**.
The goal is to remove scattered, inline `.toFixed(2)` calls (and ad‑hoc `formatCurrency`
helpers) from components and give the whole codebase **one consistent, timezone‑
independent, null‑safe** way to display numbers and prices.

Everything is built on top of one primitive: **`formatDecimal()`**. The currency
helpers just add a symbol / currency code on top of it.

---

## How to import

Prefer the barrel export (`@/utils/common`) so imports stay short and stable:

```js
import { formatDecimal, formatCurrency, formatPrice, formatUsdPrice } from '@/utils/common';
```

Direct import from the module also works (used by some existing files):

```js
import { formatDecimal } from '@/utils/common/formatters.js';
```

> ❌ Do **not** re‑implement a local `formatCurrency` / `.toFixed(2)` inside a component.
> ✅ Always import from `@/utils/common`.

---

## Functions

### `formatDecimal(val)`

Truncates a value to **exactly 2 decimal places without rounding**.

| Aspect | Behavior |
|--------|----------|
| Rounding | **No rounding** — it truncates (`5.19999 → 5.19`, not `5.20`) |
| Input types | `number` or `string` |
| Currency strings | Auto‑cleaned — strips symbols, commas, spaces (`"USD$ 2,698.00" → "2698.00"`) |
| Float noise | Cleaned first (`6.780000000000001 → 6.78`) |
| `null` / `undefined` / `''` / `'abc'` | Returns `'0.00'` (never throws) |
| Return type | `string` |

```js
formatDecimal(5.19999)        // "5.19"
formatDecimal(10.5678)        // "10.56"
formatDecimal(45)             // "45.00"
formatDecimal(45.5)           // "45.50"
formatDecimal('45.999')       // "45.99"
formatDecimal(-5.199)         // "-5.19"
formatDecimal('USD$ 9.99')    // "9.99"
formatDecimal('USD$ 2,698.00')// "2698.00"
formatDecimal(null)           // "0.00"
formatDecimal(undefined)      // "0.00"
formatDecimal('abc')          // "0.00"
```

---

### `formatCurrency(val, currency = 'USD')`

`formatDecimal` + a **currency symbol** (no currency code prefix).

Supported symbols: `USD → $`, `EUR → €`, `GBP → £`. Unmapped codes fall back to `''` (symbol omitted).

```js
formatCurrency(45.999, 'USD')  // "$45.99"
formatCurrency(45.999, 'EUR')  // "€45.99"
formatCurrency(45.999, 'GBP')  // "£45.99"
formatCurrency(45.999, 'JPY')  // "45.99"  (no symbol mapped)
```

---

### `formatPrice(val, currency = 'USD')`

The **project‑standard price format**: `CODE symbol amount` → e.g. `USD $45.00`.
Unmapped currency codes fall back to the `$` symbol.

```js
formatPrice(45, 'USD')       // "USD $45.00"
formatPrice(45.5, 'USD')     // "USD $45.50"
formatPrice('45.999', 'USD') // "USD $45.99"
```

---

### `formatUsdPrice(val)`

Shorthand for `formatPrice(val, 'USD')` — the most common case.

```js
formatUsdPrice(45)        // "USD $45.00"
formatUsdPrice('45.999')  // "USD $45.99"
```

---

### `formatDate(dateInput)` (bonus, same file)

Timezone‑independent date formatting → `22nd JAN 2022` (ordinal day + uppercase month).
Accepts `YYYY-MM-DD`, `YYYY/MM/DD`, or a `Date` object. Returns `''` for empty input and
echoes back unparseable strings unchanged.

```js
formatDate('2022-01-22')     // "22nd JAN 2022"
formatDate('2022-01-01')     // "1st JAN 2022"
formatDate(new Date(2022,0,22)) // "22nd JAN 2022"
formatDate(null)             // ""
```

---

## Which one should I use?

| Need | Use |
|------|-----|
| Just 2‑decimal number, symbol added manually in template (e.g. `USD${{ ... }}`) | `formatDecimal(val)` |
| Amount with a currency **symbol** only (`$45.00`) | `formatCurrency(val, code)` |
| Amount in full project format (`USD $45.00`) | `formatPrice(val, code)` |
| Same as above but always USD | `formatUsdPrice(val)` |
| A date like `22nd JAN 2022` | `formatDate(val)` |

---

## Where it's used (as of July 2026)

| File | Function | What |
|------|----------|------|
| `WithdrawEarningsStep2.vue` | `formatDecimal` | Available balance display |
| `WithdrawEarningsStep4.vue` | `formatDecimal` | Available balance, payout amount, latest balance (3 places) |
| `DashboardAnalyticsTopMediaTable.vue` | `formatDecimal` | P2V sales USD column |
| `DashboardAnalyticsTopMerchTable.vue` | `formatDecimal` | Sales USD column |
| `DashboardAnalyticsOrdersReceivedTable.vue` | `formatUsdPrice`, `formatDate` | Order total + date |

> Pending adoption spots (still on inline `.toFixed(2)` / local helpers) are tracked in
> **[FORMATTERS_USAGE_CHECKLIST.md](./FORMATTERS_USAGE_CHECKLIST.md)**.

---

## Best practices / development rules

1. **Never** use inline `.toFixed(2)` for money/decimals in components — import a formatter.
2. **Never** define a local `formatCurrency` inside a component — use the global one.
3. Remember `formatDecimal` **truncates, does not round** (product decision). If you truly
   need rounding, that's a different requirement — raise it, don't silently `.toFixed`.
4. Return values are **strings** ready for display — don't do further math on them.
5. Non‑monetary rounding (e.g. SVG coordinates in `SparkLine.vue` using `.toFixed(1)`) is
   **out of scope** — leave it alone.
6. If a new currency is needed, add it once to `CURRENCY_SYMBOLS` in `formatters.js`.

---

## Testing

Unit tests live in `tests/unit/formatters.test.js` (Vitest) and cover truncation,
negatives, currency‑string cleaning, null/invalid input, and all currency helpers.

```bash
npm run test           # run the suite
npm run test -- formatters
```

---

## Related

- [FORMATTERS_USAGE_CHECKLIST.md](./FORMATTERS_USAGE_CHECKLIST.md) — per‑file adoption checklist + do/don't rules
- `src/utils/common/README.md` — common utilities overview
