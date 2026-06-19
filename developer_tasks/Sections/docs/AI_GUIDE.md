# Section system — AI guide

**Audience:** Cursor agents, codegen, audit bots.  
**Last updated:** 2026-06-19  
**Primary naming reference:** `docs/tasks/Expanded Vue App Naming Convention.txt`

Read this before editing any section-related file.

---

## Hard rules

1. **Do not recreate `src/utils/section/`** — use `src/systems/sections/`.
2. **Do not put section preload orchestration in `createAppRouter.js` long term** — use `sectionNavigationHooks.js`; router should call one entry point.
3. **Do not import `section-manifest.json` paths from random folders** — use `getSectionBundlePaths` from `sectionManifestHelpers.js`.
4. **Section state** lives in `usePreloadStore` (`hasSection`, `markSectionInProgress`) — do not duplicate caches in components.
5. **Route-only renames/moves** belong in [RoutingExplained.md](../../Route/RoutingExplained.md) — not in section PRs unless deeply coupled.
6. **Section docs live in `Developer Tasks/Sections/docs/`** — update [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) and this file when behaviour changes; do not expand stale `src/systems/sections/README.md`.

---

## Target structure (`notes.md`)

```
systems/sections/
  index.js
  sectionResolver.js
  sectionPreloader.js
  sectionCssLoader.js
  sectionPreloadOrchestrator.js
  sectionManifestHelpers.js   ← runtime manifest helpers (Phase 2)
  sectionNavigationResources.js
  sectionNavigationHooks.js
```

---

## Canonical import map

| Need | Import from |
|------|-------------|
| Resolve section for role | `@/systems/sections/sectionResolver.js` → `resolveRoleSectionVariant` |
| Preload list for route | `getPreloadSectionsForRoute` |
| Preload one section | `@/systems/sections/sectionPreloader.js` → `preloadSection` |
| Preload plan + background | `@/systems/sections/sectionPreloadOrchestrator.js` → `getSectionPreloadPlan`, `startBackgroundSectionPreloads` |
| Current section from route config | `resolveCurrentSectionNameFromRouteConfig` |
| Clear all section preload state (tests) | `clearSectionPreloadState` |
| Load CSS on navigate | `@/systems/sections/sectionCssLoader.js` → `loadSectionCss` |
| Nav resource loads | `@/systems/sections/sectionNavigationResources.js` |
| Router section hooks | `@/systems/sections/sectionNavigationHooks.js` |
| Preload store | `@/stores/usePreloadStore.js` |
| Bundle paths | `@/systems/sections/sectionManifestHelpers.js` → `getSectionBundlePaths` |
| Route config inheritance | `@/systems/routing/routeResolver.js` → `resolveEffectiveRouteConfig` |

---

## File ownership

| Change type | Edit here |
|-------------|-----------|
| New section name on routes | `src/router/routeConfig.json` |
| Role → section string | `sectionResolver.js` |
| Preload behaviour | `sectionPreloader.js`, `sectionPreloadOrchestrator.js` |
| CSS inject/swap | `sectionCssLoader.js` |
| Nav-side resource load | `sectionNavigationResources.js` (routing re-export: `routeNavigationResourceLoader.js`) |
| Manifest paths | `sectionManifestHelpers.js` (`build/manifestLoader.js` re-exports for compat) |
| Router section hooks | `sectionNavigationHooks.js` via `createAppRouter.js` |
| Route config inheritance | `routeResolver.js` → `resolveEffectiveRouteConfig` |
| Section assets | `systems/assets/assetPreloader.js` → `preloadSectionAssets` |

---

## Stale references to fix

- `@/utils/section/*` → `@/systems/sections/*`
- `preloadSectionBundle` → `preloadSection` (removed API)
- `src/main.js` → `src/app/main.js` for bootstrap
- `utils/common/` in sectionResolver → prefer `infrastructure/` for shared helpers

---

## Doc maintenance (agents)

After section refactors, update **DEVELOPER_GUIDE.md** and **SECTION_PLAN.md** if you change:

- [ ] Module filenames or public exports
- [ ] Startup / `afterEach` / `beforeResolve` flow
- [ ] Manifest helper location
- [ ] `routeConfig.json` section / `preLoadSections` semantics

Grep for `utils/section` in `tests/` and `docs/` and fix or flag stragglers.

---

## Audit reports

| Report | Use when |
|--------|----------|
| [SECTION_PLAN.md](./SECTION_PLAN.md) | Order of moves, renames, PR phases |
| [section-code-index.md](../section-code-index.md) | Find every file/method |
| [sections-naming-audit.md](../sections-naming-audit.md) | Rename suggestions |
| [sections-code-audit.md](../sections-code-audit.md) | Structure / responsibility |
| [loose-section-code-scan.md](../loose-section-code-scan.md) | Wrong-layer code |

---

## Do not

- Reintroduce `src/utils/section/`
- Add section preload caches outside `usePreloadStore`
- Rename route modules in a section-only PR
- Change runtime preload behaviour during structure-only tasks

---

*End of AI guide.*
