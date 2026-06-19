# Section system — developer guide

**Audience:** Humans adding sections, debugging preload, or onboarding.  
**Last updated:** 2026-06-10  
**Code:** `src/systems/sections/`

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
  index.js                     # Barrel (partial — see audits)
  sectionResolver.js           # Route section → string; preload list
  sectionPreloader.js          # JS/CSS bundle preload
  sectionCssLoader.js          # Runtime CSS inject/swap
  sectionPreloadOrchestrator.js # Startup + afterEach preload plan

src/stores/usePreloadStore.js  # Which sections are preloaded / in flight

src/systems/build/manifestLoader.js   # getSectionBundlePaths (→ sectionManifestHelpers planned)
src/systems/routing/routeNavigationData.js  # Current-section CSS/i18n/assets on navigate

src/app/main.js                # Startup auth preload + background sections
src/router/index.js            # afterEach preload, loadRouteComponent section check
```

**Missing per `notes.md`:** `sectionManifestHelpers.js` (manifest logic still in `build/manifestLoader.js`).

---

## Key modules

| Module | Responsibility |
|--------|----------------|
| `sectionResolver.js` | `resolveRoleSectionVariant`, `getPreloadSectionsForRoute`, `resolveSectionIdentifier` |
| `sectionPreloader.js` | `preloadSection`, `preloadMultipleSections`, `resetSectionPreloadState` |
| `sectionCssLoader.js` | `loadSectionCss`, `preloadSectionCss`, `unloadSectionCss` |
| `sectionPreloadOrchestrator.js` | `getSectionPreloadPlan`, `startBackgroundSectionPreloads`, locale refresh |

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

1. Resolve current route's section (if any).
2. `getSectionPreloadPlan` → list of sections to warm.
3. Optionally `preloadDefaultAuthSection('auth')`.
4. `startBackgroundSectionPreloads` (non-blocking).

### After navigation (`router/index.js` → `afterEach`)

1. `getSectionPreloadPlan(routeConfig, userRole)`.
2. `startBackgroundSectionPreloads` for resolved section names.
3. Optional translation preload per section.

### Current page (`beforeResolve` → `routeNavigationData.js`)

1. Unload previous section CSS if section changed.
2. `loadSectionCss` for resolved section.
3. `loadTranslationsForSection` if needed.
4. `preloadSectionAssets` (assets system).

### Component load (`loadRouteComponent`)

If section not in `usePreloadStore`, call `preloadSection(sectionName)` before lazy import.

---

## Adding or changing a section (checklist)

1. Add routes using the section in `routeConfig.json` (`section` + optional `preLoadSections`).
2. Ensure build produces `section-manifest.json` entry (Vite section bundler).
3. Add `public/i18n/section-{name}/` if translations are section-scoped.
4. Dev smoke: cold load, navigate away and back, check Network for duplicate bundle fetches.
5. Run section unit tests (after fixing `utils/section` import paths).

---

## Common pitfalls

| Symptom | Likely cause |
|---------|----------------|
| Section never preloaded | `preLoadSections` empty; manifest missing entry |
| CSS flash on navigate | `loadSectionCss` not run; previous CSS not unloaded |
| Wrong dashboard variant | Role not passed to `resolveRoleSectionVariant` |
| Tests fail on import | Still importing `src/utils/section/` (removed) |

---

## Tests

```bash
npm run test:unit -- --run tests/unit/sectionResolver.test.js
npm run test:unit -- --run tests/unit/sectionPreloader.test.js
npm run test:unit -- --run tests/unit/sectionPreloadOrchestrator.test.js
```

Update test paths to `src/systems/sections/` before relying on results.

---

## Related docs

| Doc | Use when |
|-----|----------|
| [SECTION_PLAN.md](./SECTION_PLAN.md) | Priorities, phases, audit links |
| [AI_GUIDE.md](./AI_GUIDE.md) | Agent constraints (if pairing with AI) |
| [RoutingExplained.md](../../Route/RoutingExplained.md) | Routes declare sections |
| [../README.md](../README.md) | Audits and naming batches |
