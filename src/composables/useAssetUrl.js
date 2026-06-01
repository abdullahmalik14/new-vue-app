import { ref, onMounted, onBeforeUnmount } from 'vue';
import { getAssetUrl } from '../utils/assets/assetLibrary.js';

/**
 * Reactive asset URL resolver (M-08).
 *
 * @param {string} flag
 * @param {string|null} [sectionName]
 * @returns {{ url: import('vue').Ref<string|null>, loading: import('vue').Ref<boolean>, error: import('vue').Ref<Error|null> }}
 */
export function useAssetUrl(flag, sectionName = null) {
  const url = ref(null);
  const loading = ref(true);
  const error = ref(null);
  let cancelled = false;

  async function resolveUrl() {
    loading.value = true;
    error.value = null;

    if (!flag || typeof flag !== 'string') {
      error.value = new Error('useAssetUrl requires a non-empty flag string');
      loading.value = false;
      return;
    }

    try {
      const resolved = await getAssetUrl(flag, { section: sectionName });
      if (!cancelled) {
        url.value = resolved;
      }
    } catch (err) {
      if (!cancelled) {
        error.value = err instanceof Error ? err : new Error(String(err));
      }
    } finally {
      if (!cancelled) {
        loading.value = false;
      }
    }
  }

  onMounted(() => {
    resolveUrl();
  });

  onBeforeUnmount(() => {
    cancelled = true;
  });

  return { url, loading, error };
}
