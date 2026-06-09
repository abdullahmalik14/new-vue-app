<template>
  <form
    class="inline-flex items-center gap-2"
    :aria-label="$t('ui.translateThisPage')"
    @submit.prevent="onTranslate"
  >
    <label :for="selectId" class="sr-only">{{ $t('ui.translateThisPage') }}</label>
    <select
      :id="selectId"
      v-model="selectedLocale"
      class="border rounded px-2 py-1 text-sm"
      :disabled="isBusy"
    >
      <option v-for="opt in localeOptions" :key="opt.code" :value="opt.code">
        {{ opt.label }}
      </option>
    </select>
    <button
      type="submit"
      class="rounded border border-gray-300 bg-white px-2 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
      :disabled="isBusy"
    >
      {{ $t('ui.translatePageAction') }}
    </button>
    <LoadingSpinner v-if="isBusy" size="sm" />
  </form>
</template>

<script setup>
import { ref, computed, useId } from 'vue';
import { useRoute } from 'vue-router';
import LoadingSpinner from '@/components/ui/spinners/LoadingSpinner.vue';
import {
  getActiveLocale,
  getLocaleSwitcherOptions,
  translateCurrentPageTemporarily,
  SUPPORTED_LOCALES,
} from '@/systems/i18n';

const localeOptions = getLocaleSwitcherOptions();
const route = useRoute();
const isBusy = ref(false);
const selectId = 'translate-page-' + useId();

const currentSection = computed(() => {
  const metaSection = route?.meta?.section;
  if (typeof metaSection === 'string' && metaSection.length) return metaSection;
  const winSection = typeof window !== 'undefined' ? window.__CURRENT_SECTION__ : null;
  return typeof winSection === 'string' && winSection.length ? winSection : null;
});

const active = getActiveLocale();
const defaultPick = localeOptions.find((o) => o.code !== active)?.code || 'vi';
const selectedLocale = ref(
  SUPPORTED_LOCALES.includes(defaultPick) ? defaultPick : 'vi'
);

async function onTranslate() {
  if (isBusy.value) return;
  const locale = String(selectedLocale.value || '').toLowerCase();
  if (!SUPPORTED_LOCALES.includes(locale)) return;

  isBusy.value = true;
  try {
    await translateCurrentPageTemporarily(locale, {
      sectionName: currentSection.value || undefined,
      routePath: route.path,
    });
    window.dispatchEvent(
      new CustomEvent('app-temp-locale-changed', { detail: { locale } })
    );
  } catch (e) {
    console.warn('[TranslatePageControl] Temporary translation failed:', e);
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
