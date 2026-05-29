<template>
  <div
    v-if="visible"
    class="fixed top-12 left-1/2 z-[100] flex max-w-lg -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 shadow-sm"
    role="status"
    aria-live="polite"
  >
    <span>{{ bannerText }}</span>
    <button
      type="button"
      class="rounded border border-amber-400 bg-white px-2 py-0.5 text-xs font-medium hover:bg-amber-100"
      :disabled="isBusy"
      @click="onRestore"
    >
      {{ restoreLabel }}
    </button>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import {
  isTemporaryPageLocaleActive,
  getTemporaryPageLocaleBase,
  clearTemporaryPageLocaleAndRestore,
  getLocaleDisplayName,
} from '@/utils/translation';

const visible = ref(isTemporaryPageLocaleActive());
const isBusy = ref(false);

function refreshVisibility() {
  visible.value = isTemporaryPageLocaleActive();
}

const baseLocale = computed(() => getTemporaryPageLocaleBase() || 'en');

const bannerText = computed(() => {
  const name = getLocaleDisplayName(baseLocale.value) || baseLocale.value;
  return `You are viewing a translated version. Switch back to ${name}.`;
});

const restoreLabel = computed(() => {
  const name = getLocaleDisplayName(baseLocale.value) || baseLocale.value;
  return `Switch back to ${name}`;
});

async function onRestore() {
  if (isBusy.value) return;
  isBusy.value = true;
  try {
    await clearTemporaryPageLocaleAndRestore();
    refreshVisibility();
    window.dispatchEvent(new CustomEvent('app-temp-locale-cleared'));
  } finally {
    isBusy.value = false;
  }
}

function onTempLocaleChanged() {
  refreshVisibility();
}

onMounted(() => {
  window.addEventListener('app-temp-locale-changed', onTempLocaleChanged);
  window.addEventListener('app-temp-locale-cleared', onTempLocaleChanged);
});

onBeforeUnmount(() => {
  window.removeEventListener('app-temp-locale-changed', onTempLocaleChanged);
  window.removeEventListener('app-temp-locale-cleared', onTempLocaleChanged);
});
</script>
