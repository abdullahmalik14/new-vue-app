# Translation System Rules for AI Agents

> **Purpose**: This document defines the core principles and rules that AI agents MUST follow when modifying the translation system. Violations of these rules will break the expected behavior.

---

## Core Principles

### 1. **File Validation MUST Use Content-Type Checks**

**Rule**: When validating translation file existence via HEAD requests, check BOTH `response.ok` AND `Content-Type: application/json`.

**Why**: SPA servers return `200 OK` with HTML (index.html) for missing files instead of proper 404 errors.

```javascript
// ✅ CORRECT
const contentType = response.headers.get('content-type') || '';
const isJson = contentType.includes('application/json');
const exists = response.ok && isJson;

// ❌ WRONG - will treat HTML responses as valid JSON
const exists = response.ok;
```

---

### 2. **Cache Checks MUST Come First**

**Rule**: Check cache and in-progress loads BEFORE any network requests (HEAD or GET).

**Why**: Prevents unnecessary HEAD requests when translations are already available.

**Correct Order**:
1. Check cache → Return if found
2. Check if already loading → Wait if in progress
3. Mark as loading immediately
4. Validate files (HEAD requests)
5. Load files (GET requests)

```javascript
// ✅ CORRECT FLOW
const cachedTranslations = getValueFromCache(cacheKey);
if (cachedTranslations) return cachedTranslations; // No network requests!

if (translationsLoadingInProgress.has(loadingKey)) {
  return await waitForTranslationLoad(loadingKey); // No duplicate requests!
}

translationsLoadingInProgress.add(loadingKey); // Mark BEFORE async operations
const exists = await validateTranslationFileExists(...); // Now validate
```

---

### 3. **Mark as Loading IMMEDIATELY to Prevent Race Conditions**

**Rule**: Add to `translationsLoadingInProgress` set IMMEDIATELY after checking if already loading, BEFORE any async operations.

**Why**: During language switching, multiple components trigger concurrent calls. Without immediate locking, they all start validation/loading simultaneously.

```javascript
// ✅ CORRECT - prevents race conditions
if (translationsLoadingInProgress.has(loadingKey)) {
  return await waitForTranslationLoad(loadingKey);
}
translationsLoadingInProgress.add(loadingKey); // ← BEFORE any await!
const exists = await validateTranslationFileExists(...);

// ❌ WRONG - race condition window
const exists = await validateTranslationFileExists(...); // Multiple callers start this
translationsLoadingInProgress.add(loadingKey); // Too late!
```

---

### 4. **Missing Files MUST Fall Back to English Silently**

**Rule**: When a locale file is missing (validated as non-existent), the system MUST:
- Load ONLY the English file
- Return English translations
- Continue working normally
- NOT throw errors or show error UI
- NOT attempt to fetch the missing file (validation prevents the fetch)

```javascript
// ✅ CORRECT
if (!localeExists) {
  // Load English only - UI stays functional
  const englishTranslations = await loadTranslationFile(sectionName, 'en');
  translations = englishTranslations;
}

// ❌ WRONG - attempting to load missing file
if (!localeExists) {
  try {
    await loadTranslationFile(sectionName, targetLocale); // Will fail!
  } catch (error) {
    // Error handling after the fact
  }
}
```

---

### 5. **Always Load English First as Fallback Base**

**Rule**: For non-English locales, ALWAYS load `en.json` first, then merge the locale file on top.

**Why**: Ensures missing translation keys always have English fallback values.

```javascript
// ✅ CORRECT - English base + locale override
const englishTranslations = await loadTranslationFile(sectionName, 'en');
const localeTranslations = await loadTranslationFile(sectionName, targetLocale);
translations = { ...englishTranslations, ...localeTranslations };

// ❌ WRONG - no fallback if locale file is incomplete
translations = await loadTranslationFile(sectionName, targetLocale);
```

---

### 6. **Clean Up Loading State on Early Returns**

**Rule**: If returning early due to errors AFTER marking as loading, MUST remove from `translationsLoadingInProgress` set.

**Why**: Prevents deadlocks where other callers wait forever for a failed load.

```javascript
// ✅ CORRECT
translationsLoadingInProgress.add(loadingKey);
if (!englishExists) {
  translationsLoadingInProgress.delete(loadingKey); // ← Clean up!
  return {};
}

// ❌ WRONG - leaves loading flag set forever
translationsLoadingInProgress.add(loadingKey);
if (!englishExists) {
  return {}; // Other callers will wait forever!
}
```

---

### 7. **Network Requests: Expected Behavior**

**What you SHOULD see in Network tab:**

**First load of a section (e.g., login page with vi locale):**
- 1 HEAD request to `en.json` (validate)
- 1 GET request to `en.json` (load)
- 1 HEAD request to `vi.json` (validate)
- 1 GET request to `vi.json` (load)

**Subsequent navigation to same section (within 1-hour cache):**
- 0 requests (served from cache)

**Missing file (e.g., renamed vi.json):**
- 1 HEAD request to `en.json` (validate)
- 1 HEAD request to `vi.json` (validate - detects missing via Content-Type)
- 1 GET request to `en.json` (load - only English)
- 0 GET requests to `vi.json` (validation prevented the fetch)

**Language switching:**
- HEAD + GET for each new locale per section
- NO duplicate requests (race condition protection)

---

## Common Pitfalls to Avoid

### ❌ DON'T: Check file existence without Content-Type validation
- Results in HTML being parsed as JSON → error

### ❌ DON'T: Validate files before checking cache
- Results in unnecessary HEAD requests for cached translations

### ❌ DON'T: Mark as loading after async validation starts
- Results in race conditions and duplicate requests

### ❌ DON'T: Fetch missing files after validation fails
- Results in 200 OK HTML responses being parsed as JSON

### ❌ DON'T: Skip English fallback loading
- Results in missing translation keys when locale is incomplete

### ❌ DON'T: Leave loading flags set after errors
- Results in deadlocks where callers wait forever

---

## Testing Checklist

Before committing changes to translation system:

- [ ] Clear browser cache and test fresh load
- [ ] Navigate between sections - verify cache works (no repeat requests)
- [ ] Rename a locale file - verify graceful English fallback
- [ ] Switch languages - verify NO duplicate HEAD/GET requests
- [ ] Check Network tab matches "Expected Behavior" patterns above
- [ ] Verify console shows clear logs, no errors
- [ ] Test with missing English file - should fail gracefully

---

## Reference Documents

For complete system design and testing procedures, see:
- `Translation Management-20251111115156.md` - Full system specification
- `src/utils/translation/README.md` - API documentation
