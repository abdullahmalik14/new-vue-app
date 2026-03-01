# Tailwind Explained

# Tailwind Sectioned Build System
The sectioned Tailwind system works by deciding which CSS should be compiled based on a clear set of priorities. Each section of the app — such as Dashboard, Profile, or Marketplace — generates its own stylesheet that includes only the utilities actually used within that section’s components. If a component is explicitly marked as excluded, it doesn’t get bundled into the section; instead, it receives its own co-located CSS file that loads only when that component is imported. This predictable rule set ensures that no section ever ships unused CSS, while large or shared components can remain isolated.

Each part of the system has a clear responsibility. The **section builder** creates one minimal CSS bundle per section, compiling only the Tailwind utilities found in that section’s files. The **component builder** handles any components marked for exclusion, generating a dedicated CSS file placed directly next to the component. The **extractor** scans templates for class names and detects custom utilities such as `pb-678`. Behind the scenes, the system compiles CSS only when those utilities are found, so unused numeric patterns never inflate bundles.

Sections are organized just like translation folders: one per part of the app. Each section defines its own file list and builds independently. When you navigate to a new section, the app automatically loads that section’s CSS file, and if preloading is enabled, other sections can be compiled or fetched quietly in the background so that later navigation feels instant. Components excluded from their section load their CSS on demand, meaning the browser only ever downloads what’s needed for the current view.

The result is predictable: developers can explain that _“a section builds its own CSS; excluded components bring their own; and numeric utilities compile only when used.”_ Everything else happens automatically — scanning, extraction, per-section compilation, and background preloading — without manual intervention.
## Terminology
**Section CSS** – Stylesheet generated for a single app section.
**Excluded component** – A component intentionally left out of section CSS.
**Co-located CSS** – CSS file placed beside the component it styles.
**Standalone build** – A one-off CSS generation for a component not referenced in any section.
**Numeric utility** – Custom Tailwind pattern like `pb-678`, emitted only when detected.
**Section map** – Registry defining which files belong to each section.
**Extractor** – Scanner that collects real class names and numeric utilities from templates.
**Section builder** – Generates each section’s CSS from the extracted classes.
**Component builder** – Generates co-located CSS for excluded or standalone components.
**Runtime loader** – Injects the correct CSS at runtime for active sections and imported components.
## The Tailwind Build System (3 Parts)
1. **Extractor — gather actual classes**
2. Parses templates within each section, records Tailwind utilities and numeric patterns (like `pb-678`), and passes the collected list to the builder.
3. _Implementation reference:_ extractor.
4. **Section Builder — compile per-section CSS**
5. Uses Tailwind to compile only the utilities found in that section’s files, producing a minimal CSS file per section.
6. _Implementation reference:_ section builder.
7. **Component Builder — handle exclusions and standalone builds**
8. Detects components marked for exclusion or explicit standalone compilation, generates a CSS file beside each, and ensures it’s loaded only when imported.
9. _Implementation reference:_ component builder.
## Section Structure

```css
src/
  components/
    dashboard/
      DashboardHome.vue
      HeavyChart.vue        ← excluded component
      HeavyChart.css        ← co-located CSS (auto-generated)
    profile/
      ProfileHome.vue
  build/
    tailwind/
      section-css.config.json
```

Each folder corresponds to one section; only its own components contribute to its CSS. Excluded components generate their own `.css` files beside the `.vue` source.
## Build Priority Explained
When the build runs, Tailwind decides what to compile using a strict, predictable order:
1. **Section inclusion (strongest)**
2. Every section scans its assigned files and compiles a CSS bundle using only those utilities.
3. **Exclusion marker**
4. Components marked as excluded are skipped during section builds and produce their own CSS beside the file.
5. **Standalone requests**
6. A developer can manually request CSS generation for any component, even if unused in sections.
7. **Custom numeric utilities**
8. Tailwind emits rules like `pb-678` only when that exact token is found in templates.
This guarantees a consistent result across builds — each section is self-contained, excluded components are isolated, and unused utilities simply never exist in the output.
## Builder Responsibilities
**Extractor Responsibilities**
*   Scans all templates belonging to a section.
*   Detects Tailwind classes and numeric utility patterns.
*   Feeds collected tokens to the section builder.
**Section Builder Responsibilities**
*   Compiles one CSS file per section using extracted tokens.
*   Ensures only used utilities are emitted.
*   Skips components marked as excluded.
**Component Builder Responsibilities**
*   Generates co-located CSS for excluded components.
*   Handles on-demand standalone compilation.
*   Guarantees that CSS loads only when the component is imported.
**Runtime Loader Responsibilities**
*   Injects the correct CSS for the active section at runtime.
*   Loads co-located CSS files dynamically as components mount.
*   Unloads or replaces section CSS when navigating between sections.
## Checklist – Builder Responsibilities
*   Detects and records Tailwind classes per section.
*   Builds exactly one CSS file for each section.
*   Skips excluded components during section builds.
*   Generates co-located CSS beside excluded components.
*   Supports standalone builds for unreferenced components.
*   Emits numeric utilities only when found in templates.
*   Loads CSS dynamically based on active route.
## CSS Generation Sequence
Whenever the app builds or the active section changes:
1. The extractor scans all files in that section.
2. Tailwind compiles a CSS file using the detected utilities.
3. Excluded components receive their own co-located CSS.
4. At runtime, navigation between sections swaps in the correct stylesheet; excluded components load their CSS on import.
This keeps the system fast, lean, and fully predictable.
## Developer Testing Guide
**Per-Section Tests**
*   Visit each section; confirm that only its CSS file is loaded.
*   Inspect network requests — other sections’ CSS files should not load.
*   Navigate between sections; verify style swap is instant.
**Excluded Component Tests**
*   Mark a heavy component as excluded.
*   Rebuild; confirm the section CSS size decreases.
*   Load a page that imports the excluded component; its co-located CSS loads separately.
**Standalone Build Tests**
*   Generate CSS for a component that isn’t in any section.
*   Import it into a test page; styles apply correctly.
**Custom Utility Tests**
*   Add `pb-678` to one component.
*   Build; confirm `padding-bottom: 678px` appears only once in the correct CSS file.
*   Remove the class; rebuild; the rule disappears.
**Runtime Verification**
*   In development, confirm HMR updates styles immediately.
*   In production, confirm lazy loading and caching work as expected.
## Summary
Overall, the Tailwind sectioned build system provides a predictable, stable, and efficient styling workflow. Developers get clear inclusion rules, automatic per-section compilation, and safe isolation for heavy components. Users get faster loads, smaller CSS bundles, and instant visual updates. The architecture stays lean through lazy loading, background preloading, and smart detection of only the utilities that are actually used.