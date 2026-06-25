import { ref, onMounted, onBeforeUnmount } from 'vue';

/**
 * useLazySectionLoader
 *
 * Reports when a target element scrolls near the viewport, so a section can be
 * loaded/rendered lazily (e.g. only load the footer once the user approaches it).
 *
 * Built on the native IntersectionObserver. Use `rootMargin` to start loading
 * BEFORE the element is actually on screen (e.g. '200px 0px' triggers ~200px
 * early). When IntersectionObserver is unavailable (very old browsers / SSR),
 * it falls back to "visible immediately" so content is never hidden.
 *
 * @param {object} [options]
 * @param {string} [options.rootMargin='200px 0px'] - Margin around the root; positive values pre-load earlier.
 * @param {number|number[]} [options.threshold=0] - Visibility ratio(s) that trigger the callback.
 * @param {boolean} [options.once=true] - Stop observing after the first time it becomes visible.
 * @param {Element|null} [options.root=null] - Scroll container to observe within (null = viewport).
 * @returns {{
 *   sentinelRef: import('vue').Ref<Element|null>,
 *   isVisible: import('vue').Ref<boolean>,
 *   stopObserving: () => void
 * }}
 */
export function useLazySectionLoader(options = {}) {
  const {
    rootMargin = '200px 0px',
    threshold = 0,
    once = true,
    root = null,
  } = options;

  const sentinelRef = ref(null);
  const isVisible = ref(false);
  let observer = null;

  const supportsObserver =
    typeof window !== 'undefined' && 'IntersectionObserver' in window;

  function stopObserving() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  onMounted(() => {
    if (!supportsObserver) {
      isVisible.value = true;
      return;
    }

    if (!sentinelRef.value) {
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            isVisible.value = true;
            if (once) {
              stopObserving();
            }
          } else if (!once) {
            isVisible.value = false;
          }
        }
      },
      { root, rootMargin, threshold },
    );

    observer.observe(sentinelRef.value);
  });

  onBeforeUnmount(stopObserving);

  return { sentinelRef, isVisible, stopObserving };
}
