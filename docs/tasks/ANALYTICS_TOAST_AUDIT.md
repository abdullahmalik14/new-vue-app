# Analytics Toast — Pop-up Script Audit

**Question (Linden):** "The toast for analytics — are you using the pop-up script? It has a toast in it I think."

**Answer:** No. The analytics toast is a standalone, hand-rolled inline toast. It does **not** use the pop-up script, and it does **not** use the shared toast component either.

---

## What exists today

### 1. The analytics toast (current implementation)
`src/templates/dashboard/global/DashboardAnalyticsPage.vue` (lines ~45–54)

It is an inline `<div v-if="isAnalyticsRefreshing">` rendered directly in the page template:

- Fixed position `bottom-6 right-6`, `z-[9999]`
- Hardcoded dark background, inline `<svg>` spinner
- Hardcoded copy: "Fetching Analytics Data..."
- Driven purely by a local `isAnalyticsRefreshing` ref (toggled in the refresh flow, lines ~114–139)

It is a **loading indicator**, not a notification. No shared script/component is involved.

### 2. The "pop-up script"
- `src/components/ui/popups/BasePopup.vue` + `src/composables/usePopupStack.js`
- This is the modal / side-panel popup system (notifications panel, purchase, checkout, cart, etc.).
- **It contains no toast logic.** `usePopupStack.js` has zero toast/notify code.

### 3. The actual reusable toast component
- `src/components/ui/card/dashboard/NotificationCard.vue`
- A proper toast: variants (`notice | alert | success | error | info | warning | limit-exceeded | success-teal`), title/description, optional link, closable, built-in enter/leave transition.
- Already used in: `DemoPage`, `EditProfilePage`, `WithdrawEarningsStep5`, the media uploader steps, booking forms, and `PlanDetail`.
- The analytics page does **not** use it.

---

## Conclusion

| Thing | Used by analytics toast? |
|---|---|
| Pop-up script (`BasePopup` / `usePopupStack`) | No — and it has no toast anyway |
| Shared toast component (`NotificationCard`) | No |
| Bespoke inline markup | Yes |

So the analytics toast is duplicated, one-off markup rather than the shared toast.

## Recommendation (not applied — needs sign-off, would change the visual)

The analytics indicator is a *loading* toast (spinner + text). `NotificationCard` is a *notification* toast (icon + title + body + actions) and has no spinner/loading variant, so swapping 1:1 would change the look.

Two clean options, both deferred until approved (to honour the "no UI change without sign-off" rule):

1. **Lowest-risk:** leave the visual exactly as-is, but extract the markup into a tiny shared `LoadingToast.vue` so any page can reuse it. No pixel change.
2. **Consistency:** add a `loading` variant (spinner) to `NotificationCard` and have analytics use it. Slightly different look, fully centralised.

No code changed by this audit.
