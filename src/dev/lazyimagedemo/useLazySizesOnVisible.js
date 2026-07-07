import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

/** @type {Set<string>} */
const unveiledUrls = new Set();

/**
 * Load a lazysizes image only when its container enters the viewport.
 * Prevents early expFactor loads and duplicate fetches for the same URL.
 *
 * @param {import('vue').Ref<HTMLElement|null>} containerRef
 * @param {import('vue').Ref<HTMLImageElement|null>} imageRef
 * @param {import('vue').Ref<string|null|undefined>|import('vue').ComputedRef<string|null|undefined>} sourceRef
 */
export function useLazySizesOnVisible(containerRef, imageRef, sourceRef) {
  const isLoaded = ref(false);
  let observer = null;
  let unveiled = false;

  function markLoaded() {
    isLoaded.value = true;
  }

  async function unveilOnce() {
    if (unveiled) {
      return;
    }

    const container = containerRef.value;
    const image = imageRef.value;
    const src = sourceRef?.value;

    if (!container || !image || !src || typeof window === 'undefined') {
      return;
    }

    unveiled = true;
    observer?.disconnect();
    observer = null;

    if (unveiledUrls.has(src)) {
      image.src = src;
      image.classList.add('lazyloaded');
      markLoaded();
      return;
    }

    unveiledUrls.add(src);

    image.addEventListener('lazyloaded', markLoaded, { once: true });
    image.addEventListener('error', markLoaded, { once: true });
    image.setAttribute('data-src', src);
    image.classList.add('lazyload');

    await nextTick();

    window.lazySizes?.loader?.unveil(image);
  }

  function startObserver() {
    observer?.disconnect();
    observer = null;

    const container = containerRef.value;
    const src = sourceRef?.value;

    if (!container || !src || unveiled) {
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          unveilOnce();
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0,
      },
    );

    observer.observe(container);
  }

  onMounted(async () => {
    await nextTick();
    startObserver();

    if (sourceRef) {
      watch(sourceRef, async () => {
        await nextTick();
        startObserver();
      });
    }
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
    observer = null;
  });

  return { isLoaded };
}
