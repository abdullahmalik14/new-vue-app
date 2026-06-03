export const FLOW_LIFECYCLE_EVENTS = ["start", "success", "error", "retry", "cancelled"];

const listeners = new Map(
  FLOW_LIFECYCLE_EVENTS.map((event) => [event, new Set()]),
);

function getListenerSet(event) {
  if (!FLOW_LIFECYCLE_EVENTS.includes(event)) {
    throw new Error(`Unknown flow lifecycle event '${event}'.`);
  }
  return listeners.get(event);
}

export function onFlowLifecycle(event, handler) {
  if (typeof handler !== "function") return () => {};
  getListenerSet(event).add(handler);
  return () => offFlowLifecycle(event, handler);
}

export function offFlowLifecycle(event, handler) {
  getListenerSet(event).delete(handler);
}

export function emitFlowLifecycle(event, detail = {}) {
  getListenerSet(event).forEach((handler) => {
    try {
      handler(detail);
    } catch {
      // Lifecycle observers must not break flow execution.
    }
  });
}

export function resetFlowLifecycleListeners() {
  FLOW_LIFECYCLE_EVENTS.forEach((event) => listeners.get(event).clear());
}
