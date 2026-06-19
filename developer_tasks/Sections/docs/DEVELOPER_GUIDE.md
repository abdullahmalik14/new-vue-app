# Section system — developer guide

**Audience:** Humans adding sections, debugging preload, or onboarding.  
**Last updated:** 2026-06-19  
**Code:** `src/systems/sections/`  
**Change log:** [sections-cleanup-changelog.md](../sections-cleanup-changelog.md)

---

## What sections are

A **section** is a named JS/CSS/i18n bundle group (e.g. `auth`, `dashboard-creator`, `shop`). Each route in `routeConfig.json` has a `section` field. The section system:

1. Resolves which section name applies for the current user role.
2. Preloads section JS/CSS in the background for faster navigation.
3. Loads the current section's CSS and coordinates translations and assets on navigate.

Sections are **not** Vue components. They are build-time bundles + runtime loaders under `src/systems/sections/`.

---

## Folder layout (current)

```text
src/systems/sections/
  index.js                      # Public barrel — prefer importing from here
  sectionResolver.js            # Route section → string; preload list
  sectionPreloader.js           # JS/CSS bundle preload
  sectionCssLoader.js           # Runtime CSS inject/swap
  sectionPreloadOrchestrator.js # Startup + afterEach preload plan
  sectionManifestHelpers.js     # Runtime manifest fetch + getSectionBundlePaths
  sectionNavigationResources.js # Current-section CSS/i18n/assets on navigate
  sectionNavigationHooks.js     # Router hook helpers (meta.section, component load, afterEach)

src/stores/usePreloadStore.js   # Which sections are preloaded / in flight

src/systems/build/manifestLoader.js          # Thin re-export → sectionManifestHelpers
src/systems/routing/routeNavigationResourceLoader.js  # Re-export → sectionNavigationResources
src/systems/routing/routeResolver.js           # resolveEffectiveRouteConfig (route inheritance)
src/systems/routing/createAppRouter.js         # Registers hooks; delegates to sections
src/app/main.js                                # Startup auth preload + background sections
src/router/index.js                            # Re-exports router factory only
```

---

## Key modules

| Module | Responsibility |
|--------|----------------|
| `sectionResolver.js` | `resolveRoleSectionVariant`, `getPreloadSectionsForRoute`, `resolveSectionIdentifier` |
| `sectionPreloader.js` | `preloadSection`, `preloadMultipleSections`, `resetSectionPreloadState`, `clearSectionPreloadState` |
| `sectionCssLoader.js` | `loadSectionCss`, `preloadSectionCss`, `unloadSectionCss` |
| `sectionPreloadOrchestrator.js` | `getSectionPreloadPlan`, `startBackgroundSectionPreloads`, `refreshSectionPreloadsOnLocaleChange` |
| `sectionManifestHelpers.js` | `loadSectionManifest`, `getSectionBundlePaths`, `clearManifestCache` |
| `sectionNavigationResources.js` | `loadCurrentSectionResources`, `resolveCurrentSectionForNavigation` |
| `sectionNavigationHooks.js` | `assignResolvedSectionToRouteMeta`, `loadRouteComponentWithSectionPreload`, `startPostNavigationSectionPreloads` |

Prefer the barrel: `import { getSectionPreloadPlan, preloadSection } from '@/systems/sections/index.js'`.

---

## Section types in `routeConfig.json`

```json
"section": "auth"
```

```json
"section": {
  "creator": "dashboard-creator",
  "fan": "dashboard-fan",
  "default": "dashboard-global"
}
```

```json
"preLoadSections": ["shop", "profile"]
```

Role-keyed `preLoadSections` objects are also supported (see `sectionResolver.js`).

---

## Typical flows

### App startup (`main.js`)

1. Resolve current route's section via `resolveCurrentSectionNameFromRouteConfig`.
2. `getSectionPreloadPlan` → list of sections to warm.
3. Optionally `preloadDefaultAuthSection`.
4. `startBackgroundSectionPreloads` (non-blocking).

### After navigation (`createAppRouter.js` → `afterEach`)

1. `startPostNavigationSectionPreloads` → `getSectionPreloadPlan` + `startBackgroundSectionPreloads`.
2. Optional translation preload per section.

### Current page (`beforeResolve`)

1. `startCurrentSectionResourceLoads` → `loadCurrentSectionResources` in `sectionNavigationResources.js`.
2. Unload previous section CSS if section changed.
3. Load CSS, translations, and assets (all fire-and-forget).

### Component load

`loadRouteComponentWithSectionPreload` — if section not in `usePreloadStore`, background `preloadSection` after lazy import.

### Route inheritance

`resolveEffectiveRouteConfig` lives in `routeResolver.js` (routing). Sections orchestrator consumes inherited config via that helper.

---

## Adding or changing a section (checklist)

1. Add routes using the section in `routeConfig.json` (`section` + optional `preLoadSections`).
2. Ensure build produces `section-manifest.json` entry (Vite section bundler).
3. Add `public/i18n/section-{name}/` if translations are section-scoped.
4. Dev smoke: cold load, navigate away and back, check Network for duplicate bundle fetches.
5. Run section unit tests (see below).

---

## Common pitfalls

| Symptom | Likely cause |
|---------|----------------|
| Section never preloaded | `preLoadSections` empty; manifest missing entry |
| CSS flash on navigate | `loadSectionCss` not run; previous CSS not unloaded |
| Wrong dashboard variant | Role not passed to `resolveRoleSectionVariant` |
| Tests fail on import | Stale `@/utils/section/` path (removed — use `@/systems/sections/`) |
| Preload blocks navigation | Await added in router guard — preload must stay non-blocking |

---

## Tests

```bash
npm run test:unit -- --run tests/unit/sectionResolver.test.js
npm run test:unit -- --run tests/unit/sectionPreloader.test.js
npm run test:unit -- --run tests/unit/sectionPreloadOrchestrator.test.js
npm run test:unit -- --run tests/unit/sectionBarrel.test.js
npm run test:unit -- --run tests/routeTest/sectionPreloadOrchestrator.route.test.js
```

Import from `@/systems/sections/...` or the barrel — never `src/utils/section/`.

---

## Related docs

| Doc | Use when |
|-----|----------|
| [SECTION_PLAN.md](./SECTION_PLAN.md) | Priorities, phases, audit links |
| [AI_GUIDE.md](./AI_GUIDE.md) | Agent constraints (if pairing with AI) |
| [sections-cleanup-changelog.md](../sections-cleanup-changelog.md) | What changed in Phases 0–4 |
| [RoutingExplained.md](../../Route/RoutingExplained.md) | Routes declare sections |
| [../README.md](../README.md) | Audits and naming batches |

**Legacy (stale paths):** [docs/SECTION_LOADING_AND_PRELOADING_GUIDE.md](../../../docs/SECTION_LOADING_AND_PRELOADING_GUIDE.md) — flagged; use this guide instead.
