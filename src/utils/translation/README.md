# Translation Utilities

## Overview
Section-based translation loading system with lazy loading, locale resolution, and fallback management. Ensures translations are loaded only when needed, with English always available as fallback.

## Files

### translationLoader.js
**Purpose**: Lazy load translation files per section with caching

**How it works**:
1. **Always loads English first** as fallback
2. Then loads user's preferred locale (if different)
3. Merges English (base) with user locale (override)
4. Caches merged translations
5. Prevents duplicate loads
6. Supports batch preloading

**Translation File Structure**:
```
src/i18n/
  section-auth/
    en.json
    vi.json
  section-dashboard-global/
    en.json
    vi.json
  section-dashboard-creator/
    en.json
    vi.json
```

**Key Methods**:
- `loadTranslationsForSection(section, locale)` - Load section translations
- `preloadTranslationsForSections(sections, locale)` - Batch load
- `areTranslationsLoadedForSection(section, locale)` - Check status (**NEEDS LOGGING**)
- `clearTranslationCaches()` - Reset for testing
- `getTranslationStatistics()` - Get load stats

**Loading Flow**:
```javascript
// User navigates to auth section with Vietnamese locale
loadTranslationsForSection('auth', 'vi')

// Step 1: Load English (fallback)
const en = await import('../../i18n/section-auth/en.json')

// Step 2: Load Vietnamese
const vi = await import('../../i18n/section-auth/vi.json')

// Step 3: Merge (vi overrides en)
const merged = { ...en, ...vi }

// Step 4: Cache for 1 hour
cache.set('translation_auth_vi', merged)

// Step 5: Return merged translations
return merged
```

**Testing**:
```javascript
import { loadTranslationsForSection, areTranslationsLoadedForSection } from './translationLoader.js';

// Test English load
const enTranslations = await loadTranslationsForSection('auth', 'en');
console.assert(enTranslations.login !== undefined);

// Test Vietnamese load with fallback
const viTranslations = await loadTranslationsForSection('auth', 'vi');
console.assert(viTranslations.login !== undefined); // Should have Vietnamese
// If key missing in vi, should have English fallback

// Test caching
const cached = await loadTranslationsForSection('auth', 'en');
console.assert(enTranslations === cached); // Same reference = from cache

// Test load status check
console.assert(areTranslationsLoadedForSection('auth', 'en') === true);
console.assert(areTranslationsLoadedForSection('shop', 'en') === false);
```

**Development Rules**:
- **ALWAYS load English first** (non-negotiable)
- Track load start and completion with performance tracker
- **Log before EVERY return** (including status checks)
- Cache for 1 hour
- Handle missing translation files gracefully
- Return empty object on error, never throw
- Log file paths being loaded

---

### localeManager.js
**Purpose**: Locale resolution and management with priority chain

**How it works**:
Priority chain for locale resolution:
1. **URL** - `?locale=vi` or `/vi/dashboard`
2. **Cached User Selection** - Previously selected locale
3. **Browser Language** - `navigator.language`
4. **Default Fallback** - English ('en')

**Key Methods**:
- `resolveActiveLocale()` - Resolve using priority chain
- `setActiveLocale(locale, options)` - Set active locale
- `getActiveLocale()` - Get current locale
- `getSupportedLocales()` - Get all supported locales
- `isLocaleSupported(locale)` - Check if locale is supported
- `switchToLocale(locale)` - Switch and reload translations
- `getLocaleDisplayName(locale)` - Human-readable name

**Locale Resolution Example**:
```javascript
// Scenario: User visits /dashboard?locale=vi

// Step 1: Check URL
const urlLocale = getLocaleFromUrl(); // Returns 'vi'
// ✓ Found in URL, use 'vi'

// Scenario: User visits /dashboard (no param)

// Step 1: Check URL
const urlLocale = getLocaleFromUrl(); // Returns null

// Step 2: Check cache
const cachedLocale = cache.get('user_locale_preference'); // Returns 'vi' (from previous visit)
// ✓ Found in cache, use 'vi'

// Scenario: First-time visitor, no locale specified

// Step 1: Check URL → null
// Step 2: Check cache → null
// Step 3: Check browser
const browserLocale = navigator.language; // Returns 'vi-VN'
const baseLocale = 'vi-VN'.split('-')[0]; // Extract 'vi'
// ✓ Supported locale, use 'vi'

// Scenario: Browser not supported

// Step 1-3: All return null
// Step 4: Default fallback
// ✓ Use 'en'
```

**Testing**:
```javascript
import { resolveActiveLocale, setActiveLocale, getActiveLocale } from './localeManager.js';

// Test resolution
const locale = resolveActiveLocale();
console.assert(['en', 'vi'].includes(locale));

// Test setting
const success = setActiveLocale('vi');
console.assert(success === true);
console.assert(getActiveLocale() === 'vi');

// Test unsupported locale
const failed = setActiveLocale('fr');
console.assert(failed === false);
console.assert(getActiveLocale() === 'vi'); // Should remain unchanged
```

**Development Rules**:
- Track resolution with performance tracker
- **Log before returning resolved locale**
- Update URL when locale changes
- Cache locale selection (90 days TTL)
- Never throw on unsupported locale
- Always have English fallback
- Log resolution source (URL/cache/browser/default)

---

## Integration

### Used By
- `main.js` - Initialize i18n with resolved locale
- Vue components - Access translations via `$t()`
- Router - Switch locale on route change

### Depends On
- Translation JSON files in `src/i18n/section-*/`
- `utils/common/` - Caching, logging, performance tracking

## Development Rules

1. **English First**: ALWAYS load English before other locales
2. **Lazy Loading**: Load translations per section, not all at once
3. **Performance Tracking**: Track every load operation
4. **Logging**: Log before all returns, especially status checks
5. **Caching**: Cache merged translations (1 hour)
6. **Error Handling**: Missing translations return empty object
7. **Fallback**: Always provide English fallback

## Testing Checklist

- [ ] English loads first for all sections
- [ ] Locale resolution follows priority chain
- [ ] Missing translation files handled gracefully
- [ ] Caching prevents duplicate loads
- [ ] Batch preload works in parallel
- [ ] URL updates when locale changes
- [ ] Unsupported locales fallback to English
- [ ] All operations logged and tracked
- [ ] Status checks have logging

## Translation File Format

```json
{
  "login": {
    "title": "Log In",
    "email": "Email Address",
    "password": "Password",
    "submit": "Log In",
    "forgotPassword": "Forgot Password?"
  },
  "dashboard": {
    "welcome": "Welcome back!",
    "overview": "Overview"
  }
}
```

**Rules**:
- Use nested objects for organization
- Keep keys in camelCase
- Provide all keys in English
- Other locales can have partial coverage (English fills gaps)

## Supported Locales

Currently supported:
- `en` - English (default, always loaded first)
- `vi` - Vietnamese (Tiếng Việt)

To add new locale:
1. Create `section-*/[locale].json` files
2. Add locale to `SUPPORTED_LOCALES` array in localeManager.js
3. Add display name to `getLocaleDisplayName()`

## Performance Considerations

**Translation File Sizes**:
- Small sections (misc): ~1-2 KB per locale
- Medium sections (auth): ~3-5 KB per locale  
- Large sections (dashboard): ~10-20 KB per locale

**Loading Strategy**:
- Lazy load per section (not all at startup)
- Cache merged translations
- Preload translations for preLoaded sections
- English always available (loaded first)

**Optimization Tips**:
- Keep translation files small and focused
- Split large sections if translations > 50 KB
- Use short keys to reduce file size
- Compress JSON in production (handled by Vite)

