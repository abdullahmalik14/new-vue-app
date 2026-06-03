import { ref } from "vue";

/** Vue ref for call-site loading UI; pass as `options.progressRef` to `FlowHandler.run`. */
export function createFlowProgressRef(initial = false) {
  return ref(initial);
}

/** Immutable progress updates on pipeline context (avoids in-place mutation). */
export function patchPipelineProgress(context, patch) {
  context.progress = { ...context.progress, ...patch };
}
