# Vue Project Structure Overview

**Project:** VueApp — Section-Based Architecture  
**Root:** `vuemain/`  
**Last updated:** March 2026

---

## 1. Purpose

This application is a Vue 3 SPA organized by **sections** (auth, dashboard-global, profile, etc.). Each section can ship its own components, translations, CSS bundle, and asset preload rules. Routing, auth, i18n, and asset loading are centralized so pages stay consistent and performant.

---

## 2. Top-Level Layout

```
vuemain/
├── docs/                    # Project documentation (this folder)
├── public/                  # Static assets served as-is (images, i18n copies, config)
├── build/                   # Build scripts (Tailwind sections, env validation, asset sync)
├── src/                     # Application source
├── index.html               # HTML shell (Vite entry)
├── vite.config.js           # Vite + section bundler
├── vercel.json              # Deploy rewrites (SPA + API proxy)
└── package.json             # Dependencies and npm scripts
```

---

## 3. Source (`src/`) — Main Areas

| Path | Role |
|------|------|
| `src/app/` | App entry: `main.js`, root `App.vue` |
| `src/router/` | `routeConfig.json` — single source of truth for routes |
| `src/systems/` | Cross-cutting systems (i18n, assets, routing, sections, analytics) |
| `src/components/` | Shared production UI components |
| `src/templates/` | Page-level templates per section (auth, dashboard, profile) |
| `src/stores/` | Pinia stores |
| `src/composables/` | Shared composables (`useAssetUrl`, etc.) |
| `src/config/` | Static config (`assetMap.json`) |
| `src/i18n/` | Source locale JSON (synced to `public/i18n/` for runtime) |
| `src/dev/` | Development demos, playgrounds, audit wrappers (not all production routes) |
| `src/assets/` | Global CSS (`main.css`, route transitions) |
| `src/interactions/` | Interaction / flow plugin system |

---

## 4. Section-Based Architecture

### What is a “section”?

A section is a logical bundle of:

- Vue components and templates
- Translations (`src/i18n/section-{name}/`)
- Section CSS (built via Tailwind section pipeline)
- Optional asset preload entries

### Route → section mapping

Each route in `src/router/routeConfig.json` declares a `section` (or role-based section map). Example:

```json
{
  "slug": "/dashboard/demo-page",
  "section": "dashboard-global",
  "componentPath": "@/dev/templates/demo/DemoPage.vue"
}
```

### Preloading vs direct access

| Access pattern | Behavior |
|----------------|----------|
| User navigates inside app | Prior sections may be preloaded → assets often cached before page paint |
| User lands directly on URL (homepage, shop, profile) | No prior preload → below-fold images should use **lazysizes** (see [LAZYSIZES.md](../integrations/LAZYSIZES.md)) |

---

## 5. Routing

| File | Purpose |
|------|---------|
| `src/router/routeConfig.json` | All routes, sections, auth, roles, preload, `envAccess` |
| `src/router/index.js` | Generates Vue Router routes from config |
| `src/systems/routing/routeGuards.js` | Auth, roles, env access guards |

**`envAccess`:** Routes with `"envAccess": "development"` are omitted from production builds. Production demo routes (e.g. `/demo/lazy-sizes`) must **not** use this flag.

---

## 6. Assets & i18n

| Concern | Location |
|---------|----------|
| Asset URL registry | `src/config/assetMap.json` + `public/config/assetMap.json` |
| Resolve URL in components | `useAssetUrl('flag.key')` → `getAssetUrl()` |
| Translations (source) | `src/i18n/section-{section}/en.json`, `vi.json` |
| Translations (runtime) | `public/i18n/section-{section}/` |
| Static images | `public/images/` |

**Rule:** No hardcoded external image URLs in components — use `assetMap` + `useAssetUrl`.

---

## 7. Build & Deploy

```bash
npm run dev          # Local development (Vite)
npm run build        # Production build (section CSS + JS chunks)
npm run preview      # Preview production build locally
```

Deploy target: **Vercel** (`vercel.json` rewrites all paths to SPA `index.html`).

Production URL example: `https://newvueapp.vercel.app`

---

## 8. Documentation Map

| Document | Audience | Topic |
|----------|----------|-------|
| [../README.md](../README.md) | All | Docs index |
| **PROJECT_STRUCTURE.md** (this file) | Client + devs | Architecture overview |
| [../integrations/LAZYSIZES.md](../integrations/LAZYSIZES.md) | Client + devs | Lazysizes integration |
| [../integrations/LAZYSIZES_INTEGRATION_AUDIT.md](../integrations/LAZYSIZES_INTEGRATION_AUDIT.md) | Client | Final audit sign-off |
| [../delivery/LINDEN_LAZYSIZES_RESPONSE.md](../delivery/LINDEN_LAZYSIZES_RESPONSE.md) | Client | Summary reply + links |
| `docs/instruction/` | Internal | Deep dives (routing, preloading, auth) |
| `docs/tasks/` | Internal | Audit reports and task notes |

### Per-section docs (planned)

As rollout continues, add under `docs/sections/`:

- `auth.md`
- `dashboard-global.md`
- `profile.md`
- `shop.md` (when applicable)

---

## 9. Key Conventions

- **Components:** PascalCase `.vue` files  
- **Folders:** kebab-case  
- **Events:** kebab-case, domain-prefixed (`card-remove`, not `remove`)  
- **Constants:** `UPPER_SNAKE_CASE`  
- **i18n:** All user-facing strings via `$t()` / `useI18n()`  
- **Images:** `assetMap` + `useAssetUrl`; lazy below-fold via `LazyImage` / `LazyBackground`

---

## 10. Related Reading

- Section preloading: `docs/SECTION_LOADING_AND_PRELOADING_GUIDE.md`
- Naming guidelines: `docs/tasks/vue-app-architecture-naming-guidelines.md`
- Environment setup: `docs/ENV_SETUP_GUIDE.md`
