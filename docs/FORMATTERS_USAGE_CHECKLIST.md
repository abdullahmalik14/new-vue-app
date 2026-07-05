# ✅ Formatters — Usage Checklist

**Purpose:** Make every decimal / money value in the app go through the **global
formatters** (`src/utils/common/formatters.js`) instead of scattered inline
`.toFixed(2)` calls or local `formatCurrency` helpers.
**Use this:** When adding/editing any component that displays a number, price, balance or date.
**Full docs:** [FORMATTERS.md](./FORMATTERS.md)

---

## 📋 How to use this checklist

1. Building a screen that shows money/decimals? Go through the **Rules** below.
2. Pick the right function from the **Decision guide**.
3. If you find an inline `.toFixed(2)` or a local formatter, migrate it and tick it off in
   the **Adoption tracker**.

---

## ✅ Rules (do / don't)

- [ ] ✅ Use **`formatDecimal(val)`** for a plain 2‑decimal number (symbol added in template).
- [ ] ✅ Use **`formatCurrency(val, code)`** for an amount with a symbol only → `$45.00`.
- [ ] ✅ Use **`formatPrice(val, code)`** for the standard format → `USD $45.00`.
- [ ] ✅ Use **`formatUsdPrice(val)`** as the USD shorthand → `USD $45.00`.
- [ ] ✅ Use **`formatDate(val)`** for dates → `22nd JAN 2022`.
- [ ] ✅ Import from **`@/utils/common`** (barrel) — not a copy inside the component.
- [ ] ❌ Do **not** use inline `.toFixed(2)` for money/decimals.
- [ ] ❌ Do **not** define a local `formatCurrency()` inside a component.
- [ ] ❌ Do **not** round manually — `formatDecimal` **truncates** by design (`5.199 → 5.19`).
- [ ] ⚠️ Non‑monetary rounding (SVG coords, chart math) is **exempt** — leave it.

---

## 🧭 Decision guide

| You want to show… | Function | Output |
|-------------------|----------|--------|
| `USD${{ ... }}` (symbol already in markup) | `formatDecimal(val)` | `45.00` |
| Amount with symbol | `formatCurrency(val, 'USD')` | `$45.00` |
| Full project price | `formatPrice(val, 'USD')` | `USD $45.00` |
| USD price (shorthand) | `formatUsdPrice(val)` | `USD $45.00` |
| A date | `formatDate(val)` | `22nd JAN 2022` |

---

## 📦 Import (copy‑paste)

```js
import { formatDecimal, formatCurrency, formatPrice, formatUsdPrice, formatDate } from '@/utils/common';
```

---

## 📁 Adoption tracker

### ✅ Done (already using the global formatters)

- [x] `src/components/ui/popups/withdraw-earnings-steps/WithdrawEarningsStep2.vue` — `formatDecimal` (available balance)
- [x] `src/components/ui/popups/withdraw-earnings-steps/WithdrawEarningsStep4.vue` — `formatDecimal` (available balance, payout amount, latest balance)
- [x] `src/dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsTopMediaTable.vue` — `formatDecimal` (P2V sales USD)
- [x] `src/dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsTopMerchTable.vue` — `formatDecimal` (sales USD)
- [x] `src/dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsOrdersReceivedTable.vue` — `formatUsdPrice`, `formatDate`

### ⬜ Pending (still on inline `.toFixed(2)` / local helpers — migrate when touched)

- [ ] `src/components/ui/cart/Cart.vue` — `subtotal`, `feesTotal`, `couponDiscount`, `planDiscount`, `grandTotal` (5× `.toFixed(2)`) → `formatDecimal` / `formatCurrency`
- [ ] `src/components/ui/popups/withdraw-earnings-steps/WithdrawEarningsStep1.vue` — `num.toFixed(2)` (amount input) → review: use `formatDecimal` for display
- [ ] `src/dev/components/profile/tip-steps/TipStep2.vue` — local `formatCurrency()` → use global `formatCurrency`
- [ ] `src/dev/components/profile/tip-steps/TipStep3.vue` — local `formatCurrency()` → use global `formatCurrency`
- [ ] `src/dev/components/profile/topup-steps/TopUpStep1.vue` — local `formatCurrency()` → use global `formatCurrency`
- [ ] `src/dev/components/profile/topup-steps/TopUpStep2.vue` — local `formatCurrency()` → use global `formatCurrency`

### 🚫 Exempt (non‑monetary — do NOT migrate)

- `src/components/ui/charts/SparkLine.vue` — `.toFixed(1)` on SVG path coordinates (geometry, not money)

---

## New component quick check

Before you commit a component that shows numbers/prices/dates:

- [ ] No inline `.toFixed(2)` for money/decimals
- [ ] No locally‑defined `formatCurrency`
- [ ] Correct formatter chosen from the decision guide
- [ ] Imported from `@/utils/common`
- [ ] Verified truncation (not rounding) is acceptable for the value shown
