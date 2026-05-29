<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label
      :for="selectName"
      class="text-sm font-medium text-[#667085] dark:text-[#9e9589]"
    >
      {{ $t('ui.language') }}
    </label>

    <div class="relative w-full">
      <UnifiedSelect
        :model-value="selectedLocale"
        :options="selectOptions"
        variant="dashboard"
        :name="selectName"
        :disabled="isBusy"
        @update:model-value="onSelectUpdate"
      />
      <div
        v-if="isBusy"
        class="pointer-events-none absolute inset-y-0 right-10 flex items-center"
        aria-hidden="true"
      >
        <Spinner size="sm" color="text-[#004eeb] dark:text-[#3f9dff]" />
      </div>
    </div>

    <p class="text-sm text-[#667085] dark:text-[#9e9589]">
      {{ $t('ui.languageSettingsDescription') }}
    </p>

    <button
      type="button"
      class="self-start text-sm font-medium text-[#004eeb] hover:underline disabled:opacity-50 dark:text-[#3f9dff]"
      :disabled="isBusy || isResetting"
      @click="onReset"
    >
      {{ $t('ui.resetLanguageToBrowser') }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import UnifiedSelect from '@/components/ui/popup/dropdown/dashboard/customThemeSelect/UnifiedSelect.vue';
import Spinner from '@/components/ui/spinner/Spinner.vue';
import { useDisplayedLocaleSync } from '@/composables/useDisplayedLocaleSync.js';
import {
  setActiveLocale,
  loadTranslationsForSection,
  preloadTranslationsForSections,
  getLocaleSwitcherOptions,
  resetLocaleToDefault,
  extractLocaleSelection,
  SUPPORTED_LOCALES,
} from '@/utils/translation';

const emit = defineEmits(['locale-changed', 'locale-change-error']);

const selectName = 'settings-preferred-locale';
const route = useRoute();
const isBusy = ref(false);
const isResetting = ref(false);
const supportedCodes = new Set(SUPPORTED_LOCALES);

const { displayedLocale: selectedLocale, syncDisplayedLocale } = useDisplayedLocaleSync();

const selectOptions = computed(() =>
  getLocaleSwitcherOptions().map((opt) => ({
    label: `${opt.label} (${opt.traditionalName})`,
    value: opt.code,
  }))
);

const currentSection = computed(() => {
  const metaSection = route?.meta?.section;
  if (typeof metaSection === 'string' && metaSection.length) return metaSection;
  const winSection = typeof window !== 'undefined' ? window.__CURRENT_SECTION__ : null;
  return typeof winSection === 'string' && winSection.length ? winSection : null;
});

const preLoadSections = computed(() => {
  const metaPre = Array.isArray(route?.meta?.preLoadSections) ? route.meta.preLoadSections : null;
  if (metaPre?.length) return metaPre;
  const winPre = typeof window !== 'undefined' ? window.__PRELOAD_SECTIONS__ : null;
  return Array.isArray(winPre) ? winPre : [];
});

async function applyLocaleChange(finalLocale, prev) {
  const ok = await setActiveLocale(finalLocale, { updateUrl: true });
  if (!ok) {
    selectedLocale.value = prev;
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

  selectedLocale.value = finalLocale;
  emit('locale-changed', { locale: finalLocale, previousLocale: prev });
}

async function onSelectUpdate(raw) {
  const next = extractLocaleSelection(raw);
  const prev = selectedLocale.value;

  if (!next || next === prev || isBusy.value) {
    if (next && next !== prev) {
      selectedLocale.value = next;
    }
    return;
  }

  const finalLocale = supportedCodes.has(next) ? next : 'en';
  selectedLocale.value = finalLocale;
  isBusy.value = true;

  try {
    await applyLocaleChange(finalLocale, prev);
  } catch (e) {
    selectedLocale.value = prev;
    emit('locale-change-error', { locale: finalLocale, previousLocale: prev, reason: 'exception', error: e });
  } finally {
    isBusy.value = false;
  }
}

async function onReset() {
  if (isResetting.value || isBusy.value) return;
  const prev = selectedLocale.value;
  isResetting.value = true;
  isBusy.value = true;

  try {
    await resetLocaleToDefault();
    syncDisplayedLocale();
    emit('locale-changed', { locale: selectedLocale.value, previousLocale: prev, reset: true });
  } catch (e) {
    selectedLocale.value = prev;
    emit('locale-change-error', { locale: prev, reason: 'reset-failed', error: e });
  } finally {
    isBusy.value = false;
    isResetting.value = false;
  }
}
</script>
