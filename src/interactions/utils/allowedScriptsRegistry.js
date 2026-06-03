/**
 * Shared allowlist for `script` actions (directive engine + interactionsEngine).
 * Inline `action.code` is never executed.
 */

export const allowedScriptsRegistry = Object.create(null);

export function registerAllowedScript(name, handlerFn) {
  if (!name || typeof handlerFn !== 'function') return false;
  allowedScriptsRegistry[name] = handlerFn;
  return true;
}

export function unregisterAllowedScript(name) {
  if (!name) return;
  delete allowedScriptsRegistry[name];
}

export function runAllowedScriptAction(action, el, scope) {
  if (!action) return;

  if (action.code) {
    console.error('[interactions] script: inline code execution is disabled');
    return;
  }

  if (!action.functionName) return;

  const fn = allowedScriptsRegistry[action.functionName];
  if (typeof fn !== 'function') {
    console.error('[interactions] script: function is not allowlisted', action.functionName);
    return;
  }

  const args = Array.isArray(action.args) ? action.args : [];
  fn(el, scope, ...args);
}
