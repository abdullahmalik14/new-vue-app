# 🚀 COMPLETE DEVELOPER GUIDE - From Zero to Hero

**Last Updated**: November 4, 2025  
**For**: New developers with zero understanding  
**Purpose**: Understand the entire app, test everything, deploy successfully

---

## 📖 TABLE OF CONTENTS

1. [Architecture Overview](#architecture-overview)
2. [How Everything Works (The Flow)](#how-everything-works-the-flow)
3. [Section-Based Architecture Deep Dive](#section-based-architecture-deep-dive)
4. [Route Configuration Deep Dive](#route-configuration-deep-dive)
5. [Authentication & Roles Deep Dive](#authentication--roles-deep-dive)
6. [Testing Guide - Complete Checklists](#testing-guide---complete-checklists)
7. [Environment Variables](#environment-variables)
8. [Dependencies Explained](#dependencies-explained)
9. [Deployment Guide](#deployment-guide)

---

## 🏗️ ARCHITECTURE OVERVIEW

### What is This App?

This is a **section-based Vue.js application** where the entire app is split into independent "sections" (mini-SPAs). Each section has:
- Its own JavaScript bundle
- Its own CSS bundle
- Its own translations
- Its own components
- Its own preloadable assets

### Why Section-Based?

**Traditional SPA**: One giant JS/CSS bundle = slow initial load  
**Section-Based**: Multiple small bundles = fast load, intelligent preloading

### The Big Picture

```
User visits app
    ↓
App loads (main.js)
    ↓
Session restored (if logged in)
    ↓
Default sections preloaded (auth, 404, fallback)
    ↓
User navigates to /dashboard
    ↓
Route guards check (auth, role, dependencies)
    ↓
Dashboard section preloaded (if not already)
    ↓
Dashboard translations loaded
    ↓
Component rendered
    ↓
User sees dashboard (FAST!)
```

---

## 🔄 HOW EVERYTHING WORKS (THE FLOW)

### 1. App Initialization (main.js)

**What happens when you open the app?**

```javascript
// Step 1: Performance tracker starts
const perfTracker = new PerfTracker('VueApp-SectionBased', {...});

// Step 2: Pinia store initialized with persistence
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate); // Saves to localStorage

// Step 3: Vue I18n initialized
const i18n = createI18n({ locale: 'en', fallbackLocale: 'en' });

// Step 4: Vue Router initialized
app.use(router);

// Step 5: Session restored (CRITICAL!)
const authStore = useAuthStore();
authStore.refreshFromStorage(); // Reads from localStorage

// Step 6: Default sections preloaded
Promise.all(
  ['auth', '404', 'fallback'].map(section => preloadSection(section))
);

// Step 7: App mounted to DOM
app.mount('#app');
```

**Why this order matters:**
1. Pinia MUST be initialized before auth store
2. Auth store MUST be refreshed before router (guards need auth data)
3. Preloading is non-blocking (doesn't delay mount)

---

### 2. Route Navigation Flow

**User clicks a link or navigates to `/dashboard`**

```javascript
// BEFORE navigation (beforeEach guard)
router.beforeEach(async (to, from, next) => {
  
  // Step 1: Get route config from meta
  const routeConfig = to.meta?.routeConfig;
  
  // Step 2: Get REAL auth context
  const authStore = useAuthStore();
  const guardContext = {
    isAuthenticated: authStore.isAuthenticated,
    userRole: authStore.currentUser?.role || 'guest',
    userProfile: authStore.currentUser || {}
  };
  
  // Step 3: Run ALL guards (5 guards in sequence)
  const guardResult = await runAllRouteGuards(routeConfig, from.meta?.routeConfig, guardContext);
  
  // Step 4: Allow or block navigation
  if (guardResult.allow) {
    next(); // GO!
  } else {
    next(guardResult.redirectTo || false); // BLOCKED!
  }
});

// AFTER navigation (afterEach hook)
router.afterEach(async (to, from) => {
  
  // Step 1: Update active route
  setCurrentActiveRoute(to.meta.routeConfig);
  
  // Step 2: Preload section (NON-BLOCKING)
  const section = to.meta?.section;
  if (section) {
    preloadSection(section).catch(err => console.error(err));
  }
  
  // Step 3: Load translations (NON-BLOCKING)
  if (section) {
    loadTranslationsForSection(section).catch(err => console.error(err));
  }
});
```

**The 5 Guards (in order)**:

1. **Loop Prevention** - Detects redirect loops
2. **Enabled Check** - Route must have `enabled: true`
3. **Auth Check** - Route requires authentication?
4. **Role Check** - User has correct role?
5. **Dependency Check** - User completed onboarding/KYC?

---

### 3. Section Preloading Flow

**What happens when a section is preloaded?**

```javascript
// Step 1: Check if already preloaded
if (preloadedSections.has('dashboard')) {
  return; // Already done!
}

// Step 2: Load manifest (production only)
const manifest = await loadSectionManifest();
// Example manifest:
// {
//   "dashboard": {
//     "js": "/assets/section-dashboard-abc123.js",
//     "css": "/assets/section-dashboard-def456.css"
//   }
// }

// Step 3: Get bundle paths
const bundlePaths = await getSectionBundlePaths('dashboard');

// Step 4: Preload JavaScript
const jsLink = document.createElement('link');
jsLink.rel = 'modulepreload'; // Special for ES modules
jsLink.href = bundlePaths.js;
document.head.appendChild(jsLink);

// Step 5: Preload CSS
const cssLink = document.createElement('link');
cssLink.rel = 'preload';
cssLink.as = 'style';
cssLink.href = bundlePaths.css;
document.head.appendChild(cssLink);

// Step 6: Mark as preloaded
preloadedSections.add('dashboard');
```

**Result**: Browser downloads files in background, user sees instant navigation!

---

### 4. Translation Loading Flow

**What happens when translations are loaded?**

```javascript
// Step 1: Check cache
const cacheKey = `translations_dashboard_en`;
const cached = getValueFromCache(cacheKey);
if (cached) {
  return cached; // Use cached!
}

// Step 2: Load English first (fallback)
const enTranslations = await import(`@/i18n/section-dashboard/en.json`);
i18n.global.mergeLocaleMessage('en', { dashboard: enTranslations });

// Step 3: Load user's locale (if different)
const activeLocale = i18n.global.locale.value; // e.g., 'vi'
if (activeLocale !== 'en') {
  const localeTranslations = await import(`@/i18n/section-dashboard/${activeLocale}.json`);
  i18n.global.mergeLocaleMessage(activeLocale, { dashboard: localeTranslations });
}

// Step 4: Cache for next time
setValueWithExpiration(cacheKey, enTranslations, 3600000); // 1 hour
```

**Result**: User sees translated content instantly!

---

## 🎯 SECTION-BASED ARCHITECTURE DEEP DIVE

### What is a Section?

A **section** is a self-contained part of the app:

```
Section: "dashboard"
├── Routes: /dashboard, /dashboard/analytics, /dashboard/settings
├── Components: src/components/dashboard/*.vue
├── Translations: src/i18n/section-dashboard/*.json
├── JS Bundle: dist/assets/section-dashboard-[hash].js
├── CSS Bundle: dist/assets/section-dashboard-[hash].css
├── Individual CSS: src/components/dashboard/HeavyChart.css (optional)
└── Manifest Entry: { "dashboard": { "js": "...", "css": "..." } }
```

### Section Flow Example: Dashboard

**1. routeConfig.json**:
```json
{
  "slug": "/dashboard",
  "section": "dashboard",
  "componentPath": "@/components/dashboard/DashboardHome.vue",
  "requiresAuth": true,
  "allowedRoles": ["creator", "fan"],
  "preLoad": false
}
```

**2. Component**: `src/components/dashboard/DashboardHome.vue`
**3. Translations**: `src/i18n/section-dashboard/en.json`
**4. Vite builds**: `dist/assets/section-dashboard-abc123.js`

### Sections Registry

**Default preloaded** (always loaded at startup):
- `auth` - Login, signup, forgot password
- `404` - Not found page
- `fallback` - Error fallback

**Lazy loaded** (loaded on demand):
- `dashboard` - Dashboard routes
- `marketplace` - Marketplace routes
- `profile` - Profile routes
- `settings` - Settings routes
- ... (add more as needed)

### How to Add a New Section

**Step 1**: Add routes to `routeConfig.json`:
```json
{
  "slug": "/my-new-section",
  "section": "mynew",
  "componentPath": "@/components/mynew/MyNewHome.vue",
  "requiresAuth": true,
  "preLoad": false
}
```

**Step 2**: Create component directory:
```bash
mkdir src/components/mynew
```

**Step 3**: Create translation directory:
```bash
mkdir src/i18n/section-mynew
touch src/i18n/section-mynew/en.json
touch src/i18n/section-mynew/vi.json
```

**Step 4**: Build and test:
```bash
npm run build
# Check dist/section-manifest.json for new section
```

---

## 🎨 INDIVIDUAL COMPONENT CSS SYSTEM

### When to Use Individual CSS

**Use for heavy components** that would bloat section CSS bundles:

✅ **Good candidates**:
- Complex data tables with 50+ classes
- Heavy charts with animations
- Components used infrequently
- Components with custom Tailwind utilities

❌ **Don't use for**:
- Small utility components
- Frequently used components
- Components with minimal styling

### How to Enable Individual CSS

**Option 1: HTML Comment** (Recommended)
```vue
<!-- tailwind-ignore -->
<template>
  <div class="p-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-2xl">
    <h2 class="text-3xl font-bold text-white mb-4">Heavy Component</h2>
    <!-- Complex styling here -->
  </div>
</template>
```

**Option 2: Export Constant**
```vue
<script setup>
export const IGNORE_TAILWIND = true;
</script>

<template>
  <div class="complex-data-table">
    <!-- Heavy component content -->
  </div>
</template>
```

### What Happens When You Add the Marker

**Before**:
```
src/components/dashboard/HeavyChart.vue  ← Component only
```

**After build**:
```
src/components/dashboard/HeavyChart.vue  ← Component
src/components/dashboard/HeavyChart.css  ← Generated CSS (co-located)
```

### CSS Generation Process

1. **Scan**: Build system finds components with `tailwind-ignore`
2. **Extract**: Parses component template for Tailwind classes
3. **Generate**: Creates minimal CSS with only needed utilities
4. **Co-locate**: Places `.css` file next to `.vue` file
5. **Auto-import**: Vite loads CSS when component is imported

### Manual CSS Generation

```bash
# Generate individual CSS for all marked components
node build/tailwind/generateIndividualCss.js

# Clean up and regenerate
node build/tailwind/generateIndividualCss.js --clean
```

### Benefits

- **Reduced bundle size**: Section CSS bundles stay small
- **Lazy loading**: CSS loads only when component is used
- **No conflicts**: Isolated CSS doesn't affect section bundles
- **Performance**: Better caching for heavy components

### CSS File Structure

**Generated CSS**:
```css
/**
 * Auto-generated Tailwind CSS for HeavyChart
 * This file is generated automatically by the build system.
 *
 * Component: src/components/dashboard/HeavyChart.vue
 * Generated: 2025-01-15T10:30:00.000Z
 * Classes: 15
 */

/* Import Tailwind base, components, and utilities */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Component-specific styles */
/* Tailwind will purge unused classes during build */

/* Detected classes: p-8, bg-gradient-to-r, from-blue-500, to-purple-600, rounded-xl, shadow-2xl, text-3xl, font-bold, text-white, mb-4 */
```

### Testing Individual CSS

1. **Check file exists**:
   ```bash
   ls -la src/components/dashboard/HeavyChart.css
   ```

2. **Verify in Network tab**:
   - Navigate to component
   - Check Network tab for CSS file load
   - Confirm no duplicate CSS loading

3. **Build verification**:
   ```bash
   npm run build
   # Check that HeavyChart.css is generated
   ```

### Troubleshooting

**CSS not generated**:
- ✅ Marker is correct: `<!-- tailwind-ignore -->`
- ✅ Component is in `src/` directory
- ✅ Run generation script manually
- ✅ Check build logs for errors

**CSS not loading**:
- ✅ CSS file exists next to component
- ✅ Component is actually imported
- ✅ Vite dev server restarted

**Styles duplicated**:
- ✅ Component has `tailwind-ignore` marker
- ✅ Rebuild section CSS: `npm run build`
- ✅ Clear `dist/` folder

---

## 📋 ROUTE CONFIGURATION DEEP DIVE

### Route Config Structure

**File**: `src/router/routeConfig.json`

**Full Example**:
```json
{
  "slug": "/dashboard/analytics",
  "section": "dashboard",
  "componentPath": "@/components/dashboard/DashboardAnalytics.vue",
  "requiresAuth": true,
  "allowedRoles": ["creator", "agent"],
  "requireDependencies": {
    "onboardingPassed": true,
    "kycPassed": false
  },
  "enabled": true,
  "preLoad": false,
  "customComponentPath": {
    "creator": {
      "componentPath": "@/components/dashboard/CreatorAnalytics.vue"
    },
    "fan": {
      "componentPath": "@/components/dashboard/FanAnalytics.vue"
    }
  },
  "assetPreload": {
    "images": ["/images/dashboard-bg.jpg"],
    "fonts": ["/fonts/custom.woff2"]
  },
  "cssBundle": "dashboard",
  "manifestMeta": {
    "title": "Analytics",
    "description": "View your analytics"
  }
}
```

### Field Explanations

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `slug` | string | ✅ Yes | Route path | `/dashboard/analytics` |
| `section` | string | ✅ Yes | Section name | `dashboard` |
| `componentPath` | string | ✅ Yes | Component path | `@/components/...` |
| `requiresAuth` | boolean | ❌ No | Needs login? | `true` |
| `allowedRoles` | array | ❌ No | Who can access? | `["creator", "fan"]` |
| `requireDependencies` | object | ❌ No | Onboarding/KYC? | `{ "onboardingPassed": true }` |
| `enabled` | boolean | ❌ No | Route active? | `true` |
| `preLoad` | boolean | ❌ No | Preload at startup? | `false` |
| `customComponentPath` | object | ❌ No | Role-specific components | See above |
| `assetPreload` | object | ❌ No | Assets to preload | `{ "images": [...] }` |
| `cssBundle` | string | ❌ No | CSS bundle name | `dashboard` |
| `manifestMeta` | object | ❌ No | Metadata | `{ "title": "..." }` |

### Route Scenarios

#### Scenario 1: Public Route (No Auth)
```json
{
  "slug": "/about",
  "section": "misc",
  "componentPath": "@/components/misc/About.vue",
  "requiresAuth": false,
  "enabled": true
}
```

#### Scenario 2: Authenticated Route (All Roles)
```json
{
  "slug": "/dashboard",
  "section": "dashboard",
  "componentPath": "@/components/dashboard/DashboardHome.vue",
  "requiresAuth": true,
  "enabled": true
}
```

#### Scenario 3: Role-Specific Route
```json
{
  "slug": "/creator/studio",
  "section": "studio",
  "componentPath": "@/components/studio/StudioHome.vue",
  "requiresAuth": true,
  "allowedRoles": ["creator"],
  "enabled": true
}
```

#### Scenario 4: Dependency-Gated Route
```json
{
  "slug": "/marketplace",
  "section": "marketplace",
  "componentPath": "@/components/marketplace/MarketplaceHome.vue",
  "requiresAuth": true,
  "requireDependencies": {
    "onboardingPassed": true,
    "kycPassed": true
  },
  "enabled": true
}
```

#### Scenario 5: Role-Based Component Variants
```json
{
  "slug": "/home",
  "section": "home",
  "componentPath": "@/components/home/DefaultHome.vue",
  "requiresAuth": true,
  "customComponentPath": {
    "creator": {
      "componentPath": "@/components/home/CreatorHome.vue"
    },
    "fan": {
      "componentPath": "@/components/home/FanHome.vue"
    },
    "agent": {
      "componentPath": "@/components/home/AgentHome.vue"
    }
  },
  "enabled": true
}
```

**Result**: Creators see `CreatorHome.vue`, Fans see `FanHome.vue`, etc.

#### Scenario 6: Redirect Route
```json
{
  "slug": "/old-path",
  "redirect": "/new-path"
}
```

#### Scenario 7: Disabled Route
```json
{
  "slug": "/beta-feature",
  "section": "beta",
  "componentPath": "@/components/beta/BetaFeature.vue",
  "enabled": false
}
```

**Result**: Navigation blocked, user sees 404 or redirected.

---

## 🔐 AUTHENTICATION & ROLES DEEP DIVE

### Authentication Flow

#### Production (AWS Cognito)

**Login**:
```javascript
// 1. User enters email/password
const { idToken, accessToken, refreshToken } = await awsCognitoHandler.login(email, password);

// 2. Decode JWT token
const decoded = jwtDecode(idToken);
// {
//   email: "user@example.com",
//   "custom:role": "creator",
//   "custom:kyc": "true",
//   "custom:onboardingPassed": "false",
//   exp: 1756395763
// }

// 3. Save to Pinia store
authStore.setTokenAndDecode(idToken);
authStore.currentUser = {
  email: decoded.email,
  role: decoded["custom:role"],
  kycPassed: decoded["custom:kyc"] === "true",
  onboardingPassed: decoded["custom:onboardingPassed"] === "true",
  raw: decoded
};

// 4. Pinia persists to localStorage automatically
```

**Session Restoration** (on page refresh):
```javascript
// main.js
const authStore = useAuthStore();
authStore.refreshFromStorage(); // Reads from localStorage

// If token exists and not expired:
// ✅ User stays logged in
// ✅ Guards have access to user data
// ✅ App redirects to last page
```

#### Development (Mock Auth)

**File**: `src/utils/auth/authHandlerDev.js`

**Mock User**:
```javascript
const MOCK_USER = {
  email: "18520515@gm.uit.edu.vn",
  role: "creator",
  kycPassed: true,
  onboardingPassed: false,
  raw: { ... }
};
```

**Login** (bypasses Cognito):
```javascript
// 1. Generates mock JWT token
const mockIdToken = signJwtHS256(MOCK_USER.raw);

// 2. Saves to localStorage
localStorage.setItem('idToken', mockIdToken);

// 3. Updates Pinia store
authStore.setTokenAndDecode(mockIdToken);
```

**To switch between dev/prod**:
```bash
# .env
VITE_AUTH_MODE=dev        # Use mock auth
VITE_AUTH_MODE=cognito    # Use AWS Cognito
```

### Roles Explained

**4 Roles in the App**:

1. **`guest`** - Not logged in
   - Can access: Public routes only
   - Cannot access: Any route with `requiresAuth: true`

2. **`creator`** - Content creator
   - Can access: Creator dashboard, studio, analytics
   - Cannot access: Fan-specific routes

3. **`fan`** - Regular user/consumer
   - Can access: Marketplace, fan dashboard
   - Cannot access: Creator-specific routes

4. **`agent`** - Business/agency account
   - Can access: Agent dashboard, management tools
   - Cannot access: Creator studio

**Special role**: `vendor` (if needed for marketplace vendors)

### Role-Based Routing

**Example 1: Single Role Access**
```json
{
  "slug": "/creator/studio",
  "allowedRoles": ["creator"]
}
```
- ✅ Creator can access
- ❌ Fan redirected to /403 or /dashboard
- ❌ Guest redirected to /log-in

**Example 2: Multiple Roles**
```json
{
  "slug": "/marketplace",
  "allowedRoles": ["creator", "fan", "agent"]
}
```
- ✅ Creator, Fan, Agent can access
- ❌ Guest redirected to /log-in

**Example 3: All Authenticated Users**
```json
{
  "slug": "/settings",
  "requiresAuth": true
  // No allowedRoles = all authenticated users
}
```
- ✅ Any logged-in user can access
- ❌ Guest redirected to /log-in

### Mock Roles for Testing

**To test different roles in development**:

**Option 1: Edit Mock User**
```javascript
// src/utils/auth/authHandlerDev.js
const MOCK_USER = {
  email: "test@example.com",
  role: "fan", // Change this!
  kycPassed: true,
  onboardingPassed: true,
  raw: { ... }
};
```

**Option 2: Create Multiple Mock Users**
```javascript
const MOCK_USERS = {
  creator: {
    email: "creator@test.com",
    role: "creator",
    kycPassed: true,
    onboardingPassed: true
  },
  fan: {
    email: "fan@test.com",
    role: "fan",
    kycPassed: false,
    onboardingPassed: false
  },
  agent: {
    email: "agent@test.com",
    role: "agent",
    kycPassed: true,
    onboardingPassed: true
  }
};

// In login function:
async function login({ email }) {
  const user = MOCK_USERS[email.split('@')[0]] || MOCK_USERS.fan;
  // ... rest of login logic
}
```

**Then test**:
```javascript
// Login as creator
await authStore.login({ email: "creator@test.com", password: "test" });

// Login as fan
await authStore.login({ email: "fan@test.com", password: "test" });

// Login as agent
await authStore.login({ email: "agent@test.com", password: "test" });
```

### Dependencies (Onboarding, KYC)

**Stored in JWT token**:
```javascript
{
  "custom:onboardingPassed": "true",  // User completed onboarding
  "custom:kyc": "true"                // User completed KYC verification
}
```

**Route Guard Check**:
```javascript
// routeConfig.json
{
  "slug": "/marketplace",
  "requireDependencies": {
    "onboardingPassed": true,
    "kycPassed": true
  }
}

// If user hasn't completed onboarding:
// ❌ Redirected to /onboarding
// If user hasn't completed KYC:
// ❌ Redirected to /kyc
```

---

## ✅ TESTING GUIDE - COMPLETE CHECKLISTS

### Testing Strategy

**3 Levels of Testing**:
1. **Unit Testing** - Individual handlers/functions
2. **Flow Testing** - Complete user flows
3. **Integration Testing** - All systems working together

---

### 🔧 HANDLER TESTING CHECKLISTS

#### ✅ Checklist: `cacheHandler.js`

**File**: `src/utils/common/cacheHandler.js`

- [ ] **Test 1: Set and Get Value**
  ```javascript
  import { setValueInCache, getValueFromCache } from '@/utils/common/cacheHandler';
  
  // Set value
  setValueInCache('test-key', { data: 'test' });
  
  // Get value
  const value = getValueFromCache('test-key');
  console.assert(value.data === 'test', 'Value should match');
  ```

- [ ] **Test 2: Value Expiration**
  ```javascript
  import { setValueWithExpiration, getValueFromCache } from '@/utils/common/cacheHandler';
  
  // Set with 1 second TTL
  setValueWithExpiration('expire-key', { data: 'test' }, 1000);
  
  // Immediately get (should exist)
  let value = getValueFromCache('expire-key');
  console.assert(value !== null, 'Value should exist');
  
  // Wait 2 seconds
  setTimeout(() => {
    value = getValueFromCache('expire-key');
    console.assert(value === null, 'Value should be expired');
  }, 2000);
  ```

- [ ] **Test 3: Clear Cache**
  ```javascript
  import { clearCache } from '@/utils/common/cacheHandler';
  
  setValueInCache('key1', 'value1');
  setValueInCache('key2', 'value2');
  
  clearCache();
  
  const value1 = getValueFromCache('key1');
  const value2 = getValueFromCache('key2');
  console.assert(value1 === null && value2 === null, 'Cache should be empty');
  ```

#### ✅ Checklist: `manifestLoader.js`

**File**: `src/utils/build/manifestLoader.js`

- [ ] **Test 1: Load Manifest in Production**
  ```bash
  # Build app
  npm run build
  
  # Check manifest file exists
  ls dist/section-manifest.json
  
  # Preview production build
  npm run preview
  
  # In browser console:
  import { loadSectionManifest } from '@/utils/build/manifestLoader';
  const manifest = await loadSectionManifest();
  console.log(manifest);
  // Should show: { "auth": { "js": "...", "css": "..." }, ... }
  ```

- [ ] **Test 2: Get Section Bundle Paths**
  ```javascript
  import { getSectionBundlePaths } from '@/utils/build/manifestLoader';
  
  const paths = await getSectionBundlePaths('dashboard');
  console.log(paths);
  // Should show: { js: "/assets/section-dashboard-abc123.js", css: "/assets/section-dashboard-def456.css" }
  
  console.assert(paths.js.includes('dashboard'), 'JS path should contain section name');
  console.assert(paths.css.includes('dashboard'), 'CSS path should contain section name');
  ```

- [ ] **Test 3: Development Mode (Empty Manifest)**
  ```bash
  # Run dev server
  npm run dev
  
  # In browser console:
  import { loadSectionManifest } from '@/utils/build/manifestLoader';
  const manifest = await loadSectionManifest();
  console.log(manifest);
  // Should show: {} (empty in dev mode)
  ```

#### ✅ Checklist: `sectionPreloader.js`

**File**: `src/utils/section/sectionPreloader.js`

**How to Test Preloading**:

- [ ] **Test 1: Visual Network Tab Inspection**
  ```bash
  # Step 1: Build and preview
  npm run build
  npm run preview
  
  # Step 2: Open browser DevTools → Network tab
  # Step 3: Clear network log
  # Step 4: Refresh page
  
  # Expected Results:
  # ✅ See "modulepreload" requests for auth.js, 404.js, fallback.js
  # ✅ See "preload" requests for auth.css, 404.css, fallback.css
  # ✅ These should happen IMMEDIATELY on page load
  ```

- [ ] **Test 2: Verify Preloading Reduces Network Activity**
  ```bash
  # Step 1: Open Network tab
  # Step 2: Load homepage
  # Step 3: Wait for auth section to preload
  # Step 4: Navigate to /log-in
  
  # Expected Results:
  # ✅ NO network request for auth.js (already preloaded!)
  # ✅ NO network request for auth.css (already preloaded!)
  # ✅ ONLY translation file loaded (section-auth/en.json)
  # ✅ Page loads INSTANTLY
  ```

- [ ] **Test 3: Check Preload Link Tags**
  ```bash
  # Step 1: Load homepage
  # Step 2: Inspect <head> element
  
  # Expected:
  # <link rel="modulepreload" href="/assets/section-auth-abc123.js" as="script">
  # <link rel="preload" href="/assets/section-auth-def456.css" as="style">
  # <link rel="modulepreload" href="/assets/section-404-xyz789.js" as="script">
  # ... (for all preloaded sections)
  ```

- [ ] **Test 4: Programmatic Preload Test**
  ```javascript
  import { preloadSection, isSectionPreloaded } from '@/utils/section/sectionPreloader';
  
  // Before preload
  console.assert(!isSectionPreloaded('dashboard'), 'Dashboard should not be preloaded yet');
  
  // Preload
  await preloadSection('dashboard');
  
  // After preload
  console.assert(isSectionPreloaded('dashboard'), 'Dashboard should be preloaded now');
  
  // Navigate to dashboard - should be instant!
  router.push('/dashboard');
  ```

- [ ] **Test 5: Check Performance Metrics**
  ```javascript
  // Enable logging
  // .env: VITE_ENABLE_LOGGER=true
  
  // Open console, refresh page
  // You should see performance table:
  /*
  ┌─────────┬──────────────────────┬──────────────┬──────────┬──────┐
  │ (index) │ step                 │ file         │ flag     │ ms   │
  ├─────────┼──────────────────────┼──────────────┼──────────┼──────┤
  │ 0       │ preloadSection_start │ sectionPre...│ preload  │ 0    │
  │ 1       │ preloadJs_start      │ sectionPre...│ js       │ 5    │
  │ 2       │ preloadJs_complete   │ sectionPre...│ js       │ 150  │
  │ 3       │ preloadCss_start     │ sectionPre...│ css      │ 155  │
  │ 4       │ preloadCss_complete  │ sectionPre...│ css      │ 200  │
  └─────────┴──────────────────────┴──────────────┴──────────┴──────┘
  */
  ```

#### ✅ Checklist: `translationLoader.js`

**File**: `src/utils/translation/translationLoader.js`

- [ ] **Test 1: Load Section Translations**
  ```javascript
  import { loadTranslationsForSection } from '@/utils/translation/translationLoader';
  import { useI18n } from 'vue-i18n';
  
  const { t } = useI18n();
  
  // Load dashboard translations
  await loadTranslationsForSection('dashboard');
  
  // Use translation
  const text = t('dashboard.welcome');
  console.log(text); // Should show translated text
  ```

- [ ] **Test 2: Network Tab - Translation Files Only**
  ```bash
  # Step 1: Preload auth section
  # Step 2: Navigate to /log-in
  # Step 3: Check Network tab
  
  # Expected:
  # ✅ Request for section-auth/en.json (translation file)
  # ❌ NO request for auth.js (already preloaded!)
  # ❌ NO request for auth.css (already preloaded!)
  ```

- [ ] **Test 3: Locale Switching**
  ```javascript
  import { switchLocale } from '@/utils/translation/localeManager';
  
  // Load English
  await loadTranslationsForSection('dashboard');
  console.log(t('dashboard.title')); // "Dashboard"
  
  // Switch to Vietnamese
  await switchLocale('vi');
  console.log(t('dashboard.title')); // "Bảng điều khiển"
  ```

#### ✅ Checklist: `authHandler.js` (Production)

**File**: `src/utils/auth/authHandler.js`

- [ ] **Test 1: Login Flow**
  ```javascript
  import { useAuthStore } from '@/stores/useAuthStore';
  
  const authStore = useAuthStore();
  
  // Login
  await authStore.login({
    email: 'your-email@example.com',
    password: 'your-password'
  });
  
  // Check state
  console.assert(authStore.isAuthenticated, 'Should be authenticated');
  console.assert(authStore.currentUser.email === 'your-email@example.com', 'Email should match');
  console.assert(authStore.idToken !== null, 'Should have ID token');
  ```

- [ ] **Test 2: Session Restoration**
  ```javascript
  // Step 1: Login
  await authStore.login({ email: 'test@example.com', password: 'test' });
  
  // Step 2: Refresh page (F5)
  // Step 3: Check auth state
  
  console.assert(authStore.isAuthenticated, 'Session should be restored');
  console.assert(authStore.currentUser !== null, 'User should be restored');
  ```

- [ ] **Test 3: Logout Flow**
  ```javascript
  // Logout
  await authStore.logout();
  
  // Check state
  console.assert(!authStore.isAuthenticated, 'Should not be authenticated');
  console.assert(authStore.currentUser === null, 'User should be null');
  console.assert(authStore.idToken === null, 'Token should be null');
  
  // Check localStorage
  console.assert(localStorage.getItem('idToken') === null, 'Token should be cleared from storage');
  ```

#### ✅ Checklist: `authHandlerDev.js` (Development)

**File**: `src/utils/auth/authHandlerDev.js`

- [ ] **Test 1: Mock Login**
  ```javascript
  // .env: VITE_AUTH_MODE=dev
  
  import { useAuthStore } from '@/stores/useAuthStore';
  
  const authStore = useAuthStore();
  
  // Login with ANY credentials
  await authStore.login({
    email: 'anything@test.com',
    password: 'anything'
  });
  
  // Should succeed with mock user
  console.assert(authStore.isAuthenticated, 'Should be authenticated');
  console.assert(authStore.currentUser.role === 'creator', 'Should have creator role');
  ```

- [ ] **Test 2: Test Different Roles**
  ```javascript
  // Edit MOCK_USER in authHandlerDev.js
  // Change role to 'fan'
  
  await authStore.login({ email: 'test@test.com', password: 'test' });
  
  console.assert(authStore.currentUser.role === 'fan', 'Should be fan');
  
  // Navigate to creator-only route
  router.push('/creator/studio');
  // Should be blocked and redirected
  ```

---

### 🔄 FLOW TESTING CHECKLISTS

#### ✅ Flow 1: First-Time User Registration

- [ ] **Step 1: Navigate to Signup**
  ```javascript
  router.push('/sign-up');
  // ✅ Should load signup component
  // ✅ Auth section should be preloaded
  ```

- [ ] **Step 2: Fill Registration Form**
  ```javascript
  // Enter email, password, role
  // Submit form
  ```

- [ ] **Step 3: Email Confirmation**
  ```javascript
  // Check email for confirmation code
  // Enter code in app
  // ✅ Should confirm registration
  ```

- [ ] **Step 4: Automatic Login**
  ```javascript
  // After confirmation, should auto-login
  console.assert(authStore.isAuthenticated, 'Should be logged in');
  ```

- [ ] **Step 5: Onboarding Redirect**
  ```javascript
  // Should redirect to /onboarding
  console.assert(router.currentRoute.value.path === '/onboarding', 'Should be on onboarding');
  ```

#### ✅ Flow 2: Returning User Login

- [ ] **Step 1: Navigate to Login**
  ```javascript
  router.push('/log-in');
  // ✅ Network tab should show NO JS/CSS requests (preloaded!)
  // ✅ Only translation file loaded
  ```

- [ ] **Step 2: Enter Credentials**
  ```javascript
  await authStore.login({ email: 'user@example.com', password: 'password' });
  ```

- [ ] **Step 3: Session Created**
  ```javascript
  console.assert(authStore.isAuthenticated, 'Should be authenticated');
  console.assert(localStorage.getItem('idToken') !== null, 'Token saved to localStorage');
  ```

- [ ] **Step 4: Redirect to Dashboard**
  ```javascript
  // Should automatically redirect to /dashboard
  console.assert(router.currentRoute.value.path === '/dashboard', 'Should be on dashboard');
  ```

- [ ] **Step 5: Dashboard Section Loaded**
  ```javascript
  // Check Network tab
  // ✅ Dashboard JS/CSS preloaded in background
  // ✅ Dashboard translations loaded
  // ✅ Dashboard component rendered
  ```

#### ✅ Flow 3: Role-Based Access

- [ ] **Test 1: Creator Accessing Creator Routes**
  ```javascript
  // Login as creator
  await authStore.login({ email: 'creator@example.com', password: 'test' });
  
  // Navigate to creator route
  router.push('/creator/studio');
  // ✅ Should access successfully
  console.assert(router.currentRoute.value.path === '/creator/studio', 'Creator can access studio');
  ```

- [ ] **Test 2: Fan Accessing Creator Routes**
  ```javascript
  // Login as fan
  await authStore.login({ email: 'fan@example.com', password: 'test' });
  
  // Try to navigate to creator route
  router.push('/creator/studio');
  // ❌ Should be blocked
  console.assert(router.currentRoute.value.path !== '/creator/studio', 'Fan should be blocked');
  // ✅ Should redirect to /403 or /dashboard
  ```

- [ ] **Test 3: Guest Accessing Auth Routes**
  ```javascript
  // Not logged in
  authStore.logout();
  
  // Try to navigate to auth route
  router.push('/dashboard');
  // ❌ Should be blocked
  console.assert(router.currentRoute.value.path === '/log-in', 'Guest should be redirected to login');
  ```

#### ✅ Flow 4: Dependency Gating (Onboarding/KYC)

- [ ] **Test 1: User Without Onboarding**
  ```javascript
  // Mock user with onboardingPassed: false
  // Login
  await authStore.login({ ... });
  
  // Navigate to route requiring onboarding
  router.push('/marketplace');
  // ❌ Should be blocked
  console.assert(router.currentRoute.value.path === '/onboarding', 'Should redirect to onboarding');
  ```

- [ ] **Test 2: User After Completing Onboarding**
  ```javascript
  // Complete onboarding
  await authStore.updateUserAttributes({ onboardingPassed: true });
  
  // Navigate to route requiring onboarding
  router.push('/marketplace');
  // ✅ Should access successfully
  console.assert(router.currentRoute.value.path === '/marketplace', 'Should access marketplace');
  ```

#### ✅ Flow 5: Section Preloading & Performance

- [ ] **Test 1: Default Section Preload at Startup**
  ```bash
  # Step 1: Clear browser cache
  # Step 2: Open Network tab
  # Step 3: Load homepage
  
  # Expected within 1 second:
  # ✅ auth.js preloaded
  # ✅ auth.css preloaded
  # ✅ 404.js preloaded
  # ✅ 404.css preloaded
  # ✅ fallback.js preloaded
  # ✅ fallback.css preloaded
  ```

- [ ] **Test 2: Instant Navigation to Preloaded Section**
  ```bash
  # Step 1: Wait for auth section to preload
  # Step 2: Click "Login" link
  # Step 3: Measure time to interactive
  
  # Expected:
  # ✅ Page renders in < 50ms (instant!)
  # ✅ NO JS/CSS network requests
  # ✅ ONLY translation file loaded
  ```

- [ ] **Test 3: Lazy Section Load on First Navigation**
  ```bash
  # Step 1: Navigate to /dashboard (first time)
  # Step 2: Check Network tab
  
  # Expected:
  # ✅ dashboard.js loaded
  # ✅ dashboard.css loaded
  # ✅ dashboard translations loaded
  # ✅ Takes ~200-500ms (acceptable first load)
  ```

- [ ] **Test 4: Instant Navigation to Previously Loaded Section**
  ```bash
  # Step 1: Navigate to /dashboard (loads section)
  # Step 2: Navigate to /home
  # Step 3: Navigate back to /dashboard
  # Step 4: Check Network tab
  
  # Expected:
  # ✅ NO JS/CSS requests (cached by browser!)
  # ✅ ONLY translation check
  # ✅ Renders instantly
  ```

---

### 🎯 ROUTE CONFIG SCENARIO TESTING

#### ✅ Scenario 1: Public Route
**Route Config**:
```json
{
  "slug": "/about",
  "section": "misc",
  "componentPath": "@/components/misc/About.vue",
  "requiresAuth": false
}
```

**Test Checklist**:
- [ ] Guest can access ✅
- [ ] Authenticated user can access ✅
- [ ] No auth redirect ✅

#### ✅ Scenario 2: Auth-Required Route
**Route Config**:
```json
{
  "slug": "/dashboard",
  "section": "dashboard",
  "componentPath": "@/components/dashboard/DashboardHome.vue",
  "requiresAuth": true
}
```

**Test Checklist**:
- [ ] Guest redirected to /log-in ❌
- [ ] Authenticated user can access ✅
- [ ] Any role can access (no role restriction) ✅

#### ✅ Scenario 3: Role-Restricted Route
**Route Config**:
```json
{
  "slug": "/creator/studio",
  "section": "studio",
  "componentPath": "@/components/studio/StudioHome.vue",
  "requiresAuth": true,
  "allowedRoles": ["creator"]
}
```

**Test Checklist**:
- [ ] Creator can access ✅
- [ ] Fan redirected to /403 ❌
- [ ] Agent redirected to /403 ❌
- [ ] Guest redirected to /log-in ❌

#### ✅ Scenario 4: Multi-Role Route
**Route Config**:
```json
{
  "slug": "/marketplace",
  "section": "marketplace",
  "componentPath": "@/components/marketplace/MarketplaceHome.vue",
  "requiresAuth": true,
  "allowedRoles": ["creator", "fan"]
}
```

**Test Checklist**:
- [ ] Creator can access ✅
- [ ] Fan can access ✅
- [ ] Agent redirected to /403 ❌
- [ ] Guest redirected to /log-in ❌

#### ✅ Scenario 5: Dependency-Gated Route
**Route Config**:
```json
{
  "slug": "/marketplace",
  "section": "marketplace",
  "componentPath": "@/components/marketplace/MarketplaceHome.vue",
  "requiresAuth": true,
  "requireDependencies": {
    "onboardingPassed": true,
    "kycPassed": true
  }
}
```

**Test Checklist**:
- [ ] User with onboarding & KYC can access ✅
- [ ] User without onboarding redirected to /onboarding ❌
- [ ] User without KYC redirected to /kyc ❌
- [ ] Guest redirected to /log-in ❌

#### ✅ Scenario 6: Disabled Route
**Route Config**:
```json
{
  "slug": "/beta-feature",
  "section": "beta",
  "componentPath": "@/components/beta/BetaFeature.vue",
  "enabled": false
}
```

**Test Checklist**:
- [ ] All users blocked ❌
- [ ] Redirected to /404 ❌

#### ✅ Scenario 7: Redirect Route
**Route Config**:
```json
{
  "slug": "/old-path",
  "redirect": "/new-path"
}
```

**Test Checklist**:
- [ ] All users redirected to /new-path ✅
- [ ] No component loaded (redirect only) ✅

#### ✅ Scenario 8: Role-Based Component Variants
**Route Config**:
```json
{
  "slug": "/home",
  "section": "home",
  "componentPath": "@/components/home/DefaultHome.vue",
  "requiresAuth": true,
  "customComponentPath": {
    "creator": {
      "componentPath": "@/components/home/CreatorHome.vue"
    },
    "fan": {
      "componentPath": "@/components/home/FanHome.vue"
    }
  }
}
```

**Test Checklist**:
- [ ] Creator sees CreatorHome.vue ✅
- [ ] Fan sees FanHome.vue ✅
- [ ] Agent sees DefaultHome.vue (fallback) ✅
- [ ] Guest redirected to /log-in ❌

---

## 🌍 ENVIRONMENT VARIABLES

### Environment Files

**`.env`** - Defaults (committed to repo)
**`.env.local`** - Local overrides (NOT committed, add to .gitignore)
**`.env.production`** - Production values (use in CI/CD)

### All Environment Variables

```bash
# ==============================================
# LOGGING & DEBUGGING
# ==============================================
VITE_ENABLE_LOGGER=true           # Enable performance tracking and logging
                                  # true = logs enabled, false = silent
                                  # Affects: console logs, performance tables

# ==============================================
# AUTHENTICATION MODE
# ==============================================
VITE_AUTH_MODE=dev                # Authentication mode
                                  # dev = mock auth (no Cognito)
                                  # cognito = AWS Cognito (production)
                                  # Used in: src/utils/auth/authHandler.js

# ==============================================
# AWS COGNITO (Production Only)
# ==============================================
VITE_COGNITO_USER_POOL_ID=ap-northeast-1_xxxxx
                                  # AWS Cognito User Pool ID
                                  # Get from: AWS Console → Cognito → User Pools

VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxx
                                  # AWS Cognito App Client ID
                                  # Get from: AWS Console → Cognito → App Clients

VITE_COGNITO_REGION=ap-northeast-1
                                  # AWS Region where Cognito is hosted

# ==============================================
# API ENDPOINTS
# ==============================================
VITE_API_BASE_URL=https://api.example.com
                                  # Base URL for API calls
                                  # Used in: axios/fetch requests

VITE_API_VERSION=v1               # API version
                                  # Appended to API_BASE_URL

# ==============================================
# APP CONFIGURATION
# ==============================================
VITE_APP_NAME=VueApp              # Application name
                                  # Used in: page titles, metadata

VITE_APP_URL=https://app.example.com
                                  # Full app URL
                                  # Used in: OAuth redirects, emails

# ==============================================
# FEATURE FLAGS
# ==============================================
VITE_FEATURE_MARKETPLACE=true     # Enable marketplace feature
VITE_FEATURE_CHAT=false           # Enable chat feature
VITE_FEATURE_ANALYTICS=true       # Enable analytics
                                  # Used in: route guards, component visibility

# ==============================================
# PERFORMANCE
# ==============================================
VITE_SECTION_PRELOAD_TIMEOUT=5000 # Max time (ms) to wait for preload
VITE_TRANSLATION_CACHE_TTL=3600000# Translation cache time (ms) = 1 hour
VITE_ASSET_CACHE_TTL=7200000      # Asset cache time (ms) = 2 hours
```

### How to Use Environment Variables

**In Code**:
```javascript
// Access env var
const apiUrl = import.meta.env.VITE_API_BASE_URL;

// Check if logging enabled
if (import.meta.env.VITE_ENABLE_LOGGER === 'true') {
  console.log('Logging is enabled');
}

// Feature flag check
if (import.meta.env.VITE_FEATURE_MARKETPLACE === 'true') {
  // Show marketplace
}
```

**In HTML** (`index.html`):
```html
<title>%VITE_APP_NAME%</title>
```

### Environment Setup for Different Stages

**Development** (`.env.local`):
```bash
VITE_ENABLE_LOGGER=true
VITE_AUTH_MODE=dev
VITE_API_BASE_URL=http://localhost:3000
```

**Staging** (`.env.staging`):
```bash
VITE_ENABLE_LOGGER=true
VITE_AUTH_MODE=cognito
VITE_API_BASE_URL=https://staging-api.example.com
VITE_COGNITO_USER_POOL_ID=ap-northeast-1_staging
VITE_COGNITO_CLIENT_ID=staging_client_id
```

**Production** (`.env.production`):
```bash
VITE_ENABLE_LOGGER=false
VITE_AUTH_MODE=cognito
VITE_API_BASE_URL=https://api.example.com
VITE_COGNITO_USER_POOL_ID=ap-northeast-1_production
VITE_COGNITO_CLIENT_ID=production_client_id
```

---

## 📦 DEPENDENCIES EXPLAINED

### Core Dependencies

```json
{
  "dependencies": {
    "vue": "^3.5.13",                    // Vue.js framework
    "vue-router": "^4.5.0",              // Routing
    "pinia": "^2.3.0",                   // State management
    "pinia-plugin-persistedstate": "^4.2.0", // Persist Pinia to localStorage
    "vue-i18n": "^10.0.0",               // Internationalization
    
    "amazon-cognito-identity-js": "^6.3.13", // AWS Cognito SDK
    "jwt-decode": "^4.0.0",              // Decode JWT tokens
    
    "axios": "^1.7.0"                    // HTTP client (if using API)
  },
  "devDependencies": {
    "vite": "^6.0.5",                    // Build tool
    "tailwindcss": "^3.4.17",            // CSS framework
    "postcss": "^8.4.49",                // CSS processor
    "autoprefixer": "^10.4.20"           // CSS vendor prefixing
  }
}
```

### Dependency Purposes

#### `vue` (^3.5.13)
**What**: Vue.js 3 framework  
**Why**: Core framework for building UI  
**Used in**: Every `.vue` component

#### `vue-router` (^4.5.0)
**What**: Official router for Vue.js  
**Why**: Handle navigation between pages  
**Used in**: `src/router/index.js`

#### `pinia` (^2.3.0)
**What**: Official state management for Vue.js  
**Why**: Manage global state (auth, user data, etc.)  
**Used in**: `src/stores/*.js`

#### `pinia-plugin-persistedstate` (^4.2.0)
**What**: Persists Pinia stores to localStorage  
**Why**: Keep user logged in on page refresh  
**Used in**: `src/main.js` - `pinia.use(piniaPluginPersistedstate)`

#### `vue-i18n` (^10.0.0)
**What**: Internationalization plugin  
**Why**: Support multiple languages (English, Vietnamese, etc.)  
**Used in**: `src/utils/translation/*.js`

#### `amazon-cognito-identity-js` (^6.3.13)
**What**: AWS Cognito SDK  
**Why**: Handle authentication with AWS Cognito  
**Used in**: `src/utils/auth/awsCognitoUtilities.js`

#### `jwt-decode` (^4.0.0)
**What**: Decode JWT tokens  
**Why**: Extract user data from Cognito ID token  
**Used in**: `src/stores/useAuthStore.js`

#### `vite` (^6.0.5)
**What**: Next-generation build tool  
**Why**: Fast development server, optimized production builds  
**Used in**: `vite.config.js`

#### `tailwindcss` (^3.4.17)
**What**: Utility-first CSS framework  
**Why**: Rapid UI development with utility classes  
**Used in**: All `.vue` components

### Installing Dependencies

```bash
# Install all dependencies
npm install

# Install specific dependency
npm install vue-router

# Install dev dependency
npm install -D vite

# Update dependencies
npm update

# Check for outdated dependencies
npm outdated
```

### Troubleshooting Dependencies

**Issue**: `Cannot find module 'vue'`  
**Fix**: `npm install`

**Issue**: Build fails with Vite error  
**Fix**: Clear cache and reinstall
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

**Issue**: Cognito SDK not working  
**Fix**: Check version compatibility
```bash
npm install amazon-cognito-identity-js@latest
```

---

## 🚀 DEPLOYMENT GUIDE

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Build succeeds locally
- [ ] No console errors
- [ ] Performance tested
- [ ] Security audited

### Deployment Steps

#### Step 1: Configure Production Environment

**Create `.env.production`**:
```bash
VITE_ENABLE_LOGGER=false
VITE_AUTH_MODE=cognito
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_COGNITO_USER_POOL_ID=ap-northeast-1_xxxxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxx
VITE_COGNITO_REGION=ap-northeast-1
VITE_APP_URL=https://app.yourdomain.com
```

#### Step 2: Build for Production

```bash
# Clean previous build
rm -rf dist

# Build with production env
npm run build

# Output:
# dist/
# ├── index.html
# ├── assets/
# │   ├── section-auth-abc123.js
# │   ├── section-auth-def456.css
# │   ├── section-dashboard-xyz789.js
# │   └── ...
# └── section-manifest.json
```

#### Step 3: Test Production Build Locally

```bash
# Preview production build
npm run preview

# Open http://localhost:4173
# Test:
# ✅ App loads
# ✅ Login works
# ✅ Navigation works
# ✅ Sections preload
# ✅ No console errors
```

#### Step 4: Deploy to Hosting

**Option A: Netlify**

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod --dir=dist
```

3. Configure:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Environment variables**: Add in Netlify dashboard

**Option B: Vercel**

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Configure:
- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Environment variables**: Add in Vercel dashboard

**Option C: AWS S3 + CloudFront**

1. Build:
```bash
npm run build
```

2. Upload to S3:
```bash
aws s3 sync dist/ s3://your-bucket-name --delete
```

3. Invalidate CloudFront:
```bash
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

**Option D: Traditional Server (Apache/Nginx)**

1. Build:
```bash
npm run build
```

2. Upload `dist/` to server:
```bash
scp -r dist/* user@server:/var/www/html/
```

3. Configure server:

**Nginx** (`/etc/nginx/sites-available/app`):
```nginx
server {
    listen 80;
    server_name app.yourdomain.com;
    root /var/www/html;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Apache** (`.htaccess`):
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Cache static assets
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$">
    Header set Cache-Control "max-age=31536000, public, immutable"
</FilesMatch>
```

#### Step 5: Configure AWS Cognito

1. **Create User Pool**:
   - Go to AWS Console → Cognito
   - Create User Pool
   - Configure required attributes (email, custom:role, custom:kyc, custom:onboardingPassed)

2. **Create App Client**:
   - Add app client to user pool
   - Copy User Pool ID and Client ID
   - Add to `.env.production`

3. **Configure Hosted UI** (optional):
   - Set callback URLs
   - Set sign-out URLs

#### Step 6: Post-Deployment Verification

```bash
# Load production site
# Test checklist:
- [ ] Homepage loads ✅
- [ ] Login works ✅
- [ ] Session persistence works ✅
- [ ] All routes accessible ✅
- [ ] Sections preload correctly ✅
- [ ] Translations load ✅
- [ ] No console errors ✅
- [ ] Performance is good ✅
```

### Continuous Deployment

**GitHub Actions** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        env:
          VITE_COGNITO_USER_POOL_ID: ${{ secrets.COGNITO_USER_POOL_ID }}
          VITE_COGNITO_CLIENT_ID: ${{ secrets.COGNITO_CLIENT_ID }}
          VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
        run: npm run build
      
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Monitoring & Analytics

**Add to `index.html`**:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>

<!-- Error Tracking (Sentry) -->
<script src="https://browser.sentry-cdn.com/7.x.x/bundle.min.js"></script>
<script>
  Sentry.init({
    dsn: 'YOUR_SENTRY_DSN',
    environment: 'production'
  });
</script>
```

---

## 🎉 SUMMARY

You now have:
- ✅ Complete understanding of app architecture
- ✅ Detailed flow diagrams
- ✅ In-depth route config knowledge
- ✅ Full auth & roles understanding
- ✅ Comprehensive testing checklists
- ✅ Environment variable reference
- ✅ Dependencies explained
- ✅ Deployment guide

**Next Steps**:
1. Read this guide thoroughly
2. Test each scenario from checklists
3. Deploy to staging
4. Test in staging
5. Deploy to production
6. Monitor and iterate

**Questions?** Check other documentation files:
- `ALL_FIXES_COMPLETE.md` - What was fixed
- `AUDIT_REPORT.md` - Technical details
- `README.md` files in each folder

**Happy coding! 🚀**

