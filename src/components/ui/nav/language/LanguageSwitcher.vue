<!-- File: src/components/ui/global/nav/language/LanguageSwitcher.vue -->
<template>
  <form ref="formRef" class="inline-flex items-center gap-2" aria-label="Language selector" @submit.prevent>
    <label :for="selectId" class="sr-only">Language</label>
    <select :id="selectId" ref="selectRef" class="border rounded px-2 py-1 text-sm" :disabled="isBusy"
      :value="currentLocale" @change="onChange" aria-live="polite">
      <option v-for="opt in localeOptions" :key="opt.code" :value="opt.code">
        {{ opt.label }} ({{ opt.traditionalName }})
      </option>
    </select>
  </form>
</template>



<script setup>
/**
* LanguageSwitcher.vue
* - Renders a select with all supported locales (lowercased codes)
* - Reads active locale on mount and reflects it in the UI
* - On change: normalizes+validates, persists, rewrites URL (path), reloads current section translations
* - Optionally preloads translations for any configured preLoadSections
* - No external new utils — relies on existing translation index exports
*/



import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';



// Reuse your existing translation utilities (index.js re-exports localeManager + translationLoader)
import {
  getActiveLocale,
  setActiveLocale,
  loadTranslationsForSection,
  preloadTranslationsForSections,
} from '@/utils/translation';



// --- Locales list (ALL lowercase codes) ---
const localeOptions = [
  { label: 'Afrikaans', code: 'af', traditionalName: 'Afrikaans' },
  { label: 'Albanian', code: 'sq', traditionalName: 'Shqip' },
  { label: 'Amharic', code: 'am', traditionalName: 'አማርኛ' },
  { label: 'Arabic', code: 'ar', traditionalName: 'العربية' },
  { label: 'Armenian', code: 'hy', traditionalName: 'Հայերեն' },
  { label: 'Azerbaijani', code: 'az', traditionalName: 'Azərbaycanca' },
  { label: 'Bengali', code: 'bn', traditionalName: 'বাংলা' },
  { label: 'Bosnian', code: 'bs', traditionalName: 'Bosanski' },
  { label: 'Bulgarian', code: 'bg', traditionalName: 'Български' },
  { label: 'Catalan', code: 'ca', traditionalName: 'Català' },
  { label: 'Chinese (Simplified)', code: 'zh', traditionalName: '中文 (简体)' },
  { label: 'Chinese (Traditional)', code: 'zh-tw', traditionalName: '中文 (繁體)' },
  { label: 'Croatian', code: 'hr', traditionalName: 'Hrvatski' },
  { label: 'Czech', code: 'cs', traditionalName: 'Čeština' },
  { label: 'Danish', code: 'da', traditionalName: 'Dansk' },
  { label: 'Dari', code: 'fa-af', traditionalName: 'دری' },
  { label: 'Dutch', code: 'nl', traditionalName: 'Nederlands' },
  { label: 'English', code: 'en', traditionalName: 'English' },
  { label: 'Estonian', code: 'et', traditionalName: 'Eesti' },
  { label: 'Farsi (Persian)', code: 'fa', traditionalName: 'فارسی' },
  { label: 'Filipino, Tagalog', code: 'tl', traditionalName: 'Tagalog' },
  { label: 'Finnish', code: 'fi', traditionalName: 'Suomi' },
  { label: 'French', code: 'fr', traditionalName: 'Français' },
  { label: 'French (Canada)', code: 'fr-ca', traditionalName: 'Français (Canada)' },
  { label: 'Georgian', code: 'ka', traditionalName: 'ქართული' },
  { label: 'German', code: 'de', traditionalName: 'Deutsch' },
  { label: 'Greek', code: 'el', traditionalName: 'Ελληνικά' },
  { label: 'Gujarati', code: 'gu', traditionalName: 'ગુજરાતી' },
  { label: 'Haitian Creole', code: 'ht', traditionalName: 'Kreyòl ayisyen' },
  { label: 'Hausa', code: 'ha', traditionalName: 'Hausa' },
  { label: 'Hebrew', code: 'he', traditionalName: 'עברית' },
  { label: 'Hindi', code: 'hi', traditionalName: 'हिन्दी' },
  { label: 'Hungarian', code: 'hu', traditionalName: 'Magyar' },
  { label: 'Icelandic', code: 'is', traditionalName: 'Íslenska' },
  { label: 'Indonesian', code: 'id', traditionalName: 'Bahasa Indonesia' },
  { label: 'Irish', code: 'ga', traditionalName: 'Gaeilge' },
  { label: 'Italian', code: 'it', traditionalName: 'Italiano' },
  { label: 'Japanese', code: 'ja', traditionalName: '日本語' },
  { label: 'Kannada', code: 'kn', traditionalName: 'ಕನ್ನಡ' },
  { label: 'Kazakh', code: 'kk', traditionalName: 'Қазақша' },
  { label: 'Korean', code: 'ko', traditionalName: '한국어' },
  { label: 'Latvian', code: 'lv', traditionalName: 'Latviešu' },
  { label: 'Lithuanian', code: 'lt', traditionalName: 'Lietuvių' },
  { label: 'Macedonian', code: 'mk', traditionalName: 'Македонски' },
  { label: 'Malay', code: 'ms', traditionalName: 'Bahasa Melayu' },
  { label: 'Malayalam', code: 'ml', traditionalName: 'മലയാളം' },
  { label: 'Maltese', code: 'mt', traditionalName: 'Malti' },
  { label: 'Marathi', code: 'mr', traditionalName: 'मराठी' },
  { label: 'Mongolian', code: 'mn', traditionalName: 'Монгол' },
  { label: 'Norwegian (Bokmål)', code: 'no', traditionalName: 'Norsk (bokmål)' },
  { label: 'Pashto', code: 'ps', traditionalName: 'پښتو' },
  { label: 'Polish', code: 'pl', traditionalName: 'Polski' },
  { label: 'Portuguese (Brazil)', code: 'pt', traditionalName: 'Português (Brasil)' },
  { label: 'Portuguese (Portugal)', code: 'pt-pt', traditionalName: 'Português (Portugal)' },
  { label: 'Punjabi', code: 'pa', traditionalName: 'ਪੰਜਾਬੀ' },
  { label: 'Romanian', code: 'ro', traditionalName: 'Română' },
  { label: 'Russian', code: 'ru', traditionalName: 'Русский' },
  { label: 'Serbian', code: 'sr', traditionalName: 'Српски' },
  { label: 'Sinhala', code: 'si', traditionalName: 'සිංහල' },
  { label: 'Slovak', code: 'sk', traditionalName: 'Slovenčina' },
  { label: 'Slovenian', code: 'sl', traditionalName: 'Slovenščina' },
  { label: 'Somali', code: 'so', traditionalName: 'Soomaali' },
  { label: 'Spanish', code: 'es', traditionalName: 'Español' },
  { label: 'Spanish (Mexico)', code: 'es-mx', traditionalName: 'Español (México)' },
  { label: 'Swahili', code: 'sw', traditionalName: 'Kiswahili' },
  { label: 'Swedish', code: 'sv', traditionalName: 'Svenska' },
  { label: 'Tamil', code: 'ta', traditionalName: 'தமிழ்' },
  { label: 'Telugu', code: 'te', traditionalName: 'Telugu' },
  { label: 'Thai', code: 'th', traditionalName: 'ไทย' },
  { label: 'Turkish', code: 'tr', traditionalName: 'Türkçe' },
  { label: 'Ukrainian', code: 'uk', traditionalName: 'Українська' },
  { label: 'Urdu', code: 'ur', traditionalName: 'اردو' },
  { label: 'Uzbek', code: 'uz', traditionalName: 'Oʻzbekcha' },
  { label: 'Vietnamese', code: 'vi', traditionalName: 'Tiếng Việt' },
  { label: 'Welsh', code: 'cy', traditionalName: 'Cymraeg' },
];

const supportedCodes = new Set(localeOptions.map(o => o.code));

// DOM refs with validation before use
const formRef = ref(null);
const selectRef = ref(null);

// simple busy lock to avoid concurrent loads
const isBusy = ref(false);

// unique id for accessibility
const selectId = 'language-switcher-' + Math.random().toString(36).slice(2, 9);

// route access for current section and preload list
const route = useRoute();

const currentSection = computed(() => {
  // Prefer router meta, fallback to window globals if provided
  const metaSection = route?.meta?.section;
  if (typeof metaSection === 'string' && metaSection.length) return metaSection;
  // Optional globals (if you expose them elsewhere)
  const winSection = (typeof window !== 'undefined') ? window.__CURRENT_SECTION__ : null;
  return (typeof winSection === 'string' && winSection.length) ? winSection : null;
});

const preLoadSections = computed(() => {
  const metaPre = Array.isArray(route?.meta?.preLoadSections) ? route.meta.preLoadSections : null;
  if (metaPre && metaPre.length) return metaPre;
  const winPre = (typeof window !== 'undefined') ? window.__PRELOAD_SECTIONS__ : null;
  return Array.isArray(winPre) ? winPre : [];
});

function readActiveLocale() {
  try {
    const loc = getActiveLocale();
    return (typeof loc === 'string' && loc.length) ? loc.toLowerCase() : 'en';
  } catch {
    return 'en';
  }
}

const currentLocale = ref(readActiveLocale());

function normalizeLocale(input) {
  return (typeof input === 'string' ? input.toLowerCase().trim() : '');
}

async function onChange(ev) {
  const target = ev?.target ?? null;
  if (!target || !('value' in target)) return;
  if (!selectRef.value) return; // validate presence

  const nextRaw = target.value;
  const next = normalizeLocale(nextRaw);
  const prev = currentLocale.value;

  if (!next || next === prev) return;
  if (!supportedCodes.has(next)) {
    // Unsupported -> optional behavior: coerce to 'en'
    // You may also choose to show a toast and early return instead.
    console.warn('[LanguageSwitcher] Unsupported locale "${next}", coercing to "en".');
  }
  const finalLocale = supportedCodes.has(next) ? next : 'en';

  if (isBusy.value) return;
  isBusy.value = true;

  try {
    // 1) Persist + rewrite URL path segment (handled by your util)
    const ok = setActiveLocale(finalLocale, { updateUrl: true });
    if (!ok) {
      console.warn('[LanguageSwitcher] setActiveLocale returned falsy; aborting.');
      return;
    }

    // 2) Reload current section translations (instant re-render for t())
    if (currentSection.value) {
      await loadTranslationsForSection(currentSection.value, finalLocale);
    }

    // 3) Warm background sections (if any)
    const warms = preLoadSections.value;
    if (Array.isArray(warms) && warms.length) {
      await preloadTranslationsForSections(warms, finalLocale);
    }
    if (currentLocale.value !== finalLocale) {
      currentLocale.value = finalLocale;
    }
    if (selectRef.value?.value !== finalLocale) {
      selectRef.value.value = finalLocale;
    }
  } catch (e) {
    console.warn('[LanguageSwitcher] Error during locale switch:', e);
  } finally {
    isBusy.value = false;
  }
}



onMounted(() => {
  currentLocale.value = readActiveLocale();
  // Initialize the select with the active locale, defensively
  if (!selectRef.value) {
    console.warn('[LanguageSwitcher] selectRef not ready; skipping initial value set.');
    return;
  }
  const active = currentLocale.value;
  const exists = supportedCodes.has(active) ? active : 'en';
  // Only set if different (prevents redundant input events)
  if (selectRef.value.value !== exists) {
    selectRef.value.value = exists;
  }
});
</script>



<style scoped>
/* Minimal styling; inherit app theme */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>