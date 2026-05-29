<!-- File: src/components/ui/global/nav/language/LanguageSwitcher.vue -->
<template>
  <form ref="formRef" class="inline-flex items-center gap-2" :aria-label="$t('ui.languageSelector')" @submit.prevent>
    <label :for="selectId" class="sr-only">{{ $t('ui.language') }}</label>
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



import { ref, computed, onMounted, useId } from 'vue';
import { useRoute } from 'vue-router';



// Reuse your existing translation utilities (index.js re-exports localeManager + translationLoader)
import {
  getActiveLocale,
  setActiveLocale,
  loadTranslationsForSection,
  preloadTranslationsForSections,
  getLocaleSwitcherOptions,
  SUPPORTED_LOCALES,
} from '@/utils/translation';

const localeOptions = getLocaleSwitcherOptions();
const supportedCodes = new Set(SUPPORTED_LOCALES);

// DOM refs with validation before use
const formRef = ref(null);
const selectRef = ref(null);

// simple busy lock to avoid concurrent loads
const isBusy = ref(false);

// Stable unique id for accessibility (SSR/hydration-safe)
const selectId = 'language-switcher-' + useId();

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
    console.warn(`[LanguageSwitcher] Unsupported locale "${next}", coercing to "en".`);
  }
  const finalLocale = supportedCodes.has(next) ? next : 'en';

  if (isBusy.value) return;
  isBusy.value = true;

  try {
    // 1) Persist + rewrite URL path segment (handled by your util)
    const ok = await setActiveLocale(finalLocale, { updateUrl: true });
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