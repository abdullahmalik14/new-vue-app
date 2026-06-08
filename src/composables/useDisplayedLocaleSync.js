import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  getDisplayedLocale,
  SUPPORTED_LOCALES,
} from '@/systems/i18n/localeManager.js';

/**
 * Keep a locale switcher ref aligned with URL + in-memory active locale.
 * @returns {{ displayedLocale: import('vue').Ref<string>, syncDisplayedLocale: () => void }}
 */
export function useDisplayedLocaleSync() {
  const route = useRoute();
  const displayedLocale = ref(getDisplayedLocale(route.path));

  function syncDisplayedLocale() {
    displayedLocale.value = getDisplayedLocale(route.path);
  }

  function onLocaleChanged(event) {
    const raw = event?.detail?.locale;
    const locale =
      typeof raw === 'string' ? raw.toLowerCase().trim() : '';

    if (locale && SUPPORTED_LOCALES.includes(locale)) {
      displayedLocale.value = locale;
      return;
    }

    syncDisplayedLocale();
  }

  watch(
    () => route.fullPath,
    () => syncDisplayedLocale()
  );

  onMounted(() => {
    syncDisplayedLocale();
    window.addEventListener('app-locale-changed', onLocaleChanged);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('app-locale-changed', onLocaleChanged);
  });

  return { displayedLocale, syncDisplayedLocale };
}
