/**
 * Global top-bar navigation progress state (NProgress-style trickle).
 * Started in router beforeEach, finished in afterEach / on navigation failure.
 * Does not block navigation or preload I/O.
 */

import { readonly, ref } from 'vue';

const isActive = ref(false);
const progress = ref(0);

let trickleTimer = null;
let finishTimer = null;

const TRICKLE_INTERVAL_MS = 200;
const FINISH_HIDE_DELAY_MS = 300;
const INITIAL_PROGRESS = 0.08;
const MAX_TRICKLE_PROGRESS = 0.9;

function clearProgressTimers() {
  if (trickleTimer) {
    clearInterval(trickleTimer);
    trickleTimer = null;
  }
  if (finishTimer) {
    clearTimeout(finishTimer);
    finishTimer = null;
  }
}

export function startNavigationProgress() {
  clearProgressTimers();
  isActive.value = true;
  progress.value = INITIAL_PROGRESS;

  trickleTimer = setInterval(() => {
    if (progress.value < MAX_TRICKLE_PROGRESS) {
      const increment = (1 - progress.value) * 0.1;
      progress.value = Math.min(MAX_TRICKLE_PROGRESS, progress.value + increment);
    }
  }, TRICKLE_INTERVAL_MS);
}

export function finishNavigationProgress() {
  clearProgressTimers();
  progress.value = 1;

  finishTimer = setTimeout(() => {
    isActive.value = false;
    progress.value = 0;
  }, FINISH_HIDE_DELAY_MS);
}

export function failNavigationProgress() {
  clearProgressTimers();
  isActive.value = false;
  progress.value = 0;
}

export function useNavigationProgress() {
  return {
    isActive: readonly(isActive),
    progress: readonly(progress),
  };
}
