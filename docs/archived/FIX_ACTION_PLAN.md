# FIX ACTION PLAN - Prioritized Tasks

**Goal**: Fix all critical gaps and ensure code consistency

---

## ⚡ **PHASE 1: CRITICAL FIXES (Must fix before app works)**

### 1.1 Create Manifest Loader
**File**: `src/utils/build/manifestLoader.js` (NEW)
**Action**: Create utility to load section manifest in production
**Why**: Section preloading requires manifest data

### 1.2 Fix Router Guards - Auth Integration
**File**: `src/router/index.js`
**Lines**: 188-192
**Action**: 
- Import `useAuthStore`
- Populate `guardContext` with real auth data
**Why**: Guards currently use hardcoded guest values

### 1.3 Fix Router Guards - Async Call
**File**: `src/router/index.js`
**Line**: 195
**Action**: Add `await` before `runAllRouteGuards`
**Why**: Guard function is async but not awaited

### 1.4 Add Missing Export
**File**: `src/utils/route/routeGuards.js`
**Action**: Export `runAllRouteGuards` wrapper function
**Why**: Router expects this specific function signature

### 1.5 Session Restoration
**File**: `src/main.js`
**Action**: Add auth session restoration before app mount
**Why**: Users lose session on page refresh

---

## 🔧 **PHASE 2: CONSISTENCY FIXES (Code quality)**

### 2.1 Fix logHandler.js
**File**: `src/utils/common/logHandler.js`
**Action**: 
- Remove `logInfoMessage`, `logDebugMessage`, `logErrorMessage`, `logWarningMessage`
- Keep only `log(file, method, flag, description, data)`
**Impact**: 16 files will need updates

### 2.2 Remove globalPerfTracker.js
**File**: `src/utils/common/globalPerfTracker.js`
**Action**: DELETE file
**Why**: Should use performanceTracker.js only

### 2.3 Update main.js - Performance Tracker
**File**: `src/main.js`
**Action**: 
- Import `PerfTracker` from `performanceTracker.js`
- Create ONE instance
- Export for use elsewhere
**Impact**: 11 files will import from main.js

### 2.4 Update All Files - Logging (16 files)
**Files**: 
1. `src/main.js`
2. `src/App.vue`
3. `src/router/index.js`
4. `src/utils/route/routeConfigLoader.js`
5. `src/utils/route/routeGuards.js`
6. `src/utils/route/routeResolver.js`
7. `src/utils/route/routeNavigation.js`
8. `src/utils/section/sectionResolver.js`
9. `src/utils/section/sectionPreloader.js`
10. `src/utils/translation/translationLoader.js`
11. `src/utils/translation/localeManager.js`
12. `src/utils/common/errorHandler.js`
13. `src/utils/common/objectSafety.js`
14. `src/utils/common/index.js`

**Action**: Replace all `logXxxMessage` with `log('file', 'method', 'flag', 'desc', data)`

### 2.5 Update All Files - Performance Tracker (11 files)
**Files**:
1. `src/main.js`
2. `src/App.vue`
3. `src/router/index.js`
4. `src/utils/route/routeConfigLoader.js`
5. `src/utils/route/routeGuards.js`
6. `src/utils/route/routeResolver.js`
7. `src/utils/route/routeNavigation.js`
8. `src/utils/section/sectionResolver.js`
9. `src/utils/section/sectionPreloader.js`
10. `src/utils/translation/translationLoader.js`
11. `src/utils/translation/localeManager.js`

**Action**: Replace `getGlobalPerfTracker()` with imported global instance

### 2.6 Simplify Error Handler
**File**: `src/utils/common/errorHandler.js`
**Action**: Remove all wrapper functions, keep only documentation
**Impact**: `sectionPreloader.js` uses `handleAsyncErrorWithFallback`

### 2.7 Fix sectionPreloader.js Error Handling
**File**: `src/utils/section/sectionPreloader.js`
**Line**: 70
**Action**: Replace `handleAsyncErrorWithFallback` with try/catch

---

## 🚀 **PHASE 3: MISSING FEATURES (Enhancement)**

### 3.1 Section Preloading in Router
**File**: `src/router/index.js`
**Action**: Add section preloading after guard checks pass
**Why**: Routes with `preLoadSections` should trigger preloading

### 3.2 Translation Loading in Router
**File**: `src/router/index.js`
**Action**: Add translation loading in `afterEach` hook
**Why**: Sections should load their translations automatically

### 3.3 Role-Based Component Resolution
**File**: `src/router/index.js`
**Function**: `loadRouteComponent`
**Action**: Use `resolveComponentPathForRoute` to handle `customComponentPath`
**Why**: Different roles need different components

### 3.4 Auth Utility Integration in Guards
**File**: `src/utils/route/routeGuards.js`
**Action**: Replace hardcoded checks with `isLoggedIn()`, `hasUserPassedKyc()`, etc.
**Why**: Guards should use real auth state

---

## 📋 **EXECUTION CHECKLIST**

### Phase 1 - Critical (Do First)
- [ ] 1.1 Create manifestLoader.js
- [ ] 1.2 Fix router - auth context
- [ ] 1.3 Fix router - await guards
- [ ] 1.4 Export runAllRouteGuards
- [ ] 1.5 Add session restoration

### Phase 2 - Consistency (Do Second)
- [ ] 2.1 Fix logHandler.js
- [ ] 2.2 Delete globalPerfTracker.js
- [ ] 2.3 Update main.js perfTracker
- [ ] 2.4 Update 16 files - logging
- [ ] 2.5 Update 11 files - perfTracker
- [ ] 2.6 Simplify errorHandler.js
- [ ] 2.7 Fix sectionPreloader.js

### Phase 3 - Features (Do Third)
- [ ] 3.1 Section preloading
- [ ] 3.2 Translation loading
- [ ] 3.3 Role-based components
- [ ] 3.4 Auth utility integration

---

## 🧪 **TESTING CHECKLIST**

After Phase 1:
- [ ] App starts without errors
- [ ] Can navigate between routes
- [ ] Auth guards work (block/allow)
- [ ] Session persists on refresh

After Phase 2:
- [ ] All logs use correct format
- [ ] Performance table outputs correctly
- [ ] No console.log/console.error in code

After Phase 3:
- [ ] Sections preload correctly
- [ ] Translations load per section
- [ ] Role-based components render
- [ ] Auth checks use real utilities

---

## 📊 **PROGRESS TRACKING**

**Total Tasks**: 19  
**Completed**: 0  
**In Progress**: 0  
**Remaining**: 19

**Phase 1**: 0/5 (0%)  
**Phase 2**: 0/7 (0%)  
**Phase 3**: 0/4 (0%)

---

## ⏱️ **ESTIMATED TIME**

**Phase 1**: 30-45 minutes  
**Phase 2**: 1-1.5 hours  
**Phase 3**: 30-45 minutes  
**Testing**: 30 minutes  

**Total**: 3-4 hours

---

## 🎯 **SUCCESS CRITERIA**

✅ App runs without errors  
✅ All guards work correctly  
✅ Logging is consistent  
✅ Performance tracking unified  
✅ Error handling is simple  
✅ Sections preload automatically  
✅ Translations load per section  
✅ Role-based routing works  
✅ Session restoration works  
✅ All tests pass  

---

## 🚨 **KNOWN RISKS**

1. **Breaking Changes**: Changing logging/perfTracker affects many files
2. **Auth Flow**: Must test all auth scenarios (login, logout, refresh)
3. **Type Mismatches**: Guard return types must match router expectations
4. **Async Issues**: Must await all async operations in guards
5. **Manifest Loading**: Production vs development differences

---

## 💡 **RECOMMENDATIONS**

1. **Do Phase 1 First**: Critical for basic functionality
2. **Test After Each Phase**: Don't wait until end
3. **Use Git**: Commit after each phase
4. **Keep Backup**: Save original files before mass refactor
5. **Update TODOs**: Mark complete as you go

---

## 📝 **NOTES FOR DEVELOPER**

- Auth files (src/utils/auth/*) are already correct - don't touch
- Asset files (src/utils/assets/*) are already correct - don't touch
- Tailwind files (build/tailwind/*) are already correct - don't touch
- Build files (build/vite/*) are already correct - don't touch
- Only refactor the OLD files that were created before

---

## 🔄 **REFACTORING PATTERN**

For each file:
1. Add proper imports
2. Replace old logging calls
3. Replace old perfTracker calls
4. Replace error handling if needed
5. Test the file
6. Commit

Repeat for all 27 files.

