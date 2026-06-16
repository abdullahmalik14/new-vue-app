# Router folder audit — `src/router/`

**Scope:** `new-vue-app-main/src/router/`  
**Reference:** `notes.md`  
**Audit type:** File location and structure only  

**What belongs here (per notes.md):** `index.js`, `routeConfig.json`, `routeDefaults.json`, `routeConfig.schema.md` only.

---

## Issue 1

**Location:** `router/sharedAssetPreloads.json`

**Why it is an issue:** This file defines asset preload flags, not routes. `notes.md` says `router/` is for Vue Router entry and route config only. Asset config belongs elsewhere.

**Suggested fix:** Move to `config/sharedAssetPreloads.json`. Update imports in `routeConfigLoader.js`, `resolveSharedComponentAssets.js`, and `jsonConfigValidator.js`.

---

## Issue 2

**Location:** `router/index.js` (749 lines)

**Why it is an issue:** This file contains route generation, component loading, locale handling, navigation guards, and preload logic. `notes.md` says `router/` should only hold the router entry and config. That logic belongs in `systems/routing/`.

**Suggested fix:** Move logic into `systems/routing/` (e.g. `createAppRouter.js`, `routeGenerator.js`, `registerNavigationHooks.js`). Keep `index.js` as a thin re-export only.

---

## Issue 3

**Location:** `router/README.md` (line ~98)

**Why it is an issue:** README says `import.meta.glob` lives in `index.js`. It actually lives in `systems/routing/routeComponentLoader.js`. Wrong documentation causes misplaced files during refactors.

**Suggested fix:** Update README to reference `systems/routing/routeComponentLoader.js`.

---

## Issue 4

**Location:** `routeConfig.json` — slug `/dashboard/analytics`  
`componentPath`: `@/templates/analytics/AnalyticsPage.vue`

**Why it is an issue:** The URL is under `/dashboard/` but the page file sits in a separate top-level `templates/analytics/` folder, not `templates/dashboard/`.

**Suggested fix:** Move page to `templates/dashboard/shared/AnalyticsPage.vue` (or role folder) and update `componentPath`.

---

## Issue 5

**Location:** `routeConfig.json` — slug `/edit-profile`  
`componentPath`: `@/templates/edit-profile/EditProfilePage.vue`

**Why it is an issue:** Edit profile also exists as stub pages under `templates/dashboard/*/EditProfilePage.vue`. One feature has three folder locations.

**Suggested fix:** Pick one canonical page location (`profile/` or `dashboard/shared/`). Remove `templates/edit-profile/` and update `componentPath`.

---

## Issue 6

**Location:** `routeConfig.json` — demo routes  
`@/templates/dashboard/demo/SocialLinkingDemoPage.vue`  
`@/templates/dashboard/demo/DemoChatsPage.vue`

**Why it is an issue:** Demo pages are registered under `dashboard/demo/` instead of `templates/dev/`. `notes.md` says demo work belongs in `dev/`.

**Suggested fix:** Move files to `templates/dev/` and update both `componentPath` values in `routeConfig.json`.

---

## Issue 7

**Location:** `routeConfig.json` — slug `/dev/datepicker-showcase`  
`componentPath`: `@/components/forms/date-picker/DatePickerShowcase.vue`

**Why it is an issue:** Routable pages should live in `templates/`, not `components/`. A showcase/demo page should be in `templates/dev/`.

**Suggested fix:** Move `DatePickerShowcase.vue` to `templates/dev/` and update `componentPath`.

---

## Issue 8

**Location:** `routeConfig.json` — slug `/plan`  
`componentPath`: `@/components/plan/Plan.vue`

**Why it is an issue:** This is a full page route pointing at a `components/` file. Page routes belong in `templates/`.

**Suggested fix:** Create `templates/misc/PlanPage.vue` (or `templates/shop/PlanPage.vue`) that composes the plan component, and update `componentPath`.

---

## Issue 9

**Location:** `routeConfig.json` — slug `/demo-dropdowns`  
`componentPath`: `@/components/ui/dropdowns/demo/DemoDropdowns.vue`

**Why it is an issue:** Demo page is registered from `components/ui/`. Demo routes belong in `templates/dev/`.

**Suggested fix:** Move to `templates/dev/DemoDropdownsPage.vue` and update `componentPath`.

---

## Issue 10

**Location:** `routeConfig.json` — payout dev route  
`componentPath`: `@/dev/templates/payout/PayoutPage.vue`

**Why it is an issue:** Every other dev route uses `templates/dev/`. This one uses `src/dev/`. Inconsistent dev file location.

**Suggested fix:** Move `PayoutPage.vue` to `templates/dev/` and update `componentPath`, or document `src/dev/` as the only WIP staging area.

---

## Issue 11

**Location:** `routeConfig.json` — missing route for `templates/home/`

**Why it is an issue:** `templates/home/` has 6 files (page, header, footer, sidebar, etc.) but no entry in `routeConfig.json`. Orphan folder with no route.

**Suggested fix:** Add a route for home in `routeConfig.json`, or delete `templates/home/` if unused.

---

## Issue 12

**Location:** `routeConfig.json` — dev playground route  
`componentPath`: `@/templates/dashboard/role/DashboardDevPlaygroundPage.vue`

**Why it is an issue:** Dev playground is a demo page living under production `dashboard/role/`.

**Suggested fix:** Move to `templates/dev/DashboardDevPlaygroundPage.vue` and update `componentPath`.

---

## Issue 13

**Location:** `components/layout/AppFooter.vue` imports `router/routeConfig.json` directly

**Why it is an issue:** Other code loads routes through `systems/routing/routeConfigLoader.js` which validates and caches config. Direct import bypasses that layer.

**Suggested fix:** Import via `getRouteConfiguration()` from `systems/routing/` instead of reading the JSON file directly.

---

## Issue 14

**Location:** `router/README.md` and `router/routeConfig.schema.md`

**Why it is an issue:** Two files document the same `routeConfig.json` structure. Duplicate docs drift apart (see Issue 3).

**Suggested fix:** Keep one source of truth in `routeConfig.schema.md`. Trim `README.md` to a short pointer and workflow steps only.

---

## Issue 15

**Location:** `systems/routing/routeComponentLoader.js` glob pattern

**Why it is an issue:** Glob includes `@/dev/**/*.vue` but almost all dev pages are under `templates/dev/`. Only one file uses `src/dev/`. The glob does not match where files actually live.

**Suggested fix:** Align glob with real paths. Either add `templates/dev` explicitly or remove unused `@/dev/**` after standardising dev file location (Issue 10).

---

## Issue 16

**Location:** `systems/routing/routeAssetPrefetch.js` (related — not inside `router/` but affects routing)

**Why it is an issue:** `notes.md` places route asset prefetch in `systems/assets/routeAssetPrefetch.js`, not `systems/routing/`.

**Suggested fix:** Move file to `systems/assets/routeAssetPrefetch.js` when refactoring `systems/`.

---

## Issue 17

**Location:** `systems/routing/useRoutePrefetch.js` (related — not inside `router/`)

**Why it is an issue:** `notes.md` places Vue composables in `composables/useRoutePrefetch.js`, not inside `systems/routing/`.

**Suggested fix:** Move file to `composables/useRoutePrefetch.js` when refactoring composables.
