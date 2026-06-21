<!-- File: src/components/ui/nav/language/LanguageSwitcher.vue -->
<template>
  <form ref="formRef" class="inline-flex items-center gap-2" :aria-label="$t('ui.languageSelector')" @submit.prevent>
    <label :for="selectId" class="sr-only">{{ $t('ui.language') }}</label>
    <select
      :id="selectId"
      ref="selectRef"
      :class="variant === 'invisible' ? 'absolute inset-0 w-full h-full opacity-0 cursor-pointer' : 'border rounded px-2 py-1 text-sm'"
      :disabled="isBusy"
      :value="currentLocale"
      :aria-busy="isBusy"
      @change="onChange"
      aria-live="polite"
    >
      <option v-for="opt in localeOptions" :key="opt.code" :value="opt.code">
        {{ opt.label }} ({{ opt.traditionalName }})
      </option>
    </select>
    <LoadingSpinner v-if="isBusy" size="sm" color="text-blue-600" />
  </form>
</template>

<script setup>
/**
 * LanguageSwitcher.vue
 * - Renders a select with all supported locales (lowercased codes)
 * - Syncs displayed value from URL + active locale (login redirect, router, setActiveLocale)
 * - On change: persists, rewrites URL, reloads section translations
 */

import { ref, computed, watch, useId } from 'vue';
import { useRoute } from 'vue-router';
import LoadingSpinner from '@/components/ui/spinners/LoadingSpinner.vue';
import { useDisplayedLocaleSync } from '@/composables/useDisplayedLocaleSync.js';

import {
  setActiveLocale,
  loadTranslationsForSection,
  preloadTranslationsForSections,
  getLocaleSwitcherOptions,
  extractLocaleSelection,
  SUPPORTED_LOCALES,
} from '@/systems/i18n';

const props = defineProps({
  variant: {
    type: String,
    default: 'default' // 'default' or 'invisible'
  }
});

const emit = defineEmits(['locale-changed', 'locale-change-error']);

const localeOptions = getLocaleSwitcherOptions();
const supportedCodes = new Set(SUPPORTED_LOCALES);

const formRef = ref(null);
const selectRef = ref(null);
const isBusy = ref(false);
const selectId = 'language-switcher-' + useId();
const route = useRoute();

const { displayedLocale: currentLocale, syncDisplayedLocale } = useDisplayedLocaleSync();

watch(currentLocale, (locale) => {
  if (selectRef.value && selectRef.value.value !== locale) {
    selectRef.value.value = supportedCodes.has(locale) ? locale : 'en';
  }
});

const currentSection = computed(() => {
  const metaSection = route?.meta?.section;
  if (typeof metaSection === 'string' && metaSection.length) return metaSection;
  const winSection = typeof window !== 'undefined' ? window.__CURRENT_SECTION__ : null;
  return typeof winSection === 'string' && winSection.length ? winSection : null;
});

const preLoadSections = computed(() => {
  const metaPre = Array.isArray(route?.meta?.preLoadSections) ? route.meta.preLoadSections : null;
  if (metaPre && metaPre.length) return metaPre;
  const winPre = typeof window !== 'undefined' ? window.__PRELOAD_SECTIONS__ : null;
  return Array.isArray(winPre) ? winPre : [];
});

function restoreSelectValue(locale) {
  const code = supportedCodes.has(locale) ? locale : 'en';
  currentLocale.value = code;
  if (selectRef.value && selectRef.value.value !== code) {
    selectRef.value.value = code;
  }
}

async function onChange(ev) {
  const target = ev?.target ?? null;
  if (!target || !('value' in target)) return;
  if (!selectRef.value) return;

  const next = extractLocaleSelection(target.value);
  const prev = currentLocale.value;

  if (!next || next === prev) return;
  if (!supportedCodes.has(next)) {
    console.warn(`[LanguageSwitcher] Unsupported locale "${next}", coercing to "en".`);
  }
  const finalLocale = supportedCodes.has(next) ? next : 'en';

  if (isBusy.value) return;
  isBusy.value = true;
  currentLocale.value = finalLocale;

  try {
    const ok = await setActiveLocale(finalLocale, { updateUrl: true });
    if (!ok) {
      console.warn('[LanguageSwitcher] setActiveLocale returned falsy; aborting.');
      restoreSelectValue(prev);
      emit('locale-change-error', { locale: finalLocale, previousLocale: prev, reason: 'setActiveLocale-falsy' });
      return;
    }

    if (currentSection.value) {
      await loadTranslationsForSection(currentSection.value, finalLocale);
    }

    const warms = preLoadSections.value;
    if (Array.isArray(warms) && warms.length) {
      await preloadTranslationsForSections(warms, finalLocale);
    }

    restoreSelectValue(finalLocale);
    emit('locale-changed', { locale: finalLocale, previousLocale: prev });
  } catch (e) {
    console.warn('[LanguageSwitcher] Error during locale switch:', e);
    restoreSelectValue(prev);
    emit('locale-change-error', {
      locale: finalLocale,
      previousLocale: prev,
      reason: 'exception',
      error: e,
    });
  } finally {
    isBusy.value = false;
  }
}
</script>

<style scoped>
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
