# Folder structure audit — `src/systems/sections/`

**Date:** 2026-06-10  
**Scope:** `new-vue-app-main/src/systems/sections/` only  
**Reference:** `notes.md`  
**Audit type:** File locations and folder structure only

---

## Issue 1

**Location:** Missing `systems/sections/sectionManifestHelpers.js`

**Why it is an issue:** `notes.md` lists this file as part of `systems/sections/`. It does not exist in the folder. Manifest path resolution currently lives in `systems/build/manifestLoader.js` instead.

**Suggested fix:** Create `sectionManifestHelpers.js` and move manifest-read helpers out of `systems/build/manifestLoader.js`, or remove `sectionManifestHelpers.js` from `notes.md` if build owns manifest loading.

---

## Issue 2

**Location:** `systems/sections/sectionPreloader.js` — imports from `../sections/sectionCssLoader.js`

**Why it is an issue:** `sectionPreloader.js` and `sectionCssLoader.js` are in the same folder. The import path is a leftover from the old `utils/section/` layout.

**Suggested fix:** Change the import to `./sectionCssLoader.js`.

---

## Issue 3

**Location:** `systems/sections/index.js`

**Why it is an issue:** `notes.md` recommends a barrel export for this folder. `index.js` only exports `sectionResolver.js` and `sectionPreloader.js`. It does not export `sectionCssLoader.js` or `sectionPreloadOrchestrator.js`.

**Suggested fix:** Add exports for `sectionCssLoader.js` and `sectionPreloadOrchestrator.js`, or document why they are excluded from the barrel.

---

## Issue 4

**Location:** `systems/sections/README.md`

**Why it is an issue:** `notes.md` does not list documentation files under `systems/sections/`. The README also still references old `utils/section/` and `utils/common/` paths.

**Suggested fix:** Move to `docs/` and update paths, or update the README to match the current `systems/sections/` layout.

---

## Issue 5

**Location:** `systems/sections/sectionPreloadOrchestrator.js` — exports `resolveEffectiveRouteConfig()`

**Why it is an issue:** Route config inheritance belongs in `systems/routing/` per `notes.md`, not inside a sections file. The orchestrator file is in the right folder, but it contains routing logic.

**Suggested fix:** Move `resolveEffectiveRouteConfig()` to `systems/routing/` and import it from the orchestrator.

---
