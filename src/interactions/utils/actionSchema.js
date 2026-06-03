/**
 * Shared action shape helpers for directive and reactive interaction engines.
 */

export function resolveActionType(action) {
  if (!action || typeof action !== 'object') return null;
  const type = action.type ?? action.actionType;
  return typeof type === 'string' && type.trim() ? type.trim() : null;
}
